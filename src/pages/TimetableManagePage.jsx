// src/pages/TimetableManagePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { getMyTimetableForAI, saveTimetable } from '../api/timetableApi';
import './TimetableDisplayPage.css'; // 보기 페이지의 CSS를 재사용합니다!
import './TimetableManagePage.css'; // 관리 페이지 전용 CSS도 불러옵니다.

const INITIAL_EVENTS = [
  { id: 1, name: '컴퓨터 구조론', place: '공학관 203호', day: '월', startTime: '10:00', endTime: '12:00', color: '#a0c4ff' },
  { id: 2, name: '자료구조', place: '창조관 301호', day: '화', startTime: '13:00', endTime: '15:00', color: '#9bf6ff' },
  { id: 3, name: '알고리즘', place: '공학관 101호', day: '수', startTime: '09:00', endTime: '11:00', color: '#ffadad' },
];

const days = ['월', '화', '수', '목', '금'];
const hours = Array.from({ length: 9 }, (_, i) => i + 9); // 1교시~9교시

// 시간표 데이터를 5x9 매트릭스 형식으로 변환
const createEmptyTimetable = () => Array(5).fill(null).map(() => Array(9).fill('x'));

const timeToMinutes = (timeStr) => {
  const [hour, minute] = timeStr.split(':').map(Number);
  return hour * 60 + minute;
};

function TimetableManagePage() {
  const { navigate } = useNavigation();
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [timetable, setTimetable] = useState(createEmptyTimetable()); // 5x9 매트릭스
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [saving, setSaving] = useState(false);

  // 백엔드에서 시간표 로드
  useEffect(() => {
    (async () => {
      try {
        const data = await getMyTimetableForAI();
        if (data && data.length === 5) {
          setTimetable(data);
        }
      } catch (e) {
        console.error('시간표 로드 실패:', e);
      }
    })();
  }, []);

  // 시간표 저장
  const handleSave = async () => {
    try {
      setSaving(true);
      await saveTimetable(timetable);
      alert('시간표가 저장되었습니다.');
      navigate('/timetable');
    } catch (e) {
      alert('시간표 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 특정 교시 토글 (o <-> x)
  const togglePeriod = (dayIdx, periodIdx) => {
    const newTimetable = timetable.map((day, dIdx) => 
      dIdx === dayIdx 
        ? day.map((period, pIdx) => pIdx === periodIdx ? (period === 'o' ? 'x' : 'o') : period)
        : day
    );
    setTimetable(newTimetable);
  };

  const handleSaveEvent = (eventData) => {
    if (eventData.id) { // 수정
      setEvents(events.map(e => e.id === eventData.id ? eventData : e));
    } else { // 추가
      setEvents([...events, { ...eventData, id: Date.now() }]);
    }
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const openAddModal = () => {
    setEventToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setEventToEdit(event);
    setIsModalOpen(true);
  };

  return (
    <div className="timetable-manage-page">
      <header className="timetable-manage-header">
        <div className="header-title-group">
          <button onClick={() => navigate('/timetable')} className="back-button" style={{position: 'static'}}>{'<'}</button>
          <h2>시간표 관리</h2>
        </div>
        <button onClick={handleSave} className="save-button" disabled={saving}>
          {saving ? '저장 중...' : '시간표 저장'}
        </button>
      </header>
      <main className="timetable-manage-main">
        <table className="timetable-table">
          <thead>
            <tr>
              <th></th>
              {days.map(day => <th key={day}>{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour, hourIdx) => (
              <tr key={hour}>
                <td className="time-label-cell">{hourIdx + 1}교시 ({hour}:00)</td>
                {days.map((day, dayIdx) => {
                  const period = timetable[dayIdx]?.[hourIdx] || 'x';
                  return (
                    <td 
                      key={day} 
                      className={`timetable-cell ${period === 'o' ? 'occupied' : 'free'}`}
                      onClick={() => togglePeriod(dayIdx, hourIdx)}
                      style={{cursor: 'pointer'}}
                    >
                      {period === 'o' ? '수업' : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      {isModalOpen && (
        <ScheduleModal
          eventToEdit={eventToEdit}
          onSave={handleSaveEvent}
          onClose={() => setIsModalOpen(false)}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}

export default TimetableManagePage;