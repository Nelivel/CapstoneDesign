// src/pages/LoginPage.jsx
import React, { useState } from 'react'; // useState 추가
import { useNavigation } from '../context/NavigationContext';
import { login } from '../api/authApi'; // API 함수 임포트
import './LoginPage.css';

function LoginPage() {
  const { navigate } = useNavigation();
  const [username, setUsername] = useState(''); // 이메일(username) 상태
  const [password, setPassword] = useState(''); // 비밀번호 상태
  const [error, setError] = useState('');      // 에러 메시지 상태

  const handleLogin = async () => {
    setError(''); // 이전 에러 메시지 초기화
    try {
      // login API 호출
      const { accessToken, refreshToken } = await login(username, password);

      // 토큰을 localStorage에 저장 (보안상 더 안전한 방법 고려 필요)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // 로그인 성공 시 홈으로 이동
      navigate('/');
    } catch (err) {
      // 로그인 실패 시 에러 메시지 표시
      setError('로그인 실패. 아이디 또는 비밀번호를 확인하세요.');
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <button onClick={() => navigate('/')} className="back-button">{'<'}</button>
      <h1 className="login-logo">DeskClean</h1> {/* 로고 텍스트 변경 */}
      <div className="login-form">
        <input
          type="email" // type 변경
          placeholder="아이디(이메일)" // placeholder 변경
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)} // 상태 업데이트
        />
        <input
          type="password"
          placeholder="비밀번호 입력"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // 상태 업데이트
        />
        {error && <p className="error-message">{error}</p>} {/* 에러 메시지 표시 */}
        <button className="login-button" onClick={handleLogin}>로그인</button> {/* onClick 핸들러 연결 */}
      </div>
      <div className="login-options">
        <span>
          <button onClick={() => alert('기능 준비 중')} className="link-button">아이디/비밀번호 찾기</button>
        </span>
        <button onClick={() => navigate('/signup')} className="link-button">회원가입</button>
      </div>
    </div>
  );
}

export default LoginPage;