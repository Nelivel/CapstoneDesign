// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react'; // useState, useEffect 추가
import { useNavigation } from '../context/NavigationContext';
import { login, getMe } from '../api/authApi'; // API 함수 임포트
import './LoginPage.css';

function LoginPage() {
  const { navigate } = useNavigation();
  const [username, setUsername] = useState(''); // 이메일(username) 상태
  const [password, setPassword] = useState(''); // 비밀번호 상태
  const [error, setError] = useState('');      // 에러 메시지 상태

  // 이미 로그인되어 있으면 홈으로 리다이렉트
  useEffect(() => {
    // 로그아웃 플래그 확인 - 로그아웃 후에는 세션 체크를 완전히 건너뜀
    // sessionStorage와 localStorage 모두 체크 (페이지 리로드 시 sessionStorage는 초기화될 수 있음)
    const isLogoutSession = sessionStorage.getItem('logout');
    const isLogoutLocal = localStorage.getItem('logout');
    
    if (isLogoutSession || isLogoutLocal) {
      // 로그아웃 플래그는 로그인 성공 시에만 삭제하도록 유지
      // 로그아웃 후 로그인 페이지에 도착한 경우, 세션 체크 없이 그대로 둠
      // 아무것도 하지 않고 즉시 return - 절대 getMe()를 호출하지 않음
      console.log('Logout flag detected, skipping session check');
      return;
    }
    
    // 로그인 페이지에서 세션 체크 (약간의 딜레이 후)
    // 하지만 로그아웃 플래그가 없을 때만 실행
    let cancelled = false;
    const timer = setTimeout(async () => {
      // 다시 한 번 로그아웃 플래그 확인 (비동기 작업 중에 설정되었을 수 있음)
      if (sessionStorage.getItem('logout') || localStorage.getItem('logout')) {
        cancelled = true;
        console.log('Logout flag detected during timeout, cancelling session check');
        return;
      }
      
      if (cancelled) return;
      
      try {
        const me = await getMe();
        
        // 로그아웃 플래그가 설정되었는지 다시 확인 (getMe 호출 중에 설정되었을 수 있음)
        if (sessionStorage.getItem('logout') || localStorage.getItem('logout')) {
          cancelled = true;
          console.log('Logout flag detected after getMe, cancelling redirect');
          return;
        }
        
        if (cancelled) return;
        
        // me가 있고 로그아웃 플래그가 없을 때만 홈으로 이동
        if (me) {
          console.log('User is logged in, redirecting to home');
          navigate('/home', { replace: true });
        }
      } catch (e) {
        // 로그인 안 되어 있음, 계속 진행
        // 401 에러인 경우 명시적으로 로그인 페이지에 머무름
        if (e.response?.status === 401 || e.response?.status === 403) {
          // 로그아웃 상태이므로 로그인 페이지에 머무름
          console.log('User is not logged in, staying on login page');
          return;
        }
        // 다른 에러는 무시 (네트워크 오류 등)
        console.log('Error checking session:', e);
      }
    }, 2000); // 딜레이를 매우 길게 해서 로그아웃이 완전히 처리될 시간 확보
    
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [navigate]);

  // 테스트 계정 빠른 입력
  const fillTestAccount = () => {
    setUsername('test1');
    setPassword('test1pw');
  };

  const handleLogin = async () => {
    setError(''); // 이전 에러 메시지 초기화
    try {
      // login API 호출 - 세션 기반 인증 사용
      const response = await login(username.trim(), password);
      
      // 로그인 성공 시 로그아웃 플래그 삭제
      sessionStorage.removeItem('logout');
      localStorage.removeItem('logout');
      
      // 사용자 정보를 localStorage에 저장
      if (response.username) {
        localStorage.setItem('username', response.username);
        localStorage.setItem('nickname', response.nickname);
        localStorage.setItem('userId', response.userId);
      }

      // 세션이 설정될 시간을 주기 위해 약간의 딜레이
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 인증 상태 확인 후 홈으로 이동
      const me = await getMe();
      if (me) {
        // navigate로 이동 (RequireAuth가 자동으로 처리)
        navigate('/home', { replace: true });
      } else {
        // 재시도 한 번 더
        await new Promise(resolve => setTimeout(resolve, 200));
        const me2 = await getMe();
        if (me2) {
          navigate('/home', { replace: true });
        } else {
          setError('로그인은 성공했지만 세션 설정에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
        }
      }
    } catch (err) {
      // 로그인 실패 시 에러 메시지 표시
      const message = err.message || '로그인 실패. 아이디 또는 비밀번호를 확인하세요.';
      setError(message);
      alert(message);
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      
      <img src="/logo.png" alt="책상정리 로고" className="logo" />
      
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
        <button 
          type="button"
          onClick={fillTestAccount} 
          className="test-account-button"
          style={{marginTop: '10px', fontSize: '0.9em', color: '#666', background: 'transparent', border: 'none', textDecoration: 'underline'}}
        >
          테스트 계정 자동 입력 (test1/test1pw)
        </button>
      </div>
      <div className="login-options">
        <span>
          <button onClick={() => navigate('/account-recovery')} className="link-button">아이디/비밀번호 찾기</button>
        </span>
        <button onClick={() => navigate('/signup')} className="link-button">회원가입</button>
      </div>
    </div>
  );
}

export default LoginPage;