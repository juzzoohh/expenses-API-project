const { nanoid } = require('nanoid');
const pool = require('../../db');

const addGoalHandler = async (request, h) => {
  const { name, targetAmount, startAmount } = request.payload;
  const { id: credentialId } = request.auth.credentials;

  const id = `goal-${nanoid(16)}`;
  // startAmount opsional, kalau user mau langsung isi saldo awal
  const initialAmount = startAmount || 0;

  const query = {
    text: 'INSERT INTO goals(id, name, target_amount, current_amount, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    values: [id, name, targetAmount, initialAmount, credentialId],
  };

  try {
    await pool.query(query);

    const response = h.response({
      status: 'success',
      message: 'Target keuangan berhasil dibuat! Semangat!',
      data: {
        goalId: id,
      },
    });
    response.code(201);
    return response;
  } catch (error) {
    console.error('ERROR ADD GOAL:', error.message);

    const response = h.response({
      status: 'error',
      message: 'Gagal membuat target',
    });
    response.code(500);
    return response;
  }
};

const getGoalsHandler = async (request, h) => {
  const { id: credentialId } = request.auth.credentials;

  const query = {
    text: 'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
    values: [credentialId],
  };

  try {
    const result = await pool.query(query);
    return {
      status: 'success',
      data: {
        goals: result.rows.map((g) => ({
          id: g.id,
          name: g.name,
          targetAmount: parseInt(g.target_amount),
          currentAmount: parseInt(g.current_amount),
          // Hitung persentase progress di backend biar frontend enteng
          percentage: Math.min(
            100,
            Math.round(
              (parseInt(g.current_amount) / parseInt(g.target_amount)) * 100
            )
          ),
        })),
      },
    };
  } catch (error) {
    console.error('ERROR GET GOALS:', error.message);

    const response = h.response({
      status: 'error',
      message: 'Gagal ambil data target',
    });
    response.code(500);
    return response;
  }
};

const updateGoalAmountHandler = async (request, h) => {
  const { id } = request.params;
  const { amount, type } = request.payload;

  if (!amount || !type) {
    const response = h.response({
      status: 'fail',
      message: 'Data tidak lengkap',
    });
    response.code(400);
    return response;
  }

  let operator = type === 'add' ? '+' : '-';

  const query = {
    text: `UPDATE goals SET current_amount = current_amount + ${operator} $1 WHERE id = $2 RETURNING current_amount`,
    values: [amount, id],
  };

  try {
    await pool.query(query);

    const response = h.response({
      status: 'error',
      message: 'Saldo target berhasil diupdate',
    });
    response.code(200);
    return response;
  } catch (error) {
    const response = h.response({
      status: 'error',
      message: 'Gagal update saldo target',
    });
    response.code(500);
    return response;
  }
};

module.exports = { addGoalHandler, getGoalsHandler, updateGoalAmountHandler };
