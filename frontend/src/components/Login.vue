<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();

// State untuk Mode (Login atau Register)
const isRegisterMode = ref(false);
const isLoading = ref(false);
const message = ref({ text: '', type: '' }); // type: 'success' | 'error'

// Form Data
const form = ref({
  username: '',
  password: '',
  fullname: '' // Hanya dipakai saat register
});

// Fungsi Reset Form saat ganti mode
const switchMode = () => {
  isRegisterMode.value = !isRegisterMode.value;
  message.value = { text: '', type: '' };
  form.value = { username: '', password: '', fullname: '' };
};

const handleSubmit = async () => {
  isLoading.value = true;
  message.value = { text: '', type: '' };

  try {
    if (isRegisterMode.value) {
      // --- LOGIKA REGISTER ---
      await axios.post('http://localhost:9000/users', {
        username: form.value.username,
        password: form.value.password,
        fullname: form.value.fullname
      });
      
      message.value = { text: 'Registrasi Berhasil! Silakan Login.', type: 'success' };
      // Otomatis pindah ke login setelah 1.5 detik
      setTimeout(() => {
        isRegisterMode.value = false;
        form.value.password = ''; // Clear password
        message.value = { text: '', type: '' };
      }, 1500);

    } else {
      // --- LOGIKA LOGIN ---
      const success = await auth.login(form.value.username, form.value.password);
      if (success) {
        window.location.reload(); 
      } else {
        message.value = { text: 'Username atau Password Salah!', type: 'error' };
      }
    }
  } catch (error) {
    console.error(error);
    const msg = error.response?.data?.message || 'Terjadi kesalahan pada server';
    message.value = { text: msg, type: 'error' };
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-dashboard-bg z-50">
    <div class="bg-card-bg p-8 rounded-2xl border border-white/10 w-96 shadow-2xl relative overflow-hidden">
      
      <div class="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>

      <h2 class="text-2xl font-bold text-white mb-2 text-center relative z-10">
        {{ isRegisterMode ? 'Create Account' : 'Welcome Back' }}
      </h2>
      <p class="text-text-muted text-center text-sm mb-6 relative z-10">
        {{ isRegisterMode ? 'Join us to manage your money better' : 'Enter your credentials to access' }}
      </p>
      
      <form @submit.prevent="handleSubmit" class="space-y-4 relative z-10">
        
        <div v-if="isRegisterMode" class="animate-fade-in">
          <label class="block text-text-muted text-xs mb-1 ml-1">Full Name</label>
          <input v-model="form.fullname" type="text" required class="w-full bg-dashboard-bg border border-white/10 rounded-xl p-3 text-white focus:border-accent outline-none transition" placeholder="John Doe" />
        </div>

        <div>
          <label class="block text-text-muted text-xs mb-1 ml-1">Username</label>
          <input v-model="form.username" type="text" required class="w-full bg-dashboard-bg border border-white/10 rounded-xl p-3 text-white focus:border-accent outline-none transition" placeholder="johndoe" />
        </div>
        
        <div>
          <label class="block text-text-muted text-xs mb-1 ml-1">Password</label>
          <input v-model="form.password" type="password" required class="w-full bg-dashboard-bg border border-white/10 rounded-xl p-3 text-white focus:border-accent outline-none transition" placeholder="••••••••" />
        </div>

        <div v-if="message.text" :class="`text-sm text-center font-medium p-2 rounded-lg ${message.type === 'error' ? 'bg-red-500/10 text-danger' : 'bg-green-500/10 text-success'}`">
          {{ message.text }}
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-accent hover:bg-accent-hover disabled:bg-gray-600 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-purple-900/50 mt-2"
        >
          {{ isLoading ? 'Processing...' : (isRegisterMode ? 'Sign Up' : 'Sign In') }}
        </button>
      </form>

      <div class="mt-6 text-center text-sm relative z-10">
        <span class="text-text-muted">
          {{ isRegisterMode ? 'Already have an account?' : "Don't have an account?" }}
        </span>
        <button 
          @click="switchMode" 
          class="text-accent font-bold hover:underline ml-1"
        >
          {{ isRegisterMode ? 'Login' : 'Register' }}
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>