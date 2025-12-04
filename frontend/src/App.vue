<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import Sidebar from './components/Sidebar.vue';
import Footer from './components/Footer.vue'; // Pastikan sudah diimport

const auth = useAuthStore();
const isLoggedIn = computed(() => !!auth.token);

// State untuk Sidebar Mobile
const isMobileMenuOpen = ref(false);

onMounted(() => {
  if (isLoggedIn.value) auth.fetchUser();
});
</script>

<template>
  <div
    v-if="isLoggedIn"
    class="bg-dashboard-bg min-h-screen text-text-main flex font-sans"
  >
    <Sidebar :isOpen="isMobileMenuOpen" @close="isMobileMenuOpen = false" />

    <main
      class="flex-1 p-4 md:p-8 bg-dashboard-bg min-h-screen transition-all duration-300 ml-0 md:ml-64 w-full flex flex-col"
    >
      <div class="md:hidden flex items-center gap-4 mb-6">
        <button
          @click="isMobileMenuOpen = true"
          class="p-2 bg-card-bg rounded-lg border border-white/10 text-white hover:bg-accent transition"
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
        <h1 class="text-xl font-bold text-white">Fina App</h1>
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

  <div v-else class="bg-dashboard-bg min-h-screen">
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