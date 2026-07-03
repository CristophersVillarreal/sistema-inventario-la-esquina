/* ============================================================
   models/usuarioModel.js — Consultas SQL de usuarios
   Todas las consultas son parametrizadas (previene inyección SQL).
   ============================================================ */
const { pool } = require('../config/db');

// Campos públicos (nunca exponemos password_hash).
const CAMPOS_PUBLICOS =
  'id, nombre, apellido, correo, celular, rol, activo, creado_en';

const UsuarioModel = {
  async buscarPorCorreo(correo) {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE correo = ? LIMIT 1',
      [correo]
    );
    return rows[0] || null;
  },

  async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async crear({ nombre, apellido, correo, celular, password_hash, rol }) {
    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, correo, celular, password_hash, rol)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, correo, celular, password_hash, rol]
    );
    return this.buscarPorId(result.insertId);
  },

  async listar() {
    const [rows] = await pool.query(
      `SELECT ${CAMPOS_PUBLICOS} FROM usuarios ORDER BY creado_en DESC`
    );
    return rows;
  },

  async cambiarRol(id, rol) {
    const [result] = await pool.query(
      'UPDATE usuarios SET rol = ? WHERE id = ?',
      [rol, id]
    );
    if (result.affectedRows === 0) return null;
    return this.buscarPorId(id);
  },

  async cambiarActivo(id, activo) {
    const [result] = await pool.query(
      'UPDATE usuarios SET activo = ? WHERE id = ?',
      [activo ? 1 : 0, id]
    );
    if (result.affectedRows === 0) return null;
    return this.buscarPorId(id);
  },
};

module.exports = UsuarioModel;
