import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '';
  return `${numeric.toLocaleString('ko-KR')}원`;
};

function BuyerPickupModal({
  open,
  step,
  session,
  onClose,
  onStepChange,
  onPay,
  onComplete,
  walletBalance,
  onRecharge,
  loading,
}) {
  if (!open || !session) return null;

  const currentStep = step ?? 0;
  const amount = session.currentPrice ?? session.buyerEscrowAmount ?? 0;
  const buyerQr = session.buyerQrCode;
  const lockerNumber = session.lockerNumber ?? '-';

  const handleAdvance = () => {
    if (onStepChange) {
      onStepChange(currentStep + 1);
    }
  };

  return (
    <div className="simulator-backdrop" onClick={onClose}>
      <div className="simulator-card" onClick={(e) => e.stopPropagation()}>
        <header className="simulator-header">
          <h3>구매자 결제 · 수령</h3>
          <button onClick={onClose} className="simulator-close">
            ×
          </button>
        </header>
        <div className="simulator-body">
          {currentStep === 0 && (
            <div className="simulator-step">
              <span className="step-index">STEP 1</span>
              <h4>결제 금액 확인</h4>
              <p>결제 금액은 <strong>{formatCurrency(amount)}</strong> 입니다.</p>
              <div className="simulator-wallet">
                <span className="wallet-label">보유 재화</span>
                <strong>{formatCurrency(walletBalance)}</strong>
                <button
                  onClick={() => onRecharge && onRecharge(10000)}
                  className="wallet-recharge"
                  type="button"
                >
                  +10,000 충전
                </button>
              </div>
            </div>
          )}
          {currentStep === 1 && (
            <div className="simulator-step">
              <span className="step-index">STEP 2</span>
              <h4>수령용 QR 스캔</h4>
              <p>키오스크의 [물품 수령] 버튼을 누른 뒤 아래 QR을 스캔하세요.</p>
              {buyerQr ? (
                <div className="simulator-qr-block">
                  <QRCodeSVG value={buyerQr} size={200} level="M" />
                  <p className="qr-code-text">{buyerQr}</p>
                </div>
              ) : (
                <p>QR 코드를 불러오는 중입니다...</p>
              )}
            </div>
          )}
          {currentStep === 2 && (
            <div className="simulator-step">
              <span className="step-index">STEP 3</span>
              <h4>물품 수령 완료</h4>
              <p>캐비닛 <strong>{lockerNumber}번</strong>이 열렸습니다. 물품을 수령한 뒤 문을 닫아주세요.</p>
            </div>
          )}
        </div>
        <footer className="simulator-footer">
          <button className="secondary" onClick={onClose}>
            닫기
          </button>
          {currentStep === 0 && (
            <button className="primary" onClick={onPay} disabled={loading}>
              {loading ? '결제 중...' : `${formatCurrency(amount)} 결제하기`}
            </button>
          )}
          {currentStep === 1 && (
            <button
              className="primary"
              onClick={handleAdvance}
              disabled={!buyerQr || loading}
            >
              다음 단계
            </button>
          )}
          {currentStep === 2 && (
            <button className="primary" onClick={onComplete} disabled={loading}>
              수령 완료
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

export default BuyerPickupModal;


