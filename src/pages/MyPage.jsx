// src/pages/MyPage.jsx
import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useGlobalData } from '../context/GlobalContext'; // 1. 임포트
import './MyPage.css';

function MyPage() {
  const { navigate } = useNavigation();
  const { user } = useGlobalData(); // 2. 컨텍스트에서 user 정보 가져오기

  // 3. 컨텍스트의 정보 사용
  const userName = user.nickname;
  const userSchool = user.school;
  
  return (
    <div className="mypage">
      <header className="mypage-header">
        {/* 마이페이지는 하단 탭에 있으므로 뒤로가기 버튼은 일반적으로 없습니다. */}
        <h2 className="mypage-header-title">마이페이지</h2>
      </header>
      <main className="mypage-main">
        <div className="user-summary">
          <div className="user-avatar"></div>
          <div className="user-info">
            {/* 4. 컨텍스트 데이터 바인딩 */}
            <div className="nickname">{userName}</div>
            <div className="school">{userSchool}</div>
          </div>
        </div>

        <div className="menu-section">
          {/* ... (메뉴 버튼들 동일) ... */}
          <button onClick={() => navigate('/history/sell')} className="menu-item">
            <span>📝</span>
            <span className="text">판매내역</span>
            <span className="arrow">{'>'}</span>
          </button>
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
          <button onClick={() => navigate('/timetable')} className="menu-item">
            <span>🗓️</span>
            <span className="text">시간표 설정</span>
            <span className="arrow">{'>'}</span>
          </button>
          <button onClick={() => navigate('/reputation')} className="menu-item">
            <span>👍</span>
            <span className="text">나의 신뢰도</span>
            <span className="arrow">{'>'}</span>
          </button>
          <button onClick={() => navigate('/settings/account')} className="menu-item">
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