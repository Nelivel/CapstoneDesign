// src/components/ProductList.jsx
import React from 'react';
import ProductCard from './ProductCard';
import { MOCK_PRODUCTS } from '../mock-products';

function ProductList() {
  return (
    <div style={{ width: '90%', margin: '20px auto' }}>
      {MOCK_PRODUCTS.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductList;