<script setup>
import { useThemeStore } from '../stores/theme';

const theme = useThemeStore();

defineProps({
  title: String,
  amount: [Number, String],
  percentage: String,
  isPositive: Boolean,
  type: String
});
</script>

<template>
  <div 
    :class="[
      'p-6 rounded-3xl border relative overflow-hidden group hover:border-accent/50 transition duration-300',
      theme.isDark 
        ? 'bg-card-bg border-white/5' 
        : 'bg-white border-gray-200 shadow-sm'
    ]"
  >
    <div 
      :class="[
        'absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl group-hover:bg-accent/30 transition',
        theme.isDark ? 'bg-accent/20' : 'bg-accent/10'
      ]"
    ></div>

    <h3 
      :class="[
        'text-sm font-medium mb-2',
        theme.isDark ? 'text-text-muted' : 'text-gray-600'
      ]"
    >
      {{ title }}
    </h3>
    
    <div class="flex items-end justify-between">
      <div 
        :class="[
          'text-2xl font-bold',
          theme.isDark ? 'text-white' : 'text-gray-900'
        ]"
      >
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