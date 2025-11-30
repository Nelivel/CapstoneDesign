// src/pages/ReputationPage.jsx
import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import './PlaceholderPage.css'; // 공통 CSS 사용

function ReputationPage() {
  const { navigate } = useNavigation();
  return (
    <div className="placeholder-page">
      <header className="placeholder-header">
        <button onClick={() => navigate('/mypage')} className="back-button" style={{position: 'static'}}>{'<'}</button>
        <h2 className="placeholder-header-title">나의 신뢰도</h2>
      </header>
      <main className="placeholder-main">
        <p>나의 신뢰도 페이지입니다. (구현 예정)</p>
        {/* 여기에 이전에 ProfilePage에 있던 신뢰도 UI를 옮겨올 수 있습니다. */}
      </main>
    </div>
  );
}
export default ReputationPage;