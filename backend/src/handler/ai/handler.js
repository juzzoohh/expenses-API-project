const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../../db');
require('dotenv').config();

// Gunakan model Gemini 2.0 Flash yang kamu punya
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const getAiInsightHandler = async (request, h) => {
  const { id: credentialId } = request.auth.credentials;

  try {
    // 1. QUERY DATA KEUANGAN
    const summaryQuery = `
      SELECT 
        SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense
      FROM expenses 
      LEFT JOIN wallets ON expenses.wallet_id = wallets.id
      WHERE wallets.owner = $1
        AND date_part('month', expenses.date::DATE) = date_part('month', CURRENT_DATE)
        AND date_part('year', expenses.date::DATE) = date_part('year', CURRENT_DATE)
    `;
    
    const categoryQuery = `
      SELECT category, SUM(amount) as total
      FROM expenses
      LEFT JOIN wallets ON expenses.wallet_id = wallets.id
      WHERE wallets.owner = $1 AND type = 'EXPENSE'
        AND date_part('month', expenses.date::DATE) = date_part('month', CURRENT_DATE)
        AND date_part('year', expenses.date::DATE) = date_part('year', CURRENT_DATE)
      GROUP BY category ORDER BY total DESC LIMIT 3
    `;

    const [summaryRes, catRes] = await Promise.all([
        pool.query(summaryQuery, [credentialId]),
        pool.query(categoryQuery, [credentialId])
    ]);

    const income = parseInt(summaryRes.rows[0].income || 0);
    const expense = parseInt(summaryRes.rows[0].expense || 0);
    const balance = income - expense;
    // Format data kategori biar AI mudah bacanya
    const topCategories = catRes.rows.map(row => `- ${row.category}: Rp ${new Intl.NumberFormat('id-ID').format(row.total)}`).join('\n');

    // 2. SUPER PROMPT (VERSI FIX - TANPA BACKTICK ERROR)
    const prompt = `
      Berperanlah sebagai **Financial Planner Senior** yang punya kepribadian: **Tegas, Logis, tapi Santai (Gaul)**. Kamu bukan robot kaku, kamu teman yang peduli.

      **DATA KEUANGAN USER BULAN INI:**
      - Pemasukan: Rp ${new Intl.NumberFormat('id-ID').format(income)}
      - Pengeluaran: Rp ${new Intl.NumberFormat('id-ID').format(expense)}
      - Sisa Uang (Cashflow): Rp ${new Intl.NumberFormat('id-ID').format(balance)}
      - Top 3 Pemborosan:
      ${topCategories || '(Belum ada data pengeluaran)'}

      **TUGASMU:**
      Analisa data di atas dan berikan saran dengan format HTML murni (tanpa markdown code block, tanpa tag body atau html). 
      
      **STRUKTUR RESPON YANG WAJIB DIIKUTI:**
      
      1. **Headline Status**: Berikan judul singkat, nendang, dan pakai Emoji. (Contoh: "⚠️ DARURAT: DOMPET BOCOR ALUS!" atau "✅ KONDISI PRIMA: CALON SULTAN"). Cetak tebal menggunakan tag b.
      
      2. **Paragraf Pembuka**: Komentar singkat (1-2 kalimat) tentang sisa uangnya. Apakah aman atau bahaya?
      
      3. **Diagnosis & Resep**: Buatlah HTML List (gunakan tag ul dan li) yang berisi 2 poin analisis:
         - Poin 1 (Fokus ke masalah terbesar): Gunakan format <b>🛑 JANGAN BEGINI:</b> [Kritik pengeluaran terbesarnya].
         - Poin 2 (Solusi konkrit): Gunakan format <b>✅ MENDING BEGINI:</b> [Saran aksi nyata yang bisa dilakukan besok].
      
      4. **Closing Statement**: Satu kalimat motivasi sarkas atau lucu. Gunakan tag i (italic).

      **CONTOH OUTPUT YANG DIHARAPKAN:**
      <b>🚨 STATUS: LAMPU KUNING!</b><br><br>
      Gaji kamu lumayan, tapi kok sisa dikit banget? Hati-hati, jangan sampai akhir bulan makan promag.<br><br>
      <ul>
        <li><b>🛑 JANGAN BEGINI:</b> Kamu bakar duit Rp 1.500.000 cuma buat 'Food'. Ini perut apa karet? Kurangi jajan ojolnya.</li>
        <li><b>✅ MENDING BEGINI:</b> Coba masak nasi sendiri atau bawa bekal. Uang jajan itu mending masukin ke pos 'Tabungan' atau 'Investasi'.</li>
      </ul>
      <br>
      <i>Ingat, gaya elit ekonomi sulit itu gak keren, Boss!</i>
    `;

    // 3. EKSEKUSI AI
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return {
        status: 'success',
        data: {
            insight: responseText
        }
    };

  } catch (error) {
    console.error("AI ERROR:", error);
    return {
        status: 'success', 
        data: { insight: "<b>Maaf, Otak AI sedang *Overheat*.</b><br>Coba lagi nanti ya, atau cek koneksi internetmu." } 
    };
  }
};

module.exports = { getAiInsightHandler };