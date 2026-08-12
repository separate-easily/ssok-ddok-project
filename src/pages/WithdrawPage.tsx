import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Trash2, ShieldAlert, Lock, Check, X } from 'lucide-react';
import Header from '../components/Header';
import { auth, db } from '../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';

const WithdrawPage = () => {
    const navigate = useNavigate();

    // 상태 관리
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [isAgreed, setIsAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 🟢 최종 회원 탈퇴 로직
    const handleFinalWithdraw = async () => {
        const user = auth.currentUser;

        // 1. 유효성 검사
        if (!user || !user.email) {
            alert("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
            navigate('/login');
            return;
        }

        if (!password) {
            alert("비밀번호를 입력해주세요.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 2. 현재 비밀번호로 재인증 (가장 중요한 보안 절차)
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);

            // 3. Firestore 데이터 삭제
            await deleteDoc(doc(db, "users", user.uid));

            // 4. Auth 계정 삭제
            await deleteUser(user);

            alert("탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.");
            navigate('/login');
        } catch (error: any) {
            if (error.code === 'auth/wrong-password') {
                alert("비밀번호가 일치하지 않습니다.");
            } else if (error.code === 'auth/requires-recent-login') {
                alert("보안 세션이 만료되었습니다. 다시 로그인 후 시도해주세요.");
                await auth.signOut();
                navigate('/login');
            } else {
                alert("탈퇴 처리 중 오류가 발생했습니다.\n입력하신 비밀번호가 맞는지 다시 확인해 주세요.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white max-w-[430px] mx-auto font-pretendard relative">
            <Header title="회원 탈퇴" showBack={true} />

            <main className="p-6 flex-1 flex flex-col">
                <div className="py-8">
                    <div className="w-16 h-16 bg-red-50 rounded-[24px] flex items-center justify-center text-red-500 mb-6">
                        <AlertCircle size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">
                        지구 지킴이 활동을<br />정말 그만두시겠어요?
                    </h1>
                    <p className="text-gray-400 font-medium text-sm leading-relaxed">
                        계정을 삭제하면 더 이상 로그인이 불가하며,<br />이 작업은 되돌릴 수 없습니다.
                    </p>
                </div>

                {/* 유의사항 박스 */}
                <div className="bg-gray-50 rounded-[32px] p-6 space-y-5">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-400 shrink-0 shadow-sm font-black text-xs">01</div>
                        <div>
                            <h4 className="text-sm font-black text-gray-800 mb-1">데이터 즉시 파기</h4>
                            <p className="text-xs text-gray-500 leading-relaxed font-medium">회원의 계정 정보는 지침에 따라 즉시 파기됩니다.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-400 shrink-0 shadow-sm font-black text-xs">02</div>
                        <div>
                            <h4 className="text-sm font-black text-gray-800 mb-1">복구 불가능</h4>
                            <p className="text-xs text-gray-500 leading-relaxed font-medium">재가입 시에도 이전 포인트와 랭킹은 복구되지 않습니다.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-400 shrink-0 shadow-sm font-black text-xs">03</div>
                        <div>
                            <h4 className="text-sm font-black text-gray-800 mb-1">자녀 프로필은 탈퇴 전 삭제</h4>
                            <p className="text-xs text-gray-500 leading-relaxed font-medium">탈퇴 시 자녀 프로필은 자동으로 삭제되지 않습니다.<br/>탈퇴 전에 자녀 프로필을 직접 삭제해 주세요. 만약 탈퇴 이후 자녀 프로필 삭제를 원할 경우 관리자(support@ssok-ddok.kr)에게 문의해 주세요.</p>
                        </div>
                    </div>
                </div>

                {/* 버튼 구역 */}
                <div className="mt-auto py-6 space-y-2">
                    <button
                        onClick={() => setIsConfirmModalOpen(true)}
                        className="w-full py-5 bg-red-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-100 active:scale-[0.98] transition-all"
                    >
                        탈퇴 진행하기
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-5 text-gray-400 font-bold text-sm"
                    >
                        다음에 할게요
                    </button>
                </div>
            </main>

            {/* 🟢 최종 확인 및 비밀번호 입력 모달 */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
                    {/* 배경 클릭 시 닫힘 */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsConfirmModalOpen(false)}></div>

                    <div className="relative w-full max-w-[430px] bg-white rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">본인 확인</h3>
                            <button onClick={() => setIsConfirmModalOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6 mb-8">
                            {/* 비밀번호 입력란 */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 ml-1">현재 비밀번호</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="비밀번호를 입력해주세요"
                                        className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium"
                                    />
                                </div>
                            </div>

                            {/* 동의 체크박스 */}
                            <div
                                className="flex items-center gap-3 p-4 bg-red-50/50 rounded-2xl cursor-pointer"
                                onClick={() => setIsAgreed(!isAgreed)}
                            >
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isAgreed ? 'bg-red-500 border-red-500' : 'bg-white border-gray-200'}`}>
                                    {isAgreed && <Check size={14} className="text-white stroke-[4px]" />}
                                </div>
                                <span className={`text-sm font-bold ${isAgreed ? 'text-red-600' : 'text-gray-400'}`}>
                                    내용을 충분히 이해했으며 탈퇴에 동의합니다.
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleFinalWithdraw}
                            disabled={isSubmitting || !password || !isAgreed}
                            className="w-full py-5 bg-red-500 text-white rounded-2xl font-black text-lg disabled:bg-gray-200 disabled:shadow-none shadow-xl shadow-red-100 active:scale-[0.98] transition-all"
                        >
                            {isSubmitting ? '처리 중...' : '계정 영구 삭제'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WithdrawPage;