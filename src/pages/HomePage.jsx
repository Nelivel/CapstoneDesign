// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react'; // useState, useEffect 추가
import { useNavigation } from '../context/NavigationContext';
import ProductList from '../components/ProductList';
import { getProducts } from '../api/productApi'; // API 함수 임포트
import './HomePage.css';

function HomePage() {
  const { navigate } = useNavigation();
  const [products, setProducts] = useState([]); // 상품 목록 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null);    // 에러 상태

  // 컴포넌트 마운트 시 상품 목록 불러오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts();
        console.log('상품 목록 응답:', data); // 디버깅용
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
    return {
      id: backendProduct.id,
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


  const handleSearchClick = () => alert('검색 기능 준비 중');
  const handleAlertClick = () => alert('알림 기능 준비 중');

  return (
    <div className="home-page">
      <header className="home-header">
        <img src="/logo.png" alt="책상정리 로고" className="logo" />
        <div className="header-actions">
          <button className="header-button search-button" onClick={handleSearchClick}>🔍</button>
          <button className="header-button alert-button" onClick={handleAlertClick}>🔔</button>
        </div>
      </header>

      <div className="category-bar">
        {/* ... 카테고리 버튼 ... */}
      </div>

      <main className="home-main">
        {loading && <p>로딩 중...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && <ProductList products={products} />} {/* ProductList에 props 전달 */}
        <button onClick={() => navigate('/post')} className="write-button">글쓰기</button>
      </main>
    </div>
  );
}

export default HomePage;