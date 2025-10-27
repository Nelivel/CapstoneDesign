// src/data/products.js
export const INITIAL_PRODUCTS = [
  {
    id: 1,
    sellerNickname: '스터디홀릭', // 판매자 닉네임 (users.js 키와 매칭)
    sellerHasTimetable: true,
    imageUrl: "https://via.placeholder.com/150",
    title: "컴퓨터 구조론 5판",
    nickname: "스터디홀릭", // 상품 카드에 표시될 닉네임 (중복될 수 있음)
    description: "새 책처럼 깨끗해요. 공부 흔적 거의 없음.\n\n상세 스펙:\nCPU: Intel Core i3\nRAM: 8GB\nSSD: 128GB", // 상세 설명 예시 추가
    price: 15000,
    status: 'selling',
    category: '교재', // 카테고리 추가
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10분 전
    viewCount: 15, // 조회수 추가
  },
  {
    id: 2,
    sellerNickname: '경영새내기',
    sellerHasTimetable: true,
    imageUrl: "https://via.placeholder.com/150",
    title: "회계원리 기본서",
    nickname: "경영새내기",
    description: "교수님 추천 교재입니다. 필기 조금 있어요.",
    price: 10000,
    status: 'selling',
    category: '교재',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3시간 전
    viewCount: 32,
  },
  {
    id: 3,
    sellerNickname: '시간표_미제공자',
    sellerHasTimetable: false,
    imageUrl: "https://via.placeholder.com/150",
    title: "자바스크립트 완벽 가이드",
    nickname: "코딩마스터", // 판매자 닉네임과 다를 수 있음
    description: "한두 번 보고 보관했습니다. 거의 새것.",
    price: 20000,
    status: 'reserved',
    category: '교재',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2일 전
    viewCount: 110,
  },
  {
    id: 4,
    sellerNickname: '글로벌리', // users.js에 '글로벌리' 유저 추가 필요
    sellerHasTimetable: true,
    imageUrl: "https://via.placeholder.com/150",
    title: "영어회화 스터디 교재",
    nickname: "글로벌리",
    description: "해외 어학연수 준비용 교재입니다.",
    price: 8000,
    status: 'sold',
    category: '교재',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5일 전
    viewCount: 55,
  },
  {
    id: 5,
    sellerNickname: '긱스가든', // users.js에 '긱스가든' 유저 추가 필요
    sellerHasTimetable: true,
    imageUrl: "https://via.placeholder.com/150",
    title: "무선 키보드 세트",
    nickname: "긱스가든",
    description: "게이밍 키보드/마우스 팝니다. 상태 A급.",
    price: 25000,
    status: 'selling',
    category: '전자기기', // 카테고리 변경
    createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), // 22시간 전
    viewCount: 78,
  },
];