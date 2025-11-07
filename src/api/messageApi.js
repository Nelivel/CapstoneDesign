import api from './index';

export const getAllMessages = async () => {
  const { data } = await api.get('/api/messages');
  return data; // Message[] 엔티티 그대로 반환
};

export const getMessagesByProduct = async (productId) => {
  const { data } = await api.get(`/api/messages/product/${productId}`);
  return data; // Message[] 엔티티 그대로 반환
};

// 특정 메시지를 읽음으로 표시
export const markMessageAsRead = async (messageId) => {
  try {
    const { data } = await api.post(`/api/messages/${messageId}/read`);
    return data;
  } catch (error) {
    console.error('Failed to mark message as read:', error);
    throw error;
  }
};

// 모든 메시지를 읽음으로 표시
export const markAllMessagesAsRead = async () => {
  try {
    const { data } = await api.post('/api/messages/read-all');
    return data;
  } catch (error) {
    console.error('Failed to mark all messages as read:', error);
    throw error;
  }
};

