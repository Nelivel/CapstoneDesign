// src/components/ProductList.jsx
import React from 'react';
import ProductCard from './ProductCard';
// import { useGlobalData } from '../context/GlobalContext'; // 제거

function ProductList({ products, currentUser, onHide, onDelete, onEdit, onReport, reportedProductIds }) { // props로 products 받기
  // const { products } = useGlobalData(); // 제거

  return (
    <div style={{ width: '100%', margin: '20px 0' }}> {/* 너비/마진 조정 */}
      {products && products.length > 0 ? (
        products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            currentUser={currentUser}
            onHide={onHide}
            onDelete={onDelete}
            onEdit={onEdit}
            onReport={onReport}
            reportedProductIds={reportedProductIds}
          />
        ))
      ) : (
        <p>등록된 상품이 없습니다.</p> // 상품 없을 때 메시지
      )}
    </div>
  );
}

export default ProductList;