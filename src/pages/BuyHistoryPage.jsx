// src/pages/BuyHistoryPage.jsx
import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import './PlaceholderPage.css'; // 공통 CSS 사용

function BuyHistoryPage() {
  const { navigate } = useNavigation();
  return (
    <div className="placeholder-page">
      <header className="placeholder-header">
        <button onClick={() => navigate('/mypage')} className="back-button" style={{position: 'static'}}>{'<'}</button>
        <h2 className="placeholder-header-title">구매내역</h2>
      </header>
      <main className="placeholder-main">
        <p>구매내역 페이지입니다. (구현 예정)</p>
      </main>
    </div>
  );
}
export default BuyHistoryPage;