import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Medal, Building2, Search, Star, Users } from 'lucide-react';
import { db, auth } from '../firebase';
import { collectionGroup, query, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';

const RankingPage = () => {
  const [allRanks, setAllRanks] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [myAgency, setMyAgency] = useState<string>(""); 
  const [filter, setFilter] = useState<'all' | 'agency'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const profileNo = sessionStorage.getItem('currentProfileNo');
        
        // 내 소속 기관 정보 실시간 감시 (부모 문서 참조)
        onSnapshot(doc(db, "users", user.uid), (docSnap) => {
          if (docSnap.exists()) {
            setMyAgency(docSnap.data().agency || "개인");
          }
        });

        if (profileNo) {
          onSnapshot(doc(db, "users", user.uid, "profiles", profileNo), (docSnap) => {
            if (docSnap.exists()) setUserPoints(docSnap.data().points || 0);
          });
        }
      }
    });

    // 🟢 최적화된 단일 쿼리: profiles에서 바로 agency를 읽어옵니다
    const q = query(
      collectionGroup(db, 'profiles'),
      orderBy('points', 'desc'),
      limit(100)
    );

    const unsubRank = onSnapshot(q, (snapshot) => {
      const ranks = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.profileName || data.name || "익명 히어로",
          score: data.points || 0,
          agency: data.agency || "개인", // 🟢 자녀 프로필에 저장된 정보 사용
          rank: index + 1
        };
      });
      setAllRanks(ranks);
      setIsLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubRank();
    };
  }, []);

  // 🟢 필터링 로직: 우리 기관 탭 선택 시 내 소속과 같은 사람들만 노출
  const displayData = useMemo(() => {
    return allRanks.filter(item => {
      const isAgencyTab = filter === 'agency';
      const matchesAgency = isAgencyTab ? (item.agency === myAgency && myAgency !== "개인") : true;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.agency.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesAgency && matchesSearch;
    });
  }, [allRanks, filter, myAgency, searchTerm]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] pb-32 max-w-[430px] mx-auto font-pretendard">
      <Header title="랭킹" points={userPoints} showBack={true} />

      <header className="bg-gradient-to-br from-green-600 to-emerald-500 p-8 text-white text-center shadow-lg rounded-b-[40px] relative overflow-hidden">
        <div className="relative z-10">
          <Trophy className="mx-auto mb-3 text-yellow-300 drop-shadow-md" size={48} />
          <h1 className="text-2xl font-black mb-1">환경지키미 순위는?</h1>
          <p className="text-sm font-medium opacity-90">
            {filter === 'all' ? "전체 히어로 랭킹" : `우리 기관( ${myAgency} ) 랭킹 🏫`}
          </p>
        </div>
      </header>

      <div className="flex p-1.5 bg-white sticky top-0 z-20 shadow-md mx-6 -mt-2 rounded-2xl border border-gray-100 mb-6">
        <button onClick={() => setFilter('all')} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${filter === 'all' ? 'bg-green-500 text-white' : 'text-gray-400'}`}>
          <Star size={16} /> 전체
        </button>
        <button onClick={() => setFilter('agency')} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${filter === 'agency' ? 'bg-green-500 text-white' : 'text-gray-400'}`}>
          <Users size={16} /> 우리 기관
        </button>
      </div>

      <main className="p-6 pt-0 space-y-4">
        {isLoading ? (
          <div className="py-20 text-center text-gray-400 font-bold animate-pulse italic">데이터 로딩 중...</div>
        ) : displayData.length > 0 ? (
          displayData.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-5 bg-white rounded-[28px] shadow-sm border border-gray-50 transition-all">
              <div className="w-8 flex justify-center items-center font-black italic">
                {item.rank === 1 ? <Medal className="text-yellow-500" size={30} /> :
                 item.rank === 2 ? <Medal className="text-slate-400" size={26} /> :
                 item.rank === 3 ? <Medal className="text-amber-600" size={26} /> :
                 <span className="text-gray-300">{item.rank}</span>}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl shadow-inner">
                {item.agency !== "개인" ? '🏫' : '🧒'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-gray-800 text-base truncate">{item.name}</div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold truncate">
                  <Building2 size={12} className="shrink-0" /> {item.agency}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-black text-green-600 tracking-tighter">{item.score.toLocaleString()}</div>
                <div className="text-[10px] font-black text-gray-300 uppercase">Points</div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-gray-400 font-medium italic">데이터가 없습니다.</div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RankingPage;