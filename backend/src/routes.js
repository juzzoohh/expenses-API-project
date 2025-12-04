const Joi = require('joi');
const {
  addExpenseHandler,
  getAllExpensesHandler,
  getExpenseByIdHandler,
  editExpenseByIdHandler,
  deleteExpenseByIdHandler,
} = require('./handler/expenses/handler');
const { addWalletHandler, getWalletsHandler, deleteWalletHandler } = require('./handler/wallets/handler');
const { addUserHandler, getUserProfileHandler, editUserProfileHandler, changePasswordHandler } = require('./handler/users/handler');
const { loginUserHandler } = require('./handler/auth/handler')
const { getFinancialReportHandler } = require('./handler/reports/handler');
const { addGoalHandler, getGoalsHandler, updateGoalAmountHandler } = require('./handler/goals/handler');

const routes = [
  // --- ROUTES USER PROFILE ---
  {
    method: 'GET',
    path: '/users/profile',
    handler: getUserProfileHandler,
    options: {
      auth: 'jwt_strategy',
    },
  },

  {
    method: 'PUT',
    path: '/users/profile',
    handler: editUserProfileHandler,
    options: {
      auth: 'jwt_strategy',
    },
  },

  {
    method: 'PUT',
    path: '/users/password',
    handler: changePasswordHandler,
    options: {
      auth: 'jwt_strategy',
    },
  },


  // --- ROUTES GOALS ---
  {
    method: 'POST',
    path: '/goals',
    handler: addGoalHandler,
    options: {
      auth: 'jwt_strategy',
    },
  }, 

  {
    method: 'GET',
    path: '/goals',
    handler: getGoalsHandler,
    options: {
      auth: 'jwt_strategy',
    },
  }, 

  {
    method: 'PUT',
    path: '/goals/{id}',
    handler: updateGoalAmountHandler,
    options: {
      auth: 'jwt_strategy',
    },
  },

  // --- ROUTES REPORTS ---
  {
    method: 'GET',
    path: '/reports',
    handler: getFinancialReportHandler,
    options: {
      auth: 'jwt_strategy',
    },
  },

  // --- ROUTES AUTHENTIFICATION --- 
  {
    method: 'POST',
    path: '/users',
    handler: addUserHandler,
  },

  {
    method: 'POST',
    path: '/login',
    handler: loginUserHandler,
  },

  // --- ROUTE WALLET ---
  {
    method: 'POST',
    path: '/wallets',
    handler: addWalletHandler,
    options: {
      auth: 'jwt_strategy',
    },
  },

  {
    method: 'GET',
    path: '/wallets',
    handler: getWalletsHandler, 
    options: {
      auth: 'jwt_strategy',
    },
  },

  {
    method: 'DELETE',
    path: '/wallets',
    handler: deleteWalletHandler,
    options: {
      auth: 'jwt_strategy',
    },
  },

  // --- ROUTES EXPENSE ---
  {
    method: 'POST',
    path: '/expenses',
    handler: addExpenseHandler,
    options: {
      auth: 'jwt_strategy',
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
    options: {
      auth: 'jwt_strategy',
    },
  },
  {
    method: 'GET',
    path: '/expenses/{id}',
    handler: getExpenseByIdHandler,
    options: {
      auth: 'jwt_strategy',
    },
  },
  {
    method: 'PUT',
    path: '/expenses/{id}',
    handler: editExpenseByIdHandler,
    options: {
      auth: 'jwt_strategy',
      validate: {
        payload: Joi.object({
          name: Joi.string().min(3).required(),
          amount: Joi.number().integer().min(1).required(),
          category: Joi.string().required(),
        }),
        failAction: (request, h, err) => {
          throw err;
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/expenses/{id}',
    handler: deleteExpenseByIdHandler,
    options: {
      auth: 'jwt_strategy',
    },
  },
];

module.exports = routes;
