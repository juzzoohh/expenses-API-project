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
    console.error('❌ ERROR ADD WALLET:', error.message);
    return h.response({ status: 'error', message: 'Gagal membuat dompet' }).code(500);
  }
};

module.exports = { addWalletHandler };