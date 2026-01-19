import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Loader2, UserCircle2, Baby, Edit2, X, Check, Trash2, Lock } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, getDocs, doc, setDoc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import Header from '../components/Header';

interface Profile {
  profileNo: string;
  profileName: string;
  avatar: string;
  points: number;
  isMain: boolean;
  agency?: string;
  parentUid?: string;
}

const ProfileSelection = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // 🟢 삭제 모달 상태
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [passwordValue, setPasswordValue] = useState(''); // 🟢 비밀번호 입력 상태
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProfiles = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const querySnapshot = await getDocs(collection(db, "users", user.uid, "profiles"));
      const profileData: Profile[] = [];
      querySnapshot.forEach((doc) => {
        profileData.push(doc.data() as Profile);
      });
      const sortedProfiles = profileData.sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));
      setProfiles(sortedProfiles);
    } catch (error) {
      console.error("프로필 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSelectProfile = (profile: Profile) => {
    sessionStorage.setItem('currentProfileNo', profile.profileNo);
    sessionStorage.setItem('currentProfileName', profile.profileName);
    navigate('/');
  };

  const openModal = (profile?: Profile) => {
    if (profile) {
      setEditingProfile(profile);
      setInputValue(profile.profileName);
    } else {
      setEditingProfile(null);
      setInputValue('');
    }
    setIsModalOpen(true);
  };

  // 🟢 삭제 모달 열기
  const openDeleteModal = (profile: Profile) => {
    setEditingProfile(profile);
    setPasswordValue('');
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !inputValue.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingProfile) {
        const profileRef = doc(db, "users", user.uid, "profiles", editingProfile.profileNo);
        await updateDoc(profileRef, { profileName: inputValue });
      } else {
        const parentSnap = await getDoc(doc(db, "users", user.uid));
        const parentAgency = parentSnap.exists() ? parentSnap.data().agency : "개인";

        const newNo = Math.floor(100000 + Math.random() * 900000).toString();
        const profileData = {
          profileNo: newNo,
          profileName: inputValue,
          avatar: "👶",
          points: 0,
          isMain: false,
          agency: parentAgency,
          parentUid: user.uid,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "users", user.uid, "profiles", newNo), profileData);
      }
      
      setIsModalOpen(false);
      fetchProfiles();
    } catch (error) {
      console.error("작업 실패:", error);
      alert("처리에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 자녀 프로필 삭제 로직 (비밀번호 재인증 포함)
  const handleDeleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !editingProfile || !passwordValue) return;

    setIsSubmitting(true);
    try {
      // 1. 비밀번호 재인증
      const credential = EmailAuthProvider.credential(user.email!, passwordValue);
      await reauthenticateWithCredential(user, credential);

      // 2. Firestore 데이터 삭제
      await deleteDoc(doc(db, "users", user.uid, "profiles", editingProfile.profileNo));
      
      alert("프로필이 삭제되었습니다.");
      setIsDeleteModalOpen(false);
      fetchProfiles();
    } catch (error: any) {
      console.error("삭제 실패:", error);
      if (error.code === 'auth/wrong-password') {
        alert("비밀번호가 일치하지 않습니다.");
      } else {
        alert("삭제 중 오류가 발생했습니다.\n비밀번호를 알맞게 입력했는지 확인해 주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-green-500" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] max-w-[430px] mx-auto font-pretendard relative overflow-hidden">
      <Header title={`자녀 선택`} showBack={true} />
      
      <div className="p-6 space-y-8">
        <section>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">보호자 프로필</h3>
          {profiles.filter(p => p.isMain).map(profile => (
            <button key={profile.profileNo} onClick={() => handleSelectProfile(profile)} className="w-full bg-white p-5 rounded-[28px] flex items-center justify-between shadow-sm border-2 border-transparent active:scale-95 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-100"><UserCircle2 size={32} /></div>
                <div className="text-left">
                  <div className="font-black text-gray-800 text-lg">{profile.profileName} <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full ml-1 font-bold">나</span></div>
                  <div className="text-xs text-gray-400 font-bold tracking-tight">프로필 ID: {profile.profileNo}</div>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>
          ))}
        </section>

        <section>
          <div className="flex justify-between items-center mb-4 ml-1">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">함께하는 자녀</h3>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">총 {profiles.filter(p => !p.isMain).length}명</span>
          </div>
          <div className="space-y-3">
            {profiles.filter(p => !p.isMain).map((profile) => (
              <div key={profile.profileNo} className="relative group">
                <button onClick={() => handleSelectProfile(profile)} className="w-full bg-white p-4 rounded-[24px] flex items-center justify-between shadow-sm border border-gray-100 active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl"><Baby size={24} className="text-orange-400" /></div>
                    <div className="text-left">
                      <div className="font-bold text-gray-700">{profile.profileName}</div>
                      <div className="text-[10px] text-gray-400 font-bold">{profile.points.toLocaleString()} 포인트</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* 🟢 삭제 버튼 추가 */}
                    <div onClick={(e) => { e.stopPropagation(); openDeleteModal(profile); }} className="p-2 hover:bg-red-50 rounded-full text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </div>
                    <div onClick={(e) => { e.stopPropagation(); openModal(profile); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-300 hover:text-green-500 transition-colors">
                      <Edit2 size={16} />
                    </div>
                    <ChevronRight size={18} className="text-gray-200" />
                  </div>
                </button>
              </div>
            ))}
            <button onClick={() => openModal()} className="w-full py-5 rounded-[24px] border-2 border-dashed border-gray-200 text-gray-400 font-bold flex items-center justify-center gap-2 hover:bg-white hover:border-green-300 hover:text-green-500 transition-all active:scale-95">
              <Plus size={18} /> 자녀 추가하기
            </button>
          </div>
        </section>
      </div>

      {/* 이름 수정/추가 모달 (기존 디자인 유지) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)}/>
          <div className="relative w-full max-w-[430px] bg-white rounded-t-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-800">{editingProfile ? "이름 수정하기" : "새 자녀 추가"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input autoFocus type="text" placeholder="아이의 닉네임을 입력해주세요" className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl py-4 px-5 outline-none font-bold text-gray-700" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm">취소</button>
                <button type="submit" disabled={isSubmitting || !inputValue.trim()} className="flex-[2] py-4 bg-green-500 disabled:bg-gray-200 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Check size={18} /> {editingProfile ? "수정 완료" : "프로필 생성"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🟢 자녀 삭제 확인 모달 (기존 모달 디자인 시스템 활용) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsDeleteModalOpen(false)}/>
          <div className="relative w-full max-w-[430px] bg-white rounded-t-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-black text-gray-800">자녀 프로필 삭제</h2>
              <button onClick={() => setIsDeleteModalOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400"><X size={20} /></button>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-6">'{editingProfile?.profileName}' 아이의 모든 데이터가 삭제됩니다.<br/>보안을 위해 비밀번호를 입력해주세요.</p>
            
            <form onSubmit={handleDeleteProfile} className="space-y-6">
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  autoFocus 
                  type="password" 
                  placeholder="계정 비밀번호" 
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl py-4 pl-14 pr-5 outline-none font-bold text-gray-700" 
                  value={passwordValue} 
                  onChange={(e) => setPasswordValue(e.target.value)} 
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm">취소</button>
                <button type="submit" disabled={isSubmitting || !passwordValue.trim()} className="flex-[2] py-4 bg-red-500 disabled:bg-gray-200 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Trash2 size={18} /> 삭제 확정</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSelection;