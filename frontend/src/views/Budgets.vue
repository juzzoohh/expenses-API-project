<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';
import { useAuthStore } from '../stores/auth';
import ModalBudget from '../components/ModalBudget.vue';

const auth = useAuthStore();
const budgets = ref([]);
const isModalOpen = ref(false);

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const fetchBudgets = async () => {
  try {
    const res = await api.get('/budgets');
    budgets.value = res.data.data.budgets;
  } catch (error) {
    console.error(error);
  }
};

// Fungsi Warna Progress Bar
const getProgressColor = (status) => {
  if (status === 'OVER') return 'bg-danger shadow-[0_0_10px_rgba(248,113,113,0.5)]'; // Merah Menyala
  if (status === 'WARNING') return 'bg-orange-400'; // Kuning
  return 'bg-success'; // Hijau
};

onMounted(fetchBudgets);
</script>

<template>
  <div>
    <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white">Monthly Budget 🛡️</h1>
        <p class="text-text-muted mt-1">Jaga pengeluaranmu agar tidak boncos</p>
      </div>
      <button @click="isModalOpen = true" class="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold shadow-lg transition">
        + Set Limit
      </button>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <div v-for="b in budgets" :key="b.id" class="bg-card-bg p-6 rounded-3xl border border-white/5 hover:border-accent/30 transition group">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl">
               <span v-if="b.category === 'Food'">🍔</span>
               <span v-else-if="b.category === 'Transport'">🚗</span>
               <span v-else-if="b.category === 'Entertainment'">🎬</span>
               <span v-else>📦</span>
            </div>
            <div>
              <h3 class="font-bold text-white">{{ b.category }}</h3>
              <p class="text-xs text-text-muted">Limit: {{ formatRupiah(b.limit) }}</p>
            </div>
          </div>
          
          <div :class="`px-3 py-1 rounded-lg text-xs font-bold ${b.status === 'OVER' ? 'bg-red-500/20 text-danger' : 'bg-green-500/20 text-success'}`">
            {{ b.status === 'OVER' ? 'OVER BUDGET!' : (b.remaining < 0 ? '0 Left' : formatRupiah(b.remaining) + ' Left') }}
          </div>
        </div>

        <div class="relative w-full h-4 bg-dashboard-bg rounded-full overflow-hidden">
          <div 
            :class="`h-full rounded-full transition-all duration-1000 ${getProgressColor(b.status)}`"
            :style="{ width: Math.min(b.percentage, 100) + '%' }"
          ></div>
        </div>
        
        <div class="flex justify-between mt-2 text-xs">
          <span class="text-white font-bold">{{ formatRupiah(b.spent) }} Used</span>
          <span class="text-text-muted">{{ b.percentage }}%</span>
        </div>
      </div>

      <div v-if="budgets.length === 0" class="col-span-full text-center py-10 border border-dashed border-white/10 rounded-3xl text-text-muted">
        Belum ada budget yang diatur bulan ini. Pasang limit biar hemat!
      </div>

    </div>

    <ModalBudget :isOpen="isModalOpen" @close="isModalOpen = false" @refresh="fetchBudgets" />
  </div>
</template>