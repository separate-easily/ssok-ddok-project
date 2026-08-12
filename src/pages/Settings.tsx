import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Moon, Volume2, Info, ChevronRight, Lock,
  LogOut, UserX, X, AlertCircle, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { auth } from '../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [isReadyModalOpen, setIsReadyModalOpen] = useState(false);

  // 🟢 비밀번호 변경 관련 상태
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: 현재 비번 확인, 2: 새 비번 설정
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달 닫기 및 초기화
  const closeModal = () => {
    setIsPasswordModalOpen(false);
    setTimeout(() => {
      setStep(1);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 300);
  };

  // 🟢 1단계: 현재 비밀번호 확인 (재인증)
  const handleVerifyCurrentPassword = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    setIsSubmitting(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      setStep(2); // 인증 성공 시 다음 단계로
    } catch (error: any) {
      alert("현재 비밀번호가 일치하지 않습니다. 다시 확인해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🟢 2단계: 새 비밀번호 변경 실행
  const handleUpdatePassword = async () => {
    if (newPassword.length < 8) {
      alert("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        alert("비밀번호가 성공적으로 변경되었습니다.");
        closeModal();
      }
    } catch (error: any) {
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[#F8F9FA] pb-20 font-pretendard">
      <Header title="환경설정" showBack={true} />

      <main className="p-5 space-y-6">
        {/* 계정 보안 섹션 */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2">계정 및 보안</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <MenuItem
              icon={<Lock size={18} />}
              label="비밀번호 변경"
              onClick={() => setIsPasswordModalOpen(true)}
            />
            <MenuItem icon={<Info size={18} />} label="서비스 이용약관" onClick={() => navigate('/pages/terms')} />
            <MenuItem icon={<Info size={18} />} label="개인정보 처리방침" onClick={() => navigate('/pages/privacy')} />
          </div>
        </section>

        {/* 위험 구역 */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-bold text-red-400 uppercase tracking-wider px-2">Danger Zone</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <MenuItem
              icon={<LogOut size={18} className="text-red-500" />}
              label="로그아웃"
              onClick={() => navigate('/logout')}
            />
            <MenuItem
              icon={<UserX size={18} className="text-red-500" />}
              label="회원 탈퇴"
              onClick={() => navigate('/withdraw')}
            />
          </div>
        </section>
      </main>

      <Footer />

      {/* 🟢 2단계 비밀번호 변경 모달 */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal} />
          <div className="relative w-full max-w-[430px] bg-white rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-500">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-xl font-black text-gray-900">
                  {step === 1 ? '본인 확인' : '새 비밀번호 설정'}
                </h3>
              </div>
              <button onClick={closeModal} className="p-2 bg-gray-50 rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>

            {step === 1 ? (
              /* 1단계: 현재 비밀번호 확인 */
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 ml-1">현재 비밀번호</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="현재 비밀번호를 입력해주세요"
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium"
                  />
                  <p className="text-[11px] text-gray-400 ml-1 leading-relaxed">
                    안전한 정보 변경을 위해 현재 사용 중인<br />비밀번호를 한 번 더 확인합니다.
                  </p>
                </div>
                <button
                  onClick={handleVerifyCurrentPassword}
                  disabled={isSubmitting || !currentPassword}
                  className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg disabled:bg-gray-200 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? '확인 중...' : '다음'}
                </button>
              </div>
            ) : (
              /* 2단계: 새 비밀번호 설정 */
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 ml-1">새 비밀번호</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="8자 이상 입력"
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 ml-1">새 비밀번호 확인</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="한 번 더 입력"
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium"
                    />
                  </div>
                </div>
                <button
                  onClick={handleUpdatePassword}
                  disabled={isSubmitting || !newPassword}
                  className="w-full py-5 bg-green-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-100 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? '변경 중...' : '비밀번호 변경 완료'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 준비 중 모달 */}
      {isReadyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsReadyModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-5">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">업데이트 준비 중</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
              더 나은 서비스를 위해 기능 개선 중입니다.<br />조금만 더 기다려 주세요!
            </p>
            <button onClick={() => setIsReadyModalOpen(false)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black active:scale-[0.98] transition-all shadow-lg">
              확인했어요
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 내부 컴포넌트 ---
const SettingItem = ({ icon, label }: any) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-50 last:border-none font-pretendard cursor-pointer active:bg-gray-50">
    <div className="flex items-center gap-3 font-medium text-gray-600 text-sm">
      <span className="text-gray-400">{icon}</span>
      <span>{label}</span>
    </div>
    <div className="w-11 h-6 rounded-full bg-gray-100 relative">
      <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm" />
    </div>
  </div>
);

const MenuItem = ({ icon, label, onClick }: any) => (
  <div onClick={onClick} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-none cursor-pointer active:bg-gray-50 font-pretendard">
    <div className="flex items-center gap-3 font-medium text-gray-600 text-sm">
      <span className="text-gray-400">{icon}</span>
      <span>{label}</span>
    </div>
    <ChevronRight size={16} className="text-gray-300" />
  </div>
);

export default SettingsPage;