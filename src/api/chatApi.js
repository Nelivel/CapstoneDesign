// src/api/chatApi.js
import api from './index';

/**
 * 채팅방 ID 생성/조회 (상품 기반)
 * 같은 상품에 대해 같은 채팅방 ID를 반환
 * @param {number} productId - 상품 ID
 * @returns {Promise<number>} - 채팅방 ID (productId 기반)
 */
export const getOrCreateChatRoom = async (productId) => {
  // 간단하게 productId를 채팅방 ID로 사용
  // 나중에 백엔드에 ChatRoom 엔티티가 추가되면 실제 API 호출로 변경
  return productId;
};

/**
 * 상품 ID와 판매자 ID로 채팅방 ID 생성
 * @param {number} productId - 상품 ID
 * @param {number} sellerId - 판매자 ID
 * @returns {number} - 채팅방 ID
 */
export const createChatRoomId = (productId, sellerId) => {
  // productId와 sellerId 조합으로 고유한 채팅방 ID 생성
  // 예: productId * 10000 + sellerId % 10000
  return productId * 10000 + (sellerId % 10000);
};

