// require('dotenv').config();

const { Pool } = require('pg');

// Cek apakah Environment Variables terbaca. 
// Kalau log ini muncul "undefined" di Vercel, berarti kamu belum setting Env Vars di Dashboard Vercel.
console.log("Mencoba connect ke DB Host:", process.env.PGHOST);

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT || 5432,
  ssl: {
    rejectUnauthorized: false, // <--- INI WAJIB UNTUK SUPABASE DI VERCEL
  },
});

pool.query('SELECT NOW ()', (err, res) => {
  if(err){
    console.error('GAGAL MASUK KE DATABASE: ', err.stack);
  } else {
    console.log('BERHASIL MASUK KE DATABASE POSTGRESQL!')
  }
});

module.exports = pool;