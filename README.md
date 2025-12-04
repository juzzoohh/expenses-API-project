# 💰 Fina - Personal Finance Assistant

**Fina** adalah aplikasi manajemen keuangan pribadi modern...
(deskripsi singkat...)

![License](...) ![Vue](...) (badges...)

---

## 📸 Preview Aplikasi

Berikut adalah tampilan antarmuka Fina yang responsif dan modern:

| **Desktop Dashboard** | **Mobile View** |
|:---:|:---:|
| ![Desktop Dashboard](./src/assets/Desktop.png) | ![Mobile View](./src/assets/Adnroid.png) |

> *Tampilan Dark Mode yang nyaman di mata dengan visualisasi data interaktif.*

---

## ✨ Fitur Utama

### 🔐 Autentikasi & Keamanan
- **Register & Login** (JWT Authentication & Bcrypt).
- **Manajemen Profil** (Edit Nama & Ganti Password).
- **Session Handling** (Auto logout jika token kadaluwarsa).

### 💸 Manajemen Keuangan Inti
- **Multi-Wallet:** Kelola berbagai sumber dana (Cash, Bank, E-Wallet).
- **Pencatatan Transaksi:** Income & Expense dengan kategori dinamis.
- **Riwayat Transaksi:** Filter canggih berdasarkan tanggal, nama, dan kategori.
- **Export PDF:** Unduh laporan keuangan resmi per periode.

### 🧠 Smart Analysis (AI Powered)
- **Dashboard Interaktif:** Ringkasan saldo dan grafik donat (Chart.js).
- **Gemini AI Advisor:** Analisis keuangan otomatis yang memberikan saran cerdas, sarkas, dan membangun (Powered by Google Gemini 2.0).

### 🎯 Perencanaan & Kontrol
- **Financial Goals:** Set target tabungan (misal: Beli Laptop) dan pantau progress-nya.
- **Budgeting System:** Pasang limit pengeluaran per kategori. Peringatan otomatis jika *overbudget*.
- **Subscription Manager:** Pantau tagihan rutin (Netflix, Kos, dll) dan bayar otomatis dengan satu klik.
- **Currency Converter:** Alat konversi mata uang *real-time*.

---

## 🛠️ Teknologi yang Digunakan

### Frontend
- **Framework:** Vue.js 3 (Composition API)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Pinia
- **HTTP Client:** Axios (Custom Instance)
- **Visualization:** Chart.js & Vue-Chartjs
- **Utilities:** jsPDF (Report Generation)

### Backend
- **Runtime:** Node.js
- **Framework:** Hapi.js
- **Database:** PostgreSQL
- **Driver:** Node-Postgres (pg)
- **AI:** Google Generative AI SDK (Gemini)
- **Security:** @hapi/jwt & Bcrypt

---

## 🚀 Cara Menjalankan Project (Localhost)

Ikuti langkah ini untuk menjalankan aplikasi di komputermu.

### Prasyarat
- Node.js (v16+) terinstall.
- PostgreSQL terinstall dan berjalan.

### 1. Setup Backend
Masuk ke folder backend dan install dependency:
```bash
cd backend
npm install
````

Buat file `.env` di dalam folder `backend/` dan isi konfigurasi berikut:

```env
# Database Config
PGUSER=postgres
PGHOST=localhost
PGDATABASE=expense_db
PGPASSWORD=password_postgres_kamu
PGPORT=5432

# Security (Bebas isi apa saja asal panjang)
ACCESS_TOKEN_KEY=rahasia_super_panjang_dan_acak_12345

# AI Config (Dapatkan di aistudio.google.com)
GEMINI_API_KEY=isi_api_key_google_kamu
```

Jalankan server backend:

```bash
npm run start
```

*Server akan berjalan di http://localhost:9000*

### 2\. Setup Frontend

Buka terminal baru, masuk ke folder frontend:

```bash
cd frontend
npm install
```

Buat file `.env` di dalam folder `frontend/`:

```env
VITE_API_URL=http://localhost:9000
```

Jalankan frontend:

```bash
npm run dev
```

*Buka browser di http://localhost:5173*

-----

## 🗄️ Skema Database

Project ini menggunakan PostgreSQL. Pastikan kamu sudah membuat database bernama `expense_db` dan menjalankan query untuk tabel berikut:

  - `users`
  - `wallets`
  - `categories`
  - `expenses`
  - `budgets`
  - `goals`
  - `subscriptions`

*(File `database_schema.sql` tersedia di root folder jika ingin import otomatis).*

-----

## 👤 Author

Dibuat dengan ❤️ dan ☕ oleh **[Nama Kamu]**.

Temukan saya di:

  - **GitHub:** [github.com/username-kamu](https://www.google.com/search?q=https://github.com/juzzoohh)
  - **Instagram:** [@username-kamu](https://www.google.com/search?q=https://instagram.com/sanrozii)
  - **LinkedIn:** [linkedin.com/in/username-kamu](https://www.google.com/search?q=https://linkedin.com/in/muhamad-ichsan-fachrulrozi-50216731b)