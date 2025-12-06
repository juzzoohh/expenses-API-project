<script setup>
import { ref, onMounted, computed } from 'vue';
import { useThemeStore } from '../stores/theme';
import api from '../api';

const theme = useThemeStore();
const categories = ref([]);
const newCatName = ref('');
const newCatType = ref('EXPENSE');
const isLoading = ref(false);

const expenseCats = computed(() => categories.value.filter(c => c.type === 'EXPENSE'));
const incomeCats = computed(() => categories.value.filter(c => c.type === 'INCOME'));

const fetchCategories = async () => {
  try {
    const res = await api.get('/categories');
    categories.value = res.data.data.categories;
  } catch (error) { console.error(error); }
};

const addCategory = async () => {
  if (!newCatName.value) return;
  isLoading.value = true;
  try {
    await api.post('/categories', {
      name: newCatName.value,
      type: newCatType.value
    });
    
    newCatName.value = '';
    fetchCategories();
  } catch (error) {
    alert('Gagal menambah kategori');
  } finally { isLoading.value = false; }
};

const deleteCategory = async (id) => {
  if(!confirm("Yakin hapus kategori ini?")) return;
  try {
    await api.delete(`/categories/${id}`);
    fetchCategories();
  } catch (error) { alert("Gagal hapus"); }
};

onMounted(fetchCategories);
</script>

<template>
  <div>
    <h1 
      :class="[
        'text-3xl font-bold mb-8',
        theme.isDark ? 'text-white' : 'text-gray-900'
      ]"
    >
      Manage Categories 🏷️
    </h1>

    <div 
      :class="[
        'p-6 rounded-3xl border mb-8',
        theme.isDark 
          ? 'bg-card-bg border-white/10' 
          : 'bg-white border-gray-200 shadow-sm'
      ]"
    >
      <h3 
        :class="[
          'font-bold mb-4',
          theme.isDark ? 'text-white' : 'text-gray-900'
        ]"
      >
        Add New Category
      </h3>
      <form @submit.prevent="addCategory" class="flex gap-4 flex-col md:flex-row">
        
        <select 
          v-model="newCatType" 
          :class="[
            'p-3 rounded-xl border focus:border-accent outline-none',
            theme.isDark 
              ? 'bg-dashboard-bg text-white border-white/10' 
              : 'bg-gray-50 text-gray-900 border-gray-200'
          ]"
        >
          <option value="EXPENSE">🔴 Expense</option>
          <option value="INCOME">🟢 Income</option>
        </select>

        <input 
          v-model="newCatName" 
          type="text" 
          placeholder="Category Name (e.g. Skincare)" 
          :class="[
            'flex-1 p-3 rounded-xl border focus:border-accent outline-none',
            theme.isDark 
              ? 'bg-dashboard-bg text-white border-white/10' 
              : 'bg-gray-50 text-gray-900 border-gray-200'
          ]"
          required
        >
        
        <button 
          type="submit" 
          :disabled="isLoading" 
          class="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold transition shadow-lg"
        >
          + Add
        </button>
      </form>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      <div>
        <h3 class="text-danger font-bold mb-4 flex items-center gap-2">🔴 Expense Categories</h3>
        <div class="space-y-3">
          <div 
            v-for="c in expenseCats" 
            :key="c.id" 
            :class="[
              'p-4 rounded-xl border flex justify-between items-center group',
              theme.isDark 
                ? 'bg-card-bg border-white/5' 
                : 'bg-white border-gray-200 shadow-sm'
            ]"
          >
            <span 
              :class="[
                theme.isDark ? 'text-white' : 'text-gray-900'
              ]"
            >
              {{ c.name }}
            </span>
            <button 
              @click="deleteCategory(c.id)" 
              :class="[
                'opacity-0 group-hover:opacity-100 transition',
                theme.isDark 
                  ? 'text-text-muted hover:text-danger' 
                  : 'text-gray-400 hover:text-danger'
              ]"
            >
              🗑️
            </button>
          </div>
          <div 
            v-if="expenseCats.length === 0" 
            :class="[
              'text-sm italic',
              theme.isDark ? 'text-text-muted' : 'text-gray-500'
            ]"
          >
            Belum ada kategori pengeluaran.
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-success font-bold mb-4 flex items-center gap-2">🟢 Income Categories</h3>
        <div class="space-y-3">
          <div 
            v-for="c in incomeCats" 
            :key="c.id" 
            :class="[
              'p-4 rounded-xl border flex justify-between items-center group',
              theme.isDark 
                ? 'bg-card-bg border-white/5' 
                : 'bg-white border-gray-200 shadow-sm'
            ]"
          >
            <span 
              :class="[
                theme.isDark ? 'text-white' : 'text-gray-900'
              ]"
            >
              {{ c.name }}
            </span>
            <button 
              @click="deleteCategory(c.id)" 
              :class="[
                'opacity-0 group-hover:opacity-100 transition',
                theme.isDark 
                  ? 'text-text-muted hover:text-danger' 
                  : 'text-gray-400 hover:text-danger'
              ]"
            >
              🗑️
            </button>
          </div>
          <div 
            v-if="incomeCats.length === 0" 
            :class="[
              'text-sm italic',
              theme.isDark ? 'text-text-muted' : 'text-gray-500'
            ]"
          >
            Belum ada kategori pemasukan.
          </div>
        </div>
      </div>

    </div>
  </div>
</template>