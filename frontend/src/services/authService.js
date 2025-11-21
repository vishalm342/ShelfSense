import api from './api.js';

export const authService = {
  // Sign up a new user
  signUp: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      
      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.data.token);
        return {
          success: true,
          user: response.data.data.user,
          token: response.data.data.token
        };
      }
      
      return {
        success: false,
        error: response.data.error?.message || 'Signup failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Network error during signup'
      };
    }
  },

  // Sign in existing user
  signIn: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.data.token);
        return {
          success: true,
          user: response.data.data.user,
          token: response.data.data.token
        };
      }
      
      return {
        success: false,
        error: response.data.error?.message || 'Login failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Network error during login'
      };
    }
  },

  // Sign out user
  signOut: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('authToken');
      return { success: true };
    } catch (error) {
      // Even if API call fails, remove token locally
      localStorage.removeItem('authToken');
      return { success: true };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return { success: false, error: 'No auth token found' };
      }

      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        return {
          success: true,
          user: response.data.data.user
        };
      }
      
      return {
        success: false,
        error: response.data.error?.message || 'Failed to get user'
      };
    } catch (error) {
      // If unauthorized, remove invalid token
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
      }
      
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Network error'
      };
    }
  },

  // Verify token validity
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return { success: false, valid: false };
      }

      const response = await api.post('/auth/verify-token');
      return {
        success: true,
        valid: response.data.data.valid
      };
    } catch (error) {
      // If unauthorized, remove invalid token
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
      }
      
      return {
        success: false,
        valid: false
      };
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('authToken');
  }
};

export default authService;