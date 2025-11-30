const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const pool = require('../../db');

const addUserHandler = async (request, h) => {
  const { username, password, fullname } = request.payload;

  if (!username || !password || !fullname) {
    const response = h.response({
      status: 'fail',
      message: 'Mohon isi username, password, dan nama lengkap',
    });
    response.code(400);
    return response;
  }

  const queryCheck = {
    text: 'SELECT username FROM users WHERE username = $1',
    values: [username],
  };
  const checkResult = await pool.query(queryCheck);

  if(checkResult.rows.length > 0) {
    const response = h.response({
      status: 'fail',
      message: 'Username sudah digunakan orang lain. Ganti yang lain ya',
    });
    response.code(400);
    return response;
  }

  // Hasing Password
  const hashedPassword = await bcrypt.hash(password, 10);
  const id = `user-${nanoid(16)}`;

  // Simpan ke database
  const queryInsert = {
    text: 'INSERT INTO users (id, username, password, fullname) VALUES ($1, $2, $3, $4) RETURNING id',
    values: [id, username, hashedPassword, fullname],
  };

  try {
    const result = await pool.query(queryInsert);

    if (result.rows[0].id) {
      const response = h.response({
        status: 'success',
        message: 'Selamat anda berhasil mendaftar!',
      });
      response.code(201);
      return response;
    }

  } catch (error) {
    console.error('GAGAL REGISTER!', error.message);
    const response = h.response({
      status: 'error',
      message: 'Gagal mendaftar, server sedang bermasalah',
    });
    response.code(500);
    return response;
  }
}

module.exports = { addUserHandler };