// src/components/ProductCard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // react-router의 useNavigate 직접 사용
import { addFavorite, removeFavorite } from '../api/favoriteApi';
import { formatTimeAgo } from '../utils/timeUtils'; // 1. 유틸리티 임포트
import './ProductCard.css';
import ProductMenuModal from './ProductMenuModal';

function ProductCard({ product }) {
  const navigate = useNavigate(); // react-router의 useNavigate 직접 사용
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 관심상품 상태 확인
  useEffect(() => {
    if (!product?.id) return;
    
    const loadFavoriteStatus = async () => {
      try {
        const { checkFavoriteStatus } = await import('../api/favoriteApi');
        const isFav = await checkFavoriteStatus(product.id);
        setIsFavorite(isFav);
      } catch (err) {
        // 에러 발생 시 기본값 false 유지 (500 에러 등은 조용히 처리)
        // console.error는 favoriteApi.js에서 이미 출력하므로 중복 출력 방지
        setIsFavorite(false);
      }
    };
    
    // 약간의 지연을 두어 불필요한 호출 방지
    const timeoutId = setTimeout(loadFavoriteStatus, 100);
    return () => clearTimeout(timeoutId);
  }, [product.id]);

  const handleCardClick = () => {
    if (!product.id) {
      console.error('Product ID is missing:', product);
      alert('상품 ID가 없습니다.');
      return;
    }
    console.log('Navigating to product:', product.id);
    navigate(`/product/${product.id}`);
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!product?.id) return;
    
    try {
      if (isFavorite) {
        console.log('Removing favorite for product:', product.id);
        await removeFavorite(product.id);
        setIsFavorite(false);
        console.log('Favorite removed successfully');
      } else {
        console.log('Adding favorite for product:', product.id);
        await addFavorite(product.id);
        setIsFavorite(true);
        console.log('Favorite added successfully');
      }
    } catch (err) {
      console.error('관심상품 토글 실패:', err);
      if (err.response?.status === 401 || err.sessionExpired) {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        // 로그인 페이지로 이동
        window.location.href = '/login';
      } else {
        alert('관심상품 등록/해제에 실패했습니다: ' + (err.response?.data?.error || err.message));
      }
    }
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

  // product.id가 없으면 렌더링하지 않음
  if (!product || !product.id) {
    console.error('Invalid product data:', product);
    return null;
  }

  return (
    <>
      <div onClick={handleCardClick} className="product-card-item">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.title || '상품 이미지'} 
            className="product-card-image"
            onError={(e) => {
              e.target.style.display = 'none'; // 이미지 로드 실패 시 숨김
            }}
          />
        ) : (
          <div className="product-card-image" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            이미지 없음
          </div>
        )}
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