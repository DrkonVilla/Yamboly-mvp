import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          if (response.data.success) {
            const { user, token } = response.data.data;
            localStorage.setItem('token', token);
            set({ user, token, loading: false });
            return { success: true };
          }
        } catch (error) {
          set({ loading: false });
          return { success: false, message: error.response?.data?.message || 'Error de login' };
        }
      },

      register: async (data) => {
        set({ loading: true });
        try {
          const response = await api.post('/auth/register', data);
          if (response.data.success) {
            const { user, token } = response.data.data;
            localStorage.setItem('token', token);
            set({ user, token, loading: false });
            return { success: true };
          }
        } catch (error) {
          set({ loading: false });
          return { success: false, message: error.response?.data?.message || 'Error de registro' };
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },

      loadUser: async () => {
        const token = localStorage.getItem('token') || get().token;
        if (!token) return;

        try {
          const response = await api.get('/auth/profile');
          if (response.data.success) {
            set({ user: response.data.data });
          }
        } catch {
          // Si falla, logout
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);