<script setup>
import { computed } from 'vue';

const props = defineProps(['summary', 'expenseBreakdown']);

const advice = computed(() => {
  const { totalIncome, totalExpense } = props.summary;
  const expenses = props.expenseBreakdown || [];

  // 1. Analisa Kesehatan Umum
  if (totalIncome === 0) return { title: "Data Kurang", text: "Ayo catat pemasukanmu dulu biar aku bisa kasih saran!", color: "text-text-muted" };
  
  const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;

  // 2. Analisa Kategori Terboros
  // Urutkan pengeluaran dari terbesar
  const topExpense = [...expenses].sort((a, b) => b.total - a.total)[0];

  let message = "";
  let statusColor = "text-white";

  if (savingsRate < 0) {
    message = `🚨 BAHAYA! Kamu defisit ${Math.abs(savingsRate).toFixed(1)}%. Pengeluaranmu lebih besar dari pemasukan. Stop jajan!`;
    statusColor = "text-danger";
  } else if (savingsRate < 20) {
    message = `⚠️ Hati-hati. Kamu cuma menyisihkan ${savingsRate.toFixed(1)}% uangmu. Target idealnya minimal 20%.`;
    statusColor = "text-orange-400";
  } else {
    message = `✅ Mantap! Kamu berhasil menabung ${savingsRate.toFixed(1)}% dari pendapatanmu. Pertahankan!`;
    statusColor = "text-success";
  }

  // Tambahan saran spesifik
  if (topExpense) {
    message += ` Uangmu paling banyak habis di "${topExpense.category}". Coba dikontrol ya.`;
  }

  return { title: "Financial Health", text: message, color: statusColor };
});
</script>

<template>
  <div class="bg-card-bg p-6 rounded-3xl border border-white/5 h-full">
    <div class="flex items-center gap-3 mb-3">
      <div class="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-xl">
        🤖
      </div>
      <h3 class="text-white font-bold text-lg">Smart Advisor</h3>
    </div>
    
    <div class="bg-dashboard-bg p-4 rounded-xl border border-white/5">
      <h4 :class="`font-bold mb-2 ${advice.color}`">{{ advice.title }}</h4>
      <p class="text-text-muted text-sm leading-relaxed">
        {{ advice.text }}
      </p>
    </div>
  </div>
</template>