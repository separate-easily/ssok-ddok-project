import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * 아주 낮은 수준의 접근 제어.
 * - 진짜 보안 경계는 앱 쪽의 로그인 + 챗봇 암호 게이트 + 하루 3회 제한이다.
 * - 이 토큰은 "URL만 아는 봇/크롤러가 무작위로 두드리는 것"을 막는 최소한의 장치이며,
 *   VITE_ 접두사로 클라이언트 번들에 포함되므로 진짜 비밀은 아니다.
 */
export function checkProxyToken(req: VercelRequest, res: VercelResponse): boolean {
  const expected = process.env.PROXY_ACCESS_TOKEN;
  const provided = req.headers["x-proxy-token"];

  if (!expected || provided !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

export function methodGuard(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return false;
  }
  return true;
}
