/**
 * 분리수거 챗봇 서비스
 *
 * OpenAI API를 사용하여 평택시 폐기물 조례 기반
 * 분리수거 안내를 제공합니다.
 *
 * 3-Tier Knowledge System:
 * - TIER 1: LOCAL_RULEBOOK (평택시 조례 + 환경부 지침) - 최우선
 * - TIER 2: NATIONAL_OFFICIAL (환경부 공식 자료)
 * - TIER 3: WEB_GENERAL (웹 검색 참고)
 */

import { SYSTEM_PROMPT } from "../data/systemPrompt";
import { generateRulebookContext, routeQuery } from "../data/answerRouter";
import { formatSourceRefs } from "../data/rulebookSchema";
import {
  routeKnowledge,
  generateKnowledgeContext,
  buildEnhancedResponse,
  ROUTING_CONFIG
} from "./knowledgeRouter";
import type {
  EnhancedChatResponse,
  KnowledgeRoutingResult
} from "../data/knowledgeSchema";

// ========================================
// 설정
// ========================================
// 브라우저에서는 Firebase Functions 프록시(chatWithAI)를 통해 OpenAI를 호출한다.
// API 키는 서버(Functions secret)에만 존재하며 클라이언트 번들에는 절대 포함되지 않는다.
const isBrowser = typeof window !== "undefined";

// Node/tsx 회귀 테스트 스크립트 전용 키. VITE_ 접두사가 없으므로 Vite가
// 브라우저 번들에 절대 포함시키지 않는다 (scripts/runEnhancedTestset.ts에서만 사용).
const NODE_OPENAI_API_KEY =
  (typeof process !== "undefined" && process.env?.OPENAI_API_KEY) || "";

// 사용할 모델 (Node 전용 직접 호출 경로에서만 사용, 브라우저는 서버에서 결정)
const OPENAI_MODEL = "gpt-4o-mini";

// 재시도 설정
const MAX_RETRIES = 1; // 429 오류 방지를 위해 재시도 최소화
const INITIAL_RETRY_DELAY = 1000; // 1초
const REQUEST_TIMEOUT = 30000; // 30초

// ========================================
// Tier3 (WEB_GENERAL) 안전 문장 설정
// ========================================

/**
 * Tier3 (웹 일반 정보) 사용 시 추가되는 안전 문장
 * - 전화번호/URL은 여기에 하드코딩하지 않음
 * - 프론트엔드 또는 백엔드 후처리에서 동적으로 추가할 수 있도록 확장 포인트만 제공
 */
const TIER3_SAFETY_DISCLAIMER = `

---
📌 **안내**: 위 내용에는 웹에서 검색한 일반적인 정보가 포함되어 있습니다.
정확한 평택시 기준은 평택시 자원순환과 공식 안내를 함께 확인해 주세요.`;

/**
 * 전화번호/URL 확장 포인트
 * TODO: 백엔드 설정 또는 환경 변수에서 동적으로 가져오도록 확장 가능
 *
 * 사용 예시 (프론트엔드에서):
 *   const contactInfo = getContactInfo(); // { phone: "031-8024-3714", url: "..." }
 *   const finalAnswer = response.answer + formatContactInfo(contactInfo);
 */
export interface ContactInfoExtension {
  phone?: string;
  url?: string;
  appName?: string;
}

/**
 * Tier3가 사용되었는지 확인
 */
const isTier3Used = (sources: string[], tierUsed?: number): boolean => {
  return sources.includes("WEB_GENERAL") || tierUsed === 3;
};

/**
 * Tier3 안전 문장을 응답에 추가
 * - 이미 비슷한 안전 문장이 포함되어 있으면 중복 추가하지 않음
 */
const appendTier3SafetyDisclaimer = (answer: string): string => {
  // 이미 웹 정보 관련 안전 문장이 있는지 확인
  const hasExistingSafetyNote =
    answer.includes("웹에서 검색한") ||
    answer.includes("웹에서 찾은") ||
    answer.includes("일반적인 정보") ||
    answer.includes("공식 안내를 함께 확인");

  if (hasExistingSafetyNote) {
    return answer;
  }

  return answer + TIER3_SAFETY_DISCLAIMER;
};

// ========================================
// 타입 정의
// ========================================
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResponse {
  content: string;
  hasValidSource: boolean;
  matchedRuleId: string | null;
  usedFallback: boolean;
}

export interface ChatOptions {
  skipLocalMatch?: boolean;
  validateSource?: boolean;
  useEnhancedResponse?: boolean;  // 3-tier 시스템 활성화
}

// ========================================
// 유틸리티 함수
// ========================================

/**
 * 지수 백오프로 재시도 지연 계산
 */
const getRetryDelay = (attempt: number): number => {
  return INITIAL_RETRY_DELAY * Math.pow(2, attempt) + Math.random() * 1000;
};

/**
 * 타임아웃이 있는 fetch
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * OpenAI 호출 (브라우저 / Node 겸용)
 * - 브라우저: Firebase Functions 프록시(chatWithAI)를 통해 호출. API 키는 서버에만 존재.
 * - Node(tsx 회귀 테스트 스크립트): OPENAI_API_KEY(VITE_ 접두사 없음, 브라우저 번들 제외)로 직접 호출.
 */
const callOpenAIChat = async (
  messages: Array<{ role: string; content: string }>,
  maxTokens: number
): Promise<string> => {
  if (isBrowser) {
    const { httpsCallable } = await import("firebase/functions");
    const { functions } = await import("../firebase");
    const chatWithAI = httpsCallable<
      { messages: Array<{ role: string; content: string }>; maxTokens: number },
      { reply: string }
    >(functions, "chatWithAI");

    try {
      const result = await chatWithAI({ messages, maxTokens });
      return result.data.reply;
    } catch (error: any) {
      throw new Error(error?.message || "AI 응답을 가져오지 못했습니다.");
    }
  }

  if (!NODE_OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY가 설정되지 않았습니다. .env에 OPENAI_API_KEY(VITE_ 접두사 없이)를 추가해주세요."
    );
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${NODE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            messages,
            temperature: 0.7,
            max_tokens: maxTokens,
          }),
        },
        REQUEST_TIMEOUT
      );

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
        throw new Error("응답을 받지 못했습니다.");
      }

      const errorData = await response.json().catch(() => ({}));

      if (response.status === 429 || response.status >= 500) {
        const delay = getRetryDelay(attempt);
        console.warn(`[ChatService] ${response.status} 에러, ${Math.round(delay)}ms 후 재시도...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        lastError = new Error(
          response.status === 429
            ? "오늘의 AI 사용량이 모두 소진되었어요 😢\n잠시 후 다시 시도하거나, 내일 다시 이용해 주세요!"
            : `서버 오류 (${response.status})`
        );
        continue;
      }

      if (response.status === 401) {
        throw new Error("API 키가 유효하지 않습니다.");
      }

      throw new Error(`API 요청 실패: ${response.status} - ${JSON.stringify(errorData)}`);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          lastError = new Error("요청 시간이 초과되었습니다. 다시 시도해주세요.");
        } else {
          lastError = error;
        }
      }
      if (attempt < MAX_RETRIES - 1) {
        const delay = getRetryDelay(attempt);
        console.warn(`[ChatService] 에러 발생, ${Math.round(delay)}ms 후 재시도...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError || new Error("알 수 없는 오류가 발생했습니다.");
};

/**
 * 응답에서 근거(📚) 섹션이 유효한지 검증
 */
const validateSourceInResponse = (response: string): boolean => {
  // 📚 근거 섹션이 있는지 확인
  const hasSourceSection = response.includes("📚") || response.includes("근거");

  if (!hasSourceSection) return false;

  // source_id 패턴이 있는지 확인 (PT_ORD, SEP_2026 등)
  const sourceIdPattern = /(PT_ORD|PT_RULE|SEP_2026|SEP_2025|WCA)/;
  const hasValidSourceId = sourceIdPattern.test(response);

  // "근거 없음", "확인 필요" 등의 fallback 표현도 유효로 인정
  const hasFallbackNote =
    response.includes("규칙 미등록") ||
    response.includes("안전한 기본값") ||
    response.includes("확인 필요");

  return hasValidSourceId || hasFallbackNote;
};

// ========================================
// 시스템 프롬프트 생성
// ========================================
const createFullSystemPrompt = (): string => {
  const rulebookContext = generateRulebookContext();
  return `${SYSTEM_PROMPT}

---

${rulebookContext}`;
};

// ========================================
// 룰북 선매칭 (비용 절감용)
// ========================================

/**
 * 룰북에서 매칭되는 규칙이 있으면 간단한 답변 생성 (API 호출 없이)
 * 복잡한 질문은 null 반환하여 API 호출로 넘김
 */
const tryLocalMatch = (query: string): string | null => {
  const result = routeQuery(query);

  // 매칭된 규칙이 있고, 확인 질문이 필요 없는 단순 케이스
  if (result.matchedRule && !result.needsClarification) {
    const rule = result.matchedRule;

    // 간단한 답변 포맷 생성
    const response = `### 🎯 한 줄 요약
**${rule.item_name}**은(는) **${rule.category}**로 배출하시면 돼요.

### 📦 이렇게 버려요
${rule.instructions.map((inst, i) => `${i + 1}. ${inst}`).join("\n")}

### 💡 왜냐면
${rule.material_hints.length > 0 ? `재질이 ${rule.material_hints.join(", ")}이고, ` : ""}${rule.category}로 분류되는 품목이에요.
${rule.exceptions.length > 0 ? `단, ${rule.exceptions[0]}` : ""}

### 🤔 애매하면
${rule.tips?.[0] || "잘 모르시겠다면 종량제 봉투에 버리시는 게 안전해요."}

### 📚 근거
${formatSourceRefs(rule.source_refs)}`;

    return response;
  }

  return null; // API 호출 필요
};

// ========================================
// 메인 API 호출 함수
// ========================================
export const sendMessage = async (
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  options: { skipLocalMatch?: boolean; validateSource?: boolean } = {}
): Promise<string> => {
  const { skipLocalMatch = false, validateSource = true } = options;

  // 1. 룰북 선매칭 시도 (비용 절감)
  if (!skipLocalMatch && conversationHistory.length === 0) {
    const localResponse = tryLocalMatch(userMessage);
    if (localResponse) {
      console.log("[ChatService] 룰북 선매칭 성공, API 호출 생략");
      return localResponse;
    }
  }

  // 2. OpenAI용 메시지 구성
  const systemPrompt = createFullSystemPrompt();
  const messages = [
    { role: "system", content: systemPrompt },
    // 대화 이력
    ...conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: "user", content: userMessage },
  ];

  // 3. API 호출 (브라우저: Functions 프록시 / Node: 직접 호출)
  const content = await callOpenAIChat(messages, 1500);

  // 4. 근거 검증 (옵션)
  if (validateSource && !validateSourceInResponse(content)) {
    console.warn("[ChatService] 응답에 유효한 근거가 없음");
    // 근거가 없어도 응답은 반환 (프롬프트에서 강제하므로 대부분 포함됨)
  }

  return content;
};

// ========================================
// 3-Tier Knowledge Router 통합 메시지 함수
// ========================================

/**
 * 3-Tier 지식 라우팅 시스템을 사용하는 향상된 메시지 전송 함수
 * @returns EnhancedChatResponse with knowledge sources and references
 */
export const sendEnhancedMessage = async (
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<EnhancedChatResponse> => {
  const startTime = Date.now();

  // 1. 3-Tier 지식 라우팅 실행
  console.log("[ChatService] 3-Tier Knowledge Routing 시작...");
  const routingResult = await routeKnowledge(userMessage);
  console.log("[ChatService] 라우팅 결과:", {
    tier: routingResult.tier,
    confidence: routingResult.confidence,
    matchedRule: routingResult.matched_rule_id,
    needsClarification: routingResult.needs_clarification
  });

  // 2. 지식 컨텍스트 생성
  const knowledgeContext = await generateKnowledgeContext(userMessage, routingResult);

  // 3. 시스템 프롬프트에 지식 컨텍스트 주입
  const fullSystemPrompt = `${SYSTEM_PROMPT}

---

${generateRulebookContext()}

---

[이번 질문에 대한 지식 라우팅 결과]
${knowledgeContext}`;

  // 4. OpenAI용 메시지 구성
  const messages = [
    { role: "system", content: fullSystemPrompt },
    // 대화 이력
    ...conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: "user", content: userMessage },
  ];

  // 5. API 호출 (브라우저: Functions 프록시 / Node: 직접 호출)
  const content = await callOpenAIChat(messages, 2000);
  const processingTime = Date.now() - startTime;

  // 6. EnhancedChatResponse 빌드
  const enhancedResponse = buildEnhancedResponse(content, routingResult, processingTime);

  // 7. Tier3 (WEB_GENERAL) 사용 시 안전 문장 추가
  if (isTier3Used(enhancedResponse.knowledge_sources, enhancedResponse.confidence.tier_used)) {
    enhancedResponse.answer = appendTier3SafetyDisclaimer(enhancedResponse.answer);
    console.log("[ChatService Enhanced] Tier3 안전 문장 추가됨");
  }

  console.log("[ChatService Enhanced] 응답 생성 완료", {
    tier: enhancedResponse.confidence.tier_used,
    confidence: enhancedResponse.confidence.overall,
    sources: enhancedResponse.knowledge_sources,
    processingTime: `${processingTime}ms`
  });

  // TODO: 여기에 전화번호/URL 후처리 확장 포인트
  // 프론트엔드에서 ContactInfoExtension을 사용하여 동적으로 추가 가능
  // 예: enhancedResponse.answer += formatContactInfo(getContactInfo());

  return enhancedResponse;
};

/**
 * 지식 라우팅만 수행 (답변 생성 없이)
 * 디버깅/분석용
 */
export const analyzeQuery = async (userMessage: string): Promise<KnowledgeRoutingResult> => {
  return routeKnowledge(userMessage);
};

// ========================================
// 내보내기
// ========================================

export const exampleQuestions = [
  "치킨 뼈는 어디에 버려요?",
  "페트병 라벨 꼭 떼야 해요?",
  "아이스팩은 어떻게 버려요?",
  "깨진 그릇은 어디에 버려요?",
  "배달 음식 용기는 어떻게 분리해요?",
  "형광등은 어디에 버려요?",
  "낡은 수건은 어떻게 버려요?",
  "PVC 비닐랩은 재활용되나요?",
];

export const isApiKeyConfigured = (): boolean => {
  // 브라우저: 키는 서버(Functions secret)에만 존재하므로 항상 true.
  //   실제 미설정 상태는 메시지 전송 시 호출 에러로 드러난다.
  // Node(회귀 테스트 스크립트): 로컬 OPENAI_API_KEY 존재 여부로 판단.
  return isBrowser ? true : !!NODE_OPENAI_API_KEY;
};

// 타입 재내보내기
export type { EnhancedChatResponse, KnowledgeRoutingResult };

export default sendMessage;
