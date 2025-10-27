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
        // 백엔드 ProductResponse -> 프론트엔드 Product 형태로 변환 필요
        const formattedProducts = data.map(mapBackendProductToFrontend);
        setProducts(formattedProducts);
      } catch (err) {
        setError('상품 목록을 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // 빈 배열: 마운트 시 한 번만 실행

  // --- 백엔드 응답 -> 프론트엔드 데이터 구조 변환 함수 ---
  // ProductResponse.java 와 프론트엔드 product 객체 구조 비교하여 작성
  const mapBackendProductToFrontend = (backendProduct) => {
    return {
      id: backendProduct.id,
      // sellerNickname: backendProduct.user?.username, // 백엔드 Product 엔티티에 User 정보 포함 필요
      sellerNickname: backendProduct.nickname || 'Unknown Seller', // 임시: 백엔드 응답에 nickname 필요
      sellerHasTimetable: true, // TODO: 백엔드 User 정보에서 가져오도록 수정 필요
      imageUrl: "https://via.placeholder.com/150", // TODO: 백엔드에서 이미지 URL 받아오도록 수정 필요
      title: backendProduct.productName,
      nickname: backendProduct.nickname || 'Unknown Seller', // 임시
      description: backendProduct.productDescription,
      price: backendProduct.productPrice,
      status: mapBackendStatusToFrontend(backendProduct.status), // Enum -> 문자열 변환
      category: mapBackendCategoryToFrontend(backendProduct.category), // Enum -> 문자열 변환
      createdAt: backendProduct.createdAt, // ISO 문자열 유지
      viewCount: backendProduct.viewCount,
      // location: backendProduct.location, // 필요시 추가
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