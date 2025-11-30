const Joi = require('joi');

const {
  addExpenseHandler,
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
    handler: addExpenseHandler,
    options: {
      validate: {
        payload: Joi.object({
          name: Joi.string().min(3).required(), // Minimal 3 huruf
          amount: Joi.number().integer().min(1).required(), // Angka bulat, minimal 1
          category: Joi.string().required(),
          walletId: Joi.string().required(),
          type: Joi.string().valid('INCOME', 'EXPENSE').required(), // Cuma boleh 2 kata ini
        }),
        failAction: (request, h, err) => {
          throw err;
        },
      },
    },
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
