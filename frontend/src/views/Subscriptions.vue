<script setup>
import { ref, onMounted } from 'vue';
import { useThemeStore } from '../stores/theme';
import api from '../api';
import ModalSubscription from '../components/ModalSubscription.vue';

const theme = useThemeStore();
const subscriptions = ref([]);
const isModalOpen = ref(false);
const isLoading = ref(false);

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const fetchSubscriptions = async () => {
  try {
    const res = await api.get('/subscriptions');
    subscriptions.value = res.data.data.subscriptions;
  } catch (error) { console.error(error); }
};

const getStatus = (dateString) => {
  const due = new Date(dateString);
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: `Telat ${Math.abs(diffDays)} Hari!`, color: 'text-danger', border: 'border-danger' };
  if (diffDays === 0) return { text: 'Bayar HARI INI!', color: 'text-orange-400', border: 'border-orange-400' };
  if (diffDays <= 3) return { text: `${diffDays} Hari Lagi`, color: 'text-orange-400', border: 'border-orange-400' };
  return { text: `${diffDays} Hari Lagi`, color: 'text-success', border: theme.isDark ? 'border-white/5' : 'border-gray-200' };
};

const payNow = async (sub) => {
  if(!confirm(`Bayar tagihan "${sub.name}" sebesar ${formatRupiah(sub.amount)} sekarang?`)) return;
  
  isLoading.value = true;
  try {
    await api.post(`/subscriptions/${sub.id}/pay`);
    alert('Pembayaran Berhasil! Tanggal tagihan diperbarui ke bulan depan.');
    fetchSubscriptions();
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal bayar');
  } finally {
    isLoading.value = false;
  }
};

const deleteSub = async (id) => {
  if(!confirm('Hapus langganan ini? (Data histori pembayaran sebelumnya tidak akan hilang)')) return;
  try {
    await api.delete(`/subscriptions/${id}`);
    fetchSubscriptions();
  } catch(e) { alert('Gagal hapus'); }
};

onMounted(fetchSubscriptions);
</script>

<template>
  <div>
    <header class="flex justify-between items-center mb-8">
      <div>
        <h1 
          :class="[
            'text-3xl font-bold',
            theme.isDark ? 'text-white' : 'text-gray-900'
          ]"
        >
          Subscriptions 📅
        </h1>
        <p 
          :class="[
            'mt-1',
            theme.isDark ? 'text-text-muted' : 'text-gray-600'
          ]"
        >
          Jangan sampai telat bayar tagihan!
        </p>
      </div>
      <button 
        @click="isModalOpen = true" 
        class="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold shadow-lg transition"
      >
        + Add New
      </button>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <div 
        v-for="sub in subscriptions" 
        :key="sub.id" 
        :class="[
          'p-6 rounded-3xl border hover:bg-white/5 transition group relative',
          theme.isDark 
            ? `bg-card-bg ${getStatus(sub.next_payment_date).border}` 
            : `bg-white ${getStatus(sub.next_payment_date).border} shadow-sm`
        ]"
      >
        
        <button 
          @click="deleteSub(sub.id)" 
          :class="[
            'absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition',
            theme.isDark 
              ? 'text-text-muted hover:text-danger' 
              : 'text-gray-400 hover:text-danger'
          ]"
        >
          ✕
        </button>

        <div class="flex items-center gap-4 mb-4">
          <div 
            :class="[
              'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
              theme.isDark ? 'bg-white/10' : 'bg-gray-100'
            ]"
          >
            🧾
          </div>
          <div>
            <h3 
              :class="[
                'font-bold text-lg',
                theme.isDark ? 'text-white' : 'text-gray-900'
              ]"
            >
              {{ sub.name }}
            </h3>
            <p 
              :class="[
                'text-xs',
                theme.isDark ? 'text-text-muted' : 'text-gray-600'
              ]"
            >
              {{ sub.category }} • via {{ sub.wallet_name }}
            </p>
          </div>
        </div>

        <div class="mb-6">
          <p 
            :class="[
              'text-xs mb-1',
              theme.isDark ? 'text-text-muted' : 'text-gray-600'
            ]"
          >
            Total Tagihan
          </p>
          <p 
            :class="[
              'text-2xl font-bold',
              theme.isDark ? 'text-white' : 'text-gray-900'
            ]"
          >
            {{ formatRupiah(sub.amount) }}
          </p>
        </div>

        <div class="flex justify-between items-center">
          <div>
            <p 
              :class="[
                'text-xs',
                theme.isDark ? 'text-text-muted' : 'text-gray-600'
              ]"
            >
              Jatuh Tempo
            </p>
            <p :class="`font-bold ${getStatus(sub.next_payment_date).color}`">
              {{ new Date(sub.next_payment_date).toLocaleDateString('id-ID') }}
            </p>
            <p :class="`text-[10px] ${getStatus(sub.next_payment_date).color}`">
              {{ getStatus(sub.next_payment_date).text }}
            </p>
          </div>

          <button 
            @click="payNow(sub)" 
            :disabled="isLoading"
            :class="[
              'px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2',
              theme.isDark 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            ]"
          >
            ✅ Pay
          </button>
        </div>

      </div>

      <div 
        v-if="subscriptions.length === 0" 
        :class="[
          'col-span-full text-center py-20 border border-dashed rounded-3xl',
          theme.isDark 
            ? 'text-text-muted border-white/10' 
            : 'text-gray-500 border-gray-300'
        ]"
      >
        Tidak ada langganan aktif. Hidup bebas tagihan? 😎
      </div>

    </div>

    <ModalSubscription :isOpen="isModalOpen" @close="isModalOpen = false" @refresh="fetchSubscriptions" />
  </div>
</template>