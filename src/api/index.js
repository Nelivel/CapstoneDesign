// src/api/index.js
import axios from 'axios';

// 백엔드 서버 주소: .env(.local)에서 주입, 없으면 기본값
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 세션 쿠키를 사용하기 위해 withCredentials 활성화
  withCredentials: true,
});

// 요청 인터셉터: 세션 기반 인증을 사용하므로 토큰 추가 불필요
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 인증 실패 시 로그인 페이지로 리다이렉트
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // 세션 만료나 인증 실패 시 로그인 페이지로 이동
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // 로그인 페이지로 리다이렉트 (필요시 구현)
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;