<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '../api'; // Pastikan path ini benar
import { useAuthStore } from '../stores/auth';
import ModalAdd from '../components/ModalAdd.vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const auth = useAuthStore();
const transactions = ref([]);
const isModalOpen = ref(false);
const isLoading = ref(false);
const categories = ref([]);

// State untuk Filter
const filters = ref({
  name: '',
  category: '',
  startDate: '',
  endDate: '',
});

const setDefaultDates = () => {
  const date = new Date();
  // Hari pertama bulan ini (yyyy-mm-dd)
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  // Hari ini
  const today = new Date().toISOString().slice(0, 10);

  filters.value.startDate = firstDay;
  filters.value.endDate = today;
};

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);

// Fetch Data dengan Filter
const fetchTransactions = async () => {
  isLoading.value = true;
  const params = new URLSearchParams();

  if (filters.value.name) params.append('name', filters.value.name);
  if (filters.value.category) params.append('category', filters.value.category);

  // Kirim parameter tanggal ke backend
  if (filters.value.startDate)
    params.append('startDate', filters.value.startDate);
  if (filters.value.endDate) params.append('endDate', filters.value.endDate);

  try {
    const res = await api.get(`/expenses?${params.toString()}`);
    transactions.value = res.data.data.expenses;
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

// Hapus Transaksi
const deleteTransaction = async (id, name) => {
  if (!confirm(`Hapus transaksi "${name}"? Saldo dompet akan dikembalikan.`))
    return;

  try {
    await api.delete(`/expenses/${id}`);
    fetchTransactions(); // Refresh data
  } catch (error) {
    alert('Gagal menghapus transaksi.');
  }
};

// Download PDF Logic
const downloadPDF = () => {
  const doc = new jsPDF();

  // 1. Header Judul
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text('Laporan Keuangan', 14, 20);

  // 2. Info Periode & Tanggal Cetak
  doc.setFontSize(10);
  doc.setTextColor(100);

  let periodText = 'Semua Periode';
  if (filters.value.startDate && filters.value.endDate) {
    const start = new Date(filters.value.startDate).toLocaleDateString('id-ID');
    const end = new Date(filters.value.endDate).toLocaleDateString('id-ID');
    periodText = `${start} - ${end}`;
  }

  doc.text(`Periode: ${periodText}`, 14, 30);
  doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 36);

  // 3. Hitung Total
  const totalIncome = transactions.value
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + parseInt(t.amount), 0);

  const totalExpense = transactions.value
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + parseInt(t.amount), 0);

  doc.text(`Total Masuk: ${formatRupiah(totalIncome)}`, 140, 30);
  doc.text(`Total Keluar: ${formatRupiah(totalExpense)}`, 140, 36);

  // 4. Tabel Data
  const tableBody = transactions.value.map((t) => [
    new Date(t.date).toLocaleDateString('id-ID'),
    t.name,
    t.category,
    t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
    formatRupiah(t.amount),
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['Tanggal', 'Transaksi', 'Kategori', 'Tipe', 'Jumlah']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [108, 93, 211] },
    styles: { fontSize: 9 },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 4) {
        const rawValue = tableBody[data.row.index][3];
        if (rawValue === 'Pengeluaran') {
          data.cell.styles.textColor = [220, 38, 38];
        } else {
          data.cell.styles.textColor = [22, 163, 74];
        }
      }
    },
  });

  doc.save(`Laporan-Keuangan-${periodText}.pdf`);
};

const fetchCategories = async () => {
  try {
    const res = await api.get('/categories');
    categories.value = res.data.data.categories;
  } catch (e) {
    console.error(e);
  }
};

// Watchers
let timeout = null;
watch(
  () => filters.value.name,
  () => {
    clearTimeout(timeout);
    timeout = setTimeout(fetchTransactions, 500);
  }
);

watch(() => filters.value.category, fetchTransactions);
watch(() => filters.value.startDate, fetchTransactions);
watch(() => filters.value.endDate, fetchTransactions);

onMounted(() => {
  setDefaultDates();
  fetchTransactions();
  fetchCategories();
});
</script>

<template>
  <div>
    <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white">Transaction History</h1>
        <p class="text-text-muted mt-1">
          Kelola semua pemasukan & pengeluaranmu
        </p>
      </div>
      <div class="flex gap-3">
        <button
          @click="downloadPDF"
          class="bg-card-bg border border-white/10 hover:border-accent text-white px-4 py-3 rounded-xl font-bold transition flex items-center gap-2"
          title="Download PDF"
        >
          📄 PDF
        </button>
        <button
          @click="isModalOpen = true"
          class="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold shadow-lg transition"
        >
          + Add New
        </button>
      </div>
    </header>

    <div
      class="bg-card-bg p-4 rounded-2xl border border-white/5 mb-6 flex flex-col gap-4"
    >
      <div class="flex gap-4 flex-col md:flex-row">
        <div class="flex-1">
          <input
            v-model="filters.name"
            placeholder="🔍 Cari transaksi..."
            class="w-full bg-dashboard-bg p-3 rounded-xl text-white border border-white/10 focus:border-accent outline-none"
          />
        </div>
        <div class="w-full md:w-48">
          <select
            v-model="filters.category"
            class="w-full bg-dashboard-bg p-3 rounded-xl text-white border border-white/10 focus:border-accent outline-none cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            <option v-for="c in categories" :key="c.id" :value="c.name">
              {{ c.name }}
            </option>
          </select>
        </div>
      </div>

      <div
        class="flex gap-4 items-center bg-dashboard-bg p-3 rounded-xl border border-white/5"
      >
        <span class="text-text-muted text-sm font-bold ml-2">📅 Periode:</span>
        <input
          type="date"
          v-model="filters.startDate"
          class="bg-card-bg text-white p-2 rounded-lg border border-white/10 focus:border-accent outline-none text-sm"
        />
        <span class="text-white">-</span>
        <input
          type="date"
          v-model="filters.endDate"
          class="bg-card-bg text-white p-2 rounded-lg border border-white/10 focus:border-accent outline-none text-sm"
        />

        <button
          @click="setDefaultDates"
          class="ml-auto text-xs text-accent hover:underline"
        >
          Reset (Bulan Ini)
        </button>
      </div>
    </div>

    <div class="bg-card-bg rounded-3xl border border-white/5 overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-white/5 text-text-muted text-xs uppercase font-bold">
          <tr>
            <th class="p-4">Transaction</th>
            <th class="p-4">Category</th>
            <th class="p-4">Date</th>
            <th class="p-4 text-right">Amount</th>
            <th class="p-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr
            v-for="tx in transactions"
            :key="tx.id"
            class="hover:bg-white/5 transition"
          >
            <td class="p-4">
              <div class="flex items-center gap-3">
                <div
                  :class="`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    tx.type === 'INCOME'
                      ? 'bg-green-500/20 text-success'
                      : 'bg-red-500/20 text-danger'
                  }`"
                >
                  {{ tx.type === 'INCOME' ? '↓' : '↑' }}
                </div>
                <span class="font-bold text-white">{{ tx.name }}</span>
              </div>
            </td>
            <td class="p-4 text-sm text-text-muted">
              <span
                class="bg-dashboard-bg px-2 py-1 rounded border border-white/10"
                >{{ tx.category }}</span
              >
            </td>
            <td class="p-4 text-sm text-text-muted">
              {{ new Date(tx.date).toLocaleDateString() }}
            </td>
            <td
              :class="`p-4 text-right font-bold ${
                tx.type === 'INCOME' ? 'text-success' : 'text-danger'
              }`"
            >
              {{ tx.type === 'INCOME' ? '+' : '-' }}
              {{ formatRupiah(tx.amount) }}
            </td>
            <td class="p-4 text-center">
              <button
                @click="deleteTransaction(tx.id, tx.name)"
                class="text-text-muted hover:text-danger transition"
                title="Hapus"
              >
                🗑️
              </button>
            </td>
          </tr>

          <tr v-if="transactions.length === 0 && !isLoading">
            <td colspan="5" class="p-8 text-center text-text-muted">
              Tidak ada transaksi yang ditemukan.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ModalAdd
      :isOpen="isModalOpen"
      @close="isModalOpen = false"
      @refresh="fetchTransactions"
    />
  </div>
</template>