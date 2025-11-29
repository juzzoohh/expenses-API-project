const {
  addExpensesHandler,
  getAllExpensesHandler,
  getExpenseByIdHandler,
  editExpenseByIdHandler,
} = require('./handler');

const routes = [
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
  // {
  //   method: 'DELETE',
  //   path: '/expenses/{id}',
  // }
];

module.exports = routes;
