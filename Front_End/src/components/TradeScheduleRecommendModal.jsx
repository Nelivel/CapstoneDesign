// src/components/TradeScheduleRecommendModal.jsx
import React, { useState, useEffect } from 'react';
import { MOCK_USERS } from '../mock-users';
import './TradeScheduleRecommendModal.css';

// 시나리오 A-1, A-2, E-1 구현
function TradeScheduleRecommendModal({ partnerNickname, onClose, onScheduleSelect }) {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // 컴포넌트 마운트 시 시간표를 분석하여 추천 생성 (A-1)
  useEffect(() => {
    const myTimetable = MOCK_USERS['me'].timetable;
    const partnerTimetable = MOCK_USERS[partnerNickname]?.timetable;

    if (!partnerTimetable) return; // E-1 (이미 ChatFeaturesModal에서 막았지만, 안전장치)

    const commonSlots = [];
    const days = ['월', '화', '수', '목', '금'];
    for (const day of days) {
      for (let i = 0; i < 10; i++) { // 9시부터 18시
        if (myTimetable[day][i] === 1 && partnerTimetable[day][i] === 1) {
          commonSlots.push({ day, time: `${i + 9}:00 - ${i + 10}:00` });
        }
      }
    }
    // 상위 3개만 추천 (임시 로직)
    setRecommendations(commonSlots.slice(0, 3));
  }, [partnerNickname]);

  const handleConfirm = () => {
    if (selectedSchedule) {
      onScheduleSelect(selectedSchedule);
      onClose();
    } else {
      alert('시간을 선택해주세요.');
    }
  };

  return (
    <div className="recommend-modal-backdrop">
      <div className="recommend-modal-content">
        <h3>거래 일정 추천</h3>
        <p style={{fontSize: '0.9em', color: 'var(--sub-text-color)', marginTop: '5px'}}>
          서로 시간이 가능한 슬롯 3개를 추천합니다.
        </p>
        <div className="recommend-list">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`recommend-item ${selectedSchedule === rec ? 'selected' : ''}`}
              onClick={() => setSelectedSchedule(rec)}
            >
              {rec.day}요일 {rec.time} (장소: 중앙도서관)
            </div>
          ))}
        </div>
        <div className="recommend-actions">
          <button className="cancel-button" onClick={onClose}>취소</button>
          <button className="other-button" onClick={() => alert('다른 일정 추천 기능')}>다른 일정 추천</button>
          <button className="confirm-button" onClick={handleConfirm}>선택</button>
        </div>
      </div>
    </div>
  );
}

export default TradeScheduleRecommendModal;