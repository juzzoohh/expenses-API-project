<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const activeTab = ref('profile'); // 'profile' or 'security'
const isLoading = ref(false);

// State Profile
const profileForm = ref({ username: '', fullname: '' });

// State Password
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' });

// 1. Ambil Data Profil Saat Masuk
const fetchProfile = async () => {
  try {
    const res = await api.get('/users/profile');
    profileForm.value = res.data.data.user;
  } catch (error) { console.error(error); }
};

// 2. Simpan Profil Baru
const updateProfile = async () => {
  isLoading.value = true;
  try {
    await api.put('/users/profile', {
      fullname: profileForm.value.fullname
    });
    alert('Nama berhasil diubah!');
  } catch (error) { alert('Gagal update profil'); }
  finally { isLoading.value = false; }
};

// 3. Ganti Password
const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    return alert('Konfirmasi password tidak cocok!');
  }
  
  isLoading.value = true;
  try {
    await api.put('/users/password', {
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    });
    
    alert('Password berhasil diganti! Silakan login ulang.');
    auth.logout(); // Logout paksa demi keamanan
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal ganti password');
  } finally { isLoading.value = false; }
};

onMounted(fetchProfile);
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-white mb-8">Settings ⚙️</h1>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      
      <div class="md:col-span-1 space-y-2">
        <button 
          @click="activeTab = 'profile'"
          :class="`w-full text-left px-4 py-3 rounded-xl font-bold transition ${activeTab === 'profile' ? 'bg-accent text-white' : 'bg-card-bg text-text-muted hover:text-white'}`"
        >
          👤 Edit Profile
        </button>
        <button 
          @click="activeTab = 'security'"
          :class="`w-full text-left px-4 py-3 rounded-xl font-bold transition ${activeTab === 'security' ? 'bg-accent text-white' : 'bg-card-bg text-text-muted hover:text-white'}`"
        >
          🔒 Security
        </button>
      </div>

      <div class="md:col-span-3 bg-card-bg p-8 rounded-3xl border border-white/5">
        
        <div v-if="activeTab === 'profile'">
          <h2 class="text-xl font-bold text-white mb-6">General Information</h2>
          <form @submit.prevent="updateProfile" class="space-y-4 max-w-md">
            <div>
              <label class="text-xs text-text-muted block mb-1">Username (Tidak bisa diubah)</label>
              <input v-model="profileForm.username" type="text" disabled class="w-full bg-dashboard-bg/50 border border-white/5 rounded-xl p-3 text-gray-400 cursor-not-allowed">
            </div>
            <div>
              <label class="text-xs text-text-muted block mb-1">Full Name</label>
              <input v-model="profileForm.fullname" type="text" class="w-full bg-dashboard-bg border border-white/10 rounded-xl p-3 text-white focus:border-accent outline-none">
            </div>
            <button type="submit" :disabled="isLoading" class="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold shadow-lg transition mt-4">
              Save Changes
            </button>
          </form>
        </div>

        <div v-if="activeTab === 'security'">
          <h2 class="text-xl font-bold text-white mb-6">Change Password</h2>
          <form @submit.prevent="changePassword" class="space-y-4 max-w-md">
            <div>
              <label class="text-xs text-text-muted block mb-1">Old Password</label>
              <input v-model="passwordForm.oldPassword" type="password" required class="w-full bg-dashboard-bg border border-white/10 rounded-xl p-3 text-white focus:border-accent outline-none">
            </div>
            <div>
              <label class="text-xs text-text-muted block mb-1">New Password</label>
              <input v-model="passwordForm.newPassword" type="password" required class="w-full bg-dashboard-bg border border-white/10 rounded-xl p-3 text-white focus:border-accent outline-none">
            </div>
            <div>
              <label class="text-xs text-text-muted block mb-1">Confirm New Password</label>
              <input v-model="passwordForm.confirmPassword" type="password" required class="w-full bg-dashboard-bg border border-white/10 rounded-xl p-3 text-white focus:border-accent outline-none">
            </div>
            <button type="submit" :disabled="isLoading" class="bg-danger hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition mt-4">
              Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  </div>
</template>