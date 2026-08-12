/**
 * Firebase 설정 및 초기화
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);
// chatWithAI / googleSearchProxy Functions와 동일한 리전으로 맞춰야 한다 (functions/src/index.ts REGION 참고)
export const functions = getFunctions(app, "asia-northeast3");

export default app;
