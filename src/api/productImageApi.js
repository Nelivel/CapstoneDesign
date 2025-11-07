// src/api/productImageApi.js
import api from './index';

/**
 * 상품 이미지 업로드
 * @param {number} productId - 상품 ID
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise<string>} - 업로드된 이미지 URL
 */
export const uploadProductImage = async (productId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/product/${productId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  } catch (error) {
    console.error('Upload Product Image API error:', error.response?.data || error.message);
    throw error;
  }
};

