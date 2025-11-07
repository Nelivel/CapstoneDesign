import api from './index';
import { getMe } from './authApi';

export const getFavorites = async () => {
  const { data } = await api.get('/favorites');
  return data;
};

export const addFavorite = async (productId) => {
  await api.post(`/favorites/${productId}`);
};

export const removeFavorite = async (productId) => {
  try {
    // DELETE 요청 전에 세션 확인
    const me = await getMe();
    if (!me) {
      throw new Error('Session expired. Please login again.');
    }
    
    console.log('Remove Favorite: Attempting to delete favorite for productId:', productId);
    const response = await api.delete(`/favorites/${productId}`);
    console.log('Remove Favorite: Success', response.status);
    return response;
  } catch (error) {
    console.error('Remove Favorite API error:', error.response?.status, error.response?.data || error.message);
    if (error.response?.status === 401 || error.message?.includes('Session expired')) {
      console.error('Authentication failed - session may have expired. Please login again.');
      throw { ...error, sessionExpired: true };
    }
    throw error;
  }
};

export const checkFavoriteStatus = async (productId) => {
  try {
    const favorites = await getFavorites();
    if (!favorites || !Array.isArray(favorites)) {
      return false;
    }
    // getFavorites는 Product[]를 반환하므로 직접 productId와 비교
    return favorites.some(fav => fav?.id === productId || fav?.id === Number(productId));
  } catch (error) {
    // 500 에러나 다른 에러는 조용히 false 반환 (에러 로그는 이미 getFavorites에서 출력됨)
    console.error('Check Favorite Status API error:', error.response?.data || error.message);
    return false;
  }
};

