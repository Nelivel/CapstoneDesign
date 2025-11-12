// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react'; // useState, useEffect 추가
import { useNavigation } from '../context/NavigationContext';
import ProductList from '../components/ProductList';
import { getProducts, hideProduct as hideProductRequest, getHiddenProducts, deleteProduct as deleteProductRequest, mapBackendLocationToFrontend } from '../api/productApi'; // API 함수 임포트
import { getMe } from '../api/authApi';
import './HomePage.css';

function HomePage() {
  const { navigate } = useNavigation();
  const [products, setProducts] = useState([]); // 상품 목록 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null);    // 에러 상태
  const [currentUser, setCurrentUser] = useState(null);
  const [tradeFilter, setTradeFilter] = useState('IN_PERSON');
  const [hiddenProductIds, setHiddenProductIds] = useState([]);
  const [reportedProductIds, setReportedProductIds] = useState([]);

  const getHiddenStorageKey = (userId) => (userId ? `hiddenProducts_${userId}` : 'hiddenProducts_default');
  const getReportedStorageKey = (userId) => (userId ? `reportedPosts_${userId}` : 'reportedPosts_default');
  const persistHiddenIds = (ids, userId = currentUser?.id) => {
    try {
      const key = getHiddenStorageKey(userId);
      const normalized = ids.map((id) => {
        const numeric = Number(id);
        return Number.isNaN(numeric) ? id : numeric;
      });
      localStorage.setItem(key, JSON.stringify(normalized));
    } catch (storageError) {
      console.warn('Hidden product persistence failed:', storageError);
    }
  };
  const loadHiddenIdsFromStorage = (userId) => {
    try {
      const stored = localStorage.getItem(getHiddenStorageKey(userId));
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((id) => {
        const numeric = Number(id);
        return Number.isNaN(numeric) ? id : numeric;
      });
    } catch (storageError) {
      console.warn('Hidden product local load failed:', storageError);
      return [];
    }
  };

  const persistReportedIds = (ids, userId = currentUser?.id) => {
    try {
      const key = getReportedStorageKey(userId);
      const normalized = ids.map((id) => {
        const numeric = Number(id);
        return Number.isNaN(numeric) ? id : numeric;
      });
      localStorage.setItem(key, JSON.stringify(normalized));
    } catch (storageError) {
      console.warn('Reported product persistence failed:', storageError);
    }
  };

  const loadReportedIdsFromStorage = (userId) => {
    try {
      const stored = localStorage.getItem(getReportedStorageKey(userId));
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((id) => {
        const numeric = Number(id);
        return Number.isNaN(numeric) ? id : numeric;
      });
    } catch (storageError) {
      console.warn('Reported product local load failed:', storageError);
      return [];
    }
  };

  const migrateDefaultHiddenIds = (userId) => {
    if (!userId) return;
    const defaultIds = loadHiddenIdsFromStorage(undefined);
    if (!defaultIds.length) return;
    const existing = loadHiddenIdsFromStorage(userId);
    const merged = Array.from(new Set([...existing, ...defaultIds]));
    persistHiddenIds(merged, userId);
    localStorage.removeItem(getHiddenStorageKey());
    setHiddenProductIds(merged.map((id) => {
      const numeric = Number(id);
      return Number.isNaN(numeric) ? id : numeric;
    }));
  };

  const migrateDefaultReportedIds = (userId) => {
    if (!userId) return;
    const defaultIds = loadReportedIdsFromStorage(undefined);
    if (!defaultIds.length) return;
    const existing = loadReportedIdsFromStorage(userId);
    const merged = Array.from(new Set([...existing, ...defaultIds]));
    persistReportedIds(merged, userId);
    localStorage.removeItem(getReportedStorageKey());
    setReportedProductIds(merged.map((id) => {
      const numeric = Number(id);
      return Number.isNaN(numeric) ? id : numeric;
    }));
  };

  // 컴포넌트 마운트 시 상품 목록 불러오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts();
        // 응답이 배열이 아닌 경우 처리
        if (!Array.isArray(data)) {
          console.error('예상치 못한 응답 형식:', data);
          setError('상품 목록 형식이 올바르지 않습니다.');
          return;
        }
        // 백엔드 ProductResponse -> 프론트엔드 Product 형태로 변환 필요
        const formattedProducts = data.map(mapBackendProductToFrontend);
        setProducts(formattedProducts);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || '상품 목록을 불러오는 데 실패했습니다.';
        setError(errorMessage);
        console.error('상품 목록 로딩 실패:', err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // 빈 배열: 마운트 시 한 번만 실행

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setCurrentUser(me);
      } catch (err) {
        console.error('사용자 정보 로드 실패:', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (currentUser?.id) return;
    const storedDefault = loadHiddenIdsFromStorage(undefined);
    if (storedDefault.length) {
      setHiddenProductIds(storedDefault);
    }
    const storedReportedDefault = loadReportedIdsFromStorage(undefined);
    if (storedReportedDefault.length) {
      setReportedProductIds(storedReportedDefault);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id) return;
    migrateDefaultHiddenIds(currentUser.id);
    migrateDefaultReportedIds(currentUser.id);
    (async () => {
      try {
        const hiddenIds = await getHiddenProducts();
        const normalized = (Array.isArray(hiddenIds)
          ? hiddenIds
          : Array.isArray(hiddenIds?.hiddenProductIds)
            ? hiddenIds.hiddenProductIds
            : []
        ).map((id) => Number(id)).filter((id) => !Number.isNaN(id));
        setHiddenProductIds(normalized);
        persistHiddenIds(normalized);
        const reported = loadReportedIdsFromStorage(currentUser.id);
        setReportedProductIds(reported);
      } catch (err) {
        if (err?.code !== 'HIDDEN_API_UNAVAILABLE') {
          console.warn('숨긴 게시글 목록을 불러오지 못했습니다. 로컬 저장소 데이터로 대체합니다.', err);
        }
        const stored = loadHiddenIdsFromStorage(currentUser.id);
        setHiddenProductIds(stored);
        const reported = loadReportedIdsFromStorage(currentUser.id);
        setReportedProductIds(reported);
      }
    })();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.id) return;
    const handleHiddenUpdate = (event) => {
      const incoming = event.detail?.ids;
      if (Array.isArray(incoming)) {
        const normalized = incoming.map((id) => {
          const numeric = Number(id);
          return Number.isNaN(numeric) ? id : numeric;
        });
        setHiddenProductIds(normalized);
        persistHiddenIds(normalized);
      } else {
        const stored = loadHiddenIdsFromStorage(currentUser.id);
        setHiddenProductIds(stored);
      }
    };
    window.addEventListener('hiddenProductsUpdated', handleHiddenUpdate);
    const handleReportedUpdate = (event) => {
      const incoming = event.detail?.ids;
      if (Array.isArray(incoming)) {
        const normalized = incoming.map((id) => {
          const numeric = Number(id);
          return Number.isNaN(numeric) ? id : numeric;
        });
        setReportedProductIds(normalized);
        persistReportedIds(normalized);
      } else {
        const stored = loadReportedIdsFromStorage(currentUser.id);
        setReportedProductIds(stored);
      }
    };
    window.addEventListener('reportedProductsUpdated', handleReportedUpdate);
    return () => {
      window.removeEventListener('hiddenProductsUpdated', handleHiddenUpdate);
      window.removeEventListener('reportedProductsUpdated', handleReportedUpdate);
    };
  }, [currentUser]);

  // 이미지 URL 생성 함수
  const getImageUrl = (imageUrl) => {
    if (!imageUrl || imageUrl.trim() === '') {
      return null; // 빈 문자열 대신 null 반환 (React에서 src에 null을 전달하면 렌더링되지 않음)
    }
    // 이미 전체 URL인 경우
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // 상대 경로인 경우
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';
    return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  // --- 백엔드 응답 -> 프론트엔드 데이터 구조 변환 함수 ---
  // ProductResponse.java 와 프론트엔드 product 객체 구조 비교하여 작성
  const mapBackendProductToFrontend = (backendProduct) => {
    const sellerNickname = backendProduct.seller?.nickname || backendProduct.seller?.username || 'Unknown Seller';
    const tradeType = mapBackendLocationToFrontend(backendProduct.location || backendProduct.tradeType);
    return {
      id: backendProduct.id,
      sellerId: backendProduct.seller?.id || backendProduct.sellerId || null,
      sellerNickname: sellerNickname,
      sellerHasTimetable: true, // TODO: 백엔드 User 정보에서 시간표 유무 확인
      imageUrl: getImageUrl(backendProduct.imageUrl),
      title: backendProduct.productName || '제목 없음',
      nickname: sellerNickname,
      description: backendProduct.productDescription || '',
      price: backendProduct.productPrice ? Number(backendProduct.productPrice) : 0,
      status: mapBackendStatusToFrontend(backendProduct.status), // Enum -> 문자열 변환
      category: mapBackendCategoryToFrontend(backendProduct.category), // Enum -> 문자열 변환
      createdAt: backendProduct.createdAt || new Date().toISOString(),
      viewCount: backendProduct.viewCount || 0,
      tradeType,
      tradeTypeLabel: tradeType === 'NONE_PERSON' ? '비대면 거래' : '대면 거래',
    };
  };

  // 백엔드 Status Enum -> 프론트엔드 status 문자열
  const mapBackendStatusToFrontend = (backendStatus) => {
    switch (backendStatus) {
      case 'ON_SALE': return 'selling';
      case 'RESERVED': return 'reserved';
      case 'SOLD_OUT': return 'sold';
      default: return 'selling';
    }
  };

  // 백엔드 Category Enum -> 프론트엔드 category 문자열
  const mapBackendCategoryToFrontend = (backendCategory) => {
     switch (backendCategory) {
      case 'BOOKS': return '교재';
      case 'ELECTRONICS': return '전자기기';
      case 'DAILY_SUPPLIES': return '생활용품';
      case 'FASHION': return '패션';
      default: return '기타';
    }
  };

  const handleHideProduct = async (productId) => {
    if (!productId) return;
    try {
      await hideProductRequest(productId);
    } catch (err) {
      console.warn('게시글 숨김 API 호출에 실패했습니다. 로컬 저장소에만 반영됩니다.', err);
      window.dispatchEvent(new CustomEvent('app:notify', { detail: { message: '숨김 기능이 로컬 모드로 동작합니다.' } }));
    }
    const numericId = Number(productId);
    const normalizedId = Number.isNaN(numericId) ? productId : numericId;
    setHiddenProductIds((prev) => {
      if (prev.includes(normalizedId)) return prev;
      const updated = [...prev, normalizedId];
      persistHiddenIds(updated);
      window.dispatchEvent(new CustomEvent('hiddenProductsUpdated', { detail: { ids: updated } }));
      return updated;
    });
    return true;
  };

  const recordReportedProduct = (productId) => {
    const numericId = Number(productId);
    const normalizedId = Number.isNaN(numericId) ? productId : numericId;
    setReportedProductIds((prev) => {
      if (prev.includes(normalizedId)) return prev;
      const updated = [...prev, normalizedId];
      persistReportedIds(updated);
      window.dispatchEvent(new CustomEvent('reportedProductsUpdated', { detail: { ids: updated } }));
      return updated;
    });
  };

  const handleDeleteProduct = async (productId) => {
    if (!productId) return;
    try {
      await deleteProductRequest(productId);
      setProducts((prev) => prev.filter((item) => item.id !== productId));
      window.dispatchEvent(new CustomEvent('app:notify', { detail: { message: '게시글이 삭제되었습니다.' } }));
      return true;
    } catch (err) {
      console.error('게시글 삭제 실패:', err);
      window.dispatchEvent(new CustomEvent('app:notify', { detail: { message: err.response?.data?.message || '게시글 삭제 중 오류가 발생했습니다.' } }));
      throw err;
    }
  };

  const handleEditProduct = (productId) => {
    if (!productId) return;
    window.dispatchEvent(new CustomEvent('app:notify', { detail: { message: '상품 수정 기능은 추후 제공될 예정입니다.' } }));
  };

  const handleReportProduct = async (productId) => {
    if (!productId) return;
    const numericId = Number(productId);
    const normalizedId = Number.isNaN(numericId) ? productId : numericId;
    if (reportedProductIds.includes(normalizedId)) {
      window.dispatchEvent(new CustomEvent('app:notify', { detail: { message: '이미 신고한 게시글입니다.' } }));
      return true;
    }
    try {
      await handleHideProduct(productId);
      recordReportedProduct(normalizedId);
      window.dispatchEvent(new CustomEvent('app:notify', { detail: { message: '신고가 접수되었습니다. 해당 게시글을 숨김 처리했습니다.' } }));
      return true;
    } catch (err) {
      console.error('게시글 신고 처리 실패:', err);
      window.dispatchEvent(new CustomEvent('app:notify', { detail: { message: '신고 처리 중 오류가 발생했습니다.' } }));
      return false;
    }
  };

  const hiddenSet = new Set(hiddenProductIds);
  const filteredProducts = products
    .filter((product) => {
      if (!product) return false;
      const idValue = Number(product.id);
      const normalizedId = Number.isNaN(idValue) ? product.id : idValue;
      return !hiddenSet.has(normalizedId);
    })
    .filter((product) => {
      const type = product?.tradeType || 'IN_PERSON';
      return tradeFilter === 'IN_PERSON' ? type === 'IN_PERSON' : type === 'NONE_PERSON';
    });

  const handleSearchClick = () => window.dispatchEvent(new CustomEvent('app:notify', { detail: { message: '검색 기능 준비 중입니다.' } }));
  const handleAlertClick = () => window.dispatchEvent(new CustomEvent('app:notify', { detail: { message: '알림 기능 준비 중입니다.' } }));

  return (
    <div className="home-page">
      <header className="home-header">
        <img src="/logo.png" alt="책상정리 로고" className="logo" />
        <div className="header-actions">
          <button className="header-button search-button" onClick={handleSearchClick}>🔍</button>
          <button className="header-button alert-button" onClick={handleAlertClick}>🔔</button>
        </div>
      </header>

      <div className="trade-filter-bar">
        <button
          className={`trade-filter-button ${tradeFilter === 'IN_PERSON' ? 'active' : ''}`}
          onClick={() => setTradeFilter('IN_PERSON')}
        >
          대면
        </button>
        <button
          className={`trade-filter-button ${tradeFilter === 'NONE_PERSON' ? 'active' : ''}`}
          onClick={() => setTradeFilter('NONE_PERSON')}
        >
          비대면
        </button>
      </div>

      <main className="home-main">
        {loading && <p>로딩 중...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <ProductList
            products={filteredProducts}
            currentUser={currentUser}
            onHide={handleHideProduct}
            onDelete={handleDeleteProduct}
            onEdit={handleEditProduct}
            onReport={handleReportProduct}
            reportedProductIds={reportedProductIds}
          />
        )}
        <button onClick={() => navigate('/post')} className="write-button">글쓰기</button>
      </main>
    </div>
  );
}

export default HomePage;