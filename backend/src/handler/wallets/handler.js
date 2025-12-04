const { nanoid } = require('nanoid');
const pool = require('../../db'); // Mundur 2 langkah

const addWalletHandler = async (request, h) => {
  const { name, balance } = request.payload;
  
  // Ambil ID User dari Token (Credential)
  const { id: credentialId } = request.auth.credentials; 

  // Validasi Input
  if (!name || balance === undefined) {
    return h.response({
      status: 'fail',
      message: 'Mohon isi nama dompet dan saldo awal',
    }).code(400);
  }

  const id = `wallet-${nanoid(16)}`;

  // Query SQL: Masukkan credentialId ke kolom 'owner'
  const query = {
    text: 'INSERT INTO wallets(id, name, balance, owner) VALUES($1, $2, $3, $4) RETURNING id',
    values: [id, name, balance, credentialId], 
  };

  try {
    const result = await pool.query(query);
    
    return h.response({
      status: 'success',
      message: 'Dompet berhasil dibuat',
      data: { 
        walletId: id,
        owner: credentialId // Biar bisa liat siapa pemiliknya di response
      },
    }).code(201);

  } catch (error) {
    console.error('ERROR ADD WALLET:', error.message);
    return h.response({ status: 'error', message: 'Gagal membuat dompet' }).code(500);
  }
};

const getWalletsHandler = async (request, h) => {
  const { id: credentialId } = request.auth.credentials;

  const query = {
    text: 'SELECT id, name, balance FROM wallets WHERE owner = $1',
    values: [credentialId],
  };

  try {
    const result = await pool.query(query);
    return {
      status: 'success',
      data: {
        wallets: result.rows,
      },
    };
  } catch (error) {
    console.error('ERROR GET WALLETS:', error.message);
    return h.response({ status: 'error', message: 'Gagal ambil data dompet' }).code(500);
  }
};

const deleteWalletHandler = async (request, h) => {
  const { id } = request.params;
  const { id: credentialId } = request.auth.credentials;

  // cek apakah dompet ini milik user yang login?
  const queryVerify = {
    text: 'SELECT id FROM wallets WHERE id = $1 AND owner = $2',
    values: [id, credentialId],
  };
  const verifyResult = await pool.query(queryVerify);

  if (!verifyResult.rows.length) {
    const response = h.response({
      status: 'fail',
      message: 'Dompet tidak ditemukan atau bukan milik Anda',
    });
    response.code(404);
    return response;
  }

  // cek apakah ada transaksi di dompet ini?
  const queryCheckTrans = {
    text: 'SELECT id FROM expenses WHERE wallet_id = $1 LIMIT 1',
    values: [id],
  };
  const transResult = await pool.query(queryCheckTrans);

  if (!transResult.rows.length > 0) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal hapus! Dompet ini masih mencatat riwayat transaksi. Hapus dulu transaksinya.',
    });
    response.code(400);
    return response;
  }

  // Hapus dompet
  const queryDelete = {
    text: 'DELETE FROM wallets WHERE id = $1',
    values: [id],
  };
  const deleteResult = await pool.query(queryDelete);

  const response = h.response({
    status: 'success',
    message: 'Dompet berhasil dihapus',
  });
  response.code(200);
  return response;
};

module.exports = { addWalletHandler, getWalletsHandler, deleteWalletHandler };