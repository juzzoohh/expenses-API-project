<script setup>
import { ref, onMounted } from 'vue';
import { useThemeStore } from '../stores/theme';
import api from '../api';
import ModalBudget from '../components/ModalBudget.vue';

const theme = useThemeStore();
const budgets = ref([]);
const isModalOpen = ref(false);

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const fetchBudgets = async () => {
  try {
    const res = await api.get('/budgets');
    budgets.value = res.data.data.budgets;
  } catch (error) { console.error(error); }
};

const getStatusStyle = (status) => {
  if (status === 'OVER') return { bg: 'bg-danger/20', text: 'text-danger', border: 'border-danger' };
  if (status === 'WARNING') return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-400' };
  return { bg: 'bg-success/20', text: 'text-success', border: 'border-success' };
};

onMounted(fetchBudgets);
</script>

<template>
  <div>
    <header class="flex justify-between items-center mb-8">
      <div>
        <h1 
          :class="[
            'text-3xl font-bold',
            theme.isDark ? 'text-white' : 'text-gray-900'
          ]"
        >
          Budget Monitoring 🛡️
        </h1>
        <p 
          :class="[
            'mt-1',
            theme.isDark ? 'text-text-muted' : 'text-gray-600'
          ]"
        >
          Jaga pengeluaranmu agar tidak boncos
        </p>
      </div>
      <button 
        @click="isModalOpen = true" 
        class="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold shadow-lg transition"
      >
        + Set Limit
      </button>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="b in budgets" 
        :key="b.id" 
        :class="[
          'p-6 rounded-3xl border transition duration-300',
          theme.isDark 
            ? `bg-card-bg ${getStatusStyle(b.status).border}` 
            : `bg-white border-gray-200 ${b.status !== 'SAFE' ? getStatusStyle(b.status).border : ''}`
        ]"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 
              :class="[
                'text-xl font-bold',
                theme.isDark ? 'text-white' : 'text-gray-900'
              ]"
            >
              {{ b.category }}
            </h3>
            <p 
              :class="[
                'text-xs mt-1',
                theme.isDark ? 'text-text-muted' : 'text-gray-600'
              ]"
            >
              Limit: {{ formatRupiah(b.limit) }}
            </p>
          </div>
          <div :class="`${getStatusStyle(b.status).bg} ${getStatusStyle(b.status).text} px-3 py-1 rounded-lg text-xs font-bold`">
            {{ b.percentage }}%
          </div>
        </div>

        <div 
          :class="[
            'w-full h-4 rounded-full mb-4 relative overflow-hidden',
            theme.isDark ? 'bg-dashboard-bg' : 'bg-gray-200'
          ]"
        >
          <div 
            :class="`h-4 rounded-full transition-all duration-1000 ${
              b.status === 'OVER' ? 'bg-danger' : 
              b.status === 'WARNING' ? 'bg-orange-400' : 'bg-success'
            }`"
            :style="{ width: Math.min(b.percentage, 100) + '%' }"
          ></div>
        </div>

        <div class="flex justify-between items-end">
          <div>
            <p 
              :class="[
                'text-xs',
                theme.isDark ? 'text-text-muted' : 'text-gray-600'
              ]"
            >
              Terpakai
            </p>
            <p 
              :class="[
                'font-bold text-lg',
                theme.isDark ? 'text-white' : 'text-gray-900'
              ]"
            >
              {{ formatRupiah(b.spent) }}
            </p>
          </div>
          <div class="text-right">
            <p 
              :class="[
                'text-xs',
                theme.isDark ? 'text-text-muted' : 'text-gray-600'
              ]"
            >
              Sisa
            </p>
            <p 
              :class="[
                'font-bold text-sm',
                b.remaining < 0 ? 'text-danger' : (theme.isDark ? 'text-success' : 'text-green-600')
              ]"
            >
              {{ formatRupiah(Math.max(b.remaining, 0)) }}
            </p>
          </div>
        </div>
      </div>

      <div 
        v-if="budgets.length === 0" 
        :class="[
          'col-span-full text-center py-20 border border-dashed rounded-3xl',
          theme.isDark 
            ? 'text-text-muted border-white/10' 
            : 'text-gray-500 border-gray-300'
        ]"
      >
        Belum ada budget yang diatur. Mulai atur batasmu!
      </div>
    </div>

    <ModalBudget 
      :isOpen="isModalOpen" 
      @close="isModalOpen = false" 
      @refresh="fetchBudgets" 
    />
  </div>
</template>