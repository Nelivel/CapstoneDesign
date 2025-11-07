import api from './index';

export const getSellHistory = async () => {
  const { data } = await api.get('/history/sell');
  return data;
};

export const getBuyHistory = async () => {
  const { data } = await api.get('/history/buy');
  return data;
};

