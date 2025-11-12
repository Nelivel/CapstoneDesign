// src/pages/AccountPasswordChangePage.jsx
import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { changePassword } from '../api/authApi';
import './AccountSettingsPage.css';

function AccountPasswordChangePage() {
  const { navigate } = useNavigation();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setMessage('');
    setError('');

    const { currentPassword, newPassword, confirmPassword } = form;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('현재 비밀번호와 새 비밀번호를 모두 입력해주세요.');
      return;
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('새 비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setSaving(true);
      const response = await changePassword({ currentPassword, newPassword, confirmPassword });
      setMessage(response || '비밀번호가 변경되었습니다.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="account-settings-page">
      <header className="settings-header">
        <button onClick={() => navigate('/settings/account')} className="back-button" style={{ position: 'static' }}>{'<'}</button>
        <h2 className="settings-header-title">비밀번호 변경</h2>
      </header>
      <main className="settings-main">
        <div className="settings-form">
          <div className="settings-panel">
            <h3>새 비밀번호 설정</h3>
            <div className="form-group">
              <label>현재 비밀번호</label>
              <input
                type="password"
                className="form-input"
                value={form.currentPassword}
                onChange={(e) => handleChange('currentPassword', e.target.value)}
                placeholder="현재 비밀번호"
              />
            </div>
            <div className="form-group">
              <label>새 비밀번호</label>
              <input
                type="password"
                className="form-input"
                value={form.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                placeholder="영문+숫자 조합 8자 이상"
              />
            </div>
            <div className="form-group">
              <label>새 비밀번호 확인</label>
              <input
                type="password"
                className="form-input"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="새 비밀번호 다시 입력"
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            {message && <p className="success-text">{message}</p>}
            <button className="outlined-button" onClick={handleSubmit} disabled={saving}>
              {saving ? '변경 중...' : '비밀번호 변경'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AccountPasswordChangePage;

