import { defineConfig, loadEnv, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'

/**
 * 개발 서버에서 Vercel 서버리스 함수(api/*.ts)를 흉내내는 플러그인
 *
 * 프로덕션에서는 Vercel이 api/ 폴더를 서버리스 함수로 실행하지만
 * vite dev는 그렇지 않다. 그래서 /api/* 요청이 오면 같은 핸들러 파일을
 * 불러와 미들웨어로 실행한다. 덕분에 `npm run dev`만으로 챗봇이 동작한다.
 */
function vercelApiDevServer(): Plugin {
  return {
    name: 'vercel-api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? ''
        if (!url.startsWith('/api/')) return next()

        const route = url.split('?')[0].replace(/\/+$/, '')

        try {
          const module = await server.ssrLoadModule(`.${route}.ts`)
          const handler = module.default

          if (typeof handler !== 'function') {
            throw new Error(`${route}.ts에 default export 핸들러가 없습니다`)
          }

          await handler(await toVercelRequest(req, url), toVercelResponse(res))
        } catch (error) {
          server.config.logger.error(`[api dev] ${route} 처리 실패: ${error}`)
          if (!res.writableEnded) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: { message: '개발 서버에서 API 처리에 실패했습니다. 터미널 로그를 확인하세요.' },
              })
            )
          }
        }
      })
    },
  }
}

/** Vercel은 JSON 본문을 파싱해서 넘겨주므로 개발 서버에서도 동일하게 맞춘다 */
async function toVercelRequest(req: IncomingMessage, url: string) {
  const raw = await readRequestBody(req)

  let body: unknown = undefined
  if (raw) {
    // 파싱에 실패하면 원문 문자열을 그대로 넘긴다 (핸들러가 양쪽 모두 처리한다)
    try {
      body = JSON.parse(raw)
    } catch {
      body = raw
    }
  }

  return Object.assign(req, {
    query: Object.fromEntries(new URL(url, 'http://localhost').searchParams),
    body,
  })
}

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', reject)
  })
}

/** Vercel 핸들러가 쓰는 res.status().json() 체인을 흉내낸다 */
function toVercelResponse(res: ServerResponse) {
  const wrapped = Object.assign(res, {
    status(code: number) {
      res.statusCode = code
      return wrapped
    },
    json(payload: unknown) {
      if (!res.writableEnded) {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(payload))
      }
      return wrapped
    },
  })
  return wrapped
}

export default defineConfig(({ mode }) => {
  // 접두사 없이 .env 전체를 읽어 서버 전용 키를 개발 서버 프로세스에 주입한다.
  // VITE_ 접두사가 없는 값은 클라이언트 번들에 포함되지 않는다.
  const env = loadEnv(mode, process.cwd(), '')
  if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY
  if (env.ALLOWED_ORIGINS) process.env.ALLOWED_ORIGINS = env.ALLOWED_ORIGINS

  return {
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
      vercelApiDevServer(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
