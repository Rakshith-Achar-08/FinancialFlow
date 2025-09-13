import api from './api';

const dashboardService = {
  // Get dashboard overview
  getOverview: () => {
    return api.get('/dashboard/overview');
  },

  // Get public dashboard data
  getPublicDashboard: (params) => {
    return api.get('/dashboard/public', { params });
  },

  // Get budget trends
  getBudgetTrends: (period) => {
    return api.get('/dashboard/trends/budget', { params: { period } });
  },

  // Get spending by category
  getSpendingByCategory: (fiscalYear) => {
    return api.get('/dashboard/spending/category', { params: { fiscal_year: fiscalYear } });
  },

  // Get vendor analysis
  getVendorAnalysis: (limit) => {
    return api.get('/dashboard/vendors/analysis', { params: { limit } });
  },

  // Get project performance
  getProjectPerformance: () => {
    return api.get('/dashboard/projects/performance');
  },
};

export default dashboardService;
