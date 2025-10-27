// src/api/index.js
import axios from 'axios';

// 백엔드 서버 주소 (로컬에서 실행 시 보통 8080 포트)
// 나중에 실제 서버에 배포하면 주소를 바꿔야 해.
const API_BASE_URL = 'http://localhost:8080'; // <-- 백엔드 서버 주소 확인 필요!

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 모든 요청 헤더에 JWT 토큰 추가
api.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰 가져오기
    const token = localStorage.getItem('accessToken');
    if (token) {
      // 헤더에 Bearer 토큰 추가
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (옵션): 토큰 만료 시 리프레시 토큰으로 재발급 로직 추가 가능
// api.interceptors.response.use(...)

export default api;