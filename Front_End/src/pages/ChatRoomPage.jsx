// src/pages/ChatRoomPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
import { MOCK_CHAT_ROOMS, MOCK_MESSAGES, MOCK_TRADE_SCHEDULES } from '../mock-chats'; // MOCK_TRADE_SCHEDULES 임포트
import { MOCK_PRODUCTS } from '../mock-products'; // 상품 정보 임포트
import ChatFeaturesModal from '../components/ChatFeaturesModal'; // 기능 모달 임포트
import TradeScheduleRecommendModal from '../components/TradeScheduleRecommendModal'; // 일정 추천 모달 임포트
import './ChatRoomPage.css';

const MY_USER_ID = 'me';

function ChatRoomPage() {
  const { chatId } = useParams();
  const { navigate } = useNavigation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messageEndRef = useRef(null);

  // 모달 상태 관리
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false); // 이름을 isScheduleModalOpen으로 통일

  const roomInfo = MOCK_CHAT_ROOMS.find(room => room.id === parseInt(chatId));
  // roomInfo가 없을 경우를 대비하여 nullish coalescing operator 사용
  const productInfo = MOCK_PRODUCTS.find(p => p.id === roomInfo?.productId);

  useEffect(() => {
    const chatMessages = MOCK_MESSAGES[chatId] || [];
    const tradeSchedules = MOCK_TRADE_SCHEDULES[chatId] || [];

    // 메시지와 거래 일정을 합치고 id (생성 시간) 순으로 정렬
    // (여기서는 type이 다른 두 배열을 합치므로, id가 같은 경우가 없다고 가정)
    const combined = [...chatMessages, ...tradeSchedules].sort((a, b) => a.id - b.id);
    setMessages(combined);
  }, [chatId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    const newMsg = {
      id: Date.now(),
      sender: MY_USER_ID,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };
    setMessages(prevMessages => [...prevMessages, newMsg]);
    setNewMessage('');
    
    // 실제 앱에서는 여기서 웹소켓을 통해 메시지를 서버로 전송합니다.
  };

  const handleFeatureSelect = (feature) => {
    setIsFeaturesModalOpen(false); // 기능 모달 닫기
    if (feature === 'schedule') {
      setIsScheduleModalOpen(true); // 일정 추천 모달 열기
    }
  };

  // 거래 일정 선택 후 메시지로 보내는 함수 (거래 일정 추천 모달에서 호출)
  const handleScheduleSelect = (schedule) => {
    const newScheduleMessage = {
      id: Date.now(),
      sender: MY_USER_ID,
      type: 'trade_schedule', // 메시지 타입을 거래 일정으로
      status: 'pending', // 상태: 제안 중
      location: '중앙도서관', // 임시 장소
      time: `${schedule.day}요일 ${schedule.time}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };
    setMessages(prev => [...prev, newScheduleMessage]);
    setIsScheduleModalOpen(false); // 모달 닫기
  };

  if (!roomInfo || !productInfo) { // productInfo가 없을 경우를 대비한 렌더링 가드
    return <div>채팅방 정보를 찾을 수 없습니다.</div>;
  }

  // 거래 일정 제안/확정 메시지 렌더링 함수
  const renderTradeScheduleMessage = (schedule) => {
    const isMine = schedule.sender === MY_USER_ID;
    const isPending = schedule.status === 'pending';
    const isAccepted = schedule.status === 'accepted';
    const isRejected = schedule.status === 'rejected';

    return (
      <div key={schedule.id} className={`message-row ${isMine ? 'mine' : 'partner'}`}>
        {isMine && ( // 내가 보낸 메시지일 경우 시간, 읽음 상태를 왼쪽에
          <div className="message-meta">
            {schedule.isRead ? null : <span className="message-read-status">1</span>}
            <span>{schedule.timestamp}</span>
          </div>
        )}
        <div className={`message-bubble trade-schedule ${isMine ? 'mine' : 'partner'}`}>
          <div className="title">거래 일정 {isPending ? '제안' : (isAccepted ? '확정' : '거절')}</div>
          <div className="details">
            <p><strong>장소:</strong> {schedule.location}</p>
            <p><strong>시간:</strong> {schedule.time}</p>
          </div>
          {isPending && !isMine && ( // 상대방이 보낸 제안이고, 아직 수락/거절되지 않았을 때만 버튼 표시
            <div className="buttons">
              <button className="reject-button" onClick={() => alert('거절 기능')}>거절</button>
              <button className="accept-button" onClick={() => alert('수락 기능')}>수락</button>
            </div>
          )}
          {isPending && isMine && ( // 내가 보낸 제안이고, 아직 수락/거절되지 않았을 때
            <div className="buttons">
              <button className="default-button" disabled>상대방 응답 대기중</button>
            </div>
          )}
           {isAccepted && ( // 확정된 경우
            <div className="buttons">
              <button className="accept-button" disabled>거래 확정됨</button>
            </div>
          )}
          {isRejected && ( // 거절된 경우
            <div className="buttons">
              <button className="reject-button" disabled>거래 거절됨</button>
            </div>
          )}
        </div>
        {!isMine && ( // 상대방이 보낸 메시지일 경우 시간, 읽음 상태를 오른쪽에 (현재는 없음)
          <div className="message-meta">
            <span>{schedule.timestamp}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chat-room-page">
      <header className="chat-room-header">
        <button onClick={() => navigate('/chat')} className="back-button" style={{position: 'static'}}>{'<'}</button>
        <h2 className="chat-room-partner-name">{roomInfo.partner.nickname}</h2>
      </header>
      <main className="message-list">
        {messages.map(msg => {
            // 메시지 타입에 따라 렌더링 분기
            if (msg.type === 'trade_schedule') {
                return renderTradeScheduleMessage(msg);
            }
            
            const isMine = msg.sender === MY_USER_ID;
            return (
              <div key={msg.id} className={`message-row ${isMine ? 'mine' : 'partner'}`}>
                {/* 내 메시지일 경우 시간, 읽음 상태를 왼쪽에 */}
                {isMine && (
                  <div className="message-meta">
                    {msg.isRead ? null : <span className="message-read-status">1</span>}
                    <span>{msg.timestamp}</span>
                  </div>
                )}
                <div className={`message-bubble ${isMine ? 'mine' : 'partner'}`}>
                  {msg.text}
                </div>
                {/* 상대 메시지일 경우 시간, 읽음 상태를 오른쪽에 */}
                {!isMine && (
                  <div className="message-meta">
                    <span>{msg.timestamp}</span>
                  </div>
                )}
              </div>
            );
        })}
        <div ref={messageEndRef} />
      </main>
      <div className="chat-input-area">
        <button className="chat-plus-button" onClick={() => setIsFeaturesModalOpen(true)}>+</button>
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <textarea
            className="chat-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            rows={1} // 기본 1줄
          />
          <button type="submit" className="chat-send-button">전송</button>
        </form>
      </div>

      {/* 모달 렌더링 */}
      {isFeaturesModalOpen && (
        <ChatFeaturesModal
          onClose={() => setIsFeaturesModalOpen(false)}
          onFeatureSelect={handleFeatureSelect}
          // productInfo가 존재할 때만 sellerHasTimetable을 전달
          sellerHasTimetable={productInfo ? productInfo.sellerHasTimetable : false} 
        />
      )}
      {isScheduleModalOpen && (
        <TradeScheduleRecommendModal
          // roomInfo가 존재할 때만 partnerNickname을 전달
          partnerNickname={roomInfo ? roomInfo.partner.nickname : ''} 
          onClose={() => setIsScheduleModalOpen(false)}
          onScheduleSelect={handleScheduleSelect}
        />
      )}
    </div>
  );
}

export default ChatRoomPage;