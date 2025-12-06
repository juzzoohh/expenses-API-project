const pool = require('../../db');

const getFinancialReportHandler = async (request, h) => {
  const { id: credentialId } = request.auth.credentials; // TAMBAHAN PENTING!
  
  try {
    // 1. QUERY SUMMARY - FILTER BY USER
    const summaryQuery = {
      text: `SELECT type, SUM(amount) AS total 
             FROM expenses 
             LEFT JOIN wallets ON expenses.wallet_id = wallets.id
             WHERE wallets.owner = $1
             GROUP BY type`,
      values: [credentialId] // FILTER USER
    };

    // 2. QUERY CATEGORY - FILTER BY USER
    const categoryQuery = {
      text: `SELECT category, type, SUM(amount) AS total 
             FROM expenses 
             LEFT JOIN wallets ON expenses.wallet_id = wallets.id
             WHERE wallets.owner = $1
             GROUP BY category, type 
             ORDER BY total DESC`,
      values: [credentialId] // FILTER USER
    };

    const [summaryResult, categoryResult] = await Promise.all([
      pool.query(summaryQuery),
      pool.query(categoryQuery),
    ]);

    // --- SUMMARY LOGIC ---
    const incomeRow = summaryResult.rows.find((row) => row.type === 'INCOME');
    const totalIncome = parseInt(incomeRow ? incomeRow.total : 0);

    const expenseRow = summaryResult.rows.find((row) => row.type === 'EXPENSE');
    const totalExpense = parseInt(expenseRow ? expenseRow.total : 0);

    const netBalance = totalIncome - totalExpense;

    // 3. Filter Income Categories
    const incomeCategories = categoryResult.rows
      .filter((row) => row.type === 'INCOME') 
      .map((row) => ({
        category: row.category,
        total: parseInt(row.total),
      }));

    // 4. Filter Expense Categories
    const expenseCategories = categoryResult.rows
      .filter((row) => row.type === 'EXPENSE') 
      .map((row) => ({
        category: row.category,
        total: parseInt(row.total),
      }));

    return {
      status: 'success',
      data: {
        summary: {
          totalIncome,
          totalExpense,
          netBalance,
          status: netBalance >= 0 ? 'AMAN (SURPLUS)' : 'BAHAYA (DEFISIT)',
        },
        breakdown: {
          income: incomeCategories,
          expense: expenseCategories,
        },
      },
    };
  } catch (error) {
    console.error('ERROR REPORT:', error.message);
    const response = h.response({
      status: 'error',
      message: 'Gagal membuat laporan keuangan',
    });
    response.code(500);
    return response;
  }
};

module.exports = { getFinancialReportHandler };