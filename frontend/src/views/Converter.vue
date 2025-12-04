<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';

const amount = ref(1);
const fromCurrency = ref('USD');
const toCurrency = ref('IDR');
const rates = ref({});
const isLoading = ref(false);

const currencies = ['IDR', 'USD', 'EUR', 'SGD', 'MYR', 'JPY', 'GBP', 'AUD']; // Mata uang populer

// Ambil Data Kurs Real-time dari Internet
const fetchRates = async () => {
  isLoading.value = true;
  try {
    // API Gratisan (Base USD)
    const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency.value}`);
    rates.value = res.data.rates;
  } catch (error) {
    alert('Gagal mengambil data kurs. Cek koneksi internet!');
  } finally {
    isLoading.value = false;
  }
};

// Hitung Hasil Konversi
const result = computed(() => {
  const rate = rates.value[toCurrency.value] || 0;
  return (amount.value * rate).toLocaleString('id-ID');
});

const exchangeRate = computed(() => {
    return rates.value[toCurrency.value] || 0;
});

// Kalau mata uang asal berubah, ambil data baru
watch(fromCurrency, fetchRates);

onMounted(fetchRates);
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-white mb-8">Currency Converter 💱</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      
      <div class="bg-card-bg p-8 rounded-3xl border border-white/10 shadow-2xl">
        
        <div class="mb-6">
          <label class="text-xs text-text-muted mb-2 block">Amount</label>
          <input 
            v-model="amount" 
            type="number" 
            class="w-full bg-dashboard-bg p-4 rounded-2xl text-white text-2xl font-bold border border-white/10 focus:border-accent outline-none"
          >
        </div>

        <div class="flex gap-4 items-center mb-6">
          <div class="flex-1">
            <label class="text-xs text-text-muted mb-2 block">From</label>
            <select v-model="fromCurrency" class="w-full bg-dashboard-bg p-3 rounded-xl text-white border border-white/10 focus:border-accent outline-none cursor-pointer font-bold">
              <option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>

          <div class="text-2xl text-text-muted">➔</div>

          <div class="flex-1">
            <label class="text-xs text-text-muted mb-2 block">To</label>
            <select v-model="toCurrency" class="w-full bg-dashboard-bg p-3 rounded-xl text-white border border-white/10 focus:border-accent outline-none cursor-pointer font-bold">
              <option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
        </div>

        <div class="bg-accent/10 p-6 rounded-2xl border border-accent/20 text-center">
            <p class="text-sm text-accent mb-1">Estimated Output</p>
            <h2 class="text-4xl font-bold text-white">{{ result }} <span class="text-lg text-white/50">{{ toCurrency }}</span></h2>
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