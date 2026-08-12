import React, { useState } from "react";
import { Lock, KeyRound } from "lucide-react";
import { CHATBOT_ACCESS_CODE } from "../constants/chatAccess";
import Header from "./Header";

interface ChatbotAccessGateProps {
  onUnlocked: () => void;
}

/**
 * 챗봇 접근 잠금 화면
 * - 암호 입력 시 정확히 일치해야만 해제
 * - trim() 등 변형 없이 단순 문자열 비교
 */
const ChatbotAccessGate: React.FC<ChatbotAccessGateProps> = ({ onUnlocked }) => {
  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    // 정확한 문자열 비교 (변형 없음)
    if (codeInput === CHATBOT_ACCESS_CODE) {
      setError(null);
      onUnlocked();
    } else {
      setError("암호가 틀렸습니다. 다시 입력해 주세요.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] max-w-[430px] mx-auto font-pretendard">
      <Header title="분리수거 도우미" showBack={true} />

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-[32px] p-8 shadow-sm w-full max-w-[360px]">
          {/* 아이콘 */}
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-green-500" />
          </div>

          {/* 제목 */}
          <h2 className="text-lg font-black text-gray-800 text-center mb-2">
            챗봇 접근 암호를 입력해 주세요.
          </h2>

          {/* 설명 */}
          <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
            심사위원님과 담당자님만<br />
            사용 가능한 기능입니다.
          </p>

          {/* 입력 필드 */}
          <div className="relative mb-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <KeyRound size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value);
                setError(null); // 입력 시 에러 초기화
              }}
              onKeyPress={handleKeyPress}
              placeholder="암호를 입력하세요"
              className="w-full bg-gray-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
              autoFocus
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 text-red-600 rounded-xl px-4 py-2.5 text-sm font-bold text-center mb-4 border border-red-100">
              {error}
            </div>
          )}

          {/* 확인 버튼 */}
          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-green-500 text-white rounded-2xl font-black text-base shadow-lg shadow-green-100 active:scale-95 transition-all"
          >
            확인
          </button>
        </div>
      </main>

      {/* 하단 여백 (네비게이션 바 공간) */}
      <div className="h-20" />
    </div>
  );
};

export default ChatbotAccessGate;
