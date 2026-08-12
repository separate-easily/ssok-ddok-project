/**
 * ### ANSWER_ROUTER
 * 의사결정 트리 - 모델이 질문을 받았을 때 판단하는 순서
 *
 * 필수 순서:
 * (유해/위험 여부) → (대형 여부) → (재질/오염/복합 여부) → (평택시 특화 규칙) → (애매하면 fallback)
 */

import { Rule, DisposalCategory } from "./rulebookSchema";
import { RULEBOOK_DATA, findMatchingRule } from "./rulebookData";
import { generatePtRuleContext } from "./ptRuleData";

// ========================================
// 의사결정 트리 (텍스트 기반)
// ========================================
export const DECISION_TREE = `
┌─────────────────────────────────────────────────────────────────────┐
│                    ANSWER_ROUTER 의사결정 트리                        │
│                    (판단 순서: 25단계 요약)                           │
└─────────────────────────────────────────────────────────────────────┘

[STEP 1] 질문 파싱
  ├─ 품목명 추출 (키워드 분석)
  ├─ 상태 정보 추출 (오염/깨짐/크기 등)
  └─ 주거형태 추출 (아파트/단독/상가 - 있으면)

[STEP 2] 유해/위험 여부 체크 ★ 최우선
  ├─ YES → 유해폐기물 규칙 적용
  │   ├─ 의약품 → 약국 수거함
  │   ├─ 건전지/배터리 → 전용 수거함
  │   ├─ 형광등 → 전용 수거함 (깨지면 종량제)
  │   ├─ 페인트/유성물질 → 유해폐기물 신고
  │   └─ 농약/살충제 → 유해폐기물 신고
  └─ NO → STEP 3으로

[STEP 3] 대형 여부 체크 ★ 차우선
  ├─ 크기 > 50cm 또는 종량제봉투 불가?
  │   ├─ YES → 대형폐기물 규칙 적용
  │   │   ├─ 가전제품 → 1599-0903 무상수거 안내
  │   │   └─ 가구/기타 → 평택시 대형폐기물 신고 안내
  │   └─ NO → STEP 4로
  └─ 불확실 → 확인 질문: "크기가 50cm 이상인가요?"

[STEP 4] 재질 판별
  ├─ 종이 → STEP 5A
  ├─ 플라스틱 → STEP 5B
  ├─ 비닐 → STEP 5C
  ├─ 유리 → STEP 5D
  ├─ 금속 → STEP 5E
  ├─ 스티로폼 → STEP 5F
  ├─ 섬유/의류 → STEP 5G
  ├─ 음식물 → STEP 5H
  ├─ 복합재질 → STEP 6
  └─ 불확실 → 확인 질문: "재질이 뭔가요?"

[STEP 5A] 종이류 세부 판단
  ├─ 종이팩(우유팩 등) → 종이팩 전용
  ├─ 영수증/코팅지 → 종량제봉투
  ├─ 오염됨 → 오염부분 제거 또는 종량제
  └─ 일반 종이 → 종이류

[STEP 5B] 플라스틱 세부 판단
  ├─ 투명 페트병 → 투명페트 전용 (라벨제거)
  ├─ 유색 페트병 → 플라스틱류
  ├─ 오염 심함 → 세척가능? → NO면 종량제
  └─ 일반 플라스틱 → 플라스틱류

[STEP 5C] 비닐류 세부 판단
  ├─ 오염 심함 → 종량제봉투
  └─ 깨끗함 → 비닐류

[STEP 5D] 유리류 세부 판단
  ├─ 깨짐 → 신문지 싸서 종량제 (표시 필수)
  ├─ 내열유리/거울 → 종량제 또는 대형
  └─ 일반 유리병 → 유리류

[STEP 5E] 금속류 세부 판단
  ├─ 가스 남음 → 완전 배출 후 캔류
  ├─ 스프레이캔 → 구멍 뚫어 캔류
  └─ 일반 캔/고철 → 캔류/고철류

[STEP 5F] 스티로폼 세부 판단
  ├─ 색깔 있음 → 종량제봉투
  ├─ 오염됨 → 세척가능? → NO면 종량제
  └─ 흰색/깨끗 → 스티로폼

[STEP 5G] 의류/섬유 세부 판단
  ├─ 속옷/양말 → 종량제봉투
  ├─ 오염/훼손 심함 → 종량제봉투
  └─ 상태 양호 → 의류수거함

[STEP 5H] 음식물 세부 판단
  ├─ 뼈(딱딱한) → 종량제봉투
  ├─ 조개껍데기 → 종량제봉투
  ├─ 견과류껍질/큰씨앗 → 종량제봉투
  ├─ 양파/마늘 건조껍질 → 종량제봉투
  └─ 일반 음식물 → 음식물쓰레기

[STEP 6] 복합재질 처리
  ├─ 분리 가능?
  │   ├─ YES → 재질별로 분리 후 각각 배출
  │   ├─ PARTIAL → 가능한 부분만 분리
  │   └─ NO → 주재질 기준 또는 종량제
  └─ 오염도 체크 → 심하면 종량제 권고

[STEP 7] 평택시 특화 규칙 체크
  ├─ PT_ORD에 명시된 특별 규정 있음?
  │   └─ YES → 평택시 규정 우선 적용
  └─ 동/읍/면별 수거일정 다름 → 필요시 안내

[STEP 8] 주거형태별 안내 분기
  ├─ 아파트 → 단지 내 분리수거장
  ├─ 단독주택 → 문 앞 또는 지정장소
  └─ 상가 → 사업장 폐기물 가능성 언급

[STEP 9] 애매한 경우 FALLBACK
  ├─ 재활용 여부 불확실 → 종량제봉투 권고
  │   └─ 이유: "오염된 재활용품이 섞이면 다 못 쓰게 돼요"
  ├─ 크기 불확실 → 대형폐기물 신고 권고
  └─ 유해 여부 불확실 → 전용수거함 또는 콜센터 안내

[STEP 10] 답변 생성
  ├─ 포맷 준수: 한줄요약 → 행동단계 → 이유 → 대안 → 근거
  ├─ 스트레스 완화 문구 포함
  └─ source_refs로 근거 표기
`;

// ========================================
// 의사결정 함수 (간소화 버전)
// ========================================
export interface RouterResult {
  matchedRule: Rule | null;
  disposalCategory: DisposalCategory | null;
  needsClarification: boolean;
  clarifyingQuestions: string[];
  fallbackMessage: string | null;
  decisionPath: string[];
}

export const routeQuery = (query: string): RouterResult => {
  const result: RouterResult = {
    matchedRule: null,
    disposalCategory: null,
    needsClarification: false,
    clarifyingQuestions: [],
    fallbackMessage: null,
    decisionPath: [],
  };

  const lowerQuery = query.toLowerCase();

  // STEP 2: 유해 여부 체크
  const hazardousKeywords = ["약", "건전지", "배터리", "형광등", "페인트", "농약", "살충제", "수은"];
  if (hazardousKeywords.some((kw) => lowerQuery.includes(kw))) {
    result.decisionPath.push("유해물질 감지");
    const rule = findMatchingRule(query);
    if (rule) {
      result.matchedRule = rule;
      result.disposalCategory = "유해폐기물";
      return result;
    }
  }

  // STEP 3: 대형 여부 체크
  const largeKeywords = ["냉장고", "세탁기", "TV", "소파", "침대", "매트리스", "책상", "의자", "에어컨"];
  if (largeKeywords.some((kw) => lowerQuery.includes(kw))) {
    result.decisionPath.push("대형폐기물 감지");
    const rule = findMatchingRule(query);
    if (rule) {
      result.matchedRule = rule;
      result.disposalCategory = "대형폐기물";
      return result;
    }
  }

  // STEP 4-6: 재질/품목 매칭
  const rule = findMatchingRule(query);
  if (rule) {
    result.matchedRule = rule;
    result.disposalCategory = rule.category;
    result.decisionPath.push(`규칙 매칭: ${rule.rule_id}`);

    // 오염 관련 키워드 체크
    if (lowerQuery.includes("더러") || lowerQuery.includes("오염") || lowerQuery.includes("묻")) {
      result.decisionPath.push("오염 상태 확인 필요");
      if (rule.clarifying_questions.length > 0) {
        result.needsClarification = true;
        result.clarifyingQuestions = rule.clarifying_questions;
      }
    }

    return result;
  }

  // STEP 9: Fallback
  result.decisionPath.push("매칭 실패 - Fallback 적용");
  result.needsClarification = true;
  result.fallbackMessage = RULEBOOK_DATA.fallback_rules.general_fallback;

  // 재질 확인 질문 추가
  result.clarifyingQuestions = [
    "어떤 재질인가요? (플라스틱/종이/유리/금속/비닐)",
    "음식물이나 이물질이 묻어있나요?",
  ];

  return result;
};

// ========================================
// 프롬프트용 컨텍스트 생성
// ========================================
export const generateRulebookContext = (): string => {
  let context = "## RULEBOOK 데이터 (40개 규칙 요약)\n\n";

  for (const rule of RULEBOOK_DATA.rules) {
    context += `### ${rule.rule_id}: ${rule.item_name}\n`;
    context += `- 별칭: ${rule.item_aliases.slice(0, 5).join(", ")}\n`;
    context += `- 분류: ${rule.category}\n`;
    context += `- 배출방법: ${rule.instructions.slice(0, 2).join("; ")}\n`;
    context += `- 근거: ${rule.source_refs.map((r) => `${r.source_id} ${r.pinpoint}`).join(", ")}\n`;
    if (rule.exceptions.length > 0) {
      context += `- 예외: ${rule.exceptions[0]}\n`;
    }
    context += "\n";
  }

  context += "## Fallback 규칙\n";
  context += `- 재활용 불확실: ${RULEBOOK_DATA.fallback_rules.unknown_recyclable}\n`;
  context += `- 대형 불확실: ${RULEBOOK_DATA.fallback_rules.unknown_large}\n`;
  context += `- 유해 불확실: ${RULEBOOK_DATA.fallback_rules.unknown_hazardous}\n`;
  context += `- 일반 Fallback: ${RULEBOOK_DATA.fallback_rules.general_fallback}\n`;

  // PT_RULE 평택시 특화 정보 추가
  context += generatePtRuleContext();

  return context;
};

export default DECISION_TREE;
