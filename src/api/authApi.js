// src/api/authApi.js
import api from './index';

/**
 * 로그인 요청
 * @param {string} username - 사용자 이름 (백엔드에서는 이메일)
 * @param {string} password - 비밀번호
 * @returns {Promise<object>} - { accessToken, refreshToken }
 */
export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response.data; // { accessToken, refreshToken }
  } catch (error) {
    console.error('Login API error:', error.response?.data || error.message);
    throw error; // 에러를 다시 던져서 컴포넌트에서 처리하도록 함
  }
};

/**
 * 회원가입 요청
 * @param {string} username - 사용자 이름 (백엔드에서는 이메일)
 * @param {string} password - 비밀번호
 * @// TODO: 백엔드 User 엔티티에 맞춰 추가 필드 필요 (major, grade, school_number, gender 등)
 * @returns {Promise<object>} - { username }
 */
export const signup = async (username, password /*, 다른 필드들 */) => {
  try {
    // TODO: 백엔드 signup API request body 확인 필요 (LoginRequestDto 외 추가 정보 필요할 수 있음)
    const response = await api.post('/auth/signup', { username, password /*, 다른 필드들 */ });
    return response.data; // { username }
  } catch (error) {
    console.error('Signup API error:', error.response?.data || error.message);
    throw error;
  }
};