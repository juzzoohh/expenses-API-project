const { nanoid } = require('nanoid');
const pool = require('../../db');

const addWalletHandler = async (request, h) => {
  const { name, balance } = request.payload;

  if (!name || balance === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Mohon isi nama dompet atau saldo awal',
    });
    response.code(400);
    return response;
  }

  const id = nanoid(16);

  const query = {
    text: 'INSERT INTO wallets(id, name, balance) VALUES($1, $2, $3) RETURNING id',
    values: [id, name, balance],
  };

  try {
    const result = await pool.query(query);

    if (result.rows[0].id) {
      const response = h.response({
        status: 'success',
        message: 'Berhasil menambahkan dompet!',
      });
      response.code(201);
      return response;
    }
  } catch (error) {
    console.error('GAGAL SERVER RUSAK', error.message);

    const response = h.response({
      status: 'error',
      message: 'Gagal membuat dompet! Maaf server bermasalah',
    });
    response.code(500);
    return response;
  }
};
module.exports = { addWalletHandler };
