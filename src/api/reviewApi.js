import api from './index';

export const createReview = async ({ productId, revieweeId, rating, comment }) => {
  const { data } = await api.post('/reviews', { productId, revieweeId, rating, comment });
  return data;
};

export const getReviewsForUser = async (userId) => {
  const { data } = await api.get(`/reviews/user/${userId}`);
  return data;
};

