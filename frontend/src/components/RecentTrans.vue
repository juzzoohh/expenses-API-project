<script setup>
defineProps({
  transactions: Array
});

// Helper format rupiah
const formatMoney = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
</script>

<template>
  <div class="bg-card-bg p-6 rounded-3xl border border-white/5 h-full">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-white font-bold text-lg">Transactions</h3>
      <a href="#" class="text-accent text-sm hover:underline">See All</a>
    </div>

    <div class="space-y-4">
      <div 
        v-for="tx in transactions" 
        :key="tx.id"
        class="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition group"
      >
        <div class="flex items-center gap-4">
          <div :class="`w-10 h-10 rounded-full flex items-center justify-center text-lg ${tx.type === 'INCOME' ? 'bg-green-500/20 text-success' : 'bg-red-500/20 text-danger'}`">
            {{ tx.type === 'INCOME' ? '↓' : '↑' }}
          </div>
          <div>
            <h4 class="text-white font-medium text-sm group-hover:text-accent transition">{{ tx.name }}</h4>
            <p class="text-text-muted text-xs">{{ new Date(tx.date).toLocaleDateString() }}</p>
          </div>
        </div>
        
        <span :class="`font-bold text-sm ${tx.type === 'INCOME' ? 'text-success' : 'text-white'}`">
          {{ tx.type === 'INCOME' ? '+' : '-' }} {{ formatMoney(tx.amount) }}
        </span>
      </div>
      
      <div v-if="!transactions || transactions.length === 0" class="text-center text-text-muted text-sm py-4">
        No recent transactions.
      </div>
    </div>
  </div>
</template>