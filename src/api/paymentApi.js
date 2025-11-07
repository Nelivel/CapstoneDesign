import api from './index';

export const startPayment = async ({ productId, amount }) => {
  const { data } = await api.post('/payments', { productId, amount });
  return data; // { paymentId, status, sellerCode, buyerCode }
};

export const validateCode = async ({ code, role }) => {
  const { data } = await api.post('/payments/validate-code', { code, role });
  return data; // { paymentId, status }
};

export const depositConfirm = async (paymentId) => {
  const { data } = await api.post(`/payments/${paymentId}/deposit-confirm`);
  return data; // { status }
};

export const pickup = async (paymentId) => {
  const { data } = await api.post(`/payments/${paymentId}/pickup`);
  return data; // { status }
};

export const release = async (paymentId) => {
  const { data } = await api.post(`/payments/${paymentId}/release`);
  return data; // { status }
};


