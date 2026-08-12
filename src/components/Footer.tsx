import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-10 py-8 px-5 bg-[#F8F9FA] text-center border-t border-[#EEEEEE] mb-0">
      <div className="flex justify-center items-center gap-4 mb-3">
        <a href="/pages/terms" className="text-[12px] text-[#6C757D] no-underline font-semibold hover:text-gray-900 transition-colors">이용약관</a>
        <span className="text-[#DEE2E6] text-[10px]">|</span>
        <a href="/pages/privacy" className="text-[12px] text-[#212529] no-underline font-semibold hover:text-gray-900 transition-colors">개인정보처리방침</a>
        <span className="text-[#DEE2E6] text-[10px]">|</span>
        <a href="mailto:support@ssok-ddok.kr" className="text-[12px] text-[#6C757D] no-underline font-semibold hover:text-gray-900 transition-colors">문의하기</a>
      </div>
      <div className="text-[11px] text-[#ADB5BD] leading-relaxed font-pretendard">
        © 2026 쏙쏙분리 똑똑분리. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;