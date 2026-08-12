import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { User, LogOut, Loader2, Baby, Building2, MessageCircle, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { getChatHistory, type ChatSession } from '../services/chatFirebaseService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<{
    name: string;
    points: number;
    isMain: boolean;
    agency?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 채팅 기록 상태
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    const profileNo = sessionStorage.getItem('currentProfileNo');

    if (!user || !profileNo) {
      navigate('/select-profile');
      return;
    }

    // 프로필 정보 실시간 구독
    const unsub = onSnapshot(
      doc(db, "users", user.uid, "profiles", profileNo),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            name: data.profileName,
            points: data.points || 0,
            isMain: data.isMain ?? false,
            agency: data.agency || "개인 사용자"
          });
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("프로필 정보 로드 실패:", error);
        setIsLoading(false);
      }
    );

    // 채팅 기록 로드
    const loadChatHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const history = await getChatHistory(user.uid, profileNo);
        setChatHistory(history);
      } catch (error) {
        console.error("채팅 기록 로드 실패:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadChatHistory();

    return () => unsub();
  }, [navigate]);

  // 날짜 포맷
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return '오늘';
    } else if (days === 1) {
      return '어제';
    } else if (days < 7) {
      return `${days}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#F8F9FA]">
      <Loader2 className="animate-spin text-green-500" size={32} />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] pb-20 max-w-[430px] mx-auto font-pretendard">
      <Header title="내 프로필" showBack={true} showSettings={true} />

      <main className="p-5 space-y-6">
        {/* 프로필 카드 */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg ${
              profileData?.isMain
                ? "bg-gradient-to-tr from-green-400 to-emerald-500"
                : "bg-gradient-to-tr from-orange-400 to-amber-500"
            }`}>
              {profileData?.isMain ? (
                <User size={48} strokeWidth={2.5} />
              ) : (
                <Baby size={48} strokeWidth={2.5} />
              )}
            </div>
          </div>

          <h2 className="text-xl font-black text-gray-800">
            {profileData?.name} <span className='text-sm font-medium text-gray-800'>님</span>
          </h2>

          <div className="flex items-center gap-1.5 bg-green-50 text-green-600 text-[11px] font-bold mt-2 px-3 py-1 rounded-full border border-green-100">
            <Building2 size={12} />
            {profileData?.agency}
          </div>

          <div className="w-full mt-6 pt-6 border-t border-gray-50">
            <p className="text-[11px] text-gray-400 font-bold mb-1 uppercase tracking-wider">나의 포인트</p>
            <p className="text-2xl font-black text-orange-500">{profileData?.points.toLocaleString()} P</p>
          </div>
        </section>

        {/* 채팅 기록 섹션 */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-green-500" />
              <h3 className="font-bold text-gray-800">분리수거 도우미 대화 기록</h3>
            </div>
          </div>

          {isLoadingHistory ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="animate-spin text-gray-300" size={24} />
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">아직 대화 기록이 없어요</p>
              <button
                onClick={() => navigate('/info')}
                className="mt-3 text-sm font-bold text-green-500 hover:text-green-600"
              >
                분리수거 도우미 시작하기
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {chatHistory.slice(0, 5).map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{chat.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(chat.createdAt)} · {chat.messages.length}개 메시지
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}
        </section>

        <button
          onClick={() => navigate('/logout')}
          className="w-full py-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center gap-2 text-red-500 font-bold text-sm active:scale-[0.98] transition-all"
        >
          <LogOut size={18} />
          로그아웃
        </button>

        <Footer />
      </main>

      {/* 채팅 상세 모달 */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-[430px] max-h-[80vh] rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">{selectedChat.title}</h3>
                <p className="text-xs text-gray-400">{formatDate(selectedChat.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedChat(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* 메시지 목록 */}
            <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(80vh-80px)]">
              {selectedChat.messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      message.role === 'user'
                        ? 'bg-green-500 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    <p className={`text-sm whitespace-pre-wrap ${message.role === 'user' ? 'font-bold' : 'font-medium'}`}>
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
