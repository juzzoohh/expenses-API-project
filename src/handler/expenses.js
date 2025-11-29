const { nanoid } = require('nanoid');
const pool = require('../db');

const addExpensesHandler = async (request, h) => {
  // Ambil 'type' dari payload (INCOME / EXPENSE)
  const { name, amount, category, walletId, type } = request.payload;
        // --- VALIDASI ---
  // Pastikan type cuma boleh 'INCOME' atau 'EXPENSE'
  if (!name || amount <= 0 || !category || !walletId || !['INCOME', 'EXPENSE'].includes(type)) {
    const response = h.response({
      status: 'fail',
      message:
        'Gagal menambahkan data, tolong input nama atau masukan jumlah lebih dari nol',
    });
    response.code(400);
    return response;
  }

  const id = nanoid(16);
  const date = new Date().toISOString();
  const createdAt = date;

      // --- LOGIKA SALDO ---
  let queryUpdateWallet;

  if(type === 'INCOME') {
    // Kalau Pemasukan: Saldo DITAMBAH (+)
    queryUpdateWallet = 'UPDATE wallets SET balance = balance + $1 WHERE id = $2 RETURNING balance';
  } else {
    // Kalau Pengeluaran: Saldo DIKURANGI (-)
    queryUpdateWallet = 'UPDATE wallets SET balance = balance - $1 WHERE id = $2 AND balance >= 0 RETURNING balance';
  }

  

  const updateWalletQuery = {
    text: 'UPDATE wallets SET balance = balance - $1 WHERE id = $2 AND balance >= 0 RETURNING balance',
    values: [amount, walletId],
  };
  
  try {
    // Eksekusi Update Saldo (Sesuai Type)
    const walletResult = await pool.query({
      text: queryUpdateWallet,
      values: [amount, walletId],
    });

    if (walletResult.rowCount === 0) {
      const response = h.response({
        status: 'fail',
        message: 'Dompet tidak ditemukan!',
      });
      response.code(404);
      return response;
    }

    // Eksekusi Update Saldo (Sesuai Type)
    const insertExpenseQuery = {
      text: 'INSERT INTO expenses (id, name, amount, category, date, created_at, wallet_id, type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [id, name, amount, category, date, createdAt, walletId, type],
    }

    await pool.query(insertExpenseQuery);
    const response = h.response({
      status: 'success',
      message: type === 'INCOME' ? 'Pemasukan berhasil!' : 'Pengeluaran berhasil!',
      data: {
        transactionId: id,
        sisaSaldo: walletResult.rows[0].balance,
        tipe: type,
      },
    }); 
    response.code(201);
    return response;

  } catch (error) {
    console.log('ERROR DATABSE TERPUTUS/TIDAK NYAMBUNG', error.message);

    const response = h.response({
      status: 'error',
      message: 'Transaksi Gagal!',
    });
    response.code(500);
    return response;
  }
};

const getAllExpensesHandler = async (request, h) => {
  // --- QUERY SQL ---
  // Pakai "ORDER BY created_at DESC" biar yang baru diinput muncul paling atas.
  const query = {
    text: 'SELECT * FROM expenses ORDER BY created_at DESC',
  };

  try {
    const result = await pool.query(query);

    const expenses = result.rows.map((expense) => ({
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
    }));

    return {
      status: 'success',
      data: {
        expenses: expenses,
      },
    };
  } catch (error) {
    console.error('GAGAL MENGAMBIL DATA', error.message);

    const response = h.response({
      status: 'error',
      message: 'Maaf server, masih pusing',
    });
    response.code(500);
    return response;
  }
};

const getExpenseByIdHandler = async (request, h) => {
  const { id } = request.params;

  // --- QUERY ---
  const query = {
    text: 'SELECT * FROM expenses WHERE id = $1',
    values: [id],
  };

  try {
    const result = await pool.query(query);

    if (result.rows.length > 0) {
      const expense = result.rows[0];

      const mappedExpense = {
        id: expense.id,
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
      };

      return {
        status: 'success',
        data: {
          expense: mappedExpense,
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
    console.error('SERVER MATI', error.message);

    const response = h.response({
      status: 'error',
      message: 'Server lagi bermasalah, mohon maaf',
    });
    response.code(500);
    return response;
  }
};

const editExpenseByIdHandler = async (request, h) => {
  const { id } = request.params;

  const { name, amount, category } = request.payload;

  if (!name || amount <= 0) {
    const response = h.response({
      status: 'fail',
      message:
        'Gagal update! coba cek dulu nama atau jumlahnya tidak boleh kurang sama dengan nol!',
    });
    response.code(400);
    return response;
  }

  const query = {
    text: 'UPDATE expenses SET name = $1, amount = $2, category = $3 WHERE id = $4 RETURNING id',
    values: [name, amount, category, id],
  };

  try {
    const result = await pool.query(query);

    if (result.rowCount === 0) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui! ID tidak ditemukan!',
      });
      response.code(404);
      return response;
    }

    const response = h.response({
      status: 'success',
      message: 'Data berhasil diperbarui!',
    });
    response.code(200);
    return response;
  } catch (error) {
    console.error('GAGAL MEMPERBARUI DATA!', error.message);

    const response = h.response({
      status: 'error',
      message: 'Maaf server, sedang rusak',
    });
    response.code(500);
    return response;
  }
};

const deleteExpenseByIdHandler = async (request, h) => {
  const { id } = request.params;

  const query = {
    text: 'DELETE FROM expenses WHERE id = $1 RETURNING id',
    values: [id],
  };

  try {
    const result = await pool.query(query);

    if (result.rowCount === 0) {
      const response = h.response({
        status: 'fail',
        message: 'Data sudah kosong!',
      });
      response.code(404);
      return response;
    }

    const response = h.response({
      status: 'success',
      message: 'Data berhasil dihapus!',
    });
    response.code(200);
    return response;
  } catch (error) {
    console.error('GAGAL SERVER RUSAK', error.message);

    const response = h.response({
      status: 'error',
      message: 'Gagal dihapus karena server rusak!',
    });
    response.code(500);
    return response;
  }
};

module.exports = {
  addExpensesHandler,
  getAllExpensesHandler,
  getExpenseByIdHandler,
  editExpenseByIdHandler,
  deleteExpenseByIdHandler,
};
