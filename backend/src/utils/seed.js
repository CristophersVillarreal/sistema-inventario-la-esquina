/* ============================================================
   utils/seed.js — Crea/actualiza el usuario administrador inicial.
   Uso:  npm run seed
   Requiere que la base de datos exista (importa database.sql primero).
   ============================================================ */
const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

const USUARIOS = [
  { nombre: 'Juan',  apellido: 'Quispe', correo: 'admin@laesquina.pe', celular: '987111222', password: 'Admin123!',  rol: 'administrador' },
  { nombre: 'María', apellido: 'Flores', correo: 'maria@laesquina.pe', celular: '987333444', password: 'Cajero123!', rol: 'cajero' },
];

async function main() {
  for (const u of USUARIOS) {
    const hash = await bcrypt.hash(u.password, 10);
    await pool.query(
      `INSERT INTO usuarios (nombre, apellido, correo, celular, password_hash, rol, activo)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), rol = VALUES(rol), activo = TRUE`,
      [u.nombre, u.apellido, u.correo, u.celular, hash, u.rol]
    );
    console.log(`✅ ${u.rol.padEnd(13)} → ${u.correo}  /  ${u.password}`);
  }
  console.log('   (cambia las contraseñas tras el primer inicio de sesión)');
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Error al crear los usuarios:', err.message);
  process.exit(1);
});
