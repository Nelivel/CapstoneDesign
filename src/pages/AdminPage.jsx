// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import './PlaceholderPage.css';

function AdminPage() {
  const { navigate } = useNavigation();
  // const [isAdmin, setIsAdmin] = useState(false); // 주석 처리 또는 삭제

  /* --- 관리자 권한 체크 로직 주석 처리 또는 삭제 시작 ---
  useEffect(() => {
    const simulatedAdmin = localStorage.getItem('userRole') === 'ADMIN';
    setIsAdmin(simulatedAdmin);
    if (!simulatedAdmin) {
      alert('관리자 권한이 필요합니다.');
      navigate('/');
    }
  }, [navigate]);

  if (!isAdmin) {
    // ... 권한 없음 처리 ...
    return (
        <div className="placeholder-page">
            <header className="placeholder-header">
                <button onClick={() => navigate('/')} className="back-button" style={{position: 'static'}}>{'<'}</button>
                <h2 className="placeholder-header-title">관리자 페이지</h2>
            </header>
            <main className="placeholder-main">
                <p>권한이 없습니다.</p>
            </main>
        </div>
    );
  }
  --- 관리자 권한 체크 로직 주석 처리 또는 삭제 끝 --- */

  // 이제 항상 관리자 페이지 내용이 렌더링됩니다.
  return (
    <div className="placeholder-page">
      <header className="placeholder-header">
        <button onClick={() => navigate('/')} className="back-button" style={{position: 'static'}}>{'<'}</button>
        <h2 className="placeholder-header-title">관리자 페이지</h2>
      </header>
      <main className="placeholder-main">
        <p>관리자 기능 목록</p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><button onClick={() => navigate('/admin/users')}>사용자 관리</button></li>
          <li><button onClick={() => navigate('/admin/posts')}>게시글 관리</button></li>
          <li><button onClick={() => navigate('/admin/reports')}>신고 관리</button></li>
        </ul>
      </main>
    </div>
  );
}

export default AdminPage;