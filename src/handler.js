const { nanoid } = require('nanoid');
const pool = require('./db');

const addExpensesHandler = async (request, h) => {
  const { name, amount, category } = request.payload;

  if (!name || amount <= 0) {
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

  const query = {
    text: 'INSERT INTO expenses (id, name, amount, category, date, created_at) VALUES ($1, $2, $3, $4, $5, $6 ) RETURNING id',
    values: [id, name, amount, category, date, createdAt],
  };

  try {
    const result = await pool.query(query);

    if (result.rows[0].id) {
      const response = h.response({
        status: 'success',
        message: 'Berhasil konek ke database',
        data: {
          expensesId: id,
        },
      });
      response.code(201);
      return response;
    }
  } catch (error) {
    console.log('ERROR DATABSE TERPUTUS/TIDAK NYAMBUNG', error.message);

    const response = h.response({
      status: 'error',
      message: 'Maaf, terjadi kesalahan pada database',
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

  if(!name || amount <= 0){
    const response = h.response({
      status: 'fail',
      message: 'Gagal update! coba cek dulu nama atau jumlahnya tidak boleh kurang sama dengan nol!',
    }); 
    response.code(400);
    return response;  
  }

  const query = {
    text: 'UPDATE expenses SET name = $1, amount = $2, category = $3 WHERE id = $4 RETURNING id',
    values: [ name, amount, category, id ],
  };

  try {
    const result = await pool.query(query);

    if (result.rowCount === 0){
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
}

module.exports = {
  addExpensesHandler,
  getAllExpensesHandler,
  getExpenseByIdHandler,
  editExpenseByIdHandler,
};
