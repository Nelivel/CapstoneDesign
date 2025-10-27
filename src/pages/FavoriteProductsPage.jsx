// src/pages/FavoriteProductsPage.jsx
import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import ProductCard from '../components/ProductCard';
// import { MOCK_PRODUCTS } from '../mock-products'; // 1. 삭제
import { useGlobalData } from '../context/GlobalContext'; // 2. 임포트
import './FavoriteProductsPage.css';

// const MOCK_FAVORITE_PRODUCT_IDS = [1, 3, 5]; // 3. 삭제

function FavoriteProductsPage() {
  const { navigate } = useNavigation();

  // 4. 컨텍스트에서 상품 목록과 관심 목록 Set 가져오기
  const { products, favorites } = useGlobalData();

  // 5. 컨텍스트 데이터를 기반으로 관심 상품 필터링
  const favoriteProducts = products.filter(product =>
    favorites.has(product.id)
  );

  return (
    <div className="favorite-products-page">
      
      <header className="favorite-header">
        <h2 className="favorite-header-title">관심 상품</h2>
      </header>
      <main className="favorite-main">
        {favoriteProducts.length > 0 ? (
          favoriteProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="no-favorites-message">관심 상품이 없습니다.</p>
        )}
      </main>
    </div>
  );
}

export default FavoriteProductsPage;