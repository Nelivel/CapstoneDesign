// src/pages/VerifyEmailPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/index';
import './VerifyEmailPage.css';
import './LoginPage.css';

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('이메일 인증 중...');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('인증 토큰이 없습니다.');
      return;
    }

    // 이메일 인증 API 호출
    (async () => {
      try {
        const response = await api.get('/auth/verify-email', {
          params: { token }
        });
        setStatus('success');
        setMessage(response.data || '이메일 인증이 완료되었습니다.');
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      } catch (error) {
        setStatus('error');
        const errorMessage = error.response?.data || error.message || '이메일 인증에 실패했습니다.';
        setMessage(errorMessage);
      }
    })();
  }, [searchParams, navigate]);

  return (
    <div className="verify-email-page">
      <div className="verify-container">
        {status === 'verifying' && (
          <>
            <div className="verify-icon loading">⏳</div>
            <h2 className="verify-title">이메일 인증 중...</h2>
            <p className="verify-message">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="verify-icon success">✓</div>
            <h2 className="verify-title">인증 완료</h2>
            <p className="verify-message">{message}</p>
            <p className="verify-hint">잠시 후 로그인 페이지로 이동합니다...</p>
            <button 
              onClick={() => navigate('/login', { replace: true })} 
              className="verify-button"
            >
              로그인하러 가기
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="verify-icon error">✗</div>
            <h2 className="verify-title">인증 실패</h2>
            <p className="verify-message">{message}</p>
            <div className="verify-actions">
              <button 
                onClick={() => navigate('/login', { replace: true })} 
                className="verify-button"
              >
                로그인 페이지로
              </button>
              <button 
                onClick={() => navigate('/signup', { replace: true })} 
                className="verify-button secondary"
              >
                회원가입 다시하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;

