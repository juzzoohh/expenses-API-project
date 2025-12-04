import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
  }),
  actions: {
    async login(username, password) {
      try {
        const response = await axios.post('http://localhost:9000/login', {
          username,
          password
        });
        
        if (response.data.status === 'success') {
          this.token = response.data.data.accessToken;
          localStorage.setItem('token', this.token);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Login Failed:", error);
        return false;
      }
    },
    logout() {
      this.token = '';
      localStorage.removeItem('token');
      // Redirect ke login bisa ditambahkan di sini
    }
  }
});