import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, ArrowRight, Eye, Plus, Check, X } from 'lucide-react';

interface GameScreenProps {
  gameType: string;
  onBack: () => void;
  selectedInstitution: { id: string; name: string } | null;
}

// Supabase info
const projectId = "rfhvdpsfawxcommkajli";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmaHZkcHNmYXd4Y29tbWthamxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTc1OTUsImV4cCI6MjA4MjA3MzU5NX0.BCFLmVFKRGD5tx0x6ZqK4jpnGGIj3V7vPJAGB-nOrVc";

interface Child {
  qrId: string;
  name: string;
  age: string;
  points: number;
}

// 분류 게임 문제
const CLASSIFICATION_ITEMS = [
  { emoji: '📰', name: '신문', answer: '종이류' },
  { emoji: '🥤', name: '플라스틱 컵', answer: '플라스틱' },
  { emoji: '🍶', name: '유리병', answer: '유리' },
  { emoji: '🥫', name: '캔', answer: '캔' },
  { emoji: '📦', name: '박스', answer: '종이류' },
  { emoji: '🍜', name: '라면 용기', answer: '플라스틱' },
  { emoji: '🧃', name: '음료수팩', answer: '플라스틱' },
  { emoji: '🍾', name: '소주병', answer: '유리' },
  { emoji: '📄', name: '종이', answer: '종이류' },
  { emoji: '🥛', name: '우유팩', answer: '플라스틱' },
];

// OX 퀴즈 문제
const OX_QUIZ_ITEMS = [
  { emoji: '♻️', question: '플라스틱 병은 재활용할 수 있다', answer: true },
  { emoji: '🥤', question: '플라스틱 컵은 일반 쓰레기다', answer: false },
  { emoji: '📰', question: '신문은 종이류로 분리수거한다', answer: true },
  { emoji: '🍶', question: '유리병은 플라스틱으로 분리수거한다', answer: false },
  { emoji: '🥫', question: '캔은 재활용이 불가능하다', answer: false },
  { emoji: '📦', question: '박스는 종이류로 분리수거한다', answer: true },
  { emoji: '🌍', question: '분리수거는 지구를 보호한다', answer: true },
  { emoji: '🗑️', question: '모든 쓰레기는 같은 통에 버려도 된다', answer: false },
];

// 카드 매칭 게임
const CARD_ITEMS = [
  { emoji: '♻️', name: '재활용' },
  { emoji: '📰', name: '신문' },
  { emoji: '🥤', name: '플라스틱' },
  { emoji: '🍶', name: '유리병' },
  { emoji: '🥫', name: '캔' },
  { emoji: '📦', name: '박스' },
  { emoji: '🌍', name: '지구' },
  { emoji: '🗑️', name: '쓰레기통' },
];

export function GameScreen({ gameType, onBack, selectedInstitution }: GameScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [points, setPoints] = useState(10);

  useEffect(() => {
    if (gameType === '쉬움-분류게임') {
      setItems(CLASSIFICATION_ITEMS);
    } else if (gameType === '쉬움-OX퀴즈') {
      setItems(OX_QUIZ_ITEMS);
    } else if (gameType === '쉬움-카드매칭') {
      setItems(CARD_ITEMS);
    }
  }, [gameType]);

  useEffect(() => {
    if (selectedInstitution) {
      loadChildren();
    }
  }, [selectedInstitution]);

  const loadChildren = async () => {
    if (!selectedInstitution) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-edd517d1/child/list/${selectedInstitution.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setChildren(data.children);
      }
    } catch (error) {
      console.error('Failed to load children:', error);
    }
  };

  const addPoints = async () => {
    if (!selectedChildId || !selectedInstitution) {
      alert('아이를 먼저 선택해주세요!');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-edd517d1/child/add-points`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            institutionId: selectedInstitution.id,
            qrId: selectedChildId,
            points: points,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert(`${points}점이 추가되었습니다!`);
        setSelectedChildId('');
        setPoints(10);
        loadChildren();
      } else {
        alert('포인트 추가 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to add points:', error);
      alert('포인트 추가 중 오류가 발생했습니다.');
    }
  };

  const currentItem = items[currentIndex];

  const handleNext = () => {
    setShowAnswer(false); // 다음 문제로 넘어갈 때 정답 숨기기
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrevious = () => {
    setShowAnswer(false); // 이전 문제로 갈 때 정답 숨기기
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(items.length - 1);
    }
  };

  if (!currentItem) return null;

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex">
      {/* Left Side - Game Screen */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
        {/* Header */}
        <div className="bg-white shadow-md p-4 flex justify-between items-center">
          <Button onClick={onBack} variant="ghost" size="sm">
            <ArrowLeft className="size-4 mr-2" />
            뒤로 가기
          </Button>
          <div className="text-center">
            <p className="font-semibold">{gameType}</p>
            <p className="text-sm text-gray-600">
              {currentIndex + 1} / {items.length}
            </p>
          </div>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="max-w-4xl w-full">
            <div className="p-12 text-center">
              {gameType === '쉬움-분류게임' && (
                <>
                  <div className="text-9xl mb-8 animate-bounce">{currentItem.emoji}</div>
                  <h2 className="text-5xl font-bold mb-4">{currentItem.name}</h2>
                  <p className="text-2xl text-gray-600 mb-8">
                    어떤 카드를 들어야 할까요?
                  </p>
                  {showAnswer && (
                    <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300">
                      <p className="text-xl font-semibold text-green-700">
                        정답: {currentItem.answer}
                      </p>
                    </div>
                  )}
                </>
              )}

              {gameType === '쉬움-OX퀴즈' && (
                <>
                  <div className="text-9xl mb-8 animate-bounce">{currentItem.emoji}</div>
                  <h2 className="text-5xl font-bold mb-4">{currentItem.question}</h2>
                  <p className="text-2xl text-gray-600 mb-8">
                    이 문장은 맞는 문장인가요?
                  </p>
                  
                  {/* OX 버튼 */}
                  <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto mb-6">
                    <button
                      key="O"
                      onClick={() => setShowAnswer(true)}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg transition-all hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: '#3B82F620',
                        border: `3px solid #3B82F6`,
                      }}
                    >
                      <Check
                        className="size-16"
                        style={{ color: '#3B82F6' }}
                      />
                      <span className="font-bold" style={{ color: '#3B82F6' }}>
                        O
                      </span>
                    </button>
                    <button
                      key="X"
                      onClick={() => setShowAnswer(true)}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg transition-all hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: '#F9731620',
                        border: `3px solid #F97316`,
                      }}
                    >
                      <X
                        className="size-16"
                        style={{ color: '#F97316' }}
                      />
                      <span className="font-bold" style={{ color: '#F97316' }}>
                        X
                      </span>
                    </button>
                  </div>

                  {/* 정답 표시 */}
                  {showAnswer && (
                    <div
                      className="p-6 rounded-lg border-4 mx-auto max-w-md"
                      style={{
                        backgroundColor: currentItem.answer ? '#3B82F6' : '#F97316',
                        borderColor: currentItem.answer ? '#3B82F6' : '#F97316',
                      }}
                    >
                      <p className="text-3xl font-bold text-white drop-shadow-lg">
                        정답: {currentItem.answer ? 'O' : 'X'}
                      </p>
                    </div>
                  )}
                </>
              )}

              {gameType === '쉬움-카드매칭' && (
                <>
                  <div className="text-9xl mb-8 animate-pulse">{currentItem.emoji}</div>
                  <h2 className="text-5xl font-bold mb-4">{currentItem.name}</h2>
                  <p className="text-2xl text-gray-600 mb-8">
                    같은 그림이 있는 카드를 찾아서 들어주세요!
                  </p>
                  <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-300">
                    <p className="text-xl font-semibold text-purple-700">
                      아이들이 같은 그림의 카드를 들면 정답입니다!
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <div className="bg-white shadow-md p-6">
          <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
            <Button
              onClick={handlePrevious}
              size="lg"
              className="flex-1 bg-gray-500 hover:bg-gray-600"
            >
              <ArrowLeft className="size-5 mr-2" />
              이전 문제
            </Button>
            
            {!showAnswer && gameType === '쉬움-분류게임' && (
              <Button
                onClick={() => setShowAnswer(true)}
                size="lg"
                className="flex-1 bg-yellow-500 hover:bg-yellow-600"
              >
                <Eye className="size-5 mr-2" />
                정답 보기
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              size="lg"
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              다음 문제
              <ArrowRight className="size-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side - Point Management Panel */}
      <div className="w-96 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h3 className="font-bold text-xl mb-2">포인트 관리</h3>
          <p className="text-sm text-gray-600">{selectedInstitution?.name}</p>
        </div>

        <div className="p-6 border-b space-y-4">
          {/* Points Input */}
          <div>
            <label className="block text-sm font-medium mb-2">포인트</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="1"
              max="100"
            />
          </div>

          {/* Add Points Button */}
          <Button
            onClick={addPoints}
            className="w-full bg-green-500 hover:bg-green-600"
            size="lg"
            disabled={!selectedChildId}
          >
            <Plus className="mr-2 size-5" />
            포인트 추가
          </Button>
        </div>

        {/* Children List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h4 className="font-semibold mb-3">아이 선택</h4>
          <div className="space-y-2">
            {children.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                등록된 아이가 없습니다
              </p>
            ) : (
              children
                .sort((a, b) => b.points - a.points)
                .map((child, index) => (
                  <Card
                    key={child.qrId}
                    className={`p-3 cursor-pointer transition-all ${
                      selectedChildId === child.qrId
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedChildId(child.qrId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{child.name}</p>
                          <p className="text-xs text-gray-500">{child.age}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{child.points}점</p>
                      </div>
                    </div>
                  </Card>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}