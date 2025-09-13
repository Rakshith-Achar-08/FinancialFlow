import api from './api';

const budgetService = {
  // Get all budgets
  getBudgets: (params) => {
    return api.get('/budget', { params });
  },

  // Get public budgets
  getPublicBudgets: (params) => {
    return api.get('/budget/public', { params });
  },

  // Get budget by ID
  getBudgetById: (budgetId) => {
    return api.get(`/budget/${budgetId}`);
  },

  // Create new budget
  createBudget: (budgetData) => {
    return api.post('/budget', budgetData);
  },

  // Update budget
  updateBudget: (budgetId, budgetData) => {
    return api.put(`/budget/${budgetId}`, budgetData);
  },

  // Approve budget
  approveBudget: (budgetId) => {
    return api.put(`/budget/${budgetId}/approve`);
  },

  // Activate budget
  activateBudget: (budgetId) => {
    return api.put(`/budget/${budgetId}/activate`);
  },

  // Delete budget
  deleteBudget: (budgetId) => {
    return api.delete(`/budget/${budgetId}`);
  },

  // Get budget summary
  getBudgetSummary: (budgetId) => {
    return api.get(`/budget/${budgetId}/summary`);
  },
};

export default budgetService;
