const { nanoid } = require('nanoid');
const pool = require('./db');

const addExpensesHandler = async (request, h) => {
  const { name, amount, category } = request.payload;

  if (!name || amount <= 0){
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan data, tolong input nama atau masukan jumlah lebih dari nol',
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
  }

  try {
    const result = await pool.query(query);

    if(result.rows[0].id){
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

module.exports = { addExpensesHandler };