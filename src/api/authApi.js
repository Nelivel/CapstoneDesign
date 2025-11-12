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
 * @param {string} email - 이메일 주소
 * @returns {Promise<object>} - 응답 메시지
 */
export const signup = async (username, password, nickname, email) => {
  try {
    const response = await api.post('/auth/signup', { username, password, nickname, email });
    return response.data; // 응답 메시지
  } catch (error) {
    console.error('Signup API error:', error.response?.data || error.message);
    // 백엔드 에러 응답 처리
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    throw error;
  }
};

/**
 * 이메일 인증 링크 재전송
 * @param {string} email - 이메일 주소
 * @returns {Promise<object>} - 응답 메시지
 */
export const resendVerificationEmail = async (email) => {
  try {
    const response = await api.post('/auth/resend-verification', null, {
      params: { email }
    });
    return response.data;
  } catch (error) {
    console.error('Resend verification API error:', error.response?.data || error.message);
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    throw error;
  }
};

/**
 * 학교 이메일 인증 요청
 */
export const requestSchoolVerification = async (schoolEmail) => {
  try {
    const response = await api.post('/auth/request-school-verification', null, {
      params: { schoolEmail }
    });
    return response.data;
  } catch (error) {
    console.error('School verification request error:', error.response?.data || error.message);
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    throw error;
  }
};

export const requestUsernameReminder = async (email) => {
  try {
    const response = await api.post('/auth/forgot-username', null, {
      params: { email }
    });
    return response.data;
  } catch (error) {
    console.error('Forgot username error:', error.response?.data || error.message);
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    throw error;
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', null, {
      params: { email }
    });
    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error.response?.data || error.message);
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    throw error;
  }
};

export const updateNickname = async (nickname) => {
  try {
    const response = await api.put('/users/me/nickname', { nickname });
    return response.data;
  } catch (error) {
    console.error('Update nickname error:', error.response?.data || error.message);
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    throw error;
  }
};

export const deleteAccount = async () => {
  try {
    const response = await api.delete('/users/me');
    return response.data;
  } catch (error) {
    console.error('Delete account error:', error.response?.data || error.message);
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    throw error;
  }
};

export const updateNotificationPreferences = async (prefs) => {
  try {
    const response = await api.put('/users/me/notifications', prefs);
    return response.data;
  } catch (error) {
    console.error('Update notifications error:', error.response?.data || error.message);
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    throw error;
  }
};

export const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
  try {
    const response = await api.put('/users/me/password', { currentPassword, newPassword, confirmPassword });
    return response.data;
  } catch (error) {
    console.error('Change password error:', error.response?.data || error.message);
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    throw error;
  }
};

/**
 * 1차 이메일 인증 재확인용 (토큰 클릭 후 상태 새로고침)
 */
export const fetchVerificationStatus = async () => {
  return getMe();
};

/**
 * 현재 로그인한 사용자 정보 조회
 */
export const getMe = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data; // User 엔티티 그대로 반환
  } catch (error) {
    if (error.response?.status === 401) {
      return null; // 비로그인
    }
    throw error;
  }
};

/**
 * 로그아웃 요청
 * 주의: 이 함수는 로그아웃 API만 호출하며, 클라이언트 정리는 호출하는 쪽에서 처리합니다.
 */
export const logout = async () => {
  try {
    // 백엔드 로그아웃 API 호출 (세션 무효화)
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout API error:', error.response?.data || error.message);
    // 에러가 나도 예외를 던지지 않고 그냥 반환 (호출하는 쪽에서 처리하도록)
    throw error;
  }
};