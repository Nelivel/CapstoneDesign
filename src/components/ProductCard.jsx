// src/components/ProductCard.jsx
import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useGlobalData } from '../context/GlobalContext';
import { formatTimeAgo } from '../utils/timeUtils'; // 1. 유틸리티 임포트
import './ProductCard.css';
import ProductMenuModal from './ProductMenuModal';

function ProductCard({ product }) {
  const { navigate } = useNavigation();
  const { favorites, toggleFavorite } = useGlobalData();
  const isFavorite = favorites.has(product.id);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCardClick = () => navigate(`/product/${product.id}`);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setIsMenuOpen(true);
  };

  const handleReport = () => {
    setIsMenuOpen(false);
    alert(`${product.title} 상품이 신고되었습니다.`);
  };

  const getStatusText = (status, price) => {
    if (status === 'reserved') return '예약 중';
    if (status === 'sold') return '판매 완료';
    return typeof price === 'number' ? `${price.toLocaleString('ko-KR')}원` : '가격 문의';
  };

  return (
    <>
      <div onClick={handleCardClick} className="product-card-item">
        <img src={product.imageUrl} alt={product.title} className="product-card-image" />
        <div className="product-card-details">
          <h3 className="product-card-title">{product.title}</h3>
          {/* 2. 닉네임과 시간 표시를 한 줄로 묶음 */}
          <div className="product-card-meta">
            <span className="product-card-nickname">{product.nickname}</span>
            {/* 3. 시간 표시 (formatTimeAgo 사용) */}
            <span className="product-card-time">• {formatTimeAgo(product.createdAt)}</span>
          </div>
          <div className={`product-card-price ${product.status !== 'selling' ? 'sold' : ''}`}>
            {getStatusText(product.status, product.price)}
          </div>
        </div>
        <button className="kebab-menu-button" onClick={handleMenuClick}>
          ⋮
        </button>
        <button
          onClick={handleFavoriteClick}
          className={`favorite-icon ${isFavorite ? 'is-favorite' : ''}`}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
      {isMenuOpen && (
        <ProductMenuModal
          onClose={() => setIsMenuOpen(false)}
          onReport={handleReport}
        />
      )}
    </>
  );
}

export default ProductCard;