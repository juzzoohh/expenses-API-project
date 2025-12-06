<script setup>
import { computed } from 'vue';
import { useThemeStore } from '../stores/theme';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend);

const theme = useThemeStore();
const props = defineProps(['breakdown']);

const chartData = computed(() => {
  const data = props.breakdown || [];
  
  return {
    labels: data.map(item => item.category),
    datasets: [
      {
        backgroundColor: ['#6C5DD3', '#FF754C', '#FFAF4E', '#7FBA7A', '#3F8CFF', '#94A3B8'],
        borderWidth: 0,
        data: data.map(item => item.total)
      }
    ]
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: { 
        color: theme.isDark ? '#FFFFFF' : '#1A1A1A', 
        font: { size: 12 }, 
        boxWidth: 10 
      }
    }
  }
}));
</script>

<template>
  <div 
    :class="[
      'p-6 rounded-3xl border h-full flex flex-col',
      theme.isDark 
        ? 'bg-card-bg border-white/5' 
        : 'bg-white border-gray-200 shadow-sm'
    ]"
  >
    <h3 
      :class="[
        'font-bold text-lg mb-4',
        theme.isDark ? 'text-white' : 'text-gray-900'
      ]"
    >
      Expense Breakdown 🍰
    </h3>
    
    <div v-if="props.breakdown && props.breakdown.length > 0" class="flex-1 min-h-[200px] relative">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
    
    <div 
      v-else 
      :class="[
        'flex-1 flex items-center justify-center text-sm',
        theme.isDark ? 'text-text-muted' : 'text-gray-500'
      ]"
    >
      Belum ada pengeluaran.
    </div>
  </div>
</template>