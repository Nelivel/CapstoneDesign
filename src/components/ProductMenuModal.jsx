// src/components/ProductMenuModal.jsx
import React from 'react';
import './ProductMenuModal.css';

function ProductMenuModal({ onClose, onReport }) {
  // 모달 외부(백드롭) 클릭 시 닫기
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="menu-modal-backdrop" onClick={handleBackdropClick}>
      <div className="menu-modal-content">
        <button className="menu-modal-button" onClick={() => {
          alert('숨기기 기능 준비 중');
          onClose();
        }}>
          이 글 숨기기
        </button>
        <button className="menu-modal-button" onClick={() => {
          alert('게시글 노출 기준 안내 준비 중');
          onClose();
        }}>
          게시글 노출 기준
        </button>
        <button className="menu-modal-button report" onClick={onReport}>
          신고하기
        </button>
        <button className="menu-modal-button cancel" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}

export default ProductMenuModal;