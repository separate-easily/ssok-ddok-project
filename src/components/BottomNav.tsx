import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Gamepad2, Trophy, User, MessageCircleMore } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'home', path: '/', icon: <Home size={20} />, label: '홈' },
    { id: 'game', path: '/game', icon: <Gamepad2 size={20} />, label: '게임' },
    { id: 'ranking', path: '/ranking', icon: <Trophy size={20} />, label: '랭킹' },
    { id: 'info', path: '/info', icon: <MessageCircleMore size={20} />, label: '정보' },
    { id: 'profile', path: '/profile', icon: <User size={20} />, label: '프로필' },
  ];

  return (
    /* 수정 포인트:
      1. left-1/2 -translate-x-1/2: 부모가 max-w를 가질 때 fixed 요소를 중앙에 정렬하는 공식
      2. max-w-[430px]: App.tsx의 컨테이너 너비와 동일하게 맞춤
      3. pb-safe: 최신 아이폰 등 하단 바가 있는 기기 대응
    */
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 flex justify-around py-3 pb-safe z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;

        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-1 flex-1 transition-colors ${
              isActive ? 'text-green-500 font-bold' : 'text-gray-400'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] sm:text-[11px] font-medium">
              {tab.label}
            </span>
            {isActive && (
              <div className="w-1 h-1 bg-green-500 rounded-full mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;