/**
 * ### TESTSET
 * 시민 질문 60개 + 기대 요약
 *
 * - 실제 시민이 할 법한 질문
 * - 표현이 지저분한 케이스 포함
 * - 아파트/단독/상가 상황 혼합
 */

export interface TestCase {
  id: number;
  question: string;
  expectedSummary: string;
  category: string;
  tags: string[];
}

export const TESTSET: TestCase[] = [
  // ========================================
  // 종이류 (1-5)
  // ========================================
  {
    id: 1,
    question: "택배박스 테이프 꼭 떼야 해요?",
    expectedSummary: "테이프와 송장은 제거 후 종이류로 배출",
    category: "종이류",
    tags: ["택배", "테이프"],
  },
  {
    id: 2,
    question: "피자박스 기름 묻었는데 재활용돼요?",
    expectedSummary: "기름 부분 잘라내고 깨끗한 부분만 종이류, 나머지는 종량제",
    category: "종이류",
    tags: ["오염", "피자"],
  },
  {
    id: 3,
    question: "우유팩이랑 일반 종이랑 같이 버려도 되나요",
    expectedSummary: "종이팩은 따로 모아 종이팩 전용으로 배출 권장",
    category: "종이팩",
    tags: ["종이팩", "분리"],
  },
  {
    id: 4,
    question: "마트 영수증은 종이 아니에요?",
    expectedSummary: "영수증은 감열지라 종량제 봉투로 배출",
    category: "종량제",
    tags: ["영수증", "감열지"],
  },
  {
    id: 5,
    question: "책 버리려는데 스프링 제본이에요",
    expectedSummary: "스프링 분리 후 종이류로 배출, 스프링은 고철류",
    category: "종이류",
    tags: ["책", "스프링"],
  },

  // ========================================
  // 플라스틱류 (6-15)
  // ========================================
  {
    id: 6,
    question: "페트병 라벨 안떼면 안돼요?",
    expectedSummary: "투명페트는 라벨 제거 후 전용 수거함에 배출",
    category: "투명페트",
    tags: ["페트병", "라벨"],
  },
  {
    id: 7,
    question: "막걸리 페트병은 투명페트인가요?",
    expectedSummary: "유색 페트병은 일반 플라스틱류로 배출",
    category: "플라스틱류",
    tags: ["유색", "페트병"],
  },
  {
    id: 8,
    question: "샴푸통 안에 내용물 좀 남았는데 그냥 버려도 되나요",
    expectedSummary: "내용물 비우고 헹궈서 플라스틱류로 배출",
    category: "플라스틱류",
    tags: ["샴푸", "잔여물"],
  },
  {
    id: 9,
    question: "요거트 먹고 남은 통 씻어야해요?",
    expectedSummary: "물로 헹궈서 플라스틱류로 배출, 안 씻기면 종량제",
    category: "플라스틱류",
    tags: ["요구르트", "세척"],
  },
  {
    id: 10,
    question: "일회용 플라스틱 숟가락 재활용되나요",
    expectedSummary: "깨끗하면 플라스틱류, 음식 묻으면 종량제",
    category: "플라스틱류",
    tags: ["일회용", "수저"],
  },
  {
    id: 11,
    question: "세제통 펌프 분리해야 해요?",
    expectedSummary: "펌프 내 스프링 분리 어려우면 통째로 플라스틱류 가능",
    category: "플라스틱류",
    tags: ["펌프", "세제통"],
  },
  {
    id: 12,
    question: "아이스아메리카노 플라스틱컵 어떻게 버려요",
    expectedSummary: "음료 비우고 헹궈서 빨대/뚜껑 분리 후 플라스틱류",
    category: "플라스틱류",
    tags: ["테이크아웃", "컵"],
  },
  {
    id: 13,
    question: "배달음식 검정 플라스틱 용기요",
    expectedSummary: "헹궈서 플라스틱류, 기름기 안 지워지면 종량제",
    category: "플라스틱류",
    tags: ["배달", "용기"],
  },
  {
    id: 14,
    question: "칫솔은 플라스틱인데 왜 재활용 안돼요?",
    expectedSummary: "복합재질이라 재활용 어려움, 종량제 봉투로 배출",
    category: "종량제",
    tags: ["칫솔", "복합재질"],
  },
  {
    id: 15,
    question: "물티슈 뚜껑은 플라스틱 맞죠?",
    expectedSummary: "플라스틱 뚜껑은 분리해서 플라스틱류로 배출",
    category: "플라스틱류",
    tags: ["물티슈", "뚜껑"],
  },

  // ========================================
  // 비닐류 (16-20)
  // ========================================
  {
    id: 16,
    question: "과자봉지 안에 과자 부스러기 좀 있어도 되나요",
    expectedSummary: "부스러기 털어내고 비닐류로 배출",
    category: "비닐류",
    tags: ["과자봉지", "부스러기"],
  },
  {
    id: 17,
    question: "라면봉지 은색인데 비닐이에요?",
    expectedSummary: "은박 코팅 있어도 비닐류로 배출 가능",
    category: "비닐류",
    tags: ["라면", "은박"],
  },
  {
    id: 18,
    question: "뽁뽁이 진짜 큰데 그냥 비닐로 버려도 되나요",
    expectedSummary: "에어캡은 비닐류로 배출, 크기 상관없음",
    category: "비닐류",
    tags: ["에어캡", "완충재"],
  },
  {
    id: 19,
    question: "고기 담았던 비닐 핏물 묻었는데",
    expectedSummary: "세척 어려우면 종량제 봉투로 배출",
    category: "종량제",
    tags: ["오염", "핏물"],
  },
  {
    id: 20,
    question: "검은 비닐봉지도 재활용되나요?",
    expectedSummary: "색깔 상관없이 깨끗하면 비닐류로 배출",
    category: "비닐류",
    tags: ["검은봉지", "색깔"],
  },

  // ========================================
  // 스티로폼 (21-24)
  // ========================================
  {
    id: 21,
    question: "컵라면 용기 국물 남았는데 어떻게 해요",
    expectedSummary: "국물 비우고 깨끗이 헹궈서 스티로폼으로 배출",
    category: "스티로폼",
    tags: ["컵라면", "세척"],
  },
  {
    id: 22,
    question: "과일 포장된 스티로폼 재활용 되죠?",
    expectedSummary: "흰색 스티로폼은 테이프 제거 후 스티로폼으로 배출",
    category: "스티로폼",
    tags: ["과일", "포장"],
  },
  {
    id: 23,
    question: "분홍색 스티로폼은요?",
    expectedSummary: "색깔 스티로폼은 종량제 봉투로 배출",
    category: "종량제",
    tags: ["색깔", "스티로폼"],
  },
  {
    id: 24,
    question: "생선 담았던 스티로폼 비린내 나는데",
    expectedSummary: "깨끗이 씻어서 배출, 냄새/얼룩 안 지워지면 종량제",
    category: "스티로폼",
    tags: ["생선", "냄새"],
  },

  // ========================================
  // 유리류 (25-28)
  // ========================================
  {
    id: 25,
    question: "소주병 가게 가져가면 돈 주나요?",
    expectedSummary: "소주병/맥주병 반납 시 보증금 환불",
    category: "유리류",
    tags: ["소주병", "보증금"],
  },
  {
    id: 26,
    question: "컵 깨졌어요 유리류에 버리면 되죠?",
    expectedSummary: "깨진 유리는 신문지에 싸서 '깨진유리' 표시 후 종량제",
    category: "종량제",
    tags: ["깨진유리", "안전"],
  },
  {
    id: 27,
    question: "파이렉스 그릇도 유리병이랑 같이요?",
    expectedSummary: "내열유리는 재질이 달라 종량제 또는 대형폐기물",
    category: "종량제",
    tags: ["내열유리", "파이렉스"],
  },
  {
    id: 28,
    question: "거울 버리고 싶은데요",
    expectedSummary: "거울은 유리류 아님, 크기에 따라 종량제/대형폐기물",
    category: "종량제",
    tags: ["거울", "대형"],
  },

  // ========================================
  // 캔/금속류 (29-32)
  // ========================================
  {
    id: 29,
    question: "참치캔 기름 다 빼야해요?",
    expectedSummary: "기름 비우고 물로 헹궈서 캔류로 배출",
    category: "캔류",
    tags: ["참치캔", "기름"],
  },
  {
    id: 30,
    question: "부탄가스 어떻게 버려요 무서워요",
    expectedSummary: "완전히 비운 후 통풍 잘 되는 곳에서 구멍 뚫고 캔류",
    category: "캔류",
    tags: ["부탄가스", "안전"],
  },
  {
    id: 31,
    question: "프라이팬 코팅 벗겨졌는데 고철이에요?",
    expectedSummary: "손잡이 분리 후 고철류, 어려우면 대형폐기물",
    category: "고철류",
    tags: ["프라이팬", "코팅"],
  },
  {
    id: 32,
    question: "철제 옷걸이 어디에 버려요",
    expectedSummary: "고철류로 배출",
    category: "고철류",
    tags: ["옷걸이", "철"],
  },

  // ========================================
  // 음식물쓰레기 (33-42)
  // ========================================
  {
    id: 33,
    question: "치킨 먹고 남은 거 비닐이랑 뼈 어떻게 해요?",
    expectedSummary: "비닐은 비닐류(세척), 뼈는 종량제, 살은 음식물",
    category: "복합",
    tags: ["치킨", "뼈", "비닐"],
  },
  {
    id: 34,
    question: "삼겹살 뼈 음식물 아니에요?",
    expectedSummary: "딱딱한 뼈는 종량제 봉투로 배출",
    category: "종량제",
    tags: ["뼈", "삼겹살"],
  },
  {
    id: 35,
    question: "조개 구워먹고 껍데기 어디다 버려요",
    expectedSummary: "조개껍데기는 종량제 봉투로 배출",
    category: "종량제",
    tags: ["조개", "껍데기"],
  },
  {
    id: 36,
    question: "아보카도씨 음식물이죠?",
    expectedSummary: "딱딱한 씨앗은 종량제 봉투로 배출",
    category: "종량제",
    tags: ["씨앗", "아보카도"],
  },
  {
    id: 37,
    question: "양파 껍질 음식물 맞아요?",
    expectedSummary: "마른 양파껍질은 종량제, 속살은 음식물",
    category: "종량제",
    tags: ["양파", "껍질"],
  },
  {
    id: 38,
    question: "파뿌리는요?",
    expectedSummary: "파뿌리는 종량제 봉투로 배출",
    category: "종량제",
    tags: ["파", "뿌리"],
  },
  {
    id: 39,
    question: "바나나 껍질은 음식물쓰레기죠?",
    expectedSummary: "바나나 껍질은 음식물쓰레기로 배출",
    category: "음식물",
    tags: ["바나나", "껍질"],
  },
  {
    id: 40,
    question: "계란 껍데기요",
    expectedSummary: "소량은 음식물, 많으면 종량제 권장",
    category: "음식물",
    tags: ["계란", "껍데기"],
  },
  {
    id: 41,
    question: "커피찌꺼기 음식물이에요?",
    expectedSummary: "커피찌꺼기는 음식물쓰레기로 배출",
    category: "음식물",
    tags: ["커피", "찌꺼기"],
  },
  {
    id: 42,
    question: "티백은요?",
    expectedSummary: "티백(종이+끈)은 종량제, 내용물만 음식물 가능",
    category: "종량제",
    tags: ["티백", "차"],
  },

  // ========================================
  // 유해폐기물 (43-48)
  // ========================================
  {
    id: 43,
    question: "유통기한 지난 약 어떻게 버려요",
    expectedSummary: "약국 폐의약품 수거함에 배출",
    category: "유해폐기물",
    tags: ["약", "폐의약품"],
  },
  {
    id: 44,
    question: "건전지 편의점에서 받아주나요",
    expectedSummary: "편의점, 마트, 주민센터 전용 수거함에 배출",
    category: "유해폐기물",
    tags: ["건전지", "수거함"],
  },
  {
    id: 45,
    question: "형광등 깨졌어요 어떡해요",
    expectedSummary: "깨진 형광등은 신문지에 싸서 종량제, 환기 필수",
    category: "종량제",
    tags: ["형광등", "깨짐"],
  },
  {
    id: 46,
    question: "페인트 조금 남았는데 그냥 버려도 되나요",
    expectedSummary: "신문지에 흡수시켜 말린 후 종량제, 많으면 유해폐기물 신고",
    category: "유해폐기물",
    tags: ["페인트", "잔여물"],
  },
  {
    id: 47,
    question: "헤어스프레이캔 다 썼는데요",
    expectedSummary: "잔여가스 완전히 빼고 구멍 뚫어 캔류로 배출",
    category: "캔류",
    tags: ["스프레이", "가스"],
  },
  {
    id: 48,
    question: "보조배터리 부풀어올랐어요 위험한가요",
    expectedSummary: "위험! 전용 수거함에 배출, 절연테이프 감싸서",
    category: "유해폐기물",
    tags: ["배터리", "부풀음"],
  },

  // ========================================
  // 대형폐기물 (49-54)
  // ========================================
  {
    id: 49,
    question: "안 쓰는 의자 버리고 싶어요 아파트 사는데",
    expectedSummary: "대형폐기물 신고 후 배출, 정부24 또는 평택시 콜센터",
    category: "대형폐기물",
    tags: ["의자", "아파트"],
  },
  {
    id: 50,
    question: "매트리스 버리는데 돈 얼마나 들어요",
    expectedSummary: "대형폐기물 신고 필요, 수수료는 크기에 따라 다름",
    category: "대형폐기물",
    tags: ["매트리스", "수수료"],
  },
  {
    id: 51,
    question: "고장난 전자레인지요",
    expectedSummary: "1599-0903 무상수거 또는 대형폐기물 신고",
    category: "대형폐기물",
    tags: ["전자레인지", "가전"],
  },
  {
    id: 52,
    question: "TV 새로 사면서 옛날꺼 버리려구요",
    expectedSummary: "새 제품 구매 시 역수거 요청 또는 1599-0903 무상수거",
    category: "대형폐기물",
    tags: ["TV", "역수거"],
  },
  {
    id: 53,
    question: "단독주택인데 냉장고 어떻게 버려요",
    expectedSummary: "1599-0903 무상 방문수거 신청, 집 앞에 내놓으면 됨",
    category: "대형폐기물",
    tags: ["냉장고", "단독주택"],
  },
  {
    id: 54,
    question: "카페 운영하는데 업소용 냉장고 버리려면요",
    expectedSummary: "사업장 폐기물로 별도 처리 필요, 폐기물처리업체 문의",
    category: "사업장",
    tags: ["업소용", "사업장"],
  },

  // ========================================
  // 의류/기타 (55-60)
  // ========================================
  {
    id: 55,
    question: "헌 옷 아무데나 넣어도 되나요",
    expectedSummary: "세탁 후 의류수거함에 배출, 오염/훼손되면 종량제",
    category: "의류",
    tags: ["헌옷", "수거함"],
  },
  {
    id: 56,
    question: "속옷이랑 양말도 의류수거함이에요?",
    expectedSummary: "속옷/양말은 종량제 봉투로 배출",
    category: "종량제",
    tags: ["속옷", "양말"],
  },
  {
    id: 57,
    question: "아이스팩 젤인데 하수구에 버려도 돼요?",
    expectedSummary: "젤 아이스팩은 통째로 종량제, 하수구 절대 금지",
    category: "종량제",
    tags: ["아이스팩", "젤"],
  },
  {
    id: 58,
    question: "우산 분리해서 버려야해요?",
    expectedSummary: "천/비닐은 종량제, 금속살대는 고철류, 어려우면 통째로 종량제",
    category: "복합",
    tags: ["우산", "분리"],
  },
  {
    id: 59,
    question: "인형 솜 들어있는데 어디에요",
    expectedSummary: "솜 인형은 종량제 봉투로 배출",
    category: "종량제",
    tags: ["인형", "솜"],
  },
  {
    id: 60,
    question: "신발 버리려는데 의류수거함 맞죠?",
    expectedSummary: "상태 양호한 신발은 의류수거함, 낡았으면 종량제",
    category: "의류",
    tags: ["신발", "상태"],
  },
];

// ========================================
// 테스트 실행 함수
// ========================================
export const runTests = (
  answerFn: (question: string) => string
): { passed: number; failed: number; results: Array<{ id: number; passed: boolean; question: string; expected: string; actual: string }> } => {
  const results = TESTSET.map((tc) => {
    const actual = answerFn(tc.question);
    const passed = actual.toLowerCase().includes(tc.expectedSummary.toLowerCase().substring(0, 10));
    return {
      id: tc.id,
      passed,
      question: tc.question,
      expected: tc.expectedSummary,
      actual: actual.substring(0, 100),
    };
  });

  return {
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length,
    results,
  };
};

export default TESTSET;
