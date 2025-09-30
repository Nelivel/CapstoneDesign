// src/context/NavigationContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { useNavigate as useReactRouterNavigate, useLocation } from 'react-router-dom';

const NavigationContext = createContext();

// 페이지 깊이를 정의합니다.
const pageDepths = {
  '/': 0,
  '/chat': 0,
  '/favorites': 0,
  '/mypage': 0,
  '/login': 1,
  '/signup': 2,
  '/timetable': 2,
  '/post': 2,
  '/product': 3,
  '/chat/': 4,
};

// 하단 탭의 순서를 정의합니다.
const navBarOrder = ['/', '/chat', '/favorites', '/mypage'];

// 경로의 기본 형태를 반환하는 함수
const getBasePath = (path) => {
  if (path.startsWith('/product/')) return '/product';
  if (path.startsWith('/chat/')) return '/chat/';
  return path;
};

export const NavigationProvider = ({ children }) => {
  const [direction, setDirection] = useState('forward');
  const reactRouterNavigate = useReactRouterNavigate();
  const location = useLocation();

  const navigate = (to) => {
    const fromPath = getBasePath(location.pathname);
    const toPath = getBasePath(to);

    const fromDepth = pageDepths[fromPath] ?? 0;
    const toDepth = pageDepths[toPath] ?? 0;

    if (toDepth > fromDepth) {
      setDirection('forward');
    } else if (toDepth < fromDepth) {
      setDirection('backward');
    } else { // 같은 깊이일 때 (하단 네비게이션 탭 간 이동)
      const fromIndex = navBarOrder.indexOf(fromPath);
      const toIndex = navBarOrder.indexOf(toPath);
      setDirection(toIndex > fromIndex ? 'forward' : 'backward');
    }
    reactRouterNavigate(to);
  };

  return (
    <NavigationContext.Provider value={{ direction, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);