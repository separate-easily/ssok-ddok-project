/**
 * 챗봇 Firebase 서비스
 * - 채팅 기록 저장/불러오기
 * - 일일 사용량 추적
 */

import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// ========================================
// 설정
// ========================================
const DAILY_LIMIT = 3; // 하루 최대 질문 수

// ========================================
// 타입 정의
// ========================================
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string; // 첫 번째 질문 미리보기
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
  canUse: boolean;
}

// ========================================
// 날짜 유틸리티
// ========================================
const getTodayKey = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

// ========================================
// 사용량 관리
// ========================================

/**
 * 오늘의 사용량 조회
 */
export const getDailyUsage = async (
  uid: string,
  profileNo: string
): Promise<UsageInfo> => {
  try {
    const todayKey = getTodayKey();
    const usageRef = doc(
      db,
      "users",
      uid,
      "profiles",
      profileNo,
      "chatUsage",
      todayKey
    );
    const usageSnap = await getDoc(usageRef);

    const used = usageSnap.exists() ? (usageSnap.data().count || 0) : 0;

    return {
      used,
      limit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - used),
      canUse: used < DAILY_LIMIT,
    };
  } catch (error) {
    console.error("[ChatFirebase] 사용량 조회 실패:", error);
    // 에러 시 사용 허용 (사용자 경험 우선)
    return {
      used: 0,
      limit: DAILY_LIMIT,
      remaining: DAILY_LIMIT,
      canUse: true,
    };
  }
};

/**
 * 사용량 증가 (질문 전송 시 호출)
 */
export const incrementUsage = async (
  uid: string,
  profileNo: string
): Promise<void> => {
  try {
    const todayKey = getTodayKey();
    const usageRef = doc(
      db,
      "users",
      uid,
      "profiles",
      profileNo,
      "chatUsage",
      todayKey
    );

    await setDoc(
      usageRef,
      {
        count: increment(1),
        lastUsed: serverTimestamp(),
      },
      { merge: true }
    );

    console.log("[ChatFirebase] 사용량 증가 완료");
  } catch (error) {
    console.error("[ChatFirebase] 사용량 증가 실패:", error);
  }
};

// ========================================
// 채팅 기록 관리
// ========================================

/**
 * 새 채팅 세션 생성
 */
export const createChatSession = async (
  uid: string,
  profileNo: string,
  firstMessage: string
): Promise<string> => {
  try {
    const sessionId = `chat_${Date.now()}`;
    const sessionRef = doc(
      db,
      "users",
      uid,
      "profiles",
      profileNo,
      "chatHistory",
      sessionId
    );

    await setDoc(sessionRef, {
      title: firstMessage.slice(0, 30) + (firstMessage.length > 30 ? "..." : ""),
      messages: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("[ChatFirebase] 채팅 세션 생성:", sessionId);
    return sessionId;
  } catch (error) {
    console.error("[ChatFirebase] 채팅 세션 생성 실패:", error);
    throw error;
  }
};

/**
 * 채팅 메시지 추가
 */
export const addMessageToSession = async (
  uid: string,
  profileNo: string,
  sessionId: string,
  message: ChatMessage
): Promise<void> => {
  try {
    const sessionRef = doc(
      db,
      "users",
      uid,
      "profiles",
      profileNo,
      "chatHistory",
      sessionId
    );

    const sessionSnap = await getDoc(sessionRef);
    if (!sessionSnap.exists()) {
      throw new Error("세션을 찾을 수 없습니다.");
    }

    const currentMessages = sessionSnap.data().messages || [];
    currentMessages.push({
      role: message.role,
      content: message.content,
      timestamp: Timestamp.fromDate(message.timestamp),
    });

    await setDoc(
      sessionRef,
      {
        messages: currentMessages,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log("[ChatFirebase] 메시지 추가 완료");
  } catch (error) {
    console.error("[ChatFirebase] 메시지 추가 실패:", error);
  }
};

/**
 * 채팅 기록 목록 조회 (최근 20개)
 */
export const getChatHistory = async (
  uid: string,
  profileNo: string
): Promise<ChatSession[]> => {
  try {
    const historyRef = collection(
      db,
      "users",
      uid,
      "profiles",
      profileNo,
      "chatHistory"
    );
    const q = query(historyRef, orderBy("createdAt", "desc"), limit(20));
    const snapshot = await getDocs(q);

    const sessions: ChatSession[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      sessions.push({
        id: doc.id,
        title: data.title || "제목 없음",
        messages: (data.messages || []).map((m: any) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp?.toDate() || new Date(),
        })),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });

    return sessions;
  } catch (error) {
    console.error("[ChatFirebase] 채팅 기록 조회 실패:", error);
    return [];
  }
};

/**
 * 특정 채팅 세션 조회
 */
export const getChatSession = async (
  uid: string,
  profileNo: string,
  sessionId: string
): Promise<ChatSession | null> => {
  try {
    const sessionRef = doc(
      db,
      "users",
      uid,
      "profiles",
      profileNo,
      "chatHistory",
      sessionId
    );
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      return null;
    }

    const data = sessionSnap.data();
    return {
      id: sessionSnap.id,
      title: data.title || "제목 없음",
      messages: (data.messages || []).map((m: any) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp?.toDate() || new Date(),
      })),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error("[ChatFirebase] 채팅 세션 조회 실패:", error);
    return null;
  }
};

// 일일 한도 상수 내보내기
export const CHAT_DAILY_LIMIT = DAILY_LIMIT;
