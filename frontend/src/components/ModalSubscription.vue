<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';

const props = defineProps(['isOpen']);
const emit = defineEmits(['close', 'refresh']);

const wallets = ref([]);
const categories = ref([]);
const isLoading = ref(false);

const form = ref({
  name: '',
  amount: '',
  category: '',
  walletId: '',
  nextPaymentDate: ''
});

// Ambil Data Pendukung (Dompet & Kategori)
const initData = async () => {
  try {
    const [resWallets, resCats] = await Promise.all([
      api.get('/wallets'),
      api.get('/categories')
    ]);
    wallets.value = resWallets.data.data.wallets;
    // Filter hanya kategori Expense
    categories.value = resCats.data.data.categories.filter(c => c.type === 'EXPENSE');

    // Set Default
    if (wallets.value.length) form.value.walletId = wallets.value[0].id;
    if (categories.value.length) form.value.category = categories.value[0].name;
  } catch (error) { console.error(error); }
};

const handleSubmit = async () => {
  isLoading.value = true;
  try {
    await api.post('/subscriptions', form.value);
    alert('Langganan berhasil disimpan!');
    emit('refresh');
    emit('close');
    // Reset Form
    form.value.name = '';
    form.value.amount = '';
  } catch (error) {
    alert('Gagal menyimpan langganan');
  } finally {
    isLoading.value = false;
  }
};

onMounted(initData);
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div class="bg-card-bg w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl">
      <h2 class="text-xl font-bold text-white mb-4">New Subscription 📅</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        
        <div>
          <label class="text-xs text-text-muted">Service Name</label>
          <input v-model="form.name" type="text" required class="w-full bg-dashboard-bg border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none" placeholder="e.g. Netflix Premium">
        </div>

        <div>
          <label class="text-xs text-text-muted">Amount (Rp)</label>
          <input v-model="form.amount" type="number" required class="w-full bg-dashboard-bg border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none" placeholder="e.g. 186000">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-text-muted">Category</label>
            <select v-model="form.category" class="w-full bg-dashboard-bg border border-white/10 rounded-lg p-3 text-white outline-none">
              <option v-for="c in categories" :key="c.id" :value="c.name">{{ c.name }}</option>
            </select>
          </div>
          <div>
             <label class="text-xs text-text-muted">Pay With</label>
             <select v-model="form.walletId" class="w-full bg-dashboard-bg border border-white/10 rounded-lg p-3 text-white outline-none">
                <option v-for="w in wallets" :key="w.id" :value="w.id">{{ w.name }}</option>
             </select>
          </div>
        </div>

        <div>
          <label class="text-xs text-text-muted">Next Payment Date</label>
          <input v-model="form.nextPaymentDate" type="date" required class="w-full bg-dashboard-bg border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none">
        </div>

        <div class="flex gap-3 mt-6">
          <button type="button" @click="$emit('close')" class="flex-1 py-3 text-text-muted hover:text-white transition">Cancel</button>
          <button type="submit" :disabled="isLoading" class="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl shadow-lg transition">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>