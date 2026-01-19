import React from 'react';
import Header from '../components/Header';

const TermsPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white font-pretendard">
            <Header title="이용약관" showBack={true} />

            <main className="p-6 pt-2 pb-20 overflow-y-auto">
                <div className="space-y-8">
                    <section>
                        <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-5 bg-green-500 rounded-full"></span>
                            제 1조 (목적)
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            본 약관은 '쏙쏙분리 똑똑분리' 서비스(이하 "서비스")가 제공하는 모든 기능의 이용 조건 및 절차, 이용자와 서비스 제공자의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-5 bg-green-500 rounded-full"></span>
                            제 2조 (서비스의 제공)
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            서비스는 이용자에게 올바른 분리배출 방법 학습 퀴즈, 활동 포인트 적립, 랭킹 시스템 등의 교육 콘텐츠를 제공합니다.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-5 bg-green-500 rounded-full"></span>
                            제 3조 (이용자의 의무)
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            이용자는 본 서비스를 교육적 목적으로만 사용해야 하며, 부정한 방법으로 점수를 획득하거나 타인의 계정을 도용해서는 안 됩니다.
                        </p>
                    </section>

                    <div className="p-5 bg-gray-50 rounded-[24px] border border-gray-100">
                        <p className="text-[12px] text-gray-400 font-bold text-center">
                            본 약관은 2026년 1월 1일부터 시행됩니다.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TermsPage;