// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './index.css';
import { AnimatePresence } from 'framer-motion';
// --- Provider 임포트 ---
import { NavigationProvider } from './context/NavigationContext'; // NavigationProvider 임포트
import { GlobalProvider } from './context/GlobalContext';       // GlobalProvider 임포트 (필요함)

// 컴포넌트 임포트
import AnimatedPage from './components/AnimatedPage';
import BottomNavBar from './components/BottomNavBar';
// 페이지 임포트
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
import KioskHomePage from './pages/KioskHomePage';
import KioskScanPage from './pages/KioskScanPage';

function App() {
  const location = useLocation();

  const showNavBarRoutes = ['/', '/chat', '/favorites', '/mypage'];
  const isKioskRoute = location.pathname.startsWith('/kiosk');
  const shouldShowNavBar = showNavBarRoutes.includes(location.pathname) && !isKioskRoute;

  const appContainerStyle = isKioskRoute ? { /* ... 키오스크 스타일 ... */
    maxWidth: '100%',
    minHeight: '100vh',
    margin: '0 auto',
    backgroundColor: '#fff',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'none',
  } : { /* ... 모바일 스타일 ... */
    maxWidth: '400px',
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
            {/* --- 라우트 설정은 동일 --- */}
            <Route path="/" element={<AnimatedPage><HomePage /></AnimatedPage>} />
            <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
            <Route path="/signup" element={<AnimatedPage><SignUpPage /></AnimatedPage>} />
            <Route path="/product/:id" element={<AnimatedPage><ProductDetailPage /></AnimatedPage>} />
            <Route path="/post" element={<AnimatedPage><ProductPostPage /></AnimatedPage>} />
            <Route path="/favorites" element={<AnimatedPage><FavoriteProductsPage /></AnimatedPage>} />
            <Route path="/mypage" element={<AnimatedPage><MyPage /></AnimatedPage>} />
            <Route path="/timetable" element={<AnimatedPage><TimetableDisplayPage /></AnimatedPage>} />
            <Route path="/timetable/manage" element={<AnimatedPage><TimetableManagePage /></AnimatedPage>} />
            <Route path="/chat" element={<AnimatedPage><ChatListPage /></AnimatedPage>} />
            <Route path="/chat/:id" element={<AnimatedPage><ChatRoomPage /></AnimatedPage>} />
            <Route path="/history/sell" element={<AnimatedPage><SellHistoryPage /></AnimatedPage>} />
            <Route path="/history/buy" element={<AnimatedPage><BuyHistoryPage /></AnimatedPage>} />
            <Route path="/reputation" element={<AnimatedPage><ReputationPage /></AnimatedPage>} />
            <Route path="/settings/account" element={<AnimatedPage><AccountSettingsPage /></AnimatedPage>} />
            
            <Route path="/kiosk" element={<KioskHomePage />} />
            <Route path="/kiosk/scan/:mode" element={<KioskScanPage />} />
          </Routes>
        </AnimatePresence>
      </main>
      {shouldShowNavBar && <BottomNavBar />}
    </div>
  );
}

// --- AppWrapper 수정: Provider 다시 추가 ---
function AppWrapper() {
  return (
    <BrowserRouter>
      <GlobalProvider> {/* GlobalProvider 추가 */}
        <NavigationProvider> {/* NavigationProvider 추가 */}
          <App />
        </NavigationProvider>
      </GlobalProvider>
    </BrowserRouter>
  );
}

export default AppWrapper;