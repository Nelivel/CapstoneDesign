// src/pages/AccountSettingsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { getMe } from '../api/authApi';
import './AccountSettingsPage.css';

function AccountSettingsPage() {
  const { navigate } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setUser(me);
      } catch (e) {
        console.error('사용자 정보 로드 실패:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const goTo = (path) => navigate(path);
 
  return (
    <div className="account-settings-page">
      <header className="settings-header">
        <button onClick={() => navigate('/mypage')} className="back-button" style={{position: 'static'}}>{'<'}</button>
        <h2 className="settings-header-title">계정/정보 관리</h2>
      </header>
      <main className="settings-main">
        {loading ? (
          <p>로딩 중...</p>
        ) : user ? (
          <div className="settings-form">
            <div className="settings-menu">
              <button className="settings-menu-button" onClick={() => goTo('/settings/account/profile')}>
                <span>👤</span>
                <span className="text">닉네임 변경</span>
                <span className="arrow">{'>'}</span>
              </button>
              <button className="settings-menu-button" onClick={() => goTo('/settings/account/notifications')}>
                <span>🔔</span>
                <span className="text">알림 설정</span>
                <span className="arrow">{'>'}</span>
              </button>
              <button className="settings-menu-button" onClick={() => goTo('/settings/account/password')}>
                <span>🔐</span>
                <span className="text">비밀번호 변경</span>
                <span className="arrow">{'>'}</span>
              </button>
              <button className="settings-menu-button" onClick={() => goTo('/settings/account/delete')}>
                <span>⚠️</span>
                <span className="text">계정 삭제</span>
                <span className="arrow">{'>'}</span>
              </button>
            </div>
          </div>
        ) : (
          <p>사용자 정보를 불러올 수 없습니다.</p>
        )}
      </main>
    </div>
  );
}
export default AccountSettingsPage;