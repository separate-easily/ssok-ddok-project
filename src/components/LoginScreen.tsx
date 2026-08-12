import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Recycle, LogIn, UserPlus } from 'lucide-react';

// Supabase info
const projectId = "rfhvdpsfawxcommkajli";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmaHZkcHNmYXd4Y29tbWthamxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTc1OTUsImV4cCI6MjA4MjA3MzU5NX0.BCFLmVFKRGD5tx0x6ZqK4jpnGGIj3V7vPJAGB-nOrVc";

interface LoginScreenProps {
  onLogin: (role: 'admin' | 'user') => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
  const [signupName, setSignupName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-edd517d1/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ 
            email: loginEmail, 
            password: loginPassword 
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // 관리자 계정이면 admin, 일반 사용자면 user
        onLogin(data.role);
      } else {
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    // Validate password confirmation
    if (signupPassword !== signupPasswordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      setError('비밀번호��� 최소 6자 이상이어야 합니다.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-edd517d1/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ 
            email: signupEmail, 
            password: signupPassword,
            name: signupName
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message || '회원가입이 완료되었습니다! 로그인해주세요.');
        // Clear signup form
        setSignupEmail('');
        setSignupPassword('');
        setSignupPasswordConfirm('');
        setSignupName('');
      } else {
        setError(data.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <Recycle className="size-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl">쏙쏙분리, 똑똑분리</CardTitle>
          <CardDescription>아동·가정 연계 분리배출 교육 시스템</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-sm font-medium">이메일</label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="login-password" className="text-sm font-medium">비밀번호</label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}
                {successMessage && (
                  <p className="text-sm text-green-600 text-center">{successMessage}</p>
                )}
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  disabled={isLoading}
                  size="lg"
                >
                  <LogIn className="mr-2 size-5" />
                  {isLoading ? '로그인 중...' : '로그인'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="signup-name" className="text-sm font-medium">이름</label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="이름을 입력하세요"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium">이메일</label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium">비밀번호</label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="비밀번호 (최소 6자)"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-password-confirm" className="text-sm font-medium">비밀번호 확인</label>
                  <Input
                    id="signup-password-confirm"
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={signupPasswordConfirm}
                    onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}
                {successMessage && (
                  <p className="text-sm text-green-600 text-center">{successMessage}</p>
                )}
                <Button 
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  size="lg"
                >
                  <UserPlus className="mr-2 size-5" />
                  {isLoading ? '가입 중...' : '회원가입'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}