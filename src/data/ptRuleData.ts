/**
 * PT_RULE (평택시 시행규칙) 데이터
 *
 * 근거 조례:
 * - 평택시 폐기물 관리 조례 (조례 제2293호, 시행 2023.8.3, 전부개정)
 * - 평택시 폐기물처리시설 설치·운영 및 주변지역지원 등에 관한 조례
 *   (조례 제2370호, 시행 2024.4.1)
 *
 * 포함 내용:
 * 1. 대형폐기물 수수료 별표 (조례 별표1)
 * 2. 동/읍/면별 수거 일정
 * 3. 전용 수거함 위치
 * 4. 평택시 자원순환 시설 정보
 * 5. 생활폐기물 배출 규정 (조례 제7조~제9조)
 */

import { AdditionalInput } from "./rulebookSchema";

// ========================================
// 1. 대형폐기물 수수료 별표 (조례 별표1, 개정 2023.8.3)
// ========================================
export interface BulkyWasteFee {
  id: number;
  item: string;
  sizeOrSpec: string;
  fee: number; // 원
  note?: string;
}

export const BULKY_WASTE_FEE_TABLE: BulkyWasteFee[] = [
  // 1~10
  { id: 1, item: "가방류", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 2, item: "가스대", sizeOrSpec: "개당", fee: 2000 },
  { id: 3, item: "가스오븐레인지", sizeOrSpec: "높이 1m이상", fee: 4000 },
  { id: 3, item: "가스오븐레인지", sizeOrSpec: "높이 1m미만", fee: 2000 },
  { id: 4, item: "가스레인지", sizeOrSpec: "화두 3개 이상", fee: 3000 },
  { id: 4, item: "가스레인지", sizeOrSpec: "화두 2개 미만", fee: 2000 },
  { id: 4, item: "가스레인지", sizeOrSpec: "오븐 포함", fee: 3000 },
  { id: 4, item: "가스레인지 후드", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 5, item: "가스히터", sizeOrSpec: "연료통내장형", fee: 5000 },
  { id: 5, item: "가스히터", sizeOrSpec: "연료통분리형", fee: 3000 },
  { id: 6, item: "가습기", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 7, item: "간판", sizeOrSpec: "60*180cm이상", fee: 7000 },
  { id: 7, item: "간판", sizeOrSpec: "60*180cm미만", fee: 4000 },
  { id: 7, item: "입간판", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 8, item: "개수대", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 9, item: "거울", sizeOrSpec: "1㎡당", fee: 2000 },
  { id: 10, item: "게시판(칠판)", sizeOrSpec: "모든규격", fee: 2000 },
  // 11~20
  { id: 11, item: "고무통", sizeOrSpec: "90*100cm이상", fee: 4000 },
  { id: 11, item: "고무통", sizeOrSpec: "90*100cm미만", fee: 3000 },
  { id: 11, item: "고무통", sizeOrSpec: "70*80cm이하", fee: 2000 },
  { id: 12, item: "공기청정기", sizeOrSpec: "높이 1m 이상", fee: 3000 },
  { id: 12, item: "공기청정기", sizeOrSpec: "높이 1m 미만", fee: 2000 },
  { id: 13, item: "금고", sizeOrSpec: "대형(70*100cm 이상)", fee: 7000 },
  { id: 13, item: "금고", sizeOrSpec: "중형(60*100cm 미만)", fee: 6000 },
  { id: 13, item: "금고", sizeOrSpec: "소형(50*60cm 미만)", fee: 5000 },
  { id: 14, item: "기름탱크", sizeOrSpec: "2드럼 초과", fee: 5000 },
  { id: 14, item: "기름탱크", sizeOrSpec: "2드럼 이하", fee: 3000 },
  { id: 15, item: "깨진유리", sizeOrSpec: "1㎡당", fee: 2000 },
  { id: 16, item: "나무묶음", sizeOrSpec: "20kg당", fee: 2000 },
  { id: 17, item: "난로", sizeOrSpec: "가스난로", fee: 1000 },
  { id: 17, item: "난로", sizeOrSpec: "석유난로", fee: 4000 },
  { id: 17, item: "난로", sizeOrSpec: "전기난로", fee: 2000 },
  { id: 18, item: "냉장고", sizeOrSpec: "1000ℓ이상", fee: 14000 },
  { id: 18, item: "냉장고", sizeOrSpec: "500ℓ이상~1000ℓ미만", fee: 8000 },
  { id: 18, item: "냉장고", sizeOrSpec: "300ℓ이상~500ℓ미만", fee: 6000 },
  { id: 18, item: "냉장고", sizeOrSpec: "300ℓ미만", fee: 4000 },
  { id: 19, item: "녹즙기", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 20, item: "다리미", sizeOrSpec: "개당", fee: 2000 },
  // 21~30
  { id: 21, item: "다리미판", sizeOrSpec: "모든규격", fee: 1000 },
  { id: 22, item: "단지(항아리)", sizeOrSpec: "50cm이상", fee: 3000 },
  { id: 22, item: "단지(항아리)", sizeOrSpec: "50cm미만", fee: 2000 },
  { id: 23, item: "대리석 식탁", sizeOrSpec: "6인용 이상", fee: 18000 },
  { id: 23, item: "대리석 식탁", sizeOrSpec: "6인용 미만", fee: 13000 },
  { id: 24, item: "도마", sizeOrSpec: "모든규격", fee: 1000 },
  { id: 25, item: "도배지", sizeOrSpec: "10kg당", fee: 3000 },
  { id: 26, item: "돌침대", sizeOrSpec: "1인용", fee: 22000 },
  { id: 26, item: "돌침대", sizeOrSpec: "2인용", fee: 28000 },
  { id: 27, item: "돗자리", sizeOrSpec: "4㎡이상", fee: 4000 },
  { id: 27, item: "돗자리", sizeOrSpec: "4㎡미만", fee: 2000 },
  { id: 28, item: "드럼통", sizeOrSpec: "100ℓ이상", fee: 5000 },
  { id: 28, item: "드럼통", sizeOrSpec: "100ℓ미만", fee: 3000 },
  { id: 29, item: "DVD", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 30, item: "라디오", sizeOrSpec: "모든규격", fee: 2000 },
  // 31~40
  { id: 31, item: "라텍스", sizeOrSpec: "2인용", fee: 8000 },
  { id: 31, item: "라텍스", sizeOrSpec: "1인용", fee: 5000 },
  { id: 32, item: "목욕탕 수건함(장식장)", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 33, item: "문갑", sizeOrSpec: "1짝당", fee: 3000 },
  { id: 34, item: "문짝", sizeOrSpec: "목재류", fee: 2000 },
  { id: 34, item: "문짝", sizeOrSpec: "철재류", fee: 3000 },
  { id: 35, item: "물탱크", sizeOrSpec: "1톤당", fee: 4000 },
  { id: 36, item: "밥상", sizeOrSpec: "90*90cm 이상", fee: 3000 },
  { id: 36, item: "밥상", sizeOrSpec: "90*90cm 미만", fee: 2000 },
  { id: 37, item: "벽시계", sizeOrSpec: "대형", fee: 5000 },
  { id: 37, item: "벽시계", sizeOrSpec: "중형", fee: 3000 },
  { id: 37, item: "벽시계", sizeOrSpec: "소형", fee: 2000 },
  { id: 38, item: "변기통", sizeOrSpec: "비데", fee: 4000 },
  { id: 38, item: "변기통", sizeOrSpec: "양변기", fee: 7000 },
  { id: 38, item: "변기통", sizeOrSpec: "좌변기", fee: 4000 },
  { id: 38, item: "변기물통", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 39, item: "병풍", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 40, item: "보일러", sizeOrSpec: "연탄사용", fee: 4000 },
  { id: 40, item: "보일러", sizeOrSpec: "가스사용", fee: 2000 },
  { id: 40, item: "보일러", sizeOrSpec: "기름사용", fee: 5000 },
  // 41~50
  { id: 41, item: "보일러탱크", sizeOrSpec: "높이 1m 미만", fee: 3000 },
  { id: 41, item: "보일러탱크", sizeOrSpec: "높이 1m~1.5m", fee: 5000 },
  { id: 41, item: "보일러탱크", sizeOrSpec: "높이 1.5m이상", fee: 8000 },
  { id: 42, item: "복사기", sizeOrSpec: "모든규격", fee: 8000 },
  { id: 43, item: "블라인드", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 43, item: "버디칼", sizeOrSpec: "모든규격(쪽당)", fee: 2000 },
  { id: 44, item: "비디오", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 45, item: "비키니옷장", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 46, item: "빙수기", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 47, item: "빨래건조대", sizeOrSpec: "1m미만", fee: 2000 },
  { id: 47, item: "빨래건조대", sizeOrSpec: "1m이상", fee: 3000 },
  { id: 48, item: "서랍", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 49, item: "서랍장", sizeOrSpec: "5단 이상", fee: 6000 },
  { id: 49, item: "서랍장", sizeOrSpec: "5단 미만~4단 이상", fee: 5000 },
  { id: 49, item: "서랍장", sizeOrSpec: "4단 미만~3단 이상", fee: 4000 },
  { id: 49, item: "서랍장", sizeOrSpec: "3단 미만", fee: 2000 },
  { id: 50, item: "선풍기", sizeOrSpec: "가정용", fee: 2000 },
  { id: 50, item: "선풍기", sizeOrSpec: "영업용", fee: 3000 },
  // 51~60
  { id: 51, item: "세단기", sizeOrSpec: "모든규격", fee: 6000 },
  { id: 52, item: "세면대", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 53, item: "세탁기", sizeOrSpec: "10kg이상", fee: 9000 },
  { id: 53, item: "세탁기", sizeOrSpec: "10kg이하~5kg이상", fee: 8000 },
  { id: 53, item: "세탁기", sizeOrSpec: "5kg미만", fee: 4000 },
  { id: 54, item: "소파(응접세트)", sizeOrSpec: "6인용", fee: 8000 },
  { id: 54, item: "소파(응접세트)", sizeOrSpec: "5인용", fee: 7000 },
  { id: 54, item: "소파(응접세트)", sizeOrSpec: "4인용", fee: 6000 },
  { id: 54, item: "소파(응접세트)", sizeOrSpec: "3인용", fee: 5000 },
  { id: 54, item: "소파(응접세트)", sizeOrSpec: "2인용", fee: 3000 },
  { id: 54, item: "소파(응접세트)", sizeOrSpec: "1인용", fee: 2000 },
  { id: 54, item: "소파 보조의자", sizeOrSpec: "모든규격", fee: 1000 },
  { id: 55, item: "소형가전제품", sizeOrSpec: "토스트기,포트,빙수기,헤어드라이기,믹서기,전기밥솥,소형변압기,전화기,카세트,커피메이트 등", fee: 2000 },
  { id: 56, item: "호스류", sizeOrSpec: "10m당", fee: 2000 },
  { id: 57, item: "수족관", sizeOrSpec: "가로 1m 이상", fee: 5000 },
  { id: 57, item: "수족관", sizeOrSpec: "가로 1m 미만~0.5m 이상", fee: 4000 },
  { id: 57, item: "수족관", sizeOrSpec: "가로 0.5m 미만", fee: 3000 },
  { id: 57, item: "수족관 받침대", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 58, item: "스키", sizeOrSpec: "모든규격", fee: 4000 },
  { id: 59, item: "스탠드", sizeOrSpec: "대형", fee: 5000 },
  { id: 59, item: "스탠드", sizeOrSpec: "소형", fee: 2000 },
  { id: 60, item: "식기건조기", sizeOrSpec: "60cm이상", fee: 6000 },
  { id: 60, item: "식기건조기", sizeOrSpec: "60cm미만", fee: 2000 },
  // 61~70
  { id: 61, item: "식기세척기", sizeOrSpec: "높이 1m이상", fee: 4000 },
  { id: 61, item: "식기세척기", sizeOrSpec: "높이 1m미만", fee: 3000 },
  { id: 62, item: "식탁(테이블)", sizeOrSpec: "6인용 이상", fee: 5000 },
  { id: 62, item: "식탁(테이블)", sizeOrSpec: "6인용 미만~5인용이상", fee: 4000 },
  { id: 62, item: "식탁(테이블)", sizeOrSpec: "4인용이하", fee: 3000 },
  { id: 63, item: "신발장", sizeOrSpec: "가로 1m 이상", fee: 4000 },
  { id: 63, item: "신발장", sizeOrSpec: "가로 1m 미만", fee: 3000 },
  { id: 64, item: "싱크대", sizeOrSpec: "길이 120cm이상", fee: 6000 },
  { id: 64, item: "싱크대", sizeOrSpec: "길이 120cm미만", fee: 4000 },
  { id: 65, item: "싱크찬장", sizeOrSpec: "가로 50cm당", fee: 3000 },
  { id: 66, item: "소화기", sizeOrSpec: "3.3kg초과", fee: 5000 },
  { id: 66, item: "소화기", sizeOrSpec: "3.3kg이하", fee: 3000 },
  { id: 67, item: "쌀통", sizeOrSpec: "40ℓ이상", fee: 3000 },
  { id: 67, item: "쌀통", sizeOrSpec: "40ℓ미만", fee: 2000 },
  { id: 68, item: "유리", sizeOrSpec: "책상유리 이하", fee: 3000 },
  { id: 68, item: "유리", sizeOrSpec: "베란다 유리 이하", fee: 4000 },
  { id: 69, item: "아이스박스", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 70, item: "아기소음방지매트 등(유사 매트리스)", sizeOrSpec: "1㎡당", fee: 2000 },
  // 71~80
  { id: 71, item: "안마의자", sizeOrSpec: "모든규격", fee: 7000 },
  { id: 72, item: "액자", sizeOrSpec: "1m이상", fee: 3000 },
  { id: 72, item: "액자", sizeOrSpec: "1m미만", fee: 2000 },
  { id: 73, item: "앰프", sizeOrSpec: "모든규격", fee: 4000 },
  { id: 74, item: "어항수족관", sizeOrSpec: "1㎡ 이상", fee: 5000 },
  { id: 74, item: "어항수족관", sizeOrSpec: "1㎡ 미만", fee: 3000 },
  { id: 75, item: "에어간판, 광고배너", sizeOrSpec: "모든규격", fee: 4000 },
  { id: 76, item: "에어컨(실외기별도)", sizeOrSpec: "80평 이상", fee: 8000 },
  { id: 76, item: "에어컨(실외기별도)", sizeOrSpec: "80평 미만~20평 이상", fee: 5000 },
  { id: 76, item: "에어컨(실외기별도)", sizeOrSpec: "20평 미만", fee: 3000 },
  { id: 76, item: "에어컨 실외기", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 77, item: "오디오 세트", sizeOrSpec: "폭1m 이상", fee: 5000 },
  { id: 77, item: "오디오 세트", sizeOrSpec: "폭1m 미만", fee: 3000 },
  { id: 77, item: "오디오장", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 77, item: "오디오 받침대", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 78, item: "오디오스피커", sizeOrSpec: "30*60cm이상", fee: 3000 },
  { id: 78, item: "오디오스피커", sizeOrSpec: "30*60cm미만", fee: 2000 },
  { id: 79, item: "오락기", sizeOrSpec: "29인치 이상", fee: 9000 },
  { id: 79, item: "오락기", sizeOrSpec: "29인치 미만~20인치 이상", fee: 7000 },
  { id: 79, item: "오락기", sizeOrSpec: "20인치 미만", fee: 5000 },
  { id: 80, item: "오르간", sizeOrSpec: "일반", fee: 6000 },
  { id: 80, item: "오르간", sizeOrSpec: "전자오르간", fee: 5000 },
  // 81~90
  { id: 81, item: "옥매트", sizeOrSpec: "3인용", fee: 5000 },
  { id: 81, item: "옥매트", sizeOrSpec: "2인용", fee: 5000 },
  { id: 81, item: "옥매트", sizeOrSpec: "1인용", fee: 3000 },
  { id: 82, item: "온풍기", sizeOrSpec: "20평미만", fee: 3000 },
  { id: 82, item: "온풍기", sizeOrSpec: "20평이상~80평미만", fee: 5000 },
  { id: 82, item: "온풍기", sizeOrSpec: "80평이상", fee: 8000 },
  { id: 83, item: "옷걸이", sizeOrSpec: "스탠드형", fee: 2000 },
  { id: 83, item: "옷걸이", sizeOrSpec: "행거", fee: 1000 },
  { id: 84, item: "욕조", sizeOrSpec: "성인용", fee: 5000 },
  { id: 84, item: "욕조", sizeOrSpec: "유아용", fee: 2000 },
  { id: 85, item: "유아용품 유모차", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 85, item: "유아용품 그네", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 85, item: "유아용품 목마", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 85, item: "유아용품 보행기", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 85, item: "유아용품 자동차", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 85, item: "유아용품 변기", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 85, item: "유아용품 장난감", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 85, item: "유아용품 카시트", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 86, item: "의자", sizeOrSpec: "일반의자(모든규격)", fee: 2000 },
  { id: 86, item: "의자", sizeOrSpec: "회전식의자(모든규격)", fee: 3000 },
  { id: 87, item: "이불", sizeOrSpec: "솜이불", fee: 2000 },
  { id: 87, item: "이불", sizeOrSpec: "홑이불", fee: 1000 },
  { id: 88, item: "인라인 스케이트", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 89, item: "자동판매기", sizeOrSpec: "대형", fee: 12000 },
  { id: 89, item: "자동판매기", sizeOrSpec: "소형", fee: 4000 },
  { id: 90, item: "자전거", sizeOrSpec: "2발", fee: 3000 },
  { id: 90, item: "자전거", sizeOrSpec: "3발", fee: 2000 },
  // 91~100
  { id: 91, item: "장롱", sizeOrSpec: "120cm 이상 1쪽", fee: 15000 },
  { id: 91, item: "장롱", sizeOrSpec: "120cm 미만 1쪽", fee: 10000 },
  { id: 92, item: "장식장", sizeOrSpec: "길이 1m이상", fee: 5000 },
  { id: 92, item: "장식장", sizeOrSpec: "길이 1m미만", fee: 4000 },
  { id: 93, item: "장의자", sizeOrSpec: "모든규격", fee: 8000 },
  { id: 94, item: "장판", sizeOrSpec: "10kg당", fee: 2000 },
  { id: 95, item: "재봉틀", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 96, item: "전기요", sizeOrSpec: "폭70cm 이상", fee: 3000 },
  { id: 96, item: "전기요", sizeOrSpec: "폭70cm 미만", fee: 2000 },
  { id: 97, item: "전자레인지", sizeOrSpec: "높이 1m이상", fee: 4000 },
  { id: 97, item: "전자레인지", sizeOrSpec: "높이 1m미만", fee: 3000 },
  { id: 98, item: "정수기", sizeOrSpec: "스탠드형", fee: 4000 },
  { id: 98, item: "정수기", sizeOrSpec: "탁상형", fee: 3000 },
  { id: 99, item: "조명기구(등류)", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 100, item: "진열대", sizeOrSpec: "대형", fee: 9000 },
  { id: 100, item: "진열대", sizeOrSpec: "소형", fee: 7000 },
  // 101~110
  { id: 101, item: "차탁자(교자상)", sizeOrSpec: "대형(4인이상)", fee: 3000 },
  { id: 101, item: "차탁자(교자상)", sizeOrSpec: "소형(4인미만)", fee: 2000 },
  { id: 102, item: "찬장", sizeOrSpec: "90*180cm 이상", fee: 6000 },
  { id: 102, item: "찬장", sizeOrSpec: "90*180cm 미만", fee: 5000 },
  { id: 103, item: "창문", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 104, item: "책꽂이", sizeOrSpec: "목재", fee: 2000 },
  { id: 104, item: "책꽂이", sizeOrSpec: "철재", fee: 2000 },
  { id: 105, item: "책상", sizeOrSpec: "목재", fee: 4000 },
  { id: 105, item: "책상", sizeOrSpec: "철재", fee: 5000 },
  { id: 106, item: "책장,장식장", sizeOrSpec: "1m이상", fee: 6000 },
  { id: 106, item: "책장,장식장", sizeOrSpec: "1m미만", fee: 4000 },
  { id: 107, item: "청소기", sizeOrSpec: "가정용", fee: 2000 },
  { id: 107, item: "청소기", sizeOrSpec: "업소용", fee: 3000 },
  { id: 108, item: "침대틀", sizeOrSpec: "2인용", fee: 8000 },
  { id: 108, item: "침대틀", sizeOrSpec: "1인용", fee: 7000 },
  { id: 108, item: "아기침대틀", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 109, item: "침대 매트리스", sizeOrSpec: "2인용", fee: 9000 },
  { id: 109, item: "침대 매트리스", sizeOrSpec: "1인용", fee: 6000 },
  { id: 109, item: "아기침대 매트리스", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 110, item: "침대 매트리스(토퍼)", sizeOrSpec: "1인용", fee: 4000 },
  { id: 110, item: "침대 매트리스(토퍼)", sizeOrSpec: "2인용", fee: 6000 },
  // 111~120
  { id: 111, item: "침대(옥,황토)", sizeOrSpec: "2인용", fee: 14000 },
  { id: 111, item: "침대(옥,황토)", sizeOrSpec: "1인용", fee: 10000 },
  { id: 112, item: "카페트", sizeOrSpec: "3.3㎡", fee: 2000 },
  { id: 113, item: "칸막이", sizeOrSpec: "내부석고등", fee: 3000 },
  { id: 113, item: "칸막이", sizeOrSpec: "90cm 이상", fee: 2000 },
  { id: 113, item: "칸막이", sizeOrSpec: "90cm 이하", fee: 1000 },
  { id: 114, item: "캐리어", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 115, item: "캐비닛", sizeOrSpec: "1.2m×1.8m이상", fee: 5000 },
  { id: 115, item: "캐비닛", sizeOrSpec: "1.2m×1.8m이하", fee: 3000 },
  { id: 116, item: "캣타워", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 117, item: "컴퓨터 기기 세트", sizeOrSpec: "모든규격", fee: 7000 },
  { id: 117, item: "컴퓨터 본체", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 117, item: "컴퓨터 모니터", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 117, item: "컴퓨터 키보드", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 117, item: "컴퓨터 프린터", sizeOrSpec: "대형", fee: 3000 },
  { id: 117, item: "컴퓨터 프린터", sizeOrSpec: "소형", fee: 2000 },
  { id: 117, item: "컴퓨터 책상", sizeOrSpec: "가로70cm이상", fee: 6000 },
  { id: 117, item: "컴퓨터 책상", sizeOrSpec: "가로 70cm미만", fee: 4000 },
  { id: 118, item: "컴퓨터 오락기 모니터", sizeOrSpec: "모든 규격", fee: 3000 },
  { id: 118, item: "컴퓨터 오락기(본체,모니터,DDR기 포함)", sizeOrSpec: "모든규격", fee: 7000 },
  { id: 119, item: "컴퓨터스피커", sizeOrSpec: "대형", fee: 3000 },
  { id: 119, item: "컴퓨터스피커", sizeOrSpec: "소형", fee: 2000 },
  { id: 120, item: "컴포넌트", sizeOrSpec: "모든규격", fee: 4000 },
  // 121~130
  { id: 121, item: "콘솔박스", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 122, item: "타이어", sizeOrSpec: "대형(사이즈 20 이상)", fee: 5000 },
  { id: 122, item: "타이어", sizeOrSpec: "중형(사이즈 20 미만)", fee: 4000 },
  { id: 122, item: "타이어", sizeOrSpec: "소형(사이즈 15 미만)", fee: 3000 },
  { id: 123, item: "타자기", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 124, item: "탁구대", sizeOrSpec: "모든규격", fee: 9000 },
  { id: 125, item: "탁자", sizeOrSpec: "높이 1m 이상", fee: 4000 },
  { id: 125, item: "탁자", sizeOrSpec: "높이 1m 미만", fee: 3000 },
  { id: 126, item: "탈수기", sizeOrSpec: "가정용", fee: 3000 },
  { id: 126, item: "탈수기", sizeOrSpec: "사업장용", fee: 5000 },
  { id: 127, item: "텔레비전", sizeOrSpec: "45인치 이상", fee: 6000 },
  { id: 127, item: "텔레비전", sizeOrSpec: "25인치 이상~45인치 미만", fee: 5000 },
  { id: 127, item: "텔레비전", sizeOrSpec: "25인치 미만~19인치 이상", fee: 4000 },
  { id: 127, item: "텔레비전", sizeOrSpec: "19인치 미만", fee: 3000 },
  { id: 128, item: "파레트", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 129, item: "파티션", sizeOrSpec: "개당", fee: 2000 },
  { id: 130, item: "팩시밀리", sizeOrSpec: "모든규격", fee: 3000 },
  // 131~144
  { id: 131, item: "팬히터", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 132, item: "평상", sizeOrSpec: "1평 이상", fee: 4000 },
  { id: 132, item: "평상", sizeOrSpec: "1평 미만", fee: 3000 },
  { id: 133, item: "페인트통", sizeOrSpec: "20ℓ이상", fee: 3000 },
  { id: 133, item: "페인트통", sizeOrSpec: "20ℓ미만", fee: 2000 },
  { id: 134, item: "플라스틱류", sizeOrSpec: "1kg당", fee: 1000 },
  { id: 135, item: "피아노", sizeOrSpec: "그랜드", fee: 14000 },
  { id: 135, item: "피아노", sizeOrSpec: "어프라이트", fee: 13000 },
  { id: 135, item: "피아노", sizeOrSpec: "디지털", fee: 14000 },
  { id: 136, item: "헬스기구 러닝머신", sizeOrSpec: "모든규격", fee: 6000 },
  { id: 136, item: "헬스기구 헬스싸이클", sizeOrSpec: "모든규격", fee: 4000 },
  { id: 137, item: "형광등(갓포함)", sizeOrSpec: "장식용", fee: 3000 },
  { id: 137, item: "형광등(갓포함)", sizeOrSpec: "일반용", fee: 2000 },
  { id: 138, item: "화분", sizeOrSpec: "대형", fee: 2000 },
  { id: 138, item: "화분", sizeOrSpec: "소형", fee: 1000 },
  { id: 139, item: "화일캐비넷", sizeOrSpec: "파일 4단이상", fee: 4000 },
  { id: 139, item: "화일캐비넷", sizeOrSpec: "파일 4단미만", fee: 3000 },
  { id: 139, item: "화일캐비넷", sizeOrSpec: "파일 3단이하", fee: 2000 },
  { id: 140, item: "화장대", sizeOrSpec: "1m미만", fee: 4000 },
  { id: 140, item: "화장대", sizeOrSpec: "1m이상", fee: 5000 },
  { id: 141, item: "환풍기", sizeOrSpec: "모든규격", fee: 2000 },
  { id: 142, item: "휠체어", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 143, item: "TV받침대", sizeOrSpec: "모든규격", fee: 3000 },
  { id: 144, item: "기타(이사,집수리,정원손질 부산물 등)", sizeOrSpec: "10kg마대당", fee: 3000 },
  { id: 144, item: "기타(이사,집수리,정원손질 부산물 등)", sizeOrSpec: "20kg마대당", fee: 6000 },
];

// 대형폐기물 수수료 참고사항 (별표1 주)
export const BULKY_WASTE_NOTES = [
  "일반가정, 소규모사업장, 건축폐기물은 수집·운반 수수료이며, 대형폐기물은 처리비 포함 가격임",
  "솜, 스티로폼, 압축하지 않은 캔, 드럼통 등 무게에 비해 부피가 큰 경우 ㎥ 단위로 부과 가능",
  "대형폐기물 중 열거되지 않은 물품은 유사한 품목 수수료에 준함",
];

// ========================================
// 1-2. 종량제봉투 판매가격 (조례 별표5, 개정 2023.8.3)
// ========================================
export interface BagPrice {
  type: string;
  volume: string;
  price: number; // 원
}

export const BAG_PRICE_TABLE: BagPrice[] = [
  { type: "음식용봉투", volume: "1.5ℓ", price: 40 },
  { type: "음식용봉투", volume: "3ℓ", price: 80 },
  { type: "일반용/공통", volume: "5ℓ", price: 130 },
  { type: "일반용/공통", volume: "10ℓ", price: 250 },
  { type: "일반용/공통", volume: "20ℓ", price: 500 },
  { type: "일반용/공통", volume: "50ℓ", price: 1250 },
  { type: "일반용/공통", volume: "75ℓ", price: 1880 },
  { type: "불연성용 마대", volume: "10kg", price: 3000 },
  { type: "불연성용 마대", volume: "20kg", price: 6000 },
];

// ========================================
// 1-3. 재활용 가능 폐기물 배출요령 (조례 별표2, 개정 2023.8.3)
// ========================================
export interface RecyclingGuideline {
  category: string;
  items: string[];
  method: string[];
  notes?: string[];
}

export const RECYCLING_GUIDELINES: RecyclingGuideline[] = [
  {
    category: "종이류",
    items: ["신문지", "책자", "노트", "종이쇼핑백", "달력", "포장지", "종이컵", "종이팩", "상자류(과자·포장상자, 골판지상자 등)"],
    method: [
      "물기에 젖지 않도록 반듯하게 펴서 차곡차곡 쌓은 후 묶어서 배출",
      "비닐코팅된 광고지, 비닐류, 기타 오물이 섞이지 않도록 함",
      "비닐 코팅된 표지, 공책의 스프링 등은 제거",
      "종이컵·팩은 내용물 비우고 물로 헹군 후 압착하여 배출",
      "상자류는 테이프, 철핀 등 제거 후 압착하여 배출",
    ],
    notes: ["비닐포장지는 제외", "종이컵과 종이팩(우유팩 등)은 별도 분리배출"],
  },
  {
    category: "금속캔류",
    items: ["철캔", "알루미늄캔(음·식용류)", "부탄가스", "살충제용기"],
    method: [
      "내용물을 비우고 물로 헹군 후 가능한 압착",
      "겉 또는 속의 플라스틱 뚜껑 등 제거",
      "담배꽁초 등 이물질을 넣지 말 것",
      "부탄가스·살충제용기는 구멍을 뚫어 내용물을 비운 후 배출",
    ],
  },
  {
    category: "유리병류",
    items: ["음료수병", "기타 잡병"],
    method: [
      "병뚜껑을 제거한 후 내용물을 비우고 물로 헹구어 배출",
      "담배꽁초 등 이물질을 넣지 말 것",
    ],
    notes: ["빈용기보증금 대상 유리병은 소매점 등에서 환불"],
  },
  {
    category: "고철류",
    items: ["고철(공기구, 철사, 못, 철판 등)", "비철금속(양은, 스텐류, 전선, 알루미늄샷시류)"],
    method: [
      "이물질이 섞이지 않도록 한 후 봉투에 넣거나 끈으로 묶어서 배출",
    ],
  },
  {
    category: "합성수지류(플라스틱)",
    items: ["PET병", "우유병", "요쿠르트병 등 병모양 용기", "컵라면 용기", "플라스틱·스티로폼 받침접시", "계란난좌", "일반용기"],
    method: [
      "내용물을 깨끗이 비우고 다른 재질로 된 뚜껑(또는 은박지, 랩 등)이나 부착상표 등을 제거한 후 가능한 압착하여 배출",
    ],
    notes: ["컵라면 용기, 스티로폼 받침접시는 일반 플라스틱류와 혼합되지 않도록 별도 분리배출"],
  },
  {
    category: "스티로폼 완충재",
    items: ["전자제품 완충재", "농·수·축산물 포장용 상자"],
    method: [
      "내용물을 완전히 비우고 부착상표 등을 제거한 후 이물질이 묻은 경우 깨끗이 씻어서 배출",
      "TV·냉장고·세탁기·에어컨·오디오·개인용컴퓨터·이동전화단말기 제품의 스티로폼 완충재는 제품구입처로 반납",
    ],
    notes: ["수산양식용 폐부표, 음식물 등 이물질이 많이 묻어 있거나 다른 물질로 코팅된 폐스티로폼은 제외"],
  },
  {
    category: "무색 PET병",
    items: ["무색 투명한 먹는샘물, 음료 PET병"],
    method: [
      "내용물을 깨끗이 비우고 부착상표(라벨) 등을 제거한 후 가능한 압착하여 뚜껑을 닫아 배출",
    ],
    notes: ["나머지 PET병은 플라스틱류와 함께 배출"],
  },
  {
    category: "의류",
    items: ["면섬유류", "기타 의류"],
    method: [
      "물기에 젖지 않도록 마대 등에 담거나 묶어서 배출",
    ],
  },
  {
    category: "영농폐기물류",
    items: ["농약빈병", "농업용폐비닐"],
    method: [
      "농약빈병: 내용물을 완전히 사용한 후 유리병, PET병별로 구분하여 뚜껑을 분리, 마대 등에 따로 넣어 배출",
      "농업용폐비닐: 하우스용과 멀칭용 구분, 흙과 자갈, 잡초를 털어낸 후 묶어서 마을 공동집하장에 배출",
    ],
  },
  {
    category: "기타",
    items: ["전지류", "폐형광등", "1회용 비닐봉투"],
    method: [
      "전지류: 제품에서 분리하여 전자제품 대리점, 시계점 등 역회수 루트 또는 주요 거점 수거함에 배출",
      "폐형광등: 깨지지 않도록 폐형광등 전용수거함에 배출. 깨진 것은 쓰레기규격봉투에 배출",
      "1회용 비닐봉투: 이물질이 섞이지 않도록 일정량을 모아 봉투에 넣거나 끈으로 묶어서 배출",
    ],
    notes: ["늘어나지 않고 바스락거리는 PP재질의 비닐봉투는 제외"],
  },
];

/**
 * 대형폐기물 수수료 조회
 */
export const getBulkyWasteFee = (item: string): BulkyWasteFee[] => {
  const lowerItem = item.toLowerCase();
  return BULKY_WASTE_FEE_TABLE.filter(
    (fee) =>
      fee.item.toLowerCase().includes(lowerItem) ||
      lowerItem.includes(fee.item.toLowerCase())
  );
};

// ========================================
// 2. 동/읍/면별 수거 일정 (예시)
// ========================================
export interface CollectionSchedule {
  area: string; // 동/읍/면 이름
  areaType: "동" | "읍" | "면";
  recyclables: string; // 재활용품 수거 요일
  generalWaste: string; // 일반쓰레기 수거 요일
  foodWaste: string; // 음식물쓰레기 수거 빈도
  note?: string;
}

export const COLLECTION_SCHEDULES: CollectionSchedule[] = [
  // 동 지역 (예시)
  { area: "비전동", areaType: "동", recyclables: "화, 금", generalWaste: "월, 수, 금", foodWaste: "매일" },
  { area: "세교동", areaType: "동", recyclables: "화, 금", generalWaste: "월, 수, 금", foodWaste: "매일" },
  { area: "지산동", areaType: "동", recyclables: "수, 토", generalWaste: "화, 목, 토", foodWaste: "매일" },
  { area: "신장동", areaType: "동", recyclables: "화, 금", generalWaste: "월, 수, 금", foodWaste: "매일" },
  { area: "중앙동", areaType: "동", recyclables: "화, 금", generalWaste: "월, 수, 금", foodWaste: "매일" },
  { area: "송탄동", areaType: "동", recyclables: "수, 토", generalWaste: "화, 목, 토", foodWaste: "매일" },
  { area: "서정동", areaType: "동", recyclables: "수, 토", generalWaste: "화, 목, 토", foodWaste: "매일" },
  { area: "고덕동", areaType: "동", recyclables: "화, 금", generalWaste: "월, 수, 금", foodWaste: "매일", note: "신규 택지지구" },

  // 읍 지역 (예시)
  { area: "팽성읍", areaType: "읍", recyclables: "목", generalWaste: "화, 금", foodWaste: "화, 금" },
  { area: "안중읍", areaType: "읍", recyclables: "수", generalWaste: "월, 목", foodWaste: "월, 목" },
  { area: "포승읍", areaType: "읍", recyclables: "금", generalWaste: "화, 토", foodWaste: "화, 토" },

  // 면 지역 (예시)
  { area: "청북읍", areaType: "읍", recyclables: "목", generalWaste: "화, 금", foodWaste: "화, 금" },
  { area: "현덕면", areaType: "면", recyclables: "수", generalWaste: "월, 목", foodWaste: "월, 목" },
  { area: "오성면", areaType: "면", recyclables: "금", generalWaste: "화, 토", foodWaste: "화, 토" },
];

/**
 * 지역별 수거 일정 조회
 */
export const getCollectionSchedule = (area: string): CollectionSchedule | null => {
  const lowerArea = area.toLowerCase().replace(/[동읍면]/g, "");
  return (
    COLLECTION_SCHEDULES.find(
      (s) => s.area.toLowerCase().replace(/[동읍면]/g, "").includes(lowerArea) ||
             lowerArea.includes(s.area.toLowerCase().replace(/[동읍면]/g, ""))
    ) || null
  );
};

// ========================================
// 3. 전용 수거함 위치 (예시)
// ========================================
export interface CollectionPoint {
  type: "폐건전지" | "폐형광등" | "폐의약품" | "의류수거함" | "투명페트" | "종이팩";
  name: string;
  address: string;
  area: string; // 동/읍/면
  note?: string;
}

export const COLLECTION_POINTS: CollectionPoint[] = [
  // 폐건전지
  { type: "폐건전지", name: "비전동 주민센터", address: "평택시 비전5로 31", area: "비전동" },
  { type: "폐건전지", name: "세교동 주민센터", address: "평택시 세교1로 59", area: "세교동" },
  { type: "폐건전지", name: "이마트 평택점", address: "평택시 평택로 67", area: "중앙동" },
  { type: "폐건전지", name: "롯데마트 송탄점", address: "평택시 중앙로 311", area: "송탄동" },

  // 폐형광등
  { type: "폐형광등", name: "비전동 주민센터", address: "평택시 비전5로 31", area: "비전동" },
  { type: "폐형광등", name: "고덕동 주민센터", address: "평택시 고덕중앙로 260", area: "고덕동" },

  // 폐의약품
  { type: "폐의약품", name: "온누리약국 (비전점)", address: "평택시 비전로 45", area: "비전동" },
  { type: "폐의약품", name: "평택중앙약국", address: "평택시 중앙로 123", area: "중앙동" },
  { type: "폐의약품", name: "고덕온누리약국", address: "평택시 고덕중앙로 88", area: "고덕동" },

  // 의류수거함
  { type: "의류수거함", name: "비전2지구 아파트 단지 내", address: "비전동 일대", area: "비전동" },
  { type: "의류수거함", name: "세교신도시 각 단지", address: "세교동 일대", area: "세교동" },
];

// ========================================
// 4. 평택시 폐기물처리시설 정보
// (평택시 폐기물처리시설 설치·운영 및 주변지역지원 등에 관한 조례 제2370호)
// ========================================
export interface WasteFacility {
  name: string;
  type: string;
  address: string;
  contact?: string;
  note?: string;
}

export const WASTE_FACILITIES: WasteFacility[] = [
  {
    name: "평택시 폐기물처리시설",
    type: "종합 폐기물처리시설",
    address: "평택시 고덕면 도시지원1길 91",
    contact: "031-8024-3722 (자원순환과)",
    note: "가연성폐기물 연료화시설, 생활자원회수센터, SRF열병합시설, 유기성폐자원 바이오가스화시설 운영"
  },
];

// 평택시 공식 연락처
// 근거: 평택시 폐기물 관리 조례 (조례 제2293호)
export const OFFICIAL_CONTACTS = {
  자원순환과: "031-8024-3714", // 조례 본문 명시
  폐기물처리시설: "031-8024-3722", // 폐기물처리시설 조례 제2370호
  평택시콜센터: "031-8024-4444",
  대형폐기물신고: "정부24 또는 평택시 홈페이지",
  가전제품무상수거: "1599-0903",
};

// ========================================
// 5. 생활폐기물 배출 규정 (조례 제7조)
// ========================================
export interface DisposalRule {
  category: string;
  method: string;
  timeRule?: string;
  note?: string;
  source: string;
}

export const DISPOSAL_RULES: DisposalRule[] = [
  {
    category: "일반 생활폐기물",
    method: "종량제 봉투에 담아 묶은 후 본인 집 앞, 거점수거지 등 지정된 장소에 배출",
    timeRule: "일요일~금요일, 오후 8시 ~ 다음날 오전 4시",
    note: "공동주택 보관용기 설치된 경우 또는 개인 토지 내 배출장소 있는 경우 예외",
    source: "PT_ORD 제7조제1항, 제6항",
  },
  {
    category: "대형폐기물",
    method: "평택시 홈페이지 대형폐기물 인터넷 신고 후 신고확인증 부착, 또는 대형폐기물 스티커 구입 부착 후 청소대행업체에 전화로 배출장소 신고",
    note: "지정된 청소대행업체에 전화 후 본인 집 앞, 거점수거지 등에 배출",
    source: "PT_ORD 제7조제2항",
  },
  {
    category: "불연성폐기물 (소량 건설폐기물 등)",
    method: "불연성용 전용 마대에 담아 묶은 후 청소대행업체에 전화로 배출장소 신고",
    note: "가정에서 소량 배출되는 건설폐기물, 종량제봉투에 담기 어려운 폐기물",
    source: "PT_ORD 제7조제3항",
  },
  {
    category: "재활용품",
    method: "분리·배출방법에 따라 지정된 장소 또는 전용 수거함에 배출",
    note: "지정장소/전용수거함 없는 곳: 투명 또는 흰색봉투에 혼합배출 가능 (종이류, 금속캔류, 유리병류, 합성수지류 - 단, 스티로폼·투명페트병은 제외)",
    source: "PT_ORD 제9조제2항",
  },
];

// ========================================
// 6. 종량제봉투 종류 (조례 제17조)
// ========================================
export interface BagType {
  name: string;
  color: string;
  usage: string;
}

export const BAG_TYPES: BagType[] = [
  { name: "일반용 봉투", color: "흰색 반투명", usage: "생활폐기물" },
  { name: "재사용 봉투", color: "흰색 반투명", usage: "생활폐기물" },
  { name: "음식물용 봉투", color: "노란색", usage: "음식물류 폐기물" },
  { name: "공공용 봉투 (일반)", color: "엷은 파란색", usage: "도로변 가로청소 등 공공용도" },
  { name: "공공용 봉투 (재활용)", color: "노란색 투명", usage: "공공 재활용 수거" },
  { name: "불연성용 전용 마대", color: "-", usage: "불연성폐기물 (소량 건설폐기물 포함)" },
];

// ========================================
// 7. 수수료 감면 대상 (조례 제15조)
// ========================================
export interface FeeExemption {
  target: string;
  benefit: string;
  source: string;
}

export const FEE_EXEMPTIONS: FeeExemption[] = [
  {
    target: "기초생활수급자 (생계급여/의료급여)",
    benefit: "가구당 월 120리터 (1인가구 60리터) 종량제봉투 무료 지급",
    source: "PT_ORD 제15조",
  },
  {
    target: "통·리·반장 및 새마을지도자",
    benefit: "가구당 월 120리터 종량제봉투 무료 지급",
    source: "PT_ORD 제15조",
  },
  {
    target: "재난·재해 피해자",
    benefit: "수수료 감면",
    source: "PT_ORD 제15조",
  },
];

// 전입자 종량제봉투 사용 규정 (조례 제7조제8항)
export const TRANSFER_RESIDENT_RULE = {
  description: "전입자는 이전 지자체 종량제봉투를 읍·면·동 행정복지센터에서 인증스티커 교부받아 부착 후 사용 가능",
  maxStickers: 20, // 가구당 최대 20매
  source: "PT_ORD 제7조제8항",
};

/**
 * 수거함 위치 조회
 */
export const getCollectionPoints = (
  type: CollectionPoint["type"],
  area?: string
): CollectionPoint[] => {
  return COLLECTION_POINTS.filter((p) => {
    if (p.type !== type) return false;
    if (area) {
      const lowerArea = area.toLowerCase().replace(/[동읍면]/g, "");
      return p.area.toLowerCase().replace(/[동읍면]/g, "").includes(lowerArea);
    }
    return true;
  });
};

// ========================================
// 4. AdditionalInput 형식으로 변환 (룰북 병합용)
// ========================================
export const PT_RULE_FEE_TABLE: AdditionalInput = {
  type: "FEE_TABLE",
  description: "평택시 대형폐기물 수수료 별표",
  data: BULKY_WASTE_FEE_TABLE,
  applies_to: ["R032", "R033", "R034", "R035", "R036"], // 대형폐기물 관련 rule_id
};

export const PT_RULE_SCHEDULE: AdditionalInput = {
  type: "SCHEDULE",
  description: "평택시 동/읍/면별 수거 일정",
  data: COLLECTION_SCHEDULES,
  applies_to: [], // 전체 적용
};

export const PT_RULE_LOCATIONS: AdditionalInput = {
  type: "LOCATION",
  description: "평택시 전용 수거함 위치",
  data: COLLECTION_POINTS,
  applies_to: ["R027", "R028", "R029"], // 유해폐기물 관련 rule_id
};

// ========================================
// 5. 프롬프트용 컨텍스트 생성
// ========================================
export const generatePtRuleContext = (): string => {
  let context = `\n## 평택시 특화 정보 (PT_RULE)\n`;
  context += `근거: 평택시 폐기물 관리 조례 (조례 제2293호, 시행 2023.8.3)\n\n`;

  // 공식 연락처
  context += `### 평택시 폐기물 관련 연락처\n`;
  context += `- 자원순환과: ${OFFICIAL_CONTACTS.자원순환과}\n`;
  context += `- 평택시 콜센터: ${OFFICIAL_CONTACTS.평택시콜센터}\n`;
  context += `- 대형폐기물 신고: ${OFFICIAL_CONTACTS.대형폐기물신고}\n`;
  context += `- 가전제품 무상수거: ${OFFICIAL_CONTACTS.가전제품무상수거}\n\n`;

  // 배출시간 규정 (조례 제7조제6항)
  context += `### 생활폐기물 배출 시간 (조례 제7조제6항)\n`;
  context += `- 배출일: 일요일 ~ 금요일\n`;
  context += `- 배출시간: 오후 8시 ~ 다음날 오전 4시\n`;
  context += `- 예외: 공동주택 보관용기 설치된 경우, 개인 토지 내 배출장소 있는 경우, 이사하는 경우\n\n`;

  // 재활용품 혼합배출 규정 (조례 제9조제2항)
  context += `### 재활용품 배출 (조례 제9조제2항)\n`;
  context += `- 기본: 분리·배출방법에 따라 지정된 장소 또는 전용 수거함에 배출\n`;
  context += `- 혼합배출 허용 (지정장소/전용수거함 없는 곳): 투명 또는 흰색봉투에 함께 담아 배출\n`;
  context += `  - 혼합 가능: 종이류, 금속캔류, 유리병류, 합성수지류\n`;
  context += `  - 혼합 불가 (별도 배출): 스티로폼 완충재, 투명페트병\n\n`;

  // 대형폐기물 수수료 (주요 품목만)
  context += `### 대형폐기물 수수료 (조례 별표1, 주요 품목)\n`;
  const mainFees = BULKY_WASTE_FEE_TABLE.filter((f) =>
    ["침대", "소파", "책상", "의자", "장롱", "매트리스"].some((item) =>
      f.item.includes(item)
    )
  );
  mainFees.forEach((f) => {
    context += `- ${f.item} (${f.sizeOrSpec}): ${f.fee.toLocaleString()}원\n`;
  });
  context += `※ 신고: 평택시 홈페이지 대형폐기물 인터넷 신고 또는 대형폐기물 스티커 구입\n\n`;

  // 종량제봉투 종류 및 가격 (조례 제17조, 별표5)
  context += `### 종량제봉투 종류 및 가격 (조례 제17조, 별표5)\n`;
  BAG_TYPES.forEach((bag) => {
    context += `- ${bag.name}: ${bag.color} (${bag.usage})\n`;
  });
  context += `\n가격:\n`;
  BAG_PRICE_TABLE.forEach((bag) => {
    context += `- ${bag.type} ${bag.volume}: ${bag.price.toLocaleString()}원\n`;
  });
  context += `\n`;

  // 수거 일정 안내
  context += `### 수거 일정 (지역별 상이)\n`;
  context += `- 동 지역: 대체로 주 2회 재활용, 주 3회 일반\n`;
  context += `- 읍/면 지역: 대체로 주 1회 재활용\n`;
  context += `※ 정확한 일정은 동 주민센터 또는 아파트 관리사무소 확인\n\n`;

  // 전용 수거함
  context += `### 전용 수거함 (유해폐기물)\n`;
  context += `- 폐건전지/폐형광등: 주민센터, 대형마트\n`;
  context += `- 폐의약품: 가까운 약국\n`;
  context += `- 의류: 의류수거함 (아파트 단지, 주민센터 인근)\n\n`;

  // 전입자 규정 (조례 제7조제8항)
  context += `### 전입자 종량제봉투 사용 (조례 제7조제8항)\n`;
  context += `- 이전 지자체 종량제봉투 사용 가능\n`;
  context += `- 방법: 읍·면·동 행정복지센터에서 인증스티커 교부받아 부착\n`;
  context += `- 한도: 가구당 최대 ${TRANSFER_RESIDENT_RULE.maxStickers}매\n\n`;

  // 수수료 감면
  context += `### 수수료 감면 (조례 제15조)\n`;
  FEE_EXEMPTIONS.forEach((ex) => {
    context += `- ${ex.target}: ${ex.benefit}\n`;
  });

  return context;
};

export default {
  // 조례 별표 데이터
  BULKY_WASTE_FEE_TABLE, // 별표1: 대형폐기물 수수료
  BULKY_WASTE_NOTES,     // 별표1: 참고사항
  BAG_PRICE_TABLE,       // 별표5: 종량제봉투 가격
  RECYCLING_GUIDELINES,  // 별표2: 재활용품 배출요령
  // 기타 데이터
  COLLECTION_SCHEDULES,
  COLLECTION_POINTS,
  WASTE_FACILITIES,
  OFFICIAL_CONTACTS,
  DISPOSAL_RULES,
  BAG_TYPES,
  FEE_EXEMPTIONS,
  TRANSFER_RESIDENT_RULE,
  // 함수
  getBulkyWasteFee,
  getCollectionSchedule,
  getCollectionPoints,
  generatePtRuleContext,
};
