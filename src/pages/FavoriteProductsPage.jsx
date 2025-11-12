// src/pages/FavoriteProductsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import ProductCard from '../components/ProductCard';
import { getFavorites } from '../api/favoriteApi';
import { mapBackendLocationToFrontend } from '../api/productApi';
import './FavoriteProductsPage.css';

const FavoriteProductsPage = () => {
  const { navigate } = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportedIds, setReportedIds] = useState([]);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl || imageUrl.trim() === '') return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';
    return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  const loadReported = () => {
    const userId = localStorage.getItem('userId');
    const key = userId ? `reportedPosts_${userId}` : 'reportedPosts_default';
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((id) => {
        const numeric = Number(id);
        return Number.isNaN(numeric) ? id : numeric;
      });
    } catch (err) {
      console.warn('관심 신고 목록 로드 실패:', err);
      return [];
    }
  };

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
            imageUrl: getImageUrl(p.imageUrl),
            tradeType: mapBackendLocationToFrontend(p.location || p.tradeType),
            tradeTypeLabel: mapBackendLocationToFrontend(p.location || p.tradeType) === 'NONE_PERSON' ? '비대면' : '대면',
            sellerId: p.seller?.id,
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
    setReportedIds(loadReported());
  }, []);

  useEffect(() => {
    const handleReportedUpdate = (event) => {
      const incoming = event.detail?.ids;
      if (Array.isArray(incoming)) {
        const normalized = incoming.map((id) => {
          const numeric = Number(id);
          return Number.isNaN(numeric) ? id : numeric;
        });
        setReportedIds(normalized);
      } else {
        setReportedIds(loadReported());
      }
    };
    window.addEventListener('reportedProductsUpdated', handleReportedUpdate);
    return () => window.removeEventListener('reportedProductsUpdated', handleReportedUpdate);
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
            <ProductCard key={product.id} product={product} reportedProductIds={reportedIds} />
          ))
        ) : (
          <p className="no-favorites-message">관심 상품이 없습니다.</p>
        )}
      </main>
    </div>
  );
}

export default FavoriteProductsPage;