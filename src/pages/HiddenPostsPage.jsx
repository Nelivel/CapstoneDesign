// src/pages/HiddenPostsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { getHiddenProducts, getProductById, unhideProduct, mapBackendLocationToFrontend } from '../api/productApi';
import { getMe } from '../api/authApi';
import { formatTimeAgo } from '../utils/timeUtils';
import './HiddenPostsPage.css';

function HiddenPostsPage() {
  const { navigate } = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hiddenIds, setHiddenIds] = useState([]);
  const [hiddenProducts, setHiddenProducts] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [reportedIds, setReportedIds] = useState([]);

  const getStorageKey = (userId) => (userId ? `hiddenProducts_${userId}` : 'hiddenProducts_default');
  const getReportedKey = (userId) => (userId ? `reportedPosts_${userId}` : 'reportedPosts_default');

  const notify = (message) => {
    if (!message) return;
    window.dispatchEvent(new CustomEvent('app:notify', { detail: { message } }));
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl || imageUrl.trim() === '') return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';
    return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  const persistHiddenIds = (ids, userId = user?.id) => {
    try {
      const key = getStorageKey(userId);
      const normalized = ids.map((id) => {
        const numeric = Number(id);
        return Number.isNaN(numeric) ? id : numeric;
      });
      localStorage.setItem(key, JSON.stringify(normalized));
    } catch (storageError) {
      console.warn('숨긴 게시글 로컬 저장소 업데이트 실패:', storageError);
    }
  };

  const loadHiddenIdsFromStorage = (userId = user?.id) => {
    try {
      const stored = localStorage.getItem(getStorageKey(userId));
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((id) => {
        const numeric = Number(id);
        return Number.isNaN(numeric) ? id : numeric;
      });
    } catch (storageError) {
      console.warn('숨긴 게시글 로컬 로드 실패:', storageError);
      return [];
    }
  };

  const migrateDefaultIds = (userId) => {
    if (!userId) return [];
    const defaultIds = loadHiddenIdsFromStorage(undefined);
    if (!defaultIds.length) return [];
    const existing = loadHiddenIdsFromStorage(userId);
    const merged = Array.from(new Set([...existing, ...defaultIds]));
    persistHiddenIds(merged, userId);
    localStorage.removeItem(getStorageKey());
    return merged;
  };

  const persistReportedIds = (ids, userId = user?.id) => {
    try {
      const key = getReportedKey(userId);
      const normalized = ids.map((id) => {
        const numeric = Number(id);
        return Number.isNaN(numeric) ? id : numeric;
      });
      localStorage.setItem(key, JSON.stringify(normalized));
    } catch (storageError) {
      console.warn('신고 게시글 로컬 저장 실패:', storageError);
    }
  };

  const loadReportedIdsFromStorage = (userId = user?.id) => {
    try {
      const stored = localStorage.getItem(getReportedKey(userId));
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((id) => {
        const numeric = Number(id);
        return Number.isNaN(numeric) ? id : numeric;
      });
    } catch (storageError) {
      console.warn('신고 게시글 로컬 로드 실패:', storageError);
      return [];
    }
  };

  const migrateDefaultReportedIds = (userId) => {
    if (!userId) return [];
    const defaultIds = loadReportedIdsFromStorage(undefined);
    if (!defaultIds.length) return [];
    const existing = loadReportedIdsFromStorage(userId);
    const merged = Array.from(new Set([...existing, ...defaultIds]));
    persistReportedIds(merged, userId);
    localStorage.removeItem(getReportedKey());
    return merged;
  };

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setUser(me);
      } catch (err) {
        console.error('사용자 정보 로드 실패:', err);
        setError('사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.');
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const fetchHiddenProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const migrated = migrateDefaultIds(user.id);
        const migratedReported = migrateDefaultReportedIds(user.id);
        const rawIds = await getHiddenProducts();
        const idsArray = Array.isArray(rawIds)
          ? rawIds
          : Array.isArray(rawIds?.hiddenProductIds)
            ? rawIds.hiddenProductIds
            : [];
        const normalizedIds = idsArray
          .map((id) => {
            const numeric = Number(id);
            return Number.isNaN(numeric) ? id : numeric;
          })
          .filter((id) => id !== null && id !== undefined);

        const combinedIds = normalizedIds.length ? normalizedIds : migrated;

        if (!combinedIds.length) {
          setHiddenIds([]);
          setHiddenProducts([]);
          persistHiddenIds([], user.id);
          const reported = migratedReported.length ? migratedReported : [];
          setReportedIds(reported);
          persistReportedIds(reported, user.id);
          setLoading(false);
          window.dispatchEvent(new CustomEvent('hiddenProductsUpdated', { detail: { ids: [] } }));
          return;
        }

        const productPromises = combinedIds.map(async (id) => {
          try {
            const backendProduct = await getProductById(id);
            return mapBackendToFrontend(backendProduct);
          } catch (prodErr) {
            console.warn('숨긴 게시글 상세 조회 실패:', prodErr);
            return null;
          }
        });

        const fetchedProducts = (await Promise.all(productPromises)).filter(Boolean);
        setHiddenIds(combinedIds);
        setHiddenProducts(fetchedProducts);
        persistHiddenIds(combinedIds, user.id);
        const reported = migratedReported.length ? migratedReported : loadReportedIdsFromStorage(user.id);
        setReportedIds(reported);
        persistReportedIds(reported, user.id);
        window.dispatchEvent(new CustomEvent('hiddenProductsUpdated', { detail: { ids: combinedIds } }));
      } catch (err) {
        if (err?.code !== 'HIDDEN_API_UNAVAILABLE') {
          console.error('숨긴 게시글 목록 조회 실패:', err);
          setError(err.response?.data?.message || '숨긴 게시글을 불러오는 중 오류가 발생했습니다.');
        }
        const stored = loadHiddenIdsFromStorage(user.id);
        setHiddenIds(stored);
        const reported = loadReportedIdsFromStorage(user.id);
        setReportedIds(reported);
        if (stored.length) {
          const productPromises = stored.map(async (id) => {
            try {
              const backendProduct = await getProductById(id);
              return mapBackendToFrontend(backendProduct);
            } catch {
              return null;
            }
          });
          const fallbackProducts = (await Promise.all(productPromises)).filter(Boolean);
          setHiddenProducts(fallbackProducts);
        } else {
          setHiddenProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHiddenProducts();
  }, [user]);

  useEffect(() => {
    if (user?.id) return;
    const defaultReported = loadReportedIdsFromStorage(undefined);
    if (defaultReported.length) {
      setReportedIds(defaultReported);
    }
  }, [user?.id]);

  useEffect(() => {
    const handleReportedUpdate = () => {
      if (user?.id) {
        const stored = loadReportedIdsFromStorage(user.id);
        setReportedIds(stored);
      } else {
        const stored = loadReportedIdsFromStorage(undefined);
        setReportedIds(stored);
      }
    };
    window.addEventListener('reportedProductsUpdated', handleReportedUpdate);
    return () => window.removeEventListener('reportedProductsUpdated', handleReportedUpdate);
  }, [user?.id]);

  const mapBackendToFrontend = (backendProduct) => {
    if (!backendProduct) return null;
    const sellerNickname = backendProduct.seller?.nickname || backendProduct.seller?.username || 'Unknown Seller';
    const tradeType = mapBackendLocationToFrontend(backendProduct.location || backendProduct.tradeType);
    return {
      id: backendProduct.id,
      title: backendProduct.productName || '제목 없음',
      price: backendProduct.productPrice ? Number(backendProduct.productPrice) : 0,
      nickname: sellerNickname,
      createdAt: backendProduct.createdAt || new Date().toISOString(),
      tradeType,
      tradeTypeLabel: tradeType === 'NONE_PERSON' ? '비대면 거래' : '대면 거래',
      status: backendProduct.status || 'ON_SALE',
      statusLabel: mapBackendStatusToLabel(backendProduct.status),
      imageUrl: getImageUrl(backendProduct.imageUrl),
    };
  };

  const mapBackendStatusToLabel = (status) => {
    switch (status) {
      case 'ON_SALE':
        return '판매 중';
      case 'RESERVED':
        return '예약 중';
      case 'SOLD_OUT':
        return '판매 완료';
      default:
        return '판매 중';
    }
  };

  const handleUnhide = async (productId) => {
    if (!productId) return;
    setProcessingId(productId);
    try {
      await unhideProduct(productId);
    } catch (err) {
      console.error('숨김 해제 실패:', err);
      window.dispatchEvent(new CustomEvent('app:notify', { detail: { message: err.response?.data?.message || '숨김 해제 중 오류가 발생했습니다.' } }));
      setProcessingId(null);
      return;
    }

    const normalizedId = (() => {
      const numeric = Number(productId);
      return Number.isNaN(numeric) ? productId : numeric;
    })();

    const updatedIds = hiddenIds.filter((id) => id !== normalizedId);
    setHiddenIds(updatedIds);
    setHiddenProducts((prev) => prev.filter((item) => item.id !== normalizedId));

    persistHiddenIds(updatedIds, user?.id);
    window.dispatchEvent(new CustomEvent('hiddenProductsUpdated', { detail: { ids: updatedIds } }));

    if (reportedIds.includes(normalizedId)) {
      const updatedReported = reportedIds.filter((id) => id !== normalizedId);
      setReportedIds(updatedReported);
      persistReportedIds(updatedReported, user?.id);
      window.dispatchEvent(new CustomEvent('reportedProductsUpdated', { detail: { ids: updatedReported } }));
    }

    setProcessingId(null);

    if (!updatedIds.length) {
      notify('숨긴 게시글이 모두 해제되었습니다.');
    }
  };

  const handleReportHiddenProduct = (productId) => {
    if (!productId) return;
    const numericId = Number(productId);
    const normalizedId = Number.isNaN(numericId) ? productId : numericId;
    if (reportedIds.includes(normalizedId)) {
      notify('이미 신고한 게시글입니다.');
      return;
    }
    const updatedReported = [...reportedIds, normalizedId];
    setReportedIds(updatedReported);
    persistReportedIds(updatedReported, user?.id);
    window.dispatchEvent(new CustomEvent('reportedProductsUpdated', { detail: { ids: updatedReported } }));
    notify('신고가 접수되었습니다. 해당 게시글은 숨김 상태로 유지됩니다.');
  };

  const handleBack = () => {
    navigate('/mypage');
  };

  const handleOpenProduct = (productId) => {
    if (!productId) return;
    navigate(`/product/${productId}`);
  };
 
  return (
    <div className="hidden-posts-page">
      <header className="hidden-header">
        <button onClick={handleBack} className="back-button" style={{ position: 'static' }}>{'<'}</button>
        <h2 className="hidden-header-title">숨긴 글 관리</h2>
      </header>
      <main className="hidden-main">
        {loading && <p className="info-text">숨긴 게시글을 불러오는 중입니다...</p>}
        {error && <p className="error-text" role="alert">{error}</p>}

        {!loading && !error && hiddenProducts.length === 0 && (
          <div className="empty-state">
            <p>숨겨진 게시글이 없습니다.</p>
            <button className="secondary-button" onClick={() => navigate('/home')}>홈으로 이동</button>
          </div>
        )}

        {!loading && !error && hiddenProducts.length > 0 && (
          <ul className="hidden-post-list">
            {hiddenProducts.map((product) => (
              <li key={product.id} className="hidden-post-item">
                <div className="hidden-post-body" role="button" tabIndex={0} onClick={() => handleOpenProduct(product.id)}>
                  <div className="hidden-post-thumb">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <div className="thumb-placeholder">이미지 없음</div>
                    )}
                  </div>
                  <div className="hidden-post-info">
                    <div className="hidden-post-title">{product.title}</div>
                    <div className="hidden-post-meta">
                      <span className={`pill ${product.tradeType === 'NONE_PERSON' ? 'remote' : 'in-person'}`}>
                        {product.tradeTypeLabel}
                      </span>
                      <span className="meta-text">{product.statusLabel}</span>
                      <span className="meta-text">• {formatPrice(product.price)}</span>
                      <span className="meta-text">• {formatTimeAgo(product.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden-post-actions">
                  <button
                    className="report-button"
                    onClick={() => handleReportHiddenProduct(product.id)}
                    disabled={reportedIds.includes(product.id)}
                  >
                    {reportedIds.includes(product.id) ? '신고 완료' : '신고하기'}
                  </button>
                  <button
                    className="unhide-button"
                    onClick={() => handleUnhide(product.id)}
                    disabled={processingId === product.id}
                  >
                    {processingId === product.id ? '해제 중...' : '숨김 해제'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
 
 const formatPrice = (price) => {
   if (Number.isNaN(Number(price))) return '가격 정보 없음';
   const numeric = Number(price);
   return `${numeric.toLocaleString('ko-KR')}원`;
 };
 
 export default HiddenPostsPage;