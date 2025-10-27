// src/pages/ChatRoomPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom'; // 1. useLocation 임포트
import { useNavigation } from '../context/NavigationContext';
import { useGlobalData } from '../context/GlobalContext'; // 2. 임포트
import { MOCK_CHAT_ROOMS, MOCK_MESSAGES, MOCK_TRADE_SCHEDULES } from '../data/chats'; // 3. 경로 수정
// import { MOCK_PRODUCTS } from '../mock-products'; // 4. 삭제
import ChatFeaturesModal from '../components/ChatFeaturesModal';
import TradeScheduleRecommendModal from '../components/TradeScheduleRecommendModal';
import './ChatRoomPage.css';

const MY_USER_ID = 'me';

function ChatRoomPage() {
  const { chatId } = useParams();
  const { navigate } = useNavigation();
  const location = useLocation(); // 5. location 훅 사용

  // 6. 컨텍스트에서 전체 상품 목록 가져오기
  const { products } = useGlobalData(); 

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messageEndRef = useRef(null);

  // 모달 상태 관리
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const roomInfo = MOCK_CHAT_ROOMS.find(room => room.id === parseInt(chatId));
  
  // 7. DetailPage에서 받은 productId(location.state) 또는 채팅방 기본 productId
  const productId = location.state?.productId || roomInfo?.productId;
  
  // 8. 컨텍스트의 products에서 상품 정보 찾기
  const productInfo = products.find(p => p.id === productId);

  useEffect(() => {
    const chatMessages = MOCK_MESSAGES[chatId] || [];
    const tradeSchedules = MOCK_TRADE_SCHEDULES[chatId] || [];

    // ... (기존 로직 동일)
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
  };

  const handleFeatureSelect = (feature) => {
    setIsFeaturesModalOpen(false); // 기능 모달 닫기
    if (feature === 'schedule') {
      setIsScheduleModalOpen(true); // 일정 추천 모달 열기
    }
  };

  // ... (handleScheduleSelect, renderTradeScheduleMessage 함수 동일) ...
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

  if (!roomInfo) { // productInfo는 없을 수도 있으니 roomInfo만 체크
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
        {isMine && ( 
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
          {isPending && !isMine && ( 
            <div className="buttons">
              <button className="reject-button" onClick={() => alert('거절 기능')}>거절</button>
              <button className="accept-button" onClick={() => alert('수락 기능')}>수락</button>
            </div>
          )}
          {isPending && isMine && ( 
            <div className="buttons">
              <button className="default-button" disabled>상대방 응답 대기중</button>
            </div>
          )}
           {isAccepted && (
            <div className="buttons">
              <button className="accept-button" disabled>거래 확정됨</button>
            </div>
          )}
          {isRejected && (
            <div className="buttons">
              <button className="reject-button" disabled>거래 거절됨</button>
            </div>
          )}
        </div>
        {!isMine && (
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
                {isMine && (
                  <div className="message-meta">
                    {msg.isRead ? null : <span className="message-read-status">1</span>}
                    <span>{msg.timestamp}</span>
                  </div>
                )}
                <div className={`message-bubble ${isMine ? 'mine' : 'partner'}`}>
                  {msg.text}
                </div>
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
            rows={1}
          />
          <button type="submit" className="chat-send-button">전송</button>
        </form>
      </div>

      {/* 모달 렌더링 */}
      {isFeaturesModalOpen && (
        <ChatFeaturesModal
          onClose={() => setIsFeaturesModalOpen(false)}
          onFeatureSelect={handleFeatureSelect}
          // 9. 컨텍스트에서 찾은 productInfo 사용
          sellerHasTimetable={productInfo ? productInfo.sellerHasTimetable : false} 
        />
      )}
      {isScheduleModalOpen && (
        <TradeScheduleRecommendModal
          partnerNickname={roomInfo ? roomInfo.partner.nickname : ''} 
          onClose={() => setIsScheduleModalOpen(false)}
          onScheduleSelect={handleScheduleSelect}
        />
      )}
    </div>
  );
}

export default ChatRoomPage;