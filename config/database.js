const mysql = require('mysql2/promise');
const path = require('path');

// Explicitly load .env from the app directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Log environment for debugging (remove in production if needed)
console.log('[DB] Config:', {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || '(not set)',
  database: process.env.DB_NAME || '(not set)',
  password: process.env.DB_PASSWORD ? '****' : '(not set)'
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// Verify connection on startup
pool.getConnection()
  .then(conn => {
    console.log('[DB] Connected successfully to:', process.env.DB_NAME);
    conn.release();
  })
  .catch(err => {
    console.error('[DB] Connection FAILED:', err.message);
  });

module.exports = pool;
