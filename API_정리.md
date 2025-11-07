# DeskClean 프로젝트 API 명세서

## 📌 API 정의
프로젝트 **내부 API (REST 엔드포인트)** 정의

---

## 🎯 API 두 가지 유형

### 1️⃣ 외부 API (현재 미사용)
- 다른 회사/서비스에서 제공하는 API
- 예: OpenAI, Kakao Login, Google Maps 등
- **현재 프로젝트에서는 사용하지 않음**

### 2️⃣ 내부 API (현재 사용 중)
- 본인 프로젝트의 백엔드에서 만든 API
- 프론트엔드가 호출할 수 있는 엔드포인트들
- **현재 프로젝트에 다음과 같은 API들이 있음**

---

## 🔹 현재 프로젝트의 API 목록

### 1. 메시지 관리 (MessageController)
| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/api/messages` | 전체 메시지 목록 조회 |

### 2. 시간표 관리 (TimetableController)
| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/api/timetable/ai` | AI팀용 2D 시간표 데이터 반환 |
| GET | `/api/timetable/recommend/{otherUserId}` | 상대방과의 추천 시간대 조회 |
| POST | `/api/timetable/save` | 시간표 저장/수정 |
| DELETE | `/api/timetable/delete` | 시간표 삭제 |

### 3. WebSocket (ChatServer)
| 유형 | URL | 설명 |
|------|-----|------|
| WS | `ws://localhost:8080/chatserver/{username}` | 실시간 채팅 WebSocket 연결 |

### 4. 페이지 렌더링 (ChatController)
| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/` | 로그인 페이지로 리다이렉트 |
| GET | `/chat` | 채팅 페이지 렌더링 |

---

## 💡 사용 예시

### 프론트엔드에서 API 호출하는 방법:

```javascript
// 1. 메시지 목록 가져오기
fetch('/api/messages')
  .then(response => response.json())
  .then(data => console.log(data));

// 2. 추천 시간표 가져오기
fetch('/api/timetable/recommend/123')  // 123 = 상대방 사용자 ID
  .then(response => response.json())
  .then(data => console.log(data));

// 3. 시간표 저장하기
fetch('/api/timetable/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify([
    ['o', 'x', 'o', 'x', 'o', 'x', 'o', 'x', 'o'],  // 월요일
    ['x', 'o', 'x', 'o', 'x', 'o', 'x', 'o', 'x'],  // 화요일
    // ... 다른 요일들
  ])
});

// 4. WebSocket 연결 (채팅)
const ws = new WebSocket('ws://localhost:8080/chatserver/user1');
ws.onmessage = (event) => {
  console.log('메시지 수신:', event.data);
};
```

