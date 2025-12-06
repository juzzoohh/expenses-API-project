<script setup>
import { ref, onMounted } from 'vue';
import { useThemeStore } from '../stores/theme';
import api from '../api';
import { useAuthStore } from '../stores/auth';

const theme = useThemeStore();
const auth = useAuthStore();
const activeTab = ref('profile');
const isLoading = ref(false);

const profileForm = ref({ username: '', fullname: '' });
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' });

const fetchProfile = async () => {
  try {
    const res = await api.get('/users/profile');
    profileForm.value = res.data.data.user;
  } catch (error) { console.error(error); }
};

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
    auth.logout();
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal ganti password');
  } finally { isLoading.value = false; }
};

onMounted(fetchProfile);
</script>

<template>
  <div>
    <h1 
      :class="[
        'text-3xl font-bold mb-8',
        theme.isDark ? 'text-white' : 'text-gray-900'
      ]"
    >
      Settings ⚙️
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      
      <div class="md:col-span-1 space-y-2">
        <button 
          @click="activeTab = 'profile'"
          :class="[
            'w-full text-left px-4 py-3 rounded-xl font-bold transition',
            activeTab === 'profile' 
              ? 'bg-accent text-white' 
              : (theme.isDark 
                  ? 'bg-card-bg text-text-muted hover:text-white' 
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200')
          ]"
        >
          👤 Edit Profile
        </button>
        <button 
          @click="activeTab = 'security'"
          :class="[
            'w-full text-left px-4 py-3 rounded-xl font-bold transition',
            activeTab === 'security' 
              ? 'bg-accent text-white' 
              : (theme.isDark 
                  ? 'bg-card-bg text-text-muted hover:text-white' 
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200')
          ]"
        >
          🔒 Security
        </button>
      </div>

      <div 
        :class="[
          'md:col-span-3 p-8 rounded-3xl border',
          theme.isDark 
            ? 'bg-card-bg border-white/5' 
            : 'bg-white border-gray-200 shadow-sm'
        ]"
      >
        
        <div v-if="activeTab === 'profile'">
          <h2 
            :class="[
              'text-xl font-bold mb-6',
              theme.isDark ? 'text-white' : 'text-gray-900'
            ]"
          >
            General Information
          </h2>
          <form @submit.prevent="updateProfile" class="space-y-4 max-w-md">
            <div>
              <label 
                :class="[
                  'text-xs block mb-1',
                  theme.isDark ? 'text-text-muted' : 'text-gray-600'
                ]"
              >
                Username (Tidak bisa diubah)
              </label>
              <input 
                v-model="profileForm.username" 
                type="text" 
                disabled 
                :class="[
                  'w-full border rounded-xl p-3 cursor-not-allowed',
                  theme.isDark 
                    ? 'bg-dashboard-bg/50 border-white/5 text-gray-400' 
                    : 'bg-gray-100 border-gray-200 text-gray-500'
                ]"
              >
            </div>
            <div>
              <label 
                :class="[
                  'text-xs block mb-1',
                  theme.isDark ? 'text-text-muted' : 'text-gray-600'
                ]"
              >
                Full Name
              </label>
              <input 
                v-model="profileForm.fullname" 
                type="text" 
                :class="[
                  'w-full border rounded-xl p-3 focus:border-accent outline-none',
                  theme.isDark 
                    ? 'bg-dashboard-bg text-white border-white/10' 
                    : 'bg-gray-50 text-gray-900 border-gray-200'
                ]"
              >
            </div>
            <button 
              type="submit" 
              :disabled="isLoading" 
              class="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold shadow-lg transition mt-4"
            >
              Save Changes
            </button>
          </form>
        </div>

        <div v-if="activeTab === 'security'">
          <h2 
            :class="[
              'text-xl font-bold mb-6',
              theme.isDark ? 'text-white' : 'text-gray-900'
            ]"
          >
            Change Password
          </h2>
          <form @submit.prevent="changePassword" class="space-y-4 max-w-md">
            <div>
              <label 
                :class="[
                  'text-xs block mb-1',
                  theme.isDark ? 'text-text-muted' : 'text-gray-600'
                ]"
              >
                Old Password
              </label>
              <input 
                v-model="passwordForm.oldPassword" 
                type="password" 
                required 
                :class="[
                  'w-full border rounded-xl p-3 focus:border-accent outline-none',
                  theme.isDark 
                    ? 'bg-dashboard-bg text-white border-white/10' 
                    : 'bg-gray-50 text-gray-900 border-gray-200'
                ]"
              >
            </div>
            <div>
              <label 
                :class="[
                  'text-xs block mb-1',
                  theme.isDark ? 'text-text-muted' : 'text-gray-600'
                ]"
              >
                New Password
              </label>
              <input 
                v-model="passwordForm.newPassword" 
                type="password" 
                required 
                :class="[
                  'w-full border rounded-xl p-3 focus:border-accent outline-none',
                  theme.isDark 
                    ? 'bg-dashboard-bg text-white border-white/10' 
                    : 'bg-gray-50 text-gray-900 border-gray-200'
                ]"
              >
            </div>
            <div>
              <label 
                :class="[
                  'text-xs block mb-1',
                  theme.isDark ? 'text-text-muted' : 'text-gray-600'
                ]"
              >
                Confirm New Password
              </label>
              <input 
                v-model="passwordForm.confirmPassword" 
                type="password" 
                required 
                :class="[
                  'w-full border rounded-xl p-3 focus:border-accent outline-none',
                  theme.isDark 
                    ? 'bg-dashboard-bg text-white border-white/10' 
                    : 'bg-gray-50 text-gray-900 border-gray-200'
                ]"
              >
            </div>
            <button 
              type="submit" 
              :disabled="isLoading" 
              class="bg-danger hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition mt-4"
            >
              Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  </div>
</template>