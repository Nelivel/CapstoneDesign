// src/pages/SignUpPage.jsx
import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { signup } from '../api/authApi'; // API 함수 임포트
import './SignUpPage.css';
import './LoginPage.css'; // back-button 재사용

function SignUpPage() {
  const { navigate } = useNavigation();
  // const [profileName, setProfileName] = useState(''); // 백엔드 User 엔티티 확인 후 필드 조정 필요
  const [email, setEmail] = useState(''); // 백엔드 username 필드와 매칭
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // const [authCode, setAuthCode] = useState(''); // 이메일 인증 로직 추가 시 필요
  // const [isEmailSent, setIsEmailSent] = useState(false); // 이메일 인증 로직 추가 시 필요
  const [error, setError] = useState('');

  // 회원가입 버튼 활성화 조건 (백엔드 필드에 맞게 수정)
  const isSignUpButtonDisabled = !email || !password || password !== confirmPassword;

  // 이메일 인증 보내기 핸들러 (백엔드 구현 시 활성화)
  // const handleSendEmail = () => { ... };

  const handleSignUp = async () => {
    setError('');
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      // TODO: 백엔드 User 엔티티에 맞춰 필요한 필드 추가 (major, grade, school_number, gender 등)
      // signup API 호출 (현재는 email(username)과 password만 전달)
      await signup(email, password /*, 다른 필드들 */);
      alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  return (
    <div className="signup-page">
      <button onClick={() => navigate('/login')} className="back-button">{'<'}</button>
      <h2 className="signup-header">회원가입</h2>
      {/* <p className="signup-description">학교 웹메일을 통해 인증 후 가입해주세요.</p> */}
      <div className="signup-form">
        {/* TODO: 백엔드 User 엔티티 필드에 맞춰 입력 필드 추가/수정 */}
        {/* 예: 프로필 이름(닉네임), 전공, 학년, 학번, 성별 등 */}
        {/*
        <div className="signup-input-group">
          <label htmlFor="profileName">프로필 이름</label>
          <input id="profileName" type="text" placeholder="사용할 프로필 이름" className="signup-input" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
        </div>
        */}
        <div className="signup-input-group">
          <label htmlFor="email">아이디 (학교 이메일)</label> {/* 라벨 변경 */}
          <div className="signup-email-input-wrapper">
            <input id="email" type="email" placeholder="예: user@shinhan.ac.kr" className="signup-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            {/* 이메일 인증 버튼 (백엔드 구현 시 활성화) */}
            {/* <button onClick={handleSendEmail} ...>인증 메일 전송</button> */}
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