// src/api/timetableApi.js
import api from './index';

/**
 * 현재 로그인한 유저의 시간표 데이터 조회 (AI 팀 형식)
 * 백엔드 경로: GET /api/timetable/ai
 * @returns {Promise<Array<Array<string>>>} - [[월], [화], ..., [금]] (각 요일은 9개 교시 'o' 또는 'x')
 */
export const getMyTimetableForAI = async () => {
  try {
    const response = await api.get('/api/timetable/ai');
    // 데이터 형식이 [[String]] 인지 확인 후 반환
    if (Array.isArray(response.data) && Array.isArray(response.data[0])) {
      return response.data;
    } else {
      console.warn('Received unexpected timetable format:', response.data);
      // 기본 빈 시간표 반환 또는 에러 처리
      return Array(5).fill(Array(9).fill('x'));
    }
  } catch (error) {
    console.error('Get My Timetable API error:', error.response?.data || error.message);
    // 로그인 안 되어 있을 경우 401/403 에러 발생 가능성
    if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('로그인이 필요합니다.');
    }
    throw new Error('시간표를 불러오는 데 실패했습니다.');
  }
};

/**
 * 다른 사용자와의 공통 빈 시간 추천 조회
 * 백엔드 경로: GET /api/timetable/recommend/{otherUserId}
 * @param {number} otherUserId - 비교할 상대방 사용자 ID
 * @returns {Promise<object>} - { message: string, top3Recommendations: string[] }
 */
export const getTimetableRecommendation = async (otherUserId) => {
  try {
    const response = await api.get(`/api/timetable/recommend/${otherUserId}`);
    // 데이터 형식 ({ message: string, top3Recommendations: string[] }) 확인
    if (response.data && response.data.message && Array.isArray(response.data.top3Recommendations)) {
        return response.data;
    } else {
        throw new Error('Invalid recommendation response format');
    }
  } catch (error) {
    console.error('Get Timetable Recommendation API error:', error.response?.data || error.message);
    if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('로그인이 필요합니다.');
    }
    throw new Error('시간표 추천 정보를 불러오는 데 실패했습니다.');
  }
};

/**
 * 시간표 저장/수정
 * 백엔드 경로: POST /api/timetable/save
 * @param {Array<Array<string>>} timetableData - [[월], [화], ..., [금]] (각 요일은 9개 교시 'o' 또는 'x')
 * @returns {Promise<string>} - 성공 메시지 ("시간표가 저장되었습니다.")
 */
export const saveTimetable = async (timetableData) => {
  try {
    // 데이터 형식 검증 (선택 사항, 백엔드에서도 검증함)
    if (!Array.isArray(timetableData) || timetableData.length !== 5 || !timetableData.every(day => Array.isArray(day) && day.length === 9)) {
        throw new Error('Invalid timetable data format');
    }

    const response = await api.post('/api/timetable/save', timetableData);
    return response.data; // 성공 메시지
  } catch (error) {
    console.error('Save Timetable API error:', error.response?.data || error.message);
    if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('로그인이 필요합니다.');
    }
     // 백엔드에서 보낸 에러 메시지 활용
    throw new Error(error.response?.data || '시간표 저장에 실패했습니다.');
  }
};

/**
 * 시간표 삭제
 * 백엔드 경로: DELETE /api/timetable/delete
 * @returns {Promise<string>} - 성공 메시지 ("시간표가 삭제되었습니다.")
 */
export const deleteTimetable = async () => {
  try {
    const response = await api.delete('/api/timetable/delete');
    return response.data; // 성공 메시지
  } catch (error) {
    console.error('Delete Timetable API error:', error.response?.data || error.message);
    if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('로그인이 필요합니다.');
    }
    throw new Error('시간표 삭제에 실패했습니다.');
  }
};