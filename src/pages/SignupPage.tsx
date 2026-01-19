import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, ChevronLeft, Search, Check, AlertCircle } from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

const SignupPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [agencies, setAgencies] = useState<string[]>([]);
  const [selectedAgency, setSelectedAgency] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 🟢 약관 동의 상태 추가
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [isOver14, setIsOver14] = useState(false);
  
  // 🟢 경고 모달 상태
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

  const generateProfileNo = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  useEffect(() => {
    const searchAgency = async () => {
      if (searchQuery.length < 2) {
        setAgencies([]);
        return;
      }
      setIsSearching(true);
      try {
        const q = query(
          collection(db, "agencies"), 
          where("name", ">=", searchQuery),
          where("name", "<=", searchQuery + "\uf8ff")
        );
        const querySnapshot = await getDocs(q);
        const results: string[] = [];
        querySnapshot.forEach((doc) => {
          results.push(doc.data().name);
        });
        setAgencies(results);
      } catch (error) {
        console.error("기관 검색 오류:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(() => {
      searchAgency();
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 약관 동의 체크 (하나라도 안 되어있으면 팝업 노출)
    if (!agreedTerms || !agreedPrivacy || !isOver14) {
      setIsWarningModalOpen(true);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      const profileNo = generateProfileNo();
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        name,
        agency: selectedAgency || "개인",
        createdAt: new Date().toISOString(),
      });

      await setDoc(doc(db, "users", user.uid, "profiles", profileNo), {
        profileNo: profileNo,
        profileName: `${name}`,
        avatar: "👶",
        points: 0,
        isMain: true,
        parentUid: user.uid,
        createdAt: new Date().toISOString(),
      });

      sessionStorage.setItem('currentProfileNo', profileNo);
      navigate('/');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-[430px] mx-auto font-pretendard relative">
      <div className="p-6">
        {/* Header 유지 */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 p-2 -ml-2 hover:bg-gray-100 rounded-full w-fit transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        <h1 className="text-3xl font-black text-gray-900 mb-2 leading-tight">지구 지킴이<br />첫 걸음 시작하기</h1>
        <p className="text-gray-400 font-medium mb-1 text-sm">정보를 입력하고 회원가입을 완료해주세요.</p>
        <p className="text-red-400 font-bold mb-10 text-[12px]">※ 회원가입은 만 14세 이상만 가능합니다.</p>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 ml-1">이름</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input required type="text" placeholder="이름을 입력해주세요"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 ml-1">이메일 주소</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input required type="email" placeholder="example@gmail.com"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2 relative">
            <label className="text-xs font-bold text-gray-400 ml-1">소속 기관 (선택)</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input type="text" placeholder="유치원 또는 학교 검색"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                value={selectedAgency || searchQuery} onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedAgency('');
                }} />
              {selectedAgency && <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />}
              {!selectedAgency && searchQuery && <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />}
            </div>

            {!selectedAgency && searchQuery.length >= 2 && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-48 overflow-y-auto">
                {isSearching ? <div className="p-4 text-center text-xs text-gray-400">검색 중...</div> :
                  agencies.length > 0 ? agencies.map((agency) => (
                    <button key={agency} type="button" onClick={() => setSelectedAgency(agency)}
                      className="w-full text-left px-5 py-3 text-sm hover:bg-green-50 font-medium text-gray-600 border-b last:border-none border-gray-50">
                      {agency}
                    </button>
                  )) : <div className="p-4 text-center text-xs text-gray-400">검색 결과가 없습니다.</div>
                }
              </div>
            )}
          </div>

          <div className="space-y-2 pb-2">
            <label className="text-xs font-bold text-gray-400 ml-1">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input required type="password" placeholder="8자 이상 입력"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          {/* 약관 동의 섹션 */}
          <div className="space-y-3 pt-2 mb-10">
            <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">약관 동의</label>
            <div className="bg-gray-50 rounded-[24px] p-5 space-y-4">
              <CheckboxItem
                label="만 14세 이상입니다 (필수)"
                checked={isOver14}
                onChange={setIsOver14}
              />
              <CheckboxItem
                label="이용약관 동의 (필수)"
                checked={agreedTerms}
                onChange={setAgreedTerms}
                onViewDetail={() => window.open('/pages/terms', '_blank')} // 실제 경로로 수정 가능
              />
              <CheckboxItem
                label="개인정보 처리방침 동의 (필수)"
                checked={agreedPrivacy}
                onChange={setAgreedPrivacy}
                onViewDetail={() => window.open('/pages/privacy', '_blank')}
              />
            </div>
          </div>

          <button type="submit"
            className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold shadow-lg shadow-green-100 transition-all active:scale-[0.98]">
            가입하기
          </button>
        </form>
      </div>

      {/* 약관 비동의 안내 팝업 (Dimmed Modal) */}
      {isWarningModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsWarningModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-5">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">약관에 동의해주세요</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
              필수 약관에 모두 동의하셔야<br />가입을 완료할 수 있습니다.
            </p>
            <button 
              onClick={() => setIsWarningModalOpen(false)}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black active:scale-[0.98] transition-all shadow-lg shadow-gray-200"
            >
              확인했습니다
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 체크박스 내부 컴포넌트
const CheckboxItem = ({ 
  label, 
  checked, 
  onChange, 
  onViewDetail 
}: { 
  label: string, 
  checked: boolean, 
  onChange: (val: boolean) => void,
  onViewDetail?: () => void 
}) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChange(!checked)}>
      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${checked ? 'bg-green-500 border-green-500 shadow-sm shadow-green-100' : 'bg-white border-gray-200'}`}>
        {checked && <Check size={14} className="text-white stroke-[4px]" />}
      </div>
      <span className={`text-sm font-bold transition-colors ${checked ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-500'}`}>
        {label}
      </span>
    </div>
    
    {onViewDetail && (
      <button 
        type="button"
        onClick={onViewDetail}
        className="text-[11px] font-bold text-gray-400 hover:text-gray-600 underline underline-offset-2 px-1"
      >
        전문 보기
      </button>
    )}
  </div>
);

export default SignupPage;