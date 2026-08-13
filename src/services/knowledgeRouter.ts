/**
 * Knowledge Router Service
 *
 * 3-Tier 지식 라우팅 시스템
 * - TIER 1: LOCAL_RULEBOOK (평택시 조례 + 환경부 지침)
 * - TIER 2: NATIONAL_OFFICIAL (환경부 공식 자료)
 * - TIER 3: WEB_GENERAL (웹 검색 참고)
 *
 * 우선순위: TIER 1 > TIER 2 > TIER 3
 */

import { routeQuery, type RouterResult } from "../data/answerRouter";
import { RULEBOOK_DATA, findRuleById } from "../data/rulebookData";
import {
  type KnowledgeTier,
  type KnowledgeSourceType,
  type KnowledgeRoutingResult,
  type KnowledgeSource,
  type EnhancedChatResponse,
  type WebSearchResult,
  type LocalRulebookSource,
  type NationalOfficialSource,
  PYEONGTAEK_CONTACTS,
  OFFICIAL_APPS,
  WEB_SEARCH_DISCLAIMER,
  createDefaultSuggestions,
  generateSourceAttribution,
  webResultToSource
} from "../data/knowledgeSchema";
import {
  searchWasteDisposal,
  isSearchEnabled,
  formatSearchResultsForPrompt,
  analyzeSearchContext
} from "./webSearchService";

// ==================== Configuration ====================

const ROUTING_CONFIG = {
  // TIER 1 신뢰도 임계값 (이 이상이면 TIER 1만 사용)
  tier1_confidence_threshold: 0.7,

  // TIER 2로 넘어가는 임계값
  tier2_confidence_threshold: 0.4,

  // 웹 검색 활성화 여부
  enable_web_search: true,

  // 명확화 질문 최대 개수
  max_clarifying_questions: 2,

  // 웹 검색 결과 최대 개수
  max_web_results: 3
};

// ==================== Query Analysis ====================

/**
 * 쿼리에서 웹 검색이 명시적으로 필요한지 확인
 */
function needsExplicitWebSearch(query: string): boolean {
  const webSearchTriggers = [
    // 타 지자체 비교
    "다른 지역", "타 지역", "서울", "인천", "부산", "대구", "광주", "대전", "세종",

    // 전국 기준 문의
    "환경부 기준", "전국 기준", "일반적으로", "국가 기준", "법적으로",

    // 최신 정보 요청
    "최근", "바뀌었", "변경", "새로운", "업데이트", "2024", "2025", "2026",

    // 명시적 검색 요청
    "인터넷", "검색", "찾아", "구글", "네이버",

    // 웹 검색 유도 키워드 (사용자가 쉽게 테스트 가능)
    "웹에서", "웹 검색", "온라인", "알아봐", "조사해",

    // 일반적/비교 질문
    "어디서든", "보통", "일반적", "통상", "원래",

    // 특수 품목 (룰북에 없을 가능성 높은 것들)
    "전기차 배터리", "태양광 패널", "드론", "전자담배", "가상현실", "VR"
  ];

  const lowerQuery = query.toLowerCase();
  return webSearchTriggers.some(trigger => lowerQuery.includes(trigger));
}

/**
 * 쿼리에서 비교형 질문인지 확인
 */
function isComparisonQuery(query: string): boolean {
  const comparisonTriggers = [
    "차이", "다른 점", "구분", "구별",
    "vs", "비교", "뭐가 달라"
  ];

  const lowerQuery = query.toLowerCase();
  return comparisonTriggers.some(trigger => lowerQuery.includes(trigger));
}

/**
 * 쿼리 신뢰도 점수 계산
 * - 다양한 요소를 반영하여 현실적인 신뢰도 제공
 */
function calculateConfidence(routerResult: RouterResult, query: string): number {
  let confidence = 0;

  // 규칙이 매칭되면 기본 점수
  if (routerResult.matchedRule) {
    const rule = routerResult.matchedRule;

    // 기본 점수: 0.6 (60%)
    confidence = 0.6;

    // 카테고리가 명확하면 +0.1
    if (routerResult.disposalCategory !== null) {
      confidence += 0.1;
    }

    // 명확화 질문이 필요하면 -0.15
    if (routerResult.needsClarification) {
      confidence -= 0.15;
    }

    // 품목명이 쿼리에 정확히 매칭되면 +0.15
    const queryLower = query.toLowerCase();
    if (queryLower.includes(rule.item_name.toLowerCase())) {
      confidence += 0.15;
    }

    // alias 매칭이면 +0.1
    const hasAliasMatch = rule.item_aliases?.some(
      alias => queryLower.includes(alias.toLowerCase())
    );
    if (hasAliasMatch) {
      confidence += 0.1;
    }

    // 출처가 PT_ORD (평택시 조례)면 +0.05
    const hasPyeongtaekSource = rule.source_refs?.some(
      ref => ref.source_id === "PT_ORD" || ref.source_id === "PT_RULE"
    );
    if (hasPyeongtaekSource) {
      confidence += 0.05;
    }

  } else if (routerResult.fallbackMessage !== null) {
    // 폴백 사용 시 낮은 점수
    confidence = 0.25;
  }

  // 최종 신뢰도: 0.0 ~ 1.0 범위로 제한
  return Math.max(0, Math.min(1, confidence));
}

// ==================== TIER 1: Local Rulebook ====================

/**
 * TIER 1: 로컬 룰북에서 답변 찾기
 */
function searchLocalRulebook(query: string): {
  result: RouterResult;
  confidence: number;
  sources: LocalRulebookSource[];
} {
  const result = routeQuery(query);
  const confidence = calculateConfidence(result, query);
  const sources: LocalRulebookSource[] = [];

  if (result.matchedRule) {
    // 매칭된 규칙에서 출처 정보 추출
    result.matchedRule.source_refs.forEach(ref => {
      sources.push({
        source_type: "LOCAL_RULEBOOK",
        source_id: ref.source_id as LocalRulebookSource["source_id"],
        pinpoint: ref.pinpoint,
        effective_date: ref.effective_date
      });
    });
  }

  return { result, confidence, sources };
}

// ==================== TIER 2: National Official ====================

/**
 * TIER 2: 환경부 공식 자료 확인
 * (현재는 룰북 내 환경부 지침 기반으로 구현, 향후 API 연동 가능)
 */
function searchNationalOfficial(query: string): {
  found: boolean;
  content: string;
  sources: NationalOfficialSource[];
} {
  // 현재는 룰북 데이터 중 SEP_2026, WCA 출처를 환경부 자료로 취급
  const context = analyzeSearchContext(query);

  // 환경부 지침에서 관련 내용 검색
  const relevantRules = RULEBOOK_DATA.rules.filter(rule => {
    const hasNationalSource = rule.source_refs.some(
      ref => ref.source_id === "SEP_2026" || ref.source_id === "WCA"
    );

    if (!hasNationalSource) return false;

    // 키워드 매칭
    const ruleText = [
      rule.item_name,
      ...rule.item_aliases,
      ...rule.instructions,
      ...(rule.tips || [])
    ].join(" ").toLowerCase();

    return context.detected_keywords.some(kw => ruleText.includes(kw));
  });

  if (relevantRules.length === 0) {
    return { found: false, content: "", sources: [] };
  }

  const sources: NationalOfficialSource[] = [];
  const contentParts: string[] = [];

  relevantRules.slice(0, 2).forEach(rule => {
    rule.source_refs.forEach(ref => {
      if (ref.source_id === "SEP_2026") {
        sources.push({
          source_type: "NATIONAL_OFFICIAL",
          organization: "기후에너지환경부",
          document_name: "재활용가능자원의 분리수거 등에 관한 지침",
          published_date: ref.effective_date
        });
      } else if (ref.source_id === "WCA") {
        sources.push({
          source_type: "NATIONAL_OFFICIAL",
          organization: "법률",
          document_name: "폐기물관리법",
          published_date: ref.effective_date
        });
      }
    });

    contentParts.push(`[${rule.item_name}] ${rule.instructions.join(" / ")}`);
  });

  return {
    found: true,
    content: contentParts.join("\n"),
    sources: sources.slice(0, 2) // 중복 제거를 위해 최대 2개
  };
}

// ==================== TIER 3: Web Search ====================

/**
 * TIER 3: 웹 검색
 */
async function searchWebGeneral(query: string): Promise<{
  results: WebSearchResult[];
  sources: KnowledgeSource[];
}> {
  if (!ROUTING_CONFIG.enable_web_search || !isSearchEnabled()) {
    return { results: [], sources: [] };
  }

  try {
    const results = await searchWasteDisposal(query);
    const limitedResults = results.slice(0, ROUTING_CONFIG.max_web_results);

    const sources: KnowledgeSource[] = limitedResults.map(result =>
      webResultToSource(result)
    );

    return { results: limitedResults, sources };
  } catch (error) {
    console.error("[KnowledgeRouter] Web search error:", error);
    return { results: [], sources: [] };
  }
}

// ==================== Main Routing Function ====================

/**
 * 메인 지식 라우팅 함수
 */
export async function routeKnowledge(query: string): Promise<KnowledgeRoutingResult> {
  console.log("[KnowledgeRouter] Routing query:", query);

  // Step 1: TIER 1 - 로컬 룰북 검색
  const tier1 = searchLocalRulebook(query);
  console.log("[KnowledgeRouter] TIER 1 confidence:", tier1.confidence);

  // TIER 1 신뢰도가 충분히 높으면 바로 반환
  if (tier1.confidence >= ROUTING_CONFIG.tier1_confidence_threshold) {
    return {
      tier: 1,
      source_type: "LOCAL_RULEBOOK",
      confidence: tier1.confidence,
      matched_rule_id: tier1.result.matchedRule?.rule_id,
      needs_clarification: tier1.result.needsClarification,
      clarifying_questions: tier1.result.clarifyingQuestions?.slice(
        0,
        ROUTING_CONFIG.max_clarifying_questions
      )
    };
  }

  // Step 2: 명시적 웹 검색 요청 확인
  const explicitWebSearch = needsExplicitWebSearch(query);

  // Step 3: TIER 2 - 환경부 공식 자료 확인
  const tier2 = searchNationalOfficial(query);

  if (tier2.found && tier1.confidence >= ROUTING_CONFIG.tier2_confidence_threshold) {
    // TIER 1 + TIER 2 조합
    return {
      tier: 1, // 기본은 TIER 1
      source_type: "LOCAL_RULEBOOK",
      confidence: tier1.confidence + 0.1, // TIER 2로 보강되면 신뢰도 상승
      matched_rule_id: tier1.result.matchedRule?.rule_id,
      needs_clarification: tier1.result.needsClarification,
      clarifying_questions: tier1.result.clarifyingQuestions?.slice(
        0,
        ROUTING_CONFIG.max_clarifying_questions
      )
    };
  }

  // Step 4: TIER 3 - 웹 검색 (명시적 요청이거나 TIER 1/2 불충분)
  if (explicitWebSearch || tier1.confidence < ROUTING_CONFIG.tier2_confidence_threshold) {
    console.log("[KnowledgeRouter] Falling back to TIER 3 (web search)");

    const tier3 = await searchWebGeneral(query);

    if (tier3.results.length > 0) {
      return {
        tier: 3,
        source_type: "WEB_GENERAL",
        confidence: 0.5, // 웹 검색은 중간 신뢰도
        search_results: tier3.results,
        needs_clarification: false
      };
    }
  }

  // Step 5: 최종 폴백 - TIER 1 결과라도 반환
  return {
    tier: tier1.result.matchedRule ? 1 : 3,
    source_type: tier1.result.matchedRule ? "LOCAL_RULEBOOK" : "WEB_GENERAL",
    confidence: tier1.confidence,
    matched_rule_id: tier1.result.matchedRule?.rule_id,
    needs_clarification: true,
    clarifying_questions: tier1.result.clarifyingQuestions || [
      "어떤 품목인지 좀 더 자세히 알려주시겠어요?",
      "재질이나 상태를 알려주시면 더 정확한 안내가 가능해요."
    ]
  };
}

// ==================== Context Generation ====================

/**
 * OpenAI 프롬프트에 주입할 지식 컨텍스트 생성
 */
export async function generateKnowledgeContext(
  query: string,
  routingResult: KnowledgeRoutingResult
): Promise<string> {
  const parts: string[] = [];

  // TIER 1: 룰북 컨텍스트
  if (routingResult.matched_rule_id) {
    const rule = findRuleById(routingResult.matched_rule_id);
    if (rule) {
      parts.push(`[TIER 1 - 로컬 룰북 매칭]\n규칙 ID: ${rule.rule_id}\n품목: ${rule.item_name}\n배출방법: ${rule.instructions.join(" / ")}`);

      if (rule.exceptions && rule.exceptions.length > 0) {
        parts.push(`예외사항: ${rule.exceptions.join(", ")}`);
      }

      if (rule.tips && rule.tips.length > 0) {
        parts.push(`팁: ${rule.tips.join(" / ")}`);
      }
    }
  }

  // TIER 2: 환경부 공식 자료
  const tier2 = searchNationalOfficial(query);
  if (tier2.found) {
    parts.push(`[TIER 2 - 환경부 공식 자료]\n${tier2.content}`);
  }

  // TIER 3: 웹 검색 결과
  if (routingResult.search_results && routingResult.search_results.length > 0) {
    const webContext = formatSearchResultsForPrompt(routingResult.search_results);
    parts.push(`[TIER 3 - 웹 검색 결과 (참고용)]\n${webContext}`);
    parts.push(`\n⚠️ 웹 검색 결과는 참고용입니다. 평택시와 다를 수 있으니 안내 시 이를 명시하세요.`);
  }

  // 신뢰도 정보
  parts.push(`\n[지식 소스 정보]\n- 사용된 TIER: ${routingResult.tier}\n- 신뢰도: ${(routingResult.confidence * 100).toFixed(0)}%`);

  return parts.join("\n\n");
}

// ==================== Response Builder ====================

/**
 * EnhancedChatResponse 빌더
 */
export function buildEnhancedResponse(
  answer: string,
  routingResult: KnowledgeRoutingResult,
  processingTimeMs?: number
): EnhancedChatResponse {
  const sources: KnowledgeSource[] = [];

  // 매칭된 규칙에서 출처 수집
  if (routingResult.matched_rule_id) {
    const rule = findRuleById(routingResult.matched_rule_id);
    if (rule) {
      rule.source_refs.forEach(ref => {
        sources.push({
          source_type: "LOCAL_RULEBOOK",
          source_id: ref.source_id as LocalRulebookSource["source_id"],
          pinpoint: ref.pinpoint,
          effective_date: ref.effective_date
        });
      });
    }
  }

  // 웹 검색 결과에서 출처 수집
  if (routingResult.search_results) {
    routingResult.search_results.forEach(result => {
      sources.push(webResultToSource(result));
    });
  }

  // 사용된 지식 소스 타입들
  const knowledgeSources: KnowledgeSourceType[] = [];
  if (routingResult.tier === 1 || routingResult.matched_rule_id) {
    knowledgeSources.push("LOCAL_RULEBOOK");
  }
  if (routingResult.tier === 2) {
    knowledgeSources.push("NATIONAL_OFFICIAL");
  }
  if (routingResult.tier === 3 || routingResult.search_results?.length) {
    knowledgeSources.push("WEB_GENERAL");
  }

  // 한 줄 요약 추출 (🎯 이모지 라인)
  const summaryMatch = answer.match(/🎯[^\n]+/);
  const summary = summaryMatch
    ? summaryMatch[0].replace(/🎯\s*(한 줄 요약:?\s*)?/i, "").trim()
    : "";

  // 대형폐기물 관련 여부 확인
  const isLargeWaste = routingResult.matched_rule_id?.startsWith("R029") ||
    routingResult.matched_rule_id?.startsWith("R030") ||
    answer.includes("대형폐기물");

  return {
    answer,
    summary,
    knowledge_sources: knowledgeSources,
    references: sources,
    confidence: {
      overall: routingResult.confidence,
      tier_used: routingResult.tier,
      has_local_rule: !!routingResult.matched_rule_id,
      used_web_search: !!routingResult.search_results?.length
    },
    suggestions: createDefaultSuggestions(isLargeWaste),
    metadata: {
      matched_rule_id: routingResult.matched_rule_id,
      processing_time_ms: processingTimeMs
    }
  };
}

// ==================== Utility Exports ====================

export {
  needsExplicitWebSearch,
  isComparisonQuery,
  ROUTING_CONFIG
};
