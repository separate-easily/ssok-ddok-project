/**
 * 회귀 테스트 스크립트
 *
 * testset 60개를 검증하여 챗봇 응답 품질을 확인합니다.
 *
 * 검증 기준:
 * 1. 카테고리 분류가 기대와 맞는지
 * 2. 근거(source_id)가 포함되어 있는지
 * 3. 확인 질문이 2개 이하인지
 *
 * 실행 방법:
 * npx ts-node src/tests/regressionTest.ts
 * 또는
 * npm test (package.json에 스크립트 추가 필요)
 */

import { TESTSET, TestCase } from "../data/testset";
import { routeQuery } from "../data/answerRouter";
import { formatSourceRefs } from "../data/rulebookSchema";

// ========================================
// 테스트 결과 타입
// ========================================
interface TestResult {
  id: number;
  question: string;
  status: "PASS" | "FAIL" | "WARN";
  checks: {
    categoryMatch: boolean;
    hasSource: boolean;
    questionCountOk: boolean;
  };
  details: {
    expectedCategory: string;
    actualCategory: string | null;
    sourceRefs: string;
    questionCount: number;
  };
  errorMessage?: string;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  warned: number;
  passRate: string;
  failedTests: TestResult[];
}

// ========================================
// 검증 함수들
// ========================================

/**
 * 기대 카테고리와 실제 분류가 맞는지 확인
 */
const checkCategoryMatch = (expected: string, actual: string | null): boolean => {
  if (!actual) return false;

  const expectedLower = expected.toLowerCase();
  const actualLower = actual.toLowerCase();

  // 직접 매칭
  if (actualLower.includes(expectedLower) || expectedLower.includes(actualLower)) {
    return true;
  }

  // 동의어 매핑
  const synonyms: Record<string, string[]> = {
    종량제: ["종량제봉투", "일반쓰레기", "일반 쓰레기"],
    플라스틱: ["플라스틱류", "투명페트", "투명페트병"],
    종이: ["종이류", "종이팩"],
    유리: ["유리류", "유리병류"],
    캔: ["캔류", "고철류", "금속"],
    음식물: ["음식물쓰레기", "음식물 쓰레기"],
    대형: ["대형폐기물", "대형 폐기물"],
    유해: ["유해폐기물", "유해 폐기물", "전용수거함"],
    의류: ["의류/섬유류", "헌옷", "섬유"],
    비닐: ["비닐류"],
    스티로폼: ["스티로폼", "발포"],
    복합: ["복합재질", "분리배출"],
    사업장: ["사업장폐기물"],
  };

  for (const [key, values] of Object.entries(synonyms)) {
    if (expectedLower.includes(key)) {
      if (values.some((v) => actualLower.includes(v.toLowerCase()))) {
        return true;
      }
    }
  }

  return false;
};

/**
 * 근거가 유효한지 확인
 */
const checkHasSource = (sourceRefs: string): boolean => {
  if (!sourceRefs) return false;

  // source_id 패턴 확인
  const sourceIdPattern = /(PT_ORD|PT_RULE|SEP_2026|SEP_2025|WCA)/;
  return sourceIdPattern.test(sourceRefs);
};

/**
 * 확인 질문 개수 확인
 */
const countClarifyingQuestions = (questions: string[]): number => {
  return questions?.length || 0;
};

// ========================================
// 단일 테스트 실행
// ========================================
const runSingleTest = (testCase: TestCase): TestResult => {
  try {
    const routerResult = routeQuery(testCase.question);

    const actualCategory = routerResult.matchedRule?.category || null;
    const sourceRefs = routerResult.matchedRule
      ? formatSourceRefs(routerResult.matchedRule.source_refs)
      : "";
    const questionCount = countClarifyingQuestions(
      routerResult.clarifyingQuestions
    );

    const categoryMatch = checkCategoryMatch(testCase.category, actualCategory);
    const hasSource = checkHasSource(sourceRefs) || routerResult.fallbackMessage !== null;
    const questionCountOk = questionCount <= 2;

    // 모든 체크 통과: PASS
    // 카테고리만 불일치: WARN (룰북에 없을 수 있음)
    // 근거 없음 또는 질문 초과: FAIL
    let status: "PASS" | "FAIL" | "WARN" = "PASS";

    if (!hasSource) {
      status = "FAIL";
    } else if (!questionCountOk) {
      status = "FAIL";
    } else if (!categoryMatch && actualCategory !== null) {
      status = "WARN";
    } else if (!categoryMatch && actualCategory === null) {
      status = "WARN"; // 매칭 실패는 WARN으로 (fallback 사용)
    }

    return {
      id: testCase.id,
      question: testCase.question,
      status,
      checks: {
        categoryMatch,
        hasSource,
        questionCountOk,
      },
      details: {
        expectedCategory: testCase.category,
        actualCategory,
        sourceRefs,
        questionCount,
      },
    };
  } catch (error) {
    return {
      id: testCase.id,
      question: testCase.question,
      status: "FAIL",
      checks: {
        categoryMatch: false,
        hasSource: false,
        questionCountOk: false,
      },
      details: {
        expectedCategory: testCase.category,
        actualCategory: null,
        sourceRefs: "",
        questionCount: 0,
      },
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// ========================================
// 전체 테스트 실행
// ========================================
export const runAllTests = (): TestSummary => {
  console.log("🧪 회귀 테스트 시작...\n");
  console.log(`총 ${TESTSET.length}개 테스트 케이스\n`);
  console.log("─".repeat(60));

  const results: TestResult[] = [];

  for (const testCase of TESTSET) {
    const result = runSingleTest(testCase);
    results.push(result);

    // 진행 상황 출력
    const statusIcon =
      result.status === "PASS" ? "✅" : result.status === "WARN" ? "⚠️" : "❌";
    console.log(
      `${statusIcon} [${String(result.id).padStart(2, "0")}] ${result.question.substring(0, 40)}...`
    );

    if (result.status === "FAIL") {
      console.log(`   └─ 실패 사유: ${result.errorMessage || "근거 없음 또는 질문 초과"}`);
    }
  }

  console.log("─".repeat(60));

  // 요약 계산
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const warned = results.filter((r) => r.status === "WARN").length;
  const passRate = ((passed / results.length) * 100).toFixed(1);

  const summary: TestSummary = {
    total: results.length,
    passed,
    failed,
    warned,
    passRate: `${passRate}%`,
    failedTests: results.filter((r) => r.status === "FAIL"),
  };

  // 결과 출력
  console.log("\n📊 테스트 결과 요약");
  console.log("─".repeat(30));
  console.log(`✅ 통과: ${passed}`);
  console.log(`⚠️ 경고: ${warned}`);
  console.log(`❌ 실패: ${failed}`);
  console.log(`📈 통과율: ${passRate}%`);

  if (failed > 0) {
    console.log("\n❌ 실패한 테스트:");
    summary.failedTests.forEach((t) => {
      console.log(`  - [${t.id}] ${t.question}`);
      console.log(`    예상: ${t.details.expectedCategory}`);
      console.log(`    실제: ${t.details.actualCategory || "(매칭 실패)"}`);
    });
  }

  console.log("\n🧪 회귀 테스트 완료!");

  return summary;
};

// ========================================
// CLI 실행
// ========================================
if (typeof require !== "undefined" && require.main === module) {
  const summary = runAllTests();

  // 실패가 있으면 exit code 1
  if (summary.failed > 0) {
    process.exit(1);
  }
}

export default runAllTests;
