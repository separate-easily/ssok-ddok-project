/**
 * 3-Tier Knowledge System Schema
 *
 * 지식 레이어 3단계:
 * - TIER 1 (LOCAL_RULEBOOK): 평택시 조례/시행규칙 + 환경부 지침 기반 구조화 데이터
 * - TIER 2 (NATIONAL_OFFICIAL): 환경부/기후에너지환경부 공식 자료, 한국환경공단 등
 * - TIER 3 (WEB_GENERAL): 블로그, 뉴스, 타 지자체 안내 등 참고용
 */

// ==================== Knowledge Tier Types ====================

export type KnowledgeTier = 1 | 2 | 3;

export type KnowledgeSourceType =
  | "LOCAL_RULEBOOK"      // 평택시 조례 + 환경부 지침
  | "NATIONAL_OFFICIAL"   // 환경부, 한국환경공단, 한국소비자원 등 공식 자료
  | "WEB_GENERAL";        // 블로그, 뉴스, 타 지자체 등

export type SourceCredibility = "official" | "semi_official" | "reference";

// ==================== Source Reference Types ====================

export interface LocalRulebookSource {
  source_type: "LOCAL_RULEBOOK";
  source_id: "WCA" | "PT_ORD" | "PT_RULE" | "SEP_2026" | "SEP_2025";
  pinpoint: string;        // "제7조", "별표1 플라스틱류" 등
  effective_date?: string;
}

export interface NationalOfficialSource {
  source_type: "NATIONAL_OFFICIAL";
  organization: string;    // "환경부", "한국환경공단", "한국소비자원"
  document_name: string;   // "재활용품 분리배출 가이드라인"
  url?: string;
  published_date?: string;
}

export interface WebGeneralSource {
  source_type: "WEB_GENERAL";
  title: string;
  url: string;
  domain: string;
  snippet: string;
  credibility: SourceCredibility;
  note?: string;           // "다른 지자체(서울시) 분리배출 예시로 참고"
}

export type KnowledgeSource =
  | LocalRulebookSource
  | NationalOfficialSource
  | WebGeneralSource;

// ==================== Search Result Types ====================

export interface WebSearchResult {
  title: string;
  url: string;
  domain: string;
  snippet: string;
  relevance_score: number;  // 0-100
  credibility: SourceCredibility;
  is_government: boolean;
  is_pyeongtaek: boolean;
}

export interface SearchContext {
  query: string;
  normalized_query: string;
  detected_keywords: string[];
  search_intent: "disposal_method" | "regulation" | "location" | "schedule" | "comparison" | "general";
}

// ==================== Knowledge Routing Types ====================

export interface KnowledgeRoutingResult {
  tier: KnowledgeTier;
  source_type: KnowledgeSourceType;
  confidence: number;       // 0-1
  matched_rule_id?: string; // R001, R002 등
  search_results?: WebSearchResult[];
  needs_clarification: boolean;
  clarifying_questions?: string[];
}

// ==================== Enhanced Response Types ====================

export interface EnhancedChatResponse {
  // 답변 본문
  answer: string;

  // 한 줄 요약 (프론트에서 별도 표시용)
  summary: string;

  // 사용된 지식 소스들
  knowledge_sources: KnowledgeSourceType[];

  // 상세 출처 정보
  references: KnowledgeSource[];

  // 신뢰도 정보
  confidence: {
    overall: number;        // 0-1
    tier_used: KnowledgeTier;
    has_local_rule: boolean;
    used_web_search: boolean;
  };

  // 추가 안내 (연락처, 앱 등)
  suggestions: {
    call_center?: ContactInfo;
    apps?: AppInfo[];
    additional_resources?: string[];
  };

  // 디버깅용 메타데이터
  metadata: {
    matched_rule_id?: string;
    search_query?: string;
    processing_time_ms?: number;
  };
}

export interface ContactInfo {
  label: string;
  phone: string;
  note?: string;
}

export interface AppInfo {
  name: string;
  type: string;
  description?: string;
}

// ==================== Pyeongtaek Official Contacts ====================

export const PYEONGTAEK_CONTACTS = {
  자원순환과: {
    label: "평택시 자원순환과",
    phone: "031-8024-3714",
    note: "분리배출 관련 문의"
  },
  민원콜센터: {
    label: "평택시 민원콜센터",
    phone: "031-8024-5000",
    note: "일반 민원 (자원순환과 연결 가능)"
  },
  대형폐기물: {
    label: "대형폐기물 배출신고",
    phone: "031-8024-4444",
    note: "대형폐기물 수거 신청"
  },
  가전제품무상수거: {
    label: "가전제품 무상 방문수거",
    phone: "1599-0903",
    note: "대형 가전제품 무상 수거"
  }
} as const;

export const OFFICIAL_APPS = {
  분리배출: {
    name: "내 손안의 분리배출",
    type: "환경부 공식 앱",
    description: "품목별 분리배출 방법 검색"
  },
  여기로: {
    name: "여기로",
    type: "정부24 민원 앱",
    description: "대형폐기물 배출 신고"
  }
} as const;

// ==================== Domain Whitelist for Web Search ====================

export const TRUSTED_DOMAINS = {
  // 정부/공공기관 (최우선)
  government: [
    "pyeongtaek.go.kr",
    "me.go.kr",           // 환경부
    "keco.or.kr",         // 한국환경공단
    "law.go.kr",          // 국가법령정보센터
    "moe.go.kr",
    "recycling-info.or.kr"
  ],
  // 공신력 있는 기관
  semi_official: [
    "kca.go.kr",          // 한국소비자원
    "kostat.go.kr",       // 통계청
    "nier.go.kr"          // 국립환경과학원
  ],
  // 타 지자체 (참고용)
  other_local_gov: [
    "seoul.go.kr",
    "gg.go.kr",           // 경기도
    "incheon.go.kr",
    "busan.go.kr"
  ],
  // 신뢰도 낮음 (참고만)
  news_media: [
    "yonhapnews.co.kr",
    "hani.co.kr",
    "chosun.com",
    "joongang.co.kr"
  ]
} as const;

// ==================== Utility Functions ====================

/**
 * 도메인 신뢰도 평가
 */
export function evaluateDomainCredibility(domain: string): SourceCredibility {
  const lowerDomain = domain.toLowerCase();

  if (TRUSTED_DOMAINS.government.some(d => lowerDomain.includes(d))) {
    return "official";
  }
  if (TRUSTED_DOMAINS.semi_official.some(d => lowerDomain.includes(d))) {
    return "semi_official";
  }
  if (TRUSTED_DOMAINS.other_local_gov.some(d => lowerDomain.includes(d))) {
    return "semi_official";
  }
  return "reference";
}

/**
 * 평택시 관련 도메인인지 확인
 */
export function isPyeongtaekDomain(domain: string): boolean {
  return domain.toLowerCase().includes("pyeongtaek");
}

/**
 * 정부 도메인인지 확인
 */
export function isGovernmentDomain(domain: string): boolean {
  const govDomains = [
    ...TRUSTED_DOMAINS.government,
    ...TRUSTED_DOMAINS.semi_official,
    ...TRUSTED_DOMAINS.other_local_gov
  ];
  return govDomains.some(d => domain.toLowerCase().includes(d));
}

/**
 * 지식 소스 타입을 한글 라벨로 변환
 */
export function getSourceTypeLabel(sourceType: KnowledgeSourceType): string {
  const labels: Record<KnowledgeSourceType, string> = {
    "LOCAL_RULEBOOK": "평택시 조례/환경부 지침",
    "NATIONAL_OFFICIAL": "환경부 공식 자료",
    "WEB_GENERAL": "참고용 웹 정보"
  };
  return labels[sourceType];
}

/**
 * Tier 번호를 소스 타입으로 변환
 */
export function tierToSourceType(tier: KnowledgeTier): KnowledgeSourceType {
  const mapping: Record<KnowledgeTier, KnowledgeSourceType> = {
    1: "LOCAL_RULEBOOK",
    2: "NATIONAL_OFFICIAL",
    3: "WEB_GENERAL"
  };
  return mapping[tier];
}

/**
 * 출처 정보를 사람이 읽을 수 있는 형태로 포맷팅
 */
export function formatReference(ref: KnowledgeSource): string {
  switch (ref.source_type) {
    case "LOCAL_RULEBOOK":
      const sourceNames: Record<string, string> = {
        "WCA": "폐기물관리법",
        "PT_ORD": "평택시 폐기물관리 조례",
        "PT_RULE": "평택시 조례 시행규칙",
        "SEP_2026": "재활용가능자원 분리수거 지침(2026)",
        "SEP_2025": "재활용가능자원 분리수거 지침(2025)"
      };
      return `${sourceNames[ref.source_id] || ref.source_id} ${ref.pinpoint}`;

    case "NATIONAL_OFFICIAL":
      return `${ref.organization} - ${ref.document_name}`;

    case "WEB_GENERAL":
      return `${ref.title} (${ref.domain}) - ${ref.note || "참고용"}`;
  }
}

/**
 * 웹 검색 결과를 KnowledgeSource로 변환
 */
export function webResultToSource(result: WebSearchResult, note?: string): WebGeneralSource {
  return {
    source_type: "WEB_GENERAL",
    title: result.title,
    url: result.url,
    domain: result.domain,
    snippet: result.snippet,
    credibility: result.credibility,
    note: note || (result.is_pyeongtaek
      ? "평택시 공식 자료"
      : result.is_government
        ? "정부 공식 자료"
        : "참고용 정보 (평택시와 다를 수 있음)")
  };
}

// ==================== Response Builder ====================

/**
 * 기본 suggestions 생성
 */
export function createDefaultSuggestions(includeLargeWaste: boolean = false) {
  const suggestions: EnhancedChatResponse["suggestions"] = {
    call_center: PYEONGTAEK_CONTACTS.자원순환과,
    apps: [OFFICIAL_APPS.분리배출],
    additional_resources: [
      "환경부 재활용품 분리배출 가이드라인 참고"
    ]
  };

  if (includeLargeWaste) {
    suggestions.call_center = PYEONGTAEK_CONTACTS.대형폐기물;
    suggestions.apps?.push(OFFICIAL_APPS.여기로);
  }

  return suggestions;
}

/**
 * 웹 검색 기반 답변일 때 추가할 면책 문구
 */
export const WEB_SEARCH_DISCLAIMER =
  "⚠️ 위 내용은 웹에서 찾은 참고 정보입니다. 평택시와 일부 다를 수 있으니, " +
  "정확한 내용은 평택시 자원순환과(☎ 031-8024-3714)나 " +
  "환경부 '내 손안의 분리배출' 앱에서 확인해 주세요.";

/**
 * 출처 표시 텍스트 생성
 */
export function generateSourceAttribution(sources: KnowledgeSource[]): string {
  if (sources.length === 0) return "";

  const localSources = sources.filter(s => s.source_type === "LOCAL_RULEBOOK");
  const nationalSources = sources.filter(s => s.source_type === "NATIONAL_OFFICIAL");
  const webSources = sources.filter(s => s.source_type === "WEB_GENERAL");

  const parts: string[] = [];

  if (localSources.length > 0) {
    parts.push(`📚 ${localSources.map(formatReference).join(", ")}`);
  }

  if (nationalSources.length > 0) {
    parts.push(`🏛️ ${nationalSources.map(formatReference).join(", ")}`);
  }

  if (webSources.length > 0) {
    parts.push(`🌐 ${webSources.map(formatReference).join(", ")} (참고용)`);
  }

  return parts.join("\n");
}
