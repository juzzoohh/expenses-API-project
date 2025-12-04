<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const goals = ref([]);
const isModalOpen = ref(false);
const form = ref({ name: '', targetAmount: '', startAmount: '' });

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);

const fetchGoals = async () => {
  try {
    const res = await axios.get('http://localhost:9000/goals', {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    goals.value = res.data.data.goals;
  } catch (error) {
    console.error('Gagal load goals', error);
  }
};

const addGoal = async () => {
  try {
    await axios.post('http://localhost:9000/goals', form.value, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    isModalOpen.value = false;
    form.value = { name: '', targetAmount: '', startAmount: '' };
    fetchGoals();
  } catch (error) {
    alert('Gagal buat target');
  }
};

// Fitur Nabung Cepat (Opsional: klik tombol + di goal untuk update saldo)
const updateSavings = async (id, currentAmount) => {
  const amount = prompt(
    'Masukkan jumlah uang yang mau ditabung ke target ini:'
  );
  if (!amount) return;

  try {
    await axios.put(
      `http://localhost:9000/goals/${id}`,
      {
        amount: parseInt(amount),
        type: 'add',
      },
      { headers: { Authorization: `Bearer ${auth.token}` } }
    );
    fetchGoals();
  } catch (err) {
    alert('Gagal update saldo');
  }
};

onMounted(fetchGoals);
</script>

<template>
  <div class="bg-card-bg p-6 rounded-3xl border border-white/5 h-full">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-white font-bold text-lg">Financial Goals 🎯</h3>
      <button
        @click="isModalOpen = true"
        class="text-accent text-sm hover:underline font-bold"
      >
        + New Goal
      </button>
    </div>

    <div class="space-y-5 overflow-y-auto max-h-80 pr-2">
      <div v-for="goal in goals" :key="goal.id" class="group">
        <div class="flex justify-between text-sm mb-1">
          <span class="text-white font-bold">{{ goal.name }}</span>
          <span class="text-accent font-bold">{{ goal.percentage }}%</span>
        </div>

        <div
          class="w-full bg-dashboard-bg rounded-full h-3 mb-2 relative overflow-hidden"
        >
          <div
            class="bg-gradient-to-r from-accent to-purple-400 h-3 rounded-full transition-all duration-1000 ease-out"
            :style="{ width: goal.percentage + '%' }"
          ></div>
        </div>

        <div class="flex justify-between items-center text-xs text-text-muted">
          <span
            >{{ formatRupiah(goal.currentAmount) }} /
            {{ formatRupiah(goal.targetAmount) }}</span
          >
          <button
            @click="updateSavings(goal.id)"
            class="text-white hover:text-success transition opacity-0 group-hover:opacity-100"
          >
            + Tabung
          </button>
        </div>
      </div>

      <div
        v-if="goals.length === 0"
        class="text-center text-text-muted text-sm py-4"
      >
        Belum ada target. Ayo bermimpi!
      </div>
    </div>

    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div
        class="bg-card-bg w-80 p-6 rounded-2xl border border-white/10 shadow-2xl"
      >
        <h3 class="text-white font-bold mb-4">Set New Target</h3>
        <form @submit.prevent="addGoal" class="space-y-3">
          <input
            v-model="form.name"
            placeholder="Nama (misal: Laptop)"
            class="w-full bg-dashboard-bg p-2 rounded text-white border border-white/10 focus:border-accent outline-none"
            required
          />
          <input
            v-model="form.targetAmount"
            type="number"
            placeholder="Target (Rp)"
            class="w-full bg-dashboard-bg p-2 rounded text-white border border-white/10 focus:border-accent outline-none"
            required
          />
          <input
            v-model="form.startAmount"
            type="number"
            placeholder="Saldo Awal (Opsional)"
            class="w-full bg-dashboard-bg p-2 rounded text-white border border-white/10 focus:border-accent outline-none"
          />
          <div class="flex gap-2 mt-4">
            <button
              type="button"
              @click="isModalOpen = false"
              class="flex-1 text-text-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 bg-accent text-white py-2 rounded font-bold"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
