import api from './api';

const transactionService = {
  // Get all transactions
  getTransactions: (params) => {
    return api.get('/transactions', { params });
  },

  // Get public transactions
  getPublicTransactions: (params) => {
    return api.get('/transactions/public', { params });
  },

  // Get transaction by ID
  getTransactionById: (transactionId) => {
    return api.get(`/transactions/${transactionId}`);
  },

  // Create new transaction
  createTransaction: (transactionData) => {
    return api.post('/transactions', transactionData);
  },

  // Approve transaction
  approveTransaction: (transactionId) => {
    return api.put(`/transactions/${transactionId}/approve`);
  },

  // Reject transaction
  rejectTransaction: (transactionId, reason) => {
    return api.put(`/transactions/${transactionId}/reject`, { reason });
  },

  // Complete transaction
  completeTransaction: (transactionId) => {
    return api.put(`/transactions/${transactionId}/complete`);
  },

  // Get transaction audit trail
  getTransactionAudit: (transactionId) => {
    return api.get(`/transactions/${transactionId}/audit`);
  },
};

export default transactionService;
