<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const props = defineProps(['isOpen']);
const emit = defineEmits(['close', 'refresh']);
const auth = useAuthStore();
const isLoading = ref(false);
const categories = ref([]);

const form = ref({
  category: '',
  amount: ''
});

// Ambil Kategori Tipe EXPENSE saja
const fetchCategories = async () => {
  try {
    const res = await axios.get('http://localhost:9000/categories', {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    // Filter hanya Expense
    categories.value = res.data.data.categories.filter(c => c.type === 'EXPENSE');
    
    // Set default
    if (categories.value.length > 0) form.value.category = categories.value[0].name;
  } catch (error) { console.error(error); }
};

const handleSubmit = async () => {
  isLoading.value = true;
  try {
    await axios.post('http://localhost:9000/budgets', {
      category: form.value.category,
      amount: parseInt(form.value.amount)
    }, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    alert('Budget berhasil diatur!');
    emit('refresh');
    emit('close');
    form.value.amount = '';
  } catch (error) {
    alert('Gagal menyimpan budget');
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchCategories);
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div class="bg-card-bg w-96 p-8 rounded-2xl border border-white/10 shadow-2xl">
      <h2 class="text-xl font-bold text-white mb-6">Set Monthly Limit 🛡️</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="text-xs text-text-muted mb-1 block">Category</label>
          <select v-model="form.category" class="w-full bg-dashboard-bg p-3 rounded-xl text-white border border-white/10 focus:border-accent outline-none">
            <option v-for="c in categories" :key="c.id" :value="c.name">{{ c.name }}</option>
            <option v-if="categories.length === 0" disabled>Buat kategori Expense dulu!</option>
          </select>
        </div>

        <div>
          <label class="text-xs text-text-muted mb-1 block">Limit Amount (Rp)</label>
          <input v-model="form.amount" type="number" placeholder="Contoh: 1500000" class="w-full bg-dashboard-bg p-3 rounded-xl text-white border border-white/10 focus:border-accent outline-none" required>
        </div>

        <div class="flex gap-3 mt-6">
          <button type="button" @click="$emit('close')" class="flex-1 text-text-muted hover:text-white transition">Cancel</button>
          <button type="submit" :disabled="isLoading" class="flex-1 bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-bold shadow-lg transition">
            Save Limit
          </button>
        </div>
      </form>
    </div>
  </div>
</template>