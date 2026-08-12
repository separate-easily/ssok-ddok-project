import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ChevronLeft, AlertCircle } from 'lucide-react';
import { auth } from '../firebase'; // 설정하신 firebase.ts 파일 임포트
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  
  // 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 로그인 제출 함수
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // [추가] 새 로그인을 할 때 이전 세션 정보가 남아있지 않도록 초기화
      sessionStorage.removeItem('currentProfileNo');
      sessionStorage.removeItem('currentProfileName');

      // [수정] 홈('/')이 아닌 프로필 선택 페이지로 이동
      // App.tsx의 ProtectedRoute가 프로필이 없으면 어차피 리다이렉트하겠지만, 
      // 명시적으로 이쪽으로 보내주는 것이 흐름상 가장 깔끔합니다.
      navigate('/select-profile'); 
      
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('이메일 또는 비밀번호가 일치하지 않습니다.');
      } else if (err.code === 'auth/invalid-email') {
        setError('올바른 이메일 형식이 아닙니다.');
      } else {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-pretendard max-w-[430px] mx-auto">
      {/* 뒤로가기 버튼 */}
      <button 
        onClick={() => navigate('/')}
        className="mb-8 p-2 -ml-2 hover:bg-gray-100 rounded-full w-fit transition-colors"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-800 mb-2">반가워요! 👋</h1>
        <p className="text-gray-500 font-medium">분리수거의 달인이 되어 지구를 구해주세요.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 flex-1">
        {/* 이메일 입력 */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 ml-1">이메일 주소</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-green-500 transition-all outline-none text-sm font-medium"
            />
          </div>
        </div>

        {/* 비밀번호 입력 */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 ml-1">비밀번호</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-green-500 transition-all outline-none text-sm font-medium"
            />
          </div>
        </div>

        {/* 에러 메시지 표시 */}
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-xs font-bold px-1 py-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <button 
          type="button"
          className="w-full text-right text-xs text-gray-400 font-bold hover:text-gray-600 transition-colors"
        >
          비밀번호를 잊으셨나요?
        </button>
      </form>

      <div className="space-y-4 mt-10">
        <button 
          onClick={handleLogin}
          disabled={isLoading}
          className={`w-full py-4 bg-green-500 text-white rounded-2xl font-bold shadow-lg shadow-green-100 transition-all ${
            isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'
          }`}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
        
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-400 font-medium">계정이 없으신가요?</span>
          <button 
            onClick={() => navigate('/signup')} 
            className="text-sm text-green-600 font-black hover:underline"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;