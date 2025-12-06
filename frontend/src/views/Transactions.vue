<script setup>
import { ref, onMounted, watch } from 'vue';
import { useThemeStore } from '../stores/theme';
import api from '../api';
import ModalAdd from '../components/ModalAdd.vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const theme = useThemeStore();
const transactions = ref([]);
const isModalOpen = ref(false);
const isLoading = ref(false);
const categories = ref([]);

const filters = ref({
  name: '',
  category: '',
  startDate: '',
  endDate: '',
});

const setDefaultDates = () => {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
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

const fetchTransactions = async () => {
  isLoading.value = true;
  const params = new URLSearchParams();

  if (filters.value.name) params.append('name', filters.value.name);
  if (filters.value.category) params.append('category', filters.value.category);
  if (filters.value.startDate) params.append('startDate', filters.value.startDate);
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

const deleteTransaction = async (id, name) => {
  if (!confirm(`Hapus transaksi "${name}"? Saldo dompet akan dikembalikan.`))
    return;

  try {
    await api.delete(`/expenses/${id}`);
    fetchTransactions();
  } catch (error) {
    alert('Gagal menghapus transaksi.');
  }
};

const downloadPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text('Laporan Keuangan', 14, 20);

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

  const totalIncome = transactions.value
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + parseInt(t.amount), 0);

  const totalExpense = transactions.value
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + parseInt(t.amount), 0);

  doc.text(`Total Masuk: ${formatRupiah(totalIncome)}`, 140, 30);
  doc.text(`Total Keluar: ${formatRupiah(totalExpense)}`, 140, 36);

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
        <h1 
          :class="[
            'text-3xl font-bold',
            theme.isDark ? 'text-white' : 'text-gray-900'
          ]"
        >
          Transaction History
        </h1>
        <p 
          :class="[
            'mt-1',
            theme.isDark ? 'text-text-muted' : 'text-gray-600'
          ]"
        >
          Kelola semua pemasukan & pengeluaranmu
        </p>
      </div>
      <div class="flex gap-3">
        <button
          @click="downloadPDF"
          :class="[
            'border px-4 py-3 rounded-xl font-bold transition flex items-center gap-2',
            theme.isDark 
              ? 'bg-card-bg border-white/10 hover:border-accent text-white' 
              : 'bg-white border-gray-200 hover:border-accent text-gray-900'
          ]"
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
      :class="[
        'p-4 rounded-2xl border mb-6 flex flex-col gap-4',
        theme.isDark 
          ? 'bg-card-bg border-white/5' 
          : 'bg-white border-gray-200'
      ]"
    >
      <div class="flex gap-4 flex-col md:flex-row">
        <div class="flex-1">
          <input
            v-model="filters.name"
            placeholder="🔍 Cari transaksi..."
            :class="[
              'w-full p-3 rounded-xl border focus:border-accent outline-none',
              theme.isDark 
                ? 'bg-dashboard-bg text-white border-white/10' 
                : 'bg-gray-50 text-gray-900 border-gray-200'
            ]"
          />
        </div>
        <div class="w-full md:w-48">
          <select
            v-model="filters.category"
            :class="[
              'w-full p-3 rounded-xl border focus:border-accent outline-none cursor-pointer',
              theme.isDark 
                ? 'bg-dashboard-bg text-white border-white/10' 
                : 'bg-gray-50 text-gray-900 border-gray-200'
            ]"
          >
            <option value="">Semua Kategori</option>
            <option v-for="c in categories" :key="c.id" :value="c.name">
              {{ c.name }}
            </option>
          </select>
        </div>
      </div>

      <div
        :class="[
          'flex gap-4 items-center p-3 rounded-xl border',
          theme.isDark 
            ? 'bg-dashboard-bg border-white/5' 
            : 'bg-gray-50 border-gray-200'
        ]"
      >
        <span 
          :class="[
            'text-sm font-bold ml-2',
            theme.isDark ? 'text-text-muted' : 'text-gray-600'
          ]"
        >
          📅 Periode:
        </span>
        <input
          type="date"
          v-model="filters.startDate"
          :class="[
            'p-2 rounded-lg border focus:border-accent outline-none text-sm',
            theme.isDark 
              ? 'bg-card-bg text-white border-white/10' 
              : 'bg-white text-gray-900 border-gray-200'
          ]"
        />
        <span :class="theme.isDark ? 'text-white' : 'text-gray-900'">-</span>
        <input
          type="date"
          v-model="filters.endDate"
          :class="[
            'p-2 rounded-lg border focus:border-accent outline-none text-sm',
            theme.isDark 
              ? 'bg-card-bg text-white border-white/10' 
              : 'bg-white text-gray-900 border-gray-200'
          ]"
        />

        <button
          @click="setDefaultDates"
          class="ml-auto text-xs text-accent hover:underline"
        >
          Reset (Bulan Ini)
        </button>
      </div>
    </div>

    <div 
      :class="[
        'rounded-3xl border overflow-hidden',
        theme.isDark 
          ? 'bg-card-bg border-white/5' 
          : 'bg-white border-gray-200 shadow-sm'
      ]"
    >
      <table class="w-full text-left">
        <thead 
          :class="[
            'text-xs uppercase font-bold',
            theme.isDark 
              ? 'bg-white/5 text-text-muted' 
              : 'bg-gray-50 text-gray-600'
          ]"
        >
          <tr>
            <th class="p-4">Transaction</th>
            <th class="p-4">Category</th>
            <th class="p-4">Date</th>
            <th class="p-4 text-right">Amount</th>
            <th class="p-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody 
          :class="[
            'divide-y',
            theme.isDark ? 'divide-white/5' : 'divide-gray-200'
          ]"
        >
          <tr
            v-for="tx in transactions"
            :key="tx.id"
            :class="[
              'transition',
              theme.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
            ]"
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
                <span 
                  :class="[
                    'font-bold',
                    theme.isDark ? 'text-white' : 'text-gray-900'
                  ]"
                >
                  {{ tx.name }}
                </span>
              </div>
            </td>
            <td class="p-4 text-sm">
              <span
                :class="[
                  'px-2 py-1 rounded border',
                  theme.isDark 
                    ? 'bg-dashboard-bg border-white/10 text-text-muted' 
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                ]"
                >{{ tx.category }}</span
              >
            </td>
            <td 
              :class="[
                'p-4 text-sm',
                theme.isDark ? 'text-text-muted' : 'text-gray-600'
              ]"
            >
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
                :class="[
                  'transition',
                  theme.isDark 
                    ? 'text-text-muted hover:text-danger' 
                    : 'text-gray-400 hover:text-danger'
                ]"
                title="Hapus"
              >
                🗑️
              </button>
            </td>
          </tr>

          <tr v-if="transactions.length === 0 && !isLoading">
            <td 
              colspan="5" 
              :class="[
                'p-8 text-center',
                theme.isDark ? 'text-text-muted' : 'text-gray-500'
              ]"
            >
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