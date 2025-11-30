// src/pages/MyPage.jsx
import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import './MyPage.css';

function MyPage() {
  const { navigate } = useNavigation();
  const userName = '신한대학교 김민준'; // 예시 사용자 이름
  const userSchool = '학교 인증 완료'; // 예시 학교 인증 상태

  return (
    <div className="mypage">
      <header className="mypage-header">
        {/* 마이페이지는 하단 탭에 있으므로 뒤로가기 버튼은 일반적으로 없습니다. */}
        {/* <button onClick={() => navigate('/')} className="back-button" style={{position: 'static'}}>{'<'}</button> */}
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
          {/* 수정: 판매내역 페이지로 이동 */}
          <button onClick={() => navigate('/history/sell')} className="menu-item">
            <span>📝</span>
            <span className="text">판매내역</span>
            <span className="arrow">{'>'}</span>
          </button>
          {/* 수정: 구매내역 페이지로 이동 */}
          <button onClick={() => navigate('/history/buy')} className="menu-item">
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
          {/* 수정: 시간표 설정 페이지로 이동 */}
          <button onClick={() => navigate('/timetable')} className="menu-item">
            <span>🗓️</span>
            <span className="text">시간표 설정</span>
            <span className="arrow">{'>'}</span>
          </button>
          {/* 수정: 나의 신뢰도 페이지로 이동 */}
          <button onClick={() => navigate('/reputation')} className="menu-item">
            <span>👍</span>
            <span className="text">나의 신뢰도</span>
            <span className="arrow">{'>'}</span>
          </button>
          {/* 수정: 계정/정보 관리 페이지로 이동 */}
          <button onClick={() => navigate('/settings/account')} className="menu-item">
            <span>⚙️</span>
            <span className="text">계정/정보 관리</span>
            <span className="arrow">{'>'}</span>
          </button>
        </div>

        <div className="logout-section">
          {/* 로그아웃 버튼은 로그인 페이지로 이동합니다. */}
          <button onClick={() => navigate('/login')} className="link-button logout-button">로그아웃</button>
        </div>
      </main>
    </div>
  );
}

export default MyPage;