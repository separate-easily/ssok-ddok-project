import React, { useState, useEffect } from 'react';
import { Menu, Users, Gamepad2, Trophy, ShoppingBag, Webcam, ChevronRight, Sparkles, MapPin, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Footer from '../components/Footer';

const HomePage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<{ name: string, points: number } | null>(null);

  // 📍 우리 동네 혜택 장소 데이터 (범용성을 위해 배열로 관리)
  const recommendationPlaces = [
    {
      id: 'asome-complex',
      tag: '시민 혜택',
      benefit: '무료 또는 할인가 이용',
      title: '오썸플렉스',
      description: '수영장, 찜질방 등을 평택시민이라면, 무료 또는 아주 저렴하게 이용할 수 있는 복합 문화 편의 공간입니다.',
      address: '경기도 평택시 고덕면 해창리 705',
      link: 'http://www.5someplex.com/intro/facility/index.jsp', // 외부 웹사이트 주소
    },
    // 나중에 새로운 장소가 생기면 여기에 객체를 추가하기만 하면 됩니다.
  ];

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        const profileNo = sessionStorage.getItem('currentProfileNo');
        if (profileNo) {
          const unsubProfile = onSnapshot(doc(db, "users", user.uid, "profiles", profileNo), (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setProfileData({
                name: data.profileName || data.name,
                points: data.points || 0
              });
            }
            setIsLoading(false);
          });
          return () => unsubProfile();
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoggedIn(false);
        setProfileData(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const gameModes = [
    { title: '퀴즈 게임', desc: '분리수거 마스터', icon: <Gamepad2 size={36} className="text-green-500" />, path: '/game', active: true },
    { title: '실습 게임', desc: '준비 중입니다', icon: <Webcam size={36} className="text-blue-400" />, path: '#', active: false },
    { title: '랭킹 보기', desc: '나의 순위는?', icon: <Trophy size={36} className="text-yellow-500" />, path: '/ranking', active: true },
    { title: '포인트 상점', desc: '보상 교환하기', icon: <ShoppingBag size={36} className="text-purple-500" />, path: '/shop', active: true },
  ];

  if (isLoading) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] max-w-[430px] pb-32 mx-auto font-pretendard">
      {/* 헤더 섹션 (기존 디자인 기조 유지) */}
      <header className="p-6 text-white rounded-b-[40px] shadow-lg transition-all duration-500 bg-gradient-to-br from-green-600 to-emerald-500">
        <div className="flex justify-between items-center mb-8">
          <button className="p-2 bg-white/10 rounded-xl active:scale-95 transition-transform invisible"><Menu size={20} /></button>
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/select-profile')} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 flex items-center gap-2">
                <Users size={18} /><span className="text-[10px] font-bold">전환</span>
              </button>
              <div className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-black">⭐ {profileData?.points.toLocaleString()}</div>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="px-4 py-2 bg-white text-green-600 rounded-xl text-xs font-black shadow-md active:scale-95 transition-all">로그인 / 가입</button>
          )}
        </div>
        <div className="mb-2">
          {isLoggedIn ? (
            <><h2 className="text-2xl font-black mb-1">반가워요, <span className="text-yellow-200">{profileData?.name}</span>님! 👋</h2><p className="text-sm opacity-90 font-medium italic">오늘도 지구를 깨끗하게 만들어볼까요?</p></>
          ) : (
            <><div className="flex items-center gap-2 mb-1"><Sparkles size={20} className="text-yellow-300 fill-yellow-300" /><h2 className="text-2xl font-black">쏙쏙분리, 똑똑분리</h2></div><p className="text-sm opacity-90 font-medium italic">재미있게 배우는 우리 아이 분리수거 습관</p></>
          )}
        </div>
      </header>

      <main className="p-6 space-y-8 flex-1">

        {/* 1. 핵심 서비스 버튼 섹션 (기존 프로젝트 기능) */}
        <section>
          {isLoggedIn ? (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {gameModes.map((mode) => (
                <button
                  key={mode.title}
                  onClick={() => mode.active && navigate(mode.path)}
                  className={`bg-white p-6 rounded-[32px] flex flex-col items-center justify-center shadow-sm border-2 border-transparent transition-all ${mode.active ? 'active:scale-95 active:border-green-100' : 'opacity-60 cursor-not-allowed'}`}
                >
                  <div className="mb-3">{mode.icon}</div>
                  <div className="text-sm font-black text-gray-800">{mode.title}</div>
                  <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{mode.desc}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-green-50 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-green-600 text-[11px] font-black uppercase tracking-widest mb-2">Eco-Friendly Kids</p>
                  <h3 className="text-xl font-black text-gray-800 mb-2">쏙쏙 담고, 똑똑하게!<br />환경 지킴이 게임 🌍</h3>
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-green-500 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-green-100 active:scale-95 transition-all"
                  >
                    지금 시작하기 <ChevronRight size={16} />
                  </button>
                </div>
                <Gamepad2 size={120} className="absolute -right-8 -bottom-8 text-green-50 -rotate-12" />
              </div>
            </div>
          )}
        </section>

        {/* 2. 우리 동네 혜택 장소 (하단 배치 & 범용 카드 설계) */}
        <section className="space-y-4 mt-12">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
              <MapPin size={16} className="text-blue-500" /> 우리 동네 혜택 장소
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase italic">Local Benefit</span>
          </div>

          {recommendationPlaces.map((place) => (
            <div key={place.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                        {place.tag}
                      </span>
                      <span className="text-blue-500 text-[9px] font-black uppercase tracking-widest leading-none">
                        {place.benefit}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-gray-800">{place.title}</h4>
                  </div>
                </div>

                <p className="text-xs text-gray-500 font-medium leading-relaxed mb-4">
                  {place.description}
                </p>

                <div className="space-y-2 border-t border-gray-50 pt-4">
                  <div className="flex items-start gap-2 mb-5">
                    <MapPin size={12} className="text-gray-400 mt-0.2 shrink-0" />
                    <p className="text-[11px] text-gray-400 font-bold leading-tight">
                      {place.address}
                    </p>
                  </div>

                  {/* 외부 연결용 a 태그 버튼 */}
                  <a
                    href={place.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 py-3.5 rounded-2xl font-black text-[12px] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    공식 홈페이지에서 확인하기 <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default HomePage;