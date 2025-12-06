<script setup>
import { ref, onMounted } from 'vue';
import { useThemeStore } from '../stores/theme';
import api from '../api';

const theme = useThemeStore();
const props = defineProps(['isOpen']);
const emit = defineEmits(['close', 'refresh']);

const wallets = ref([]);
const newWalletName = ref('');
const isLoading = ref(false);

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

const fetchWallets = async () => {
  try {
    const res = await api.get('/wallets');
    wallets.value = res.data.data.wallets;
  } catch (error) {
    console.error("Gagal load wallet", error);
  }
};

const addWallet = async () => {
  if (!newWalletName.value) return;
  isLoading.value = true;
  try {
    await api.post('/wallets', {
      name: newWalletName.value,
      balance: 0
    });
    newWalletName.value = '';
    await fetchWallets();
    emit('refresh');
  } catch (error) {
    alert('Gagal tambah dompet');
  } finally {
    isLoading.value = false;
  }
};

const deleteWallet = async (id, name) => {
  if (!confirm(`Yakin hapus dompet "${name}"? Pastikan tidak ada riwayat transaksi di dalamnya.`)) return;
  
  try {
    await api.delete(`/wallets/${id}`);
    await fetchWallets();
    emit('refresh');
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal menghapus dompet');
  }
};

onMounted(fetchWallets);
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
  >
    <div 
      :class="[
        'w-full max-w-md p-6 rounded-2xl border shadow-2xl',
        theme.isDark 
          ? 'bg-card-bg border-white/10' 
          : 'bg-white border-gray-200'
      ]"
    >
      <div class="flex justify-between items-center mb-6">
        <h2 
          :class="[
            'text-xl font-bold',
            theme.isDark ? 'text-white' : 'text-gray-900'
          ]"
        >
          Manage Wallets
        </h2>
        <button 
          @click="$emit('close')" 
          :class="[
            'transition',
            theme.isDark 
              ? 'text-text-muted hover:text-white' 
              : 'text-gray-400 hover:text-gray-900'
          ]"
        >
          ✕
        </button>
      </div>

      <form @submit.prevent="addWallet" class="flex gap-2 mb-6">
        <input 
          v-model="newWalletName" 
          type="text" 
          placeholder="New Wallet Name (e.g. OVO)" 
          :class="[
            'flex-1 border rounded-lg p-3 focus:border-accent outline-none',
            theme.isDark 
              ? 'bg-dashboard-bg text-white border-white/10' 
              : 'bg-gray-50 text-gray-900 border-gray-200'
          ]"
          required
        />
        <button 
          type="submit" 
          :disabled="isLoading" 
          class="bg-accent hover:bg-accent-hover text-white px-4 rounded-lg font-bold transition"
        >
          +
        </button>
      </form>

      <div class="space-y-3 max-h-64 overflow-y-auto pr-2">
        <div 
          v-for="w in wallets" 
          :key="w.id" 
          :class="[
            'flex justify-between items-center p-3 rounded-xl border',
            theme.isDark 
              ? 'bg-dashboard-bg border-white/5' 
              : 'bg-gray-50 border-gray-200'
          ]"
        >
          <div>
            <p 
              :class="[
                'font-bold text-sm',
                theme.isDark ? 'text-white' : 'text-gray-900'
              ]"
            >
              {{ w.name }}
            </p>
            <p 
              :class="[
                'text-xs',
                theme.isDark ? 'text-text-muted' : 'text-gray-600'
              ]"
            >
              {{ formatRupiah(w.balance) }}
            </p>
          </div>
          <button 
            @click="deleteWallet(w.id, w.name)" 
            :class="[
              'p-2 transition',
              theme.isDark 
                ? 'text-text-muted hover:text-danger' 
                : 'text-gray-400 hover:text-danger'
            ]"
          >
            🗑️
          </button>
        </div>
      </div>

    </div>
  </div>
</template>