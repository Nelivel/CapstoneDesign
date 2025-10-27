// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './index.css';
import { AnimatePresence } from 'framer-motion';
import { NavigationProvider } from './context/NavigationContext';
import { GlobalProvider } from './context/GlobalContext'; // 1. 임포트

import AnimatedPage from './components/AnimatedPage';
import BottomNavBar from './components/BottomNavBar';
import SellHistoryPage from './pages/SellHistoryPage';
import BuyHistoryPage from './pages/BuyHistoryPage';
import ReputationPage from './pages/ReputationPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductPostPage from './pages/ProductPostPage';
import MyPage from './pages/MyPage';
import FavoriteProductsPage from './pages/FavoriteProductsPage';
import ChatListPage from './pages/ChatListPage';
import ChatRoomPage from './pages/ChatRoomPage';
import TimetableManagePage from './pages/TimetableManagePage';
import TimetableDisplayPage from './pages/TimetableDisplayPage';

function App() {
  const location = useLocation();

  // 하단 네비게이션 바를 표시할 경로 목록
  const showNavBarRoutes = ['/', '/chat', '/favorites', '/mypage'];
  const shouldShowNavBar = showNavBarRoutes.includes(location.pathname);

  return (
    <div className="app-container" style={{display: 'flex', flexDirection: 'column'}}>
      <main style={{flex: 1, position: 'relative'}}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            
            <Route path="/" element={<AnimatedPage><HomePage /></AnimatedPage>} />
            <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
            <Route path="/signup" element={<AnimatedPage><SignUpPage /></AnimatedPage>} />
            <Route path="/product/:productId" element={<AnimatedPage><ProductDetailPage /></AnimatedPage>} />
            <Route path="/post" element={<AnimatedPage><ProductPostPage /></AnimatedPage>} />
            <Route path="/favorites" element={<AnimatedPage><FavoriteProductsPage /></AnimatedPage>} />
            <Route path="/mypage" element={<AnimatedPage><MyPage /></AnimatedPage>} />
            <Route path="/timetable" element={<AnimatedPage><TimetableDisplayPage /></AnimatedPage>} />
            <Route path="/timetable/manage" element={<AnimatedPage><TimetableManagePage /></AnimatedPage>} />
            <Route path="/chat" element={<AnimatedPage><ChatListPage /></AnimatedPage>} />
            <Route path="/chat/:chatId" element={<AnimatedPage><ChatRoomPage /></AnimatedPage>} />
            <Route path="/history/sell" element={<AnimatedPage><SellHistoryPage /></AnimatedPage>} />
            <Route path="/history/buy" element={<AnimatedPage><BuyHistoryPage /></AnimatedPage>} />
            <Route path="/reputation" element={<AnimatedPage><ReputationPage /></AnimatedPage>} />
            <Route path="/settings/account" element={<AnimatedPage><AccountSettingsPage /></AnimatedPage>} />

          </Routes>
        </AnimatePresence>
      </main>
      {/* 조건부로 BottomNavBar 렌더링 */}
      {shouldShowNavBar && <BottomNavBar />}
    </div>
  );
}

// 2. AppWrapper 수정
function AppWrapper() {
  return (
    <BrowserRouter>
      <GlobalProvider> {/* 3. NavigationProvider를 감싸기 */}
        <NavigationProvider>
          <App />
        </NavigationProvider>
      </GlobalProvider>
    </BrowserRouter>
  );
}

export default AppWrapper;