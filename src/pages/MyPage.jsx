// src/pages/MyPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { getMe, logout } from '../api/authApi';
import './MyPage.css';

function MyPage() {
  const { navigate } = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const me = await getMe();
      setUser(me);
    })();
  }, []);

  // 3. 컨텍스트의 정보 사용
  const userName = user?.nickname || '로그인이 필요합니다';
  const userSchool = user ? (user.school || '') : '';
  
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
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // 로그아웃 중 플래그 설정 (중복 클릭 방지)
              const logoutButton = e.target;
              logoutButton.disabled = true;
              logoutButton.textContent = '로그아웃 중...';
              
              // 1. 로그아웃 플래그 설정 (페이지 리로드 전에) - 가장 먼저!
              // sessionStorage와 localStorage 모두에 설정 (페이지 리로드 후에도 유지되도록)
              sessionStorage.setItem('logout', 'true');
              localStorage.setItem('logout', 'true');
              
              // 2. 로컬 스토리지 완전히 정리 (하지만 logout 플래그는 유지)
              const logoutFlag = localStorage.getItem('logout');
              localStorage.clear();
              if (logoutFlag) {
                localStorage.setItem('logout', 'true'); // 다시 설정
              }
              
              // 3. 쿠키 삭제
              if (document.cookie) {
                const cookies = document.cookie.split(";");
                for (let c of cookies) {
                  const cookieName = c.split("=")[0].trim();
                  // 모든 가능한 경로와 도메인에서 쿠키 삭제
                  document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
                  document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=" + window.location.hostname;
                  document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=." + window.location.hostname;
                  document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=localhost";
                }
              }
              
              // 4. 백엔드 로그아웃 API 호출은 백그라운드에서 처리 (기다리지 않음, Promise 에러 무시)
              logout().catch(() => {
                // Promise 에러 무시 (페이지 이동 후에는 응답을 받을 수 없으므로)
              });
              
              // 5. 즉시 페이지를 완전히 새로고침하며 로그인 페이지로 이동
              // window.location을 직접 조작하여 React Router 완전히 우회
              const loginUrl = window.location.origin + '/login';
              window.location.href = loginUrl;
            }} 
            className="link-button logout-button"
          >
            로그아웃
          </button>
        </div>
      </main>
    </div>
  );
}

export default MyPage;