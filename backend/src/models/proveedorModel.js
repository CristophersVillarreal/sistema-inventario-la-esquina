/* ============================================================
   models/proveedorModel.js — Consultas SQL de proveedores
   ============================================================ */
const { pool } = require('../config/db');

const ProveedorModel = {
  async listar({ soloActivos = false } = {}) {
    const where = soloActivos ? 'WHERE activo = TRUE' : '';
    const [rows] = await pool.query(
      `SELECT id, nombre, contacto, telefono, activo
         FROM proveedores ${where}
        ORDER BY nombre ASC`
    );
    return rows;
  },

  async buscarPorId(id) {
    const [rows] = await pool.query(
      'SELECT id, nombre, contacto, telefono, activo FROM proveedores WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async crear({ nombre, contacto = null, telefono = null, activo = true }) {
    const [result] = await pool.query(
      `INSERT INTO proveedores (nombre, contacto, telefono, activo)
       VALUES (?, ?, ?, ?)`,
      [nombre, contacto, telefono, activo ? 1 : 0]
    );
    return this.buscarPorId(result.insertId);
  },

  async actualizar(id, { nombre, contacto = null, telefono = null, activo = true }) {
    const [result] = await pool.query(
      `UPDATE proveedores
          SET nombre = ?, contacto = ?, telefono = ?, activo = ?
        WHERE id = ?`,
      [nombre, contacto, telefono, activo ? 1 : 0, id]
    );
    if (result.affectedRows === 0) return null;
    return this.buscarPorId(id);
  },

  /**
   * Eliminación FÍSICA del proveedor (DELETE).
   * La FK productos.proveedor_id es ON DELETE SET NULL: los productos
   * que lo tuvieran quedan sin proveedor (proveedor_id = NULL), no se borran.
   * @returns {boolean} true si se eliminó, false si no existía.
   */
  async eliminar(id) {
    const [result] = await pool.query('DELETE FROM proveedores WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = ProveedorModel;
