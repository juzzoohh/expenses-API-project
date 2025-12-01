const pool = require('../../db');

const getFinancialReportHandler = async (request, h) => {
  try {
    // 1. QUERY SUMMARY (Tetap sama)
    const summaryQuery = {
      text: `SELECT type, SUM(amount) AS total FROM expenses GROUP BY type`,
    };

    // 2. QUERY CATEGORY (DIPERBAIKI)
    // - Hapus 'WHERE type = EXPENSE' (Supaya income juga keambil)
    // - Tambah kolom 'type' di SELECT dan GROUP BY (Supaya bisa difilter di JS)
    const categoryQuery = {
      text: `SELECT category, type, SUM(amount) AS total 
             FROM expenses 
             GROUP BY category, type 
             ORDER BY total DESC`,
    };

    const [summaryResult, categoryResult] = await Promise.all([
      pool.query(summaryQuery),
      pool.query(categoryQuery),
    ]);

    // --- SUMMARY LOGIC ---
    const incomeRow = summaryResult.rows.find(row => row.type === 'INCOME');
    const totalIncome = parseInt(incomeRow ? incomeRow.total : 0);

    const expenseRow = summaryResult.rows.find(row => row.type === 'EXPENSE');
    const totalExpense = parseInt(expenseRow ? expenseRow.total : 0);

    const netBalance = totalIncome - totalExpense;
    
    // 3. Filter Income Categories
    const incomeCategories = categoryResult.rows
      .filter(row => row.type === 'INCOME') // Variabel konsisten pakai 'row'
      .map(row => ({
          category: row.category, 
          total: parseInt(row.total) 
      }));

    // 4. Filter Expense Categories
    const expenseCategories = categoryResult.rows
      .filter(row => row.type === 'EXPENSE') // Variabel konsisten pakai 'row'
      .map(row => ({
          category: row.category, 
          total: parseInt(row.total) 
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
          expense: expenseCategories
        }
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