// src/context/GlobalContext.jsx
import React, { createContext, useContext, useReducer } from 'react';
import { INITIAL_PRODUCTS } from '../data/products';
import { MOCK_USERS } from '../data/users';

// 1. 초기 상태 정의
const initialState = {
  // 현재 로그인한 사용자 (시뮬레이션)
  user: MOCK_USERS['me'], 
  // 전체 상품 목록
  products: INITIAL_PRODUCTS,
  // 관심 상품 ID 목록 (Set으로 관리하면 중복 없고 빠름)
  favorites: new Set([1, 5]), // 1번, 5번 상품을 기본 관심상품으로 설정
};

// 2. 액션 타입 정의
const Action = {
  ADD_PRODUCT: 'ADD_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  TOGGLE_FAVORITE: 'TOGGLE_FAVORITE',
};

// 3. 리듀서 함수
function globalReducer(state, action) {
  switch (action.type) {
    // 새 상품 추가 (ProductPostPage)
    case Action.ADD_PRODUCT:
      return {
        ...state,
        products: [action.payload, ...state.products],
      };

    // 상품 정보 업데이트 (가격/상태 변경)
    case Action.UPDATE_PRODUCT:
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.data } : p
        ),
      };

    // 관심 목록 토글
    case Action.TOGGLE_FAVORITE:
      const newFavorites = new Set(state.favorites);
      if (newFavorites.has(action.payload.id)) {
        newFavorites.delete(action.payload.id);
      } else {
        newFavorites.add(action.payload.id);
      }
      return {
        ...state,
        favorites: newFavorites,
      };

    default:
      return state;
  }
}

// 4. 컨텍스트 생성
const GlobalContext = createContext();

// 5. Provider 컴포넌트
export function GlobalProvider({ children }) {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  // 컴포넌트에게 전달할 값
  const value = {
    // 상태
    user: state.user,
    products: state.products,
    favorites: state.favorites,

    // 액션을 실행할 함수 (디스패처)
    addProduct: (productData) => {
      // 새 상품에 ID 할당 (임시) 및 판매자 정보 추가
      const newProduct = { 
        ...productData, 
        id: Date.now(), 
        nickname: state.user.nickname, // 판매자를 현재 유저 닉네임으로
        sellerNickname: state.user.nickname, // 판매자 닉네임
        sellerHasTimetable: !!state.user.timetable, // 시간표 유무
        imageUrl: "https://via.placeholder.com/150", // 임시 이미지
      };
      dispatch({ type: Action.ADD_PRODUCT, payload: newProduct });
    },
    
    updateProduct: (id, data) => {
      // data 예: { price: 12000 } 또는 { status: 'reserved' }
      dispatch({ type: Action.UPDATE_PRODUCT, payload: { id, data } });
    },
    
    toggleFavorite: (id) => {
      dispatch({ type: Action.TOGGLE_FAVORITE, payload: { id } });
    },
  };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

// 6. 사용하기 쉬운 커스텀 훅
export const useGlobalData = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalData must be used within a GlobalProvider');
  }
  return context;
};