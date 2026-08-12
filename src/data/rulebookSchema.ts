/**
 * ### RULEBOOK_JSON_SCHEMA
 * 법령/지침을 구조화하는 JSON 스키마 및 TypeScript 타입 정의
 *
 * 모델이 법령 원문을 직접 해석하지 않고도 판단할 수 있도록
 * 규칙을 구조화합니다.
 */

// ========================================
// Source ID 표준화
// ========================================
export type SourceId =
  | "WCA"       // 폐기물관리법
  | "PT_ORD"    // 평택시 폐기물 관리 조례
  | "PT_RULE"   // 평택시 조례 시행규칙 (운영자 추가 입력)
  | "SEP_2026"  // 재활용가능자원 분리수거 지침 (2026.1.1 시행)
  | "SEP_2025"; // 재활용가능자원 분리수거 지침 (2025.11.5 시행)

export interface SourceMeta {
  name: string;
  shortName: string;
  url: string;
  effectiveDate: string;
  description: string;
}

export const SOURCE_INFO: Record<SourceId, SourceMeta> = {
  WCA: {
    name: "폐기물관리법",
    shortName: "폐기물관리법",
    url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=241983",
    effectiveDate: "2024-01-01",
    description: "폐기물의 발생 억제와 적정한 처리를 위한 기본법",
  },
  PT_ORD: {
    name: "평택시 폐기물 관리 조례",
    shortName: "평택시 조례",
    url: "https://www.elis.go.kr/openapi/sojeopbub/2007609",
    effectiveDate: "2023-08-03",
    description: "평택시 폐기물 관리에 관한 자치법규 (조례 제2293호, 전부개정)",
  },
  PT_RULE: {
    name: "평택시 폐기물 관리 조례 시행규칙",
    shortName: "평택시 시행규칙",
    url: "", // 운영자 추가 입력 필요
    effectiveDate: "",
    description: "평택시 조례의 시행에 필요한 세부사항 (별표 포함)",
  },
  SEP_2026: {
    name: "재활용가능자원의 분리수거 등에 관한 지침",
    shortName: "분리수거지침(2026)",
    url: "https://www.law.go.kr/LSW/admRulInfoP.do?admRulSeq=2100000272746",
    effectiveDate: "2026-01-01",
    description: "환경부 고시, 분리배출 품목별 세부 기준",
  },
  SEP_2025: {
    name: "재활용가능자원의 분리수거 등에 관한 지침 (구버전)",
    shortName: "분리수거지침(2025)",
    url: "https://www.law.go.kr/LSW/admRulInfoP.do?admRulSeq=2100000267832",
    effectiveDate: "2025-11-05",
    description: "환경부 고시, 2025년 11월 시행 버전 (비교용)",
  },
};

// ========================================
// 근거 링크 생성 함수
// ========================================

/**
 * source_id와 pinpoint를 받아서 클릭 가능한 링크 정보 반환
 */
export interface SourceLink {
  text: string;        // 표시 텍스트 (예: "평택시 조례 제15조")
  url: string | null;  // 클릭 시 이동 URL (없으면 null)
  isAvailable: boolean; // URL이 유효한지 여부
}

export const getSourceLink = (sourceId: SourceId, pinpoint: string): SourceLink => {
  const info = SOURCE_INFO[sourceId];

  if (!info) {
    return {
      text: `[알 수 없는 출처] ${pinpoint}`,
      url: null,
      isAvailable: false,
    };
  }

  const text = `${info.shortName} ${pinpoint}`;
  const isAvailable = !!info.url;

  return {
    text,
    url: isAvailable ? info.url : null,
    isAvailable,
  };
};

/**
 * SourceReference 배열을 포맷팅된 문자열로 변환
 * UI에서 📚근거 섹션에 표시할 때 사용
 */
export const formatSourceRefs = (refs: SourceReference[]): string => {
  if (!refs || refs.length === 0) {
    return "근거 없음 (확인 필요)";
  }

  return refs
    .map((ref) => {
      const link = getSourceLink(ref.source_id, ref.pinpoint);
      return link.text;
    })
    .join(", ");
};

/**
 * SourceReference 배열을 마크다운 링크 형식으로 변환
 */
export const formatSourceRefsWithLinks = (refs: SourceReference[]): string => {
  if (!refs || refs.length === 0) {
    return "근거 없음 (확인 필요)";
  }

  return refs
    .map((ref) => {
      const link = getSourceLink(ref.source_id, ref.pinpoint);
      if (link.url) {
        return `[${link.text}](${link.url})`;
      }
      return link.text;
    })
    .join(", ");
};

// ========================================
// 오염 정도
// ========================================
export type ContaminationLevel = "none" | "low" | "mid" | "high" | "unknown";

// ========================================
// 분리배출 카테고리
// ========================================
export type DisposalCategory =
  // 재활용류
  | "종이류"
  | "종이팩"
  | "투명페트병"
  | "플라스틱류"
  | "비닐류"
  | "스티로폼"
  | "유리병류"
  | "캔류"
  | "고철류"
  | "의류/섬유류"
  // 기타
  | "종량제봉투"
  | "음식물쓰레기"
  | "대형폐기물"
  | "유해폐기물"
  | "전용수거함"
  | "사업장폐기물";

// ========================================
// 조건 트리거 (판단 기준)
// ========================================
export interface ConditionTriggers {
  /** 오염 정도 */
  is_contaminated: ContaminationLevel;
  /** 복합재질 여부 */
  is_composite: boolean;
  /** 대형 여부 (50cm 이상 또는 일반 봉투에 안 들어가는 경우) */
  is_large: boolean;
  /** 분리 가능 여부 */
  can_separate: "yes" | "no" | "partial" | "unknown";
  /** 유해 여부 */
  is_hazardous: boolean;
}

// ========================================
// 출처 참조
// ========================================
export interface SourceReference {
  /** 출처 식별자 */
  source_id: SourceId;
  /** 조문/별표 위치 (예: "제15조", "별표1", "별표2 제3호") */
  pinpoint: string;
  /** 시행일 */
  effective_date: string;
}

// ========================================
// 규칙 객체 (핵심)
// ========================================
export interface Rule {
  /** 규칙 고유 ID (예: "R001", "R002") */
  rule_id: string;

  /** 품목명 */
  item_name: string;

  /** 품목 별칭 (시민 표현 다양성 대응) */
  item_aliases: string[];

  /** 분류 카테고리 */
  category: DisposalCategory;

  /** 재질 힌트 (모델이 유사 품목 추론에 사용) */
  material_hints: string[];

  /** 조건 트리거 */
  condition_triggers: ConditionTriggers;

  /** 배출 방법 (행동 단계) */
  instructions: string[];

  /** 허용 배출처 */
  allowed_disposal: DisposalCategory[];

  /** 금지 배출처 */
  prohibited_disposal: DisposalCategory[];

  /** 예외 사항 */
  exceptions: string[];

  /** 확인 질문 (최대 2개 권장) */
  clarifying_questions: string[];

  /** 출처 참조 */
  source_refs: SourceReference[];

  /** 추가 팁 (시민 스트레스 완화용) */
  tips?: string[];

  /** 우선순위 (낮을수록 높은 우선순위, 기본값 100) */
  priority?: number;
}

// ========================================
// 룰북 전체 구조
// ========================================
export interface Rulebook {
  /** 버전 */
  version: string;
  /** 최종 수정일 */
  last_updated: string;
  /** 적용 지역 */
  region: string;
  /** 규칙 목록 */
  rules: Rule[];
  /** 기본값 규칙 (매칭 실패 시) */
  fallback_rules: {
    unknown_recyclable: string;
    unknown_large: string;
    unknown_hazardous: string;
    general_fallback: string;
  };
}

// ========================================
// JSON Schema (API/문서화용)
// ========================================
export const RULEBOOK_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Rulebook",
  description: "평택시 분리배출 규칙 데이터베이스",
  type: "object",
  required: ["version", "last_updated", "region", "rules", "fallback_rules"],
  properties: {
    version: { type: "string", description: "버전 (예: 1.0.0)" },
    last_updated: { type: "string", format: "date", description: "최종 수정일" },
    region: { type: "string", description: "적용 지역 (예: 평택시)" },
    rules: {
      type: "array",
      items: {
        type: "object",
        required: [
          "rule_id",
          "item_name",
          "item_aliases",
          "category",
          "material_hints",
          "condition_triggers",
          "instructions",
          "allowed_disposal",
          "prohibited_disposal",
          "exceptions",
          "clarifying_questions",
          "source_refs",
        ],
        properties: {
          rule_id: { type: "string", pattern: "^R[0-9]{3}$" },
          item_name: { type: "string" },
          item_aliases: { type: "array", items: { type: "string" } },
          category: {
            type: "string",
            enum: [
              "종이류", "종이팩", "투명페트병", "플라스틱류", "비닐류",
              "스티로폼", "유리병류", "캔류", "고철류", "의류/섬유류",
              "종량제봉투", "음식물쓰레기", "대형폐기물", "유해폐기물",
              "전용수거함", "사업장폐기물",
            ],
          },
          material_hints: { type: "array", items: { type: "string" } },
          condition_triggers: {
            type: "object",
            properties: {
              is_contaminated: { type: "string", enum: ["none", "low", "mid", "high", "unknown"] },
              is_composite: { type: "boolean" },
              is_large: { type: "boolean" },
              can_separate: { type: "string", enum: ["yes", "no", "partial", "unknown"] },
              is_hazardous: { type: "boolean" },
            },
          },
          instructions: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 5 },
          allowed_disposal: { type: "array", items: { type: "string" } },
          prohibited_disposal: { type: "array", items: { type: "string" } },
          exceptions: { type: "array", items: { type: "string" } },
          clarifying_questions: { type: "array", items: { type: "string" }, maxItems: 2 },
          source_refs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                source_id: { type: "string", enum: ["WCA", "PT_ORD", "PT_RULE", "SEP_2026", "SEP_2025"] },
                pinpoint: { type: "string" },
                effective_date: { type: "string", format: "date" },
              },
            },
          },
          tips: { type: "array", items: { type: "string" } },
          priority: { type: "number", default: 100 },
        },
      },
    },
    fallback_rules: {
      type: "object",
      properties: {
        unknown_recyclable: { type: "string" },
        unknown_large: { type: "string" },
        unknown_hazardous: { type: "string" },
        general_fallback: { type: "string" },
      },
    },
  },
};

// ========================================
// 기본 조건 트리거 (팩토리 함수)
// ========================================
export const createDefaultConditions = (
  overrides: Partial<ConditionTriggers> = {}
): ConditionTriggers => ({
  is_contaminated: "none",
  is_composite: false,
  is_large: false,
  can_separate: "yes",
  is_hazardous: false,
  ...overrides,
});

// ========================================
// 추가 입력 슬롯 (운영자가 PDF/HWP로 제공 시 끼워넣는 위치)
// ========================================
export interface AdditionalInput {
  /** 입력 유형 */
  type: "PT_RULE" | "SCHEDULE" | "FEE_TABLE" | "LOCATION";
  /** 설명 */
  description: string;
  /** 데이터 (자유 형식) */
  data: unknown;
  /** 적용 대상 rule_id 목록 (빈 배열이면 전체 적용) */
  applies_to: string[];
}

/**
 * 운영자 추가 입력 처리 함수
 * PDF/HWP에서 추출한 데이터를 룰북에 병합합니다.
 */
export const mergeAdditionalInput = (
  rulebook: Rulebook,
  input: AdditionalInput
): Rulebook => {
  // 시행규칙 추가
  if (input.type === "PT_RULE") {
    // source_refs에 PT_RULE 참조 추가 로직
    console.log("PT_RULE 데이터 병합:", input.description);
  }

  // 수거 일정 추가
  if (input.type === "SCHEDULE") {
    // 동별 수거 일정 데이터 병합
    console.log("수거 일정 데이터 병합:", input.description);
  }

  // 수수료 별표 추가
  if (input.type === "FEE_TABLE") {
    // 대형폐기물 수수료 데이터 병합
    console.log("수수료 별표 데이터 병합:", input.description);
  }

  // 수거함 위치 추가
  if (input.type === "LOCATION") {
    // 유해폐기물 수거함 위치 등 병합
    console.log("수거함 위치 데이터 병합:", input.description);
  }

  return rulebook;
};

export default RULEBOOK_JSON_SCHEMA;
