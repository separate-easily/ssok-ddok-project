import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkProxyToken, methodGuard } from "./_shared";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const MAX_TOKENS_CEILING = 2500;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res)) return;
  if (!checkProxyToken(req, res)) return;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "서버에 OPENAI_API_KEY가 설정되지 않았습니다." });
    return;
  }

  const messages = req.body?.messages as ChatMessage[] | undefined;
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages 배열이 필요합니다." });
    return;
  }

  const requestedMaxTokens = Number(req.body?.maxTokens) || 1500;
  const maxTokens = Math.min(requestedMaxTokens, MAX_TOKENS_CEILING);

  const sanitizedMessages = messages.slice(-30).map((m) => ({
    role: m.role === "system" ? "system" : m.role === "assistant" ? "assistant" : "user",
    content: String(m.content ?? "").slice(0, 8000),
  }));

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
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
        res.status(429).json({
          error: "오늘의 AI 사용량이 모두 소진되었어요. 잠시 후 다시 시도해주세요.",
        });
        return;
      }
      res.status(502).json({ error: "AI 응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요." });
      return;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = data.choices?.[0]?.message?.content?.trim();

    res.status(200).json({
      reply: reply || "죄송해요, 지금은 답변을 만들지 못했어요. 다시 물어봐 주세요!",
    });
  } catch (error) {
    console.error("chat proxy error:", error);
    res.status(502).json({ error: "AI 응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요." });
  }
}
