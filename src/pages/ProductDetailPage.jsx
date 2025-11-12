// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react'; // useState, useEffect 추가
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate 추가
import { getProductById, hideProduct as hideProductRequest, deleteProduct as deleteProductRequest, mapBackendLocationToFrontend } from '../api/productApi'; // API 함수 임포트
import { checkFavoriteStatus, addFavorite, removeFavorite } from '../api/favoriteApi'; // 관심상품 API
import { getMe } from '../api/authApi'; // 현재 사용자 정보
import { formatTimeAgo } from '../utils/timeUtils';
import { MOCK_USERS } from '../data/users'; // 아직 Seller 정보는 mock 사용
import './ProductDetailPage.css';
import '../components/ProductCard.css';
import ProductMenuModal from '../components/ProductMenuModal';

function ProductDetailPage() {
  const { id } = useParams(); // 라우트 파라미터 이름이 'id'인지 확인
  const productId = id; // useParams에서 받은 id를 productId로 사용
  const navigate = useNavigate(); // react-router의 useNavigate 직접 사용

  const [product, setProduct] = useState(null); // 상품 상태
  const [seller, setSeller] = useState(null);   // 판매자 상태 (임시)
  const [currentUser, setCurrentUser] = useState(null); // 현재 로그인한 사용자
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const notify = (message) => {
    if (!message) return;
    window.dispatchEvent(new CustomEvent('app:notify', { detail: { message } }));
  };

  const getHiddenStorageKey = (userId) => `hiddenProducts_${userId}`;
  const getReportedStorageKey = (userId) => `reportedPosts_${userId}`;

  const loadHiddenIds = (userId) => {
    if (!userId) return [];
    try {
      const stored = localStorage.getItem(getHiddenStorageKey(userId));
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((id) => {
        const numeric = Number(id);
        return Number.isNaN(numeric) ? id : numeric;
      });
    } catch (err) {
      console.warn('숨긴 게시글 정보를 불러오지 못했습니다.', err);
      return [];
    }
  };

  const loadReportedIds = (userId) => {
    if (!userId) return [];
    try {
      const stored = localStorage.getItem(getReportedStorageKey(userId));
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((id) => {
        const numeric = Number(id);
        return Number.isNaN(numeric) ? id : numeric;
      });
    } catch (err) {
      console.warn('신고한 게시글 정보를 불러오지 못했습니다.', err);
      return [];
    }
  };

  const persistHiddenId = (userId, productId) => {
    if (!userId || !productId) return;
    try {
      const key = getHiddenStorageKey(userId);
      const stored = localStorage.getItem(key);
      const numericId = Number(productId);
      const normalizedId = Number.isNaN(numericId) ? productId : numericId;
      const parsed = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(parsed)) {
        localStorage.setItem(key, JSON.stringify([normalizedId]));
        window.dispatchEvent(new CustomEvent('hiddenProductsUpdated', { detail: { ids: loadHiddenIds(userId) } }));
        return;
      }
      const hasId = parsed.some((id) => {
        const numeric = Number(id);
        const normalized = Number.isNaN(numeric) ? id : numeric;
        return normalized === normalizedId;
      });
      if (hasId) return;
      const updated = [...parsed, normalizedId];
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('hiddenProductsUpdated', { detail: { ids: loadHiddenIds(userId) } }));
    } catch (err) {
      console.warn('숨긴 게시글 정보를 로컬에 저장하지 못했습니다.', err);
    }
  };

  const persistReportedId = (userId, productId) => {
    if (!userId || !productId) return;
    try {
      const key = getReportedStorageKey(userId);
      const stored = localStorage.getItem(key);
      const numericId = Number(productId);
      const normalizedId = Number.isNaN(numericId) ? productId : numericId;
      const parsed = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(parsed)) {
        localStorage.setItem(key, JSON.stringify([normalizedId]));
        window.dispatchEvent(new CustomEvent('reportedProductsUpdated', { detail: { ids: [normalizedId] } }));
        return;
      }
      const hasId = parsed.some((id) => {
        const numeric = Number(id);
        const normalized = Number.isNaN(numeric) ? id : numeric;
        return normalized === normalizedId;
      });
      if (hasId) return;
      const updated = [...parsed, normalizedId];
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('reportedProductsUpdated', { detail: { ids: loadReportedIds(userId) } }));
    } catch (err) {
      console.warn('신고한 게시글 정보를 로컬에 저장하지 못했습니다.', err);
    }
  };

  // productId가 변경될 때마다 상품 정보 불러오기
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('ProductDetailPage - productId from useParams:', productId);
        console.log('ProductDetailPage - productId type:', typeof productId);
        
        if (!productId || productId === 'undefined' || productId === 'null') {
          console.error('Invalid productId:', productId);
          setError('상품 ID가 올바르지 않습니다.');
          setProduct(null);
          setLoading(false);
          return;
        }
        
        const backendProduct = await getProductById(productId);
        console.log('Product data received:', backendProduct);
        
        if (!backendProduct) {
          setError('상품 정보를 찾을 수 없습니다.');
          setProduct(null);
          return;
        }
        
        // 백엔드 응답 -> 프론트엔드 형태로 변환 (HomePage와 동일한 함수 사용 또는 별도 정의)
        const frontendProduct = mapBackendProductToFrontend(backendProduct);
        console.log('Mapped product:', frontendProduct);
        setProduct(frontendProduct);

        // TODO: 백엔드 ProductResponse에 판매자 정보(User)가 포함되어 있다면 아래 로직 수정
        // 현재는 mock 데이터에서 판매자 정보 임시 로드
        if (frontendProduct && MOCK_USERS[frontendProduct.sellerNickname]) {
          setSeller(MOCK_USERS[frontendProduct.sellerNickname]);
        } else {
          setSeller(null); // 판매자 정보 없을 경우
        }

        // 관심상품 상태 확인 (에러는 조용히 처리)
        try {
          const favoriteStatus = await checkFavoriteStatus(frontendProduct.id);
          setIsFavorite(favoriteStatus);
        } catch (favErr) {
          // 500 에러 등은 checkFavoriteStatus에서 false 반환하므로 여기서는 조용히 처리
          setIsFavorite(false);
        }

      } catch (err) {
        console.error('Product fetch error:', err);
        setError(err.response?.data?.message || err.message || '상품 정보를 불러오는 데 실패했습니다.');
        setProduct(null); // 에러 발생 시 상품 정보 초기화
      } finally {
        setLoading(false);
      }
    };

      fetchProduct();

    // 현재 사용자 정보 로드
    (async () => {
      try {
        const me = await getMe();
        setCurrentUser(me);
      } catch (err) {
        console.error('사용자 정보 로드 실패:', err);
      }
    })();
  }, [productId]); // productId가 바뀔 때마다 실행

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
  const mapBackendProductToFrontend = (backendProduct) => {
    const sellerNickname = backendProduct.seller?.nickname || backendProduct.seller?.username || 'Unknown Seller';
    const tradeType = mapBackendLocationToFrontend(backendProduct.location || backendProduct.tradeType);
    return {
      id: backendProduct.id,
      sellerId: backendProduct.seller?.id || null, // 판매자 ID 저장
      sellerNickname: sellerNickname,
      sellerHasTimetable: true, // TODO: 백엔드 User 정보에서 시간표 유무 확인
      imageUrl: getImageUrl(backendProduct.imageUrl),
      title: backendProduct.productName || '제목 없음',
      nickname: sellerNickname,
      description: backendProduct.productDescription || '',
      price: backendProduct.productPrice ? Number(backendProduct.productPrice) : 0,
      status: mapBackendStatusToFrontend(backendProduct.status),
      category: mapBackendCategoryToFrontend(backendProduct.category),
      createdAt: backendProduct.createdAt || new Date().toISOString(),
      viewCount: backendProduct.viewCount || 0,
      tradeType,
      tradeTypeLabel: tradeType === 'NONE_PERSON' ? '비대면 거래' : '대면 거래',
    };
  };
  const mapBackendStatusToFrontend = (backendStatus) => { /* ... HomePage 함수와 동일 ... */
    switch (backendStatus) {
      case 'ON_SALE': return 'selling';
      case 'RESERVED': return 'reserved';
      case 'SOLD_OUT': return 'sold';
      default: return 'selling';
    }
   };
  const mapBackendCategoryToFrontend = (backendCategory) => { /* ... HomePage 함수와 동일 ... */
    switch (backendCategory) {
      case 'BOOKS': return '교재';
      case 'ELECTRONICS': return '전자기기';
      case 'DAILY_SUPPLIES': return '생활용품';
      case 'FASHION': return '패션';
      default: return '기타';
    }
  };


  // 관심 버튼 핸들러
  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!product) return;

    try {
      if (isFavorite) {
        console.log('Removing favorite for product:', product.id);
        await removeFavorite(product.id);
        setIsFavorite(false);
        console.log('Favorite removed successfully');
      } else {
        console.log('Adding favorite for product:', product.id);
        await addFavorite(product.id);
        setIsFavorite(true);
        console.log('Favorite added successfully');
      }
    } catch (err) {
      console.error('관심상품 토글 실패:', err);
      if (err.response?.status === 401 || err.sessionExpired) {
        notify('세션이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/welcome');
      } else {
        notify('관심상품 등록/해제에 실패했습니다: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  // 채팅하기 핸들러
  const handleChatClick = async () => {
    if (!product || !currentUser) {
      notify('로그인이 필요합니다.');
      navigate('/welcome');
      return;
    }

    // 본인이 올린 상품인지 확인
    const isMyProduct = currentUser && product.sellerId && (Number(currentUser.id) === Number(product.sellerId));
    if (isMyProduct) {
      notify('자신이 올린 상품에는 채팅을 보낼 수 없습니다.');
      return;
    }

    try {
      // 상품 정보에서 판매자 ID 가져오기
      const sellerId = product.sellerId || 0; // backendProduct.seller?.id
      
      // 채팅방 ID 생성 (productId 기반)
      const chatRoomId = product.id; // 간단하게 productId를 채팅방 ID로 사용
      
      // 채팅방으로 이동 (productId를 state로 전달)
      navigate(`/chat/${chatRoomId}`, {
        state: {
          productId: product.id,
          sellerId: sellerId,
          sellerNickname: product.sellerNickname
        }
      });
    } catch (err) {
      console.error('채팅방 이동 실패:', err);
      notify('채팅방으로 이동하는데 실패했습니다.');
    }
  };

  const isOwner = !!currentUser && !!product && (
    (product.sellerId && Number(currentUser.id) === Number(product.sellerId)) ||
    (currentUser.username && product.nickname && currentUser.username === product.nickname) ||
    (currentUser.nickname && product.nickname && currentUser.nickname === product.nickname)
  );

  const handleEdit = () => {
    setIsMenuOpen(false);
    if (!product) return;
    window.dispatchEvent(new CustomEvent('app:notify', { detail: { message: '상품 수정 기능은 추후 제공될 예정입니다.' } }));
  };

  const handleDelete = async () => {
    if (!product) {
      setIsMenuOpen(false);
      return;
    }
    const confirmed = window.confirm('해당 게시글을 삭제하시겠습니까?');
    if (!confirmed) return;
    try {
      await deleteProductRequest(product.id);
      window.dispatchEvent(new CustomEvent('app:notify', { detail: { message: '게시글이 삭제되었습니다.' } }));
      navigate('/home');
    } catch (err) {
      console.error('게시글 삭제 실패:', err);
      const message = err.response?.data?.message || err.response?.data || err.message || '게시글 삭제 중 오류가 발생했습니다.';
      notify(message);
    } finally {
      setIsMenuOpen(false);
    }
  };

  const applyHide = async (message) => {
    if (!product) {
      setIsMenuOpen(false);
      return;
    }
    try {
      await hideProductRequest(product.id);
    } catch (err) {
      console.warn('게시글 숨김 API 호출에 실패했습니다. 로컬에만 반영합니다.', err);
      notify('숨김 기능이 로컬 모드로 동작합니다.');
    }
    if (currentUser?.id) {
      persistHiddenId(currentUser.id, product.id);
    }
    notify(message);
    setIsMenuOpen(false);
    navigate('/home');
  };

  const handleHide = () => {
    applyHide('이 게시글이 홈 피드에서 숨겨졌습니다.');
  };

  const handleReport = () => {
    const userId = currentUser?.id;
    if (userId) {
      const reportedList = loadReportedIds(userId);
      const numericId = Number(product.id);
      const normalizedId = Number.isNaN(numericId) ? product.id : numericId;
      if (reportedList.includes(normalizedId)) {
        notify('이미 신고한 게시글입니다.');
        setIsMenuOpen(false);
        return;
      }
      persistReportedId(userId, normalizedId);
    } else {
      notify('로그인이 필요합니다.');
      setIsMenuOpen(false);
      return;
    }
    applyHide('신고가 접수되었습니다. 해당 게시글을 숨김 처리했습니다.');
  };

  const getMannerFace = (credits) => { /* ... 기존 함수 ... */
    if (credits >= 4.0) return '😇';
    if (credits >= 3.5) return '😊';
    if (credits >= 3.0) return '🙂';
    if (credits >= 2.5) return '🤔';
    return '😥';
  };

  // 로딩 중 또는 에러 발생 시 처리
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>로딩 중...</div>
        <div style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
          상품 ID: {productId || '없음'}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
        <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
          상품 ID: {productId || '없음'}
        </div>
        <button onClick={() => navigate('/home')} style={{ padding: '10px 20px', marginTop: '10px' }}>
          홈으로 돌아가기
        </button>
      </div>
    );
  }
  if (!product) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>상품 정보를 찾을 수 없습니다.</div>
        <div style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
          상품 ID: {productId || '없음'}
        </div>
        <button onClick={() => navigate('/home')} style={{ padding: '10px 20px', marginTop: '10px' }}>
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  // --- 정상 렌더링 ---
  return (
    <div className="detail-page">
      <header className="detail-header">
        <button onClick={() => navigate(-1)} className="back-button" style={{position: 'static', fontSize: '1.2em'}}>{'<'}</button>
        <button
          className="detail-menu-button"
          onClick={() => setIsMenuOpen(true)}
          disabled={loading || !product}
        >
          ⋮
        </button>
      </header>

      <main className="detail-main">
        {/* 판매자 프로필 */}
        <div className="seller-profile">
          <div className="seller-avatar"></div>
          <div className="seller-info">
            <div className="nickname">{product.nickname}</div>
            <div className="location">학교 인증 완료</div>
          </div>
          {/* 매너학점 (seller 상태 사용) */}
          {seller && (
            <div className="manner-section">
              <span className="manner-score">{seller.mannerCredits.toFixed(1)}</span>
              <span className="manner-face">{getMannerFace(seller.mannerCredits)}</span>
            </div>
          )}
        </div>

        {/* 상품 이미지 */}
        <div className="detail-image-container">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.title} 
                className="detail-image"
                onError={(e) => {
                  e.target.style.display = 'none'; // 이미지 로드 실패 시 숨김
                }}
              />
            ) : (
              <div className="detail-image" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', minHeight: '300px' }}>
                이미지 없음
              </div>
            )}
        </div>

        {/* 상품 정보 (product 상태 사용) */}
        <div className="product-content">
          <h1 className="title">{product.title}</h1>
          <div className="product-meta-info">
            <span>{product.tradeTypeLabel}</span>
            <span>• {product.category}</span>
            <span>• {formatTimeAgo(product.createdAt)}</span>
            <span>• 조회 {product.viewCount}</span>
          </div>
          <p className="description">{product.description}</p>
        </div>
      </main>

      {/* 하단 푸터 */}
      <footer className="detail-footer">
        {/* 관심 버튼 (isFavorite 상태 사용) */}
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
          onClick={handleChatClick}
          disabled={product.status === 'sold' || (currentUser && product.sellerId && Number(currentUser.id) === Number(product.sellerId))}
        >
          {product.status === 'sold' 
            ? '거래 완료' 
            : (currentUser && product.sellerId && Number(currentUser.id) === Number(product.sellerId))
            ? '내 상품'
            : '채팅하기'}
        </button>
      </footer>

      {isMenuOpen && (
        <ProductMenuModal
          isOwner={isOwner}
          onClose={() => setIsMenuOpen(false)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onHide={handleHide}
          onReport={handleReport}
        />
      )}
    </div>
  );
}

export default ProductDetailPage;