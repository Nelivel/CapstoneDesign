// src/components/PriceAdjustModal.jsx
import React, { useState } from 'react';
import './ScheduleModal.css'; // 스타일 재사용

function PriceAdjustModal({ currentPrice, onClose, onSave }) {
  const [price, setPrice] = useState(currentPrice);
  const [error, setError] = useState('');

  const handleSave = () => {
    const newPrice = Number(price);
    if (isNaN(newPrice) || newPrice < 0) {
      setError('올바른 가격을 입력해주세요.');
      return;
    }
    setError('');
    onSave(newPrice); // 숫자 타입으로 전달
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>가격 조정하기</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-form">
          <div className="form-group">
            <label htmlFor="priceInput">조정할 가격 (원)</label>
            <input
              id="priceInput"
              type="number"
              className="form-input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="숫자만 입력"
              min="0" // 음수 입력 방지
            />
            {error && <p style={{ color: 'red', fontSize: '0.8em', marginTop: '5px' }}>{error}</p>}
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="action-button cancel-button">취소</button>
          <button onClick={handleSave} className="action-button save-button">저장</button>
        </div>
      </div>
    </div>
  );
}

export default PriceAdjustModal;