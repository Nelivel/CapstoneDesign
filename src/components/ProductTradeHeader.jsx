// src/components/ProductTradeHeader.jsx
import React, { useState } from 'react';
import { useGlobalData } from '../context/GlobalContext'; // GlobalContext 훅 임포트
import './ProductTradeHeader.css'; // 아래 CSS 파일 필요

function ProductTradeHeader({ product, currentPrice, onPriceAdjustClick, isSellerView }) {
  const { updateProduct } = useGlobalData(); // 상품 업데이트 함수 가져오기
  const [showStatusOptions, setShowStatusOptions] = useState(false);

  // 상태 변경 처리 함수
  const handleStatusChange = (newStatus) => {
    // GlobalContext를 통해 상품 상태 업데이트
    updateProduct(product.id, { status: newStatus });
    setShowStatusOptions(false);
    // TODO: 채팅방에 시스템 메시지 전송 로직 추가 필요 (ChatRoomPage에서 처리)
  };

  // 상태 텍스트 반환 함수
  const getStatusText = (status) => {
    if (status === 'reserved') return '예약 중';
    if (status === 'sold') return '판매 완료';
    return '판매 중';
  };

  return (
    <div className="trade-header">
      <img src={product.imageUrl} alt={product.title} className="trade-product-image" />
      <div className="trade-product-info">
        <div className="status-and-title">
          {/* 판매자일 경우에만 상태 변경 가능 */}
          {isSellerView ? (
            <span
              className={`trade-product-status ${product.status}`}
              onClick={() => setShowStatusOptions(!showStatusOptions)}
            >
              {getStatusText(product.status)} ▼
            </span>
          ) : (
            <span className={`trade-product-status ${product.status} read-only`}>
              {getStatusText(product.status)}
            </span>
          )}
          <span className="trade-product-title">{product.title}</span>
        </div>
        <div className="trade-product-price">
          <strong>{currentPrice.toLocaleString('ko-KR')}원</strong>
          {/* 가격 변동 시 이전 가격 표시 (선택 사항) */}
          {/* {product.price !== currentPrice && <span className="original-price">{product.price.toLocaleString('ko-KR')}원</span>} */}
        </div>
      </div>
      {/* 판매자일 경우에만 가격 조정 버튼 표시 */}
      {isSellerView && (
        <button className="price-adjust-button" onClick={onPriceAdjustClick}>
          가격 조정
        </button>
      )}

      {/* 상태 변경 옵션 (판매자 뷰 && 옵션 열렸을 때) */}
      {isSellerView && showStatusOptions && (
        <div className="status-options">
          {product.status !== 'selling' && <button onClick={() => handleStatusChange('selling')}>판매 중</button>}
          {product.status !== 'reserved' && <button onClick={() => handleStatusChange('reserved')}>예약 중</button>}
          {product.status !== 'sold' && <button onClick={() => handleStatusChange('sold')}>판매 완료</button>}
        </div>
      )}
    </div>
  );
}

export default ProductTradeHeader;