import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
    userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
    isLoading: false,
    error: null,
    
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.post('/api/users/login', { email, password });
            set({ userInfo: data, isLoading: false });
            localStorage.setItem('userInfo', JSON.stringify(data));
            return data;
        } catch (error) {
            set({ 
                error: error.response && error.response.data.message ? error.response.data.message : error.message, 
                isLoading: false 
            });
            throw error;
        }
    },

    googleLogin: async (credential) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.post('/api/users/google', { credential });
            set({ userInfo: data, isLoading: false });
            localStorage.setItem('userInfo', JSON.stringify(data));
            return data;
        } catch (error) {
            set({ 
                error: error.response && error.response.data.message ? error.response.data.message : error.message, 
                isLoading: false 
            });
            throw error;
        }
    },

    register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.post('/api/users/register', { name, email, password });
            set({ userInfo: data, isLoading: false });
            localStorage.setItem('userInfo', JSON.stringify(data));
            return data;
        } catch (error) {
            set({ 
                error: error.response && error.response.data.message ? error.response.data.message : error.message, 
                isLoading: false 
            });
            throw error;
        }
    },
    logout: async () => {
        try {
            await api.post('/api/users/logout');
            set({ userInfo: null });
            localStorage.removeItem('userInfo');
        } catch (error) {
            console.error('Logout failed', error);
        }
    },

    updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.put('/api/users/profile', profileData);
            // Merge with existing userInfo to preserve token/isAdmin
            const merged = { ...JSON.parse(localStorage.getItem('userInfo') || '{}'), ...data };
            set({ userInfo: merged, isLoading: false });
            localStorage.setItem('userInfo', JSON.stringify(merged));
            return data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            set({ error: msg, isLoading: false });
            throw error;
        }
    },
}));

export default useAuthStore;
