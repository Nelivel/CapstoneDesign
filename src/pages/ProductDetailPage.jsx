// src/pages/ProductDetailPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
import { useGlobalData } from '../context/GlobalContext';
import { formatTimeAgo } from '../utils/timeUtils';
import { MOCK_USERS } from '../data/users';
import './ProductDetailPage.css';
import '../components/ProductCard.css'; // favorite-icon 스타일 재사용

function ProductDetailPage() {
  const { productId } = useParams();
  const { navigate } = useNavigation();
  const { products, favorites, toggleFavorite } = useGlobalData();

  const product = products.find(p => p.id === parseInt(productId));
  const isFavorite = product ? favorites.has(product.id) : false;
  const seller = product ? MOCK_USERS[product.sellerNickname] : null;

  if (!product) { return <div>상품을 찾을 수 없습니다.</div>; }

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const getChatRoomId = (nickname) => {
    if (nickname === '스터디홀릭') return 1;
    if (nickname === '경영새내기') return 2;
    if (nickname === '시간표_미제공자') return 3;
    if (nickname === '글로벌리') return 1;
    if (nickname === '긱스가든') return 2;
    return 1;
  };

  const getMannerFace = (credits) => {
    if (credits >= 4.0) return '😇';
    if (credits >= 3.5) return '😊';
    if (credits >= 3.0) return '🙂';
    if (credits >= 2.5) return '🤔';
    return '😥';
  };

  return (
    <div className="detail-page">
      <header className="detail-header">
        <button onClick={() => navigate('/')} className="back-button" style={{position: 'static', fontSize: '1.2em'}}>{'<'}</button>
      </header>

      <main className="detail-main">
        {/* --- 1. 판매자 프로필 --- */}
        <div className="seller-profile">
          <div className="seller-avatar"></div>
          <div className="seller-info">
            <div className="nickname">{product.nickname}</div>
            <div className="location">학교 인증 완료</div>
          </div>
          {seller && (
            <div className="manner-section">
              <span className="manner-score">{seller.mannerCredits.toFixed(1)}</span>
              <span className="manner-face">{getMannerFace(seller.mannerCredits)}</span>
            </div>
          )}
        </div>

        {/* --- 2. 상품 이미지 (위치 변경) --- */}
        <div className="detail-image-container">
            <img src={product.imageUrl} alt={product.title} className="detail-image" />
        </div>

        {/* --- 3. 상품 정보 --- */}
        <div className="product-content">
          <h1 className="title">{product.title}</h1>
          <div className="product-meta-info">
            <span>{product.category}</span>
            <span>• {formatTimeAgo(product.createdAt)}</span>
            <span>• 조회 {product.viewCount}</span>
          </div>
          <p className="description">{product.description}</p>
        </div>

        {/* --- 4. 이 판매자의 다른 상품 (선택 사항) --- */}
        {/*
        {otherProducts.length > 0 && (
          <div className="seller-other-items">
             <h3>{product.sellerNickname}님의 다른 상품</h3>
             // ... 다른 상품 렌더링 로직 ...
          </div>
        )}
        */}

      </main>

      {/* --- 하단 고정 푸터 --- */}
      <footer className="detail-footer">
        <button
          onClick={handleFavoriteClick}
          className={`favorite-icon footer-fav ${isFavorite ? 'is-favorite' : ''}`}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>

        <div className="price-and-status">
          <div className="detail-price">{product.price ? `${product.price.toLocaleString('ko-KR')}원` : '가격 문의'}</div>
          {product.status !== 'selling' && (
             <span className={`status-badge ${product.status}`}>{product.status === 'reserved' ? '예약 중' : '판매 완료'}</span>
          )}
        </div>

        <button
          className="chat-button"
          onClick={() => navigate(
            `/chat/${getChatRoomId(product.sellerNickname)}`,
            { state: { productId: product.id } }
          )}
          disabled={product.status === 'sold'}
        >
          {product.status === 'sold' ? '거래 완료' : '채팅하기'}
        </button>
      </footer>
    </div>
  );
}

export default ProductDetailPage;