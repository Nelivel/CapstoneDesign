// src/pages/AuthPage.jsx
import React from 'react';

function AuthPage() {
  // 최소한의 인라인 스타일로 뼈대만 잡습니다.
  const containerStyle = {
    maxWidth: '400px',
    margin: '20px auto',
    padding: '20px',
    border: '1px solid #ccc',
    textAlign: 'center'
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px', // 각 요소 사이의 간격
    marginBottom: '30px'
  };

  const inputStyle = {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px'
  };

  const buttonStyle = {
    padding: '10px',
    backgroundColor: 'lightblue',
    border: '1px solid blue',
    borderRadius: '5px',
    cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      {/* 로그인 폼 영역 */}
      <div style={formStyle}>
        <h2>로그인</h2>
        <input style={inputStyle} type="email" placeholder="학교 웹메일 주소" />
        <input style={inputStyle} type="password" placeholder="비밀번호" />
        <button style={buttonStyle}>로그인</button>
      </div>

      {/* 회원가입 폼 영역 */}
      <div style={formStyle}>
        <h2>회원가입</h2>
        <input style={inputStyle} type="email" placeholder="학교 웹메일 주소" />
        <input style={inputStyle} type="text" placeholder="이름" />
        <input style={inputStyle} type="password" placeholder="비밀번호" />
        <input style={inputStyle} type="password" placeholder="비밀번호 확인" />
        <button style={buttonStyle}>회원가입</button>
      </div>
    </div>
  );
}

export default AuthPage;