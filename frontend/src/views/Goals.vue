<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
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
        await api.put(`goals/${id}`, {
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
        <h1 class="text-3xl font-bold text-white">Financial Goals 🎯</h1>
        <p class="text-text-muted mt-1">Wujudkan impianmu satu per satu</p>
      </div>
      <button @click="isModalOpen = true" class="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold shadow-lg transition">
        + Buat Target Baru
      </button>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="goal in goals" :key="goal.id" class="bg-card-bg p-6 rounded-3xl border border-white/5 hover:border-accent/50 transition duration-300 relative overflow-hidden group">
        
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-bold text-white">{{ goal.name }}</h3>
            <p class="text-xs text-text-muted mt-1">Target: {{ formatRupiah(goal.targetAmount) }}</p>
          </div>
          <div class="bg-white/5 px-3 py-1 rounded-lg text-accent font-bold">
            {{ goal.percentage }}%
          </div>
        </div>

        <div class="w-full bg-dashboard-bg h-4 rounded-full mb-4 relative overflow-hidden">
          <div class="bg-gradient-to-r from-accent to-purple-400 h-4 rounded-full transition-all duration-1000" :style="{ width: goal.percentage + '%' }"></div>
        </div>

        <div class="flex justify-between items-center mt-4">
          <div>
            <p class="text-text-muted text-xs">Terkumpul</p>
            <p class="text-white font-bold text-lg">{{ formatRupiah(goal.currentAmount) }}</p>
          </div>
          <button @click="updateSavings(goal.id)" class="bg-success/20 text-success hover:bg-success hover:text-white px-4 py-2 rounded-lg font-bold transition text-sm">
            + Tabung
          </button>
        </div>
      </div>
      
      <div v-if="goals.length === 0" class="col-span-full text-center py-20 text-text-muted border border-dashed border-white/10 rounded-3xl">
        Belum ada target impian. Yuk bikin sekarang!
      </div>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div class="bg-card-bg w-96 p-8 rounded-2xl border border-white/10 shadow-2xl">
        <h3 class="text-xl font-bold text-white mb-6">Target Apa Nih?</h3>
        <form @submit.prevent="addGoal" class="space-y-4">
          <input v-model="form.name" placeholder="Nama Impian (ex: Nikah)" class="w-full bg-dashboard-bg p-3 rounded-xl text-white border border-white/10 focus:border-accent outline-none" required>
          <input v-model="form.targetAmount" type="number" placeholder="Butuh Berapa (Rp)?" class="w-full bg-dashboard-bg p-3 rounded-xl text-white border border-white/10 focus:border-accent outline-none" required>
          <input v-model="form.startAmount" type="number" placeholder="Saldo Awal (Opsional)" class="w-full bg-dashboard-bg p-3 rounded-xl text-white border border-white/10 focus:border-accent outline-none">
          <div class="flex gap-3 mt-6">
            <button type="button" @click="isModalOpen = false" class="flex-1 text-text-muted hover:text-white">Batal</button>
            <button type="submit" class="flex-1 bg-accent text-white py-3 rounded-xl font-bold hover:shadow-lg">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>