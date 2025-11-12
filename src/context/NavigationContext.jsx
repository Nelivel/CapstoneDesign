// src/context/NavigationContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { useNavigate as useReactRouterNavigate, useLocation } from 'react-router-dom';

const NavigationContext = createContext();

// 페이지의 '깊이'를 정의합니다. 숫자가 클수록 더 깊은 페이지입니다.
const pageDepths = {
  // Level 0: 하단 탭
  '/': 0,
  '/welcome': 0,
  '/home': 0,
  '/chat': 0,
  '/favorites': 0,
  '/mypage': 0,

  // Level 1: 탭에서 진입하는 첫 페이지들
  '/login': 1,
  '/post': 1,
  '/product': 1, // /product/:id
  '/chat/': 1,    // /chat/:id

  // Level 2: 더 깊은 페이지들
  '/signup': 2,
  '/timetable/manage': 2, // '관리' 페이지의 깊이를 2로 설정
  '/timetable': 3,        // '보기' 페이지의 깊이를 3으로 설정 (더 깊게)

  // Level 3: 마이페이지 내부 메뉴들
  '/history/sell': 3,
  '/history/buy': 3,
  '/reputation': 3,
  '/settings/account': 3,
  
  '/admin': 3,
  '/admin/users': 4, // 사용자 관리 페이지 깊이 추가
  '/admin/posts': 4,   // 게시글 관리 깊이 추가
  '/admin/reports': 4, // 신고 관리 깊이 추가
  
};

// 하단 탭의 순서
const navBarOrder = ['/home', '/chat', '/favorites', '/mypage'];

// 경로의 기본 형태를 반환하는 함수 (예: '/product/1' -> '/product')
const getBasePath = (path) => {
  if (path.startsWith('/product/')) return '/product';
  if (path.startsWith('/chat/')) return '/chat/';
  if (path === '/') return '/welcome';
  return path;
};

export const NavigationProvider = ({ children }) => {
  const [direction, setDirection] = useState('forward');
  const reactRouterNavigate = useReactRouterNavigate();
  const location = useLocation();

  const navigate = (to, options = {}) => {
    const fromPath = getBasePath(location.pathname);
    const toPath = getBasePath(to);

    const fromDepth = pageDepths[fromPath] ?? 0;
    const toDepth = pageDepths[toPath] ?? 0;

    if (toDepth > fromDepth) {
      setDirection('forward'); // 더 깊은 페이지로 가면 '앞으로'
    } else if (toDepth < fromDepth) {
      setDirection('backward'); // 더 얕은 페이지로 가면 '뒤로'
    } else { // 같은 깊이일 때 (하단 네비게이션 탭 간 이동)
      const fromIndex = navBarOrder.indexOf(fromPath);
      const toIndex = navBarOrder.indexOf(toPath);
      if (fromIndex !== -1 && toIndex !== -1) {
        setDirection(toIndex > fromIndex ? 'forward' : 'backward');
      } else {
        setDirection('forward'); // 그 외 같은 깊이 이동은 '앞으로'
      }
    }
    // react-router-dom의 navigate는 두 번째 인자로 옵션 객체를 받을 수 있음
    reactRouterNavigate(to, options);
  };

  return (
    <NavigationContext.Provider value={{ direction, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);