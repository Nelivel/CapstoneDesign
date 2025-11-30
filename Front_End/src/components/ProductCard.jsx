// src/components/ProductCard.jsx
import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import './ProductCard.css'; // CSS 파일 임포트 확인

function ProductCard({ product }) {
  const { navigate } = useNavigation();
  const [isFavorite, setIsFavorite] = useState(false); // 예시 상태

  const handleCardClick = () => navigate(`/product/${product.id}`);

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // 하트 클릭 시 카드 전체 클릭 방지
    setIsFavorite(!isFavorite);
    alert(`${product.title} ${isFavorite ? '관심 해제' : '관심 등록'}!`);
  };

  return (
    // 바깥 요소를 div로 되돌리고 onClick을 여기에 적용
    <div onClick={handleCardClick} className="product-card-item"> {/* button을 div로 변경, 클래스 이름 변경 */}
      <img src={product.imageUrl} alt={product.title} className="product-card-image" />
      <div className="product-card-details">
        <div className="product-card-header">
          <h3 className="product-card-title">{product.title}</h3>
          <span className="product-card-nickname">•{product.nickname}</span>
        </div>
        <p className="product-card-description">{product.description}</p>
        {/* 즐겨찾기 버튼은 그대로 button 유지 */}
        <button
          onClick={handleFavoriteClick}
          className={`favorite-icon ${isFavorite ? 'is-favorite' : ''}`}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;