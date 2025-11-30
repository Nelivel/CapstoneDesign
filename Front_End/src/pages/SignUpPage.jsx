// src/pages/SignUpPage.jsx
import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import './SignUpPage.css';
import './LoginPage.css'; // back-button 재사용

function SignUpPage() {
  const { navigate } = useNavigation();
  const [profileName, setProfileName] = useState('');
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const isEmailSendButtonDisabled = !email;
  const isSignUpButtonDisabled = !profileName || !email || !authCode || !password || password !== confirmPassword || !isEmailSent;

  const handleSendEmail = () => {
    console.log(`Sending verification email to: ${email}`);
    setIsEmailSent(true);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  };

  const handleSignUp = () => {
    alert('회원가입이 완료되었습니다!');
    navigate('/login');
  };

  return (
    <div className="signup-page">
      <button onClick={() => navigate('/login')} className="back-button">{'<'}</button>
      <h2 className="signup-header">회원가입</h2>
      <p className="signup-description">학교 웹메일을 통해 인증 후 가입해주세요.</p>
      <div className="signup-form">
        <div className="signup-input-group">
          <label htmlFor="profileName">프로필 이름</label>
          <input id="profileName" type="text" placeholder="사용할 프로필 이름" className="signup-input" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
        </div>
        <div className="signup-input-group">
          <label htmlFor="email">학교 웹메일</label>
          <div className="signup-email-input-wrapper">
            <input id="email" type="email" placeholder="예: user@shinhan.ac.kr" className="signup-input" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isEmailSent} />
            <button onClick={handleSendEmail} className="signup-button" style={{ width: '120px', fontSize: '0.9em', padding: '10px' }} disabled={isEmailSendButtonDisabled}>인증 메일 전송</button>
          </div>
        </div>
        {isEmailSent && (
          <div className="signup-input-group">
            <label htmlFor="authCode">인증 코드</label>
            <input id="authCode" type="text" placeholder="메일로 전송된 인증 코드" className="signup-input" value={authCode} onChange={(e) => setAuthCode(e.target.value)} />
          </div>
        )}
        <div className="signup-input-group">
          <label htmlFor="password">비밀번호</label>
          <input id="password" type="password" placeholder="비밀번호" className="signup-input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="signup-input-group">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input id="confirmPassword" type="password" placeholder="비밀번호 다시 입력" className="signup-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <button onClick={handleSignUp} className="signup-button" disabled={isSignUpButtonDisabled} style={{ marginTop: '20px' }}>
          회원가입 완료
        </button>
      </div>
      {showPopup && (
        <div className="popup-message">
          이메일로 인증 코드가 전송되었습니다
        </div>
      )}
    </div>
  );
}
export default SignUpPage;