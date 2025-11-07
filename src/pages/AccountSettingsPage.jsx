// src/pages/AccountSettingsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { getMe } from '../api/authApi';
import './AccountSettingsPage.css';

function AccountSettingsPage() {
  const { navigate } = useNavigation();
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setUser(me);
        setNickname(me?.nickname || '');
      } catch (e) {
        console.error('사용자 정보 로드 실패:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    alert('닉네임 변경 기능은 준비 중입니다.');
  };

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
            <div className="form-group">
              <label>사용자명</label>
              <input type="text" value={user.username || ''} disabled className="form-input" />
            </div>
            <div className="form-group">
              <label>닉네임</label>
              <input 
                type="text" 
                value={nickname} 
                onChange={(e) => setNickname(e.target.value)}
                className="form-input"
                placeholder="닉네임을 입력하세요"
              />
            </div>
            <button onClick={handleSave} className="save-button">저장</button>
            <div className="info-section">
              <p>비밀번호 변경 및 기타 설정은 준비 중입니다.</p>
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