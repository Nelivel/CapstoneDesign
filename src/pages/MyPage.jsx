// src/pages/MyPage.jsx
import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import './MyPage.css';

function MyPage() {
  const { navigate } = useNavigation();
  const userName = '신한대학교 김민준';
  const userSchool = '학교 인증 완료';

  return (
    <div className="mypage">
      <header className="mypage-header">
      
        <h2 className="mypage-header-title">마이페이지</h2>
      </header>
      <main className="mypage-main">
        <div className="user-summary">
          <div className="user-avatar"></div>
          <div className="user-info">
            <div className="nickname">{userName}</div>
            <div className="school">{userSchool}</div>
          </div>
        </div>

        <div className="menu-section">
          <button onClick={() => alert('판매내역 페이지 준비 중')} className="menu-item">
            <span>📝</span>
            <span className="text">판매내역</span>
            <span className="arrow">{'>'}</span>
          </button>
          <button onClick={() => alert('구매내역 페이지 준비 중')} className="menu-item">
            <span>🛒</span>
            <span className="text">구매내역</span>
            <span className="arrow">{'>'}</span>
          </button>
          <button onClick={() => navigate('/favorites')} className="menu-item">
            <span>❤️</span>
            <span className="text">관심목록</span>
            <span className="arrow">{'>'}</span>
          </button>
        </div>

        <div className="menu-section">
          {/* '/timetable' (조회 페이지)로 연결 */}
          <button onClick={() => navigate('/timetable')} className="menu-item">
            <span>🗓️</span>
            <span className="text">시간표 설정</span>
            <span className="arrow">{'>'}</span>
          </button>
          <button onClick={() => alert('신뢰도 페이지 준비 중')} className="menu-item">
            <span>👍</span>
            <span className="text">나의 신뢰도</span>
            <span className="arrow">{'>'}</span>
          </button>
          <button onClick={() => alert('계정 설정 페이지 준비 중')} className="menu-item">
            <span>⚙️</span>
            <span className="text">계정/정보 관리</span>
            <span className="arrow">{'>'}</span>
          </button>
        </div>

        <div className="logout-section">
          <button onClick={() => navigate('/login')} className="link-button logout-button">로그아웃</button>
        </div>
      </main>
    </div>
  );
}

export default MyPage;