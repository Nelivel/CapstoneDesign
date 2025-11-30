// src/components/ScheduleModal.jsx
import React, { useState, useEffect } from 'react';
import './ScheduleModal.css';

const days = ['월', '화', '수', '목', '금'];
const times = Array.from({ length: 17 }, (_, i) => { // 9:00 ~ 17:00, 30분 단위
  const hour = Math.floor(i / 2) + 9;
  const minute = (i % 2) * 30;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});

function ScheduleModal({ eventToEdit, onSave, onClose, onDelete }) {
  const [name, setName] = useState('');
  const [place, setPlace] = useState(''); // 장소 state 추가
  const [day, setDay] = useState('월');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState('#a0c4ff'); // 현재는 사용되지 않지만, 확장성을 위해 유지

  useEffect(() => {
    if (eventToEdit) {
      setName(eventToEdit.name);
      setPlace(eventToEdit.place || ''); // 기존 이벤트에 장소가 없으면 빈 문자열
      setDay(eventToEdit.day);
      setStartTime(eventToEdit.startTime);
      setEndTime(eventToEdit.endTime);
      setColor(eventToEdit.color);
    } else { // 새로운 일정 추가 시 초기화
      setName('');
      setPlace('');
      setDay('월');
      setStartTime('09:00');
      setEndTime('10:00');
      setColor('#a0c4ff');
    }
  }, [eventToEdit]);

  const handleSave = () => {
    // onSave 함수에 place 정보도 함께 전달
    onSave({ id: eventToEdit?.id, name, place, day, startTime, endTime, color });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{eventToEdit ? '일정 수정' : '일정 추가'}</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-form">
          <div className="form-group">
            <label>일정명</label>
            <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 수업, 공강"/>
          </div>
          <div className="form-group">
            <label>장소</label> {/* 장소 입력 필드 추가 */}
            <input type="text" className="form-input" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="예: 공학관 203호, 온라인"/>
          </div>
          <div className="form-group">
            <label>요일</label>
            <select className="form-select" value={day} onChange={(e) => setDay(e.target.value)}>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>시작 시간</label>
            <select className="form-select" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
              {times.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>종료 시간</label>
            <select className="form-select" value={endTime} onChange={(e) => setEndTime(e.target.value)}>
              {times.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-actions">
          {eventToEdit && <button onClick={() => { onDelete(eventToEdit.id); onClose(); }} className="action-button delete-button">삭제</button>}
          <button onClick={onClose} className="action-button cancel-button">취소</button>
          <button onClick={handleSave} className="action-button save-button">저장</button>
        </div>
      </div>
    </div>
  );
}

export default ScheduleModal;