import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, MessageCircleMore } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../firebase';
import Header from '../components/Header';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const chatWithAI = httpsCallable<{ messages: ChatMessage[] }, { reply: string }>(
  functions,
  'chatWithAI'
);

const InfoPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setIsSending(true);

    try {
      const result = await chatWithAI({ messages: nextMessages });
      setMessages((prev) => [...prev, { role: 'assistant', content: result.data.reply }]);
    } catch (err: any) {
      console.error('챗봇 응답 실패:', err);
      setError(err?.message || '답변을 가져오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoggedIn === null) return null;

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F9FA] font-pretendard">
        <Header title="쏙쏙이 챗봇" showBack />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <MessageCircleMore size={48} className="text-gray-300" />
          <p className="text-gray-500 font-medium">로그인 후 챗봇을 이용할 수 있어요.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-green-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-green-100 active:scale-95 transition-all"
          >
            로그인 하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] font-pretendard">
      <Header title="쏙쏙이 챗봇" showBack />

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-16 space-y-2">
            <MessageCircleMore size={40} className="mx-auto opacity-50" />
            <p className="text-sm font-medium">분리수거에 대해 무엇이든 물어보세요!</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-green-500 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-400 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 text-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> 쏙쏙이가 답변을 준비하고 있어요...
            </div>
          </div>
        )}

        {error && (
          <p className="text-center text-red-400 text-xs font-medium py-2">{error}</p>
        )}
      </div>

      <div className="p-4 bg-white border-t flex gap-2 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          placeholder="질문을 입력하세요..."
          className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 disabled:opacity-60"
        />
        <button
          onClick={sendMessage}
          disabled={isSending || !input.trim()}
          className="w-12 h-12 shrink-0 flex items-center justify-center bg-green-500 text-white rounded-2xl disabled:bg-gray-200 active:scale-95 transition-all"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default InfoPage;
