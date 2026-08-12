/**
 * ### RULEBOOK_SEED_DATA
 * 초기 규칙 40개 데이터
 *
 * 범위:
 * - 종이류/종이팩/투명페트/플라스틱용기/비닐필름/스티로폼/유리병/깨진유리/캔·금속/의류·섬유
 * - 음식물 (뼈·조개껍데기·과일씨·기름진 잔반 예외)
 * - 유해 (폐의약품/건전지/형광등/스프레이캔/페인트류)
 * - 대형 (의자/책상/매트리스/전자레인지/TV 등)
 * - 복합재질 (테이크아웃컵, 라면용기, 과자봉지, 코팅지)
 */

import { Rulebook, Rule, createDefaultConditions } from "./rulebookSchema";

export const RULEBOOK_DATA: Rulebook = {
  version: "1.0.0",
  last_updated: "2026-01-25",
  region: "평택시",

  fallback_rules: {
    unknown_recyclable: "재활용 여부가 불확실하면 깨끗이 세척 후 해당 재질 분리수거함에 배출하시고, 세척이 어려우면 종량제 봉투에 버리시는 게 안전해요.",
    unknown_large: "일반 봉투에 들어가지 않는 크기라면 대형폐기물로 신고 후 배출해주세요. 평택시 콜센터(031-8024-4444) 또는 정부24에서 신청하실 수 있어요.",
    unknown_hazardous: "유해 여부가 불확실하면 주민센터나 아파트 관리사무소의 전용 수거함에 배출하시거나, 평택시 콜센터에 문의해주세요.",
    general_fallback: "잘 모르시겠다면 종량제 봉투에 버리시는 게 가장 안전해요. 오염된 재활용품이 섞이면 다른 재활용품까지 못 쓰게 되거든요.",
  },

  rules: [
    // ========================================
    // 종이류 (R001-R004)
    // ========================================
    {
      rule_id: "R001",
      item_name: "신문지/책/노트",
      item_aliases: ["신문", "책", "노트", "잡지", "교과서", "만화책", "서류", "프린트물", "복사지"],
      category: "종이류",
      material_hints: ["종이", "펄프"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "물에 젖지 않도록 보관해주세요",
        "스프링, 클립, 비닐 커버 등 이물질을 제거해주세요",
        "펼쳐서 차곡차곡 쌓아 묶거나 종이류 수거함에 배출해주세요",
      ],
      allowed_disposal: ["종이류"],
      prohibited_disposal: ["종량제봉투", "음식물쓰레기"],
      exceptions: ["비닐 코팅된 표지는 제거 후 배출"],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 종이류", effective_date: "2026-01-01" },
      ],
      tips: ["비 오는 날엔 비닐로 덮어두시면 좋아요"],
    },
    {
      rule_id: "R002",
      item_name: "택배박스",
      item_aliases: ["박스", "종이박스", "상자", "택배상자", "골판지", "포장박스"],
      category: "종이류",
      material_hints: ["골판지", "종이"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "테이프와 송장(스티커)을 반드시 제거해주세요",
        "박스를 접어서 부피를 줄여주세요",
        "종이류 수거함 또는 묶어서 배출해주세요",
      ],
      allowed_disposal: ["종이류"],
      prohibited_disposal: ["종량제봉투"],
      exceptions: ["기름이나 음식물이 묻은 박스는 오염 부분 잘라내고 배출"],
      clarifying_questions: ["혹시 박스에 음식물이나 기름이 많이 묻어있나요?"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 종이류", effective_date: "2026-01-01" },
      ],
      tips: ["테이프 제거가 귀찮으시면 테이프 부분만 잘라내셔도 돼요"],
    },
    {
      rule_id: "R003",
      item_name: "우유팩/종이팩",
      item_aliases: ["우유팩", "두유팩", "종이팩", "주스팩", "멸균팩", "테트라팩"],
      category: "종이팩",
      material_hints: ["종이", "내부코팅", "PE코팅"],
      condition_triggers: createDefaultConditions({ is_composite: true }),
      instructions: [
        "내용물을 비우고 물로 헹궈주세요",
        "펼쳐서 말려주세요",
        "종이팩 전용 수거함에 배출해주세요 (없으면 종이류와 분리하여 묶어서)",
      ],
      allowed_disposal: ["종이팩", "종이류"],
      prohibited_disposal: ["종량제봉투"],
      exceptions: ["일반 종이와 섞으면 재활용 가치가 떨어지므로 분리 권장"],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 종이팩류", effective_date: "2026-01-01" },
      ],
      tips: ["종이팩은 휴지로 재활용돼서 따로 모으면 더 좋아요"],
    },
    {
      rule_id: "R004",
      item_name: "영수증/코팅지",
      item_aliases: ["영수증", "감열지", "코팅종이", "광고지", "전단지", "사진", "코팅된 종이"],
      category: "종량제봉투",
      material_hints: ["감열지", "코팅", "비닐코팅"],
      condition_triggers: createDefaultConditions({ is_composite: true, can_separate: "no" }),
      instructions: [
        "영수증(감열지)과 코팅된 종이는 재활용이 안 돼요",
        "종량제 봉투에 버려주세요",
      ],
      allowed_disposal: ["종량제봉투"],
      prohibited_disposal: ["종이류"],
      exceptions: [],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 종이류 제외품목", effective_date: "2026-01-01" },
      ],
      tips: ["영수증은 비스페놀A 성분이 있어서 재활용하면 안 돼요"],
    },

    // ========================================
    // 플라스틱류 (R005-R010)
    // ========================================
    {
      rule_id: "R005",
      item_name: "투명 페트병",
      item_aliases: ["페트병", "생수병", "음료수병", "투명플라스틱병", "PET병", "물병"],
      category: "투명페트병",
      material_hints: ["PET", "PETE", "1번 플라스틱"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "내용물을 비우고 물로 헹궈주세요",
        "라벨(비닐)을 제거해주세요",
        "찌그러뜨려서 뚜껑을 닫아주세요",
        "투명 페트병 전용 수거함에 배출해주세요",
      ],
      allowed_disposal: ["투명페트병"],
      prohibited_disposal: ["플라스틱류", "종량제봉투"],
      exceptions: ["색깔 있는 페트병은 일반 플라스틱류로 배출"],
      clarifying_questions: ["혹시 색깔이 있는 페트병인가요? (유색 음료병 등)"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 투명페트병", effective_date: "2026-01-01" },
        { source_id: "PT_ORD", pinpoint: "제15조", effective_date: "2024-01-01" },
      ],
      tips: ["라벨 제거가 어려우시면 가위로 한 번 자르면 쉽게 벗겨져요"],
      priority: 10,
    },
    {
      rule_id: "R006",
      item_name: "플라스틱 용기",
      item_aliases: ["플라스틱통", "세제통", "샴푸통", "반찬통", "요구르트병", "플라스틱컵", "PP용기", "PE용기"],
      category: "플라스틱류",
      material_hints: ["PP", "PE", "PS", "플라스틱", "2-7번"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "내용물을 비우고 물로 헹궈주세요",
        "라벨 제거를 권장해요 (안 되면 그냥 배출해도 됨)",
        "플라스틱류 수거함에 배출해주세요",
      ],
      allowed_disposal: ["플라스틱류"],
      prohibited_disposal: ["종량제봉투", "투명페트병"],
      exceptions: ["음식물이 심하게 묻어 세척이 어려우면 종량제 봉투"],
      clarifying_questions: ["내용물이 깨끗이 씻기나요?"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 플라스틱류", effective_date: "2026-01-01" },
      ],
      tips: ["기름때는 휴지로 한 번 닦고 헹구면 더 잘 씻겨요"],
    },
    {
      rule_id: "R007",
      item_name: "색깔 페트병",
      item_aliases: ["유색페트병", "색깔있는페트병", "컬러페트병", "막걸리병", "식혜병"],
      category: "플라스틱류",
      material_hints: ["유색PET", "착색플라스틱"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "내용물을 비우고 헹궈주세요",
        "라벨을 제거해주세요",
        "플라스틱류 수거함에 배출해주세요 (투명페트 아님!)",
      ],
      allowed_disposal: ["플라스틱류"],
      prohibited_disposal: ["투명페트병"],
      exceptions: [],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 플라스틱류", effective_date: "2026-01-01" },
      ],
      tips: ["투명과 유색을 섞으면 재활용 품질이 떨어져요"],
    },
    {
      rule_id: "R008",
      item_name: "플라스틱 뚜껑/펌프",
      item_aliases: ["뚜껑", "병뚜껑", "펌프", "펌프마개", "스프레이헤드"],
      category: "플라스틱류",
      material_hints: ["PP", "PE", "플라스틱"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "용기와 재질이 같으면 함께 배출해도 돼요",
        "펌프 내부의 스프링(금속)은 분리가 어려우면 그냥 배출",
        "플라스틱류로 배출해주세요",
      ],
      allowed_disposal: ["플라스틱류"],
      prohibited_disposal: [],
      exceptions: ["금속 스프링 분리가 어려우면 통째로 플라스틱류"],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 플라스틱류", effective_date: "2026-01-01" },
      ],
      tips: ["완벽하게 분리 안 해도 괜찮아요, 선별장에서 처리해요"],
    },

    // ========================================
    // 비닐류 (R009-R011)
    // ========================================
    {
      rule_id: "R009",
      item_name: "비닐봉지/포장비닐",
      item_aliases: ["비닐", "비닐봉지", "봉지", "포장비닐", "과자봉지", "라면봉지", "쇼핑백", "검은봉지"],
      category: "비닐류",
      material_hints: ["PE", "PP", "비닐", "필름"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "이물질을 털어내거나 헹궈주세요",
        "물기를 제거해주세요",
        "비닐류 수거함에 배출해주세요",
      ],
      allowed_disposal: ["비닐류"],
      prohibited_disposal: ["종량제봉투", "플라스틱류"],
      exceptions: ["음식물이 심하게 묻어 세척이 어려우면 종량제 봉투"],
      clarifying_questions: ["음식물이 많이 묻어있나요?"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 비닐류", effective_date: "2026-01-01" },
      ],
      tips: ["여러 개 모아서 한 봉지에 넣어 배출하시면 편해요"],
    },
    {
      rule_id: "R010",
      item_name: "에어캡(뽁뽁이)",
      item_aliases: ["뽁뽁이", "에어캡", "완충재", "버블랩", "택배완충재"],
      category: "비닐류",
      material_hints: ["PE", "비닐"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "테이프 등 이물질을 제거해주세요",
        "비닐류 수거함에 배출해주세요",
      ],
      allowed_disposal: ["비닐류"],
      prohibited_disposal: ["스티로폼"],
      exceptions: [],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 비닐류", effective_date: "2026-01-01" },
      ],
    },
    {
      rule_id: "R011",
      item_name: "오염된 비닐",
      item_aliases: ["기름묻은비닐", "음식묻은비닐", "더러운비닐"],
      category: "종량제봉투",
      material_hints: ["오염된 비닐"],
      condition_triggers: createDefaultConditions({ is_contaminated: "high", can_separate: "no" }),
      instructions: [
        "세척이 어려울 정도로 오염된 비닐은 종량제 봉투에 버려주세요",
      ],
      allowed_disposal: ["종량제봉투"],
      prohibited_disposal: ["비닐류"],
      exceptions: [],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 분리배출 제외품목", effective_date: "2026-01-01" },
      ],
      tips: ["오염된 재활용품이 섞이면 깨끗한 것까지 못 쓰게 돼요"],
    },

    // ========================================
    // 스티로폼 (R012-R013)
    // ========================================
    {
      rule_id: "R012",
      item_name: "흰색 스티로폼",
      item_aliases: ["스티로폼", "완충재", "포장재", "생선박스", "과일박스", "택배스티로폼"],
      category: "스티로폼",
      material_hints: ["EPS", "PS", "발포폴리스티렌"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "테이프, 스티커 등 이물질을 제거해주세요",
        "물로 헹궈 음식물이나 이물질을 제거해주세요",
        "스티로폼 수거함에 배출해주세요",
      ],
      allowed_disposal: ["스티로폼"],
      prohibited_disposal: ["종량제봉투", "플라스틱류"],
      exceptions: ["색깔 스티로폼(건축용 등)은 종량제 봉투"],
      clarifying_questions: ["흰색 스티로폼인가요? 색깔이 있나요?"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 발포합성수지류", effective_date: "2026-01-01" },
      ],
      tips: ["부서지면 수거가 어려우니 통째로 배출해주세요"],
    },
    {
      rule_id: "R013",
      item_name: "컵라면 용기",
      item_aliases: ["라면용기", "컵라면", "컵라면그릇", "즉석밥용기"],
      category: "스티로폼",
      material_hints: ["EPS", "발포PS"],
      condition_triggers: createDefaultConditions({ is_contaminated: "unknown" }),
      instructions: [
        "국물과 음식물을 완전히 비워주세요",
        "물로 깨끗이 헹궈주세요",
        "스티로폼 수거함에 배출해주세요",
      ],
      allowed_disposal: ["스티로폼"],
      prohibited_disposal: [],
      exceptions: ["기름기가 안 지워지면 종량제 봉투"],
      clarifying_questions: ["깨끗이 헹굴 수 있나요?"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 발포합성수지류", effective_date: "2026-01-01" },
      ],
      tips: ["따뜻한 물로 헹구면 기름기가 더 잘 빠져요"],
    },

    // ========================================
    // 유리류 (R014-R016)
    // ========================================
    {
      rule_id: "R014",
      item_name: "유리병",
      item_aliases: ["유리병", "술병", "소주병", "맥주병", "와인병", "잼병", "음료병", "식초병"],
      category: "유리병류",
      material_hints: ["유리", "글라스"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "내용물을 비우고 물로 헹궈주세요",
        "뚜껑(금속/플라스틱)은 분리해서 해당 재질로 배출",
        "유리류 수거함에 배출해주세요",
      ],
      allowed_disposal: ["유리병류"],
      prohibited_disposal: ["종량제봉투"],
      exceptions: ["깨진 유리는 신문지에 싸서 종량제 봉투"],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 유리류", effective_date: "2026-01-01" },
      ],
      tips: ["소주병/맥주병은 가게에 반납하면 보증금 돌려받을 수 있어요"],
    },
    {
      rule_id: "R015",
      item_name: "깨진 유리/도자기",
      item_aliases: ["깨진유리", "깨진그릇", "도자기", "사기그릇", "유리조각", "깨진컵"],
      category: "종량제봉투",
      material_hints: ["유리", "도자기", "사기", "세라믹"],
      condition_triggers: createDefaultConditions({ is_hazardous: true }),
      instructions: [
        "신문지나 두꺼운 종이로 여러 겹 싸주세요",
        "봉투 겉면에 '깨진 유리' 또는 '유리조각'이라고 표시해주세요",
        "종량제 봉투에 넣어 배출해주세요",
      ],
      allowed_disposal: ["종량제봉투"],
      prohibited_disposal: ["유리병류"],
      exceptions: [],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 유리류 제외품목", effective_date: "2026-01-01" },
      ],
      tips: ["수거하시는 분 다치지 않게 꼭 표시해주세요"],
      priority: 5,
    },
    {
      rule_id: "R016",
      item_name: "내열유리/거울",
      item_aliases: ["내열유리", "파이렉스", "거울", "냄비뚜껑", "유리냄비"],
      category: "종량제봉투",
      material_hints: ["내열유리", "강화유리", "거울"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "일반 유리와 재질이 달라 재활용이 안 돼요",
        "신문지로 싸서 종량제 봉투에 배출해주세요",
        "크기가 크면 대형폐기물로 신고",
      ],
      allowed_disposal: ["종량제봉투", "대형폐기물"],
      prohibited_disposal: ["유리병류"],
      exceptions: [],
      clarifying_questions: ["크기가 50cm 이상인가요?"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 유리류 제외품목", effective_date: "2026-01-01" },
      ],
    },

    // ========================================
    // 캔/금속류 (R017-R019)
    // ========================================
    {
      rule_id: "R017",
      item_name: "음료캔/맥주캔",
      item_aliases: ["캔", "음료수캔", "맥주캔", "알루미늄캔", "콜라캔", "사이다캔"],
      category: "캔류",
      material_hints: ["알루미늄", "AL", "캔"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "내용물을 비우고 물로 헹궈주세요",
        "찌그러뜨려서 부피를 줄여주세요",
        "캔류 수거함에 배출해주세요",
      ],
      allowed_disposal: ["캔류"],
      prohibited_disposal: ["종량제봉투"],
      exceptions: [],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 금속캔류", effective_date: "2026-01-01" },
      ],
    },
    {
      rule_id: "R018",
      item_name: "부탄가스/스프레이캔",
      item_aliases: ["부탄가스", "가스캔", "스프레이캔", "살충제캔", "헤어스프레이", "에어졸"],
      category: "캔류",
      material_hints: ["철", "알루미늄", "가스용기"],
      condition_triggers: createDefaultConditions({ is_hazardous: true }),
      instructions: [
        "내용물을 완전히 사용해주세요",
        "통풍이 잘 되는 곳에서 잔여가스를 빼주세요 (구멍 뚫기)",
        "캔류 수거함에 배출해주세요",
      ],
      allowed_disposal: ["캔류"],
      prohibited_disposal: ["종량제봉투"],
      exceptions: ["내용물이 남아있으면 유해폐기물로 배출"],
      clarifying_questions: ["가스가 완전히 비었나요?"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 금속캔류", effective_date: "2026-01-01" },
      ],
      tips: ["가스가 남은 채로 버리면 폭발 위험이 있어요"],
      priority: 5,
    },
    {
      rule_id: "R019",
      item_name: "고철/프라이팬",
      item_aliases: ["고철", "프라이팬", "냄비", "철제품", "철사", "옷걸이", "금속"],
      category: "고철류",
      material_hints: ["철", "스테인리스", "금속"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "플라스틱, 나무 등 다른 재질 부분을 분리해주세요",
        "고철류 수거함에 배출해주세요",
        "크기가 크면 대형폐기물로 신고",
      ],
      allowed_disposal: ["고철류", "대형폐기물"],
      prohibited_disposal: ["종량제봉투"],
      exceptions: ["분리가 어려우면 통째로 고철류 또는 대형폐기물"],
      clarifying_questions: ["손잡이가 분리되나요?"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 고철류", effective_date: "2026-01-01" },
      ],
    },

    // ========================================
    // 의류/섬유류 (R020-R021)
    // ========================================
    {
      rule_id: "R020",
      item_name: "의류/옷",
      item_aliases: ["옷", "의류", "티셔츠", "바지", "외투", "자켓", "청바지", "헌옷"],
      category: "의류/섬유류",
      material_hints: ["섬유", "면", "폴리에스터", "천"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "깨끗하게 세탁해주세요",
        "마른 상태로 비닐봉투에 담아주세요",
        "의류수거함(헌옷수거함)에 배출해주세요",
      ],
      allowed_disposal: ["의류/섬유류"],
      prohibited_disposal: ["종량제봉투"],
      exceptions: ["심하게 오염되거나 찢어진 옷은 종량제 봉투"],
      clarifying_questions: ["옷 상태가 양호한가요?"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 의류", effective_date: "2026-01-01" },
      ],
      tips: ["상태 좋은 옷은 아름다운가게 등에 기부도 좋아요"],
    },
    {
      rule_id: "R021",
      item_name: "속옷/양말",
      item_aliases: ["속옷", "양말", "팬티", "브라", "내의", "런닝"],
      category: "종량제봉투",
      material_hints: ["섬유", "면"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "의류수거함에 넣지 마시고 종량제 봉투에 버려주세요",
      ],
      allowed_disposal: ["종량제봉투"],
      prohibited_disposal: ["의류/섬유류"],
      exceptions: [],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 의류 제외품목", effective_date: "2026-01-01" },
      ],
    },

    // ========================================
    // 음식물쓰레기 (R022-R026)
    // ========================================
    {
      rule_id: "R022",
      item_name: "일반 음식물쓰레기",
      item_aliases: ["음식물쓰레기", "남은음식", "음식물", "잔반", "반찬", "밥"],
      category: "음식물쓰레기",
      material_hints: ["음식", "유기물"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "물기를 최대한 제거해주세요",
        "비닐, 이쑤시개 등 이물질을 제거해주세요",
        "음식물 전용봉투 또는 RFID 카드로 배출해주세요",
      ],
      allowed_disposal: ["음식물쓰레기"],
      prohibited_disposal: ["종량제봉투"],
      exceptions: [],
      clarifying_questions: [],
      source_refs: [
        { source_id: "PT_ORD", pinpoint: "제17조 음식물류폐기물", effective_date: "2024-01-01" },
      ],
      tips: ["'동물이 먹을 수 있으면 음식물쓰레기'로 기억하세요"],
    },
    {
      rule_id: "R023",
      item_name: "뼈다귀/닭뼈",
      item_aliases: ["뼈", "닭뼈", "돼지뼈", "소뼈", "갈비뼈", "뼈다귀", "치킨뼈"],
      category: "종량제봉투",
      material_hints: ["뼈", "골격"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "딱딱한 뼈는 음식물쓰레기가 아니에요",
        "종량제 봉투에 버려주세요",
      ],
      allowed_disposal: ["종량제봉투"],
      prohibited_disposal: ["음식물쓰레기"],
      exceptions: ["생선 작은 뼈는 음식물쓰레기 가능"],
      clarifying_questions: [],
      source_refs: [
        { source_id: "PT_ORD", pinpoint: "제17조", effective_date: "2024-01-01" },
        { source_id: "SEP_2026", pinpoint: "별표2 음식물류폐기물 제외", effective_date: "2026-01-01" },
      ],
      tips: ["치킨 먹고 남은 뼈는 종량제 봉투에 버리시면 돼요"],
      priority: 10,
    },
    {
      rule_id: "R024",
      item_name: "조개껍데기/갑각류",
      item_aliases: ["조개껍데기", "조개", "굴껍데기", "전복껍데기", "게껍데기", "새우껍데기", "랍스터껍데기"],
      category: "종량제봉투",
      material_hints: ["껍데기", "갑각", "석회질"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "딱딱한 껍데기는 음식물쓰레기가 아니에요",
        "종량제 봉투에 버려주세요",
      ],
      allowed_disposal: ["종량제봉투"],
      prohibited_disposal: ["음식물쓰레기"],
      exceptions: [],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표2 음식물류폐기물 제외", effective_date: "2026-01-01" },
      ],
    },
    {
      rule_id: "R025",
      item_name: "견과류 껍질/과일씨",
      item_aliases: ["호두껍질", "밤껍질", "땅콩껍질", "복숭아씨", "살구씨", "아보카도씨", "망고씨", "견과류껍질"],
      category: "종량제봉투",
      material_hints: ["껍질", "씨앗", "딱딱한 외피"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "딱딱한 씨앗과 껍질은 음식물쓰레기가 아니에요",
        "종량제 봉투에 버려주세요",
      ],
      allowed_disposal: ["종량제봉투"],
      prohibited_disposal: ["음식물쓰레기"],
      exceptions: ["부드러운 과일 껍질(바나나, 귤 등)은 음식물쓰레기"],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표2 음식물류폐기물 제외", effective_date: "2026-01-01" },
      ],
      tips: ["딱딱해서 손톱으로 안 눌리면 종량제 봉투로 기억하세요"],
    },
    {
      rule_id: "R026",
      item_name: "양파/마늘 껍질",
      item_aliases: ["양파껍질", "마늘껍질", "파뿌리", "대파뿌리", "생강껍질"],
      category: "종량제봉투",
      material_hints: ["건조 껍질", "섬유질"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "마른 껍질과 뿌리는 사료화가 어려워요",
        "종량제 봉투에 버려주세요",
      ],
      allowed_disposal: ["종량제봉투"],
      prohibited_disposal: ["음식물쓰레기"],
      exceptions: ["양파 속살은 음식물쓰레기"],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표2 음식물류폐기물 제외", effective_date: "2026-01-01" },
      ],
    },

    // ========================================
    // 유해폐기물 (R027-R031)
    // ========================================
    {
      rule_id: "R027",
      item_name: "폐의약품",
      item_aliases: ["약", "유통기한지난약", "처방약", "알약", "물약", "연고"],
      category: "유해폐기물",
      material_hints: ["의약품", "약"],
      condition_triggers: createDefaultConditions({ is_hazardous: true }),
      instructions: [
        "약국의 폐의약품 수거함에 배출해주세요",
        "포장 그대로 넣으셔도 돼요",
      ],
      allowed_disposal: ["유해폐기물", "전용수거함"],
      prohibited_disposal: ["종량제봉투", "음식물쓰레기"],
      exceptions: ["주사기/주사바늘은 병원에서 처리"],
      clarifying_questions: [],
      source_refs: [
        { source_id: "WCA", pinpoint: "제13조 유해폐기물", effective_date: "2024-01-01" },
      ],
      tips: ["하수구에 버리시면 수질 오염 원인이 돼요"],
      priority: 5,
    },
    {
      rule_id: "R028",
      item_name: "건전지/배터리",
      item_aliases: ["건전지", "배터리", "AA건전지", "AAA건전지", "충전식배터리", "보조배터리", "버튼전지"],
      category: "유해폐기물",
      material_hints: ["건전지", "리튬", "전지"],
      condition_triggers: createDefaultConditions({ is_hazardous: true }),
      instructions: [
        "전용 수거함에 배출해주세요",
        "주민센터, 대형마트, 편의점에 수거함이 있어요",
        "단자 부분을 절연테이프로 감싸면 더 안전해요",
      ],
      allowed_disposal: ["유해폐기물", "전용수거함"],
      prohibited_disposal: ["종량제봉투"],
      exceptions: ["자동차 배터리는 정비소 또는 폐기물업체"],
      clarifying_questions: [],
      source_refs: [
        { source_id: "WCA", pinpoint: "제13조", effective_date: "2024-01-01" },
        { source_id: "SEP_2026", pinpoint: "별표3 유해폐기물", effective_date: "2026-01-01" },
      ],
      priority: 5,
    },
    {
      rule_id: "R029",
      item_name: "형광등",
      item_aliases: ["형광등", "삼파장전구", "LED전구", "원형형광등", "일자형형광등"],
      category: "유해폐기물",
      material_hints: ["형광등", "수은"],
      condition_triggers: createDefaultConditions({ is_hazardous: true }),
      instructions: [
        "깨지지 않게 조심해서 운반해주세요",
        "주민센터나 아파트 관리사무소의 전용 수거함에 배출",
        "깨진 형광등은 신문지에 싸서 종량제 봉투",
      ],
      allowed_disposal: ["유해폐기물", "전용수거함"],
      prohibited_disposal: ["종량제봉투", "유리병류"],
      exceptions: ["백열전구는 종량제 봉투"],
      clarifying_questions: ["깨졌나요?"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표3 유해폐기물", effective_date: "2026-01-01" },
      ],
      tips: ["형광등에는 수은이 들어있어서 따로 모아야 해요"],
      priority: 5,
    },
    {
      rule_id: "R030",
      item_name: "페인트/유성물질",
      item_aliases: ["페인트", "락카", "신나", "유성페인트", "니스", "방부제"],
      category: "유해폐기물",
      material_hints: ["유성", "화학물질", "도료"],
      condition_triggers: createDefaultConditions({ is_hazardous: true }),
      instructions: [
        "내용물이 남아있으면 유해폐기물로 처리해야 해요",
        "평택시 콜센터(031-8024-4444)에 문의하세요",
        "소량은 신문지에 흡수시켜 말린 후 종량제 봉투",
      ],
      allowed_disposal: ["유해폐기물"],
      prohibited_disposal: ["종량제봉투", "캔류"],
      exceptions: ["빈 페인트통(완전히 비운 것)은 고철류"],
      clarifying_questions: ["내용물이 남아있나요?"],
      source_refs: [
        { source_id: "WCA", pinpoint: "제13조 유해폐기물", effective_date: "2024-01-01" },
      ],
      tips: ["하수구에 절대 버리지 마세요"],
      priority: 5,
    },
    {
      rule_id: "R031",
      item_name: "살충제/농약용기",
      item_aliases: ["살충제", "농약", "제초제", "살균제", "농약병"],
      category: "유해폐기물",
      material_hints: ["농약", "화학물질"],
      condition_triggers: createDefaultConditions({ is_hazardous: true }),
      instructions: [
        "유해폐기물로 처리해야 해요",
        "농협이나 주민센터에 문의하세요",
        "절대 일반 쓰레기로 버리지 마세요",
      ],
      allowed_disposal: ["유해폐기물"],
      prohibited_disposal: ["종량제봉투", "플라스틱류"],
      exceptions: [],
      clarifying_questions: [],
      source_refs: [
        { source_id: "WCA", pinpoint: "제13조", effective_date: "2024-01-01" },
      ],
      priority: 5,
    },

    // ========================================
    // 대형폐기물 (R032-R036)
    // ========================================
    {
      rule_id: "R032",
      item_name: "의자/책상",
      item_aliases: ["의자", "책상", "테이블", "사무용의자", "컴퓨터책상", "식탁", "소파의자"],
      category: "대형폐기물",
      material_hints: ["가구", "목재", "금속", "플라스틱"],
      condition_triggers: createDefaultConditions({ is_large: true }),
      instructions: [
        "평택시 대형폐기물 신고가 필요해요",
        "정부24 또는 평택시 홈페이지에서 신청",
        "또는 전화: 031-8024-4444",
        "수수료 납부 후 스티커 부착하여 배출",
      ],
      allowed_disposal: ["대형폐기물"],
      prohibited_disposal: ["종량제봉투"],
      exceptions: [],
      clarifying_questions: [],
      source_refs: [
        { source_id: "PT_ORD", pinpoint: "제16조 대형폐기물", effective_date: "2024-01-01" },
      ],
      tips: ["신고 없이 버리시면 과태료가 부과될 수 있어요"],
      priority: 10,
    },
    {
      rule_id: "R033",
      item_name: "매트리스/침대",
      item_aliases: ["매트리스", "침대", "침대프레임", "스프링매트리스", "라텍스매트리스"],
      category: "대형폐기물",
      material_hints: ["침구", "스프링", "폼"],
      condition_triggers: createDefaultConditions({ is_large: true }),
      instructions: [
        "대형폐기물 신고가 필요해요",
        "정부24 또는 평택시 홈페이지에서 신청",
        "크기에 따라 수수료가 달라요",
      ],
      allowed_disposal: ["대형폐기물"],
      prohibited_disposal: ["종량제봉투"],
      exceptions: [],
      clarifying_questions: [],
      source_refs: [
        { source_id: "PT_ORD", pinpoint: "제16조", effective_date: "2024-01-01" },
      ],
    },
    {
      rule_id: "R034",
      item_name: "전자레인지/소형가전",
      item_aliases: ["전자레인지", "에어프라이어", "토스터", "믹서기", "청소기", "다리미"],
      category: "대형폐기물",
      material_hints: ["가전", "전자제품"],
      condition_triggers: createDefaultConditions({ is_large: true }),
      instructions: [
        "소형가전 무상수거 서비스를 이용하세요",
        "전화: 1599-0903 (한국전자제품자원순환공제조합)",
        "또는 대형폐기물로 신고 후 배출",
      ],
      allowed_disposal: ["대형폐기물", "전용수거함"],
      prohibited_disposal: ["종량제봉투"],
      exceptions: ["일부 소형가전은 주민센터 수거함 이용 가능"],
      clarifying_questions: ["크기가 어느 정도인가요?"],
      source_refs: [
        { source_id: "PT_ORD", pinpoint: "제16조", effective_date: "2024-01-01" },
      ],
      tips: ["무상수거 서비스가 더 편리해요"],
    },
    {
      rule_id: "R035",
      item_name: "TV/모니터",
      item_aliases: ["TV", "텔레비전", "모니터", "컴퓨터모니터"],
      category: "대형폐기물",
      material_hints: ["전자제품", "디스플레이"],
      condition_triggers: createDefaultConditions({ is_large: true }),
      instructions: [
        "무상 방문수거 서비스: 1599-0903",
        "또는 대형폐기물로 신고",
        "가전제품은 따로 수거 제도가 있어요",
      ],
      allowed_disposal: ["대형폐기물"],
      prohibited_disposal: ["종량제봉투"],
      exceptions: [],
      clarifying_questions: [],
      source_refs: [
        { source_id: "PT_ORD", pinpoint: "제16조", effective_date: "2024-01-01" },
      ],
    },
    {
      rule_id: "R036",
      item_name: "냉장고/세탁기",
      item_aliases: ["냉장고", "세탁기", "김치냉장고", "건조기", "에어컨"],
      category: "대형폐기물",
      material_hints: ["대형가전"],
      condition_triggers: createDefaultConditions({ is_large: true }),
      instructions: [
        "무상 방문수거 서비스: 1599-0903",
        "수거 예약 후 집 앞에 내놓으시면 돼요",
        "새 제품 구매 시 역수거 요청도 가능",
      ],
      allowed_disposal: ["대형폐기물"],
      prohibited_disposal: ["종량제봉투"],
      exceptions: [],
      clarifying_questions: [],
      source_refs: [
        { source_id: "PT_ORD", pinpoint: "제16조", effective_date: "2024-01-01" },
        { source_id: "WCA", pinpoint: "제46조 생산자책임재활용", effective_date: "2024-01-01" },
      ],
      tips: ["대형가전 무상수거는 정말 편리해요!"],
    },

    // ========================================
    // 복합재질/애매한 케이스 (R037-R040)
    // ========================================
    {
      rule_id: "R037",
      item_name: "테이크아웃 컵",
      item_aliases: ["테이크아웃컵", "아이스컵", "커피컵", "일회용컵", "플라스틱컵"],
      category: "플라스틱류",
      material_hints: ["PET", "PP", "플라스틱"],
      condition_triggers: createDefaultConditions({ is_contaminated: "low" }),
      instructions: [
        "음료를 완전히 비워주세요",
        "물로 한 번 헹궈주세요",
        "빨대/뚜껑 분리 후 플라스틱류로 배출",
      ],
      allowed_disposal: ["플라스틱류"],
      prohibited_disposal: ["종량제봉투"],
      exceptions: ["종이컵은 종이류, 코팅 심하면 종량제"],
      clarifying_questions: ["플라스틱 컵인가요, 종이컵인가요?"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 플라스틱류", effective_date: "2026-01-01" },
      ],
      tips: ["카페에서 헹굴 수 있으면 헹궈오시면 편해요"],
    },
    {
      rule_id: "R038",
      item_name: "과자봉지/라면봉지",
      item_aliases: ["과자봉지", "라면봉지", "스낵봉지", "은박봉지", "알루미늄봉지"],
      category: "비닐류",
      material_hints: ["복합필름", "비닐", "알루미늄코팅"],
      condition_triggers: createDefaultConditions({ is_composite: true }),
      instructions: [
        "내용물과 부스러기를 털어내주세요",
        "기름기가 심하지 않으면 비닐류로 배출",
        "기름기가 심하면 종량제 봉투",
      ],
      allowed_disposal: ["비닐류"],
      prohibited_disposal: [],
      exceptions: ["내부 은박 코팅이 있어도 비닐류로 배출 가능"],
      clarifying_questions: ["기름이 많이 묻어있나요?"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 비닐류", effective_date: "2026-01-01" },
        { source_id: "SEP_2025", pinpoint: "별표1 비닐류", effective_date: "2025-11-05" },
      ],
      tips: ["완벽하게 깨끗하지 않아도 돼요, 털어내기만 하세요"],
    },
    {
      rule_id: "R039",
      item_name: "배달음식 용기",
      item_aliases: ["배달용기", "치킨박스", "피자박스", "배달플라스틱", "일회용용기"],
      category: "플라스틱류",
      material_hints: ["PP", "PS", "종이", "알루미늄"],
      condition_triggers: createDefaultConditions({ is_contaminated: "mid", is_composite: true }),
      instructions: [
        "음식물을 비우고 기름기를 닦아내주세요",
        "물로 헹굴 수 있으면 헹궈주세요",
        "재질별로 분리: 플라스틱/종이/알루미늄",
        "세척이 어려우면 종량제 봉투",
      ],
      allowed_disposal: ["플라스틱류", "종이류", "캔류"],
      prohibited_disposal: [],
      exceptions: ["기름이 심하게 배면 종량제 봉투"],
      clarifying_questions: ["어떤 재질인가요? (플라스틱/종이/알루미늄)", "기름기가 잘 닦이나요?"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1", effective_date: "2026-01-01" },
      ],
      tips: ["휴지로 기름기 한 번 닦고 헹구면 더 쉬워요"],
    },
    {
      rule_id: "R040",
      item_name: "아이스팩",
      item_aliases: ["아이스팩", "젤아이스팩", "물아이스팩", "냉매팩"],
      category: "종량제봉투",
      material_hints: ["젤", "물", "비닐"],
      condition_triggers: createDefaultConditions({ is_composite: true }),
      instructions: [
        "물로 된 아이스팩: 물은 하수구에, 비닐은 비닐류로",
        "젤 타입 아이스팩: 통째로 종량제 봉투에 배출",
        "젤은 절대 하수구에 버리지 마세요!",
      ],
      allowed_disposal: ["종량제봉투", "비닐류"],
      prohibited_disposal: ["음식물쓰레기"],
      exceptions: ["물 아이스팩만 비닐 분리 가능"],
      clarifying_questions: ["물 타입인가요, 젤 타입인가요?"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1", effective_date: "2026-01-01" },
      ],
      tips: ["젤 아이스팩은 재사용하거나 당근마켓에 나눔도 좋아요"],
    },

    // ========================================
    // 추가 규칙 - 테스트 케이스 보완 (R041-R050)
    // ========================================
    {
      rule_id: "R041",
      item_name: "PVC 비닐랩",
      item_aliases: ["PVC랩", "비닐랩", "포도랩", "과일랩", "식품포장랩", "랩", "PVC"],
      category: "종량제봉투",
      material_hints: ["PVC", "폴리염화비닐", "3번 플라스틱"],
      condition_triggers: createDefaultConditions({ is_composite: false, can_separate: "no" }),
      instructions: [
        "PVC 재질은 재활용이 안 돼요",
        "재활용 과정에서 유해물질(염소가스)이 발생해요",
        "종량제 봉투에 버려주세요",
      ],
      allowed_disposal: ["종량제봉투"],
      prohibited_disposal: ["비닐류", "플라스틱류"],
      exceptions: ["PE/PP 재질 랩은 비닐류로 배출 가능"],
      clarifying_questions: ["재질 표시가 있나요? (PVC인지 PE/PP인지)"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 비닐류 분리배출 제외품목", effective_date: "2026-01-01" },
      ],
      tips: ["포도박스에 감긴 랩은 대부분 PVC라서 재활용이 안 돼요"],
      priority: 8,
    },
    {
      rule_id: "R042",
      item_name: "수건/타월",
      item_aliases: ["수건", "타월", "세면타월", "손수건", "행주", "걸레", "욕실수건", "주방타월"],
      category: "종량제봉투",
      material_hints: ["면", "섬유", "타월지"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "의류수거함에 넣지 마시고 종량제 봉투에 버려주세요",
        "의류수거함의 물품은 재사용 목적이라 위생용품은 적합하지 않아요",
      ],
      allowed_disposal: ["종량제봉투"],
      prohibited_disposal: ["의류/섬유류"],
      exceptions: ["새 수건(미사용)은 기부 가능"],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 의류 분리배출 제외품목", effective_date: "2026-01-01" },
      ],
      tips: ["헌 수건은 걸레로 재활용하고 나서 종량제 봉투에 버리세요"],
      priority: 8,
    },
    {
      rule_id: "R043",
      item_name: "양은/스테인리스 양동이",
      item_aliases: ["양은양동이", "스테인리스양동이", "금속양동이", "양은냄비", "스텐냄비", "양은", "스테인리스"],
      category: "고철류",
      material_hints: ["양은", "스테인리스", "스텐", "금속", "알루미늄합금"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "양은, 스테인리스 재질은 고철류로 배출해주세요",
        "손잡이에 소량의 플라스틱이 있어도 고철로 배출 가능해요",
        "분리가 어려운 소량의 이물질은 그대로 배출해도 괜찮아요",
      ],
      allowed_disposal: ["고철류"],
      prohibited_disposal: ["종량제봉투", "캔류"],
      exceptions: ["크기가 너무 크면 대형폐기물로 신고"],
      clarifying_questions: ["크기가 50cm 이상인가요?"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 고철류", effective_date: "2026-01-01" },
      ],
      tips: ["캔류(음료캔)와 고철류(프라이팬, 양동이)는 달라요"],
      priority: 7,
    },
    {
      rule_id: "R044",
      item_name: "회/생선 스티로폼 용기",
      item_aliases: ["회용기", "생선용기", "스티로폼트레이", "생선트레이", "회트레이", "육류트레이"],
      category: "스티로폼",
      material_hints: ["EPS", "스티로폼", "발포PS"],
      condition_triggers: createDefaultConditions({ is_contaminated: "mid" }),
      instructions: [
        "남은 음식물과 핏물을 깨끗이 씻어내주세요",
        "물로 여러 번 헹궈 냄새를 제거해주세요",
        "스티로폼 수거함에 배출해주세요",
      ],
      allowed_disposal: ["스티로폼"],
      prohibited_disposal: ["종량제봉투"],
      exceptions: ["핏물/기름기가 안 지워지면 종량제 봉투"],
      clarifying_questions: ["깨끗이 씻을 수 있나요?"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 발포합성수지류", effective_date: "2026-01-01" },
      ],
      tips: ["따뜻한 물에 세제로 씻으면 더 깨끗해져요"],
    },
    {
      rule_id: "R045",
      item_name: "러그/카펫",
      item_aliases: ["러그", "카펫", "카페트", "매트", "발매트", "욕실매트", "현관매트"],
      category: "대형폐기물",
      material_hints: ["섬유", "직물", "카펫"],
      condition_triggers: createDefaultConditions({ is_large: true }),
      instructions: [
        "대형폐기물로 신고 후 배출해주세요",
        "평택시 콜센터(031-8024-4444) 또는 정부24에서 신청",
        "크기에 따라 수수료가 달라요",
      ],
      allowed_disposal: ["대형폐기물"],
      prohibited_disposal: ["종량제봉투", "의류/섬유류"],
      exceptions: ["소형 매트(30cm 이하)는 종량제 봉투"],
      clarifying_questions: ["크기가 어느 정도인가요?"],
      source_refs: [
        { source_id: "PT_ORD", pinpoint: "제16조 대형폐기물", effective_date: "2024-01-01" },
      ],
      tips: ["의류수거함에는 넣지 마세요, 재활용이 안 돼요"],
    },
    {
      rule_id: "R046",
      item_name: "솜베개/솜이불",
      item_aliases: ["솜베개", "베개", "솜이불", "이불", "침구", "솜", "목침", "푹신이"],
      category: "대형폐기물",
      material_hints: ["솜", "폴리에스터솜", "섬유"],
      condition_triggers: createDefaultConditions({ is_large: true }),
      instructions: [
        "대형폐기물로 신고 후 배출해주세요",
        "의류수거함에 넣으면 안 돼요 (재활용 불가 품목)",
        "평택시 콜센터(031-8024-4444)에서 신청하세요",
      ],
      allowed_disposal: ["대형폐기물"],
      prohibited_disposal: ["종량제봉투", "의류/섬유류"],
      exceptions: ["소형 쿠션(50cm 이하)은 종량제 봉투에 잘라서 배출"],
      clarifying_questions: [],
      source_refs: [
        { source_id: "PT_ORD", pinpoint: "제16조 대형폐기물", effective_date: "2024-01-01" },
      ],
      tips: ["기부나 재사용이 가능하다면 '아름다운가게' 등에 연락해보세요"],
    },
    {
      rule_id: "R047",
      item_name: "유통기한 지난 사탕/과자",
      item_aliases: ["유통기한지난과자", "오래된과자", "유통기한지난사탕", "오래된사탕", "먹다남은과자", "상한과자"],
      category: "종량제봉투",
      material_hints: ["식품", "과자", "사탕"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "내용물(과자/사탕)은 종량제 봉투에 버려주세요",
        "포장재는 재질별로 분리배출하세요",
        "- 비닐봉지: 비닐류",
        "- 종이상자: 종이류",
        "- 플라스틱 용기: 플라스틱류",
      ],
      allowed_disposal: ["종량제봉투"],
      prohibited_disposal: ["음식물쓰레기"],
      exceptions: [],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표2 음식물류폐기물 제외", effective_date: "2026-01-01" },
      ],
      tips: ["포장재와 내용물을 꼭 분리하세요!"],
    },
    {
      rule_id: "R048",
      item_name: "철캔/참치캔",
      item_aliases: ["철캔", "참치캔", "통조림캔", "고등어캔", "꽁치캔", "햄캔", "과일캔"],
      category: "캔류",
      material_hints: ["철", "스틸", "FE"],
      condition_triggers: createDefaultConditions(),
      instructions: [
        "내용물을 비우고 물로 헹궈주세요",
        "기름기가 있으면 휴지로 한 번 닦아주세요",
        "캔류 수거함에 배출해주세요",
      ],
      allowed_disposal: ["캔류"],
      prohibited_disposal: ["종량제봉투", "고철류"],
      exceptions: [],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 금속캔류", effective_date: "2026-01-01" },
      ],
      tips: ["캔류(식품용 캔)와 고철류(프라이팬 등 고철)는 분리해요"],
    },
    {
      rule_id: "R049",
      item_name: "분리 어려운 복합재질",
      item_aliases: ["분리어려움", "떼기어려움", "복합재질", "뗄수없는", "분리안됨"],
      category: "종량제봉투",
      material_hints: ["복합", "혼합재질"],
      condition_triggers: createDefaultConditions({ is_composite: true, can_separate: "partial" }),
      instructions: [
        "재질 분리가 어려운 복합재질 제품은 종량제 봉투에 배출해주세요",
        "무리하게 분리하려다 다칠 수 있어요",
        "단, 소량의 이물질(스프링, 손잡이 등)은 그냥 해당 재질로 배출해도 돼요",
      ],
      allowed_disposal: ["종량제봉투"],
      prohibited_disposal: [],
      exceptions: ["소량의 이물질(펌프 스프링 등)은 분리 없이 배출 가능"],
      clarifying_questions: ["어떤 재질이 섞여있나요?"],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 분리배출 제외품목", effective_date: "2026-01-01" },
      ],
      tips: ["시민에게 과도한 분리 노력을 요구하지 않아요"],
    },
    {
      rule_id: "R050",
      item_name: "소량 이물질 플라스틱",
      item_aliases: [],
      category: "플라스틱류",
      material_hints: ["플라스틱", "소량이물질"],
      condition_triggers: createDefaultConditions({ is_composite: true, can_separate: "partial" }),
      instructions: [
        "플라스틱 용기에 소량의 다른 재질이 붙어있어도 괜찮아요",
        "예: 펌프 안의 스프링, 손잡이의 작은 고무 부분",
        "분리가 어려우면 그대로 플라스틱류로 배출하세요",
        "선별장에서 기계로 분리해요",
      ],
      allowed_disposal: ["플라스틱류"],
      prohibited_disposal: [],
      exceptions: ["대부분이 다른 재질이면 그 재질로 배출"],
      clarifying_questions: [],
      source_refs: [
        { source_id: "SEP_2026", pinpoint: "별표1 플라스틱류", effective_date: "2026-01-01" },
      ],
      tips: ["완벽하게 분리 안 해도 괜찮아요!"],
      priority: 3, // 낮은 우선순위 (특정 매칭 후 적용)
    },
  ],
};

// ========================================
// 품목 자동확장 규칙 (추가 200개+ 품목 대응)
// ========================================
/**
 * 새 품목이 들어왔을 때 기존 규칙에서 유사한 것을 찾는 로직
 *
 * 1. item_aliases에서 키워드 매칭
 * 2. material_hints에서 재질 매칭
 * 3. 매칭 실패 시 fallback_rules 적용
 *
 * 확장 시 고려할 속성:
 * - 품목명
 * - 재질 (플라스틱/종이/금속/유리/섬유/복합)
 * - 오염도 (없음/낮음/중간/높음)
 * - 크기 (일반/대형)
 * - 분리 난이도 (쉬움/보통/어려움)
 */
/**
 * rule_id로 규칙 찾기
 */
export const findRuleById = (ruleId: string): Rule | null => {
  return RULEBOOK_DATA.rules.find((rule) => rule.rule_id === ruleId) || null;
};

export const findMatchingRule = (query: string): Rule | null => {
  const lowerQuery = query.toLowerCase();

  // 1차: item_aliases 매칭
  for (const rule of RULEBOOK_DATA.rules) {
    if (rule.item_aliases.some((alias) => lowerQuery.includes(alias.toLowerCase()))) {
      return rule;
    }
  }

  // 2차: item_name 매칭
  for (const rule of RULEBOOK_DATA.rules) {
    if (lowerQuery.includes(rule.item_name.toLowerCase())) {
      return rule;
    }
  }

  // 3차: material_hints 매칭
  for (const rule of RULEBOOK_DATA.rules) {
    if (rule.material_hints.some((hint) => lowerQuery.includes(hint.toLowerCase()))) {
      return rule;
    }
  }

  return null;
};

export default RULEBOOK_DATA;
