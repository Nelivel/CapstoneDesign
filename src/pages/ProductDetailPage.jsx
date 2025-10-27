// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react'; // useState, useEffect 추가
import { useParams } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
// import { useGlobalData } from '../context/GlobalContext'; // 제거
import { getProductById } from '../api/productApi'; // API 함수 임포트
import { formatTimeAgo } from '../utils/timeUtils';
import { MOCK_USERS } from '../data/users'; // 아직 Seller 정보는 mock 사용
import './ProductDetailPage.css';
import '../components/ProductCard.css';

function ProductDetailPage() {
  const { productId } = useParams();
  const { navigate } = useNavigation();
  // const { favorites, toggleFavorite } = useGlobalData(); // GlobalContext에서 관심 목록만 가져오도록 수정 필요

  const [product, setProduct] = useState(null); // 상품 상태
  const [seller, setSeller] = useState(null);   // 판매자 상태 (임시)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false); // TODO: 관심 목록 API 연동 필요

  // productId가 변경될 때마다 상품 정보 불러오기
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const backendProduct = await getProductById(productId);
        // 백엔드 응답 -> 프론트엔드 형태로 변환 (HomePage와 동일한 함수 사용 또는 별도 정의)
        const frontendProduct = mapBackendProductToFrontend(backendProduct);
        setProduct(frontendProduct);

        // TODO: 백엔드 ProductResponse에 판매자 정보(User)가 포함되어 있다면 아래 로직 수정
        // 현재는 mock 데이터에서 판매자 정보 임시 로드
        if (frontendProduct && MOCK_USERS[frontendProduct.sellerNickname]) {
          setSeller(MOCK_USERS[frontendProduct.sellerNickname]);
        } else {
          setSeller(null); // 판매자 정보 없을 경우
        }

      } catch (err) {
        setError('상품 정보를 불러오는 데 실패했습니다.');
        console.error(err);
        setProduct(null); // 에러 발생 시 상품 정보 초기화
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]); // productId가 바뀔 때마다 실행

  // --- 백엔드 응답 -> 프론트엔드 데이터 구조 변환 함수 ---
  // HomePage의 함수와 동일하게 사용하거나 필요시 수정
  const mapBackendProductToFrontend = (backendProduct) => { /* ... HomePage의 함수 내용과 동일 ... */
    return {
      id: backendProduct.id,
      sellerNickname: backendProduct.nickname || 'Unknown Seller', // 임시: 백엔드 Product 엔티티 수정 필요
      sellerHasTimetable: true, // 임시
      imageUrl: "https://via.placeholder.com/150", // 임시
      title: backendProduct.productName,
      nickname: backendProduct.nickname || 'Unknown Seller', // 임시
      description: backendProduct.productDescription,
      price: backendProduct.productPrice,
      status: mapBackendStatusToFrontend(backendProduct.status),
      category: mapBackendCategoryToFrontend(backendProduct.category),
      createdAt: backendProduct.createdAt,
      viewCount: backendProduct.viewCount,
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


  // 관심 버튼 핸들러 (API 연동 필요)
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    // toggleFavorite(product.id); // GlobalContext 대신 API 호출 로직 필요
    setIsFavorite(!isFavorite); // 임시 토글
    // TODO: 관심 상품 추가/삭제 API 호출
    alert('관심 상품 기능 API 연동 필요');
  };

  const getChatRoomId = (nickname) => { /* ... 기존 함수 ... */
    if (nickname === '스터디홀릭') return 1;
    if (nickname === '경영새내기') return 2;
    if (nickname === '시간표_미제공자') return 3;
    if (nickname === '글로벌리') return 1;
    if (nickname === '긱스가든') return 2;
    return 1;
  };

  const getMannerFace = (credits) => { /* ... 기존 함수 ... */
    if (credits >= 4.0) return '😇';
    if (credits >= 3.5) return '😊';
    if (credits >= 3.0) return '🙂';
    if (credits >= 2.5) return '🤔';
    return '😥';
  };

  // 로딩 중 또는 에러 발생 시 처리
  if (loading) return <div>로딩 중...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!product) return <div>상품 정보를 찾을 수 없습니다.</div>;

  // --- 정상 렌더링 ---
  return (
    <div className="detail-page">
      <header className="detail-header">
        <button onClick={() => navigate(-1)} className="back-button" style={{position: 'static', fontSize: '1.2em'}}>{'<'}</button>
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
            <img src={product.imageUrl} alt={product.title} className="detail-image" />
        </div>

        {/* 상품 정보 (product 상태 사용) */}
        <div className="product-content">
          <h1 className="title">{product.title}</h1>
          <div className="product-meta-info">
            <span>{product.category}</span>
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
          onClick={() => navigate(
            `/chat/${getChatRoomId(product.sellerNickname)}`,
            { state: { productId: product.id } }
          )}
          disabled={product.status === 'sold'}
        >
          {product.status === 'sold' ? '거래 완료' : '채팅하기'}
        </button>
      </footer>
    </div>
  );
}

export default ProductDetailPage;