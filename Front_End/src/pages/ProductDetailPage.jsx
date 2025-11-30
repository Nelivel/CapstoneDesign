// src/pages/ProductDetailPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
import { MOCK_PRODUCTS } from '../mock-products';
import './ProductDetailPage.css'; // CSS 파일 불러오기

function ProductDetailPage() {
  const { productId } = useParams();
  const { navigate } = useNavigation();
  const product = MOCK_PRODUCTS.find(p => p.id === parseInt(productId));

  if (!product) { return <div>상품을 찾을 수 없습니다.</div>; }

  return (
    <div className="detail-page">
      <header className="detail-header">
        <button onClick={() => navigate('/')} className="back-button" style={{position: 'static', fontSize: '1.2em'}}>{'<'}</button>
        <h2 className="detail-header-title">상품 상세 정보</h2>
      </header>

      <main className="detail-main">
        <img src={product.imageUrl} alt={product.title} className="detail-image" />

        <div className="seller-profile">
          <div className="seller-avatar"></div>
          <div className="seller-info">
            <div className="nickname">{product.nickname}</div>
            <div className="status">학교 인증 완료</div>
          </div>
        </div>

        <div className="product-content">
          <h1 className="title">{product.title}</h1>
          <p className="description">{product.description}</p>
        </div>
      </main>

      <footer className="detail-footer">
        <div className="detail-price">{product.price ? `${product.price.toLocaleString('ko-KR')}원` : '가격 미정'}</div>
        <button className="chat-button">채팅하기</button>
      </footer>
    </div>
  );
}

export default ProductDetailPage;