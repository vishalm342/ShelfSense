import { create } from 'zustand';
import authService from '../services/authService.js';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  // Initialize auth state on app load
  initializeAuth: async () => {
    try {
      set({ loading: true, error: null });
      
      if (authService.isAuthenticated()) {
        const result = await authService.getCurrentUser();
        if (result.success) {
          set({ user: result.user, loading: false });
        } else {
          // Token is invalid, clear auth state
          set({ user: null, loading: false, error: null });
        }
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false, user: null });
    }
  },

  // Sign up new user
  signUp: async (email, password, firstName, lastName) => {
    try {
      set({ loading: true, error: null });
      
      const userData = { email, password };
      if (firstName) userData.firstName = firstName;
      if (lastName) userData.lastName = lastName;
      
      const result = await authService.signUp(userData);

      if (result.success) {
        set({ user: result.user, loading: false });
        return { success: true, data: result };
      } else {
        set({ error: result.error, loading: false });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Signup failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Sign in existing user
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      
      const result = await authService.signIn({ email, password });

      if (result.success) {
        set({ user: result.user, loading: false });
        return { success: true, data: result };
      } else {
        set({ error: result.error, loading: false });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      
      await authService.signOut();
      set({ user: null, loading: false });
      
      return { success: true };
    } catch (error) {
      // Even if sign out fails, clear local state
      set({ user: null, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Refresh user data
  refreshUser: async () => {
    try {
      if (!authService.isAuthenticated()) {
        set({ user: null });
        return;
      }

      const result = await authService.getCurrentUser();
      if (result.success) {
        set({ user: result.user });
      } else {
        set({ user: null });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      set({ user: null });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
