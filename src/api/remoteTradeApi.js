import api from './index';

const withErrorHandling = async (request) => {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    const message = error.response?.data || error.message || '요청 처리 중 오류가 발생했습니다.';
    console.error('RemoteTrade API error:', message);
    throw new Error(typeof message === 'string' ? message : '요청 처리 중 오류가 발생했습니다.');
  }
};

export const getRemoteTradeSession = async (productId) => {
  return withErrorHandling(api.get(`/api/remote-trade/${productId}`));
};

export const sellerStartRemoteTrade = async (productId) => {
  return withErrorHandling(api.post(`/api/remote-trade/${productId}/seller/start`));
};

export const sellerCompleteRemoteTrade = async (productId) => {
  return withErrorHandling(api.post(`/api/remote-trade/${productId}/seller/complete`));
};

export const buyerPayRemoteTrade = async (productId, amount) => {
  return withErrorHandling(api.post(`/api/remote-trade/${productId}/buyer/pay`, { amount }));
};

export const buyerCompleteRemoteTrade = async (productId) => {
  return withErrorHandling(api.post(`/api/remote-trade/${productId}/buyer/complete`));
};

export const proposePriceRemoteTrade = async (productId, price) => {
  return withErrorHandling(api.post(`/api/remote-trade/${productId}/price-proposals`, { price }));
};

export const respondPriceProposal = async (productId, proposalId, accept) => {
  return withErrorHandling(
    api.post(`/api/remote-trade/${productId}/price-proposals/${proposalId}/respond`, { accept })
  );
};


