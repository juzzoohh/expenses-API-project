<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const props = defineProps(['isOpen']);
const emit = defineEmits(['close', 'refresh']);
const auth = useAuthStore();

const form = ref({
  name: '',
  amount: '',
  category: 'Food',
  type: 'EXPENSE',
  walletId: '' // Ini wajib diisi
});

const wallets = ref([]);

// Ambil daftar dompet saat modal dibuka
const fetchWallets = async () => {
  try {
    const res = await axios.get('http://localhost:9000/wallets', {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    wallets.value = res.data.data.wallets;
    // Set default wallet ke yang pertama
    if (wallets.value.length > 0) form.value.walletId = wallets.value[0].id;
  } catch (error) {
    console.error("Gagal ambil wallet", error);
  }
};

const handleSubmit = async () => {
  try {
    await axios.post('http://localhost:9000/expenses', form.value, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    alert('Berhasil disimpan!');
    emit('refresh'); // Suruh Dashboard refresh data
    emit('close');   // Tutup modal
    // Reset form
    form.value.name = '';
    form.value.amount = '';
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal menyimpan transaksi');
  }
};

onMounted(() => {
  fetchWallets();
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div class="bg-card-bg w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl">
      <h2 class="text-xl font-bold text-white mb-4">Add Transaction</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="flex bg-dashboard-bg p-1 rounded-lg">
          <button type="button" @click="form.type = 'EXPENSE'" :class="form.type === 'EXPENSE' ? 'bg-danger text-white' : 'text-text-muted'" class="flex-1 py-2 rounded-md font-bold transition">Expense</button>
          <button type="button" @click="form.type = 'INCOME'" :class="form.type === 'INCOME' ? 'bg-success text-white' : 'text-text-muted'" class="flex-1 py-2 rounded-md font-bold transition">Income</button>
        </div>

        <div>
          <label class="text-xs text-text-muted">Transaction Name</label>
          <input v-model="form.name" type="text" required class="w-full bg-dashboard-bg border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none" placeholder="e.g. Nasi Goreng">
        </div>

        <div>
          <label class="text-xs text-text-muted">Amount (Rp)</label>
          <input v-model="form.amount" type="number" required class="w-full bg-dashboard-bg border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none" placeholder="e.g. 15000">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-text-muted">Category</label>
            <select v-model="form.category" class="w-full bg-dashboard-bg border border-white/10 rounded-lg p-3 text-white outline-none">
              <option>Food</option>
              <option>Transport</option>
              <option>Entertainment</option>
              <option>Salary</option>
              <option>Others</option>
            </select>
          </div>
          <div>
             <label class="text-xs text-text-muted">Wallet</label>
             <select v-model="form.walletId" class="w-full bg-dashboard-bg border border-white/10 rounded-lg p-3 text-white outline-none">
                <option v-for="w in wallets" :key="w.id" :value="w.id">{{ w.name }}</option>
             </select>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button type="button" @click="$emit('close')" class="flex-1 py-3 text-text-muted hover:text-white transition">Cancel</button>
          <button type="submit" class="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/50 transition">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>