import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTransactions, 
  createTransaction, 
  approveTransaction, 
  rejectTransaction, 
  completeTransaction 
} from '../store/slices/transactionSlice';
import { formatCurrency, formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Badge from '../components/UI/Badge';
import { toast } from 'react-hot-toast';

const Transactions = () => {
  const dispatch = useDispatch();
  const { transactions, loading, error } = useSelector(state => state.transaction);
  const { user } = useSelector(state => state.auth);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: ''
  });

  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: 'operational',
    vendor: '',
    budgetId: '',
    projectId: '',
    dueDate: '',
    priority: 'medium'
  });

  useEffect(() => {
    loadTransactions();
  }, [dispatch, filters]);

  const loadTransactions = () => {
    const params = {
      page: 1,
      limit: 20,
      ...filters
    };
    dispatch(fetchTransactions(params));
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    
    try {
      const result = await dispatch(createTransaction(newTransaction));
      if (createTransaction.fulfilled.match(result)) {
        toast.success('Transaction created successfully');
        setShowCreateModal(false);
        setNewTransaction({
          description: '',
          amount: '',
          category: 'operational',
          vendor: '',
          budgetId: '',
          projectId: '',
          dueDate: '',
          priority: 'medium'
        });
        loadTransactions();
      }
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const handleApprove = async (transactionId) => {
    try {
      const result = await dispatch(approveTransaction(transactionId));
      if (approveTransaction.fulfilled.match(result)) {
        toast.success('Transaction approved successfully');
        loadTransactions();
      }
    } catch (error) {
      console.error('Failed to approve transaction:', error);
    }
  };

  const handleReject = async (transactionId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const result = await dispatch(rejectTransaction({ id: transactionId, reason }));
      if (rejectTransaction.fulfilled.match(result)) {
        toast.success('Transaction rejected');
        loadTransactions();
      }
    } catch (error) {
      console.error('Failed to reject transaction:', error);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'approved': return 'primary';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const canApprove = user?.role === 'admin' || user?.role === 'auditor';
  const canCreate = user?.role === 'admin' || user?.role === 'auditor';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage financial transactions
            </p>
          </div>
          
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Transaction
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="all">All Categories</option>
                <option value="operational">Operational</option>
                <option value="capital">Capital</option>
                <option value="maintenance">Maintenance</option>
                <option value="supplies">Supplies</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder="Search transactions..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-600 mb-2">Error loading transactions</div>
              <div className="text-sm text-gray-500">{error}</div>
            </div>
          ) : transactions && transactions.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <li key={transaction.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.description}
                            </div>
                            <Badge variant={getStatusVariant(transaction.status)} className="ml-2">
                              {transaction.status}
                            </Badge>
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
                          Due: {formatDate(transaction.dueDate)}
                        </div>
                      </div>
                    </div>
                    
                    {canApprove && transaction.status === 'pending' && (
                      <div className="mt-4 flex items-center space-x-2">
                        <button
                          onClick={() => handleApprove(transaction.id)}
                          className="text-sm text-green-600 hover:text-green-500"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(transaction.id)}
                          className="text-sm text-red-600 hover:text-red-500"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new transaction.</p>
            </div>
          )}
        </div>

        {/* Create Transaction Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Transaction</h3>
              <form onSubmit={handleCreateTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    required
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      required
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={newTransaction.category}
                      onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="operational">Operational</option>
                      <option value="capital">Capital</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="supplies">Supplies</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendor</label>
                  <input
                    type="text"
                    required
                    value={newTransaction.vendor}
                    onChange={(e) => setNewTransaction({...newTransaction, vendor: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTransaction.dueDate}
                    onChange={(e) => setNewTransaction({...newTransaction, dueDate: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Create Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
