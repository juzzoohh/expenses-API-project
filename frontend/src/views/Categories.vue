<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const categories = ref([]);
const newCatName = ref('');
const newCatType = ref('EXPENSE'); // Default Expense
const isLoading = ref(false);

// Filter kategori biar rapi (Kiri Income, Kanan Expense)
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
    
    newCatName.value = ''; // Reset input
    fetchCategories(); // Refresh list
  } catch (error) {
    alert('Gagal menambah kategori');
  } finally { isLoading.value = false; }
};

const deleteCategory = async (id) => {
  if(!confirm("Yakin hapus kategori ini?")) return;
  try {
    await api.delete(`http://localhost:9000/categories/${id}`);
    fetchCategories();
  } catch (error) { alert("Gagal hapus"); }
};

onMounted(fetchCategories);
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-white mb-8">Manage Categories 🏷️</h1>

    <div class="bg-card-bg p-6 rounded-3xl border border-white/10 mb-8">
      <h3 class="text-white font-bold mb-4">Add New Category</h3>
      <form @submit.prevent="addCategory" class="flex gap-4 flex-col md:flex-row">
        
        <select v-model="newCatType" class="bg-dashboard-bg p-3 rounded-xl text-white border border-white/10 focus:border-accent outline-none">
          <option value="EXPENSE">🔴 Expense</option>
          <option value="INCOME">🟢 Income</option>
        </select>

        <input v-model="newCatName" type="text" placeholder="Category Name (e.g. Skincare)" class="flex-1 bg-dashboard-bg p-3 rounded-xl text-white border border-white/10 focus:border-accent outline-none" required>
        
        <button type="submit" :disabled="isLoading" class="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold transition shadow-lg">
          + Add
        </button>
      </form>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      <div>
        <h3 class="text-danger font-bold mb-4 flex items-center gap-2">🔴 Expense Categories</h3>
        <div class="space-y-3">
          <div v-for="c in expenseCats" :key="c.id" class="bg-card-bg p-4 rounded-xl border border-white/5 flex justify-between items-center group">
            <span class="text-white">{{ c.name }}</span>
            <button @click="deleteCategory(c.id)" class="text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition">🗑️</button>
          </div>
          <div v-if="expenseCats.length === 0" class="text-text-muted text-sm italic">Belum ada kategori pengeluaran.</div>
        </div>
      </div>

      <div>
        <h3 class="text-success font-bold mb-4 flex items-center gap-2">🟢 Income Categories</h3>
        <div class="space-y-3">
          <div v-for="c in incomeCats" :key="c.id" class="bg-card-bg p-4 rounded-xl border border-white/5 flex justify-between items-center group">
            <span class="text-white">{{ c.name }}</span>
            <button @click="deleteCategory(c.id)" class="text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition">🗑️</button>
          </div>
          <div v-if="incomeCats.length === 0" class="text-text-muted text-sm italic">Belum ada kategori pemasukan.</div>
        </div>
      </div>

    </div>
  </div>
</template>