// src/pages/ChatRoomPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
import { useGlobalData } from '../context/GlobalContext'; // GlobalContext 훅
import { MOCK_CHAT_ROOMS, MOCK_MESSAGES, MOCK_TRADE_SCHEDULES } from '../data/chats'; // data 경로

// 컴포넌트 임포트
import ProductTradeHeader from '../components/ProductTradeHeader';
import PriceAdjustModal from '../components/PriceAdjustModal';
import ChatFeaturesModal from '../components/ChatFeaturesModal';
import TradeScheduleRecommendModal from '../components/TradeScheduleRecommendModal';
import PaymentModal from '../components/PaymentModal'; // PaymentModal 임포트

import './ChatRoomPage.css';

const MY_USER_ID = 'me'; // 현재 사용자 ID (임시)

function ChatRoomPage() {
  const { chatId } = useParams();
  const { navigate } = useNavigation();
  const location = useLocation();
  const { products, updateProduct, user } = useGlobalData(); // GlobalContext 사용

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messageEndRef = useRef(null);

  // 모달 상태
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false); // 가격 조정 모달
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // 비대면 결제 모달 상태 추가

  const roomInfo = MOCK_CHAT_ROOMS.find(room => room.id === parseInt(chatId));
  const productId = location.state?.productId || roomInfo?.productId;

  // 현재 채팅방의 상품 정보 (GlobalContext에서 가져옴)
  const product = products.find(p => p.id === productId);

  // 채팅방 내에서 관리될 현재 가격 (가격 조정 시 변경됨)
  const [currentPrice, setCurrentPrice] = useState(0);

  // 현재 사용자가 판매자인지 여부 (GlobalContext user와 상품 판매자 비교)
  const isSellerView = product && user && product.sellerNickname === user.nickname;

  // 상품 정보 로드 및 초기 메시지 로드
  useEffect(() => {
    if (product) {
      setCurrentPrice(product.price); // 상품 로드 시 현재 가격 설정
    }
    // 메시지 로드
    const chatMessages = MOCK_MESSAGES[chatId] || [];
    const tradeSchedules = MOCK_TRADE_SCHEDULES[chatId] || [];
    const combined = [...chatMessages, ...tradeSchedules].sort((a, b) => (a.id || 0) - (b.id || 0)); // id 기준으로 정렬 (id 없으면 0으로 간주)
    setMessages(combined);
  }, [chatId, product]); // product가 변경될 때도 useEffect 실행

  // 상품 상태 변경 감지 후 시스템 메시지 추가
  useEffect(() => {
    // product 상태가 유효할 때만 실행
    if(product){
        // 현재 메시지 목록에서 마지막 메시지 가져오기
        const lastMessage = messages[messages.length - 1];
        // 현재 상품 상태에 맞는 텍스트 생성
        const statusText = product.status === 'reserved' ? '예약 중' : product.status === 'sold' ? '판매 완료' : '판매 중';
        // 예상되는 시스템 메시지 텍스트
        const expectedMessage = `상품 상태가 '${statusText}'(으)로 변경되었습니다.`;

        // 마지막 메시지가 시스템 메시지이고 내용이 현재 상태 변경 메시지와 동일하면 중복 추가 방지
        if(!(lastMessage?.type === 'system' && lastMessage?.text === expectedMessage)){
            // ProductTradeHeader에서 상태 변경 시 시스템 메시지 추가
            // 초기 로드 시(messages 길이가 0일 때)에는 메시지 추가 안 함
            if (messages.length > 0) {
               addSystemMessage(expectedMessage);
            }
        }
    }
  // product 객체 자체가 아닌 product.status 값의 변경을 감지해야 함
  }, [product?.status, messages.length]); // product.status와 messages.length를 의존성 배열에 추가


  // 스크롤 맨 아래로
  useEffect(() => {
    // 메시지 목록이 업데이트될 때마다 맨 아래로 스크롤
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 시스템 메시지 추가 함수
  const addSystemMessage = (text) => {
    const newMsg = {
      id: Date.now(),
      type: 'system', // 시스템 메시지 타입
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    // 상태 업데이트 함수 내에서 중복 체크 한번 더 (시간차 동기화 문제 방지)
    setMessages(prev => {
        const lastMsg = prev[prev.length -1];
        // 마지막 메시지가 시스템 메시지이고 내용이 같다면 추가하지 않음
        if(lastMsg?.type === 'system' && lastMsg?.text === text){
            return prev;
        }
        return [...prev, newMsg]; // 새 메시지 추가
    });
  };

  // 일반 메시지 전송 핸들러
  const handleSendMessage = (e) => {
    e.preventDefault(); // form 기본 제출 동작 방지
    if (newMessage.trim() === '') return; // 빈 메시지 전송 방지
    const newMsg = {
      id: Date.now(), // 임시 ID (실제로는 서버에서 생성)
      sender: MY_USER_ID, // 보내는 사람
      text: newMessage, // 메시지 내용
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // 현재 시간
      isRead: false, // 초기에는 안 읽음 상태
    };
    setMessages(prev => [...prev, newMsg]); // 메시지 목록에 새 메시지 추가
    setNewMessage(''); // 입력창 비우기
    // TODO: 웹소켓으로 메시지 전송 API 호출 로직 추가
  };

  // + 버튼 기능 선택 핸들러
  const handleFeatureSelect = (feature) => {
    setIsFeaturesModalOpen(false); // 기능 모달 닫기
    if (feature === 'schedule') {
      // 판매자 시간표 없으면 ChatFeaturesModal에서 버튼 비활성화되므로 추가 체크 불필요
      setIsScheduleModalOpen(true); // 일정 추천 모달 열기
    }
    if (feature === 'payment') {
      // 구매자만 결제 가능하도록 (선택 사항)
      if (isSellerView) {
          alert('판매자는 결제할 수 없습니다.'); // 판매자일 경우 알림
          return;
      }
      setIsPaymentModalOpen(true); // 결제 모달 열기
    }
     // TODO: 다른 기능들 (앨범, 카메라 등) 추가
     if (feature !== 'schedule' && feature !== 'payment') {
         alert(`${feature} 기능 준비 중`);
     }
  };

  // 거래 일정 선택 완료 핸들러
  const handleScheduleSelect = (schedule) => {
    // 선택된 일정 정보를 포함하는 새 메시지 객체 생성
    const newScheduleMessage = {
      id: Date.now(),
      sender: MY_USER_ID,
      type: 'trade_schedule', // 메시지 타입을 'trade_schedule'로 지정
      status: 'pending', // 초기 상태는 '제안 중'
      location: '중앙도서관', // 임시 장소 (실제로는 선택 가능하게)
      time: `${schedule.day}요일 ${schedule.time}`, // 모달에서 전달받은 시간 정보
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };
    setMessages(prev => [...prev, newScheduleMessage]); // 메시지 목록에 추가
    setIsScheduleModalOpen(false); // 일정 추천 모달 닫기
  };

  // 가격 조정 완료 핸들러
  const handlePriceAdjust = (newPrice) => {
    if (product) {
      // 1. GlobalContext 상태 업데이트 (updateProduct 함수 호출)
      updateProduct(product.id, { price: newPrice });
      // 2. 채팅방 내 현재 가격 상태(currentPrice) 업데이트
      setCurrentPrice(newPrice);
      // 3. 시스템 메시지 추가하여 가격 변경 알림
      addSystemMessage(`판매자가 가격을 ${newPrice.toLocaleString('ko-KR')}원으로 변경했습니다.`);
    }
    setIsPriceModalOpen(false); // 가격 조정 모달 닫기
  };

  // --- 비대면 결제 성공 핸들러 ---
  const handlePaymentSuccess = () => {
    // 임시 QR 코드 생성 (상품 ID와 현재 시간을 조합하여 고유성 확보 시도)
    const sellerQR = `SELLER_QR_${product.id}_${Date.now()}`;
    const buyerQR = `BUYER_QR_${product.id}_${Date.now() + 1}`; // 구매자 QR (실제로는 서버에서 관리/발급)

    // 1. 결제 완료 시스템 메시지 객체 생성
    const paymentMsg = {
      id: Date.now(),
      type: 'system',
      text: `구매자가 ${currentPrice.toLocaleString('ko-KR')}원 결제를 완료했습니다. (시스템 보관 중)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // 2. 판매자용 QR 코드 시스템 메시지 객체 생성
    const sellerQrMsg = {
      id: Date.now() + 1, // ID 중복 방지
      type: 'system_qr', // QR 코드 렌더링을 위한 타입
      sender: 'system', // 시스템 발송
      text: '판매자용 보관함 QR 코드', // 메시지 제목
      qrCode: sellerQR, // 생성된 QR 코드 값
      for: 'seller', // 이 QR 코드가 누구를 위한 것인지 표시 ('seller' 또는 'buyer')
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // 3. 구매자용 QR 코드 시스템 메시지 객체 생성 (원래는 판매자 보관 후 발송)
    const buyerQrMsg = {
       id: Date.now() + 2, // ID 중복 방지
       type: 'system_qr',
       sender: 'system',
       text: '구매자용 보관함 QR 코드 (판매자가 물품 보관 후 사용 가능)',
       qrCode: buyerQR,
       for: 'buyer',
       timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // 생성된 메시지들을 메시지 목록 상태에 추가
    setMessages(prev => [...prev, paymentMsg, sellerQrMsg, buyerQrMsg]);

    // 선택 사항: 결제 완료 후 상품 상태를 '예약 중'으로 자동 변경
    // updateProduct(product.id, { status: 'reserved' });
    // addSystemMessage("상품 상태가 '예약 중'(으)로 변경되었습니다."); // 상태 변경 시스템 메시지 추가
  };


  // --- 메시지 타입별 렌더링 함수 ---

  // 일반 텍스트 메시지 렌더링
  const renderTextMessage = (msg) => {
    const isMine = msg.sender === MY_USER_ID; // 내가 보낸 메시지인지 확인
    return (
      <div key={msg.id} className={`message-row ${isMine ? 'mine' : 'partner'}`}>
        {/* 내 메시지일 경우 왼쪽에 시간/읽음 상태 표시 */}
        {isMine && (
          <div className="message-meta">
            {msg.isRead ? null : <span className="message-read-status">1</span>} {/* 안 읽음 표시 */}
            <span>{msg.timestamp}</span> {/* 시간 표시 */}
          </div>
        )}
        {/* 메시지 버블 */}
        <div className={`message-bubble ${isMine ? 'mine' : 'partner'}`}>
          {msg.text} {/* 메시지 내용 */}
        </div>
        {/* 상대방 메시지일 경우 오른쪽에 시간 표시 */}
        {!isMine && (
          <div className="message-meta">
            <span>{msg.timestamp}</span>
          </div>
        )}
      </div>
    );
  };

  // 거래 일정 메시지 렌더링
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
           {/* 상태에 따른 버튼 렌더링 */}
           {isPending && !isMine && ( // 상대방 제안 + 대기 중
             <div className="buttons">
               <button className="reject-button" onClick={() => alert('거절 기능')}>거절</button>
               <button className="accept-button" onClick={() => alert('수락 기능')}>수락</button>
             </div>
           )}
           {isPending && isMine && ( // 내 제안 + 대기 중
             <div className="buttons">
               <button className="default-button" disabled>상대방 응답 대기중</button>
             </div>
           )}
            {isAccepted && ( // 확정됨
             <div className="buttons">
               <button className="accept-button" disabled>거래 확정됨</button>
             </div>
           )}
           {isRejected && ( // 거절됨
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

  // 시스템 메시지 렌더링
  const renderSystemMessage = (msg) => (
    <div key={msg.id} className="message-row-system">
      <span>{msg.text}</span> {/* 메시지 내용만 중앙에 표시 */}
    </div>
  );

  // QR 코드 메시지 렌더링
  const renderQrMessage = (msg) => {
    // 이 QR 코드를 현재 사용자가 봐야 하는지 결정
    // 판매자 QR은 판매자에게만, 구매자 QR은 구매자에게만 보이도록
    const shouldDisplay = (isSellerView && msg.for === 'seller') || (!isSellerView && msg.for === 'buyer');

    // 내가 봐야 할 QR이 아니면 렌더링하지 않음
    if (!shouldDisplay) return null;

    // 내가 보낸 것처럼 오른쪽에 표시할지 (항상 시스템 발송이므로 isMine은 false)
    const isMine = false; // 시스템 메시지는 항상 상대방 버블처럼 왼쪽에 표시 (선택 사항)

    return (
      <div key={msg.id} className={`message-row ${isMine ? 'mine' : 'partner'}`}>
        {/* QR 메시지는 시간/읽음 상태 표시 생략 가능 */}
        <div className={`message-bubble qr-code ${isMine ? 'mine' : 'partner'}`}>
          <div className="qr-title">{msg.text}</div> {/* QR 코드 제목 */}
          {/* 실제 QR 코드 라이브러리(예: qrcode.react) 사용 시 아래 div 대체 */}
          <div className="qr-code-placeholder">[QR 코드: {msg.qrCode}]</div> {/* QR 코드 값 표시 (임시) */}
          <p className="qr-instruction">이 QR 코드를 키오스크에서 스캔해주세요.</p> {/* 안내 문구 */}
        </div>
        {!isMine && (
           <div className="message-meta">
             <span>{msg.timestamp}</span> {/* 시간 표시 */}
           </div>
         )}
      </div>
    );
  };

  // 채팅방 정보나 상품 정보가 없으면 로딩 또는 에러 표시
  if (!roomInfo || !product) {
    // TODO: 로딩 상태 추가
    return <div>채팅방 또는 상품 정보를 불러오는 중...</div>;
  }

  // --- 메인 렌더링 ---
  return (
    <div className="chat-room-page">
      {/* --- 상단 헤더 --- */}
      <header className="chat-room-header">
        <button onClick={() => navigate('/chat')} className="back-button" style={{position: 'static'}}>{'<'}</button>
        <h2 className="chat-room-partner-name">{roomInfo.partner.nickname}</h2>
        {/* TODO: 채팅방 메뉴 버튼 (나가기, 신고하기 등) */}
      </header>

      {/* --- 상단 거래 상품 정보 헤더 --- */}
      <ProductTradeHeader
        product={product} // 현재 상품 정보 전달
        currentPrice={currentPrice} // 조정될 수 있는 현재 가격 전달
        onPriceAdjustClick={() => setIsPriceModalOpen(true)} // 가격 조정 모달 열기 함수 전달
        isSellerView={isSellerView} // 현재 사용자가 판매자인지 여부 전달
      />

      {/* --- 메시지 목록 --- */}
      <main className="message-list">
        {messages.map(msg => {
          // 메시지 타입에 따라 적절한 렌더링 함수 호출
          switch (msg.type) {
            case 'trade_schedule': return renderTradeScheduleMessage(msg);
            case 'system': return renderSystemMessage(msg);
            case 'system_qr': return renderQrMessage(msg);
            default: return renderTextMessage(msg); // 타입 없거나 텍스트면 기본 렌더링
          }
        })}
        {/* 스크롤 위치 조정을 위한 빈 div */}
        <div ref={messageEndRef} />
      </main>

      {/* --- 하단 메시지 입력창 --- */}
      <div className="chat-input-area">
        <button className="chat-plus-button" onClick={() => setIsFeaturesModalOpen(true)}>+</button>
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <textarea
            className="chat-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            rows={1} // 기본 한 줄
            // 엔터키로 전송하는 기능 추가 가능 (onKeyDown 핸들러)
          />
          <button type="submit" className="chat-send-button">전송</button>
        </form>
      </div>

      {/* --- 모달 렌더링 영역 --- */}
      {/* 기능 선택 모달 */}
      {isFeaturesModalOpen && (
        <ChatFeaturesModal
          onClose={() => setIsFeaturesModalOpen(false)}
          onFeatureSelect={handleFeatureSelect}
          sellerHasTimetable={product.sellerHasTimetable} // 상품 정보에서 시간표 유무 전달
        />
      )}
      {/* 일정 추천 모달 */}
      {isScheduleModalOpen && (
        <TradeScheduleRecommendModal
          partnerNickname={roomInfo.partner.nickname} // 상대방 닉네임 전달
          onClose={() => setIsScheduleModalOpen(false)}
          onScheduleSelect={handleScheduleSelect} // 일정 선택 시 호출될 함수 전달
        />
      )}
      {/* 가격 조정 모달 (판매자 뷰일 때만) */}
      {isPriceModalOpen && isSellerView && (
        <PriceAdjustModal
          currentPrice={currentPrice} // 현재 가격 전달
          onClose={() => setIsPriceModalOpen(false)}
          onSave={handlePriceAdjust} // 저장 시 호출될 함수 전달
        />
      )}
      {/* 비대면 결제 모달 (구매자 뷰일 때만) */}
      {isPaymentModalOpen && !isSellerView && (
        <PaymentModal
          productName={product.title} // 상품명 전달
          price={currentPrice} // 현재 가격 전달
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess} // 결제 성공 시 호출될 함수 전달
        />
      )}
    </div>
  );
}

export default ChatRoomPage;