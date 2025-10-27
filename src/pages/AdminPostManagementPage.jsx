// src/pages/AdminPostManagementPage.jsx
import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import './PlaceholderPage.css'; // 공통 CSS 사용

function AdminPostManagementPage() {
  const { navigate } = useNavigation();
  // TODO: Add admin check logic similar to AdminPage

  return (
    <div className="placeholder-page">
      <header className="placeholder-header">
        <button onClick={() => navigate('/admin')} className="back-button" style={{position: 'static'}}>{'<'}</button>
        <h2 className="placeholder-header-title">게시글 관리</h2>
      </header>
      <main className="placeholder-main">
        <p>게시글 관리 페이지입니다. (구현 예정)</p>
        {/* 여기에 게시글 목록, 검색, 삭제 등의 UI가 들어갑니다. */}
      </main>
    </div>
  );
}
export default AdminPostManagementPage;