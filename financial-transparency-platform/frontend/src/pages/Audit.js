import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAuditLogs, 
  fetchAuditStats, 
  fetchBlockchainIntegrity,
  exportAuditLogs 
} from '../store/slices/auditSlice';
import { formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Badge from '../components/UI/Badge';
import { toast } from 'react-hot-toast';

const Audit = () => {
  const dispatch = useDispatch();
  const { auditLogs, stats, blockchainIntegrity, loading, error } = useSelector(state => state.audit);
  const { user } = useSelector(state => state.auth);

  const [filters, setFilters] = useState({
    action: 'all',
    severity: 'all',
    entityType: 'all',
    dateRange: '7d',
    search: ''
  });

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'auditor') {
      loadAuditData();
    }
  }, [dispatch, filters, user]);

  const loadAuditData = () => {
    dispatch(fetchAuditLogs(filters));
    dispatch(fetchAuditStats());
    dispatch(fetchBlockchainIntegrity());
  };

  const handleExport = async (format) => {
    try {
      const result = await dispatch(exportAuditLogs({ format, filters }));
      if (exportAuditLogs.fulfilled.match(result)) {
        toast.success(`Audit logs exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Failed to export audit logs:', error);
    }
  };

  const getSeverityVariant = (severity) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      approve: '✅',
      reject: '❌',
      login: '🔐',
      logout: '🚪'
    };
    return icons[action] || '📝';
  };

  if (user?.role !== 'admin' && user?.role !== 'auditor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-1 text-sm text-gray-500">
            Audit logs are only available to administrators and auditors.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor system activities and maintain compliance
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={() => handleExport('pdf')}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Export PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📊</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalEvents}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">⚠️</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Critical Events</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.criticalEvents}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">👥</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.activeUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🔗</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Blockchain Status</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {blockchainIntegrity?.isValid ? 'Valid' : 'Invalid'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blockchain Integrity */}
        {blockchainIntegrity && (
          <div className={`mb-6 p-4 rounded-lg ${
            blockchainIntegrity.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {blockchainIntegrity.isValid ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  blockchainIntegrity.isValid ? 'text-green-800' : 'text-red-800'
                }`}>
                  Blockchain Integrity {blockchainIntegrity.isValid ? 'Verified' : 'Compromised'}
                </h3>
                <p className={`text-sm ${
                  blockchainIntegrity.isValid ? 'text-green-700' : 'text-red-700'
                }`}>
                  Last verified: {formatDate(blockchainIntegrity.lastVerified)} | 
                  Total blocks: {blockchainIntegrity.totalBlocks}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({...filters, action: e.target.value})}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({...filters, severity: e.target.value})}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Entity Type</label>
              <select
                value={filters.entityType}
                onChange={(e) => setFilters({...filters, entityType: e.target.value})}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="all">All Types</option>
                <option value="budget">Budget</option>
                <option value="transaction">Transaction</option>
                <option value="user">User</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder="Search logs..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-600 mb-2">Error loading audit logs</div>
              <div className="text-sm text-gray-500">{error}</div>
            </div>
          ) : auditLogs && auditLogs.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <li key={log.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">{getActionIcon(log.action)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {log.action} {log.entityType}
                            </div>
                            <Badge variant={getSeverityVariant(log.severity)} className="ml-2">
                              {log.severity}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            User: {log.user?.firstName} {log.user?.lastName} ({log.user?.email})
                          </div>
                          <div className="text-sm text-gray-500">
                            IP: {log.ipAddress} | Session: {log.sessionId?.substring(0, 8)}...
                          </div>
                          {log.description && (
                            <div className="text-sm text-gray-600 mt-1">
                              {log.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-900">
                          {formatDate(log.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Entity ID: {log.entityId}
                        </div>
                      </div>
                    </div>
                    
                    {/* Show changes if available */}
                    {(log.oldValues || log.newValues) && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-700 mb-2">Changes:</div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
                          {log.oldValues && (
                            <div>
                              <div className="font-medium text-red-600">Before:</div>
                              <pre className="text-red-700 whitespace-pre-wrap">
                                {JSON.stringify(log.oldValues, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.newValues && (
                            <div>
                              <div className="font-medium text-green-600">After:</div>
                              <pre className="text-green-700 whitespace-pre-wrap">
                                {JSON.stringify(log.newValues, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters to see more results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Audit;
