// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './index.css';
import { AnimatePresence } from 'framer-motion';
import { NavigationProvider } from './context/NavigationContext';
import { GlobalProvider } from './context/GlobalContext';

// 컴포넌트 임포트
import AnimatedPage from './components/AnimatedPage';
import BottomNavBar from './components/BottomNavBar';
// 페이지 임포트 (기존 + 신규 키오스크 페이지)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductPostPage from './pages/ProductPostPage';
import FavoriteProductsPage from './pages/FavoriteProductsPage';
import MyPage from './pages/MyPage';
import TimetableDisplayPage from './pages/TimetableDisplayPage';
import TimetableManagePage from './pages/TimetableManagePage';
import ChatListPage from './pages/ChatListPage';
import ChatRoomPage from './pages/ChatRoomPage';
import SellHistoryPage from './pages/SellHistoryPage';
import BuyHistoryPage from './pages/BuyHistoryPage';
import ReputationPage from './pages/ReputationPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import KioskHomePage from './pages/KioskHomePage'; // 키오스크 홈
import KioskScanPage from './pages/KioskScanPage'; // 키오스크 스캔

function App() {
  const location = useLocation();

  // 하단 네비게이션 바 표시 경로
  const showNavBarRoutes = ['/', '/chat', '/favorites', '/mypage'];
  // 현재 경로가 키오스크 관련 경로인지 확인
  const isKioskRoute = location.pathname.startsWith('/kiosk');
  // 네비게이션 바 표시 여부 결정
  const shouldShowNavBar = showNavBarRoutes.includes(location.pathname) && !isKioskRoute;

  // app-container 스타일 (키오스크 모드 구분)
  const appContainerStyle = isKioskRoute ? {
    maxWidth: '100%', // 키오스크는 전체 너비 사용
    minHeight: '100vh',
    margin: '0 auto',
    backgroundColor: '#fff',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'none', // 그림자 제거
  } : {
    maxWidth: '400px', // 모바일 뷰 기본 너비
    minHeight: '100vh',
    margin: '0 auto',
    backgroundColor: '#fff',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div className="app-container" style={{...appContainerStyle, display: 'flex', flexDirection: 'column'}}>
      <main style={{flex: 1, position: 'relative'}}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>

            {/* --- 기존 라우트 --- */}
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

            {/* --- 키오스크 라우트 (신규) --- */}
            {/* 키오스크 페이지는 AnimatedPage를 사용하지 않음 (전체 화면 전환) */}
            <Route path="/kiosk" element={<KioskHomePage />} />
            {/* mode 파라미터: 'deposit'(보관) 또는 'retrieve'(찾기) */}
            <Route path="/kiosk/scan/:mode" element={<KioskScanPage />} />

          </Routes>
        </AnimatePresence>
      </main>
      {/* 조건부 하단 네비게이션 바 렌더링 */}
      {shouldShowNavBar && <BottomNavBar />}
    </div>
  );
}

// AppWrapper는 기존과 동일
function AppWrapper() {
  return (
    <BrowserRouter>
      <GlobalProvider>
        <NavigationProvider>
          <App />
        </NavigationProvider>
      </GlobalProvider>
    </BrowserRouter>
  );
}

export default AppWrapper;