import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, Camera, MessageSquare, Trophy, Gamepad2 } from 'lucide-react';

// Supabase info
const projectId = "rfhvdpsfawxcommkajli";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmaHZkcHNmYXd4Y29tbWthamxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTc1OTUsImV4cCI6MjA4MjA3MzU5NX0.BCFLmVFKRGD5tx0x6ZqK4jpnGGIj3V7vPJAGB-nOrVc";

interface MobileGameProps {
  onLogout: () => void;
}

interface GameItem {
  id: number;
  image: string;
  name: string;
  correctCategory: 'paper' | 'plastic' | 'glass' | 'metal' | 'general';
  categories: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

const GAME_ITEMS: GameItem[] = [
  {
    id: 1,
    image: '📰',
    name: '신문',
    correctCategory: 'paper',
    categories: [
      { id: 'paper', name: '종이류', color: 'bg-blue-500' },
      { id: 'plastic', name: '플라스틱', color: 'bg-yellow-500' },
      { id: 'general', name: '일반쓰레기', color: 'bg-gray-500' }
    ]
  },
  {
    id: 2,
    image: '🥤',
    name: '플라스틱 컵',
    correctCategory: 'plastic',
    categories: [
      { id: 'paper', name: '종이류', color: 'bg-blue-500' },
      { id: 'plastic', name: '플라스틱', color: 'bg-yellow-500' },
      { id: 'general', name: '일반쓰레기', color: 'bg-gray-500' }
    ]
  },
  {
    id: 3,
    image: '🍶',
    name: '유리병',
    correctCategory: 'glass',
    categories: [
      { id: 'glass', name: '유리', color: 'bg-green-500' },
      { id: 'plastic', name: '플라스틱', color: 'bg-yellow-500' },
      { id: 'general', name: '일반쓰레기', color: 'bg-gray-500' }
    ]
  },
  {
    id: 4,
    image: '🥫',
    name: '캔',
    correctCategory: 'metal',
    categories: [
      { id: 'metal', name: '캔류', color: 'bg-orange-500' },
      { id: 'plastic', name: '플라스틱', color: 'bg-yellow-500' },
      { id: 'general', name: '일반쓰레기', color: 'bg-gray-500' }
    ]
  },
  {
    id: 5,
    image: '📦',
    name: '박스',
    correctCategory: 'paper',
    categories: [
      { id: 'paper', name: '종이류', color: 'bg-blue-500' },
      { id: 'plastic', name: '플라스틱', color: 'bg-yellow-500' },
      { id: 'general', name: '일반쓰레기', color: 'bg-gray-500' }
    ]
  },
  {
    id: 6,
    image: '🍜',
    name: '라면 용기',
    correctCategory: 'plastic',
    categories: [
      { id: 'paper', name: '종이류', color: 'bg-blue-500' },
      { id: 'plastic', name: '플라스틱', color: 'bg-yellow-500' },
      { id: 'general', name: '일반쓰레기', color: 'bg-gray-500' }
    ]
  }
];

export function MobileGame({ onLogout }: MobileGameProps) {
  const [currentTab, setCurrentTab] = useState('game');
  const [currentGameItem, setCurrentGameItem] = useState<GameItem | null>(null);
  const [score, setScore] = useState(0);
  const [gameCount, setGameCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [ranking, setRanking] = useState<any[]>([]);
  const [globalRanking, setGlobalRanking] = useState<any[]>([]);
  const [rankingTab, setRankingTab] = useState<'institution' | 'global'>('institution');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'bot', message: string }>>([]);
  const [showImageUpload, setShowImageUpload] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const randomItem = GAME_ITEMS[Math.floor(Math.random() * GAME_ITEMS.length)];
    setCurrentGameItem(randomItem);
    setShowResult(false);
  };

  const handleAnswer = (selectedCategory: string) => {
    if (!currentGameItem) return;

    const correct = selectedCategory === currentGameItem.correctCategory;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(score + 10);
    }

    setGameCount(gameCount + 1);

    // Auto advance to next question after 1.5 seconds
    setTimeout(() => {
      if (gameCount + 1 < 5) {
        startNewGame();
      } else {
        // Game finished
        setCurrentGameItem(null);
      }
    }, 1500);
  };

  const restartGame = () => {
    setScore(0);
    setGameCount(0);
    startNewGame();
  };

  const searchInstitution = async () => {
    if (!institutionName.trim()) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-edd517d1/institution/lookup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ institutionName }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setInstitutionId(data.institution.id);
        loadRanking(data.institution.id);
      }
    } catch (error) {
      console.error('Failed to search institution:', error);
    }
  };

  const loadRanking = async (instId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-edd517d1/ranking/${instId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        // Mask middle character of names
        const maskedRanking = data.ranking.map((item: any) => ({
          ...item,
          name: item.name.length > 2
            ? item.name[0] + '*' + item.name.slice(2)
            : item.name[0] + '*'
        }));
        setRanking(maskedRanking);
      }
    } catch (error) {
      console.error('Failed to load ranking:', error);
    }
  };

  const loadGlobalRanking = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-edd517d1/ranking/global`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        // Mask middle character of names
        const maskedRanking = data.ranking.map((item: any) => ({
          ...item,
          name: item.name.length > 2
            ? item.name[0] + '*' + item.name.slice(2)
            : item.name[0] + '*'
        }));
        setGlobalRanking(maskedRanking);
      }
    } catch (error) {
      console.error('Failed to load global ranking:', error);
    }
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;

    setChatHistory([...chatHistory, { role: 'user', message: chatMessage }]);

    // Simple bot responses for demo
    const responses = [
      '플라스틱은 깨끗이 씻어서 버려주세요! 💧',
      '종이는 물에 젖지 않게 보관했다가 버려주세요! 📰',
      '유리병은 뚜껑을 분리해서 버려주세요! 🍶',
      '캔은 깨끗이 씻어서 찌그러뜨린 후 버려주세요! 🥫',
      '분리수거를 잘하면 환경이 깨끗해져요! 🌍'
    ];

    const botResponse = responses[Math.floor(Math.random() * responses.length)];

    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: 'bot', message: botResponse }]);
    }, 500);

    setChatMessage('');
  };

  const maskName = (name: string) => {
    if (name.length <= 1) return name;
    if (name.length === 2) return name[0] + '*';
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
  };

  return (
    <div className="size-full bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 overflow-auto">
      <div className="max-w-md mx-auto min-h-full flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-green-600">쏙쏙분리 똑똑분리</h1>
          <Button onClick={onLogout} variant="ghost" size="sm">
            <LogOut className="size-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="game">
                <Gamepad2 className="size-4 mr-1" />
                게임
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="size-4 mr-1" />
                챗봇
              </TabsTrigger>
              <TabsTrigger value="ranking">
                <Trophy className="size-4 mr-1" />
                순위
              </TabsTrigger>
            </TabsList>

            {/* Game Tab */}
            <TabsContent value="game" className="space-y-4">
              {currentGameItem ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>분리수거 게임</CardTitle>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">문제 {gameCount + 1}/5</p>
                        <p className="text-lg font-bold text-green-600">{score}점</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="text-8xl mb-4">{currentGameItem.image}</div>
                      <p className="text-2xl font-bold mb-2">{currentGameItem.name}</p>
                      <p className="text-gray-600">어디에 버려야 할까요?</p>
                    </div>

                    {!showResult ? (
                      <div className="grid grid-cols-1 gap-3">
                        {currentGameItem.categories.map((category) => (
                          <Button
                            key={category.id}
                            onClick={() => handleAnswer(category.id)}
                            className={`${category.color} hover:opacity-90 h-16 text-lg`}
                          >
                            {category.name}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-center p-6 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-orange-100'}`}>
                        <p className="text-3xl mb-2">{isCorrect ? '🎉' : '💪'}</p>
                        <p className="text-xl font-bold">
                          {isCorrect ? '정답이에요! 잘했어요!' : '아쉬워요! 다음엔 잘할 수 있어요!'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>게임 완료!</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="text-6xl mb-4">🏆</div>
                    <p className="text-3xl font-bold text-green-600">{score}점</p>
                    <p className="text-gray-600">훌륭해요! 분리수거를 잘 배웠어요!</p>
                    <Button onClick={restartGame} className="w-full" size="lg">
                      다시 하기
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>분리수거 챗봇</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 h-80 overflow-auto space-y-3">
                    {chatHistory.length === 0 && (
                      <div className="text-center text-gray-500 mt-20">
                        <MessageSquare className="size-12 mx-auto mb-2 opacity-50" />
                        <p>분리수거에 대해 궁금한 것을 물어보세요!</p>
                      </div>
                    )}
                    {chatHistory.map((chat, index) => (
                      <div
                        key={index}
                        className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            chat.role === 'user'
                              ? 'bg-green-500 text-white'
                              : 'bg-white text-gray-800'
                          }`}
                        >
                          {chat.message}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowImageUpload(true)}
                      variant="outline"
                      size="icon"
                    >
                      <Camera className="size-4" />
                    </Button>
                    <Input
                      placeholder="질문을 입력하세요..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    />
                    <Button onClick={sendChatMessage}>
                      전송
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ranking Tab */}
            <TabsContent value="ranking" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>순위 보기</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 탭 버튼 */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button
                      onClick={() => setRankingTab('institution')}
                      variant={rankingTab === 'institution' ? 'default' : 'outline'}
                      className="w-full"
                    >
                      우리 기관
                    </Button>
                    <Button
                      onClick={() => {
                        setRankingTab('global');
                        loadGlobalRanking();
                      }}
                      variant={rankingTab === 'global' ? 'default' : 'outline'}
                      className="w-full"
                    >
                      전체 순위
                    </Button>
                  </div>

                  {/* 우리 기관 탭 */}
                  {rankingTab === 'institution' && (
                    <>
                      <div className="flex gap-2">
                        <Input
                          placeholder="기관 이름 입력"
                          value={institutionName}
                          onChange={(e) => setInstitutionName(e.target.value)}
                        />
                        <Button onClick={searchInstitution}>
                          검색
                        </Button>
                      </div>

                      {ranking.length > 0 && (
                        <div className="space-y-2">
                          {ranking.map((item, index) => (
                            <div
                              key={index}
                              className={`flex items-center justify-between p-4 rounded-lg ${
                                index === 0
                                  ? 'bg-yellow-50 border-2 border-yellow-400'
                                  : index === 1
                                  ? 'bg-gray-50 border-2 border-gray-400'
                                  : index === 2
                                  ? 'bg-orange-50 border-2 border-orange-400'
                                  : 'bg-white border'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-center">
                                  <div className="text-2xl">
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🐰'}
                                  </div>
                                  <div className="text-sm font-bold">{item.rank}위</div>
                                </div>
                                <div>
                                  <p className="font-semibold">{item.name}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-green-600">{item.points}점</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {ranking.length === 0 && institutionId && (
                        <p className="text-center text-gray-500 py-8">
                          아직 등록된 순위가 없습니다.
                        </p>
                      )}
                    </>
                  )}

                  {/* 전체 순위 탭 */}
                  {rankingTab === 'global' && (
                    <>
                      {globalRanking.length > 0 && (
                        <div className="space-y-2">
                          {globalRanking.map((item, index) => (
                            <div
                              key={index}
                              className={`flex items-center justify-between p-4 rounded-lg ${
                                index === 0
                                  ? 'bg-yellow-50 border-2 border-yellow-400'
                                  : index === 1
                                  ? 'bg-gray-50 border-2 border-gray-400'
                                  : index === 2
                                  ? 'bg-orange-50 border-2 border-orange-400'
                                  : 'bg-white border'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-center">
                                  <div className="text-2xl">
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🐰'}
                                  </div>
                                  <div className="text-sm font-bold">{item.rank}위</div>
                                </div>
                                <div>
                                  <p className="font-semibold">{item.name}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-green-600">{item.points}점</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {globalRanking.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                          전체 순위를 불러오는 중입니다...
                        </p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Image Upload Dialog */}
        <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>사진 업로드</DialogTitle>
              <DialogDescription>
                분리수거할 물건의 사진을 찍어주세요!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="w-full"
              />
              <Button className="w-full">
                분석하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}