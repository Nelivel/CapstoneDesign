// src/pages/SellHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { getSellHistory } from '../api/historyApi';
import ProductCard from '../components/ProductCard';
import './SellHistoryPage.css';

function SellHistoryPage() {
  const { navigate } = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSellHistory();
        const formatted = data.map(p => ({
          id: p.id,
          title: p.productName,
          description: p.productDescription,
          price: p.productPrice,
          status: p.status === 'ON_SALE' ? 'selling' : p.status === 'RESERVED' ? 'reserved' : 'sold',
          category: p.category,
          sellerNickname: p.seller?.nickname || 'Unknown',
          createdAt: p.createdAt
        }));
        setProducts(formatted);
      } catch (e) {
        console.error('판매내역 로드 실패:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="sell-history-page">
      <header className="history-header">
        <button onClick={() => navigate('/mypage')} className="back-button" style={{position: 'static'}}>{'<'}</button>
        <h2 className="history-header-title">판매내역</h2>
      </header>
      <main className="history-main">
        {loading ? (
          <p>로딩 중...</p>
        ) : products.length > 0 ? (
          products.map(p => <ProductCard key={p.id} product={p} />)
        ) : (
          <p className="no-items">판매한 상품이 없습니다.</p>
        )}
      </main>
    </div>
  );
}
export default SellHistoryPage;