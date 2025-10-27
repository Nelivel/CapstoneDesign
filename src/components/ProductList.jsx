// src/components/ProductList.jsx
import React from 'react';
import ProductCard from './ProductCard';
import { useGlobalData } from '../context/GlobalContext'; // 1. 임포트

function ProductList() {
  const { products } = useGlobalData(); // 2. 컨텍스트에서 상품 목록 가져오기

  return (
    <div style={{ width: '90%', margin: '20px auto' }}>
      {/* 3. 컨텍스트의 products 사용 */}
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductList;