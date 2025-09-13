import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicDashboard } from '../store/slices/dashboardSlice';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import MetricCard from '../components/Dashboard/MetricCard';
import BudgetTrendsChart from '../components/Dashboard/BudgetTrendsChart';
import SpendingChart from '../components/Dashboard/SpendingChart';

const PublicDashboard = () => {
  const dispatch = useDispatch();
  const { publicData, loading, error } = useSelector(state => state.dashboard);
  const [selectedInstitution, setSelectedInstitution] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current_year');

  useEffect(() => {
    loadPublicData();
  }, [dispatch, selectedInstitution, selectedPeriod]);

  const loadPublicData = async () => {
    try {
      await dispatch(fetchPublicDashboard({ 
        institution: selectedInstitution,
        period: selectedPeriod 
      }));
    } catch (error) {
      console.error('Failed to load public dashboard data:', error);
    }
  };

  const handleRefresh = () => {
    loadPublicData();
  };

  if (loading && !publicData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading public dashboard</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-sm text-red-800 hover:text-red-900 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Financial Transparency Dashboard
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Public access to institutional financial data and spending transparency
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <div className="text-sm text-gray-500">
                  Last updated: {publicData?.lastUpdated ? new Date(publicData.lastUpdated).toLocaleDateString() : 'N/A'}
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <svg 
                    className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="ml-2">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
                Institution
              </label>
              <select
                id="institution"
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="all">All Institutions</option>
                {publicData?.institutions?.map(institution => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700">
                Time Period
              </label>
              <select
                id="period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="current_month">Current Month</option>
                <option value="current_quarter">Current Quarter</option>
                <option value="current_year">Current Year</option>
                <option value="last_year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {publicData && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <MetricCard
              title="Total Public Budget"
              value={formatCurrency(publicData.totalBudget)}
              change={publicData.budgetChange}
              changeType={publicData.budgetChange >= 0 ? 'increase' : 'decrease'}
              icon="currency-dollar"
            />
            <MetricCard
              title="Total Expenditure"
              value={formatCurrency(publicData.totalSpent)}
              change={publicData.spentChange}
              changeType={publicData.spentChange >= 0 ? 'increase' : 'decrease'}
              icon="trending-up"
            />
            <MetricCard
              title="Budget Utilization"
              value={formatPercentage(publicData.budgetUtilization)}
              change={publicData.utilizationChange}
              changeType={publicData.utilizationChange >= 0 ? 'increase' : 'decrease'}
              icon="chart-pie"
            />
            <MetricCard
              title="Active Projects"
              value={publicData.activeProjects}
              change={publicData.projectsChange}
              changeType={publicData.projectsChange >= 0 ? 'increase' : 'decrease'}
              icon="briefcase"
            />
          </div>
        )}

        {/* Transparency Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Transparency Commitment
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  This dashboard provides real-time access to public financial data. All transactions 
                  are verified through our blockchain-based immutable ledger system to ensure data 
                  integrity and prevent tampering. Data is updated automatically and reflects the 
                  most current financial status.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          {/* Budget Trends */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Budget Allocation Trends
              </h3>
              {publicData?.budgetTrends ? (
                <BudgetTrendsChart data={publicData.budgetTrends} />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner />
                </div>
              )}
            </div>
          </div>

          {/* Spending by Category */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Spending by Category
              </h3>
              {publicData?.spendingByCategory ? (
                <SpendingChart data={publicData.spendingByCategory} />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        {publicData?.recentTransactions && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Public Transactions
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Latest verified transactions available for public viewing
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {publicData.recentTransactions.map((transaction) => (
                <li key={transaction.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.description}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.category} • {transaction.vendor}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Need More Information?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              For detailed reports, audit trails, or specific inquiries, please contact the institution directly.
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Staff Login
              </a>
              <a
                href="mailto:transparency@institution.org"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;
