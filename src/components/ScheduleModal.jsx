// src/components/ScheduleModal.jsx
import React, { useState, useEffect } from 'react';
import './ScheduleModal.css';

const days = ['월', '화', '수', '목', '금'];
const times = Array.from({ length: 13 }, (_, i) => `${i + 9}:00`); // 9:00 - 21:00

function ScheduleModal({ event, onSave, onClose, onDelete }) {
  const [name, setName] = useState('');
  const [day, setDay] = useState('월');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  useEffect(() => {
    if (event) {
      setName(event.name);
      setDay(event.day);
      setStartTime(event.startTime);
      setEndTime(event.endTime);
    }
  }, [event]);

  const handleSave = () => {
    onSave({ ...event, name, day, startTime, endTime });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{event ? '일정 수정' : '일정 추가'}</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-form">
          <div className="form-group">
            <label>일정명</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 수업, 공강"
            />
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
          {event && <button onClick={() => { onDelete(event.id); onClose(); }} className="delete-button">삭제</button>}
          <button onClick={onClose} className="cancel-button">취소</button>
          <button onClick={handleSave} className="save-button">저장</button>
        </div>
      </div>
    </div>
  );
}

export default ScheduleModal;