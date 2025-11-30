// src/pages/ProductPostPage.jsx
import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import './ProductPostPage.css'; // CSS 파일 임포트 확인

function ProductPostPage() {
  const { navigate } = useNavigation();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = { title, category, price, description };
    console.log('제출된 상품 정보:', formData);
    alert('상품이 등록되었습니다! (콘솔 확인)');
    navigate('/');
  };

  return (
    <div className="post-page">
      <header className="post-header">
        <button onClick={() => navigate('/')} className="back-button" style={{position: 'static', fontSize: '1.2em'}}>{'<'}</button>
        <h2 className="post-header-title">판매 상품 등록</h2>
      </header>
      <main className="post-main">
        <form onSubmit={handleSubmit} className="post-form">
          {/* 이미지 등록 (수정된 부분) */}
          <div className="form-group">
            <label>상품 이미지</label>
            <div className="image-placeholder"> {/* 인라인 스타일을 클래스로 교체 */}
              + 이미지 추가 (기능 준비 중)
            </div>
          </div>

          {/* 제목 */}
          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input
              id="title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="상품 제목을 입력해주세요"
              required
            />
          </div>

          {/* 카테고리 */}
          <div className="form-group">
            <label htmlFor="category">카테고리</label>
            <select
              id="category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>카테고리를 선택하세요</option>
              <option value="교재">교재</option>
              <option value="전자기기">전자기기</option>
              <option value="생활용품">생활용품</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {/* 가격 */}
          <div className="form-group">
            <label htmlFor="price">가격</label>
            <input
              id="price"
              type="number"
              className="form-input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="가격을 입력해주세요 (숫자만)"
              required
            />
          </div>

          {/* 상세 설명 */}
          <div className="form-group">
            <label htmlFor="description">상세 설명</label>
            <textarea
              id="description"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상품에 대한 상세한 설명을 작성해주세요."
              required
            />
          </div>

          <button type="submit" className="submit-button">상품 등록하기</button>
        </form>
      </main>
    </div>
  );
}

export default ProductPostPage;