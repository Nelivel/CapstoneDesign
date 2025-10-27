// src/api/productApi.js
import api from './index';

/**
 * 전체 상품 목록 조회
 * @returns {Promise<Array<object>>} - 상품 목록 (ProductResponse 형태)
 */
export const getProducts = async () => {
  try {
    const response = await api.get('/product');
    // TODO: 백엔드 응답 데이터 구조 확인 필요 (ProductResponse[])
    return response.data;
  } catch (error) {
    console.error('Get Products API error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 특정 ID 상품 조회
 * @param {number} id - 상품 ID
 * @returns {Promise<object>} - 상품 상세 정보 (ProductResponse 형태)
 */
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/product/${id}`);
    // TODO: 백엔드 응답 데이터 구조 확인 필요 (ProductResponse)
    return response.data;
  } catch (error) {
    console.error(`Get Product (ID: ${id}) API error:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 상품 생성
 * @param {object} productData - 상품 정보 (ProductCreateRequest 형태)
 * @param {string} productData.category - 카테고리 (백엔드 Category Enum과 매칭 필요)
 * @param {string} productData.productName - 상품명
 * @param {string} productData.productDescription - 상품 설명
 * @param {number} productData.productPrice - 상품 가격
 * @param {string} productData.status - 상태 (백엔드 Status Enum과 매칭 필요)
 * @param {string} productData.location - 거래 위치 (백엔드 Location Enum과 매칭 필요)
 * @returns {Promise<object>} - 생성된 상품 정보 (ProductResponse 형태)
 */
export const createProduct = async (productData) => {
  try {
    // 프론트엔드 카테고리/상태 값 -> 백엔드 Enum 값으로 변환 필요
    const backendData = {
      ...productData,
      category: mapFrontendCategoryToBackend(productData.category), // 변환 함수 필요
      status: mapFrontendStatusToBackend(productData.status),     // 변환 함수 필요
      location: mapFrontendLocationToBackend(productData.location), // 변환 함수 필요
    };
    const response = await api.post('/product', backendData);
    // TODO: 백엔드 응답 데이터 구조 확인 필요 (ProductResponse)
    return response.data;
  } catch (error) {
    console.error('Create Product API error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 상품 정보 수정
 * @param {number} id - 상품 ID
 * @param {object} productData - 수정할 상품 정보 (ProductUpdateRequest 형태)
 * @returns {Promise<object>} - 수정된 상품 정보 (ProductResponse 형태)
 */
export const updateProduct = async (id, productData) => {
  try {
    // 필요시 프론트엔드 값 -> 백엔드 Enum 값 변환
    const backendData = {
      ...productData,
      category: mapFrontendCategoryToBackend(productData.category),
      status: mapFrontendStatusToBackend(productData.status),
      location: mapFrontendLocationToBackend(productData.location),
    };
    const response = await api.put(`/product/${id}`, backendData);
    // TODO: 백엔드 응답 데이터 구조 확인 필요 (ProductResponse)
    return response.data;
  } catch (error) {
    console.error(`Update Product (ID: ${id}) API error:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 상품 삭제 (Soft Delete)
 * @param {number} id - 상품 ID
 * @returns {Promise<void>}
 */
export const deleteProduct = async (id) => {
  try {
    // Soft delete는 PUT 요청 사용
    await api.put(`/product/${id}/soft`);
  } catch (error) {
    console.error(`Delete Product (ID: ${id}) API error:`, error.response?.data || error.message);
    throw error;
  }
};

// --- Helper Functions (프론트 <-> 백엔드 Enum 매핑) ---
// 실제 값에 맞게 수정 필요!

function mapFrontendCategoryToBackend(frontendCategory) {
  // 예시: 프론트 '교재' -> 백엔드 'BOOKS'
  switch (frontendCategory) {
    case '교재': return 'BOOKS';
    case '전자기기': return 'ELECTRONICS';
    case '생활용품': return 'DAILY_SUPPLIES';
    case '패션': return 'FASHION'; // 백엔드 Category Enum에 FASHION 추가 필요
    default: return 'ETC';
  }
}

function mapFrontendStatusToBackend(frontendStatus) {
  // 예시: 프론트 'selling' -> 백엔드 'ON_SALE'
  switch (frontendStatus) {
    case 'selling': return 'ON_SALE';
    case 'reserved': return 'RESERVED';
    case 'sold': return 'SOLD_OUT';
    default: return 'ON_SALE'; // 기본값
  }
}

// 이 함수는 현재 프론트엔드에서 location을 직접 관리하지 않으므로,
// 상품 등록/수정 시 고정값이나 사용자 선택값을 받아서 처리해야 함.
function mapFrontendLocationToBackend(frontendLocation) {
  // 예시: 상품 등록 시 '대면 거래'를 기본값으로 사용
  // return frontendLocation === '대면' ? 'IN_PERSON' : 'NONE_PERSON';
  return 'IN_PERSON'; // 임시 기본값
}

// 백엔드 Enum -> 프론트엔드 문자열 변환 함수도 필요할 수 있음
// export function mapBackendCategoryToFrontend(backendCategory) { ... }
// export function mapBackendStatusToFrontend(backendStatus) { ... }