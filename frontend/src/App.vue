<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useThemeStore } from './stores/theme';
import Sidebar from './components/Sidebar.vue';
import Footer from './components/Footer.vue';

const auth = useAuthStore();
const theme = useThemeStore();
const isLoggedIn = computed(() => !!auth.token);

const isMobileMenuOpen = ref(false);

onMounted(() => {
  theme.initTheme(); // Inisialisasi theme
  if (isLoggedIn.value) auth.fetchUser();
});
</script>

<template>
  <div
    v-if="isLoggedIn"
    :class="[
      'min-h-screen text-text-main flex font-sans transition-colors duration-300',
      theme.isDark ? 'bg-dashboard-bg' : 'bg-light-dashboard-bg'
    ]"
  >
    <Sidebar :isOpen="isMobileMenuOpen" @close="isMobileMenuOpen = false" />

    <main
      :class="[
        'flex-1 p-4 md:p-8 min-h-screen transition-all duration-300 ml-0 md:ml-64 w-full flex flex-col',
        theme.isDark ? 'bg-dashboard-bg' : 'bg-light-dashboard-bg'
      ]"
    >
      <div class="md:hidden flex items-center gap-4 mb-6">
        <button
          @click="isMobileMenuOpen = true"
          :class="[
            'p-2 rounded-lg border transition',
            theme.isDark 
              ? 'bg-card-bg border-white/10 text-white hover:bg-accent' 
              : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-100'
          ]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 :class="['text-xl font-bold', theme.isDark ? 'text-white' : 'text-gray-900']">
          Fina App
        </h1>

        <!-- TOGGLE THEME BUTTON (Mobile) -->
        <button
          @click="theme.toggleTheme()"
          :class="[
            'ml-auto p-2 rounded-lg border transition',
            theme.isDark 
              ? 'bg-card-bg border-white/10 text-white hover:bg-accent' 
              : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-100'
          ]"
        >
          <span v-if="theme.isDark">☀️</span>
          <span v-else>🌙</span>
        </button>
      </div>

      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>

      <div class="mt-auto pt-8">
        <Footer />
      </div>
    </main>
  </div>

  <div v-else :class="['min-h-screen', theme.isDark ? 'bg-dashboard-bg' : 'bg-light-dashboard-bg']">
    <router-view />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>