import { defineStore } from 'pinia';
import api from '../api'; // Pakai API instance yang sudah kita buat

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: null, // <--- STATE BARU: Untuk menyimpan data profil user
  }),
  actions: {
    async login(username, password) {
      try {
        // Pakai api.post, bukan axios.post
        const response = await api.post('/login', { username, password });
        
        if (response.data.status === 'success') {
          this.token = response.data.data.accessToken;
          localStorage.setItem('token', this.token);
          // Setelah login sukses, langsung ambil data usernya
          await this.fetchUser(); 
          return true;
        }
        return false;
      } catch (error) {
        console.error("Login Failed:", error);
        return false;
      }
    },
    
    // --- ACTION BARU: AMBIL DATA USER ---
    async fetchUser() {
        if (!this.token) return;
        try {
            // Endpoint ini sudah kita buat di tahap sebelumnya
            const res = await api.get('/users/profile');
            this.user = res.data.data.user;
        } catch (error) {
            console.error("Gagal ambil profil user", error);
            // Jika token tidak valid saat ambil profil, logout sekalian
            if (error.response && error.response.status === 401) {
                this.logout();
            }
        }
    },

    logout() {
      this.token = '';
      this.user = null; // Reset user data
      localStorage.removeItem('token');
      // Redirect ke login ditangani di router atau interceptor
    }
  }
});