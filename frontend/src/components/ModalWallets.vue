<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const props = defineProps(['isOpen']);
const emit = defineEmits(['close', 'refresh']); // refresh untuk update dashboard
const auth = useAuthStore();

const wallets = ref([]);
const newWalletName = ref('');
const isLoading = ref(false);

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

// Ambil Data Dompet
const fetchWallets = async () => {
  try {
    const res = await axios.get('http://localhost:9000/wallets', {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    wallets.value = res.data.data.wallets;
  } catch (error) {
    console.error("Gagal load wallet", error);
  }
};

// Tambah Dompet
const addWallet = async () => {
  if (!newWalletName.value) return;
  isLoading.value = true;
  try {
    await axios.post('http://localhost:9000/wallets', {
      name: newWalletName.value,
      balance: 0 // Default saldo 0, nanti diisi lewat fitur 'Income'
    }, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    newWalletName.value = '';
    await fetchWallets(); // Refresh list
    emit('refresh'); // Refresh dashboard juga
  } catch (error) {
    alert('Gagal tambah dompet');
  } finally {
    isLoading.value = false;
  }
};

// Hapus Dompet
const deleteWallet = async (id, name) => {
  if (!confirm(`Yakin hapus dompet "${name}"? Pastikan tidak ada riwayat transaksi di dalamnya.`)) return;
  
  try {
    await axios.delete(`http://localhost:9000/wallets/${id}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    await fetchWallets();
    emit('refresh');
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal menghapus dompet');
  }
};

onMounted(fetchWallets);
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div class="bg-card-bg w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-white">Manage Wallets</h2>
        <button @click="$emit('close')" class="text-text-muted hover:text-white">✕</button>
      </div>

      <form @submit.prevent="addWallet" class="flex gap-2 mb-6">
        <input 
          v-model="newWalletName" 
          type="text" 
          placeholder="New Wallet Name (e.g. OVO)" 
          class="flex-1 bg-dashboard-bg border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none"
          required
        />
        <button type="submit" :disabled="isLoading" class="bg-accent hover:bg-accent-hover text-white px-4 rounded-lg font-bold transition">
          +
        </button>
      </form>

      <div class="space-y-3 max-h-64 overflow-y-auto pr-2">
        <div v-for="w in wallets" :key="w.id" class="flex justify-between items-center bg-dashboard-bg p-3 rounded-xl border border-white/5">
          <div>
            <p class="text-white font-bold text-sm">{{ w.name }}</p>
            <p class="text-text-muted text-xs">{{ formatRupiah(w.balance) }}</p>
          </div>
          <button @click="deleteWallet(w.id, w.name)" class="text-text-muted hover:text-danger p-2 transition">
            🗑️
          </button>
        </div>
      </div>

    </div>
  </div>
</template>