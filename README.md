# 쏙쏙 분리 똑똑 분리

평택시 폐기물 조례 기반 분리수거 안내 챗봇 + 게임 웹앱.

## 구조

프런트엔드와 AI 프록시가 **한 프로젝트에 들어 있고 Vercel에 한 번에 배포**됩니다.

```
ssok-ddok-project/
├─ src/          프런트엔드 (React + Vite)  →  정적 파일로 빌드
└─ api/          서버리스 함수              →  Vercel Functions로 실행
   ├─ chat.ts        POST /api/chat    OpenAI 프록시
   ├─ health.ts      GET  /api/health  배포·키 등록 확인
   └─ _lib/cors.ts   CORS 처리
```

```
[브라우저]  fetch("/api/chat")        ← 같은 도메인이라 CORS 불필요
    ▼
[api/chat.ts]  OPENAI_API_KEY 부착    ← 서버에만 존재
    ▼
[OpenAI]
```

**OpenAI API 키는 브라우저로 내려가지 않습니다.** `OPENAI_API_KEY`에는 `VITE_`
접두사가 없어서 클라이언트 번들에 포함되지 않고, 서버리스 함수만 읽을 수 있습니다.

> `VITE_` 접두사가 붙은 값은 전부 빌드 결과물에 그대로 박힙니다. 비밀로 유지해야 하는
> 값에는 절대 `VITE_`를 붙이지 마세요.

## 로컬 개발

```bash
npm install
cp .env.example .env    # OPENAI_API_KEY 등 채우기
npm run dev
```

`vite.config.ts`의 `vercelApiDevServer` 플러그인이 개발 서버에서 `api/*.ts`를
서버리스 함수처럼 실행해 줍니다. `vercel dev` 없이 `npm run dev`만으로 챗봇이 동작합니다.

## 배포 (Vercel)

```bash
npx vercel login
npx vercel --prod
```

배포 후 **Vercel 대시보드 → Settings → Environment Variables** 에 아래를 등록합니다.
등록한 뒤에는 **재배포해야 반영**됩니다.

| 이름 | 필수 | 설명 |
|---|---|---|
| `OPENAI_API_KEY` | ✅ | OpenAI API 키 (서버 전용) |
| `VITE_FIREBASE_*` | ✅ | Firebase 웹 설정값 (공개되는 값) |
| `VITE_SEARCH_API_KEY` | — | Google Custom Search 키 |
| `VITE_SEARCH_ENGINE_ID` | — | Google Custom Search 엔진 ID |
| `ALLOWED_ORIGINS` | — | CORS 허용 도메인. 같은 도메인이면 불필요 |

배포 확인: `https://주소/api/health` 에서 `"hasApiKey": true` 가 나오면 정상입니다.

### 카페24 도메인 연결

Vercel 대시보드 → Settings → Domains 에 도메인을 추가하면 DNS 레코드를 알려줍니다.
그 값을 카페24 DNS 관리에 등록하면 됩니다.

## API 명세

### `POST /api/chat`

```jsonc
// 요청
{ "messages": [{ "role": "user", "content": "치킨 뼈는 어디에 버려요?" }] }

// 응답 — OpenAI Chat Completions 응답을 그대로 전달
{ "choices": [{ "message": { "role": "assistant", "content": "..." } }] }

// 에러 — 항상 이 형태
{ "error": { "message": "사용자에게 보여줄 한글 메시지" } }
```

서버가 고정하는 값(프런트가 바꿀 수 없음): 모델 `gpt-4o-mini`, `max_tokens` 최대 2000,
메시지 40개 / 전체 6만 자 상한. 엔드포인트를 알아낸 사람이 더 비싼 모델을 호출하거나
긴 프롬프트로 비용을 발생시키는 것을 막습니다.

| 상태 | 의미 |
|---|---|
| 400 | messages 형식 오류 / 대화가 너무 김 |
| 405 | POST가 아님 |
| 429 | OpenAI 사용량 초과 |
| 500 | 서버의 API 키 문제 (키 상태는 노출하지 않음) |
| 502 | OpenAI 연결 실패 |
| 503 | `OPENAI_API_KEY` 미설정 |
| 504 | 30초 타임아웃 |

## 테스트

```bash
npm run test:enhanced:dry   # API 호출 없이 라우팅 구조만 검증
npm run test:enhanced       # 실제 호출 (.env에 VITE_CHAT_API_URL 절대 주소 필요)
```

Node 스크립트는 상대 경로(`/api/chat`)를 쓸 수 없어서, 실제 호출 테스트에는
`.env`에 배포된 절대 주소를 넣어야 합니다.

## 남아있는 보안 항목

- **Google Custom Search 키**(`VITE_SEARCH_API_KEY`)는 설계상 브라우저에 노출됩니다.
  Google Cloud Console → 사용자 인증 정보 → 해당 키 → **애플리케이션 제한사항: HTTP 리퍼러**에
  배포 도메인과 `localhost:5173`을 등록하고, **API 제한사항**은 Custom Search API만 선택하세요.
- **Firebase 웹 config**는 원래 공개되는 값이라 조치가 필요 없습니다. 보안은 Firestore 규칙으로 합니다.
- `/api/chat`에는 인증·레이트리밋이 없습니다. 필요해지면 `ALLOWED_ORIGINS` 설정과
  OpenAI 대시보드의 **월 예산 한도(Limits)** 를 먼저 걸어두세요.
