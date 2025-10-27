// src/pages/KioskScanPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // react-router-dom 훅 사용
import './KioskPage.css'; // 공통 CSS

// 채팅방에서 생성된 임시 QR 코드 (실제로는 서버 검증 필요)
// ChatRoomPage.jsx의 handlePaymentSuccess에서 생성한 QR 코드 형식과 맞춰야 함
// 예시: const MOCK_SELLER_QR = 'SELLER_QR_1_1729999999999';
// 예시: const MOCK_BUYER_QR = 'BUYER_QR_1_1800000000000';
// 여기서는 간단하게 고정값 사용
const MOCK_SELLER_QR = 'SELLER_QR_CODE_12345';
const MOCK_BUYER_QR = 'BUYER_QR_CODE_67890';

function KioskScanPage() {
  const { mode } = useParams(); // URL 파라미터 ('deposit' or 'retrieve')
  const navigate = useNavigate();
  const [qrInput, setQrInput] = useState('');
  const [step, setStep] = useState('scan'); // 단계: scan, processing, photo(판매자), complete
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isDeposit = mode === 'deposit'; // 판매자 모드 여부
  const title = isDeposit ? '물품 보관하기' : '물품 찾기';

  // 스캔 또는 입력 완료 처리
  const handleScan = () => {
    setErrorMessage(''); // 이전 에러 메시지 초기화
    setStep('processing'); // 처리 중 상태로 변경

    // --- QR 코드 유효성 검사 (시뮬레이션) ---
    let isValid = false;
    if (isDeposit && qrInput === MOCK_SELLER_QR) {
      isValid = true;
    } else if (!isDeposit && qrInput === MOCK_BUYER_QR) {
      isValid = true;
    }

    // 검증 결과에 따른 분기
    setTimeout(() => { // 실제 네트워크 요청처럼 보이게 딜레이
      if (isValid) {
        setMessage('QR 코드 인증 완료! 보관함 문이 열립니다.');
        // --- 성공 시 다음 단계 ---
        setTimeout(() => {
          if (isDeposit) {
            setStep('photo'); // 판매자는 사진 촬영 단계로
            setMessage('물품을 넣고 문을 닫은 후, 아래 확인 버튼을 눌러주세요.');
          } else {
            setStep('complete'); // 구매자는 완료 단계로
            setMessage('물품을 수령했습니다!\n3초 후 자동으로 홈 화면으로 돌아갑니다.');
            // [시나리오 4-1] 구매자 수령 완료 -> 시스템이 판매자에게 금액 전송 (API 호출 필요)
            // [시나리오 4-2] 상품 상태 '판매 완료'로 변경 (API 호출 필요)
            // TODO: API 호출 로직 추가 (예: `markProductAsSold(productId)`)
            setTimeout(() => navigate('/kiosk'), 3000); // 3초 후 홈으로
          }
        }, 1500); // 문 열리는 시간 시뮬레이션
      } else {
        // --- 실패 시 ---
        setStep('scan'); // 다시 스캔 단계로
        setErrorMessage('유효하지 않은 QR 코드입니다. 다시 시도해주세요.');
        setQrInput(''); // 입력 필드 초기화
      }
    }, 1000); // 인증 시간 시뮬레이션
  };

  // [시나리오 3-1] 판매자 사진 촬영 및 보관 완료 처리
  const handleTakePhoto = () => {
    setStep('processing');
    setMessage('사진 촬영 및 보관 처리 중... (시뮬레이션)');

    // --- 시뮬레이션: 사진 촬영 및 서버 전송 ---
    setTimeout(() => {
      // [시나리오 3-2, 3-3]
      // 1. 찍은 사진을 구매자 앱/채팅으로 전송 (API 호출 필요)
      // 2. 구매자에게 '물품 수령 QR' 알림/메시지 전송 (API 호출/WebSocket 필요)
      //    (ChatRoomPage에서 미리 생성했지만, 원래는 이 시점에 전송)
      // 3. 상품 상태 '예약 중' 등으로 변경? (선택 사항, API 호출 필요)

      setStep('complete');
      setMessage('물품 보관이 완료되었습니다.\n구매자에게 알림이 전송됩니다.\n3초 후 자동으로 홈 화면으로 돌아갑니다.');
      setTimeout(() => navigate('/kiosk'), 3000); // 3초 후 홈으로
    }, 2000); // 처리 시간 시뮬레이션
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

        {/* 3. 판매자 사진 촬영 */}
        {step === 'photo' && (
          <div className="kiosk-photo-area">
             <h3>{message}</h3>
             {/* 실제 카메라 연동 시 필요한 UI 요소 */}
            <div className="camera-placeholder">[보관함 내부 카메라 영역]</div>
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