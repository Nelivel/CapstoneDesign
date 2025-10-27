// src/data/chats.js
// (기존 mock-chats.js 대체)
// productId가 products.js와 일치하도록 확인

export const MOCK_CHAT_ROOMS = [
  {
    id: 1,
    partner: {
      nickname: '스터디홀릭',
      avatarUrl: 'https://via.placeholder.com/50'
    },
    lastMessage: '네, 그럼 내일 뵙겠습니다!',
    timestamp: '오후 4:30',
    unreadCount: 0,
    productId: 1, // 거래 중인 상품 ID (컴퓨터 구조론)
  },
  {
    id: 2,
    partner: {
      nickname: '경영새내기',
      avatarUrl: 'https://via.placeholder.com/50'
    },
    lastMessage: '혹시 네고 가능할까요?',
    timestamp: '오전 11:21',
    unreadCount: 2,
    productId: 2, // 거래 중인 상품 ID (회계원리)
  },
  {
    id: 3,
    partner: {
      nickname: '시간표_미제공자',
      avatarUrl: 'https://via.placeholder.com/50'
    },
    lastMessage: '안녕하세요',
    timestamp: '오전 9:00',
    unreadCount: 0,
    productId: 3, // 이 상품 판매자는 시간표를 제공하지 않음 (자바스크립트)
  },
];

// 각 채팅방의 메시지 데이터
export const MOCK_MESSAGES = {
  1: [ // 채팅방 ID: 1
    { id: 101, sender: 'partner', text: '안녕하세요! 컴퓨터 구조론 책 아직 판매하시나요?', timestamp: '오후 4:25', isRead: true },
    { id: 102, sender: 'me', text: '네, 아직 판매 중입니다.', timestamp: '오후 4:26', isRead: true },
    { id: 103, sender: 'partner', text: '좋습니다. 혹시 내일 오후 3시에 중앙도서관 앞에서 거래 가능할까요?', timestamp: '오후 4:28', isRead: true },
    { id: 104, sender: 'me', text: '네, 가능합니다!', timestamp: '오후 4:29', isRead: true },
    { id: 105, sender: 'partner', text: '네, 그럼 내일 뵙겠습니다!', timestamp: '오후 4:30', isRead: true },
  ],
  2: [ // 채팅방 ID: 2
    { id: 201, sender: 'me', text: '회계원리 교재 구매하고 싶습니다.', timestamp: '오전 11:20', isRead: true },
    { id: 202, sender: 'partner', text: '네, 안녕하세요! 구매 가능합니다.', timestamp: '오전 11:20', isRead: false },
    { id: 203, sender: 'partner', text: '혹시 네고 가능할까요?', timestamp: '오전 11:21', isRead: false },
  ],
  3: [ // 채팅방 ID: 3 (E-1 테스트용)
    { id: 301, sender: 'me', text: '안녕하세요', timestamp: '오전 9:00', isRead: true },
  ],
};

// --- 거래 일정 Mock 데이터 (추가) ---
export const MOCK_TRADE_SCHEDULES = {
  1: [ // 채팅방 ID 1에 대한 거래 일정 제안/확정
    {
      id: 1,
      sender: 'me', // 제안자 (me 또는 partner)
      status: 'pending', // pending, accepted, rejected
      location: '중앙도서관 1층 로비',
      time: '2024년 5월 10일 (금) 15:00',
      isRead: false,
    },
  ],
};