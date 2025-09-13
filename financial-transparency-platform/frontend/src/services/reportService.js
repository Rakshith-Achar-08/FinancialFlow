import api from './api';

const reportService = {
  // Get available report types
  getReportTypes: () => {
    return api.get('/reports/types');
  },

  // Generate budget report
  generateBudgetReport: (format, params) => {
    return api.get(`/reports/budget/${format}`, {
      params,
      responseType: 'blob'
    });
  },

  // Generate transaction report
  generateTransactionReport: (format, params) => {
    return api.get(`/reports/transactions/${format}`, {
      params,
      responseType: 'blob'
    });
  },

  // Generate financial report
  generateFinancialReport: (format, params) => {
    return api.get(`/reports/financial/${format}`, {
      params,
      responseType: 'blob'
    });
  },

  // Generate audit report
  generateAuditReport: (format, params) => {
    return api.get(`/reports/audit/${format}`, {
      params,
      responseType: 'blob'
    });
  },
};

export default reportService;
