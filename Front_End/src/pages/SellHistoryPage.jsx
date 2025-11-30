// src/pages/SellHistoryPage.jsx
import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import './PlaceholderPage.css'; // 이 줄이 있는지, 경로가 올바른지 확인!

function SellHistoryPage() {
  const { navigate } = useNavigation();
  return (
    <div className="placeholder-page">
      <header className="placeholder-header">
        <button onClick={() => navigate('/mypage')} className="back-button" style={{position: 'static'}}>{'<'}</button>
        <h2 className="placeholder-header-title">판매내역</h2>
      </header>
      <main className="placeholder-main">
        <p>판매내역 페이지입니다. (구현 예정)</p>
      </main>
    </div>
  );
}
export default SellHistoryPage;