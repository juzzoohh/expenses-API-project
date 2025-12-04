const { nanoid } = require('nanoid');
const pool = require('../../db');

// --- 1. ADD EXPENSE ---
const addExpenseHandler = async (request, h) => {
  const { name, amount, category, walletId, type } = request.payload;
  const { id: credentialId } = request.auth.credentials; // Ambil ID User Login

  // Validasi Kepemilikan Dompet 
  // Pastikan dompet yang mau dipakai itu punya user yang login
  const queryVerifyOwner = {
    text: 'SELECT owner FROM wallets WHERE id = $1',
    values: [walletId],
  };
  const resultOwner = await pool.query(queryVerifyOwner);

  if (!resultOwner.rows.length) {
      return h.response({ status: 'fail', message: 'Dompet tidak ditemukan' }).code(404);
  }

  const wallet = resultOwner.rows[0];
  if (wallet.owner !== credentialId) {
      return h.response({
          status: 'fail',
          message: 'Anda tidak berhak mengakses dompet ini',
      }).code(403);
  }

  // Persiapan Data
  const id = nanoid(16);
  const date = new Date().toISOString();
  const createdAt = date;

  const client = await pool.connect();

  try {
    // Mulai Transaksi Aman (ACID)
    await client.query('BEGIN');

    // Tentukan nasib saldo (Tambah atau Kurang)
    let queryUpdateWallet;
    if (type === 'INCOME') {
      queryUpdateWallet = 'UPDATE wallets SET balance = balance + $1 WHERE id = $2 RETURNING balance';
    } else {
      queryUpdateWallet = 'UPDATE wallets SET balance = balance - $1 WHERE id = $2 RETURNING balance';
    }

    const walletResult = await client.query({
      text: queryUpdateWallet,
      values: [amount, walletId],
    });

    if (walletResult.rowCount === 0) {
        throw new Error('DOMPET_TIDAK_DITEMUKAN');
    }

    // Catat Transaksi
    const insertExpenseQuery = {
      text: 'INSERT INTO expenses(id, name, amount, category, date, created_at, wallet_id, type) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [id, name, amount, category, date, createdAt, walletId, type],
    };

    await client.query(insertExpenseQuery);

    // Simpan Permanen
    await client.query('COMMIT');

    return h.response({
      status: 'success',
      message: type === 'INCOME' ? 'Pemasukan berhasil!' : 'Pengeluaran berhasil!',
      data: {
        transactionId: id,
        sisaSaldo: walletResult.rows[0].balance,
        tipe: type
      },
    }).code(201);

  } catch (error) {
    // Batalkan Semua Jika Error
    await client.query('ROLLBACK');
    console.error('❌ ERROR TRANSAKSI:', error.message);

    if (error.message === 'DOMPET_TIDAK_DITEMUKAN') {
        return h.response({ status: 'fail', message: 'Dompet tidak ditemukan.' }).code(404);
    }

    return h.response({ status: 'error', message: 'Transaksi gagal' }).code(500);
  } finally {
    client.release();
  }
};

// --- 2. GET ALL EXPENSES ---
const getAllExpensesHandler = async (request, h) => {
  const { name, category, startDate, endDate } = request.query;
  const { id: credentialId } = request.auth.credentials; // Ambil ID User

  // Query : gabungkan expenses dengan wallets untuk cek pemiliknya
  let text = `SELECT expenses.* FROM expenses
              LEFT JOIN wallets ON expenses.wallet_id = wallets.id
              WHERE wallets.owner = $1`; 
  
  const values = [credentialId]; // $1 adalah ID User
  const conditions = [];

  // Filter Nama
  if (name) {
    conditions.push(`expenses.name ILIKE $${values.length + 1}`);
    values.push(`%${name}%`);
  }

  // Filter Kategori
  if (category) {
    conditions.push(`expenses.category ILIKE $${values.length + 1}`);
    values.push(`%${category}%`);
  }

  if (startDate && endDate) {
    // Tambahkan kondisi rentang tanggal
    conditions.push(`expenses.date::DATE >= $${values.length + 1}::DATE`);
    values.push(startDate);
    
    conditions.push(`expenses.date::DATE <= $${values.length + 1}::DATE`);
    values.push(endDate);
  }

  // Gabungkan kondisi tambahan
  if (conditions.length > 0) {
    text += ' AND ' + conditions.join(' AND ');
  }

  // Urutkan secara descending
  text += ' ORDER BY expenses.date DESC, expenses.created_at DESC';

  const query = { text, values };

  try {
    const result = await pool.query(query);

    const expenses = result.rows.map((expense) => ({
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      type: expense.type,
      walletId: expense.wallet_id
    }));

    return { status: 'success', data: { expenses } };

  } catch (error) {
    console.error('❌ ERROR GET:', error.message);
    const response = h.response({
      status: 'error',
      message: 'Gagal ambil data',
    });
    response.code(500);
    return response;
  }
};

// --- 3. GET DETAIL EXPENSE ---
const getExpenseByIdHandler = async (request, h) => {
  const { id } = request.params;
  const { id: credentialId } = request.auth.credentials;

  // Cek apakah expense ini milik user yang login?
  const query = {
    text: `SELECT expenses.* FROM expenses
           LEFT JOIN wallets ON expenses.wallet_id = wallets.id
           WHERE expenses.id = $1 AND wallets.owner = $2`,
    values: [id, credentialId],
  };

  try {
    const result = await pool.query(query);

    if (result.rows.length > 0) {
      const expense = result.rows[0];
      return {
        status: 'success',
        data: {
          expense: {
            id: expense.id,
            name: expense.name,
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
            type: expense.type,
            walletId: expense.wallet_id
          },
        },
      };
    }

    const response = h.response({
      status: 'fail',
      message: 'Pengeluaran tidak ditemukan',
    });
    response.code(404);
    return response;

  } catch (error) {
    console.error('❌ ERROR DETAIL:', error.message);
    return h.response({ status: 'error', message: 'Maaf, server error.' }).code(500);
  }
};

// --- 4. UPDATE EXPENSE ---
const editExpenseByIdHandler = async (request, h) => {
  const { id } = request.params;
  const { name, amount, category } = request.payload;
  const { id: credentialId } = request.auth.credentials;

  // Cek kepemilikan dulu sebelum update
  const verifyQuery = {
    text: `SELECT expenses.id FROM expenses 
           LEFT JOIN wallets ON expenses.wallet_id = wallets.id 
           WHERE expenses.id = $1 AND wallets.owner = $2`,
    values: [id, credentialId]
  };
  
  const verifyResult = await pool.query(verifyQuery);
  if (verifyResult.rows.length === 0) {
      return h.response({ status: 'fail', message: 'Gagal memperbarui. ID tidak ditemukan atau bukan milik Anda.' }).code(404);
  }

  // Update Data
  const query = {
    text: 'UPDATE expenses SET name = $1, amount = $2, category = $3 WHERE id = $4 RETURNING id',
    values: [name, amount, category, id],
  };

  try {
    await pool.query(query);
    return h.response({
      status: 'success',
      message: 'Pengeluaran berhasil diperbarui',
    }).code(200);
  } catch (error) {
    console.error('❌ ERROR UPDATE:', error.message);
    return h.response({ status: 'error', message: 'Gagal update data' }).code(500);
  }
};

// --- 5. DELETE EXPENSE ---
const deleteExpenseByIdHandler = async (request, h) => {
  const { id } = request.params;
  const { id: credentialId } = request.auth.credentials;

  // Cek kepemilikan sebelum hapus
  const verifyQuery = {
    text: `SELECT expenses.id FROM expenses 
           LEFT JOIN wallets ON expenses.wallet_id = wallets.id 
           WHERE expenses.id = $1 AND wallets.owner = $2`,
    values: [id, credentialId]
  };

  const verifyResult = await pool.query(verifyQuery);
  if (verifyResult.rows.length === 0) {
      return h.response({ status: 'fail', message: 'Gagal menghapus. ID tidak ditemukan atau bukan milik Anda.' }).code(404);
  }

  const query = {
    text: 'DELETE FROM expenses WHERE id = $1 RETURNING id',
    values: [id],
  };

  try {
    await pool.query(query);
    return h.response({
      status: 'success',
      message: 'Pengeluaran berhasil dihapus',
    }).code(200);
  } catch (error) {
    console.error('❌ ERROR DELETE:', error.message);
    return h.response({ status: 'error', message: 'Gagal menghapus data' }).code(500);
  }
};

module.exports = {
  addExpenseHandler,
  getAllExpensesHandler,
  getExpenseByIdHandler,
  editExpenseByIdHandler,
  deleteExpenseByIdHandler,
};