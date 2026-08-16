import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Loader2, MessageCircle, Trash2, AlertCircle, Bot, LogIn } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import Header from "../components/Header";
import { sendEnhancedMessage, isApiKeyConfigured } from "../services/chatService";
import {
  getDailyUsage,
  incrementUsage,
  createChatSession,
  addMessageToSession,
  type UsageInfo,
} from "../services/chatFirebaseService";
import type { EnhancedChatResponse } from "../data/knowledgeSchema";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    sources?: string[];
    confidence?: number;
    tier?: number;
  };
}

// 예시 질문
const exampleQuestions = [
  "음식물 쓰레기 버리는 방법",
  "페트병 분리수거 방법",
  "대형 폐기물 신청 방법",
  "재활용품 배출 요일",
];

const InfoPage: React.FC = () => {
  const navigate = useNavigate();

  // 인증 상태
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = 로딩 중
  const [uid, setUid] = useState<string | null>(null);
  const [profileNo, setProfileNo] = useState<string | null>(null);

  // 사용량 상태
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);

  // 채팅 상태
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 인증 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUid(user.uid);
        // sessionStorage에서 프로필 번호 가져오기
        const storedProfileNo = sessionStorage.getItem("currentProfileNo");
        setProfileNo(storedProfileNo);
      } else {
        setIsLoggedIn(false);
        setUid(null);
        setProfileNo(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 사용량 조회
  useEffect(() => {
    const fetchUsage = async () => {
      if (uid && profileNo) {
        const usage = await getDailyUsage(uid, profileNo);
        setUsageInfo(usage);
      }
    };
    fetchUsage();
  }, [uid, profileNo]);

  // 스크롤을 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 메시지 전송
  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    setError(null);
    setInputValue("");

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);

    try {
      // 첫 메시지인 경우 세션 생성
      let sessionId = currentSessionId;
      if (!sessionId && uid && profileNo) {
        sessionId = await createChatSession(uid, profileNo, messageText);
        setCurrentSessionId(sessionId);
      }

      // 사용량 증가
      if (uid && profileNo) {
        await incrementUsage(uid, profileNo);
        // 사용량 업데이트
        const newUsage = await getDailyUsage(uid, profileNo);
        setUsageInfo(newUsage);
      }

      // 사용자 메시지 저장
      if (uid && profileNo && sessionId) {
        await addMessageToSession(uid, profileNo, sessionId, {
          role: "user",
          content: messageText,
          timestamp: new Date(),
        });
      }

      // Enhanced 메시지 API 호출
      const response: EnhancedChatResponse = await sendEnhancedMessage(messageText);

      // 챗봇 응답 추가
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.answer,
        timestamp: new Date(),
        metadata: {
          sources: response.knowledge_sources,
          confidence: response.confidence?.overall,
          tier: response.confidence?.tier_used,
        },
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // 챗봇 응답 저장
      if (uid && profileNo && sessionId) {
        await addMessageToSession(uid, profileNo, sessionId, {
          role: "assistant",
          content: response.answer,
          timestamp: new Date(),
        });
      }
    } catch (err) {
      console.error("메시지 전송 실패:", err);
      setError(err instanceof Error ? err.message : "메시지 전송에 실패했습니다.");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 대화 초기화
  const handleClear = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setError(null);
  };

  // 예시 질문 클릭
  const handleExampleClick = (question: string) => {
    handleSend(question);
  };

  // Tier 뱃지 색상
  const getTierBadge = (tier?: number) => {
    if (!tier) return null;
    const styles: Record<number, string> = {
      1: "bg-green-100 text-green-600",
      2: "bg-blue-100 text-blue-600",
      3: "bg-orange-100 text-orange-600",
    };
    const labels: Record<number, string> = {
      1: "평택시 조례",
      2: "국가 공식",
      3: "웹 검색",
    };
    return (
      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${styles[tier] || "bg-gray-100 text-gray-600"}`}>
        {labels[tier] || `Tier ${tier}`}
      </span>
    );
  };

  // 로딩 중
  if (isLoggedIn === null) {
    return (
      <div className="flex flex-col h-screen bg-[#F8F9FA] max-w-[430px] mx-auto font-pretendard">
        <Header title="분리수거 도우미" showBack={true} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-green-500" />
        </main>
      </div>
    );
  }

  // 로그인 필요
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-screen bg-[#F8F9FA] max-w-[430px] mx-auto font-pretendard">
        <Header title="분리수거 도우미" showBack={true} />
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm text-center">
            <LogIn size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-black text-gray-800 mb-2">로그인이 필요해요</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              분리수거 도우미는 로그인한 사용자만<br />
              이용할 수 있어요.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-green-500 text-white font-bold px-6 py-3 rounded-2xl active:scale-95 transition-all"
            >
              로그인하러 가기
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 프로필 선택 필요
  if (!profileNo) {
    return (
      <div className="flex flex-col h-screen bg-[#F8F9FA] max-w-[430px] mx-auto font-pretendard">
        <Header title="분리수거 도우미" showBack={true} />
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm text-center">
            <AlertCircle size={48} className="text-orange-400 mx-auto mb-4" />
            <h2 className="text-lg font-black text-gray-800 mb-2">프로필을 선택해주세요</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              챗봇을 사용하려면 먼저<br />
              프로필을 선택해야 해요.
            </p>
            <button
              onClick={() => navigate("/select-profile")}
              className="bg-green-500 text-white font-bold px-6 py-3 rounded-2xl active:scale-95 transition-all"
            >
              프로필 선택하기
            </button>
          </div>
        </main>
      </div>
    );
  }

  // AI 서버 주소 미설정 시 안내
  if (!isApiKeyConfigured()) {
    return (
      <div className="flex flex-col h-screen bg-[#F8F9FA] max-w-[430px] mx-auto font-pretendard">
        <Header title="분리수거 도우미" showBack={true} />
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm text-center">
            <AlertCircle size={48} className="text-orange-400 mx-auto mb-4" />
            <h2 className="text-lg font-black text-gray-800 mb-2">AI 서버 설정이 필요해요</h2>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              챗봇을 사용하려면 AI 프록시 서버 주소가 필요합니다.<br />
              프로젝트 루트에 <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.env</code> 파일을 만들고<br />
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">VITE_CHAT_API_URL=https://...vercel.app/api/chat</code><br />
              형태로 추가해주세요.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] max-w-[430px] mx-auto font-pretendard">
      <Header title="분리수거 도우미" showBack={true} />

      {/* 채팅 영역 */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 환영 메시지 (대화가 없을 때) */}
        {messages.length === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 소개 카드 */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-[28px] p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="font-black text-lg">평택시 분리수거 도우미</h2>
                  <p className="text-xs opacity-80">3단계 지식 시스템 적용</p>
                </div>
              </div>
              <p className="text-sm opacity-90 leading-relaxed">
                헷갈리는 쓰레기, 어디에 버려야 할지 모르겠다면<br />
                저에게 물어보세요! 평택시 조례에 맞게 알려드려요.
              </p>
            </div>

            {/* 지식 시스템 안내 */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                3-Tier Knowledge System
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-green-100 text-green-600 text-[9px] font-black px-2 py-0.5 rounded-md">Tier 1</span>
                  <span className="text-xs text-gray-600 font-medium">평택시 조례 기반 정보</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-md">Tier 2</span>
                  <span className="text-xs text-gray-600 font-medium">국가 공식 가이드</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 text-[9px] font-black px-2 py-0.5 rounded-md">Tier 3</span>
                  <span className="text-xs text-gray-600 font-medium">웹 검색 일반 정보</span>
                </div>
              </div>
            </div>

            {/* 예시 질문 */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
                이런 것도 물어볼 수 있어요
              </p>
              <div className="flex flex-wrap gap-2">
                {exampleQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleExampleClick(q)}
                    className="bg-white px-4 py-2.5 rounded-2xl text-sm font-bold text-gray-600 shadow-sm border border-gray-100 active:scale-95 transition-all hover:border-green-200 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 대화 내용 */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`max-w-[85%] rounded-[20px] px-4 py-3 ${
                message.role === "user"
                  ? "bg-green-500 text-white rounded-br-md"
                  : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                  <MessageCircle size={14} className="text-green-500" />
                  <span className="text-[10px] font-black text-green-500 uppercase">분리수거 도우미</span>
                  {message.metadata?.tier && getTierBadge(message.metadata.tier)}
                </div>
              )}
              <div
                className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  message.role === "assistant" ? "font-medium" : "font-bold"
                }`}
              >
                {message.content}
              </div>
              {message.role === "assistant" && message.metadata?.confidence && (
                <div className="mt-2 pt-2 border-t border-gray-50">
                  <span className="text-[10px] text-gray-400 font-medium">
                    신뢰도: {Math.round(message.metadata.confidence * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 로딩 표시 */}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <div className="bg-white rounded-[20px] rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-green-500" />
                <span className="text-sm text-gray-400 font-bold">답변 생성 중...</span>
              </div>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="flex justify-center animate-in fade-in duration-200">
            <div className="bg-red-50 text-red-600 rounded-2xl px-4 py-3 text-sm font-bold border border-red-100 text-center whitespace-pre-wrap">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* 입력 영역 - 하단 네비게이션 바 공간 확보 */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0 pb-20">
        {/* 대화 초기화 */}
        <div className="flex items-center justify-end mb-3">
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
              새 대화
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="어떤 쓰레기가 헷갈리세요?"
            disabled={isLoading}
            className="flex-1 bg-gray-50 rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 disabled:opacity-50 transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
              inputValue.trim() && !isLoading
                ? "bg-green-500 text-white shadow-lg shadow-green-100"
                : "bg-gray-100 text-gray-300"
            }`}
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
