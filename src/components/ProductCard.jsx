// src/components/ProductCard.jsx
import React, { useState } from 'react'; // useState 추가
import { useNavigation } from '../context/NavigationContext';
import './ProductCard.css';

function ProductCard({ product }) {
  const { navigate } = useNavigation();
  // 임시로 관심 상품 상태 관리 (실제는 백엔드 연동)
  const [isFavorite, setIsFavorite] = useState(false); // 예시: 초기값 false

  const handleCardClick = () => navigate(`/product/${product.id}`);

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트가 부모로 전파되는 것을 막음
    setIsFavorite(!isFavorite);
    alert(`${product.title}이(가) ${isFavorite ? '관심 상품에서 해제' : '관심 상품에 등록'}되었습니다!`);
    // 실제로는 여기에 관심 상품 API 호출 로직이 들어갑니다.
  };

  return (
    <button onClick={handleCardClick} className="product-card-button">
      <img src={product.imageUrl} alt={product.title} className="product-card-image" />
      <div className="product-card-details">
        <div className="product-card-header">
          <h3 className="product-card-title">{product.title}</h3>
          <span className="product-card-nickname">•{product.nickname}</span>
        </div>
        <p className="product-card-description">{product.description}</p>
        <button
          onClick={handleFavoriteClick}
          className={`favorite-icon ${isFavorite ? 'is-favorite' : ''}`}
        >
          {isFavorite ? '❤️' : '🤍'} {/* 꽉 찬 하트 / 빈 하트 */}
        </button>
      </div>
    </button>
  );
}

export default ProductCard;