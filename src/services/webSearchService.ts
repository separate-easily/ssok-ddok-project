/**
 * Web Search Service
 *
 * 웹 검색 통합 서비스
 * - 룰북에서 찾지 못한 정보를 웹에서 검색
 * - 검색 결과 필터링 및 신뢰도 평가
 * - 캐싱으로 중복 검색 방지
 */

import {
  WebSearchResult,
  SearchContext,
  evaluateDomainCredibility,
  isPyeongtaekDomain,
  isGovernmentDomain,
  TRUSTED_DOMAINS
} from "../data/knowledgeSchema";

// ==================== Configuration ====================

const isBrowser = typeof window !== "undefined";

// Node.js (tsx) 환경과 Vite 브라우저 환경 모두 지원
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key];
  }
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key] as string;
  }
  return "";
};

const SEARCH_CONFIG = {
  // 브라우저에서는 사용하지 않음 (Functions 프록시가 서버 secret으로 보관).
  // Node(tsx 회귀 테스트 스크립트) 전용 키 — VITE_ 접두사가 없어 브라우저 번들에는 포함되지 않는다.
  apiKey: getEnvVar("SEARCH_API_KEY"),
  searchEngineId: getEnvVar("SEARCH_ENGINE_ID"),

  // 검색 설정
  maxResults: 5,
  timeout: 10000, // 10초
  language: "ko",
  country: "kr",

  // 캐시 설정
  cacheEnabled: true,
  cacheTTL: 1000 * 60 * 30, // 30분

  // 검색 키워드 접두사 (검색 품질 향상)
  queryPrefix: "분리배출 재활용",

  // 필터링: 제외할 도메인
  excludedDomains: [
    "youtube.com",
    "instagram.com",
    "facebook.com",
    "twitter.com",
    "tiktok.com",
    "namu.wiki"  // 위키류는 부정확할 수 있음
  ]
};

// ==================== Cache ====================

interface CacheEntry {
  results: WebSearchResult[];
  timestamp: number;
}

const searchCache = new Map<string, CacheEntry>();

function getCachedResults(query: string): WebSearchResult[] | null {
  if (!SEARCH_CONFIG.cacheEnabled) return null;

  const entry = searchCache.get(query.toLowerCase().trim());
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > SEARCH_CONFIG.cacheTTL;
  if (isExpired) {
    searchCache.delete(query.toLowerCase().trim());
    return null;
  }

  return entry.results;
}

function setCachedResults(query: string, results: WebSearchResult[]): void {
  if (!SEARCH_CONFIG.cacheEnabled) return;

  searchCache.set(query.toLowerCase().trim(), {
    results,
    timestamp: Date.now()
  });
}

// ==================== Search Query Builder ====================

/**
 * 사용자 질문을 검색 쿼리로 변환
 */
export function buildSearchQuery(userQuery: string, context?: SearchContext): string {
  // 기본 쿼리 정제
  let query = userQuery
    .replace(/[?？！!。.]/g, " ")
    .replace(/어떻게|어디에|어디다|뭐로|무엇으로/g, "")
    .replace(/버려요|버리나요|버려야|배출해요|배출하나요/g, "배출방법")
    .trim();

  // 검색 품질 향상을 위한 접두사 추가
  if (!query.includes("분리배출") && !query.includes("재활용")) {
    query = `${SEARCH_CONFIG.queryPrefix} ${query}`;
  }

  // 평택시 관련 검색 우선
  if (!query.includes("평택")) {
    query = `평택시 ${query}`;
  }

  return query;
}

/**
 * 검색 컨텍스트 분석
 */
export function analyzeSearchContext(userQuery: string): SearchContext {
  const lowerQuery = userQuery.toLowerCase();

  // 키워드 추출
  const wasteKeywords = [
    "플라스틱", "비닐", "종이", "유리", "캔", "스티로폼", "음식물",
    "건전지", "형광등", "의류", "가구", "가전", "페트병", "종이팩"
  ];

  const detectedKeywords = wasteKeywords.filter(kw => lowerQuery.includes(kw));

  // 검색 의도 파악
  let searchIntent: SearchContext["search_intent"] = "disposal_method";

  if (lowerQuery.includes("규정") || lowerQuery.includes("조례") || lowerQuery.includes("법")) {
    searchIntent = "regulation";
  } else if (lowerQuery.includes("어디") || lowerQuery.includes("장소") || lowerQuery.includes("수거함")) {
    searchIntent = "location";
  } else if (lowerQuery.includes("요일") || lowerQuery.includes("시간") || lowerQuery.includes("언제")) {
    searchIntent = "schedule";
  } else if (lowerQuery.includes("차이") || lowerQuery.includes("다른") || lowerQuery.includes("vs")) {
    searchIntent = "comparison";
  }

  return {
    query: userQuery,
    normalized_query: buildSearchQuery(userQuery),
    detected_keywords: detectedKeywords,
    search_intent: searchIntent
  };
}

// ==================== Mock Search (Development) ====================

/**
 * 개발/테스트용 모의 검색 결과
 * 실제 API 연동 전까지 사용
 */
function getMockSearchResults(query: string): WebSearchResult[] {
  const lowerQuery = query.toLowerCase();

  // PVC 관련 검색
  if (lowerQuery.includes("pvc") || lowerQuery.includes("랩")) {
    return [
      {
        title: "PVC 재질 분리배출 안내 - 환경부",
        url: "https://me.go.kr/waste/pvc-disposal",
        domain: "me.go.kr",
        snippet: "PVC 재질은 재활용 과정에서 염소가스가 발생하여 재활용이 불가능합니다. 종량제봉투로 배출해 주세요.",
        relevance_score: 95,
        credibility: "official",
        is_government: true,
        is_pyeongtaek: false
      },
      {
        title: "비닐랩 분리배출 방법 - 경기도 안내",
        url: "https://gg.go.kr/env/vinyl-wrap",
        domain: "gg.go.kr",
        snippet: "일반 PE, PP 비닐은 비닐류로 배출, PVC 랩은 종량제봉투로 배출하세요.",
        relevance_score: 85,
        credibility: "semi_official",
        is_government: true,
        is_pyeongtaek: false
      }
    ];
  }

  // 수건 관련 검색
  if (lowerQuery.includes("수건") || lowerQuery.includes("타월")) {
    return [
      {
        title: "헌 수건 배출 방법 - 환경부 분리배출 가이드",
        url: "https://me.go.kr/waste/towel",
        domain: "me.go.kr",
        snippet: "수건은 의류수거함이 아닌 종량제봉투로 배출합니다. 의류수거함의 물품은 재사용 목적이므로 위생용품은 부적합합니다.",
        relevance_score: 92,
        credibility: "official",
        is_government: true,
        is_pyeongtaek: false
      }
    ];
  }

  // 양은/스테인리스 관련
  if (lowerQuery.includes("양은") || lowerQuery.includes("스테인리스") || lowerQuery.includes("양동이")) {
    return [
      {
        title: "금속류 분리배출 - 고철과 캔의 구분",
        url: "https://recycling-info.or.kr/metal",
        domain: "recycling-info.or.kr",
        snippet: "양은, 스테인리스 재질은 고철로 분류됩니다. 손잡이에 소량의 플라스틱이 있어도 고철로 배출 가능합니다.",
        relevance_score: 88,
        credibility: "official",
        is_government: true,
        is_pyeongtaek: false
      }
    ];
  }

  // 기본 분리배출 검색
  return [
    {
      title: "분리배출 가이드 - 환경부",
      url: "https://me.go.kr/waste/guide",
      domain: "me.go.kr",
      snippet: "재활용품 분리배출 방법을 안내합니다. 품목별 올바른 배출 방법을 확인하세요.",
      relevance_score: 70,
      credibility: "official",
      is_government: true,
      is_pyeongtaek: false
    },
    {
      title: "평택시 재활용품 수거 안내",
      url: "https://www.pyeongtaek.go.kr/env/recycle",
      domain: "pyeongtaek.go.kr",
      snippet: "평택시 재활용품 분리수거 일정 및 배출 방법 안내",
      relevance_score: 80,
      credibility: "official",
      is_government: true,
      is_pyeongtaek: true
    }
  ];
}

// ==================== Google Custom Search API ====================

interface GoogleSearchResponse {
  items?: Array<{
    title: string;
    link: string;
    displayLink: string;
    snippet: string;
  }>;
  searchInformation?: {
    totalResults: string;
  };
}

/**
 * 검색 API 응답(raw items)을 WebSearchResult로 변환
 */
function mapGoogleItems(
  items: Array<{ title: string; link: string; displayLink: string; snippet: string }>,
  query: string
): WebSearchResult[] {
  return items.map(item => ({
    title: item.title,
    url: item.link,
    domain: item.displayLink,
    snippet: item.snippet,
    relevance_score: calculateRelevanceScore(item, query),
    credibility: evaluateDomainCredibility(item.displayLink),
    is_government: isGovernmentDomain(item.displayLink),
    is_pyeongtaek: isPyeongtaekDomain(item.displayLink)
  }));
}

/**
 * Google Custom Search 호출
 * - 브라우저: Firebase Functions 프록시(googleSearchProxy)를 통해 호출. API 키는 서버에만 존재.
 * - Node(tsx 회귀 테스트 스크립트): SEARCH_API_KEY/SEARCH_ENGINE_ID로 직접 호출 (미설정 시 모의 결과).
 */
async function callGoogleSearch(query: string): Promise<WebSearchResult[]> {
  if (isBrowser) {
    try {
      const { httpsCallable } = await import("firebase/functions");
      const { functions } = await import("../firebase");
      const googleSearchProxy = httpsCallable<
        { query: string },
        { items: Array<{ title: string; link: string; displayLink: string; snippet: string }> }
      >(functions, "googleSearchProxy");

      const result = await googleSearchProxy({ query });
      const items = result.data.items;

      if (!items || items.length === 0) {
        console.log("[WebSearch] No results found");
        return [];
      }

      return mapGoogleItems(items, query);
    } catch (error) {
      console.error("[WebSearch] Functions 프록시 호출 실패:", error);
      return getMockSearchResults(query);
    }
  }

  const { apiKey, searchEngineId, maxResults, timeout, language, country } = SEARCH_CONFIG;

  if (!apiKey || !searchEngineId) {
    console.warn("[WebSearch] API key or Search Engine ID not configured, using mock results");
    return getMockSearchResults(query);
  }

  const params = new URLSearchParams({
    key: apiKey,
    cx: searchEngineId,
    q: query,
    num: String(maxResults),
    lr: `lang_${language}`,
    gl: country
  });

  const url = `https://www.googleapis.com/customsearch/v1?${params}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Google Search API error: ${response.status}`);
    }

    const data: GoogleSearchResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log("[WebSearch] No results found");
      return [];
    }

    return mapGoogleItems(data.items, query);

  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[WebSearch] Request timeout");
    } else {
      console.error("[WebSearch] Error:", error);
    }

    // 오류 시 모의 결과 반환
    return getMockSearchResults(query);
  }
}

/**
 * 검색 결과 관련성 점수 계산
 */
function calculateRelevanceScore(
  item: { title: string; snippet: string; displayLink: string },
  query: string
): number {
  let score = 50; // 기본 점수

  const lowerTitle = item.title.toLowerCase();
  const lowerSnippet = item.snippet.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // 제목에 쿼리 키워드 포함
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 1);
  queryWords.forEach(word => {
    if (lowerTitle.includes(word)) score += 10;
    if (lowerSnippet.includes(word)) score += 5;
  });

  // 도메인 신뢰도 보너스
  if (isPyeongtaekDomain(item.displayLink)) score += 20;
  else if (isGovernmentDomain(item.displayLink)) score += 15;

  // 분리배출/재활용 관련 키워드 보너스
  const relevantKeywords = ["분리배출", "재활용", "버리는", "배출방법", "쓰레기"];
  relevantKeywords.forEach(kw => {
    if (lowerTitle.includes(kw) || lowerSnippet.includes(kw)) score += 5;
  });

  return Math.min(100, score);
}

// ==================== Result Filtering ====================

/**
 * 검색 결과 필터링 및 정렬
 */
function filterAndSortResults(results: WebSearchResult[]): WebSearchResult[] {
  return results
    // 제외 도메인 필터링
    .filter(r => !SEARCH_CONFIG.excludedDomains.some(d =>
      r.domain.toLowerCase().includes(d)
    ))
    // 관련성 점수 기준 정렬
    .sort((a, b) => {
      // 평택시 도메인 우선
      if (a.is_pyeongtaek && !b.is_pyeongtaek) return -1;
      if (!a.is_pyeongtaek && b.is_pyeongtaek) return 1;

      // 정부 도메인 우선
      if (a.is_government && !b.is_government) return -1;
      if (!a.is_government && b.is_government) return 1;

      // 관련성 점수 기준
      return b.relevance_score - a.relevance_score;
    })
    // 상위 결과만 반환
    .slice(0, SEARCH_CONFIG.maxResults);
}

// ==================== Main Export Functions ====================

/**
 * 웹 검색 실행 (메인 함수)
 */
export async function searchWasteDisposal(userQuery: string): Promise<WebSearchResult[]> {
  // 캐시 확인
  const cached = getCachedResults(userQuery);
  if (cached) {
    console.log("[WebSearch] Returning cached results");
    return cached;
  }

  // 검색 쿼리 빌드
  const searchQuery = buildSearchQuery(userQuery);
  console.log("[WebSearch] Searching:", searchQuery);

  // API 호출
  const rawResults = await callGoogleSearch(searchQuery);

  // 필터링 및 정렬
  const filteredResults = filterAndSortResults(rawResults);

  // 캐시 저장
  setCachedResults(userQuery, filteredResults);

  return filteredResults;
}

/**
 * 검색 가능 여부 확인
 */
export function isSearchEnabled(): boolean {
  // 환경 변수 확인
  const envEnabled = getEnvVar("VITE_ENABLE_WEB_SEARCH") !== "false";

  // API 키 설정 확인 (없어도 mock으로 동작)
  return envEnabled;
}

/**
 * 검색 결과를 프롬프트용 텍스트로 변환
 */
export function formatSearchResultsForPrompt(results: WebSearchResult[]): string {
  if (results.length === 0) {
    return "웹 검색 결과가 없습니다.";
  }

  const lines = results.map((r, i) => {
    const trustLevel = r.is_pyeongtaek
      ? "[평택시 공식]"
      : r.is_government
        ? "[정부 공식]"
        : "[참고용]";

    return `${i + 1}. ${trustLevel} ${r.title}\n   ${r.snippet}\n   출처: ${r.domain}`;
  });

  return `[웹 검색 결과]\n${lines.join("\n\n")}`;
}

/**
 * 캐시 초기화 (필요시)
 */
export function clearSearchCache(): void {
  searchCache.clear();
}
