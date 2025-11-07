// src/pages/SignUpPage.jsx
import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { signup, resendVerificationEmail } from '../api/authApi';
import './SignUpPage.css';
import './LoginPage.css';

function SignUpPage() {
  const { navigate } = useNavigation();
  const [username, setUsername] = useState(''); // 아이디
  const [nickname, setNickname] = useState(''); // 닉네임
  const [email, setEmail] = useState(''); // 이메일
  const [password, setPassword] = useState(''); // 비밀번호
  const [confirmPassword, setConfirmPassword] = useState(''); // 비밀번호 확인
  const [error, setError] = useState(''); // 에러 메시지
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [signupSuccess, setSignupSuccess] = useState(false); // 회원가입 성공 상태
  const [signupEmail, setSignupEmail] = useState(''); // 회원가입한 이메일 저장

  // 이메일 형식 검증
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 비밀번호 강도 검증 (최소 8자, 영문+숫자)
  const isValidPassword = (password) => {
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  };

  // 회원가입 버튼 활성화 조건
  const isSignUpButtonDisabled = 
    !username || !nickname || !email || !password || !confirmPassword ||
    password !== confirmPassword || 
    !isValidEmail(email) ||
    !isValidPassword(password) ||
    loading;

  const handleSignUp = async () => {
    setError('');
    
    // 입력 검증
    if (!username.trim()) {
      alert('아이디를 입력해주세요.');
      return;
    }
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    if (!email.trim()) {
      alert('이메일 주소를 입력해주세요.');
      return;
    }
    if (!isValidEmail(email)) {
      alert('올바른 이메일 형식이 아닙니다.');
      return;
    }
    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    if (!isValidPassword(password)) {
      alert('비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setLoading(true);
      // signup API 호출 (이메일 포함)
      const response = await signup(username, password, nickname, email);
      setSignupSuccess(true);
      setSignupEmail(email);
      alert('회원가입이 완료되었습니다.\n입력하신 이메일로 인증 링크가 전송되었습니다.\n이메일을 확인해주세요.');
    } catch (err) {
      const errorMessage = err.response?.data || err.message || '회원가입 중 오류가 발생했습니다.';
      alert(errorMessage);
      setError(errorMessage);
      console.error('회원가입 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 인증 링크 재전송
  const handleResendVerification = async () => {
    if (!signupEmail) {
      alert('이메일 정보가 없습니다.');
      return;
    }
    try {
      setLoading(true);
      await resendVerificationEmail(signupEmail);
      alert('인증 링크가 재전송되었습니다.\n이메일을 확인해주세요.');
    } catch (err) {
      const errorMessage = err.response?.data || err.message || '인증 링크 재전송에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 성공 화면
  if (signupSuccess) {
    return (
      <div className="signup-page">
        <button onClick={() => navigate('/login')} className="back-button">{'<'}</button>
        <h2 className="signup-header">회원가입 완료</h2>
        <div className="signup-success-container">
          <div className="success-icon">✓</div>
          <p className="success-message">
            회원가입이 완료되었습니다.
            <br />
            입력하신 이메일로 인증 링크를 전송했습니다.
            <br />
            이메일을 확인하여 인증을 완료해주세요.
          </p>
          <div className="email-info">
            <strong>이메일:</strong> {signupEmail}
          </div>
          <div className="verification-actions">
            <button 
              onClick={handleResendVerification} 
              className="resend-button"
              disabled={loading}
            >
              {loading ? '전송 중...' : '인증 링크 재전송'}
            </button>
            <button 
              onClick={() => navigate('/login')} 
              className="login-button"
            >
              로그인하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-page">
      <button onClick={() => navigate('/login')} className="back-button">{'<'}</button>
      <h2 className="signup-header">회원가입</h2>
      <p className="signup-description">이메일 인증을 통해 회원가입을 완료해주세요.</p>
      <div className="signup-form">
        <div className="signup-input-group">
          <label htmlFor="nickname">닉네임</label>
          <input 
            id="nickname" 
            type="text" 
            placeholder="사용할 닉네임을 입력하세요" 
            className="signup-input" 
            value={nickname} 
            onChange={(e) => setNickname(e.target.value)} 
          />
        </div>
        <div className="signup-input-group">
          <label htmlFor="username">아이디</label>
          <input 
            id="username" 
            type="text" 
            placeholder="사용할 아이디를 입력하세요" 
            className="signup-input" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        <div className="signup-input-group">
          <label htmlFor="email">이메일 주소</label>
          <input 
            id="email" 
            type="email" 
            placeholder="example@email.com" 
            className="signup-input" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <p className="input-hint">이메일로 인증 링크가 전송됩니다.</p>
        </div>
        <div className="signup-input-group">
          <label htmlFor="password">비밀번호</label>
          <input 
            id="password" 
            type="password" 
            placeholder="영문+숫자 조합 8자 이상" 
            className="signup-input" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          {password && !isValidPassword(password) && (
            <p className="input-hint error">비밀번호는 영문과 숫자를 포함해 8자 이상이어야 합니다.</p>
          )}
        </div>
        <div className="signup-input-group">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input 
            id="confirmPassword" 
            type="password" 
            placeholder="비밀번호를 다시 입력하세요" 
            className="signup-input" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="input-hint error">비밀번호가 일치하지 않습니다.</p>
          )}
        </div>
        {error && <p className="error-message">{error}</p>}
        <button 
          onClick={handleSignUp} 
          className="signup-button" 
          disabled={isSignUpButtonDisabled} 
          style={{ marginTop: '20px' }}
        >
          {loading ? '처리 중...' : '회원가입 완료'}
        </button>
      </div>
    </div>
  );
}
export default SignUpPage;