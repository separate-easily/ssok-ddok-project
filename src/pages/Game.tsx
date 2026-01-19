/* Game.tsx 수정본 */
import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ChevronRight, Trophy, RotateCcw, Loader2, Award, Zap, Star, Coins, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { fetchQuizzesByDifficulty } from '../services/quizService';
import { auth, db } from '../firebase';
import { doc, onSnapshot, updateDoc, increment, getDoc } from 'firebase/firestore';

const QuizPage = () => {
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<'selection' | 'playing' | 'result'>('selection');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('easy');

  const [liveTotalPoints, setLiveTotalPoints] = useState<number>(0);
  const [sessionScore, setSessionScore] = useState(0);
  
  const [currentProfileName, setCurrentProfileName] = useState<string>("");

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [randomOptions, setRandomOptions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const currentQuiz = quizzes[currentIndex];
  const progress = quizzes.length > 0 ? ((currentIndex + 1) / quizzes.length) * 100 : 0;

  const shuffleArray = (array: any[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const user = auth.currentUser;
    const profileNo = sessionStorage.getItem('currentProfileNo');

    if (!user || !profileNo) {
      navigate('/select-profile');
      return;
    }

    // 🟢 [수정] data.name 대신 data.profileName을 참조하도록 변경
    const unsub = onSnapshot(doc(db, "users", user.uid, "profiles", profileNo), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLiveTotalPoints(data.points || 0);
        // DB 스키마 변경에 따라 profileName 필드를 우선 참조합니다.
        setCurrentProfileName(data.profileName || data.name || "우리 아이"); 
      }
    });

    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    if (currentQuiz?.options) {
      setRandomOptions(shuffleArray(currentQuiz.options));
    }
  }, [currentQuiz]);

  const startGame = async (diff: 'easy' | 'normal' | 'hard') => {
    setIsLoading(true);
    setDifficulty(diff);
    try {
      const data = await fetchQuizzesByDifficulty(diff);
      if (data && data.length > 0) {
        setQuizzes(data);
        setGameState('playing');
        setCurrentIndex(0);
        setSessionScore(0);
        setStreak(0);
        setIsAnswered(false);
        setSelected(null);
      } else {
        alert("퀴즈 데이터를 불러오지 못했습니다.");
      }
    } catch (error) {
      console.error("퀴즈 로드 실패", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = () => {
    if (!selected || !currentQuiz) return;
    const correct = selected === currentQuiz.correctAnswerId;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      const basePoints: Record<'easy' | 'normal' | 'hard', number> = { easy: 10, normal: 15, hard: 20 };
      const earned = basePoints[difficulty] + (streak * 2);
      setSessionScore(prev => prev + earned);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = async () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelected(null);
    } else {
      await savePointsToProfile();
      setGameState('result');
    }
  };

  const savePointsToProfile = async () => {
    const user = auth.currentUser;
    const profileNo = sessionStorage.getItem('currentProfileNo');
    if (user && profileNo && sessionScore > 0) {
      const profileRef = doc(db, "users", user.uid, "profiles", profileNo);
      try {
        await updateDoc(profileRef, { points: increment(sessionScore) });
      } catch (e) { console.error("포인트 저장 실패:", e); }
    }
  };

  // --- 렌더링 로직 (기존 디자인 유지) ---

  if (gameState === 'selection') {
    return (
      <div className="flex flex-col h-screen bg-[#F8F9FA] max-w-[430px] mx-auto font-pretendard">
        <Header title="난이도 선택" showBack={true} />
        <main className="flex-1 p-6 flex flex-col justify-center">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 border border-green-50">
              {isLoading ? <Loader2 className="animate-spin text-green-500" size={28} /> : <Star className="text-green-500 fill-green-500" size={28} />}
            </div>
            <h2 className="text-2xl font-black text-gray-800 leading-tight">지구 지킴이님,<br />준비되셨나요?</h2>
          </div>
          <div className="space-y-3">
            {(['easy', 'normal', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                disabled={isLoading}
                onClick={() => startGame(diff)}
                className="w-full bg-white p-5 rounded-[24px] shadow-sm border-2 border-transparent active:border-green-500 active:scale-[0.98] transition-all flex items-center justify-between group"
              >
                <div className="text-left">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${diff === 'easy' ? 'bg-blue-50 text-blue-500' : diff === 'normal' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
                    }`}>{diff.toUpperCase()}</span>
                  <div className="text-lg font-black text-gray-800 uppercase mt-1">{diff} 모드</div>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="flex flex-col h-screen bg-white max-w-[430px] mx-auto font-pretendard">
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Trophy size={64} className="text-yellow-400 mb-6 animate-bounce" />
          <h2 className="text-3xl font-black text-gray-800 mb-2">임무 완료!</h2>
          
          <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 mb-2">
            <UserCircle size={16} className="text-green-500" />
            <span className="text-sm font-bold text-gray-600">
              <span className="text-green-600 font-black">{currentProfileName}</span> 님의 프로필에 적립
            </span>
          </div>

          <div className="w-full bg-green-50 rounded-[32px] p-8 mb-10 border-2 border-green-100 mt-2 shadow-inner">
            <p className="text-xs font-black text-green-600 uppercase mb-2 tracking-widest">획득한 포인트</p>
            <p className="text-5xl font-black text-green-500">{sessionScore}<span className="text-xl ml-1">P</span></p>
          </div>

          <button 
            onClick={() => navigate('/')} 
            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all"
          >
            홈으로 돌아가기
          </button>
          
          <button 
            onClick={() => setGameState('selection')} 
            className="mt-4 text-gray-400 font-bold text-sm flex items-center gap-1 hover:text-green-500 transition-colors"
          >
            <RotateCcw size={16} /> 다른 난이도 도전하기
          </button>
        </main>
      </div>
    );
  }

  // 퀴즈 진행 화면 (생략 가능하나 구조상 포함)
  const hasImage = currentQuiz?.imageUrl && currentQuiz.imageUrl.startsWith('http') && currentQuiz.imageUrl !== "IMAGE_URL_HERE";

  return (
    <div className="flex flex-col h-screen bg-white max-w-[430px] mx-auto font-pretendard">
      <Header title={`${difficulty.toUpperCase()} QUIZ`} showBack={true} />
      <div className="px-6 py-4 border-b border-gray-50">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xl font-black text-green-500 italic">
            {currentIndex + 1}<span className="text-xs text-gray-300 not-italic ml-1">/ {quizzes.length}</span>
          </span>
          <div className="flex gap-2">
            <div className="bg-yellow-500 text-white px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 shadow-md shadow-yellow-100">
              <Coins size={12} fill="currentColor" /> {sessionScore}P
            </div>
            <div className="bg-orange-500 text-white px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 shadow-md shadow-orange-100">
              <Zap size={12} fill="currentColor" /> {streak} COMBO
            </div>
          </div>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <main className={`flex-1 flex flex-col items-center p-6 overflow-y-auto ${!hasImage ? 'justify-center' : 'justify-start'}`}>
        {hasImage && (
          <div className="w-full max-w-[300px] aspect-[4/3] bg-gray-50 rounded-[32px] mb-6 relative flex items-center justify-center border-4 border-gray-50 overflow-hidden shadow-sm mx-auto">
            <img src={currentQuiz.imageUrl} alt="" className="w-full h-full object-contain object-center" />
            {isAnswered && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm animate-in zoom-in duration-200">
                {isCorrect ? <CheckCircle2 size={80} className="text-green-500" /> : <XCircle size={80} className="text-red-500" />}
              </div>
            )}
          </div>
        )}
        {!hasImage && isAnswered && (
          <div className="mb-6 animate-in zoom-in duration-300">
            {isCorrect ? <CheckCircle2 size={70} className="text-green-500" /> : <XCircle size={70} className="text-red-500" />}
          </div>
        )}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-gray-800 mb-1">"{currentQuiz?.itemName}"</h2>
          <p className="text-gray-400 font-bold text-sm">어디에 버려야 할까요?</p>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full px-2">
          {randomOptions.map((opt: any) => (
            <button
              key={opt.id}
              disabled={isAnswered}
              onClick={() => setSelected(opt.id)}
              className={`relative h-24 rounded-[28px] border-2 transition-all duration-200 flex flex-col items-center justify-center px-4 active:scale-95 ${selected === opt.id ? 'border-green-500 bg-green-50 shadow-md text-green-600' : 'border-gray-50 bg-white shadow-sm text-gray-600'} ${isAnswered && opt.id === currentQuiz.correctAnswerId ? 'border-green-500 bg-green-50 ring-2 ring-green-100' : ''}`}
            >
              <span className="text-sm font-black text-center break-keep leading-tight">{opt.label}</span>
              {selected === opt.id && !isAnswered && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
            </button>
          ))}
        </div>
      </main>

      <div className="p-6 bg-white shrink-0">
        {!isAnswered ? (
          <button onClick={handleVerify} disabled={!selected} className={`w-full py-4.5 rounded-[20px] font-black text-lg transition-all shadow-xl ${selected ? 'bg-green-500 text-white shadow-green-100' : 'bg-gray-100 text-gray-300'}`}>정답 확인하기</button>
        ) : (
          <button onClick={handleNext} className="w-full py-4.5 bg-gray-900 text-white rounded-[20px] font-black text-lg shadow-xl active:scale-95 transition-all">
            {currentIndex < quizzes.length - 1 ? '다음 문제' : '최종 결과 보기'}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizPage;