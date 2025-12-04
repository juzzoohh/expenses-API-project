const { nanoid } = require('nanoid');
const pool = require('../../db');

// 1. AMBIL SEMUA KATEGORI USER
const getCategoriesHandler = async (request, h) => {
  const { id: credentialId } = request.auth.credentials;
  
  const query = {
    text: 'SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at DESC',
    values: [credentialId],
  };

  try {
    const result = await pool.query(query);
    return {
      status: 'success',
      data: { categories: result.rows },
    };
  } catch (error) {
    console.error(error);
    return h.response({ status: 'error', message: 'Gagal ambil kategori' }).code(500);
  }
};

// 2. TAMBAH KATEGORI BARU
const addCategoryHandler = async (request, h) => {
  const { name, type } = request.payload; // type: 'INCOME' atau 'EXPENSE'
  const { id: credentialId } = request.auth.credentials;

  if (!name || !type) return h.response({ status: 'fail', message: 'Nama dan Tipe wajib diisi' }).code(400);

  const id = `cat-${nanoid(16)}`;

  const query = {
    text: 'INSERT INTO categories (id, user_id, name, type) VALUES($1, $2, $3, $4) RETURNING id',
    values: [id, credentialId, name, type],
  };

  try {
    await pool.query(query);
    return h.response({ status: 'success', message: 'Kategori berhasil dibuat' }).code(201);
  } catch (error) {
    console.error(error);
    return h.response({ status: 'error', message: 'Gagal buat kategori' }).code(500);
  }
};

// 3. HAPUS KATEGORI
const deleteCategoryHandler = async (request, h) => {
  const { id } = request.params;
  const { id: credentialId } = request.auth.credentials;

  // Hapus hanya jika milik user tersebut
  const query = {
    text: 'DELETE FROM categories WHERE id = $1 AND user_id = $2',
    values: [id, credentialId],
  };

  try {
    await pool.query(query);
    return { status: 'success', message: 'Kategori dihapus' };
  } catch (error) {
    return h.response({ status: 'error', message: 'Gagal hapus kategori' }).code(500);
  }
};

module.exports = { getCategoriesHandler, addCategoryHandler, deleteCategoryHandler };