// src/components/BottomNavBar.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
import './BottomNavBar.css';

function BottomNavBar() {
  const { navigate } = useNavigation();
  const location = useLocation(); // 현재 경로 정보를 가져옵니다.

  // 현재 경로와 버튼 경로가 일치하는지 확인하는 함수
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <button onClick={() => navigate('/')} className={`nav-button ${isActive('/') ? 'active' : ''}`}>
        <span>🏠</span>
        <span>홈</span>
      </button>
      <button onClick={() => navigate('/chat')} className={`nav-button ${isActive('/chat') ? 'active' : ''}`}>
        <span>💬</span>
        <span>채팅</span>
      </button>
      <button onClick={() => navigate('/favorites')} className={`nav-button ${isActive('/favorites') ? 'active' : ''}`}>
        <span>❤️</span>
        <span>관심</span>
      </button>
      <button onClick={() => navigate('/mypage')} className={`nav-button ${isActive('/mypage') ? 'active' : ''}`}>
        <span>👤</span>
        <span>마이페이지</span>
      </button>
    </nav>
  );
}

export default BottomNavBar;