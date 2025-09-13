import api from './api';

const authService = {
  // Login user
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  // Register new user
  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  // Get current user profile
  getProfile: () => {
    return api.get('/auth/profile');
  },

  // Update user profile
  updateProfile: (profileData) => {
    return api.put('/auth/profile', profileData);
  },

  // Change password
  changePassword: (passwordData) => {
    return api.put('/auth/change-password', passwordData);
  },

  // Logout user
  logout: () => {
    return api.post('/auth/logout');
  },

  // Get all users (admin only)
  getUsers: (params) => {
    return api.get('/auth/users', { params });
  },

  // Update user role (admin only)
  updateUserRole: (userId, role) => {
    return api.put(`/auth/users/${userId}/role`, { role });
  },
};

export default authService;
