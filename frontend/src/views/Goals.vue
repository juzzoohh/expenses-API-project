<script setup>
import { ref, onMounted } from 'vue';
import { useThemeStore } from '../stores/theme';
import api from '../api';

const theme = useThemeStore();
const goals = ref([]);
const isModalOpen = ref(false);
const form = ref({ name: '', targetAmount: '', startAmount: '' });

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const fetchGoals = async () => {
  try {
    const res = await api.get('/goals');
    goals.value = res.data.data.goals;
  } catch (error) { console.error(error); }
};

const addGoal = async () => {
  try {
    await api.post('/goals', form.value);
    isModalOpen.value = false;
    form.value = { name: '', targetAmount: '', startAmount: '' };
    fetchGoals();
  } catch (error) { alert("Gagal"); }
};

const updateSavings = async (id) => {
    const amount = prompt("Masukkan jumlah tabungan (Rp):");
    if(!amount) return;
    try {
        await api.put(`/goals/${id}`, {
            amount: parseInt(amount), type: 'add'
        });
        fetchGoals();
    } catch(err) { alert("Gagal update"); }
}

onMounted(fetchGoals);
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
          Financial Goals 🎯
        </h1>
        <p 
          :class="[
            'mt-1',
            theme.isDark ? 'text-text-muted' : 'text-gray-600'
          ]"
        >
          Wujudkan impianmu satu per satu
        </p>
      </div>
      <button 
        @click="isModalOpen = true" 
        class="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold shadow-lg transition"
      >
        + Buat Target Baru
      </button>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="goal in goals" 
        :key="goal.id" 
        :class="[
          'p-6 rounded-3xl border hover:border-accent/50 transition duration-300 relative overflow-hidden group',
          theme.isDark 
            ? 'bg-card-bg border-white/5' 
            : 'bg-white border-gray-200 shadow-sm'
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
              {{ goal.name }}
            </h3>
            <p 
              :class="[
                'text-xs mt-1',
                theme.isDark ? 'text-text-muted' : 'text-gray-600'
              ]"
            >
              Target: {{ formatRupiah(goal.targetAmount) }}
            </p>
          </div>
          <div class="bg-white/5 px-3 py-1 rounded-lg text-accent font-bold">
            {{ goal.percentage }}%
          </div>
        </div>

        <div 
          :class="[
            'w-full h-4 rounded-full mb-4 relative overflow-hidden',
            theme.isDark ? 'bg-dashboard-bg' : 'bg-gray-200'
          ]"
        >
          <div 
            class="bg-gradient-to-r from-accent to-purple-400 h-4 rounded-full transition-all duration-1000" 
            :style="{ width: goal.percentage + '%' }"
          ></div>
        </div>

        <div class="flex justify-between items-center mt-4">
          <div>
            <p 
              :class="[
                'text-xs',
                theme.isDark ? 'text-text-muted' : 'text-gray-600'
              ]"
            >
              Terkumpul
            </p>
            <p 
              :class="[
                'font-bold text-lg',
                theme.isDark ? 'text-white' : 'text-gray-900'
              ]"
            >
              {{ formatRupiah(goal.currentAmount) }}
            </p>
          </div>
          <button 
            @click="updateSavings(goal.id)" 
            class="bg-success/20 text-success hover:bg-success hover:text-white px-4 py-2 rounded-lg font-bold transition text-sm"
          >
            + Tabung
          </button>
        </div>
      </div>
      
      <div 
        v-if="goals.length === 0" 
        :class="[
          'col-span-full text-center py-20 border border-dashed rounded-3xl',
          theme.isDark 
            ? 'text-text-muted border-white/10' 
            : 'text-gray-500 border-gray-300'
        ]"
      >
        Belum ada target impian. Yuk bikin sekarang!
      </div>
    </div>

    <div 
      v-if="isModalOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div 
        :class="[
          'w-96 p-8 rounded-2xl border shadow-2xl',
          theme.isDark 
            ? 'bg-card-bg border-white/10' 
            : 'bg-white border-gray-200'
        ]"
      >
        <h3 
          :class="[
            'text-xl font-bold mb-6',
            theme.isDark ? 'text-white' : 'text-gray-900'
          ]"
        >
          Target Apa Nih?
        </h3>
        <form @submit.prevent="addGoal" class="space-y-4">
          <input 
            v-model="form.name" 
            placeholder="Nama Impian (ex: Nikah)" 
            :class="[
              'w-full p-3 rounded-xl border focus:border-accent outline-none',
              theme.isDark 
                ? 'bg-dashboard-bg text-white border-white/10' 
                : 'bg-gray-50 text-gray-900 border-gray-200'
            ]"
            required
          >
          <input 
            v-model="form.targetAmount" 
            type="number" 
            placeholder="Butuh Berapa (Rp)?" 
            :class="[
              'w-full p-3 rounded-xl border focus:border-accent outline-none',
              theme.isDark 
                ? 'bg-dashboard-bg text-white border-white/10' 
                : 'bg-gray-50 text-gray-900 border-gray-200'
            ]"
            required
          >
          <input 
            v-model="form.startAmount" 
            type="number" 
            placeholder="Saldo Awal (Opsional)" 
            :class="[
              'w-full p-3 rounded-xl border focus:border-accent outline-none',
              theme.isDark 
                ? 'bg-dashboard-bg text-white border-white/10' 
                : 'bg-gray-50 text-gray-900 border-gray-200'
            ]"
          >
          <div class="flex gap-3 mt-6">
            <button 
              type="button" 
              @click="isModalOpen = false" 
              :class="[
                'flex-1 transition',
                theme.isDark 
                  ? 'text-text-muted hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              Batal
            </button>
            <button 
              type="submit" 
              class="flex-1 bg-accent text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>