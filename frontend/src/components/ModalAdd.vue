<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useThemeStore } from '../stores/theme';
import api from '../api';

const theme = useThemeStore();
const props = defineProps(['isOpen']);
const emit = defineEmits(['close', 'refresh']);

const form = ref({
  name: '',
  amount: '',
  category: '',
  type: 'EXPENSE',
  walletId: '',
});

const wallets = ref([]);
const categories = ref([]);

// Filter kategori sesuai tipe yang dipilih
const filteredCategories = computed(() => {
  return categories.value.filter((c) => c.type === form.value.type);
});

// Ambil Data Dompet & Kategori
const initData = async () => {
  try {
    const [resWallets, resCats] = await Promise.all([
      api.get('/wallets'),
      api.get('/categories'),
    ]);

    wallets.value = resWallets.data.data.wallets;
    categories.value = resCats.data.data.categories;

    // Set Default Wallet
    if (wallets.value.length > 0) form.value.walletId = wallets.value[0].id;

    // Set Default Category
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
    form.value.category = '';
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
    await api.post('/expenses', form.value);
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
      :class="[
        'w-full max-w-md p-6 rounded-2xl border shadow-2xl',
        theme.isDark 
          ? 'bg-card-bg border-white/10' 
          : 'bg-white border-gray-200'
      ]"
    >
      <h2 
        :class="[
          'text-xl font-bold mb-4',
          theme.isDark ? 'text-white' : 'text-gray-900'
        ]"
      >
        Add Transaction
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div 
          :class="[
            'flex p-1 rounded-lg',
            theme.isDark ? 'bg-dashboard-bg' : 'bg-gray-100'
          ]"
        >
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
          <label 
            :class="[
              'text-xs',
              theme.isDark ? 'text-text-muted' : 'text-gray-600'
            ]"
          >
            Transaction Name
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            :class="[
              'w-full border rounded-lg p-3 focus:border-accent outline-none',
              theme.isDark 
                ? 'bg-dashboard-bg text-white border-white/10' 
                : 'bg-gray-50 text-gray-900 border-gray-200'
            ]"
            placeholder="e.g. Nasi Goreng"
          />
        </div>

        <div>
          <label 
            :class="[
              'text-xs',
              theme.isDark ? 'text-text-muted' : 'text-gray-600'
            ]"
          >
            Amount (Rp)
          </label>
          <input
            v-model="form.amount"
            type="number"
            required
            :class="[
              'w-full border rounded-lg p-3 focus:border-accent outline-none',
              theme.isDark 
                ? 'bg-dashboard-bg text-white border-white/10' 
                : 'bg-gray-50 text-gray-900 border-gray-200'
            ]"
            placeholder="e.g. 15000"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label 
              :class="[
                'text-xs',
                theme.isDark ? 'text-text-muted' : 'text-gray-600'
              ]"
            >
              Category
            </label>
            <select
              v-model="form.category"
              :class="[
                'w-full border rounded-lg p-3 outline-none',
                theme.isDark 
                  ? 'bg-dashboard-bg text-white border-white/10' 
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              ]"
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
            <label 
              :class="[
                'text-xs',
                theme.isDark ? 'text-text-muted' : 'text-gray-600'
              ]"
            >
              Wallet
            </label>
            <select
              v-model="form.walletId"
              :class="[
                'w-full border rounded-lg p-3 outline-none',
                theme.isDark 
                  ? 'bg-dashboard-bg text-white border-white/10' 
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              ]"
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
            :class="[
              'flex-1 py-3 transition',
              theme.isDark 
                ? 'text-text-muted hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
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