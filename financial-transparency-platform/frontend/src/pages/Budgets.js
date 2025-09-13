import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchBudgets, 
  createBudget, 
  updateBudget, 
  approveBudget, 
  activateBudget, 
  deleteBudget,
  fetchBudgetSummary 
} from '../store/slices/budgetSlice';
import { formatCurrency, formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Badge from '../components/UI/Badge';
import { toast } from 'react-hot-toast';

const Budgets = () => {
  const dispatch = useDispatch();
  const { budgets, summary, loading, error, pagination } = useSelector(state => state.budget);
  const { user } = useSelector(state => state.auth);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    fiscalYear: 'all',
    search: ''
  });

  const [newBudget, setNewBudget] = useState({
    name: '',
    fiscalYear: new Date().getFullYear(),
    totalAmount: '',
    allocatedAmount: '',
    category: 'operational',
    description: '',
    startDate: '',
    endDate: '',
    isPublic: true
  });

  useEffect(() => {
    loadBudgets();
    loadSummary();
  }, [dispatch, filters]);

  const loadBudgets = () => {
    const params = {
      page: 1,
      limit: 20,
      ...filters
    };
    dispatch(fetchBudgets(params));
  };

  const loadSummary = () => {
    dispatch(fetchBudgetSummary());
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    
    try {
      const result = await dispatch(createBudget(newBudget));
      if (createBudget.fulfilled.match(result)) {
        toast.success('Budget created successfully');
        setShowCreateModal(false);
        setNewBudget({
          name: '',
          fiscalYear: new Date().getFullYear(),
          totalAmount: '',
          allocatedAmount: '',
          category: 'operational',
          description: '',
          startDate: '',
          endDate: '',
          isPublic: true
        });
        loadBudgets();
        loadSummary();
      }
    } catch (error) {
      console.error('Failed to create budget:', error);
    }
  };

  const handleApproveBudget = async (budgetId) => {
    try {
      const result = await dispatch(approveBudget(budgetId));
      if (approveBudget.fulfilled.match(result)) {
        toast.success('Budget approved successfully');
        loadBudgets();
        loadSummary();
      }
    } catch (error) {
      console.error('Failed to approve budget:', error);
    }
  };

  const handleActivateBudget = async (budgetId) => {
    try {
      const result = await dispatch(activateBudget(budgetId));
      if (activateBudget.fulfilled.match(result)) {
        toast.success('Budget activated successfully');
        loadBudgets();
        loadSummary();
      }
    } catch (error) {
      console.error('Failed to activate budget:', error);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      const result = await dispatch(deleteBudget(budgetId));
      if (deleteBudget.fulfilled.match(result)) {
        toast.success('Budget deleted successfully');
        loadBudgets();
        loadSummary();
      }
    } catch (error) {
      console.error('Failed to delete budget:', error);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'approved': return 'primary';
      case 'pending': return 'warning';
      case 'draft': return 'secondary';
      case 'expired': return 'danger';
      default: return 'secondary';
    }
  };

  const canApprove = user?.role === 'admin' || user?.role === 'auditor';
  const canCreate = user?.role === 'admin';
  const canDelete = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage institutional budgets and track allocations
            </p>
          </div>
          
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Budget
            </button>
          )}
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Budget</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(summary.totalBudget)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Allocated</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(summary.totalAllocated)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Budgets</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {summary.activeBudgets}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Approval</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {summary.pendingApproval}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div>
              <label htmlFor="fiscalYear" className="block text-sm font-medium text-gray-700">
                Fiscal Year
              </label>
              <select
                id="fiscalYear"
                value={filters.fiscalYear}
                onChange={(e) => handleFilterChange('fiscalYear', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="all">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>

            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search budgets..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Budget List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-600 mb-2">Error loading budgets</div>
              <div className="text-sm text-gray-500">{error}</div>
            </div>
          ) : budgets && budgets.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {budgets.map((budget) => (
                <li key={budget.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <svg className="h-5 w-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {budget.name}
                            </div>
                            <Badge variant={getStatusVariant(budget.status)} className="ml-2">
                              {budget.status}
                            </Badge>
                            {budget.isPublic && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Public
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            FY {budget.fiscalYear} • {budget.category}
                          </div>
                          {budget.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {budget.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(budget.totalAmount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Allocated: {formatCurrency(budget.allocatedAmount)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="mt-4 flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedBudget(budget)}
                        className="text-sm text-primary-600 hover:text-primary-500"
                      >
                        View Details
                      </button>
                      
                      {canApprove && budget.status === 'pending' && (
                        <button
                          onClick={() => handleApproveBudget(budget.id)}
                          className="text-sm text-green-600 hover:text-green-500"
                        >
                          Approve
                        </button>
                      )}
                      
                      {canApprove && budget.status === 'approved' && (
                        <button
                          onClick={() => handleActivateBudget(budget.id)}
                          className="text-sm text-blue-600 hover:text-blue-500"
                        >
                          Activate
                        </button>
                      )}
                      
                      {canDelete && budget.status === 'draft' && (
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="text-sm text-red-600 hover:text-red-500"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No budgets found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new budget.
              </p>
            </div>
          )}
        </div>

        {/* Create Budget Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Budget</h3>
                <form onSubmit={handleCreateBudget} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Budget Name</label>
                    <input
                      type="text"
                      required
                      value={newBudget.name}
                      onChange={(e) => setNewBudget({...newBudget, name: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fiscal Year</label>
                      <input
                        type="number"
                        required
                        value={newBudget.fiscalYear}
                        onChange={(e) => setNewBudget({...newBudget, fiscalYear: parseInt(e.target.value)})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <select
                        value={newBudget.category}
                        onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="operational">Operational</option>
                        <option value="capital">Capital</option>
                        <option value="project">Project</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                    <input
                      type="number"
                      required
                      value={newBudget.totalAmount}
                      onChange={(e) => setNewBudget({...newBudget, totalAmount: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        required
                        value={newBudget.startDate}
                        onChange={(e) => setNewBudget({...newBudget, startDate: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        required
                        value={newBudget.endDate}
                        onChange={(e) => setNewBudget({...newBudget, endDate: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newBudget.description}
                      onChange={(e) => setNewBudget({...newBudget, description: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newBudget.isPublic}
                      onChange={(e) => setNewBudget({...newBudget, isPublic: e.target.checked})}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Make this budget publicly visible
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : 'Create Budget'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budgets;
