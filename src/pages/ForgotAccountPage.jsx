import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { requestUsernameReminder, requestPasswordReset } from '../api/authApi';
import './ForgotAccountPage.css';

function ForgotAccountPage() {
  const { navigate } = useNavigation();
  const [activeTab, setActiveTab] = useState('username');
  const [usernameEmail, setUsernameEmail] = useState('');
  const [passwordEmail, setPasswordEmail] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUsernameReminder = async () => {
    setUsernameError('');
    setUsernameMessage('');
    const email = usernameEmail.trim();
    if (!email) {
      setUsernameError('가입 시 사용한 이메일 주소를 입력해주세요.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setUsernameError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    try {
      setLoading(true);
      const message = await requestUsernameReminder(email);
      setUsernameMessage(
        typeof message === 'string'
          ? message
          : '등록된 이메일로 아이디 안내 메일을 전송했습니다. 받은 편지함과 스팸함을 확인해주세요.'
      );
    } catch (error) {
      setUsernameError(error.message || '아이디 찾기 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setPasswordError('');
    setPasswordMessage('');
    const email = passwordEmail.trim();
    if (!email) {
      setPasswordError('가입 시 사용한 이메일 주소를 입력해주세요.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setPasswordError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    try {
      setLoading(true);
      const message = await requestPasswordReset(email);
      setPasswordMessage(
        typeof message === 'string'
          ? message
          : '임시 비밀번호를 등록된 이메일로 전송했습니다. 로그인 후 즉시 새 비밀번호로 변경해주세요.'
      );
    } catch (error) {
      setPasswordError(error.message || '비밀번호 재설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <button onClick={() => navigate('/login')} className="back-button">{'<'}</button>
      <h2 className="forgot-title">아이디 / 비밀번호 찾기</h2>
      <p className="forgot-subtitle">가입 시 등록한 이메일 주소를 입력하면 안내 메일을 보내드립니다.</p>

      <div className="forgot-tabs">
        <button
          className={`tab-button ${activeTab === 'username' ? 'active' : ''}`}
          onClick={() => setActiveTab('username')}
        >
          아이디 찾기
        </button>
        <button
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          비밀번호 재설정
        </button>
      </div>

      {activeTab === 'username' && (
        <section className="forgot-section">
          <h3>가입 이메일 확인</h3>
          <p className="helper-text">등록된 이메일로 아이디를 안내해 드립니다.</p>
          <label htmlFor="usernameEmail">이메일 주소</label>
          <input
            id="usernameEmail"
            type="email"
            value={usernameEmail}
            onChange={(e) => setUsernameEmail(e.target.value)}
            placeholder="example@email.com"
            disabled={loading}
          />
          {usernameError && <p className="error-message">{usernameError}</p>}
          {usernameMessage && (
            <div className="success-card">
              <p>{usernameMessage}</p>
              <button className="secondary-button" onClick={() => navigate('/login')}>
                로그인으로 이동
              </button>
            </div>
          )}
          <button className="primary-button" onClick={handleUsernameReminder} disabled={loading}>
            {loading ? '전송 중...' : '아이디 메일로 받기'}
          </button>
        </section>
      )}

      {activeTab === 'password' && (
        <section className="forgot-section">
          <h3>임시 비밀번호 발급</h3>
          <p className="helper-text">임시 비밀번호를 이메일로 전송합니다. 로그인 후 즉시 변경해주세요.</p>
          <label htmlFor="passwordEmail">이메일 주소</label>
          <input
            id="passwordEmail"
            type="email"
            value={passwordEmail}
            onChange={(e) => setPasswordEmail(e.target.value)}
            placeholder="example@email.com"
            disabled={loading}
          />
          {passwordError && <p className="error-message">{passwordError}</p>}
          {passwordMessage && (
            <div className="success-card">
              <p>{passwordMessage}</p>
              <button className="secondary-button" onClick={() => navigate('/login')}>
                로그인 페이지로
              </button>
            </div>
          )}
          <button className="primary-button" onClick={handlePasswordReset} disabled={loading}>
            {loading ? '전송 중...' : '임시 비밀번호 받기'}
          </button>
        </section>
      )}
    </div>
  );
}

export default ForgotAccountPage;
