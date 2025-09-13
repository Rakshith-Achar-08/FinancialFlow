import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardOverview from '../components/Dashboard/DashboardOverview';
import { checkAuthStatus } from '../store/slices/authSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Verify auth status on dashboard load
    dispatch(checkAuthStatus());
  }, [dispatch, isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardOverview />
      </div>
    </div>
  );
};

export default Dashboard;
