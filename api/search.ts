import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkProxyToken, methodGuard } from "./_shared";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res)) return;
  if (!checkProxyToken(req, res)) return;

  const apiKey = process.env.SEARCH_API_KEY;
  const searchEngineId = process.env.SEARCH_ENGINE_ID;
  if (!apiKey || !searchEngineId) {
    res.status(500).json({ error: "서버에 SEARCH_API_KEY/SEARCH_ENGINE_ID가 설정되지 않았습니다." });
    return;
  }

  const query = String(req.body?.query ?? "").trim().slice(0, 300);
  if (!query) {
    res.status(400).json({ error: "검색어가 필요합니다." });
    return;
  }

  const params = new URLSearchParams({
    key: apiKey,
    cx: searchEngineId,
    q: query,
    num: "5",
    lr: "lang_ko",
    gl: "kr",
  });

  try {
    const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Search API error:", response.status, errorText);
      res.status(502).json({ error: "검색 결과를 가져오지 못했습니다." });
      return;
    }

    const data = (await response.json()) as {
      items?: Array<{ title: string; link: string; displayLink: string; snippet: string }>;
    };

    res.status(200).json({ items: data.items ?? [] });
  } catch (error) {
    console.error("search proxy error:", error);
    res.status(502).json({ error: "검색 결과를 가져오지 못했습니다." });
  }
}
