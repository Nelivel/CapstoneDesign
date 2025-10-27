// src/pages/AdminReportManagementPage.jsx
import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import './PlaceholderPage.css'; // 공통 CSS 사용

function AdminReportManagementPage() {
  const { navigate } = useNavigation();
  // TODO: Add admin check logic similar to AdminPage

  return (
    <div className="placeholder-page">
      <header className="placeholder-header">
        <button onClick={() => navigate('/admin')} className="back-button" style={{position: 'static'}}>{'<'}</button>
        <h2 className="placeholder-header-title">신고 관리</h2>
      </header>
      <main className="placeholder-main">
        <p>신고 관리 페이지입니다. (구현 예정)</p>
        {/* 여기에 신고된 게시글/사용자 목록, 처리 버튼 등의 UI가 들어갑니다. */}
      </main>
    </div>
  );
}
export default AdminReportManagementPage;