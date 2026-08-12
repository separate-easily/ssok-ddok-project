import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

const LogoutPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = async () => {
            try {
                // 1. 잠시 대기 (사용자에게 로그아웃 중임을 인지시킴)
                await new Promise(resolve => setTimeout(resolve, 1500));

                // 2. Firebase 로그아웃
                await signOut(auth);

                // 3. 세션 스토리지 비우기 (프로필 정보 삭제)
                sessionStorage.clear();

                // 4. 로그인 페이지로 이동
                navigate('/login', { replace: true });
            } catch (error) {
                console.error("로그아웃 중 오류 발생:", error);
                navigate('/');
            }
        };

        performLogout();
    }, [navigate]);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-white max-w-[430px] mx-auto p-6 text-center">
            <div className="mb-6">
                <Loader2 className="animate-spin text-green-500 mx-auto" size={48} />
            </div>
            <h2 className="text-xl font-black text-gray-800 mb-2">로그아웃 중입니다</h2>
            <p className="text-gray-400 font-medium">안전하게 데이터를 정리하고 있어요.</p>
        </div>
    );
};

export default LogoutPage;