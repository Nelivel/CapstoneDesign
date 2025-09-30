// src/pages/FavoriteProductsPage.jsx
import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import ProductCard from '../components/ProductCard';
import { MOCK_PRODUCTS } from '../mock-products';
import './FavoriteProductsPage.css';

const MOCK_FAVORITE_PRODUCT_IDS = [1, 3, 5];

function FavoriteProductsPage() {
  const { navigate } = useNavigation();

  const favoriteProducts = MOCK_PRODUCTS.filter(product =>
    MOCK_FAVORITE_PRODUCT_IDS.includes(product.id)
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