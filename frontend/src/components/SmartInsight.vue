<script setup>
import { ref, onMounted } from 'vue';
import { useThemeStore } from '../stores/theme';
import api from '../api';

const theme = useThemeStore();
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
    :class="[
      'p-6 rounded-3xl border h-full flex flex-col relative overflow-hidden',
      theme.isDark 
        ? 'bg-card-bg border-white/5' 
        : 'bg-white border-gray-200 shadow-sm'
    ]"
  >
    <div
      :class="[
        'absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl',
        theme.isDark ? 'bg-accent/20' : 'bg-accent/10'
      ]"
    ></div>

    <div class="flex items-center gap-3 mb-4 relative z-10">
      <div
        class="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center text-xl shadow-lg shadow-purple-500/30"
      >
        ✨
      </div>
      <div>
        <h3 
          :class="[
            'font-bold text-lg',
            theme.isDark ? 'text-white' : 'text-gray-900'
          ]"
        >
          Gemini Advisor
        </h3>
        <p 
          :class="[
            'text-[10px]',
            theme.isDark ? 'text-text-muted' : 'text-gray-500'
          ]"
        >
          Powered by Google AI
        </p>
      </div>
    </div>

    <div
      :class="[
        'p-4 rounded-xl border flex-1 relative z-10 overflow-y-auto',
        theme.isDark 
          ? 'bg-dashboard-bg border-white/5' 
          : 'bg-gray-50 border-gray-200'
      ]"
    >
      <div v-if="isLoading" class="animate-pulse space-y-2">
        <div 
          :class="[
            'h-2 rounded w-3/4',
            theme.isDark ? 'bg-white/10' : 'bg-gray-300'
          ]"
        ></div>
        <div 
          :class="[
            'h-2 rounded w-1/2',
            theme.isDark ? 'bg-white/10' : 'bg-gray-300'
          ]"
        ></div>
        <div 
          :class="[
            'h-2 rounded w-full',
            theme.isDark ? 'bg-white/10' : 'bg-gray-300'
          ]"
        ></div>
      </div>

      <div 
        v-else 
        :class="[
          'text-sm leading-relaxed space-y-2',
          theme.isDark ? 'text-white' : 'text-gray-900'
        ]"
      >
        <span v-html="advice"></span>
      </div>
    </div>
  </div>
</template>