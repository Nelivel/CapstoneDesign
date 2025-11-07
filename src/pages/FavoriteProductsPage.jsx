// src/pages/FavoriteProductsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import ProductCard from '../components/ProductCard';
import { getFavorites } from '../api/favoriteApi';
import './FavoriteProductsPage.css';

function FavoriteProductsPage() {
  const { navigate } = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getFavorites();
        if (data && Array.isArray(data)) {
          const formatted = data.map(p => ({
            id: p.id,
            title: p.productName || '제목 없음',
            description: p.productDescription || '',
            price: p.productPrice ? Number(p.productPrice) : 0,
            status: p.status === 'ON_SALE' ? 'selling' : p.status === 'RESERVED' ? 'reserved' : p.status === 'SOLD_OUT' ? 'sold' : 'selling',
            category: p.category === 'BOOKS' ? '교재' : p.category === 'ELECTRONICS' ? '전자기기' : p.category === 'DAILY_SUPPLIES' ? '생활용품' : p.category === 'FASHION' ? '패션' : '기타',
            sellerNickname: p.seller?.nickname || p.seller?.username || 'Unknown',
            nickname: p.seller?.nickname || p.seller?.username || 'Unknown',
            createdAt: p.createdAt || new Date().toISOString(),
            imageUrl: p.imageUrl || null,
          }));
          setProducts(formatted);
        } else {
          setProducts([]);
        }
      } catch (e) {
        console.error('관심상품 로드 실패:', e);
        setProducts([]); // 에러 시 빈 배열로 설정
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="favorite-products-page">
      <header className="favorite-header">
        <h2 className="favorite-header-title">관심 상품</h2>
      </header>
      <main className="favorite-main">
        {loading ? (
          <p>로딩 중...</p>
        ) : products.length > 0 ? (
          products.map(product => (
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