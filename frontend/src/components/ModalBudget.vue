<script setup>
import { ref, onMounted } from 'vue';
import { useThemeStore } from '../stores/theme';
import api from '../api';

const theme = useThemeStore();
const props = defineProps(['isOpen']);
const emit = defineEmits(['close', 'refresh']);

const isLoading = ref(false);
const categories = ref([]);

const form = ref({
  category: '',
  amount: ''
});

const fetchCategories = async () => {
  try {
    const res = await api.get('/categories');
    categories.value = res.data.data.categories.filter(c => c.type === 'EXPENSE');
    
    if (categories.value.length > 0) form.value.category = categories.value[0].name;
  } catch (error) { console.error(error); }
};

const handleSubmit = async () => {
  isLoading.value = true;
  try {
    await api.post('/budgets', {
      category: form.value.category,
      amount: parseInt(form.value.amount)
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
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
  >
    <div 
      :class="[
        'w-96 p-8 rounded-2xl border shadow-2xl',
        theme.isDark 
          ? 'bg-card-bg border-white/10' 
          : 'bg-white border-gray-200'
      ]"
    >
      <h2 
        :class="[
          'text-xl font-bold mb-6',
          theme.isDark ? 'text-white' : 'text-gray-900'
        ]"
      >
        Set Monthly Limit 🛡️
      </h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label 
            :class="[
              'text-xs mb-1 block',
              theme.isDark ? 'text-text-muted' : 'text-gray-600'
            ]"
          >
            Category
          </label>
          <select 
            v-model="form.category" 
            :class="[
              'w-full p-3 rounded-xl border focus:border-accent outline-none',
              theme.isDark 
                ? 'bg-dashboard-bg text-white border-white/10' 
                : 'bg-gray-50 text-gray-900 border-gray-200'
            ]"
          >
            <option v-for="c in categories" :key="c.id" :value="c.name">{{ c.name }}</option>
            <option v-if="categories.length === 0" disabled>Buat kategori Expense dulu!</option>
          </select>
        </div>

        <div>
          <label 
            :class="[
              'text-xs mb-1 block',
              theme.isDark ? 'text-text-muted' : 'text-gray-600'
            ]"
          >
            Limit Amount (Rp)
          </label>
          <input 
            v-model="form.amount" 
            type="number" 
            placeholder="Contoh: 1500000" 
            :class="[
              'w-full p-3 rounded-xl border focus:border-accent outline-none',
              theme.isDark 
                ? 'bg-dashboard-bg text-white border-white/10' 
                : 'bg-gray-50 text-gray-900 border-gray-200'
            ]"
            required
          >
        </div>

        <div class="flex gap-3 mt-6">
          <button 
            type="button" 
            @click="$emit('close')" 
            :class="[
              'flex-1 transition',
              theme.isDark 
                ? 'text-text-muted hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            :disabled="isLoading" 
            class="flex-1 bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-bold shadow-lg transition"
          >
            Save Limit
          </button>
        </div>
      </form>
    </div>
  </div>
</template>