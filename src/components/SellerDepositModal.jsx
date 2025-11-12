import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

function SellerDepositModal({ open, step, session, onClose, onStepChange, onComplete, loading }) {
  if (!open || !session) return null;

  const currentStep = step ?? 0;
  const phase = session.phase;
  const isAlreadyCompleted =
    phase === 'SELLER_DEPOSITED' || phase === 'BUYER_QR' || phase === 'COMPLETED';
  const lockerNumber = session.lockerNumber ?? '-';
  const sellerQr = session.sellerQrCode;

  const handleNext = () => {
    if (onStepChange) {
      onStepChange(currentStep + 1);
    }
  };

  return (
    <div className="simulator-backdrop" onClick={onClose}>
      <div className="simulator-card" onClick={(e) => e.stopPropagation()}>
        <header className="simulator-header">
          <h3>판매자 물품 보관</h3>
          <button onClick={onClose} className="simulator-close">
            ×
          </button>
        </header>
        <div className="simulator-body">
          {currentStep === 0 && (
            <div className="simulator-step">
              <span className="step-index">STEP 1</span>
              <h4>키오스크에서 QR 스캔</h4>
              <p>키오스크의 [물품 보관] 버튼을 누른 뒤 아래 QR을 스캔하세요.</p>
              {sellerQr ? (
                <div className="simulator-qr-block">
                  <QRCodeSVG value={sellerQr} size={200} level="M" />
                  <p className="qr-code-text">{sellerQr}</p>
                </div>
              ) : (
                <p>QR 코드를 불러오는 중입니다...</p>
              )}
            </div>
          )}
          {currentStep === 1 && (
            <div className="simulator-step">
              <span className="step-index">STEP 2</span>
              <h4>배정된 캐비닛에 물품 보관</h4>
              <p>지정된 캐비닛 <strong>{lockerNumber}번</strong>이 열렸습니다. 물품을 넣은 뒤 문을 닫아주세요.</p>
              <p>보관이 완료되면 아래 완료 버튼을 눌러 구매자에게 안내를 전송해주세요.</p>
            </div>
          )}
        </div>
        <footer className="simulator-footer">
          <button className="secondary" onClick={onClose}>
            닫기
          </button>
          {currentStep === 0 && (
            <button className="primary" onClick={handleNext} disabled={!sellerQr || loading}>
              다음 단계
            </button>
          )}
          {currentStep === 1 && (
            <button
              className="primary"
              onClick={isAlreadyCompleted ? onClose : onComplete}
              disabled={loading || (isAlreadyCompleted && !loading)}
            >
              {isAlreadyCompleted ? '보관 완료됨' : '보관 완료'}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

export default SellerDepositModal;


