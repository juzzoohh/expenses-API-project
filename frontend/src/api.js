import axios from 'axios';
import { useAuthStore } from './stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Ambil dari .env
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR (Satpam Otomatis)
// Sebelum request dikirim, tempelkan Token otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR RESPONSE
// Kalau token basi (401), otomatis logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token kadaluwarsa, paksa logout
      const auth = useAuthStore();
      auth.logout();
    }
    return Promise.reject(error);
  }
);

export default api;