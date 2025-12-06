<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useThemeStore } from '../stores/theme';
import axios from 'axios';

const theme = useThemeStore();
const amount = ref(1);
const fromCurrency = ref('USD');
const toCurrency = ref('IDR');
const rates = ref({});
const isLoading = ref(false);

const currencies = ['IDR', 'USD', 'EUR', 'SGD', 'MYR', 'JPY', 'GBP', 'AUD'];

const fetchRates = async () => {
  isLoading.value = true;
  try {
    const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency.value}`);
    rates.value = res.data.rates;
  } catch (error) {
    alert('Gagal mengambil data kurs. Cek koneksi internet!');
  } finally {
    isLoading.value = false;
  }
};

const result = computed(() => {
  const rate = rates.value[toCurrency.value] || 0;
  return (amount.value * rate).toLocaleString('id-ID');
});

const exchangeRate = computed(() => {
    return rates.value[toCurrency.value] || 0;
});

watch(fromCurrency, fetchRates);

onMounted(fetchRates);
</script>

<template>
  <div>
    <h1 
      :class="[
        'text-3xl font-bold mb-8',
        theme.isDark ? 'text-white' : 'text-gray-900'
      ]"
    >
      Currency Converter 💱
    </h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      
      <div 
        :class="[
          'p-8 rounded-3xl border shadow-2xl',
          theme.isDark 
            ? 'bg-card-bg border-white/10' 
            : 'bg-white border-gray-200'
        ]"
      >
        
        <div class="mb-6">
          <label 
            :class="[
              'text-xs mb-2 block',
              theme.isDark ? 'text-text-muted' : 'text-gray-600'
            ]"
          >
            Amount
          </label>
          <input 
            v-model="amount" 
            type="number" 
            :class="[
              'w-full p-4 rounded-2xl text-2xl font-bold border focus:border-accent outline-none',
              theme.isDark 
                ? 'bg-dashboard-bg text-white border-white/10' 
                : 'bg-gray-50 text-gray-900 border-gray-200'
            ]"
          >
        </div>

        <div class="flex gap-4 items-center mb-6">
          <div class="flex-1">
            <label 
              :class="[
                'text-xs mb-2 block',
                theme.isDark ? 'text-text-muted' : 'text-gray-600'
              ]"
            >
              From
            </label>
            <select 
              v-model="fromCurrency" 
              :class="[
                'w-full p-3 rounded-xl border focus:border-accent outline-none cursor-pointer font-bold',
                theme.isDark 
                  ? 'bg-dashboard-bg text-white border-white/10' 
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              ]"
            >
              <option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>

          <div 
            :class="[
              'text-2xl',
              theme.isDark ? 'text-text-muted' : 'text-gray-400'
            ]"
          >
            ➔
          </div>

          <div class="flex-1">
            <label 
              :class="[
                'text-xs mb-2 block',
                theme.isDark ? 'text-text-muted' : 'text-gray-600'
              ]"
            >
              To
            </label>
            <select 
              v-model="toCurrency" 
              :class="[
                'w-full p-3 rounded-xl border focus:border-accent outline-none cursor-pointer font-bold',
                theme.isDark 
                  ? 'bg-dashboard-bg text-white border-white/10' 
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              ]"
            >
              <option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
        </div>

        <div class="bg-accent/10 p-6 rounded-2xl border border-accent/20 text-center">
            <p class="text-sm text-accent mb-1">Estimated Output</p>
            <h2 
              :class="[
                'text-4xl font-bold',
                theme.isDark ? 'text-white' : 'text-gray-900'
              ]"
            >
              {{ result }} 
              <span 
                :class="[
                  'text-lg',
                  theme.isDark ? 'text-white/50' : 'text-gray-500'
                ]"
              >
                {{ toCurrency }}
              </span>
            </h2>
        </div>

      </div>

      <div class="bg-gradient-to-br from-accent to-purple-800 p-8 rounded-3xl text-white relative overflow-hidden">
        <div class="relative z-10">
            <h3 class="text-2xl font-bold mb-2">Live Rates 🌏</h3>
            <p class="opacity-80 mb-6">Data diambil langsung dari pasar uang global.</p>
            
            <div class="space-y-4">
                <div class="flex justify-between items-center bg-white/10 p-3 rounded-xl">
                    <span>1 {{ fromCurrency }} =</span>
                    <span class="font-bold">{{ exchangeRate }} {{ toCurrency }}</span>
                </div>
            </div>

            <p class="text-xs mt-6 opacity-60">*Nilai tukar dapat berubah sewaktu-waktu.</p>
        </div>
        
        <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      </div>

    </div>
  </div>
</template>