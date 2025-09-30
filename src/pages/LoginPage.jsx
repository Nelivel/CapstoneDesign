// src/pages/LoginPage.jsx
import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import './LoginPage.css';

function LoginPage() {
  const { navigate } = useNavigation();

  return (
    <div className="login-page">
      <button onClick={() => navigate('/')} className="back-button">{'<'}</button>
      <h1 className="login-logo">메인 로고</h1>
      <div className="login-form">
        <input type="email" placeholder="이메일 입력" className="login-input" />
        <input type="password" placeholder="비밀번호 입력" className="login-input" />
        <button className="login-button">로그인</button>
      </div>
      <div className="login-options">
        <span>
          <button onClick={() => alert('기능 준비 중')} className="link-button">아이디/비밀번호 찾기</button>
        </span>
        {/* 이 부분이 /signup으로 가도록 수정되었습니다. */}
        <button onClick={() => navigate('/signup')} className="link-button">회원가입</button>
      </div>
    </div>
  );
}

export default LoginPage;