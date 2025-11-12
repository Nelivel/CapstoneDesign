// src/pages/MyPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { getMe, logout, requestSchoolVerification, resendVerificationEmail } from '../api/authApi';
import './MyPage.css';

function MyPage() {
  const { navigate } = useNavigation();
  const [user, setUser] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [schoolEmailInput, setSchoolEmailInput] = useState('');
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    (async () => {
      const me = await getMe();
      setUser(me);
    })();
  }, []);

  useEffect(() => {
    if (user?.schoolEmail) {
      setSchoolEmailInput(user.schoolEmail);
    }
  }, [user?.schoolEmail]);

  // 3. 컨텍스트의 정보 사용
  const userName = user?.nickname || '로그인이 필요합니다';
  const emailVerified = Boolean(user?.emailVerified);
  const schoolVerified = Boolean(user?.schoolEmailVerified);
  const schoolEmail = user?.schoolEmail || '미등록';

  const handleProtectedNavigate = (path, requiresSchool = false) => {
    if (!emailVerified) {
      alert('이메일 인증을 먼저 완료해주세요. 새로 가입했다면 이메일에서 인증 링크를 눌러야 합니다.');
      return;
    }
    if (requiresSchool && !schoolVerified) {
      alert('학교 인증이 완료된 사용자만 이용할 수 있는 기능입니다. "학교 인증하기" 버튼을 눌러 진행하세요.');
      return;
    }
    navigate(path);
  };

  const handleResendEmail = async () => {
    if (!user?.email) {
      alert('등록된 이메일이 없습니다. 고객센터에 문의해주세요.');
      return;
    }
    try {
      setLoading(true);
      await resendVerificationEmail(user.email);
      setStatusMessage('인증 메일을 재전송했습니다. 받은 편지함과 스팸함을 확인해주세요.');
    } catch (error) {
      alert(error.message || '인증 메일 재전송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const openSchoolModal = () => {
    if (!emailVerified) {
      alert('이메일 인증을 먼저 완료해주세요.');
      return;
    }
    setModalError('');
    setShowSchoolModal(true);
  };

  const closeSchoolModal = () => {
    if (loading) return;
    setShowSchoolModal(false);
    setModalError('');
  };

  const submitSchoolVerification = async () => {
    const trimmed = (schoolEmailInput || '').trim();
    if (!trimmed) {
      setModalError('학교 이메일을 입력해주세요.');
      return;
    }
    if (!trimmed.toLowerCase().endsWith('@o.shinhan.ac.kr')) {
      setModalError('신한대학교 웹메일(@o.shinhan.ac.kr)만 인증할 수 있습니다.');
      return;
    }
    try {
      setLoading(true);
      await requestSchoolVerification(trimmed);
      setStatusMessage('학교 인증 메일을 발송했습니다. 학교 웹메일에서 인증 링크를 눌러주세요.');
      const refreshed = await getMe();
      setUser(refreshed);
      setShowSchoolModal(false);
    } catch (error) {
      setModalError(error.message || '학교 인증 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mypage">
      <header className="mypage-header">
        {/* 마이페이지는 하단 탭에 있으므로 뒤로가기 버튼은 일반적으로 없습니다. */}
        <h2 className="mypage-header-title">마이페이지</h2>
      </header>
      <main className="mypage-main">
        <div className="user-summary">
          <div className="user-avatar"></div>
          <div className="user-info">
            <div className="nickname">{userName}</div>
            <div className="school-status">
              <span className={`badge ${emailVerified ? 'badge-success' : 'badge-warning'}`}>
                {emailVerified ? '이메일 인증 완료' : '이메일 미인증'}
              </span>
              <span className={`badge ${schoolVerified ? 'badge-success' : 'badge-warning'}`}>
                {schoolVerified ? '학교 인증 완료' : '학교 인증 미완료'}
              </span>
            </div>
            {!schoolVerified && (
              <div className="school-email-info">등록된 학교 이메일: {schoolEmail}</div>
            )}
          </div>
        </div>

        {statusMessage && (
          <div className="status-toast" role="alert">
            {statusMessage}
            <button className="toast-close" onClick={() => setStatusMessage('')}>×</button>
          </div>
        )}

        {!emailVerified && (
          <div className="notice-card warning">
            <h3>이메일 인증이 필요합니다</h3>
            <p>
              회원가입 시 입력한 이메일로 인증 링크가 발송되었습니다. 메일함(스팸함 포함)을 확인하여 인증을 완료해주세요.
            </p>
            <button className="link-button" disabled={loading} onClick={handleResendEmail}>
              {loading ? '전송 중...' : '인증 이메일 다시 보내기'}
            </button>
          </div>
        )}

        {emailVerified && !schoolVerified && (
          <div className="notice-card info">
            <h3>학교 인증을 완료해주세요</h3>
            <p>
              채팅, 결제, 시간표 등록 등 주요 기능은 신한대학교 학교 인증 완료 후 이용할 수 있습니다.
            </p>
            <button className="primary-button" disabled={loading} onClick={openSchoolModal}>
              {loading ? '요청 중...' : '학교 인증하기'}
            </button>
          </div>
        )}

        <div className="menu-section">
          {/* ... (메뉴 버튼들 동일) ... */}
          <button onClick={() => handleProtectedNavigate('/history/sell', true)} className="menu-item">
            <span>📝</span>
            <span className="text">판매내역</span>
            <span className="arrow">{'>'}</span>
          </button>
          <button onClick={() => handleProtectedNavigate('/history/buy', true)} className="menu-item">
            <span>🛒</span>
            <span className="text">구매내역</span>
            <span className="arrow">{'>'}</span>
          </button>
          <button onClick={() => handleProtectedNavigate('/favorites')} className="menu-item">
            <span>❤️</span>
            <span className="text">관심목록</span>
            <span className="arrow">{'>'}</span>
          </button>
          <button onClick={() => handleProtectedNavigate('/hidden-posts')} className="menu-item">
            <span>🙈</span>
            <span className="text">숨긴 글 관리</span>
            <span className="arrow">{'>'}</span>
          </button>
        </div>

        <div className="menu-section">
          <button onClick={() => handleProtectedNavigate('/timetable', true)} className="menu-item">
            <span>🗓️</span>
            <span className="text">시간표 설정</span>
            <span className="arrow">{'>'}</span>
          </button>
          <button onClick={() => handleProtectedNavigate('/reputation', true)} className="menu-item">
            <span>👍</span>
            <span className="text">나의 신뢰도</span>
            <span className="arrow">{'>'}</span>
          </button>
          <button onClick={() => handleProtectedNavigate('/settings/account')} className="menu-item">
            <span>⚙️</span>
            <span className="text">계정/정보 관리</span>
            <span className="arrow">{'>'}</span>
          </button>
        </div>

        <div className="logout-section">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // 로그아웃 중 플래그 설정 (중복 클릭 방지)
              const logoutButton = e.target;
              logoutButton.disabled = true;
              logoutButton.textContent = '로그아웃 중...';
              
              // 1. 로그아웃 플래그 설정 (페이지 리로드 전에) - 가장 먼저!
              // sessionStorage와 localStorage 모두에 설정 (페이지 리로드 후에도 유지되도록)
              sessionStorage.setItem('logout', 'true');
              localStorage.setItem('logout', 'true');
              
              // 2. 로컬 스토리지 완전히 정리 (하지만 logout 플래그는 유지)
              const logoutFlag = localStorage.getItem('logout');
              localStorage.clear();
              if (logoutFlag) {
                localStorage.setItem('logout', 'true'); // 다시 설정
              }
              
              // 3. 쿠키 삭제
              if (document.cookie) {
                const cookies = document.cookie.split(";");
                for (let c of cookies) {
                  const cookieName = c.split("=")[0].trim();
                  // 모든 가능한 경로와 도메인에서 쿠키 삭제
                  document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
                  document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=" + window.location.hostname;
                  document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=." + window.location.hostname;
                  document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=localhost";
                }
              }
              
              // 4. 백엔드 로그아웃 API 호출은 백그라운드에서 처리 (기다리지 않음, Promise 에러 무시)
              logout().catch(() => {
                // Promise 에러 무시 (페이지 이동 후에는 응답을 받을 수 없으므로)
              });
              
              // 5. 즉시 페이지를 완전히 새로고침하며 로그인 페이지로 이동
              // window.location을 직접 조작하여 React Router 완전히 우회
              const loginUrl = window.location.origin + '/welcome';
              window.location.href = loginUrl;
            }} 
            className="link-button logout-button"
          >
            로그아웃
          </button>
        </div>
      </main>

      {showSchoolModal && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card" role="dialog" aria-modal="true">
            <h3>학교 이메일 인증</h3>
            <p>신한대학교 웹메일(@o.shinhan.ac.kr)을 입력해주세요.</p>
            <input
              type="email"
              value={schoolEmailInput}
              onChange={(e) => setSchoolEmailInput(e.target.value)}
              placeholder="example@o.shinhan.ac.kr"
              className="modal-input"
              disabled={loading}
            />
            {modalError && <div className="modal-error">{modalError}</div>}
            <div className="modal-actions">
              <button className="secondary-button" onClick={closeSchoolModal} disabled={loading}>
                취소
              </button>
              <button className="primary-button" onClick={submitSchoolVerification} disabled={loading}>
                {loading ? '전송 중...' : '인증 메일 보내기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPage;