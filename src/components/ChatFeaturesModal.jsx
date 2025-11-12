// src/components/ChatFeaturesModal.jsx
import React from 'react';
import './ChatFeaturesModal.css';

function ChatFeaturesModal({
  onClose,
  onFeatureSelect,
  sellerHasTimetable,
  tradeAction,
  priceAdjustDisabled,
  priceAdjustTooltip,
}) {
  const handleClick = (feature) => {
    onFeatureSelect(feature);
    onClose();
  };

  return (
    <div className="features-modal-backdrop" onClick={onClose}>
      <div className="features-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="feature-button" onClick={() => handleClick('image')}>
          <div className="feature-icon">🖼️</div>
          <span>이미지 업로드</span>
        </button>

        <button
          className="feature-button"
          onClick={() => handleClick('schedule')}
          disabled={!sellerHasTimetable}
          title={!sellerHasTimetable ? '상대방이 시간표를 제공하지 않았습니다.' : ''}
        >
          <div className="feature-icon">🗓️</div>
          <span>거래일정 추천</span>
        </button>

        <button
          className="feature-button"
          onClick={() => handleClick('price-adjust')}
          disabled={priceAdjustDisabled}
          title={priceAdjustTooltip}
        >
          <div className="feature-icon">💰</div>
          <span>가격 조정하기</span>
        </button>

        <button
          className="feature-button"
          onClick={() => handleClick('remote-trade')}
          disabled={tradeAction?.disabled}
          title={tradeAction?.tooltip}
        >
          <div className="feature-icon">💳</div>
          <span>{tradeAction?.label ?? '비대면 거래'}</span>
        </button>
      </div>
    </div>
  );
}

export default ChatFeaturesModal;