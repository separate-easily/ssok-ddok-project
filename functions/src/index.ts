import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const openaiApiKey = defineSecret("OPENAI_API_KEY");
const searchApiKey = defineSecret("SEARCH_API_KEY");
const searchEngineId = defineSecret("SEARCH_ENGINE_ID");

const REGION = "asia-northeast3";
const MAX_TOKENS_CEILING = 2500;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * OpenAI Chat Completions 프록시
 * - 프론트엔드는 이미 조립된 messages 배열(시스템 프롬프트 + 룰북 컨텍스트 포함)을 그대로 전달
 * - API 키는 여기(서버)에만 존재하며 클라이언트로 절대 전달되지 않음
 */
export const chatWithAI = onCall(
  { secrets: [openaiApiKey], region: REGION },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "로그인 후 이용할 수 있습니다.");
    }

    const messages = request.data?.messages as ChatMessage[] | undefined;
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new HttpsError("invalid-argument", "messages 배열이 필요합니다.");
    }

    const requestedMaxTokens = Number(request.data?.maxTokens) || 1500;
    const maxTokens = Math.min(requestedMaxTokens, MAX_TOKENS_CEILING);

    const sanitizedMessages = messages
      .slice(-30)
      .map((m) => ({
        role: m.role === "system" ? ("system" as const) : m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: String(m.content ?? "").slice(0, 8000),
      }));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey.value()}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: sanitizedMessages,
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);

      if (response.status === 429) {
        throw new HttpsError(
          "resource-exhausted",
          "오늘의 AI 사용량이 모두 소진되었어요. 잠시 후 다시 시도해주세요."
        );
      }
      throw new HttpsError("internal", "AI 응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.");
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = data.choices?.[0]?.message?.content?.trim();

    return { reply: reply || "죄송해요, 지금은 답변을 만들지 못했어요. 다시 물어봐 주세요!" };
  }
);

/**
 * Google Custom Search 프록시
 * - 정렬/필터링/신뢰도 평가 등은 클라이언트(webSearchService.ts)에서 그대로 수행
 * - 여기서는 순수 검색 결과(raw items)만 반환
 */
export const googleSearchProxy = onCall(
  { secrets: [searchApiKey, searchEngineId], region: REGION },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "로그인 후 이용할 수 있습니다.");
    }

    const query = String(request.data?.query ?? "").trim().slice(0, 300);
    if (!query) {
      throw new HttpsError("invalid-argument", "검색어가 필요합니다.");
    }

    const params = new URLSearchParams({
      key: searchApiKey.value(),
      cx: searchEngineId.value(),
      q: query,
      num: "5",
      lr: "lang_ko",
      gl: "kr",
    });

    const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Search API error:", response.status, errorText);
      throw new HttpsError("internal", "검색 결과를 가져오지 못했습니다.");
    }

    const data = (await response.json()) as {
      items?: Array<{ title: string; link: string; displayLink: string; snippet: string }>;
    };

    return { items: data.items ?? [] };
  }
);
