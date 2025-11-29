const Hapi = require('@hapi/hapi');
const routes = require('./routes');

const init = async () => {
  const server = Hapi.server({ // nah baru si variable ini dijalankan ketika sudah start
    port: 9000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
  
  server.route(routes);

  await server.start(); // ini akan dijalankan dahulu
  console.log(`Server sedang berjalan pada ${server.info.uri}`);
};

init(); 