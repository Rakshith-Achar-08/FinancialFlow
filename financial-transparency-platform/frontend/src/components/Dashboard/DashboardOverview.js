import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchDashboardOverview, 
  fetchBudgetTrends, 
  fetchSpendingByCategory,
  fetchVendorAnalysis,
  fetchProjectPerformance 
} from '../../store/slices/dashboardSlice';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import LoadingSpinner from '../UI/LoadingSpinner';
import Badge from '../UI/Badge';
import MetricCard from './MetricCard';
import BudgetTrendsChart from './BudgetTrendsChart';
import SpendingChart from './SpendingChart';
import VendorAnalysisChart from './VendorAnalysisChart';
import ProjectPerformanceChart from './ProjectPerformanceChart';

const DashboardOverview = () => {
  const dispatch = useDispatch();
  const { 
    overview, 
    budgetTrends, 
    spendingByCategory, 
    vendorAnalysis, 
    projectPerformance,
    loading, 
    error 
  } = useSelector(state => state.dashboard);
  
  const [selectedPeriod, setSelectedPeriod] = useState('current_year');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [dispatch, selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchDashboardOverview({ period: selectedPeriod })),
        dispatch(fetchBudgetTrends({ period: selectedPeriod })),
        dispatch(fetchSpendingByCategory({ period: selectedPeriod })),
        dispatch(fetchVendorAnalysis({ period: selectedPeriod })),
        dispatch(fetchProjectPerformance({ period: selectedPeriod }))
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Financial insights and key metrics for your institution
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="current_month">Current Month</option>
            <option value="current_quarter">Current Quarter</option>
            <option value="current_year">Current Year</option>
            <option value="last_year">Last Year</option>
          </select>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <svg 
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} 
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

      {/* Key Metrics */}
      {overview && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Budget"
            value={formatCurrency(overview.totalBudget)}
            change={overview.budgetChange}
            changeType={overview.budgetChange >= 0 ? 'increase' : 'decrease'}
            icon="currency-dollar"
          />
          <MetricCard
            title="Total Spent"
            value={formatCurrency(overview.totalSpent)}
            change={overview.spentChange}
            changeType={overview.spentChange >= 0 ? 'increase' : 'decrease'}
            icon="trending-up"
          />
          <MetricCard
            title="Budget Utilization"
            value={formatPercentage(overview.budgetUtilization)}
            change={overview.utilizationChange}
            changeType={overview.utilizationChange >= 0 ? 'increase' : 'decrease'}
            icon="chart-pie"
          />
          <MetricCard
            title="Active Projects"
            value={overview.activeProjects}
            change={overview.projectsChange}
            changeType={overview.projectsChange >= 0 ? 'increase' : 'decrease'}
            icon="briefcase"
          />
        </div>
      )}

      {/* Status Indicators */}
      {overview && (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              System Status
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center">
                <Badge 
                  variant={overview.pendingApprovals > 0 ? 'warning' : 'success'}
                  className="mr-2"
                >
                  {overview.pendingApprovals > 0 ? 'Action Required' : 'All Clear'}
                </Badge>
                <span className="text-sm text-gray-600">
                  {overview.pendingApprovals} pending approvals
                </span>
              </div>
              <div className="flex items-center">
                <Badge 
                  variant={overview.overdueTransactions > 0 ? 'danger' : 'success'}
                  className="mr-2"
                >
                  {overview.overdueTransactions > 0 ? 'Overdue' : 'On Track'}
                </Badge>
                <span className="text-sm text-gray-600">
                  {overview.overdueTransactions} overdue transactions
                </span>
              </div>
              <div className="flex items-center">
                <Badge 
                  variant={overview.budgetAlerts > 0 ? 'warning' : 'success'}
                  className="mr-2"
                >
                  {overview.budgetAlerts > 0 ? 'Budget Alert' : 'Within Budget'}
                </Badge>
                <span className="text-sm text-gray-600">
                  {overview.budgetAlerts} budget alerts
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Budget Trends */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Budget Trends
            </h3>
            {budgetTrends ? (
              <BudgetTrendsChart data={budgetTrends} />
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
            {spendingByCategory ? (
              <SpendingChart data={spendingByCategory} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </div>
            )}
          </div>
        </div>

        {/* Vendor Analysis */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Top Vendors
            </h3>
            {vendorAnalysis ? (
              <VendorAnalysisChart data={vendorAnalysis} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </div>
            )}
          </div>
        </div>

        {/* Project Performance */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Project Performance
            </h3>
            {projectPerformance ? (
              <ProjectPerformanceChart data={projectPerformance} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {overview && overview.recentActivity && (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {overview.recentActivity.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== overview.recentActivity.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.type === 'transaction' ? 'bg-green-500' :
                            activity.type === 'budget' ? 'bg-blue-500' :
                            activity.type === 'approval' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}>
                            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {activity.description}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={activity.timestamp}>
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
