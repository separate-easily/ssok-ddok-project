import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { User, LogOut, Loader2, Baby, Building2, Settings } from 'lucide-react'; // 아이콘 추가
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<{ 
    name: string; 
    points: number; 
    isMain: boolean; // 부모/자녀 구분을 위해 추가
    agency?: string; 
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    const profileNo = sessionStorage.getItem('currentProfileNo');

    if (!user || !profileNo) {
      navigate('/select-profile');
      return;
    }

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

    return () => unsub();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      sessionStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error("로그아웃 실패:", error);
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
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          {/* 🟢 이모지 대신 lucide 아이콘 적용 */}
          <div className="relative mb-4">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg ${
              profileData?.isMain 
                ? "bg-gradient-to-tr from-green-400 to-emerald-500" // 부모용 컬러
                : "bg-gradient-to-tr from-orange-400 to-amber-500" // 자녀용 컬러
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

        {/* <button 
          onClick={handleLogout}
          className="w-full py-4 flex items-center justify-center gap-2 text-gray-400 font-bold text-sm hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          로그아웃
        </button> */}

        <button
          onClick={() => navigate('/logout')}
          className="w-full py-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center gap-2 text-red-500 font-bold text-sm active:scale-[0.98] transition-all"
        >
          <LogOut size={18} />
          로그아웃
        </button>

        <Footer />
      </main>
    </div>
  );
};

export default ProfilePage;