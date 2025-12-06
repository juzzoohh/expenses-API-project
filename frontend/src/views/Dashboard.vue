<script setup>
import { onMounted, ref } from 'vue';
import { useThemeStore } from '../stores/theme';
import { useAuthStore } from '../stores/auth';
import api from '../api';
import StatCard from '../components/StatCard.vue';
import RecentTrans from '../components/RecentTrans.vue';
import ModalAdd from '../components/ModalAdd.vue';
import ModalWallets from '../components/ModalWallets.vue';
import ExpenseChart from '../components/ExpenseChart.vue';
import SmartInsight from '../components/SmartInsight.vue';
import UpcomingBills from '../components/UpcomingBills.vue';

const theme = useThemeStore();
const auth = useAuthStore();
const summary = ref({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
const recentTx = ref([]);
const isModalOpen = ref(false);
const isWalletModalOpen = ref(false);
const expenseBreakdown = ref([]);

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

const fetchData = async () => {
  try {
    const [resReport, resExp] = await Promise.all([
      api.get('/reports'),
      api.get('/expenses')
    ]);
    summary.value = resReport.data.data.summary;
    expenseBreakdown.value = resReport.data.data.breakdown.expense;
    recentTx.value = resExp.data.data.expenses.slice(0, 5);
  } catch (err) {
    console.error(err);
  }
};

onMounted(fetchData);
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
          My Dashboard
        </h1>
        <p 
          :class="[
            'mt-1',
            theme.isDark ? 'text-text-muted' : 'text-gray-600'
          ]"
        >
          Overview of your finance status
        </p>
      </div>
      <div class="flex gap-3">
        <button
          @click="isWalletModalOpen = true"
          :class="[
            'border px-4 py-3 rounded-xl font-bold transition',
            theme.isDark 
              ? 'bg-card-bg border-white/10 hover:border-accent text-white' 
              : 'bg-white border-gray-200 hover:border-accent text-gray-900'
          ]"
        >
          💳 Wallets
        </button>
        <button
          @click="isModalOpen = true"
          class="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:-translate-y-1 transition"
        >
          + Add New
        </button>
      </div>
    </header>

    <div class="grid grid-cols-12 gap-6">
      
      <div class="col-span-12 md:col-span-4">
        <StatCard
          title="Total Balance"
          :amount="formatRupiah(summary.netBalance)"
          percentage="Live"
          :isPositive="summary.netBalance >= 0"
        />
      </div>
      <div class="col-span-12 md:col-span-4">
        <StatCard
          title="Total Expense"
          :amount="formatRupiah(summary.totalExpense)"
          percentage="Out"
          :isPositive="false"
        />
      </div>
      <div class="col-span-12 md:col-span-4">
        <StatCard
          title="Total Income"
          :amount="formatRupiah(summary.totalIncome)"
          percentage="In"
          :isPositive="true"
        />
      </div>

      <div class="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="h-64 md:h-auto">
          <ExpenseChart :breakdown="expenseBreakdown" />
        </div>
        <div>
          <SmartInsight
            :summary="summary"
            :expenseBreakdown="expenseBreakdown"
          />
        </div>
      </div>

      <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">
        
        <div>
            <UpcomingBills />
        </div>

        <div class="flex-1">
            <RecentTrans :transactions="recentTx" />
        </div>

      </div>

    </div>

    <ModalAdd
      :isOpen="isModalOpen"
      @close="isModalOpen = false"
      @refresh="fetchData"
    />
    <ModalWallets
      :isOpen="isWalletModalOpen"
      @close="isWalletModalOpen = false"
      @refresh="fetchData"
    />
  </div>
</template>