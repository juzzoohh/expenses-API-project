<script setup>
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';
import { useRouter } from 'vue-router';

const props = defineProps(['isOpen']);
const emit = defineEmits(['close']);

const auth = useAuthStore();
const theme = useThemeStore();
const router = useRouter();

const menuItems = [
  { name: 'Dashboard', icon: '📊', path: '/' },
  { name: 'Transactions', icon: '💸', path: '/transactions' },
  { name: 'Budgeting', icon: '🛡️', path: '/budgeting' },
  { name: 'Categories', icon: '🏷️', path: '/categories' },
  { name: 'Financial Goals', icon: '🎯', path: '/goals' },
  { name: 'Subscriptions', icon: '📅', path: '/subscriptions' },
  { name: 'Tools', icon: '🧮', path: '/tools' },
  { name: 'Settings', icon: '⚙️', path: '/settings' },
];

const handleLogout = () => {
  if (confirm("Yakin mau logout?")) {
    auth.logout();
    router.push('/login');
  }
};

const getInitials = (fullname) => {
    if (!fullname) return '..';
    const names = fullname.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) initials += names[names.length - 1].substring(0, 1).toUpperCase();
    return initials;
};
</script>

<template>
  <div 
    v-if="isOpen" 
    @click="$emit('close')"
    class="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
  ></div>

  <aside 
    :class="[
      'fixed left-0 top-0 h-screen border-r flex flex-col p-6 z-40 w-64 transition-all duration-300 ease-in-out',
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      // LOGIKA BACKGROUND SIDEBAR
      theme.isDark 
        ? 'bg-card-bg border-white/10' 
        : 'bg-white border-gray-200'
    ]"
  >
    
    <div class="flex items-center justify-between mb-10 px-2">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-tr from-accent to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <div class="text-white font-black text-2xl italic pr-1">F<span class="text-purple-200">.</span></div>
            </div>
            <h1 :class="[
              'text-2xl font-bold tracking-wide transition-colors',
              theme.isDark ? 'text-white' : 'text-gray-900'
            ]">
              Fina
            </h1>
        </div>
        
        <button @click="$emit('close')" :class="['md:hidden hover:text-accent transition', theme.isDark ? 'text-text-muted' : 'text-gray-500']">
            ✕
        </button>
    </div>

    <div :class="[
      'flex items-center gap-4 mb-8 p-3 rounded-2xl transition-colors',
      theme.isDark ? 'bg-white/5' : 'bg-gray-100'
    ]">
      <div class="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-purple-500/30">
        {{ getInitials(auth.user?.fullname) }}
      </div>
      <div class="overflow-hidden">
        <h2 :class="[
          'font-bold truncate w-32 transition-colors',
          theme.isDark ? 'text-white' : 'text-gray-900'
        ]">
          {{ auth.user?.fullname || 'Loading...' }}
        </h2>
        <p :class="['text-xs truncate transition-colors', theme.isDark ? 'text-text-muted' : 'text-gray-500']">
          @{{ auth.user?.username }}
        </p>
      </div>
    </div>

    <nav class="flex-1 space-y-2 overflow-y-auto">
      <router-link 
        v-for="item in menuItems" 
        :key="item.name"
        :to="item.path"
        @click="$emit('close')" 
        active-class="bg-accent text-white shadow-lg shadow-purple-900/50"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-opacity-10',
          // LOGIKA WARNA MENU ITEM (Non-Active)
          theme.isDark 
            ? 'text-text-muted hover:bg-white hover:text-white' 
            : 'text-gray-600 hover:bg-gray-900 hover:text-gray-900'
        ]"
      >
        <span>{{ item.icon }}</span>
        <span class="font-medium">{{ item.name }}</span>
      </router-link>
    </nav>

    <div :class="['mt-auto pt-6 border-t space-y-2', theme.isDark ? 'border-white/10' : 'border-gray-200']">
      <button 
        @click="theme.toggleTheme()" 
        :class="[
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
          theme.isDark 
            ? 'text-text-muted hover:text-white hover:bg-white/5' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        ]"
      >
        <span>{{ theme.isDark ? '☀️' : '🌙' }}</span> 
        <span class="font-medium">{{ theme.isDark ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>
      
      <button 
        @click="handleLogout" 
        :class="[
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
          theme.isDark 
            ? 'text-text-muted hover:text-danger hover:bg-red-500/10' 
            : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
        ]"
      >
        <span>🚪</span> <span class="font-medium">Logout</span>
      </button>
    </div>
  </aside>
</template>