// src/pages/AccountNotificationSettingsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { getMe, updateNotificationPreferences } from '../api/authApi';
import './AccountSettingsPage.css';

function AccountNotificationSettingsPage() {
  const { navigate } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setNotifyInApp(Boolean(me?.notifyInApp));
        setNotifyEmail(Boolean(me?.notifyEmail));
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
    try {
      setSaving(true);
      const response = await updateNotificationPreferences({ notifyInApp, notifyEmail });
      setMessage(response || '알림 설정이 저장되었습니다.');
    } catch (err) {
      setError(err.message || '알림 설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="account-settings-page">
      <header className="settings-header">
        <button onClick={() => navigate('/settings/account')} className="back-button" style={{ position: 'static' }}>{'<'}</button>
        <h2 className="settings-header-title">알림 설정</h2>
      </header>
      <main className="settings-main">
        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <div className="settings-form">
            <div className="settings-panel">
              <h3>알림 수신 옵션</h3>
              <div className="toggle-row">
                <label>
                  <input
                    type="checkbox"
                    checked={notifyInApp}
                    onChange={(e) => setNotifyInApp(e.target.checked)}
                  />
                  거래 및 시스템 알림 받기
                </label>
                <p className="helper-text">채팅/결제 진행 사항을 앱 알림으로 받아보세요.</p>
              </div>
              <div className="toggle-row">
                <label>
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                  />
                  이메일로도 알림 받기
                </label>
                <p className="helper-text">중요 알림을 이메일로도 전송합니다. (추후 제공)</p>
              </div>
              {error && <p className="error-text">{error}</p>}
              {message && <p className="success-text">{message}</p>}
              <button className="outlined-button" onClick={handleSave} disabled={saving}>
                {saving ? '저장 중...' : '알림 설정 저장'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AccountNotificationSettingsPage;

