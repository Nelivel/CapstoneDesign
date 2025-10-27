// src/utils/timeUtils.js

/**
 * 주어진 ISO 8601 형식 시간 문자열을 현재 시간 기준으로 상대 시간으로 변환합니다.
 * @param {string} isoString - ISO 8601 형식의 시간 문자열 (예: "2025-10-27T08:15:30Z")
 * @returns {string} - 변환된 상대 시간 문자열 (예: "방금 전", "5분 전", "3시간 전", "2일 전")
 */
export function formatTimeAgo(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) {
    return "방금 전";
  } else if (minutes < 60) {
    return `${minutes}분 전`;
  } else if (hours < 24) {
    return `${hours}시간 전`;
  } else if (days < 7) {
    return `${days}일 전`;
  } else {
    // 7일 이상이면 날짜 표시 (옵션)
    // return date.toLocaleDateString('ko-KR');
    const weeks = Math.round(days / 7);
    return `${weeks}주 전`;
  }
}