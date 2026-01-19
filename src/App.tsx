import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import BottomNav from './components/BottomNav';
import HomePage from './pages/Home';
import QuizPage from './pages/Game';
import RankingPage from './pages/Ranking';
import ProfilePage from './pages/Profile';
import SettingsPage from './pages/Settings';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfileSelection from './pages/ProfileSelection';
import LogoutPage from './pages/LogoutPage';
import WithdrawPage from './pages/WithdrawPage';
import InfoPage from './pages/Info';
import PointShopPage from './pages/Shop';

import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

import AdminUploadPage from './pages/AdminUpload';
import AdminQuizManage from './pages/AdminQuizManage';

// --- 네비게이션바 컴포넌트 ---
const NavigationWrapper = () => {
  const location = useLocation();
  const showNavPaths = ['/', '/ranking', '/profile'];
  const shouldShowNav = showNavPaths.includes(location.pathname);
  return shouldShowNav ? <BottomNav /> : null;
};

// --- 인증 보호 라우트 ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (location.pathname === '/') return <>{children}</>;

  const currentProfileNo = sessionStorage.getItem('currentProfileNo');
  if (!currentProfileNo && location.pathname !== '/select-profile') {
    return <Navigate to="/select-profile" replace />;
  }

  return <>{children}</>;
};

// --- 메인 콘텐츠 컴포넌트 (useLocation 사용을 위해 분리) ---
const AppContent = () => {
  const location = useLocation();

  // 관리자 페이지 여부 확인 (/admin/으로 시작하는 모든 경로)
  const isAdminPage = location.pathname.startsWith('/admin');

  // 경로에 따른 동적 클래스 설정
  const containerClassName = isAdminPage
    ? "relative min-h-screen bg-white w-full overflow-x-hidden font-pretendard" // 관리자: 전체 화면
    : "relative min-h-screen bg-white max-w-[430px] mx-auto shadow-2xl overflow-x-hidden font-pretendard"; // 일반: 모바일 레이아웃

  return (
    <div className={containerClassName}>
      <Routes>
        {/* 일반 사용자 페이지 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/logout" element={<LogoutPage />} />

        <Route path="/select-profile" element={<ProtectedRoute><ProfileSelection /></ProtectedRoute>} />
        <Route path="/game" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/ranking" element={<ProtectedRoute><RankingPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/withdraw" element={<ProtectedRoute><WithdrawPage /></ProtectedRoute>} />

        <Route path="/info" element={<InfoPage />} />
        <Route path="/pages/terms" element={<TermsPage />} />
        <Route path="/pages/privacy" element={<PrivacyPage />} />
        <Route path="/shop" element={<ProtectedRoute><PointShopPage /></ProtectedRoute>} />

        <Route path="/admin/db-upload" element={<AdminUploadPage />} />
        <Route path="/admin/quize-manage" element={<AdminQuizManage />} />
      </Routes>

      <NavigationWrapper />
    </div>
  );
};

// --- 최상위 App 컴포넌트 ---
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;