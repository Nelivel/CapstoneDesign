import React, { useState } from 'react';

const steps = [
  {
    title: 'DeskClean 비대면 거래',
    description: 'QR 코드를 활용해 안전하게 물품을 보관하고 수령하는 절차입니다.',
    points: [
      '판매자는 QR 코드로 캐비닛을 열고 물품을 보관합니다.',
      '구매자는 결제 후 QR 코드로 캐비닛을 열어 물품을 수령합니다.',
    ],
  },
  {
    title: '판매자 가이드',
    description: '앱에서 물품 등록을 시작하면 QR 코드와 캐비닛 번호가 제공됩니다.',
    points: [
      '채팅방의 물품 등록 버튼을 눌러 QR 코드를 발급받습니다.',
      '키오스크에서 QR을 스캔하면 배정된 캐비닛이 열립니다.',
      '물품을 넣고 문을 닫은 뒤 보관 완료를 눌러 구매자에게 알립니다.',
    ],
  },
  {
    title: '구매자 가이드',
    description: '판매자가 물품을 보관한 뒤 결제를 진행하고 수령 QR을 활용하세요.',
    points: [
      '판매자 보관 완료 알림이 오면 결제 버튼이 활성화됩니다.',
      '결제 후 발급된 QR 코드로 키오스크에서 캐비닛을 열 수 있습니다.',
      '물품을 수령하면 앱에서 수령 완료를 눌러 거래를 마무리합니다.',
    ],
  },
  {
    title: '거래 완료',
    description: '구매자가 수령 완료를 누르면 판매자에게 정산이 자동 진행됩니다.',
    points: [
      '거래 내역은 마이페이지 내 기록에서 확인할 수 있습니다.',
      '문제가 발생하면 채팅방 혹은 고객센터를 통해 문의해주세요.',
    ],
  },
];

function RemoteGuideStepperModal({ onClose }) {
  const [current, setCurrent] = useState(0);
  const step = steps[current];

  const handlePrev = () => {
    setCurrent((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => Math.min(steps.length - 1, prev + 1));
  };

  return (
    <div className="guide-backdrop" onClick={onClose}>
      <div className="guide-card" onClick={(e) => e.stopPropagation()}>
        <header className="guide-header">
          <span className="guide-step">
            {current + 1} / {steps.length}
          </span>
          <button className="guide-close" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="guide-body">
          <h3 className="guide-title">{step.title}</h3>
          <p className="guide-description">{step.description}</p>
          <ul className="guide-points">
            {step.points.map((text, index) => (
              <li key={index}>{text}</li>
            ))}
          </ul>
        </div>
        <footer className="guide-footer">
          <button
            type="button"
            className="guide-button secondary"
            onClick={handlePrev}
            disabled={current === 0}
          >
            이전
          </button>
          <button
            type="button"
            className="guide-button primary"
            onClick={current === steps.length - 1 ? onClose : handleNext}
          >
            {current === steps.length - 1 ? '닫기' : '다음'}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default RemoteGuideStepperModal;


