// src/pages/ProductPostPage.jsx
import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
// import { useGlobalData } from '../context/GlobalContext'; // 제거
import { createProduct } from '../api/productApi'; // API 함수 임포트
import './ProductPostPage.css';

function ProductPostPage() {
  const { navigate } = useNavigation();
  // const { addProduct } = useGlobalData(); // 제거

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(''); // 프론트엔드 카테고리 값
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // TODO: 백엔드 Location Enum에 맞춰 거래 위치 선택 UI 추가 필요
  // const [location, setLocation] = useState('IN_PERSON'); // 예시: 기본값 대면

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // API로 보낼 데이터 준비 (ProductCreateRequest 형태)
      const productData = {
        productName: title,
        category: category, // API 함수 내부에서 백엔드 Enum으로 변환됨
        productPrice: Number(price),
        productDescription: description,
        status: 'selling', // 상품 등록 시 기본 상태 'selling' -> 'ON_SALE'로 변환됨
        location: 'IN_PERSON', // TODO: 사용자 선택값 반영 필요
      };

      await createProduct(productData);

      alert('상품이 성공적으로 등록되었습니다!');
      navigate('/'); // 등록 후 홈으로 이동
    } catch (err) {
      setError('상품 등록 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-page">
      <header className="post-header">
        <button onClick={() => navigate('/')} className="back-button" style={{position: 'static', fontSize: '1.2em'}}>{'<'}</button>
        <h2 className="post-header-title">판매 상품 등록</h2>
      </header>
      <main className="post-main">
        <form onSubmit={handleSubmit} className="post-form">
          {/* ... (이미지, 제목, 카테고리, 가격, 설명 입력 필드는 기존과 동일) ... */}
           {/* 이미지 등록 */}
           <div className="form-group">
            <label>상품 이미지</label>
            <div className="image-placeholder">
              + 이미지 추가 (기능 준비 중)
            </div>
            {/* TODO: 이미지 업로드 기능 구현 (백엔드와 협의 필요) */}
          </div>

          {/* 제목 */}
          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input
              id="title" type="text" className="form-input" value={title}
              onChange={(e) => setTitle(e.target.value)} placeholder="상품 제목" required
            />
          </div>

          {/* 카테고리 */}
          <div className="form-group">
            <label htmlFor="category">카테고리</label>
            <select
              id="category" className="form-select" value={category}
              onChange={(e) => setCategory(e.target.value)} required
            >
              <option value="" disabled>선택하세요</option>
              <option value="교재">교재</option>
              <option value="전자기기">전자기기</option>
              <option value="생활용품">생활용품</option>
              <option value="패션">패션</option> {/* 백엔드 Category Enum과 매칭 필요 */}
              <option value="기타">기타</option>
            </select>
          </div>

          {/* 가격 */}
          <div className="form-group">
            <label htmlFor="price">가격</label>
            <input
              id="price" type="number" className="form-input" value={price}
              onChange={(e) => setPrice(e.target.value)} placeholder="가격 (숫자만)" required min="0"
            />
          </div>

           {/* TODO: 거래 희망 위치 선택 UI 추가 (백엔드 Location Enum 참고) */}
           {/* 예시: 라디오 버튼
           <div className="form-group">
             <label>거래 방식</label>
             <div>
               <label><input type="radio" name="location" value="IN_PERSON" checked={location === 'IN_PERSON'} onChange={(e) => setLocation(e.target.value)} /> 대면 거래</label>
               <label><input type="radio" name="location" value="NONE_PERSON" checked={location === 'NONE_PERSON'} onChange={(e) => setLocation(e.target.value)} /> 비대면 거래</label>
             </div>
           </div>
           */}

          {/* 상세 설명 */}
          <div className="form-group">
            <label htmlFor="description">상세 설명</label>
            <textarea
              id="description" className="form-textarea" value={description}
              onChange={(e) => setDescription(e.target.value)} placeholder="상품 설명" required
            />
          </div>

          {error && <p className="error-message">{error}</p>} {/* 에러 메시지 표시 */}
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? '등록 중...' : '상품 등록하기'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default ProductPostPage;