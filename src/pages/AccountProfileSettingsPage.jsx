// src/pages/AccountProfileSettingsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { getMe, updateNickname } from '../api/authApi';
import './AccountSettingsPage.css';

function AccountProfileSettingsPage() {
  const { navigate } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setUser(me);
        setNickname(me?.nickname || '');
      } catch (e) {
        console.error('사용자 정보 로드 실패:', e);
        setError('사용자 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setMessage('');
    setError('');
    const trimmed = nickname.trim();

    if (!trimmed) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 20) {
      setError('닉네임은 2자 이상 20자 이하로 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      const response = await updateNickname(trimmed);
      setMessage(response || '닉네임이 변경되었습니다.');
      const refreshed = await getMe();
      setUser(refreshed);
      setNickname(refreshed?.nickname || trimmed);
    } catch (err) {
      setError(err.message || '닉네임 변경 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="account-settings-page">
      <header className="settings-header">
        <button onClick={() => navigate('/settings/account')} className="back-button" style={{ position: 'static' }}>{'<'}</button>
        <h2 className="settings-header-title">닉네임 변경</h2>
      </header>
      <main className="settings-main">
        {loading ? (
          <p>로딩 중...</p>
        ) : !user ? (
          <p>사용자 정보를 불러올 수 없습니다.</p>
        ) : (
          <div className="settings-form">
            <div className="settings-panel">
              <div className="status-card">
                <h3>인증 상태</h3>
                <p>
                  이메일 인증
                  <span className={user.emailVerified ? 'badge badge-success' : 'badge badge-warning'}>
                    {user.emailVerified ? '완료' : '미완료'}
                  </span>
                </p>
                <p>
                  학교 인증
                  <span className={user.schoolEmailVerified ? 'badge badge-success' : 'badge badge-warning'}>
                    {user.schoolEmailVerified ? '완료' : '미완료'}
                  </span>
                </p>
              </div>

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
              {error && <p className="error-text">{error}</p>}
              {message && <p className="success-text">{message}</p>}
              <button onClick={handleSave} className="save-button" disabled={saving}>
                {saving ? '저장 중...' : '닉네임 저장'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AccountProfileSettingsPage;
