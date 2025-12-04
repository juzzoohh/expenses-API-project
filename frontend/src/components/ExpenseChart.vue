<script setup>
import { computed } from 'vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'vue-chartjs';

// Registrasi elemen Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps(['breakdown']); // Menerima data breakdown dari Dashboard

const chartData = computed(() => {
  // Jika tidak ada data, tampilkan dummy biar gak error
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

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right', // Legenda di kanan
      labels: { color: '#FFFFFF', font: { size: 12 }, boxWidth: 10 }
    }
  }
};
</script>

<template>
  <div class="bg-card-bg p-6 rounded-3xl border border-white/5 h-full flex flex-col">
    <h3 class="text-white font-bold text-lg mb-4">Expense Breakdown 🍰</h3>
    
    <div v-if="props.breakdown && props.breakdown.length > 0" class="flex-1 min-h-[200px] relative">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
    
    <div v-else class="flex-1 flex items-center justify-center text-text-muted text-sm">
      Belum ada pengeluaran.
    </div>
  </div>
</template>