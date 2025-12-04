<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api';

const subscriptions = ref([]);
const isLoading = ref(true);

const fetchSubs = async () => {
  try {
    const res = await api.get('/subscriptions');
    subscriptions.value = res.data.data.subscriptions;
  } catch (e) { console.error(e); } 
  finally { isLoading.value = false; }
};

// Filter hanya tagihan 7 hari ke depan (atau yang sudah telat)
const upcoming = computed(() => {
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  return subscriptions.value
    .filter(sub => {
      const dueDate = new Date(sub.next_payment_date);
      return dueDate <= nextWeek; // Telat atau maksimal 7 hari lagi
    })
    .sort((a, b) => new Date(a.next_payment_date) - new Date(b.next_payment_date)) // Urutkan tanggal terdekat
    .slice(0, 3); // Ambil 3 teratas saja biar gak penuh
});

// Helper Status Warna
const getStatusColor = (dateString) => {
  const due = new Date(dateString);
  const today = new Date();
  today.setHours(0,0,0,0);
  
  if (due < today) return 'text-danger'; // Telat
  if (due.getTime() === today.getTime()) return 'text-orange-400'; // Hari ini
  return 'text-white';
};

const getDayText = (dateString) => {
    const due = new Date(dateString);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return `Telat ${Math.abs(diff)} hari`;
    if (diff === 0) return 'HARI INI';
    if (diff === 1) return 'Besok';
    return `${diff} hari lagi`;
}

onMounted(fetchSubs);
</script>

<template>
  <div class="bg-card-bg p-6 rounded-3xl border border-white/5 h-full">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-white font-bold text-lg">Upcoming Bills 🔔</h3>
      <router-link to="/subscriptions" class="text-xs text-accent hover:underline">See All</router-link>
    </div>

    <div v-if="isLoading" class="text-text-muted text-sm">Loading...</div>

    <div v-else-if="upcoming.length > 0" class="space-y-4">
      <div v-for="sub in upcoming" :key="sub.id" class="flex items-center gap-3 bg-dashboard-bg p-3 rounded-xl border border-white/5">
        <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg">
          📅
        </div>
        <div class="flex-1">
          <h4 class="text-white font-bold text-sm">{{ sub.name }}</h4>
          <p :class="`text-xs font-bold ${getStatusColor(sub.next_payment_date)}`">
            {{ getDayText(sub.next_payment_date) }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-white text-xs font-bold">{{ new Intl.NumberFormat('id-ID').format(sub.amount) }}</p>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-text-muted text-sm">
      <p>Tidak ada tagihan minggu ini.</p>
      <p class="text-xs mt-1">Aman sentosa! 🏖️</p>
    </div>
  </div>
</template>