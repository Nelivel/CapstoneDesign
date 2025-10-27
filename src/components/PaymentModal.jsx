// src/components/PaymentModal.jsx
import React, { useState } from 'react';
import './ScheduleModal.css'; // 스타일 재사용

function PaymentModal({ productName, price, onClose, onPaymentSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    // 2초간 결제 시뮬레이션
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess(); // 성공 콜백 호출
      onClose(); // 모달 닫기
    }, 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>비대면 결제</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-form" style={{textAlign: 'center', padding: '20px 0'}}> {/* 스타일 추가 */}
          <p>상품명: {productName}</p>
          <h4>결제 금액: {price.toLocaleString('ko-KR')}원</h4>
          <p style={{fontSize: '0.9em', color: 'var(--sub-text-color)', marginTop: '15px', lineHeight: 1.5}}>
            결제 버튼을 누르면 금액이 시스템에 안전하게 보관되며,<br/>
            구매자가 물품을 수령할 때까지 판매자에게 전달되지 않습니다.
          </p>
        </div>
        <div className="modal-actions">
          <button onClick={handlePayment} className="action-button save-button" disabled={isProcessing}>
            {isProcessing ? '결제 진행 중...' : `${price.toLocaleString('ko-KR')}원 결제하기`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;