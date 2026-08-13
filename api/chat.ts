/**
 * OpenAI 채팅 프록시
 *
 * 프런트엔드(카페24)는 이 엔드포인트만 호출한다.
 * OPENAI_API_KEY는 Vercel 환경 변수에만 존재하므로 브라우저 번들에 포함되지 않는다.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "./_lib/cors";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// 모델은 서버가 고정한다. 프런트가 지정하게 두면 엔드포인트를 아는 사람이
// 더 비싼 모델을 호출해 비용을 발생시킬 수 있다.
const OPENAI_MODEL = "gpt-4o-mini";

const REQUEST_TIMEOUT = 30000; // 30초

// 프런트에서 넘어온 값은 그대로 믿지 않고 허용 범위로 자른다
const MAX_MESSAGES = 40;
const MAX_TOTAL_CHARS = 60000;
const MAX_TOKENS_LIMIT = 2000;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * messages 배열이 OpenAI에 보낼 수 있는 형태인지 검사한다.
 * 문제가 있으면 사용자에게 보여줄 한글 메시지를 반환한다.
 */
const validateMessages = (messages: unknown): string | null => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "messages 배열이 필요합니다.";
  }

  if (messages.length > MAX_MESSAGES) {
    return "대화가 너무 깁니다. 대화를 초기화하고 다시 시도해 주세요.";
  }

  const validRoles = ["system", "user", "assistant"];
  let totalChars = 0;

  for (const message of messages as ChatMessage[]) {
    if (!message || typeof message.content !== "string" || !validRoles.includes(message.role)) {
      return "messages 형식이 올바르지 않습니다.";
    }
    totalChars += message.content.length;
  }

  if (totalChars > MAX_TOTAL_CHARS) {
    return "질문이 너무 깁니다. 조금 더 짧게 물어봐 주세요.";
  }

  return null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 프리플라이트는 여기서 종료된다
  if (applyCors(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: { message: "POST 요청만 지원합니다." } });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: {
        message:
          "서버에 OPENAI_API_KEY가 설정되지 않았습니다. Vercel 환경 변수를 확인해 주세요.",
      },
    });
  }

  // Vercel은 application/json 요청을 자동 파싱하지만, 문자열로 들어오는 경우도 방어한다
  let body: Record<string, unknown>;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
  } catch {
    return res.status(400).json({ error: { message: "요청 본문을 해석할 수 없습니다." } });
  }

  const { messages, temperature, max_tokens } = body as {
    messages?: unknown;
    temperature?: unknown;
    max_tokens?: unknown;
  };

  const validationError = validateMessages(messages);
  if (validationError) {
    return res.status(400).json({ error: { message: validationError } });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const upstream = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        temperature: typeof temperature === "number" ? temperature : 0.7,
        max_tokens: Math.min(
          typeof max_tokens === "number" ? max_tokens : 1500,
          MAX_TOKENS_LIMIT
        ),
      }),
      signal: controller.signal,
    });

    const data = await upstream.json().catch(() => ({}));

    // 401은 서버의 키 설정 문제다. 프런트에는 키 상태를 그대로 노출하지 않는다.
    if (upstream.status === 401) {
      console.error("[chat] OpenAI 인증 실패 - OPENAI_API_KEY를 확인하세요");
      return res
        .status(500)
        .json({ error: { message: "서버의 API 키 설정에 문제가 있습니다." } });
    }

    return res.status(upstream.status).json(data);
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    console.error("[chat] OpenAI 호출 실패:", error);

    return res.status(aborted ? 504 : 502).json({
      error: {
        message: aborted
          ? "요청 시간이 초과되었습니다. 다시 시도해 주세요."
          : "AI 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
