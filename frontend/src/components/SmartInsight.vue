<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';

const advice = ref('Sedang menganalisa kebiasaanmu...');
const isLoading = ref(true);

const fetchInsight = async () => {
  try {
    const res = await api.get('/ai-insight');
    advice.value = res.data.data.insight;
  } catch (error) {
    advice.value = 'Gagal menghubungi otak AI.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchInsight);
</script>

<template>
  <div
    class="bg-card-bg p-6 rounded-3xl border border-white/5 h-full flex flex-col relative overflow-hidden"
  >
    <div
      class="absolute -right-10 -top-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl"
    ></div>

    <div class="flex items-center gap-3 mb-4 relative z-10">
      <div
        class="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center text-xl shadow-lg shadow-purple-500/30"
      >
        ✨
      </div>
      <div>
        <h3 class="text-white font-bold text-lg">Gemini Advisor</h3>
        <p class="text-[10px] text-text-muted">Powered by Google AI</p>
      </div>
    </div>

    <div
      class="bg-dashboard-bg p-4 rounded-xl border border-white/5 flex-1 relative z-10 overflow-y-auto"
    >
      <div v-if="isLoading" class="animate-pulse space-y-2">
        <div class="h-2 bg-white/10 rounded w-3/4"></div>
        <div class="h-2 bg-white/10 rounded w-1/2"></div>
        <div class="h-2 bg-white/10 rounded w-full"></div>
      </div>

      <div v-else class="text-white text-sm leading-relaxed space-y-2">
        <span v-html="advice"></span>
      </div>
    </div>
  </div>
</template>
