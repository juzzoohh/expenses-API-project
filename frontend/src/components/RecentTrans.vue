<script setup>
import { useThemeStore } from '../stores/theme';

const theme = useThemeStore();

defineProps({
  transactions: Array
});

const formatMoney = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
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
    <div class="flex justify-between items-center mb-6">
      <h3 
        :class="[
          'font-bold text-lg',
          theme.isDark ? 'text-white' : 'text-gray-900'
        ]"
      >
        Transactions
      </h3>
      <a 
        href="#" 
        :class="[
          'text-sm hover:underline',
          theme.isDark ? 'text-accent' : 'text-accent'
        ]"
      >
        See All
      </a>
    </div>

    <div class="space-y-4">
      <div 
        v-for="tx in transactions" 
        :key="tx.id"
        :class="[
          'flex items-center justify-between p-3 rounded-xl transition group',
          theme.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
        ]"
      >
        <div class="flex items-center gap-4">
          <div :class="`w-10 h-10 rounded-full flex items-center justify-center text-lg ${tx.type === 'INCOME' ? 'bg-green-500/20 text-success' : 'bg-red-500/20 text-danger'}`">
            {{ tx.type === 'INCOME' ? '↓' : '↑' }}
          </div>
          <div>
            <h4 
              :class="[
                'font-medium text-sm group-hover:text-accent transition',
                theme.isDark ? 'text-white' : 'text-gray-900'
              ]"
            >
              {{ tx.name }}
            </h4>
            <p 
              :class="[
                'text-xs',
                theme.isDark ? 'text-text-muted' : 'text-gray-500'
              ]"
            >
              {{ new Date(tx.date).toLocaleDateString() }}
            </p>
          </div>
        </div>
        
        <span :class="`font-bold text-sm ${tx.type === 'INCOME' ? 'text-success' : (theme.isDark ? 'text-white' : 'text-gray-900')}`">
          {{ tx.type === 'INCOME' ? '+' : '-' }} {{ formatMoney(tx.amount) }}
        </span>
      </div>
      
      <div 
        v-if="!transactions || transactions.length === 0" 
        :class="[
          'text-center text-sm py-4',
          theme.isDark ? 'text-text-muted' : 'text-gray-500'
        ]"
      >
        No recent transactions.
      </div>
    </div>
  </div>
</template>