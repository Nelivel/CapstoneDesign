// src/pages/BuyHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { getBuyHistory } from '../api/historyApi';
import ProductCard from '../components/ProductCard';
import './BuyHistoryPage.css';

function BuyHistoryPage() {
  const { navigate } = useNavigation();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getBuyHistory();
        const products = data.map(p => ({
          id: p.product?.id || 0,
          title: p.product?.productName || '알 수 없음',
          description: p.product?.productDescription || '',
          price: p.amount,
          status: p.status === 'RELEASED' ? 'sold' : p.status === 'DEPOSIT_CONFIRMED' ? 'reserved' : 'pending',
          category: p.product?.category || 'ETC',
          sellerNickname: p.seller?.nickname || 'Unknown',
          createdAt: p.createdAt
        }));
        setPayments(products);
      } catch (e) {
        console.error('구매내역 로드 실패:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="buy-history-page">
      <header className="history-header">
        <button onClick={() => navigate('/mypage')} className="back-button" style={{position: 'static'}}>{'<'}</button>
        <h2 className="history-header-title">구매내역</h2>
      </header>
      <main className="history-main">
        {loading ? (
          <p>로딩 중...</p>
        ) : payments.length > 0 ? (
          payments.map(p => <ProductCard key={p.id} product={p} />)
        ) : (
          <p className="no-items">구매한 상품이 없습니다.</p>
        )}
      </main>
    </div>
  );
}
export default BuyHistoryPage;