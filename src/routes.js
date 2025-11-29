const {
  addExpensesHandler,
  getAllExpensesHandler,
  getExpenseByIdHandler,
  editExpenseByIdHandler,
  deleteExpenseByIdHandler,
} = require('./handler/expenses');
const { addWalletHandler } = require('./handler/wallets');

const routes = [
  {
    method: 'POST',
    path: '/wallets',
    handler: addWalletHandler,
  },

  // --- ENDPOINT EXPENSES ---
  {
    method: 'POST',
    path: '/expenses',
    handler: addExpensesHandler,
  },
  {
    method: 'GET',
    path: '/expenses',
    handler: getAllExpensesHandler,
  },
  {
    method: 'GET',
    path: '/expenses/{id}',
    handler: getExpenseByIdHandler,
  },
  {
    method: 'PUT',
    path: '/expenses/{id}',
    handler: editExpenseByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/expenses/{id}',
    handler: deleteExpenseByIdHandler,
  },
];

module.exports = routes;
