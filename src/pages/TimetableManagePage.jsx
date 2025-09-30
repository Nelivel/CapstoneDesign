// src/pages/TimetableManagePage.jsx
import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import ScheduleModal from '../components/ScheduleModal';
import './TimetableManagePage.css';

const MOCK_EVENTS = [
  { id: 1, name: '컴퓨터 구조론', day: '월', startTime: '10:00', endTime: '12:00', color: '#a0c4ff' },
  { id: 2, name: '자료구조', day: '화', startTime: '13:00', endTime: '15:00', color: '#9bf6ff' },
  { id: 3, name: '알고리즘', day: '수', startTime: '09:00', endTime: '11:00', color: '#ffadad' },
];

const days = ['월', '화', '수', '목', '금'];
const times = Array.from({ length: 12 }, (_, i) => i + 9); // 9시부터 20시

function TimetableManagePage() {
  const { navigate } = useNavigation();
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const dayToIndex = { '월': 2, '화': 3, '수': 4, '목': 5, '금': 6 };
  const timeToRow = (time) => parseInt(time.split(':')[0]) - 8;

  const handleSaveEvent = (eventData) => {
    if (eventData.id) {
      setEvents(events.map(e => (e.id === eventData.id ? eventData : e)));
    } else {
      setEvents([...events, { ...eventData, id: Date.now() }]);
    }
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const openAddModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };
  
  const openEditModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="timetable-manage-page">
      <header className="timetable-header">
        <button onClick={() => navigate('/mypage')} className="back-button" style={{position: 'static'}}>{'<'}</button>
        <h2 className="timetable-header-title">시간표 관리</h2>
        <button onClick={openAddModal} className="add-event-button">+ 일정 추가</button>
      </header>
      <main className="timetable-main">
        <div className="timetable-grid-container">
          {/* Grid Header (Days) */}
          <div className="grid-header" style={{gridColumn: 1}}></div>
          {days.map((day, i) => <div key={i} className="grid-header" style={{gridColumn: i + 2}}>{day}</div>)}
          
          {/* Grid Times and Cells */}
          {times.map((time, i) => (
            <React.Fragment key={i}>
              <div className="grid-time" style={{gridRow: i + 2}}>{time}</div>
              {days.map((_, j) => <div key={j} className="grid-cell" style={{gridRow: i + 2, gridColumn: j + 2}}></div>)}
            </React.Fragment>
          ))}

          {/* Render Event Blocks */}
          {events.map(event => {
            const startRow = timeToRow(event.startTime);
            const endRow = timeToRow(event.endTime);
            const column = dayToIndex[event.day];
            return (
              <div
                key={event.id}
                className="event-block"
                style={{
                  gridRowStart: startRow,
                  gridRowEnd: endRow,
                  gridColumn: column,
                  backgroundColor: event.color
                }}
                onClick={() => openEditModal(event)}
              >
                {event.name}
              </div>
            );
          })}
        </div>
      </main>

      {isModalOpen && (
        <ScheduleModal
          event={selectedEvent}
          onSave={handleSaveEvent}
          onClose={() => setIsModalOpen(false)}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}

export default TimetableManagePage;