<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import api from '../api';
import { useAuthStore } from '../stores/auth';

const props = defineProps(['isOpen']);
const emit = defineEmits(['close', 'refresh']);
const auth = useAuthStore();

const form = ref({
  name: '',
  amount: '',
  category: '', // Nanti diisi otomatis
  type: 'EXPENSE',
  walletId: '',
});

const wallets = ref([]);
const categories = ref([]); // Data mentah semua kategori

// Filter kategori sesuai tipe yang dipilih (Income/Expense)
const filteredCategories = computed(() => {
  return categories.value.filter((c) => c.type === form.value.type);
});

// Ambil Data Dompet & Kategori sekaligus
const initData = async () => {
  try {
    const [resWallets, resCats] = await Promise.all([
      api.get('9000/wallets'),
      api.get('9000/categories'),
    ]);

    wallets.value = resWallets.data.data.wallets;
    categories.value = resCats.data.data.categories;

    // Set Default Wallet
    if (wallets.value.length > 0) form.value.walletId = wallets.value[0].id;

    // Set Default Category (Pilih yang pertama dari list expense)
    setFirstCategory();
  } catch (error) {
    console.error('Gagal load data', error);
  }
};

// Helper untuk set kategori pertama saat ganti tipe
const setFirstCategory = () => {
  const available = categories.value.filter((c) => c.type === form.value.type);
  if (available.length > 0) {
    form.value.category = available[0].name;
  } else {
    form.value.category = ''; // Kosong jika tidak ada kategori
  }
};

// Pantau perubahan tipe transaksi, reset kategori
watch(
  () => form.value.type,
  () => {
    setFirstCategory();
  }
);

const handleSubmit = async () => {
  try {
    await axios.post('http://localhost:9000/expenses', form.value, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    alert('Berhasil disimpan!');
    emit('refresh');
    emit('close');
    form.value.name = '';
    form.value.amount = '';
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal menyimpan transaksi');
  }
};

onMounted(initData);
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
  >
    <div
      class="bg-card-bg w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl"
    >
      <h2 class="text-xl font-bold text-white mb-4">Add Transaction</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="flex bg-dashboard-bg p-1 rounded-lg">
          <button
            type="button"
            @click="form.type = 'EXPENSE'"
            :class="
              form.type === 'EXPENSE'
                ? 'bg-danger text-white'
                : 'text-text-muted'
            "
            class="flex-1 py-2 rounded-md font-bold transition"
          >
            Expense
          </button>
          <button
            type="button"
            @click="form.type = 'INCOME'"
            :class="
              form.type === 'INCOME'
                ? 'bg-success text-white'
                : 'text-text-muted'
            "
            class="flex-1 py-2 rounded-md font-bold transition"
          >
            Income
          </button>
        </div>

        <div>
          <label class="text-xs text-text-muted">Transaction Name</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full bg-dashboard-bg border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none"
            placeholder="e.g. Nasi Goreng"
          />
        </div>

        <div>
          <label class="text-xs text-text-muted">Amount (Rp)</label>
          <input
            v-model="form.amount"
            type="number"
            required
            class="w-full bg-dashboard-bg border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none"
            placeholder="e.g. 15000"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-text-muted">Category</label>
            <select
              v-model="form.category"
              class="w-full bg-dashboard-bg border border-white/10 rounded-lg p-3 text-white outline-none"
              required
            >
              <option
                v-for="c in filteredCategories"
                :key="c.id"
                :value="c.name"
              >
                {{ c.name }}
              </option>
              <option v-if="filteredCategories.length === 0" value="" disabled>
                Belum ada kategori
              </option>
            </select>
          </div>

          <div>
            <label class="text-xs text-text-muted">Wallet</label>
            <select
              v-model="form.walletId"
              class="w-full bg-dashboard-bg border border-white/10 rounded-lg p-3 text-white outline-none"
            >
              <option v-for="w in wallets" :key="w.id" :value="w.id">
                {{ w.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 py-3 text-text-muted hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/50 transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
