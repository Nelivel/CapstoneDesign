import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import './WelcomePage.css';

function WelcomePage() {
  const { navigate } = useNavigation();

  return (
    <div className="welcome-page">
      <div className="welcome-background">
        <div className="welcome-orb orb-1" />
        <div className="welcome-orb orb-2" />
        <div className="welcome-orb orb-3" />
        <div className="grid-lines" />
      </div>

      <div className="welcome-content">
        <div className="logo-sequence">
          <div className="logo-ring" />
          <div className="logo-title">
            <span className="spark" />
            <span className="word main">DeskClean</span>
            <span className="word sub">Campus Marketplace</span>
          </div>
        </div>

        <p className="welcome-tagline">
          정돈된 캠퍼스 거래, '책상정리(DeskClean)'!
          <br />
          <br /> 안전한 직거래와 비대면 키오스크까지
          <br /> 한 번에!
        </p>

        <div className="welcome-actions">
          <button className="cta-button primary" onClick={() => navigate('/login')}>
            로그인하기
          </button>
          <button className="cta-button secondary" onClick={() => navigate('/signup')}>
            회원가입하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
