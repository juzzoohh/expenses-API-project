const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const pool = require('../../db');

// ==============================================================================
// 1. HANDLER REGISTRASI USER BARU
// ==============================================================================
const addUserHandler = async (request, h) => {
  // Ambil data dari body request
  const { username, password, fullname } = request.payload;

  // Validasi dasar: Pastikan semua kolom terisi
  if (!username || !password || !fullname) {
    const response = h.response({
      status: 'fail',
      message: 'Mohon isi username, password, dan nama lengkap',
    });
    response.code(400);
    return response;
  }

  // Gunakan Client untuk Transaksi Database (Agar User & Wallet tersimpan bersamaan)
  const client = await pool.connect();

  try {
    // Mulai Transaksi (Semua perintah SQL di bawah ini dianggap satu paket)
    await client.query('BEGIN');

    // Langkah A: Cek apakah username sudah dipakai orang lain?
    const checkUserQuery = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };
    const checkResult = await client.query(checkUserQuery);

    if (checkResult.rows.length > 0) {
      throw new Error('USERNAME_EXIST'); // Lempar error khusus jika duplikat
    }

    // Langkah B: Hash Password (Enkripsi agar tidak terbaca di database)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Langkah C: Simpan User ke Database
    const userId = `user-${nanoid(16)}`;
    const insertUserQuery = {
      text: 'INSERT INTO users (id, username, password, fullname) VALUES ($1, $2, $3, $4) RETURNING id',
      values: [userId, username, hashedPassword, fullname],
    };
    await client.query(insertUserQuery);

    // Langkah D: OTOMATIS Buatkan "Dompet Utama" untuk user baru ini
    const walletId = `wallet-${nanoid(16)}`;
    const insertWalletQuery = {
      text: 'INSERT INTO wallets (id, name, balance, owner) VALUES ($1, $2, $3, $4)',
      values: [walletId, 'Dompet Utama', 0, userId], // Saldo awal 0
    };
    await client.query(insertWalletQuery);

    // Langkah E: Jika semua sukses, simpan perubahan permanen (COMMIT)
    await client.query('COMMIT');

    const response = h.response({
      status: 'success',
      message: 'Registrasi berhasil! Dompet utama telah dibuat.',
      data: {
        userId: userId,
      },
    });
    response.code(201);
    return response;

  } catch (error) {
    // Jika ada error di tengah jalan, batalkan semua perubahan (ROLLBACK)
    await client.query('ROLLBACK');
    console.error('❌ REGISTER ERROR:', error.message);

    // Respon khusus jika username sudah ada
    if (error.message === 'USERNAME_EXIST') {
      const response = h.response({
        status: 'fail',
        message: 'Username sudah digunakan orang lain. Ganti yang lain ya!',
      });
      response.code(400);
      return response;
    }

    // Respon error umum (Server Error)
    const response = h.response({
      status: 'error',
      message: 'Maaf, server gagal memproses pendaftaran.',
    });
    response.code(500);
    return response;

  } finally {
    // Jangan lupa lepaskan koneksi client
    client.release();
  }
};

// ==============================================================================
// 2. HANDLER LIHAT PROFIL (GET PROFILE)
// ==============================================================================
const getUserProfileHandler = async (request, h) => {
  // Ambil ID user dari token login (credentials)
  const { id } = request.auth.credentials;

  const query = {
    text: 'SELECT username, fullname FROM users WHERE id = $1',
    values: [id],
  };

  try {
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      const response = h.response({
        status: 'fail',
        message: 'User tidak ditemukan',
      });
      response.code(404);
      return response;
    }

    const user = result.rows[0];

    return {
      status: 'success',
      data: {
        user: {
          username: user.username,
          fullname: user.fullname,
        },
      },
    };

  } catch (error) {
    console.error('❌ GET PROFILE ERROR:', error.message);
    const response = h.response({
      status: 'error',
      message: 'Gagal mengambil data profil',
    });
    response.code(500);
    return response;
  }
};

// ==============================================================================
// 3. HANDLER EDIT PROFIL (GANTI NAMA LENGKAP)
// ==============================================================================
const editUserProfileHandler = async (request, h) => {
  const { id } = request.auth.credentials;
  const { fullname } = request.payload;

  if (!fullname) {
    const response = h.response({
      status: 'fail',
      message: 'Nama lengkap tidak boleh kosong',
    });
    response.code(400);
    return response;
  }

  const query = {
    text: 'UPDATE users SET fullname = $1 WHERE id = $2',
    values: [fullname, id],
  };

  try {
    await pool.query(query);

    return {
      status: 'success',
      message: 'Profil berhasil diperbarui',
    };

  } catch (error) {
    console.error('❌ EDIT PROFILE ERROR:', error.message);
    const response = h.response({
      status: 'error',
      message: 'Gagal memperbarui profil',
    });
    response.code(500);
    return response;
  }
};

// ==============================================================================
// 4. HANDLER GANTI PASSWORD
// ==============================================================================
const changePasswordHandler = async (request, h) => {
  const { id } = request.auth.credentials;
  const { oldPassword, newPassword } = request.payload;

  if (!oldPassword || !newPassword) {
    const response = h.response({
      status: 'fail',
      message: 'Mohon isi password lama dan password baru',
    });
    response.code(400);
    return response;
  }

  try {
    // Langkah A: Ambil password lama (hash) dari database
    const queryGetUser = {
      text: 'SELECT password FROM users WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(queryGetUser);
    
    if (result.rows.length === 0) {
      return h.response({ status: 'fail', message: 'User tidak ditemukan' }).code(404);
    }

    const user = result.rows[0];

    // Langkah B: Bandingkan Password Lama inputan user dengan Hash di Database
    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
      const response = h.response({
        status: 'fail',
        message: 'Password lama salah!',
      });
      response.code(401);
      return response;
    }

    // Langkah C: Enkripsi Password Baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Langkah D: Update ke Database
    const queryUpdate = {
      text: 'UPDATE users SET password = $1 WHERE id = $2',
      values: [hashedNewPassword, id],
    };
    await pool.query(queryUpdate);

    return {
      status: 'success',
      message: 'Password berhasil diganti. Silakan login ulang.',
    };

  } catch (error) {
    console.error('❌ CHANGE PASSWORD ERROR:', error.message);
    const response = h.response({
      status: 'error',
      message: 'Gagal mengganti password',
    });
    response.code(500);
    return response;
  }
};

module.exports = {
  addUserHandler,
  getUserProfileHandler,
  editUserProfileHandler,
  changePasswordHandler,
};