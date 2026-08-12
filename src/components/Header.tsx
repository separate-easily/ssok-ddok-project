import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Settings, User } from 'lucide-react';

interface HeaderProps {
  title: string;
  points?: number;         // 실제 유저 포인트가 전달됨
  showBack?: boolean;
  showNoti?: boolean;
  showProfile?: boolean;
  showSettings?: boolean;
}

const Header = ({ 
  title, 
  points, 
  showBack = true, 
  showNoti = false, 
  showProfile = false, 
  showSettings = false 
}: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white font-pretendard sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {showBack && (
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <span className="font-bold text-lg text-gray-800">{title}</span>
      </div>

      <div className="flex items-center gap-1">
        {/* ⭐ 실제 포인트 표시 영역 */}
        {points !== undefined && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-3 py-1.5 rounded-full text-white text-xs font-black shadow-sm flex items-center gap-1 mr-1">
            <span className="text-sm">⭐</span> {points.toLocaleString()}
          </div>
        )}

        {showNoti && (
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Bell size={20} />
          </button>
        )}

        {showProfile && (
          <button 
            onClick={() => navigate('/profile')}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <User size={20} />
          </button>
        )}

        {showSettings && (
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Settings size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;