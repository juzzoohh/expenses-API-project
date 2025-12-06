<script setup>
import { ref, onMounted, computed } from 'vue';
import { useThemeStore } from '../stores/theme';
import api from '../api';

const theme = useThemeStore();
const subscriptions = ref([]);
const isLoading = ref(true);

const fetchSubs = async () => {
  try {
    const res = await api.get('/subscriptions');
    subscriptions.value = res.data.data.subscriptions;
  } catch (e) { console.error(e); } 
  finally { isLoading.value = false; }
};

const upcoming = computed(() => {
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  return subscriptions.value
    .filter(sub => {
      const dueDate = new Date(sub.next_payment_date);
      return dueDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.next_payment_date) - new Date(b.next_payment_date))
    .slice(0, 3);
});

const getStatusColor = (dateString) => {
  const due = new Date(dateString);
  const today = new Date();
  today.setHours(0,0,0,0);
  
  if (due < today) return 'text-danger';
  if (due.getTime() === today.getTime()) return 'text-orange-400';
  return theme.isDark ? 'text-white' : 'text-gray-900';
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
  <div 
    :class="[
      'p-6 rounded-3xl border h-full',
      theme.isDark 
        ? 'bg-card-bg border-white/5' 
        : 'bg-white border-gray-200 shadow-sm'
    ]"
  >
    <div class="flex justify-between items-center mb-4">
      <h3 
        :class="[
          'font-bold text-lg',
          theme.isDark ? 'text-white' : 'text-gray-900'
        ]"
      >
        Upcoming Bills 🔔
      </h3>
      <router-link 
        to="/subscriptions" 
        class="text-xs text-accent hover:underline"
      >
        See All
      </router-link>
    </div>

    <div 
      v-if="isLoading" 
      :class="[
        'text-sm',
        theme.isDark ? 'text-text-muted' : 'text-gray-500'
      ]"
    >
      Loading...
    </div>

    <div v-else-if="upcoming.length > 0" class="space-y-4">
      <div 
        v-for="sub in upcoming" 
        :key="sub.id" 
        :class="[
          'flex items-center gap-3 p-3 rounded-xl border',
          theme.isDark 
            ? 'bg-dashboard-bg border-white/5' 
            : 'bg-gray-50 border-gray-200'
        ]"
      >
        <div 
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center text-lg',
            theme.isDark ? 'bg-white/5' : 'bg-white border border-gray-200'
          ]"
        >
          📅
        </div>
        <div class="flex-1">
          <h4 
            :class="[
              'font-bold text-sm',
              theme.isDark ? 'text-white' : 'text-gray-900'
            ]"
          >
            {{ sub.name }}
          </h4>
          <p :class="`text-xs font-bold ${getStatusColor(sub.next_payment_date)}`">
            {{ getDayText(sub.next_payment_date) }}
          </p>
        </div>
        <div class="text-right">
          <p 
            :class="[
              'text-xs font-bold',
              theme.isDark ? 'text-white' : 'text-gray-900'
            ]"
          >
            {{ new Intl.NumberFormat('id-ID').format(sub.amount) }}
          </p>
        </div>
      </div>
    </div>

    <div 
      v-else 
      :class="[
        'text-center py-8 text-sm',
        theme.isDark ? 'text-text-muted' : 'text-gray-500'
      ]"
    >
      <p>Tidak ada tagihan minggu ini.</p>
      <p class="text-xs mt-1">Aman sentosa! 🏖️</p>
    </div>
  </div>
</template>