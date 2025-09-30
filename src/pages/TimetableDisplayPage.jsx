// src/pages/TimetableDisplayPage.jsx (이전 코드를 그대로 사용)
import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import './TimetableDisplayPage.css';

const MOCK_EVENTS = [
  { id: 1, name: '컴퓨터 구조론', day: '월', startTime: '10:00', endTime: '12:00', color: '#a0c4ff' },
  { id: 2, name: '자료구조', day: '화', startTime: '13:00', endTime: '15:00', color: '#9bf6ff' },
  { id: 3, name: '알고리즘', day: '수', startTime: '09:00', endTime: '11:00', color: '#ffadad' },
  { id: 4, name: '공강', day: '월', startTime: '13:00', endTime: '14:00', color: '#d0f0c0' },
  { id: 5, name: '과제', day: '목', startTime: '10:00', endTime: '12:00', color: '#ffd700' },
];

const days = ['월', '화', '수', '목', '금'];
// 9시부터 16시까지 (총 8시간)
const times = Array.from({ length: 8 }, (_, i) => i + 9);

const dayToColumn = { '월': 2, '화': 3, '수': 4, '목': 5, '금': 6 };

const timeToRow = (timeStr) => {
  const hour = parseInt(timeStr.split(':')[0], 10);
  return (hour - 9) + 2;
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
        <div className="timetable-grid-wrapper">
          <div className="timetable-grid">
            <div style={{gridColumn: 1, borderBottom: '1px solid var(--border-color)'}}></div>
            {days.map(day => <div key={day} className="grid-day-header">{day}</div>)}

            {times.map(time => (
              <React.Fragment key={time}>
                {/* 수정: 12시간 기준으로 시간 표시 */}
                <div className="grid-time-label" style={{gridRow: (time - 9) + 2}}>
                  {time > 12 ? time - 12 : time}
                </div>
                {days.map(day => <div key={`${day}-${time}`} className="grid-cell" style={{gridRow: (time - 9) + 2, gridColumn: dayToColumn[day]}}></div>)}
              </React.Fragment>
            ))}
            
            {MOCK_EVENTS.map(event => {
              const startRow = timeToRow(event.startTime);
              const endRow = timeToRow(event.endTime);
              const column = dayToColumn[event.day];
              
              // 17시 이전에 끝나는 이벤트만 표시
              if (parseInt(event.startTime.split(':')[0]) < 17) {
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
                  >
                    <strong>{event.name}</strong>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
        <button onClick={() => alert('시간표 수정 페이지 준비 중')} className="manage-button">
          시간표 수정/관리하기
        </button>
      </main>
    </div>
  );
}

export default TimetableDisplayPage;