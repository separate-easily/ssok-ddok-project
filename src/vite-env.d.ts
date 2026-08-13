/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  /** AI 프록시 서버 주소 (Vercel). OpenAI 키는 이 서버에만 존재한다. */
  readonly VITE_CHAT_API_URL: string;
  readonly VITE_SEARCH_API_KEY: string;
  readonly VITE_SEARCH_ENGINE_ID: string;
  readonly VITE_ENABLE_WEB_SEARCH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
