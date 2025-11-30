const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');
const pool = require('../../db');
require('dotenv').config(); // Pastikan env terbaca

const loginUserHandler = async (request, h) => {
  const { username, password } = request.payload;

  // Cek: Apakah username atau password kosong?
  if (!username || !password) {
    const response = h.response({
      status: 'fail',
      // PENTING: Jangan bilang "Username tidak ditemukan".
      // Bilang "Username atau Password salah" biar hacker bingung mana yang salah.
      message: 'Tolong isi username atau password!',
    });
    response.code(400);
    return response;
  }

  // CARI USER DI DATABASE (Masuk ke Gudang)
  const query = {
    text: 'SELECT id, username, password FROM users WHERE username = $1',
    values: [username],
  };
  const result = await pool.query(query);

  // result.rows.length === 0 artinya tidak ada baris yang cocok (User Ghaib)
  if (result.rows.length === 0) {
    const response = h.response({
      status: 'fail',
      message: 'Username atau password salah!',
    });
    response.code(401);
    return response;
  }

  // Karena username unik, pasti cuma ada 1 hasil. Ambil yang pertama (index 0).
  const user = result.rows[0];

  // bcrypt.compare akan membandingkan:
  // - Password mentah dari user (misal: "rahasia123")
  // - Password bubur (hash) dari database (misal: "$2b$10$AbCd...")
  const isValid = await bcrypt.compare(password, user.password);

  // Kalau tidak cocok (isValid == false), berarti password salah.
  if (!isValid) {
    const response = h.response({
      status: 'fail',
      message: 'Username atau password salah!',
    });
    response.code(401);
    return response;
  }

  // Kalau sampai baris ini, berarti Username & Password BENAR.
  // buatkan dia "Kartu Akses Elektronik" (JWT).
  const token = Jwt.token.generate(
    {
      id: user.id, // Data yang disimpan dalam kartu (Payload)
      username: user.username,
    },
    process.env.ACCESS_TOKEN_KEY // Stempel Rahasia/Tanda Tangan Digital (dari .env)
  );

  const response = h.response({
    status: 'success',
    message: 'Login berhasil!',
    data: {
      accessToken: token,
    },
  });
  response.code(201);
  return response;
};

module.exports = { loginUserHandler };
