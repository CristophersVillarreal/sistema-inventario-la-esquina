/* ============================================================
   server.js — Punto de entrada. Levanta el servidor HTTP.
   ============================================================ */
const app = require('./app');
const { testConnection } = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log('============================================');
  console.log('  API "La Esquina" — Sistema de Inventario');
  console.log(`  Escuchando en: http://localhost:${PORT}`);
  console.log('============================================');
  await testConnection();
});
