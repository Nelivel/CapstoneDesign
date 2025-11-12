import React from 'react';
import './RemoteGuideModal.css';

function RemoteGuideModal({ onClose }) {
  return (
    <div className="remote-guide-backdrop" onClick={onClose}>
      <div className="remote-guide-content" onClick={(e) => e.stopPropagation()}>
        <header className="remote-guide-header">
          <h3>비대면 거래 이용 가이드</h3>
          <button className="remote-guide-close" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </header>
        <main className="remote-guide-body">
          <ol>
            <li>
              <strong>판매자</strong>: 채팅방에서 <em>물품 등록하기</em> 버튼을 눌러 QR 코드를 발급하고 키오스크에 물품을 보관합니다.
            </li>
            <li>
              <strong>구매자</strong>: "판매자가 물품을 보관했습니다" 알림을 받은 후 <em>결제 후 물품 수령</em> 버튼으로 결제를 진행합니다.
            </li>
            <li>
              결제 완료 시 구매자용 수령 QR 코드가 발급되며, 키오스크에서 QR을 인식해 캐비닛을 열고 물품을 수령합니다.
            </li>
            <li>
              수령이 완료되면 시스템이 자동으로 판매자에게 대금을 정산합니다.
            </li>
          </ol>
          <p className="remote-guide-tip">
            키오스크는 캠퍼스 내 무인 포스트 옆에 위치해 있으며, QR은 화면 캡처를 권장합니다.
          </p>
        </main>
        <footer className="remote-guide-footer">
          <button onClick={onClose} className="remote-guide-ok">이해했어요</button>
        </footer>
      </div>
    </div>
  );
}

export default RemoteGuideModal;
