import React from 'react';
import Header from '../components/Header';

const PrivacyPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white font-pretendard text-gray-900">
            <Header title="개인정보 처리방침" showBack={true} />

            <main className="max-w-2xl mx-auto w-full p-6 pt-4 pb-20">
                {/* 상단 안내 문구 */}
                <header className="mt-2 mb-10">
                    <h2 className="text-2xl font-bold tracking-tight">개인정보 처리방침</h2>
                    <p className="mt-3 text-[15px] text-gray-500 leading-relaxed">
                        <strong className="text-gray-900 font-bold">쏙쏙분리 똑똑분리</strong>는 이용자의 개인정보를 소중하게 생각하며, 관련 법령을 준수합니다. 본 방침은 2026년 1월 1일부터 시행됩니다.
                    </p>
                </header>

                <div className="space-y-12">
                    {/* 1. 처리 목적 */}
                    <section className="border-t border-gray-100 pt-6">
                        <h3 className="text-base font-bold text-gray-900 mb-4">
                            1. 개인정보 처리 목적
                        </h3>
                        <ul className="space-y-2 text-[15px] text-gray-600 leading-relaxed">
                            <li>• <span className="font-semibold text-gray-800">회원 관리:</span> 가입 의사 확인, 본인 식별, 서비스 부정 이용 방지</li>
                            <li>• <span className="font-semibold text-gray-800">서비스 제공:</span> 퀴즈 기록 저장, 포인트 및 랭킹, 포인트 교환 상점 등의 전반적인 시스템 운영</li>
                        </ul>
                    </section>

                    {/* 2. 처리 항목 */}
                    <section className="border-t border-gray-100 pt-6">
                        <h3 className="text-base font-bold text-gray-900 mb-4">
                            2. 처리하는 개인정보 항목
                        </h3>
                        <div className="overflow-hidden border-y border-gray-100">
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900 w-24">필수 정보</th>
                                        <td className="px-2 py-3 text-gray-600">이메일, 비밀번호, 이름(또는 닉네임)</td>
                                    </tr>
                                    <tr>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900">선택 정보</th>
                                        <td className="px-2 py-3 text-gray-600">소속 기관명 (어린이집, 유치원, 학교 등)</td>
                                    </tr>
                                    <tr>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-900">자동 수집</th>
                                        <td className="px-2 py-3 text-gray-600">서비스 이용 기록, 접속 로그, IP주소</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* 3. 처리 위탁 및 국외 이전 (추가됨) */}
                    <section className="border-t border-gray-100 pt-6">
                        <h3 className="text-base font-bold text-gray-900 mb-4">
                            3. 개인정보 처리 위탁 및 국외 이전
                        </h3>
                        <div className="space-y-4 text-[15px] text-gray-600 leading-relaxed">
                            <p>서비스 제공을 위해 아래와 같이 업무를 위탁하고 있으며, 클라우드 서비스 이용에 따라 데이터가 국외로 이전될 수 있습니다.</p>
                            <div className="overflow-hidden border border-gray-100 rounded-lg">
                                <table className="w-full text-[13px] text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-3 py-2 font-semibold text-gray-700">구분</th>
                                            <th className="px-3 py-2 font-semibold text-gray-700">업체명</th>
                                            <th className="px-3 py-2 font-semibold text-gray-700">내용/위치</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <tr>
                                            <td className="px-3 py-2 text-gray-900 font-medium">국내 위탁</td>
                                            <td className="px-3 py-2">카페24(주)</td>
                                            <td className="px-3 py-2 text-gray-500">웹호스팅 및 서버 관리</td>
                                        </tr>
                                        <tr>
                                            <td className="px-3 py-2 text-gray-900 font-medium">국외 이전</td>
                                            <td className="px-3 py-2">Google LLC</td>
                                            <td className="px-3 py-2 text-gray-500">데이터베이스 저장 (서울 리전 외)</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* 4. 안전성 확보 조치 (추가됨) */}
                    <section className="border-t border-gray-100 pt-6">
                        <h3 className="text-base font-bold text-gray-900 mb-4">
                            4. 개인정보의 안전성 확보 조치
                        </h3>
                        <p className="text-[15px] text-gray-600 leading-relaxed">
                            회사는 이용자의 개인정보를 보호하기 위해 비밀번호 암호화, 보안 프로그램 설치, 개인정보 접근 권한 최소화 등 기술적·관리적 대책을 시행하고 있습니다.
                        </p>
                    </section>

                    {/* 5. 보유 기간 및 파기 */}
                    <section className="border-t border-gray-100 pt-6">
                        <h3 className="text-base font-bold text-gray-900 mb-4">
                            5. 보유 및 이용 기간
                        </h3>
                        <p className="text-[15px] text-gray-600 leading-relaxed">
                            이용자의 개인정보는 원칙적으로 <span className="text-gray-900 font-bold underline decoration-gray-200 underline-offset-4">회원 탈퇴 시 즉시 파기</span>합니다. 단, 관계 법령에 따른 보관 의무가 있는 경우 해당 기간까지 보관합니다.
                        </p>
                    </section>

                    {/* 6. 이용자 권리 */}
                    <section className="border-t border-gray-100 pt-6">
                        <h3 className="text-base font-bold text-gray-900 mb-4">
                            6. 이용자의 권리와 행사방법
                        </h3>
                        <p className="text-[15px] text-gray-600 leading-relaxed">
                            이용자는 언제든지 자신의 개인정보를 조회, 수정하거나 삭제를 요청할 수 있습니다. 이는 본 페이지에 안내된 개인정보 보호책임자에게 연락 주시면 조치하겠습니다.
                        </p>
                    </section>

                    {/* 7. 책임자 및 권익침해 구제 (보완됨) */}
                    <section className="border-t border-gray-100 pt-6">
                        <h3 className="text-base font-bold text-gray-900 mb-4">
                            7. 개인정보 보호책임자 및 민원처리 상담
                        </h3>
                        <div className="text-[15px] text-gray-600 space-y-4">
                            <div>
                                <p className="font-semibold text-gray-800">개인정보 보호책임자</p>
                                <ul className="text-[13px] space-y-1 text-gray-500 pt-2 pl-4">
                                    <li>- 성명: 김OO(배포 전 수정 필요)</li>
                                    <li>- 직위: </li>
                                    <li>- 연락처: support@ssok-ddok.kr</li>
                                </ul>
                            </div>
                            <div className="pt-2">
                                <p className="font-semibold text-gray-800 mb-1">기타 침해 신고 및 상담</p>
                                <p>기타 개인정보침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.</p>
                                <ul className="text-[13px] space-y-1 text-gray-500 pt-2 pl-4">
                                    <li>1. 개인정보 분쟁조정위원회 : (국번없이) 1833-6972 (www.kopico.go.kr)</li>
                                    <li>2. 개인정보침해 신고센터 : (국번없이) 118 (privacy.kisa.or.kr)</li>
                                    <li>3. 경찰청 : (국번없이) 182 (ecrm.police.go.kr)</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>

                <footer className="mt-20 py-8 border-t border-gray-200">
                    <p className="text-xs text-gray-400 text-center tracking-wider font-semibold">
                        시행 일자: 2026년 1월 1일
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default PrivacyPage;