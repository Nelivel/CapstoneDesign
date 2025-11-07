// src/pages/KioskScanPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // react-router-dom 훅 사용
import './KioskPage.css'; // 공통 CSS
import { validateCode, depositConfirm, pickup } from '../api/paymentApi';
import api from '../api';

// 서버에서 발급된 코드 검증/처리로 변경

function KioskScanPage() {
  const { mode } = useParams(); // URL 파라미터 ('deposit' or 'retrieve')
  const navigate = useNavigate();
  const [qrInput, setQrInput] = useState('');
  const [step, setStep] = useState('scan'); // 단계: scan, processing, photo(판매자), locker(캐비닛 잠금 해제), complete
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [lockerNumber, setLockerNumber] = useState(null); // 캐비닛 번호

  const isDeposit = mode === 'deposit'; // 판매자 모드 여부
  const title = isDeposit ? '물품 보관하기' : '물품 찾기';

  // 스캔 또는 입력 완료 처리
  const handleScan = () => {
    setErrorMessage(''); // 이전 에러 메시지 초기화
    setStep('processing'); // 처리 중 상태로 변경

    (async () => {
      try {
        const response = await validateCode({ code: qrInput, role: isDeposit ? 'SELLER' : 'BUYER' });
        const { paymentId, lockerNumber: lockerNum } = response;
        
        // 캐비닛 번호 저장
        setLockerNumber(lockerNum);
        
        // 캐비닛 잠금 해제 화면 표시
        setStep('locker');
        setMessage(`QR 코드 인증 완료!\n${lockerNum}번 캐비닛이 잠금 해제되었습니다.`);
        
        setTimeout(async () => {
          if (isDeposit) {
            setStep('photo');
            setMessage(`물품을 ${lockerNum}번 캐비닛에 넣고 문을 닫은 후, 아래 확인 버튼을 눌러주세요.`);
            // 확인 버튼에서 depositConfirm 호출
            (window).__paymentId = paymentId;
          } else {
            await pickup(paymentId);
            setStep('complete');
            setMessage(`물품을 ${lockerNum}번 캐비닛에서 수령했습니다!\n3초 후 자동으로 홈 화면으로 돌아갑니다.`);
            setTimeout(() => navigate('/kiosk'), 3000);
          }
        }, 2000); // 2초 후 다음 단계로
      } catch (e) {
        setStep('scan');
        setErrorMessage('유효하지 않은 QR 코드입니다. 다시 시도해주세요.');
        setQrInput('');
      }
    })();
  };

  // [시나리오 3-1] 판매자 사진 촬영 및 보관 완료 처리
  const handleTakePhoto = async () => {
    setStep('processing');
    setMessage('사진 촬영 및 보관 처리 중...');
    try {
      const paymentId = (window).__paymentId;
      if (paymentId) {
        if (photoFile) {
          const form = new FormData();
          form.append('file', photoFile);
          await api.post(`/payments/${paymentId}/locker-photo`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
        await depositConfirm(paymentId);
      }
      setStep('complete');
      setMessage('물품 보관이 완료되었습니다.\n구매자에게 알림이 전송됩니다.\n3초 후 자동으로 홈 화면으로 돌아갑니다.');
      setTimeout(() => navigate('/kiosk'), 3000);
    } catch (e) {
      setStep('scan');
      setErrorMessage('보관 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // QR 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    setQrInput(e.target.value);
    if (errorMessage) setErrorMessage(''); // 입력 시작 시 에러 메시지 제거
  };


  return (
    <div className="kiosk-page scan"> {/* scan 클래스 추가 */}
      <header className="kiosk-header">
        <h1>{title}</h1>
      </header>
      <main className="kiosk-main scan-main"> {/* scan-main 클래스 추가 */}

        {/* 1. 스캔 단계 */}
        {step === 'scan' && (
          <div className="kiosk-scan-area">
            <h3>QR 코드를 스캐너에 인식시키거나<br/>코드를 직접 입력해주세요.</h3>
            {/* 실제 스캐너 연동 시 필요한 UI 요소 */}
            <div className="qr-scanner-placeholder">[QR 스캐너 영역]</div>
            <p style={{marginTop: '20px', fontWeight: 'bold'}}>코드 직접 입력:</p>
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

        {/* 2. 처리 중 */}
        {step === 'processing' && (
          <div className="kiosk-process-area">
            <div className="spinner"></div>
            <h3>{message || '인증 중입니다...'}</h3>
          </div>
        )}

        {/* 2-1. 캐비닛 잠금 해제 화면 */}
        {step === 'locker' && lockerNumber && (
          <div className="kiosk-locker-area">
            <div className="locker-unlock-animation">
              <div className="locker-number-display">{lockerNumber}</div>
              <div className="locker-status">🔓 잠금 해제됨</div>
            </div>
            <h3 style={{ whiteSpace: 'pre-line' }}>{message}</h3>
          </div>
        )}

        {/* 3. 판매자 사진 촬영 */}
        {step === 'photo' && (
          <div className="kiosk-photo-area">
             <h3>{message}</h3>
             {/* 실제 카메라 연동 시 필요한 UI 요소 */}
            <div className="camera-placeholder">[보관함 내부 카메라 영역]</div>
            <input type="file" accept="image/*" className="kiosk-input" onChange={(e)=>setPhotoFile(e.target.files?.[0]||null)} />
            <button className="kiosk-button confirm-button" style={{width: '100%'}} onClick={handleTakePhoto}>
              물품 확인 및 사진 촬영 완료
            </button>
          </div>
        )}

        {/* 4. 완료 */}
        {step === 'complete' && (
          <div className="kiosk-complete-area">
             <span className="complete-icon">✅</span>
            <h3>{message}</h3>
          </div>
        )}

      </main>
      <footer className="kiosk-footer">
        {/* 처리 중, 완료 아닐 때만 '처음으로' 버튼 표시 */}
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