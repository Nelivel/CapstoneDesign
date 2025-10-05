// src/pages/TimetableManagePage.jsx
import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import ScheduleModal from '../components/ScheduleModal';
import './TimetableDisplayPage.css'; // 보기 페이지의 CSS를 재사용합니다!
import './TimetableManagePage.css'; // 관리 페이지 전용 CSS도 불러옵니다.

const INITIAL_EVENTS = [
  { id: 1, name: '컴퓨터 구조론', place: '공학관 203호', day: '월', startTime: '10:00', endTime: '12:00', color: '#a0c4ff' },
  { id: 2, name: '자료구조', place: '창조관 301호', day: '화', startTime: '13:00', endTime: '15:00', color: '#9bf6ff' },
  { id: 3, name: '알고리즘', place: '공학관 101호', day: '수', startTime: '09:00', endTime: '11:00', color: '#ffadad' },
];

const days = ['월', '화', '수', '목', '금'];
const hours = Array.from({ length: 8 }, (_, i) => i + 9);

const timeToMinutes = (timeStr) => {
  const [hour, minute] = timeStr.split(':').map(Number);
  return hour * 60 + minute;
};

function TimetableManagePage() {
  const { navigate } = useNavigation();
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  const handleSaveEvent = (eventData) => {
    if (eventData.id) { // 수정
      setEvents(events.map(e => e.id === eventData.id ? eventData : e));
    } else { // 추가
      setEvents([...events, { ...eventData, id: Date.now(), place: '장소 미정' }]);
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
        <button onClick={openAddModal} className="add-event-button">+ 일정 추가</button>
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
            {hours.map(hour => (
              <tr key={hour}>
                <td className="time-label-cell">{hour > 12 ? hour - 12 : hour}</td>
                {days.map(day => (
                  <td key={day} className="event-cell">
                    {events
                      .filter(event => event.day === day && parseInt(event.startTime.split(':')[0]) === hour)
                      .map(event => {
                        const startMinutes = timeToMinutes(event.startTime) - hour * 60;
                        const durationMinutes = timeToMinutes(event.endTime) - timeToMinutes(event.startTime);
                        const top = (startMinutes / 60) * 100;
                        const height = (durationMinutes / 60) * 100;

                        return (
                          <div
                            key={event.id}
                            className="event-block"
                            style={{
                              top: `${top}%`,
                              height: `${height}%`,
                              backgroundColor: event.color,
                            }}
                            onClick={() => openEditModal(event)} // 클릭 시 수정 모달 열기
                          >
                            <strong>{event.name}</strong>
                            <span>{event.place}</span>
                          </div>
                        );
                      })}
                  </td>
                ))}
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