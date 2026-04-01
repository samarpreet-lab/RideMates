const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// FIX: Enable SSL certificate verification in production
const sslConfig = process.env.NODE_ENV === 'production' 
  ? {
      rejectUnauthorized: true,
      ca: fs.existsSync(path.join(__dirname, '../ca-certificate.pem'))
        ? fs.readFileSync(path.join(__dirname, '../ca-certificate.pem'), 'utf8')
        : undefined,
    }
  : { rejectUnauthorized: false }; // Allow self-signed in development

// Aiven MySQL connection pool with SSL required
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: sslConfig,
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