import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMe } from '../api/authApi';

function RequireAuth({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // 로그인 페이지는 RequireAuth를 거치지 않으므로 여기서는 체크 불필요
    // 하지만 만약 로그인 페이지에 도착했는데 여전히 체크하고 있다면 즉시 종료
    if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname.startsWith('/verify-email')) {
      setChecking(false);
      return;
    }
    
    // 로그아웃 플래그가 있으면 즉시 로그인 페이지로 (세션 체크 생략)
    const isLogoutSession = sessionStorage.getItem('logout');
    const isLogoutLocal = localStorage.getItem('logout');
    if (isLogoutSession || isLogoutLocal) {
      sessionStorage.removeItem('logout');
      localStorage.removeItem('logout');
      setChecking(false);
      // window.location을 사용하여 React Router를 완전히 우회
      window.location.href = window.location.origin + '/login';
      return;
    }
    
    let mounted = true;
    (async () => {
      try {
        // 첫 번째 시도
        let me = await getMe();
        if (!mounted) return;
        
        // 세션이 아직 설정되지 않았을 수 있으므로 약간의 딜레이 후 재시도
        if (!me) {
          await new Promise(resolve => setTimeout(resolve, 200));
          me = await getMe();
        }
        
        if (!mounted) return;
        if (!me) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
        } else {
          setChecking(false);
        }
      } catch (e) {
        if (!mounted) return;
        // 401이면 로그인 페이지로, 다른 에러면 잠시 후 재시도
        if (e.response?.status === 401) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
        } else {
          // 네트워크 오류 등은 잠시 후 재시도
          setTimeout(async () => {
            if (!mounted) return;
            try {
              const me = await getMe();
              if (me) {
                setChecking(false);
              } else {
                navigate('/login', { replace: true, state: { from: location.pathname } });
              }
            } catch (_) {
              navigate('/login', { replace: true, state: { from: location.pathname } });
            }
          }, 500);
        }
      }
    })();
    return () => { mounted = false; };
  }, [navigate, location.pathname]);

  if (checking) return null; // 또는 스켈레톤 로딩 UI
  return children;
}

export default RequireAuth;


