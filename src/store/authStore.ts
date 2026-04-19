import { create } from 'zustand';
import axios from 'axios';

import { API_URL } from '../config';

interface AuthState {
  user: any | null;
  profile: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, role: 'admin' | 'client') => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  profile: JSON.parse(localStorage.getItem('profile') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
        role: role.toUpperCase(),
      });

      const { user, token, profile } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (profile) localStorage.setItem('profile', JSON.stringify(profile));

      set({ user, token, profile, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Login failed. Please check credentials.', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    set({ user: null, profile: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null })
}));
