// src/pages/AccountDeletionPage.jsx
import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { deleteAccount } from '../api/authApi';
import './AccountSettingsPage.css';

function AccountDeletionPage() {
  const { navigate } = useNavigation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const openModal = () => {
    setMessage('');
    setError('');
    setShowConfirm(true);
  };

  const closeModal = () => {
    if (processing) return;
    setShowConfirm(false);
  };

  const handleDelete = async () => {
    try {
      setProcessing(true);
      const response = await deleteAccount();
      setMessage(response || '계정이 삭제되었습니다.');
      setTimeout(() => {
        sessionStorage.clear();
        localStorage.clear();
        sessionStorage.setItem('logout', 'true');
        localStorage.setItem('logout', 'true');
        window.location.href = '/welcome';
      }, 1200);
    } catch (err) {
      setError(err.message || '계정 삭제 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="account-settings-page">
      <header className="settings-header">
        <button onClick={() => navigate('/settings/account')} className="back-button" style={{ position: 'static' }}>{'<'}</button>
        <h2 className="settings-header-title">계정 삭제</h2>
      </header>
      <main className="settings-main">
        <div className="settings-form">
          <div className="settings-panel">
            <div className="danger-zone">
              <h3>계정 삭제 안내</h3>
              <p>삭제 후에는 채팅, 결제 내역 등 서비스 이용 이력이 모두 비활성화됩니다.</p>
              <button className="danger-button" onClick={openModal}>계정 삭제하기</button>
            </div>
            <div className="info-section">
              <p>추가 예정 기능: 로그인 이력 조회, 소셜 연동 관리 등.</p>
            </div>
          </div>
        </div>
      </main>

      {showConfirm && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card" role="dialog" aria-modal="true">
            <h3>계정을 정말 삭제하시겠습니까?</h3>
            <p>계정을 삭제하면 동일한 서비스 이용을 위해 새로운 계정으로 가입해야 합니다.</p>
            {error && <p className="error-text">{error}</p>}
            {message && <p className="success-text">{message}</p>}
            <div className="modal-actions">
              <button className="secondary-button" onClick={closeModal} disabled={processing}>취소</button>
              <button className="danger-button" onClick={handleDelete} disabled={processing}>
                {processing ? '삭제 중...' : '계정 삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountDeletionPage;

