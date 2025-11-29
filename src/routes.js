const { addExpensesHandler } = require('./handler');

const routes = [
  {
    method: 'POST',
    path: '/expenses',
    handler: addExpensesHandler,
  },
  // {
  //   method: 'GET',
  //   path: '/expenses',
  // },
  // {
  //   method: 'GET',
  //   path: '/expenses/{id}',
  // },
  // {
  //   method: 'PUT',
  //   path: '/expenses/{id}',
  // },
  // {
  //   method: 'DELETE',
  //   path: '/expenses/{id}',
  // }
];

module.exports = routes;
