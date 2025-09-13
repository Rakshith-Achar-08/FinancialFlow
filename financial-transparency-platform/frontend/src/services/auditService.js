import api from './api';

const auditService = {
  // Get audit logs
  getAuditLogs: (params) => {
    return api.get('/audit/logs', { params });
  },

  // Get audit statistics
  getAuditStats: (period) => {
    return api.get('/audit/stats', { params: { period } });
  },

  // Get blockchain integrity status
  getBlockchainIntegrity: () => {
    return api.get('/audit/blockchain/integrity');
  },

  // Get suspicious activities
  getSuspiciousActivities: (days) => {
    return api.get('/audit/suspicious', { params: { days } });
  },

  // Get audit trail for specific entity
  getAuditTrail: (entityType, entityId) => {
    return api.get(`/audit/trail/${entityType}/${entityId}`);
  },

  // Export audit logs
  exportAuditLogs: (format, params) => {
    return api.get(`/audit/export/${format}`, { 
      params,
      responseType: 'blob'
    });
  },
};

export default auditService;
