<script setup>
import { computed } from 'vue';
import { useAuthStore } from './stores/auth';
import Sidebar from './components/Sidebar.vue';
// Kita tidak import Dashboard/Goals disini lagi, Router yang akan mengurusnya

const auth = useAuthStore();
const isLoggedIn = computed(() => !!auth.token);
</script>

<template>
  <div v-if="isLoggedIn" class="bg-dashboard-bg min-h-screen text-text-main flex font-sans">
    <Sidebar />
    
    <main class="flex-1 ml-64 p-8 bg-dashboard-bg overflow-y-auto h-screen">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>

  <div v-else class="bg-dashboard-bg min-h-screen">
    <router-view />
  </div>
</template>

<style>
/* Animasi halus saat pindah halaman */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>