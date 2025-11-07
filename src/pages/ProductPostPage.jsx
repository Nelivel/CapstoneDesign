// src/pages/ProductPostPage.jsx
import React, { useState, useRef } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { createProduct } from '../api/productApi';
import { uploadProductImage } from '../api/productImageApi';
import './ProductPostPage.css';

function ProductPostPage() {
  const { navigate } = useNavigation();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('IN_PERSON');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB 제한
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. 상품 생성
      const productData = {
        productName: title,
        category: category,
        productPrice: Number(price),
        productDescription: description,
        status: 'selling',
        location: location,
      };

      const createdProduct = await createProduct(productData);
      
      // 2. 이미지 업로드 (이미지가 있는 경우)
      if (imageFile && createdProduct.id) {
        try {
          const imageUrl = await uploadProductImage(createdProduct.id, imageFile);
          console.log('이미지 업로드 완료:', imageUrl);
        } catch (imgErr) {
          console.error('이미지 업로드 실패:', imgErr);
          // 이미지 업로드 실패해도 상품은 등록됨
        }
      }

      alert('상품이 성공적으로 등록되었습니다!');
      navigate('/'); // 등록 후 홈으로 이동
    } catch (err) {
      setError(err.response?.data?.message || '상품 등록 중 오류가 발생했습니다.');
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
          {/* 이미지 등록 */}
          <div className="form-group">
            <label>상품 이미지</label>
            {imagePreview ? (
              <div className="image-preview-container">
                <img src={imagePreview} alt="미리보기" className="image-preview" />
                <button type="button" onClick={handleRemoveImage} className="remove-image-btn">×</button>
              </div>
            ) : (
              <div 
                className="image-placeholder"
                onClick={() => fileInputRef.current?.click()}
                style={{cursor: 'pointer'}}
              >
                <span style={{fontSize: '2em'}}>📷</span>
                <span>이미지 추가하기</span>
                <span style={{fontSize: '0.9em', color: '#999'}}>(선택사항)</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{display: 'none'}}
            />
          </div>

          {/* 제목 */}
          <div className="form-group">
            <label htmlFor="title">제목 *</label>
            <input
              id="title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="상품 제목을 입력하세요"
              required
              maxLength={50}
            />
          </div>

          {/* 카테고리 */}
          <div className="form-group">
            <label htmlFor="category">카테고리 *</label>
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
              <option value="패션">패션</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {/* 가격 */}
          <div className="form-group">
            <label htmlFor="price">가격 *</label>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <input
                id="price"
                type="number"
                className="form-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                required
                min="0"
                style={{flex: 1}}
              />
              <span style={{fontSize: '1em', color: '#666'}}>원</span>
            </div>
          </div>

          {/* 거래 방식 */}
          <div className="form-group">
            <label>거래 방식 *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="location"
                  value="IN_PERSON"
                  checked={location === 'IN_PERSON'}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <span>대면 거래</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="location"
                  value="NONE_PERSON"
                  checked={location === 'NONE_PERSON'}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <span>비대면 거래</span>
              </label>
            </div>
          </div>

          {/* 상세 설명 */}
          <div className="form-group">
            <label htmlFor="description">상세 설명 *</label>
            <textarea
              id="description"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상품의 상태, 거래 가능 시간 등을 자세히 적어주세요"
              required
              rows={6}
              maxLength={1000}
            />
            <div style={{textAlign: 'right', fontSize: '0.85em', color: '#999', marginTop: '4px'}}>
              {description.length}/1000
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="submit-button" disabled={loading || !title || !category || !price || !description}>
            {loading ? '등록 중...' : '상품 등록하기'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default ProductPostPage;
