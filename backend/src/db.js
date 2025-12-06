require('dotenv').config();
const { Pool } = require('pg');

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: process.env.PGHOST !== 'localhost' ? {
    rejectUnauthorized: false
  } : false
});

pool.query('SELECT NOW ()', (err, res) => {
  if(err){
    console.error('GAGAL MASUK KE DATABASE: ', err.stack);
  } else {
    console.log('BERHASIL MASUK KE DATABASE POSTGRESQL!')
  }
});

module.exports = pool;