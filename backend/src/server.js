const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const Jwt = require('@hapi/jwt');
require('dotenv').config();

const init = async () => {
  // --- DEBUGGING AREA (Cek apakah .env terbaca) ---
  console.log("------------------------------------------------");
  console.log("🔍 CEK VARIABEL ENVIRONMENT:");
  console.log("PORT Server yang mau dipakai:", process.env.PORT);
  console.log("TOKEN KEY status:", process.env.ACCESS_TOKEN_KEY ? "✅ TERBACA" : "❌ KOSONG (UNDEFINED)");
  console.log("------------------------------------------------");

  // Validasi Kunci Token sebelum server jalan
  // Kalau kunci gak ada, mending matiin server sekarang daripada error aneh nanti
  if (!process.env.ACCESS_TOKEN_KEY) {
      console.error("❌ FATAL ERROR: ACCESS_TOKEN_KEY tidak ditemukan di .env");
      console.error("Pastikan file .env ada dan berisi ACCESS_TOKEN_KEY");
      process.exit(1); 
  }

  const server = Hapi.server({ 
    port: (process.env.PORT == 5432) ? 9000 : (process.env.PORT || 9000),
    host: process.env.HOST || 'localhost' || '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // Definisikan Strategi Autentikasi (SOP Satpam)
  server.auth.strategy('jwt_strategy', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY, // Kunci rahasia 
    verify: {
      aud: false,
      iss: false,
      sub: false,
      nbf: true,
      exp: true,
      maxAgeSec: 14400,
    },
    validate: (artifacts, request, h) => {
      return {
        isValid: true,
        credentials: {
          id: artifacts.decoded.payload.id,
          username: artifacts.decoded.payload.username,
        },
      };
    },
  });
  
  
  server.route(routes);

  await server.start(); 
  console.log(`Server sedang berjalan pada ${server.info.uri}`);
  // Debugging: Pastikan Token Key terbaca
  console.log("Token Key loaded:", process.env.ACCESS_TOKEN_KEY ? "YES" : "NO");
  
};

init(); 