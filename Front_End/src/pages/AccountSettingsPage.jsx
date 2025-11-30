// src/pages/AccountSettingsPage.jsx
import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import './PlaceholderPage.css'; // 공통 CSS 사용

function AccountSettingsPage() {
  const { navigate } = useNavigation();
  return (
    <div className="placeholder-page">
      <header className="placeholder-header">
        <button onClick={() => navigate('/mypage')} className="back-button" style={{position: 'static'}}>{'<'}</button>
        <h2 className="placeholder-header-title">계정/정보 관리</h2>
      </header>
      <main className="placeholder-main">
        <p>계정/정보 관리 페이지입니다. (구현 예정)</p>
        {/* 여기에 닉네임 변경, 비밀번호 변경 등의 기능을 추가할 수 있습니다. */}
      </main>
    </div>
  );
}
export default AccountSettingsPage;