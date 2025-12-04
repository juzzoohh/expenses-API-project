const {nanoid} = require('nanoid');
const pool = require('../../db');

const setBudgetHandler = async (request, h) => {
  const { category, amount } = request.payload;
  const { id: credentialId } = request.auth.credentials;

  const id = `budget-${nanoid(16)}`;

  const query = {
    text: `
      INSERT INTO budgets (id, user_id, category, amount)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, category)
      DO UPDATE SET amount = EXCLUDED.amount
      RETURNING id
    `,
    values: [id, credentialId, category, amount],
  };

  try {
    await pool.query(query);
    const response = h.response({
      status: 'success',
      message: `Budget untuk ${category} berhasil diatur`,
    });
    response.code(201);
    return response;

  } catch (error) {
    console.error('ERROR SERVER:', error.message);
    const response = h.response({
      status: 'error',
      message: 'Gagal mengatur budget',
    });
    response.code(500);
    return response;
  }
};

// GET BUDGET STATUS (Monitoring)
// Ini mengambil Limit Budget SEKALIGUS menghitung pengeluaran bulan ini
const getBudgetStatusHandler = async (request, h) => {
  const { id: credentialId } = request.auth.credentials;

  // Logika: Ambil semua budget user, lalu gabungkan dengan total pengeluaran bulan ini di kategori tersebut
  const query = {
    text: `
      SELECT 
        b.id,
        b.category,
        b.amount AS "limit",
        COALESCE(SUM(e.amount), 0) AS "spent"
      FROM budgets b
      LEFT JOIN (
        -- Subquery: Ambil pengeluaran user ini di BULAN INI saja
        SELECT ex.category, ex.amount
        FROM expenses ex
        JOIN wallets w ON ex.wallet_id = w.id
        WHERE w.owner = $1
          AND date_part('month', ex.date::DATE) = date_part('month', CURRENT_DATE)
          AND date_part('year', ex.date::DATE) = date_part('year', CURRENT_DATE)
          AND ex.type = 'EXPENSE'
      ) e ON b.category = e.category
      WHERE b.user_id = $1
      GROUP BY b.id, b.category, b.amount
      ORDER BY b.amount DESC
    `,
    values: [credentialId],
  };

  try {
    const result = await pool.query(query);

    const budgets = result.rows.map(row => {
      const limit = parseInt(row.limit);
      const spent = parseInt(row.spent);
      const percentage = Math.round((spent / limit) * 100);
      const remaining = limit - spent;

      let status = 'SAFE'; //Hijau
      if (percentage >= 100) status = 'OVER'; // Merah
      else if (percentage >= 80) status = 'WARNING'; //Kuning

      return {
        id: row.id,
        category: row.category,
        limit,
        spent,
        remaining,
        percentage,
        status
      };
    });
    return {
      status: 'success',
      data : { budgets },
    };

  } catch (error) {
    console.error('ERROR GET BUDGET:', error.message);
    const response = h.response({
      status: 'error',
      message: 'Gagal mengambil data budget',
    });
    response.code(500);
    return response;
  }
};

module.exports = { setBudgetHandler, getBudgetStatusHandler };