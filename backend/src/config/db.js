/* ============================================================
   config/db.js — Pool de conexiones MySQL (mysql2/promise)
   ============================================================ */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'la_esquina',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  decimalNumbers: true, // DECIMAL(10,2) -> Number en vez de string
});

// Verifica la conexión al iniciar (mensaje amigable si XAMPP/MySQL no está activo).
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ Conexión a la base de datos establecida.');
  } catch (err) {
    console.error('❌ No se pudo conectar a la base de datos.');
    console.error('   Verifica que MySQL (XAMPP) esté encendido y que el .env sea correcto.');
    console.error('   Detalle:', err.code || err.message);
  }
}

module.exports = { pool, testConnection };
