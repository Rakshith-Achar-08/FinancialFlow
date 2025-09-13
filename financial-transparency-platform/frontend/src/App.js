import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout/Layout';
import PublicLayout from './components/Layout/PublicLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import PublicDashboard from './pages/Public/PublicDashboard';
import Budgets from './pages/Budgets/Budgets';
import BudgetDetail from './pages/Budgets/BudgetDetail';
import Transactions from './pages/Transactions/Transactions';
import TransactionDetail from './pages/Transactions/TransactionDetail';
import Reports from './pages/Reports/Reports';
import AuditLogs from './pages/Audit/AuditLogs';
import Profile from './pages/Profile/Profile';
import Users from './pages/Users/Users';
import PublicBudgets from './pages/Public/PublicBudgets';
import PublicTransactions from './pages/Public/PublicTransactions';
import NotFound from './pages/NotFound';
import LoadingSpinner from './components/UI/LoadingSpinner';

function App() {
  const { user, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/public" element={<PublicLayout />}>
          <Route index element={<PublicDashboard />} />
          <Route path="budgets" element={<PublicBudgets />} />
          <Route path="transactions" element={<PublicTransactions />} />
        </Route>

        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
        />

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={user ? <Layout /> : <Navigate to="/public" replace />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="budgets/:id" element={<BudgetDetail />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="transactions/:id" element={<TransactionDetail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="profile" element={<Profile />} />
          <Route 
            path="users" 
            element={
              user?.role === 'admin' || user?.role === 'super_admin' 
                ? <Users /> 
                : <Navigate to="/dashboard" replace />
            } 
          />
        </Route>

        {/* Fallback Routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </div>
  );
}

export default App;
