/**
 * CORS 처리
 *
 * 프런트엔드와 이 API는 같은 Vercel 배포에 들어 있어 보통은 동일 출처다.
 * (동일 출처 요청에는 CORS 헤더가 필요 없다)
 * 다만 프리뷰 배포나 다른 도메인에서 호출할 때를 대비해 헤더를 붙여 둔다.
 *
 * ALLOWED_ORIGINS 환경 변수에 쉼표로 구분해 허용 도메인을 지정한다.
 *   예) https://내도메인.co.kr,http://localhost:5173
 * 설정하지 않으면 모든 도메인을 허용한다(프로토타입 기본값).
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

const parseAllowedOrigins = (): string[] =>
  (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

/**
 * 응답에 CORS 헤더를 붙인다.
 *
 * @returns 프리플라이트(OPTIONS) 요청이라 이미 응답을 끝냈으면 true.
 *          이 경우 호출한 핸들러는 즉시 return 해야 한다.
 */
export const applyCors = (req: VercelRequest, res: VercelResponse): boolean => {
  const allowedOrigins = parseAllowedOrigins();
  const origin = req.headers.origin;

  if (allowedOrigins.length === 0) {
    // 허용 목록 미설정 = 전체 허용
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (origin && allowedOrigins.includes(origin.replace(/\/$/, ""))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    // 도메인마다 응답이 달라지므로 캐시가 섞이지 않도록 알려준다
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  return false;
};
