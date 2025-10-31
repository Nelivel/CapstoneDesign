// src/pages/SignUpPage.jsx
import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { signup } from '../api/authApi'; // API 함수 임포트
import './SignUpPage.css';
import './LoginPage.css'; // back-button 재사용

function SignUpPage() {
  const { navigate } = useNavigation();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // 회원가입 버튼 활성화 조건
  const isSignUpButtonDisabled = !email || !nickname || !password || password !== confirmPassword;

  // 이메일 인증 보내기 핸들러 (백엔드 구현 시 활성화)
  // const handleSendEmail = () => { ... };

  const handleSignUp = async () => {
    setError('');
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      // signup API 호출
      await signup(email, password, nickname);
      alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      navigate('/login');
    } catch (err) {
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  return (
    <div className="signup-page">
      <button onClick={() => navigate('/login')} className="back-button">{'<'}</button>
      <h2 className="signup-header">회원가입</h2>
      {/* <p className="signup-description">학교 웹메일을 통해 인증 후 가입해주세요.</p> */}
      <div className="signup-form">
        <div className="signup-input-group">
          <label htmlFor="nickname">닉네임</label>
          <input id="nickname" type="text" placeholder="사용할 닉네임" className="signup-input" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        </div>
        <div className="signup-input-group">
          <label htmlFor="email">아이디</label>
          <div className="signup-email-input-wrapper">
            <input id="email" type="text" placeholder="아이디를 입력하세요" className="signup-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        {/* 이메일 인증 코드 입력 (백엔드 구현 시 활성화) */}
        {/*
        {isEmailSent && (
          <div className="signup-input-group"> ... </div>
        )}
        */}
        <div className="signup-input-group">
          <label htmlFor="password">비밀번호</label>
          <input id="password" type="password" placeholder="비밀번호" className="signup-input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="signup-input-group">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input id="confirmPassword" type="password" placeholder="비밀번호 다시 입력" className="signup-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        {error && <p className="error-message">{error}</p>} {/* 에러 메시지 표시 */}
        <button onClick={handleSignUp} className="signup-button" disabled={isSignUpButtonDisabled} style={{ marginTop: '20px' }}>
          회원가입 완료
        </button>
      </div>
      {/* 이메일 발송 팝업 (백엔드 구현 시 활성화) */}
      {/* {showPopup && (...)} */}
    </div>
  );
}
export default SignUpPage;