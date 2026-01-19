import React, { useState, useEffect } from 'react';
import { Lock, Image as ImageIcon, AlertCircle, X } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PointShopPage = () => {
  const [userPoints, setUserPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🟢 모달 상태 관리
  const [isReadyModalOpen, setIsReadyModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const profileNo = sessionStorage.getItem('currentProfileNo');
        if (profileNo) {
          const unsubProfile = onSnapshot(doc(db, "users", user.uid, "profiles", profileNo), (docSnap) => {
            if (docSnap.exists()) {
              setUserPoints(docSnap.data().points || 0);
            }
            setIsLoading(false);
          });
          return () => unsubProfile();
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  const recycleProducts = [
    { id: 1, category: '업사이클링', name: '폐플라스틱 키링', price: 2000, image: "" },
    { id: 2, category: '친환경', name: '대나무 칫솔', price: 3500, image: "" },
    { id: 3, category: '리유저블', name: '에코 리유저블 컵', price: 5000, image: "" },
    { id: 4, category: '패션', name: '페트병 재생 에코백', price: 8000, image: "" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] pb-32 max-w-[430px] mx-auto font-pretendard relative">
      <Header title="포인트 상점" points={userPoints} showBack={true} />

      <header className="bg-gradient-to-br from-green-600 to-emerald-500 p-8 text-white text-center shadow-lg rounded-b-[40px] relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-black mb-1 tracking-tight">포인트 교환 상점</h1>
          <p className="text-sm font-medium opacity-90 italic">분리수거의 가치를 선물로 바꿔요</p>
        </div>
      </header>

      <main className="p-6">
        {/* 미운영 안내 섹션 */}
        <div className="mb-8 bg-white rounded-[32px] p-6 border-2 border-dashed border-green-200 text-center relative">
          <div className="absolute top-0 left-0 bg-green-500 text-white text-[10px] px-3 py-1 font-black uppercase rounded-br-2xl">
            Coming Soon
          </div>
          <Lock className="mx-auto mb-3 text-green-200" size={40} />
          <h3 className="text-lg font-black text-gray-800 mb-2 italic">정식 오픈 준비 중!</h3>
          <p className="text-xs text-gray-400 font-bold leading-relaxed uppercase">
            현재 리사이클링 파트너사를 모집하고 있습니다.<br/>
            시연을 위해 상품 목록만 공개 중입니다.
          </p>
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 gap-4">
          {recycleProducts.map((product) => (
            <div 
              key={product.id} 
              onClick={() => setIsReadyModalOpen(true)} // 🟢 클릭 시 모달 오픈
              className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 flex flex-col group relative cursor-pointer active:scale-[0.98] transition-all"
            >
              <div className="aspect-square bg-[#F1F3F5] flex items-center justify-center relative">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale opacity-50" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="text-gray-200" size={32} />
                    <span className="text-[8px] text-gray-300 font-black uppercase italic">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
              </div>

              <div className="p-4 flex flex-col flex-1">
                <span className="text-[9px] font-black text-green-600 uppercase mb-1 tracking-widest">{product.category}</span>
                <h4 className="font-black text-gray-800 text-sm mb-1 line-clamp-1">{product.name}</h4>
                <div className="mb-4 text-emerald-600 font-black tracking-tight">
                  <span className="text-sm">{product.price.toLocaleString()}</span>
                  <span className="text-[8px] text-gray-300 uppercase ml-1">Points</span>
                </div>
                
                <div className="w-full py-2.5 bg-gray-100 text-gray-400 rounded-2xl text-[11px] font-black uppercase text-center">
                  교환하기
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 🟢 준비 중 모달 (Settings.tsx 디자인 반영) */}
      {isReadyModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* 배경 오버레이 */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setIsReadyModalOpen(false)} 
          />
          
          {/* 모달 콘텐츠 */}
          <div className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            {/* 닫기 버튼 */}
            <button 
              onClick={() => setIsReadyModalOpen(false)}
              className="absolute top-5 right-5 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 mx-auto mb-5">
              <AlertCircle size={32} />
            </div>
            
            <h3 className="text-xl font-black text-gray-800 mb-2 italic">서비스 준비 중</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
              환경을 생각하는 멋진 리사이클 제품들이<br />
              곧 여러분을 찾아올 예정이에요!<br />
            </p>
            
            <button 
              onClick={() => setIsReadyModalOpen(false)} 
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black active:scale-[0.98] transition-all shadow-lg"
            >
              확인
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PointShopPage;