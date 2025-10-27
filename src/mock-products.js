// src/mock-products.js
export const MOCK_PRODUCTS = [
  {
    id: 1,
    sellerNickname: '스터디홀릭', // 판매자 닉네임 (ProductCard 에서 사용)
    sellerHasTimetable: true,
    imageUrl: "https://via.placeholder.com/150",
    title: "컴퓨터 구조론 5판",
    nickname: "스터디홀릭", // 상품 카드에 표시될 닉네임 (sellerNickname과 같을 수 있음)
    description: "새 책처럼 깨끗해요. 공부 흔적 거의 없음.",
    price: 25000, // 가격 정보 추가
    status: "판매중", // 판매 상태 추가
  },
  {
    id: 2,
    sellerNickname: '경영새내기',
    sellerHasTimetable: true,
    imageUrl: "https://via.placeholder.com/150",
    title: "회계원리 기본서",
    nickname: "경영새내기",
    description: "교수님 추천 교재입니다. 필기 조금 있어요.",
    price: 18000, // 가격 정보 추가
    status: "예약중", // 판매 상태 추가
  },
  {
    id: 3,
    sellerNickname: '코딩마스터', // sellerNickname 수정 (시간표 제공자와 일치하도록)
    sellerHasTimetable: true, // 판매자가 시간표를 제공한다고 가정
    imageUrl: "https://via.placeholder.com/150",
    title: "자바스크립트 완벽 가이드",
    nickname: "코딩마스터",
    description: "한두 번 보고 보관했습니다. 거의 새것.",
    price: 32000, // 가격 정보 추가
    status: "판매완료", // ⭐ 판매 상태: 판매완료
    buyerNickname: "구매자A", // ⭐ 구매자 닉네임 추가
    soldDate: "2025-10-25", // ⭐ 판매 완료 날짜 추가
  },
  {
    id: 4,
    sellerNickname: '글로벌리', // 판매자 닉네임 추가
    sellerHasTimetable: true, // 판매자가 시간표를 제공한다고 가정
    imageUrl: "https://via.placeholder.com/150",
    title: "영어회화 스터디 교재",
    nickname: "글로벌리",
    description: "해외 어학연수 준비용 교재입니다.",
    price: 10000, // 가격 정보 추가
    status: "판매중", // 판매 상태 추가
  },
  {
    id: 5,
    sellerNickname: '긱스가든', // 판매자 닉네임 추가
    sellerHasTimetable: true, // 판매자가 시간표를 제공한다고 가정
    imageUrl: "https://via.placeholder.com/150",
    title: "무선 키보드 세트",
    nickname: "긱스가든",
    description: "게이밍 키보드/마우스 팝니다. 상태 A급.",
    price: 45000, // 가격 정보 추가
    status: "판매완료", // ⭐ 판매 상태: 판매완료
    buyerNickname: "구매자B", // ⭐ 구매자 닉네임 추가
    soldDate: "2025-10-22", // ⭐ 판매 완료 날짜 추가
  },
];