/**
 * 헬스 체크
 *
 * 배포가 살아있는지, 키가 등록됐는지 브라우저에서 바로 확인하기 위한 엔드포인트.
 * 키 값 자체는 절대 반환하지 않고 설정 여부(boolean)만 알려준다.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "./_lib/cors.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;

  return res.status(200).json({
    ok: true,
    hasApiKey: Boolean(process.env.OPENAI_API_KEY),
    time: new Date().toISOString(),
  });
}
