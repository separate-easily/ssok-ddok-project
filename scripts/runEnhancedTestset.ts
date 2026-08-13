/**
 * Enhanced Chat Testset Runner
 *
 * 3-Tier Knowledge System + RULEBOOK + sendEnhancedMessage() 회귀 테스트
 *
 * 실행 방법:
 *   npx tsx scripts/runEnhancedTestset.ts
 *   또는
 *   npm run test:enhanced
 *
 * 옵션:
 *   --limit=5      처음 5개만 테스트
 *   --ids=1,2,3    특정 ID만 테스트
 *   --verbose      상세 출력
 *   --dry-run      API 호출 없이 구조만 확인
 */

// .env 파일 로딩 (Node.js/tsx 환경용)
import "dotenv/config";

import { TESTSET, type TestCase } from "../src/data/testset";
import { sendEnhancedMessage } from "../src/services/chatService";
import type { EnhancedChatResponse } from "../src/data/knowledgeSchema";

// ==================== Configuration ====================

interface TestConfig {
  limit?: number;
  ids?: number[];
  verbose: boolean;
  dryRun: boolean;
  delayMs: number; // API 호출 간 딜레이 (rate limit 방지)
}

function parseArgs(): TestConfig {
  const args = process.argv.slice(2);
  const config: TestConfig = {
    verbose: false,
    dryRun: false,
    delayMs: 1000, // 기본 1초 딜레이
  };

  for (const arg of args) {
    if (arg.startsWith("--limit=")) {
      config.limit = parseInt(arg.split("=")[1], 10);
    } else if (arg.startsWith("--ids=")) {
      config.ids = arg.split("=")[1].split(",").map(Number);
    } else if (arg === "--verbose" || arg === "-v") {
      config.verbose = true;
    } else if (arg === "--dry-run") {
      config.dryRun = true;
    } else if (arg.startsWith("--delay=")) {
      config.delayMs = parseInt(arg.split("=")[1], 10);
    }
  }

  return config;
}

// ==================== Test Result Types ====================

interface TestResult {
  id: number;
  question: string;
  category: string;
  passed: boolean;
  checks: {
    answerNotEmpty: boolean;
    hasKnowledgeSources: boolean;
    hasReferences: boolean;
    tierConsistent: boolean;
    // 새로 추가된 포맷 검증 (soft check - 실패해도 전체 pass에 영향 없음)
    hasFormatMarkers: boolean;      // 🎯, 📦, 💡 중 최소 하나 포함
    hasTier3SafetyNote: boolean;    // Tier3 사용 시 안전 문장 포함 여부
  };
  response?: EnhancedChatResponse;
  error?: string;
  durationMs?: number;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: string;
  avgDurationMs: number;
  results: TestResult[];
}

// ==================== Validation Functions ====================

/**
 * 응답 구조 검증
 */
function validateResponse(
  testCase: TestCase,
  response: EnhancedChatResponse
): TestResult["checks"] {
  const answer = response.answer || "";

  // 1. answer가 비어 있지 않은지
  const answerNotEmpty =
    typeof response.answer === "string" && response.answer.trim().length > 0;

  // 2. knowledge_sources가 1개 이상인지
  const hasKnowledgeSources =
    Array.isArray(response.knowledge_sources) &&
    response.knowledge_sources.length >= 1;

  // 3. references가 1개 이상인지
  const hasReferences =
    Array.isArray(response.references) && response.references.length >= 1;

  // 4. Tier 일관성 검증
  //    - tier_used === 1 이면 knowledge_sources에 "LOCAL_RULEBOOK" 포함되어야 함
  //    - tier_used === 3 이면 knowledge_sources에 "WEB_GENERAL" 포함되어야 함
  let tierConsistent = true;
  if (response.confidence?.tier_used === 1) {
    tierConsistent = response.knowledge_sources.includes("LOCAL_RULEBOOK");
  } else if (response.confidence?.tier_used === 3) {
    tierConsistent = response.knowledge_sources.includes("WEB_GENERAL");
  }

  // 5. 포맷 마커 검증 (🎯, 📦, 💡, 🤔, 📚 중 최소 하나)
  //    - SYSTEM_PROMPT에서 정의한 답변 형식을 따르는지 확인
  const formatMarkers = ["🎯", "📦", "💡", "🤔", "📚"];
  const hasFormatMarkers = formatMarkers.some((marker) => answer.includes(marker));

  // 6. Tier3 안전 문장 검증
  //    - WEB_GENERAL 사용 시 "웹에서 찾은", "일반적인 정보", "공식 안내" 등의 표현이 있어야 함
  const isTier3 =
    response.knowledge_sources?.includes("WEB_GENERAL") ||
    response.confidence?.tier_used === 3;

  let hasTier3SafetyNote = true; // Tier3가 아니면 기본값 true
  if (isTier3) {
    const safetyPhrases = [
      "웹에서 찾은",
      "웹에서 검색한",
      "일반적인 정보",
      "공식 안내",
      "자원순환과",
      "확인해 주세요",
      "확인해주세요",
    ];
    hasTier3SafetyNote = safetyPhrases.some((phrase) => answer.includes(phrase));
  }

  return {
    answerNotEmpty,
    hasKnowledgeSources,
    hasReferences,
    tierConsistent,
    hasFormatMarkers,
    hasTier3SafetyNote,
  };
}

/**
 * TODO: 기대 요약과의 유사도 비교 hook
 *
 * 향후 확장 시 여기에 다음 기능을 추가할 수 있음:
 * - 키워드 매칭 (expectedSummary의 핵심 단어가 answer에 포함되는지)
 * - 임베딩 기반 유사도 (OpenAI embedding API 사용)
 * - 카테고리 일치 여부 (response.matched_rule_id의 category와 testCase.category 비교)
 */
function checkSimilarity(
  _testCase: TestCase,
  _response: EnhancedChatResponse
): { score: number; details: string } {
  // TODO: 유사도 비교 로직 구현
  // 현재는 placeholder만 반환
  return {
    score: -1, // -1은 "미구현"을 의미
    details: "유사도 비교 미구현 (TODO)",
  };
}

/**
 * TODO: 카테고리 일치 여부 검증 hook
 *
 * testCase.category와 실제 매칭된 규칙의 category를 비교
 */
function checkCategoryMatch(
  _testCase: TestCase,
  _response: EnhancedChatResponse
): boolean {
  // TODO: 카테고리 일치 검증 로직
  // response.metadata.matched_rule_id를 통해 규칙을 찾고,
  // 해당 규칙의 category와 testCase.category를 비교
  return true; // 현재는 항상 pass
}

// ==================== Test Runner ====================

async function runSingleTest(
  testCase: TestCase,
  config: TestConfig
): Promise<TestResult> {
  const startTime = Date.now();

  if (config.dryRun) {
    // Dry run: API 호출 없이 구조만 확인
    return {
      id: testCase.id,
      question: testCase.question,
      category: testCase.category,
      passed: true,
      checks: {
        answerNotEmpty: true,
        hasKnowledgeSources: true,
        hasReferences: true,
        tierConsistent: true,
        hasFormatMarkers: true,
        hasTier3SafetyNote: true,
      },
      durationMs: 0,
    };
  }

  try {
    const response = await sendEnhancedMessage(testCase.question);
    const durationMs = Date.now() - startTime;

    const checks = validateResponse(testCase, response);

    // 핵심 체크만 pass/fail 판정에 사용 (포맷 체크는 soft warning)
    const coreChecks = {
      answerNotEmpty: checks.answerNotEmpty,
      hasKnowledgeSources: checks.hasKnowledgeSources,
      hasReferences: checks.hasReferences,
      tierConsistent: checks.tierConsistent,
    };
    const passed = Object.values(coreChecks).every(Boolean);

    // 포맷 체크 경고 출력 (soft warning)
    if (!checks.hasFormatMarkers) {
      console.log(`  ⚠️ [Format Warning] 응답에 포맷 마커(🎯/📦/💡/🤔/📚)가 없음`);
    }
    if (!checks.hasTier3SafetyNote && response.knowledge_sources?.includes("WEB_GENERAL")) {
      console.log(`  ⚠️ [Format Warning] Tier3 사용 시 안전 문장이 누락됨`);
    }

    // TODO hooks 실행 (현재는 로깅만)
    if (config.verbose) {
      const similarity = checkSimilarity(testCase, response);
      const categoryMatch = checkCategoryMatch(testCase, response);
      console.log(`  [Hook] Similarity: ${similarity.details}`);
      console.log(`  [Hook] Category match: ${categoryMatch}`);
      console.log(`  [Format] Markers: ${checks.hasFormatMarkers ? "✓" : "✗"}, Tier3 Safety: ${checks.hasTier3SafetyNote ? "✓" : "N/A or ✗"}`);
    }

    return {
      id: testCase.id,
      question: testCase.question,
      category: testCase.category,
      passed,
      checks,
      response,
      durationMs,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    return {
      id: testCase.id,
      question: testCase.question,
      category: testCase.category,
      passed: false,
      checks: {
        answerNotEmpty: false,
        hasKnowledgeSources: false,
        hasReferences: false,
        tierConsistent: false,
        hasFormatMarkers: false,
        hasTier3SafetyNote: false,
      },
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    };
  }
}

async function runAllTests(config: TestConfig): Promise<TestSummary> {
  // 테스트 대상 필터링
  let testCases = [...TESTSET];

  if (config.ids && config.ids.length > 0) {
    testCases = testCases.filter((tc) => config.ids!.includes(tc.id));
  }

  if (config.limit && config.limit > 0) {
    testCases = testCases.slice(0, config.limit);
  }

  console.log("\n========================================");
  console.log("Enhanced Chat Testset Runner");
  console.log("========================================");
  console.log(`Total test cases: ${testCases.length}`);
  console.log(`Mode: ${config.dryRun ? "DRY RUN" : "LIVE (API calls)"}`);
  console.log(`Verbose: ${config.verbose}`);
  console.log("========================================\n");

  const results: TestResult[] = [];
  let passedCount = 0;
  let failedCount = 0;
  let totalDurationMs = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const progress = `[${i + 1}/${testCases.length}]`;

    process.stdout.write(`${progress} Testing #${tc.id}: "${tc.question.substring(0, 30)}..." `);

    const result = await runSingleTest(tc, config);
    results.push(result);

    if (result.passed) {
      passedCount++;
      console.log(`✓ PASS (${result.durationMs}ms)`);
    } else {
      failedCount++;
      console.log(`✗ FAIL (${result.durationMs}ms)`);

      // 실패 시 상세 정보 출력
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      } else {
        const failedChecks = Object.entries(result.checks)
          .filter(([, v]) => !v)
          .map(([k]) => k);
        console.log(`  Failed checks: ${failedChecks.join(", ")}`);
      }
    }

    // Verbose 모드: 응답 상세 출력
    if (config.verbose && result.response) {
      console.log(`  Tier: ${result.response.confidence?.tier_used}`);
      console.log(`  Confidence: ${(result.response.confidence?.overall * 100).toFixed(0)}%`);
      console.log(`  Sources: ${result.response.knowledge_sources?.join(", ")}`);
      console.log(`  Rule ID: ${result.response.metadata?.matched_rule_id || "N/A"}`);
      console.log(`  Answer preview: ${result.response.answer?.substring(0, 100)}...`);
      console.log("");
    }

    totalDurationMs += result.durationMs || 0;

    // Rate limit 방지를 위한 딜레이
    if (!config.dryRun && i < testCases.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, config.delayMs));
    }
  }

  const summary: TestSummary = {
    total: testCases.length,
    passed: passedCount,
    failed: failedCount,
    skipped: TESTSET.length - testCases.length,
    passRate: ((passedCount / testCases.length) * 100).toFixed(1) + "%",
    avgDurationMs: Math.round(totalDurationMs / testCases.length),
    results,
  };

  return summary;
}

// ==================== Report Generation ====================

function printSummary(summary: TestSummary): void {
  console.log("\n========================================");
  console.log("TEST SUMMARY");
  console.log("========================================");
  console.log(`Total:    ${summary.total}`);
  console.log(`Passed:   ${summary.passed} ✓`);
  console.log(`Failed:   ${summary.failed} ✗`);
  console.log(`Skipped:  ${summary.skipped}`);
  console.log(`Pass Rate: ${summary.passRate}`);
  console.log(`Avg Duration: ${summary.avgDurationMs}ms`);
  console.log("========================================");

  // 실패한 테스트 상세
  const failedResults = summary.results.filter((r) => !r.passed);
  if (failedResults.length > 0) {
    console.log("\nFailed Tests:");
    console.log("----------------------------------------");
    for (const result of failedResults) {
      console.log(`#${result.id}: ${result.question}`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      } else {
        const failedChecks = Object.entries(result.checks)
          .filter(([, v]) => !v)
          .map(([k]) => k);
        console.log(`  Failed: ${failedChecks.join(", ")}`);
      }
    }
  }

  // 카테고리별 통계
  console.log("\nResults by Category:");
  console.log("----------------------------------------");
  const byCategory = new Map<string, { passed: number; total: number }>();
  for (const result of summary.results) {
    const cat = result.category;
    if (!byCategory.has(cat)) {
      byCategory.set(cat, { passed: 0, total: 0 });
    }
    const stats = byCategory.get(cat)!;
    stats.total++;
    if (result.passed) stats.passed++;
  }
  for (const [category, stats] of byCategory) {
    const rate = ((stats.passed / stats.total) * 100).toFixed(0);
    console.log(`  ${category}: ${stats.passed}/${stats.total} (${rate}%)`);
  }

  console.log("\n========================================");
  if (summary.failed === 0) {
    console.log("All tests passed! ✓");
  } else {
    console.log(`${summary.failed} test(s) failed. Please review.`);
  }
  console.log("========================================\n");
}

// ==================== Main ====================

async function main(): Promise<void> {
  const config = parseArgs();

  // 환경 체크
  if (!config.dryRun) {
    // AI 호출은 Vercel 프록시 서버를 거친다 (OpenAI 키는 그 서버에만 존재)
    const chatApiUrl = process.env.VITE_CHAT_API_URL;
    if (!chatApiUrl) {
      console.error("Error: VITE_CHAT_API_URL environment variable is not set.");
      console.error("Set it in .env file or export it before running.");
      console.error("  예) VITE_CHAT_API_URL=https://ssok-ddok-api.vercel.app/api/chat");
      console.error("\nTip: Use --dry-run to test without API calls.");
      process.exit(1);
    }
  }

  try {
    const summary = await runAllTests(config);
    printSummary(summary);

    // Exit code: 실패한 테스트가 있으면 1
    process.exit(summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main();
