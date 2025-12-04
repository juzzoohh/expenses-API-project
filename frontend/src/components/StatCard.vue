<script setup>
defineProps({
  title: String,
  amount: [Number, String],
  percentage: String,
  isPositive: Boolean,
  type: String // 'balance', 'expense', 'income'
});
</script>

<template>
  <div class="bg-card-bg p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-accent/50 transition duration-300">
    <div class="absolute -right-6 -top-6 w-24 h-24 bg-accent/20 rounded-full blur-2xl group-hover:bg-accent/30 transition"></div>

    <h3 class="text-text-muted text-sm font-medium mb-2">{{ title }}</h3>
    
    <div class="flex items-end justify-between">
      <div class="text-2xl font-bold text-white">
        {{ amount }}
      </div>
      
      <div 
        :class="[
          'px-3 py-1 rounded-lg text-xs font-bold',
          isPositive ? 'bg-green-500/20 text-success' : 'bg-red-500/20 text-danger'
        ]"
      >
        {{ isPositive ? '+' : '' }}{{ percentage }}%
      </div>
    </div>
  </div>
</template>