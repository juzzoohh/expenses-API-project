<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import ModalAdd from '../components/ModalAdd.vue';

const auth = useAuthStore();
const transactions = ref([]);
const isModalOpen = ref(false);
const isLoading = ref(false);

// State untuk Filter
const filters = ref({
  name: '',
  category: ''
});

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

// Fetch Data dengan Filter
const fetchTransactions = async () => {
  isLoading.value = true;
  // Bangun Query String (misal: ?name=kopi&category=Food)
  const params = new URLSearchParams();
  if (filters.value.name) params.append('name', filters.value.name);
  if (filters.value.category) params.append('category', filters.value.category);

  try {
    const res = await axios.get(`http://localhost:9000/expenses?${params.toString()}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    transactions.value = res.data.data.expenses;
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

// Hapus Transaksi
const deleteTransaction = async (id, name) => {
  if(!confirm(`Hapus transaksi "${name}"? Saldo dompet akan dikembalikan.`)) return;

  try {
    await axios.delete(`http://localhost:9000/expenses/${id}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    fetchTransactions(); // Refresh data
  } catch (error) {
    alert("Gagal menghapus transaksi.");
  }
};

// Otomatis cari saat ketik (Debounce dikit biar gak spam server)
let timeout = null;
watch(() => filters.value.name, () => {
  clearTimeout(timeout);
  timeout = setTimeout(fetchTransactions, 500);
});

// Otomatis cari saat ganti kategori
watch(() => filters.value.category, fetchTransactions);

onMounted(fetchTransactions);
</script>

<template>
  <div>
    <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white">Transaction History</h1>
        <p class="text-text-muted mt-1">Kelola semua pemasukan & pengeluaranmu</p>
      </div>
      <button @click="isModalOpen = true" class="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold shadow-lg transition">
        + Add New
      </button>
    </header>

    <div class="bg-card-bg p-4 rounded-2xl border border-white/5 mb-6 flex gap-4 flex-col md:flex-row">
      <div class="flex-1">
        <input 
          v-model="filters.name" 
          placeholder="🔍 Cari transaksi (misal: Nasi Goreng)..." 
          class="w-full bg-dashboard-bg p-3 rounded-xl text-white border border-white/10 focus:border-accent outline-none"
        >
      </div>
      <div class="w-full md:w-48">
        <select v-model="filters.category" class="w-full bg-dashboard-bg p-3 rounded-xl text-white border border-white/10 focus:border-accent outline-none cursor-pointer">
          <option value="">Semua Kategori</option>
          <option>Food</option>
          <option>Transport</option>
          <option>Entertainment</option>
          <option>Salary</option>
          <option>Others</option>
        </select>
      </div>
    </div>

    <div class="bg-card-bg rounded-3xl border border-white/5 overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-white/5 text-text-muted text-xs uppercase font-bold">
          <tr>
            <th class="p-4">Transaction</th>
            <th class="p-4">Category</th>
            <th class="p-4">Date</th>
            <th class="p-4 text-right">Amount</th>
            <th class="p-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-white/5 transition">
            <td class="p-4">
              <div class="flex items-center gap-3">
                <div :class="`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${tx.type === 'INCOME' ? 'bg-green-500/20 text-success' : 'bg-red-500/20 text-danger'}`">
                  {{ tx.type === 'INCOME' ? '↓' : '↑' }}
                </div>
                <span class="font-bold text-white">{{ tx.name }}</span>
              </div>
            </td>
            <td class="p-4 text-sm text-text-muted">
              <span class="bg-dashboard-bg px-2 py-1 rounded border border-white/10">{{ tx.category }}</span>
            </td>
            <td class="p-4 text-sm text-text-muted">{{ new Date(tx.date).toLocaleDateString() }}</td>
            <td :class="`p-4 text-right font-bold ${tx.type === 'INCOME' ? 'text-success' : 'text-danger'}`">
              {{ tx.type === 'INCOME' ? '+' : '-' }} {{ formatRupiah(tx.amount) }}
            </td>
            <td class="p-4 text-center">
              <button @click="deleteTransaction(tx.id, tx.name)" class="text-text-muted hover:text-danger transition" title="Hapus">
                🗑️
              </button>
            </td>
          </tr>
          
          <tr v-if="transactions.length === 0 && !isLoading">
            <td colspan="5" class="p-8 text-center text-text-muted">
              Tidak ada transaksi yang ditemukan.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ModalAdd :isOpen="isModalOpen" @close="isModalOpen = false" @refresh="fetchTransactions" />
  </div>
</template>