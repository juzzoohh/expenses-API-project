const { nanoid } = require('nanoid');
const pool = require('../../db');

// 1. TAMBAH LANGGANAN BARU
const addSubscriptionHandler = async (request, h) => {
  const { name, amount, category, walletId, nextPaymentDate } = request.payload;
  const { id: credentialId } = request.auth.credentials;

  const id = `sub-${nanoid(16)}`;

  const query = {
    text: 'INSERT INTO subscriptions (id, user_id, name, amount, category, wallet_id, next_payment_date) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    values: [id, credentialId, name, amount, category, walletId, nextPaymentDate],
  };

  try {
    await pool.query(query);
    return h.response({ status: 'success', message: 'Langganan berhasil disimpan' }).code(201);
  } catch (error) {
    console.error(error);
    return h.response({ status: 'error', message: 'Gagal menambah langganan' }).code(500);
  }
};

// 2. AMBIL DAFTAR LANGGANAN
const getSubscriptionsHandler = async (request, h) => {
  const { id: credentialId } = request.auth.credentials;

  const query = {
    text: `SELECT s.*, w.name as wallet_name 
           FROM subscriptions s
           LEFT JOIN wallets w ON s.wallet_id = w.id
           WHERE s.user_id = $1 
           ORDER BY s.next_payment_date ASC`,
    values: [credentialId],
  };

  try {
    const result = await pool.query(query);
    return { status: 'success', data: { subscriptions: result.rows } };
  } catch (error) {
    console.error(error);
    return h.response({ status: 'error', message: 'Gagal ambil data' }).code(500);
  }
};

// 3. PROSES BAYAR (MAGIC FEATURE)
const paySubscriptionHandler = async (request, h) => {
  const { id } = request.params; // ID Subscription
  const { id: credentialId } = request.auth.credentials;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // A. Ambil Data Langganan
    const subRes = await client.query('SELECT * FROM subscriptions WHERE id = $1 AND user_id = $2', [id, credentialId]);
    
    if (!subRes.rows.length) {
        throw new Error('NOT_FOUND');
    }
    
    const sub = subRes.rows[0];

    // Konversi "50000.00" (String) menjadi 50000 (Integer)
    // Agar PostgreSQL tidak error saat mengurangi saldo
    const amount = parseInt(sub.amount); 
    // -------------------------

    // B. Catat sebagai Pengeluaran (Expense)
    const expenseId = nanoid(16);
    const date = new Date().toISOString();
    
    // Potong Saldo Dompet (Pakai variabel 'amount' yang sudah bersih)
    await client.query('UPDATE wallets SET balance = balance - $1 WHERE id = $2', [amount, sub.wallet_id]);
    
    // Masuk Tabel Expenses (Pakai variabel 'amount' juga)
    await client.query(
      'INSERT INTO expenses(id, name, amount, category, date, created_at, wallet_id, type) VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
      [expenseId, sub.name, amount, sub.category, date, date, sub.wallet_id, 'EXPENSE']
    );

    // C. Update Tanggal Tagihan Berikutnya (Maju 1 Bulan)
    await client.query(
      `UPDATE subscriptions 
       SET next_payment_date = next_payment_date + INTERVAL '1 month' 
       WHERE id = $1`, 
      [id]
    );

    await client.query('COMMIT');
    return { status: 'success', message: `Tagihan ${sub.name} berhasil dibayar!` };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('PAY ERROR:', error.message);
    
    if (error.message === 'NOT_FOUND') {
        return h.response({ status: 'fail', message: 'Langganan tidak ditemukan' }).code(404);
    }

    return h.response({ status: 'error', message: 'Gagal memproses pembayaran. Cek saldo dompet!' }).code(500);
  } finally {
    client.release();
  }
};

// 4. HAPUS LANGGANAN
const deleteSubscriptionHandler = async (request, h) => {
    const { id } = request.params;
    await pool.query('DELETE FROM subscriptions WHERE id = $1', [id]);
    return { status: 'success', message: 'Langganan berhenti' };
};

module.exports = { 
  addSubscriptionHandler, 
  getSubscriptionsHandler, 
  paySubscriptionHandler,
  deleteSubscriptionHandler 
};