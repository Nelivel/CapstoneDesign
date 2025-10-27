// src/pages/KioskHomePage.jsx
import React from 'react';
// import { useNavigation } from '../context/NavigationContext'; // 사용 안 함
import { useNavigate } from 'react-router-dom'; // react-router-dom의 useNavigate 사용
import './KioskPage.css'; // 아래 공통 CSS 파일 필요

function KioskHomePage() {
  // const { navigate } = useNavigation(); // Context 대신 react-router-dom 사용
  const navigate = useNavigate();

  return (
    <div className="kiosk-page home"> {/* home 클래스 추가 */}
      <header className="kiosk-header">
        <h1>신한대학교 중고거래 보관함</h1>
        {/* 부제나 로고 이미지 추가 가능 */}
      </header>
      <main className="kiosk-main home-main"> {/* home-main 클래스 추가 */}
        <button
          className="kiosk-button deposit-button" // 클래스 추가
          onClick={() => navigate('/kiosk/scan/deposit')} // 'deposit' 모드로 스캔 페이지 이동
        >
          <span className="kiosk-icon">📥</span>
          물품 보관하기
          <span className="kiosk-subtext">(판매자용)</span>
        </button>
        <button
          className="kiosk-button retrieve-button" // 클래스 추가
          onClick={() => navigate('/kiosk/scan/retrieve')} // 'retrieve' 모드로 스캔 페이지 이동
        >
          <span className="kiosk-icon">📤</span>
          물품 찾기
          <span className="kiosk-subtext">(구매자용)</span>
        </button>
      </main>
      <footer className="kiosk-footer">
          {/* 하단 안내 문구 등 추가 가능 */}
          <p>문의: 031-123-4567</p>
      </footer>
    </div>
  );
}
export default KioskHomePage;