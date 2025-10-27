// src/pages/HomePage.jsx
import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import ProductList from '../components/ProductList';
import './HomePage.css';

function HomePage() {
  const { navigate } = useNavigation();

  // 검색 버튼 클릭 핸들러 (임시)
  const handleSearchClick = () => {
    alert('검색 기능 준비 중');
    // navigate('/search'); // 나중에 검색 페이지 라우팅
  };

  // 알림 버튼 클릭 핸들러 (임시)
  const handleAlertClick = () => {
    alert('알림 기능 준비 중');
    // navigate('/notifications'); // 나중에 알림 페이지 라우팅
  };

  return (
    <div className="home-page">
      <header className="home-header">
        {/* 로고 (크기는 CSS에서 100px로 설정) */}
        <img src="/logo.png" alt="책상정리 로고" className="logo" />

        {/* --- 헤더 오른쪽 액션 영역 (수정) --- */}
        <div className="header-actions">
          {/* 돋보기 아이콘 버튼 */}
          <button className="header-button search-button" onClick={handleSearchClick}>
            <span role="img" aria-label="검색">🔍</span>
          </button>

          {/* 알림 아이콘 버튼 */}
          <button className="header-button alert-button" onClick={handleAlertClick}>
            <span role="img" aria-label="알림">🔔</span>
            {/* 알림 개수 표시 (예시) */}
            {/* <span className="notification-badge">3</span> */}
          </button>
        </div>
      </header>

      <div className="category-bar">
        {/* 카테고리 버튼들 */}
        <button className="category-button">카테고리1</button>
        <button className="category-button">카테고리2</button>
        <button className="category-button">카테고리3</button>
      </div>

      <main className="home-main">
        <ProductList />
        <button onClick={() => navigate('/post')} className="write-button">글쓰기</button>
      </main>
    </div>
  );
}

export default HomePage;