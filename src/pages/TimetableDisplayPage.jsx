// src/pages/TimetableDisplayPage.jsx
import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import './TimetableDisplayPage.css';

const MOCK_EVENTS = [
  { id: 1, name: '컴퓨터 구조론', place: '공학관 203호', day: '월', startTime: '10:00', endTime: '12:00', color: '#a0c4ff' },
  { id: 2, name: '자료구조', place: '창조관 301호', day: '화', startTime: '13:00', endTime: '15:00', color: '#9bf6ff' },
  { id: 3, name: '알고리즘', place: '공학관 101호', day: '수', startTime: '09:00', endTime: '11:00', color: '#ffadad' },
  { id: 4, name: '운영체제', place: '공학관 405호', day: '금', startTime: '14:00', endTime: '16:00', color: '#ffc6ff' },
  { id: 5, name: '데이터베이스', place: '비전관 201호', day: '화', startTime: '09:30', endTime: '10:30', color: '#90ee90' },
];

const days = ['월', '화', '수', '목', '금'];
const hours = Array.from({ length: 8 }, (_, i) => i + 9);

const timeToMinutes = (timeStr) => {
  const [hour, minute] = timeStr.split(':').map(Number);
  return hour * 60 + minute;
};

function TimetableDisplayPage() {
  const { navigate } = useNavigation();

  return (
    <div className="timetable-display-page">
      <header className="timetable-header">
        <button onClick={() => navigate('/mypage')} className="back-button" style={{position: 'static'}}>{'<'}</button>
        <h2 className="timetable-header-title">시간표 보기</h2>
      </header>
      <main className="timetable-main">
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
                    {MOCK_EVENTS
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
                            title={`${event.name}\n${event.place}\n${event.startTime} - ${event.endTime}`}
                          >
                            <div className="event-name">{event.name}</div>
                            <div className="event-details">
                              {event.place && <div>{event.place}</div>}
                              <div>{event.startTime} - {event.endTime}</div>
                            </div>
                          </div>
                        );
                      })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => navigate('/timetable/manage')} className="manage-button">
          시간표 수정/관리하기
        </button>
      </main>
    </div>
  );
}

export default TimetableDisplayPage;