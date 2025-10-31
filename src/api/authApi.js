// src/api/authApi.js
import api from './index';

/**
 * 로그인 요청
 * @param {string} username - 사용자 이름
 * @param {string} password - 비밀번호
 * @returns {Promise<object>} - { username, nickname, userId }
 */
export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response.data; // { username, nickname, userId }
  } catch (error) {
    console.error('Login API error:', error.response?.data || error.message);
    // 백엔드 에러 응답 처리
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    throw error;
  }
};

/**
 * 회원가입 요청
 * @param {string} username - 사용자 이름
 * @param {string} password - 비밀번호
 * @param {string} nickname - 닉네임
 * @returns {Promise<object>} - { username, nickname, userId }
 */
export const signup = async (username, password, nickname) => {
  try {
    const response = await api.post('/auth/signup', { username, password, nickname });
    return response.data; // { username, nickname, userId }
  } catch (error) {
    console.error('Signup API error:', error.response?.data || error.message);
    // 백엔드 에러 응답 처리
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    throw error;
  }
};