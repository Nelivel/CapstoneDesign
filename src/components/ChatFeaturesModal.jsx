// src/components/ChatFeaturesModal.jsx
import React from 'react';
import './ChatFeaturesModal.css';

function ChatFeaturesModal({ onClose, onFeatureSelect, sellerHasTimetable }) {
  return (
    <div className="features-modal-backdrop" onClick={onClose}>
      <div className="features-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="feature-button"
          onClick={() => onFeatureSelect('schedule')}
          disabled={!sellerHasTimetable} // E-1: 시간표 없으면 비활성화
          title={!sellerHasTimetable ? '상대방이 시간표를 제공하지 않았습니다.' : ''}
        >
          <div className="feature-icon">🗓️</div>
          <span>거래일정 추천</span>
        </button>

        {/* --- 비대면 결제 버튼 (신규) --- */}
        <button
          className="feature-button"
          onClick={() => onFeatureSelect('payment')} // 'payment' 기능 선택
        >
          <div className="feature-icon">💳</div>
          <span>비대면 결제</span>
        </button>

        <button className="feature-button" onClick={() => alert('앨범 기능 준비 중')}>
          <div className="feature-icon">🖼️</div>
          <span>앨범</span>
        </button>
        <button className="feature-button" onClick={() => alert('카메라 기능 준비 중')}>
          <div className="feature-icon">📷</div>
          <span>카메라</span>
        </button>
        {/* ... 다른 기능 버튼들 추가 ... */}
      </div>
    </div>
  );
}

export default ChatFeaturesModal;