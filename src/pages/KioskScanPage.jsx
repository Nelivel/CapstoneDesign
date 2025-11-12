// src/pages/KioskScanPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './KioskPage.css';

const FLOW_PREFIX = 'tradeFlow_';
const DEFAULT_WALLET_BALANCE = 50000;

const createDefaultTradeFlow = () => ({
  phase: 'idle',
  lockerNumber: null,
  sellerQr: null,
  buyerQr: null,
  escrowAmount: 0,
  history: [],
  updatedAt: null,
  sellerId: null,
  buyerId: null,
});

const appendHistory = (history = [], text) => {
  if (!text) return history;
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text,
    timestamp: new Date().toISOString(),
  };
  return [...history, entry].slice(-8);
};

const readFlow = (productId) => {
  if (!productId) return null;
  try {
    const stored = localStorage.getItem(`${FLOW_PREFIX}${productId}`);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (err) {
    console.warn('Kiosk: Failed to read trade flow', err);
    return null;
  }
};

const writeFlow = (productId, flow) => {
  if (!productId || !flow) return;
  try {
    localStorage.setItem(`${FLOW_PREFIX}${productId}`, JSON.stringify(flow));
    window.dispatchEvent(new CustomEvent('tradeFlow:updated', { detail: { productId, flow } }));
  } catch (err) {
    console.warn('Kiosk: Failed to write trade flow', err);
  }
};

const mutateFlow = (productId, mutator, historyText) => {
  if (!productId || typeof mutator !== 'function') return null;
  const current = readFlow(productId) || createDefaultTradeFlow();
  const base = { ...createDefaultTradeFlow(), ...current };
  const updated = mutator(base) || base;
  updated.history = historyText ? appendHistory(base.history || [], historyText) : (updated.history || base.history || []);
  updated.updatedAt = new Date().toISOString();
  writeFlow(productId, updated);
  return updated;
};

const readWalletBalance = (userId) => {
  if (!userId) return DEFAULT_WALLET_BALANCE;
  try {
    const stored = localStorage.getItem(`virtualWallet_${userId}`);
    if (stored === null || stored === undefined) return DEFAULT_WALLET_BALANCE;
    const parsed = Number(stored);
    return Number.isNaN(parsed) ? DEFAULT_WALLET_BALANCE : parsed;
  } catch (err) {
    return DEFAULT_WALLET_BALANCE;
  }
};

const writeWalletBalance = (userId, balance) => {
  if (!userId) return;
  try {
    localStorage.setItem(`virtualWallet_${userId}`, String(Math.max(0, Math.round(balance))));
  } catch (err) {
    console.warn('Kiosk: Failed to persist wallet', err);
  }
};

const adjustWallet = (userId, delta) => {
  if (!userId || !delta) return;
  const current = readWalletBalance(userId);
  const next = Math.max(0, current + delta);
  writeWalletBalance(userId, next);
};

const findFlowByQr = (qr) => {
  if (!qr) return null;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(FLOW_PREFIX)) continue;
    const productId = key.replace(FLOW_PREFIX, '');
    const flow = readFlow(productId);
    if (!flow) continue;
    if (flow.sellerQr === qr) {
      return { productId, flow, role: 'seller' };
    }
    if (flow.buyerQr === qr) {
      return { productId, flow, role: 'buyer' };
    }
  }
  return null;
};

function KioskScanPage() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const [qrInput, setQrInput] = useState('');
  const [step, setStep] = useState('scan');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [lockerNumber, setLockerNumber] = useState(null);
  const [flowContext, setFlowContext] = useState(null);

  const isDeposit = mode === 'deposit';
  const title = isDeposit ? '물품 보관하기' : '물품 찾기';

  useEffect(() => {
    const handler = (event) => {
      const { productId, flow } = event.detail || {};
      if (!productId || !flowContext) return;
      if (String(productId) !== String(flowContext.productId)) return;
      setFlowContext(prev => ({ ...prev, flow }));
      if (flow.lockerNumber) {
        setLockerNumber(flow.lockerNumber);
      }
    };
    window.addEventListener('tradeFlow:updated', handler);
    return () => window.removeEventListener('tradeFlow:updated', handler);
  }, [flowContext]);

  const resetToHome = () => {
    setTimeout(() => navigate('/kiosk'), 3000);
  };

  const handleScan = () => {
    if (!qrInput.trim()) {
      setErrorMessage('QR 코드를 입력해주세요.');
      return;
    }
    setErrorMessage('');
    setStep('processing');
    setMessage('QR 코드 정보를 확인하고 있습니다...');

    setTimeout(() => {
      const match = findFlowByQr(qrInput.trim());
      if (!match) {
        setStep('scan');
        setErrorMessage('유효하지 않은 QR 코드입니다. 다시 시도해주세요.');
        setQrInput('');
        return;
      }

      if (isDeposit && match.role !== 'seller') {
        setStep('scan');
        setErrorMessage('판매자용 QR이 아닙니다. 보관용 QR을 사용해주세요.');
        setQrInput('');
        return;
      }

      if (!isDeposit && match.role !== 'buyer') {
        setStep('scan');
        setErrorMessage('구매자 수령용 QR이 아닙니다. 결제 후 발급된 QR을 사용해주세요.');
        setQrInput('');
        return;
      }

      if (isDeposit && match.flow.phase !== 'seller_qr') {
        setStep('scan');
        setErrorMessage('이미 사용된 QR 코드입니다. 새로운 QR을 발급받아주세요.');
        setQrInput('');
        return;
      }

      if (!isDeposit && match.flow.phase !== 'buyer_qr') {
        setStep('scan');
        setErrorMessage('아직 수령 가능한 상태가 아닙니다. 결제 후 발급된 QR을 사용해주세요.');
        setQrInput('');
        return;
      }

      setFlowContext(match);
      const locker = match.flow.lockerNumber || Math.floor(Math.random() * 50) + 1;
      setLockerNumber(locker);
      setStep('locker');
      setMessage(`QR 코드 인증 완료!\n${locker}번 캐비닛이 잠금 해제되었습니다.`);

      setTimeout(() => {
        if (isDeposit) {
          setStep('photo');
          setMessage(`물품을 ${locker}번 캐비닛에 넣고 문을 닫은 후, 아래 확인 버튼을 눌러주세요.`);
        } else {
          setStep('complete');
          setMessage(`물품을 ${locker}번 캐비닛에서 수령했습니다!\n3초 후 자동으로 홈 화면으로 돌아갑니다.`);
          const { productId, flow } = match;
          mutateFlow(productId, current => ({
            ...current,
            phase: 'completed',
            escrowAmount: 0,
          }), `키오스크에서 캐비닛 ${locker}번 물품이 수령되었습니다.`);
          if (flow.sellerId && (flow.escrowAmount || 0) > 0) {
            adjustWallet(flow.sellerId, flow.escrowAmount);
          }
          resetToHome();
        }
      }, 1600);
    }, 600);
  };

  const handleTakePhoto = () => {
    if (!flowContext) return;
    setStep('processing');
    setMessage('보관 정보를 기록하고 있습니다...');

    setTimeout(() => {
      const updated = mutateFlow(flowContext.productId, current => ({
        ...current,
        phase: 'seller_deposited',
      }), `키오스크에서 물품 보관이 완료되었습니다.`);
      if (updated) {
        setFlowContext(prev => ({ ...prev, flow: updated }));
      }
      setStep('complete');
      setMessage('물품 보관이 완료되었습니다.\n구매자에게 알림이 전송됩니다.\n3초 후 자동으로 홈 화면으로 돌아갑니다.');
      resetToHome();
    }, 1200);
  };

  const handleInputChange = (e) => {
    setQrInput(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  return (
    <div className="kiosk-page scan">
      <header className="kiosk-header">
        <h1>{title}</h1>
      </header>
      <main className="kiosk-main scan-main">
        {step === 'scan' && (
          <div className="kiosk-scan-area">
            <h3>QR 코드를 스캐너에 인식시키거나<br />코드를 직접 입력해주세요.</h3>
            <div className="qr-scanner-placeholder">[QR 스캐너 영역]</div>
            <p style={{ marginTop: '20px', fontWeight: 'bold' }}>코드 직접 입력:</p>
            <input
              type="text"
              className="kiosk-input"
              value={qrInput}
              onChange={handleInputChange}
              placeholder="QR 코드를 입력하세요"
            />
            {errorMessage && <p className="kiosk-message error">{errorMessage}</p>}
            <button className="kiosk-button confirm-button" onClick={handleScan} disabled={!qrInput}>
              입력 완료
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="kiosk-process-area">
            <div className="spinner" />
            <h3>{message || '인증 중입니다...'}</h3>
          </div>
        )}

        {step === 'locker' && lockerNumber && (
          <div className="kiosk-locker-area">
            <div className="locker-unlock-animation">
              <div className="locker-number-display">{lockerNumber}</div>
              <div className="locker-status">🔓 잠금 해제됨</div>
            </div>
            <h3 style={{ whiteSpace: 'pre-line' }}>{message}</h3>
          </div>
        )}

        {step === 'photo' && (
          <div className="kiosk-photo-area">
            <h3>{message}</h3>
            <div className="camera-placeholder">[보관함 내부 카메라 영역]</div>
            <button className="kiosk-button confirm-button" style={{ width: '100%' }} onClick={handleTakePhoto}>
              물품 확인 및 사진 촬영 완료
            </button>
          </div>
        )}

        {step === 'complete' && (
          <div className="kiosk-complete-area">
            <span className="complete-icon">✅</span>
            <h3 style={{ whiteSpace: 'pre-line' }}>{message}</h3>
          </div>
        )}
      </main>
      <footer className="kiosk-footer">
        {step !== 'processing' && step !== 'complete' && (
          <button className="kiosk-button-secondary" onClick={() => navigate('/kiosk')}>
            처음으로 돌아가기
          </button>
        )}
      </footer>
    </div>
  );
}

export default KioskScanPage;