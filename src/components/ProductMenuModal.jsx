// src/components/ProductMenuModal.jsx
import React from 'react';
import './ProductMenuModal.css';

function ProductMenuModal({ isOwner, onClose, onEdit, onDelete, onHide, onReport, isReported }) {
  // 모달 외부(백드롭) 클릭 시 닫기
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="menu-modal-backdrop" onClick={handleBackdropClick}>
      <div className="menu-modal-content">
        {isOwner ? (
          <>
            <button
              className="menu-modal-button"
              onClick={() => {
                onEdit?.();
              }}
            >
              수정하기
            </button>
            <button
              className="menu-modal-button danger"
              onClick={() => {
                onDelete?.();
              }}
            >
              삭제하기
            </button>
          </>
        ) : (
          <>
            <button
              className="menu-modal-button"
              onClick={() => {
                onHide?.();
              }}
            >
              이 글 숨기기
            </button>
            <button className="menu-modal-button report" onClick={() => onReport?.()} disabled={Boolean(isReported)}>
              {isReported ? '신고 완료' : '신고하기'}
            </button>
          </>
        )}
        <button className="menu-modal-button cancel" onClick={onClose}>
          취소
        </button>
      </div>
    </div>
  );
}

export default ProductMenuModal;