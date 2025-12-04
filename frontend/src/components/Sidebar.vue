<script setup>
import { ref } from 'vue'; // Tambahkan ref jika nanti butuh state lokal
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const menuItems = [
  { name: 'Dashboard', icon: '📊', path: '/' },
  { name: 'Financial Goals', icon: '🎯', path: '/goals' },  
  { name: 'Transactions', icon: '💸', path: '/transactions' }, 
  { name: 'Settings', icon: '⚙️', path: '/settings' },
];

const handleLogout = () => {
  const confirmLogout = confirm("Yakin mau logout, Boss?");
  if (confirmLogout) {
    auth.logout();
    router.push('/login');
  }
};
</script>

<template>
  <aside class="w-64 h-screen bg-card-bg border-r border-white/10 flex flex-col p-6 fixed left-0 top-0 overflow-y-auto z-40">
    <div class="flex items-center gap-4 mb-10">
      <div class="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-purple-500/30">
        NJ
      </div>
      <div>
        <h2 class="text-white font-bold">Nick Jenkins</h2>
        <p class="text-xs text-text-muted">Pro Account</p>
      </div>
    </div>

    <nav class="flex-1 space-y-2">
      <router-link 
        v-for="item in menuItems" 
        :key="item.name"
        :to="item.path"
        active-class="bg-accent text-white shadow-lg shadow-purple-900/50"
        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-text-muted hover:bg-white/5 hover:text-white"
      >
        <span>{{ item.icon }}</span>
        <span class="font-medium">{{ item.name }}</span>
      </router-link>
    </nav>

    <div class="mt-auto pt-6 border-t border-white/10">
      <button 
        @click="handleLogout" 
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:text-danger hover:bg-red-500/10 transition-all duration-200"
      >
        <span>🚪</span> 
        <span class="font-medium">Logout</span>
      </button>
    </div>
  </aside>
</template>