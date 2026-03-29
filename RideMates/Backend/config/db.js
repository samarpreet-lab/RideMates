const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // SRS NFR-SEC-05: Database connections SHALL use SSL/TLS encryption.
  // Use CA certificate for Aiven SSL requirement
  ssl: process.env.DB_SSL === 'false' ? false : {
    rejectUnauthorized: true,
    ca: [fs.readFileSync(path.join(__dirname, '../ca-certificate.pem'), 'utf8')]
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully via Node.js!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
  });

module.exports = pool;