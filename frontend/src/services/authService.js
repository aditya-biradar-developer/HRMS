import api from './api';

export const authService = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get stored user
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};