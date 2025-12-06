require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT || 5432,
  ssl: {
    rejectUnauthorized: false, 
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