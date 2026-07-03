/* ============================================================
   models/productoModel.js — Consultas SQL de productos
   ============================================================ */
const { pool } = require('../config/db');

// Incluye el nombre del proveedor mediante JOIN para comodidad del frontend.
const SELECT_BASE = `
  SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock_actual, p.stock_minimo,
         p.fecha_caducidad, p.proveedor_id, pr.nombre AS proveedor_nombre,
         p.creado_en
    FROM productos p
    LEFT JOIN proveedores pr ON pr.id = p.proveedor_id
`;

const ProductoModel = {
  /**
   * Listado con búsqueda opcional por nombre/descripción.
   * @param {Object} opts { buscar }
   */
  async listar({ buscar = '' } = {}) {
    const condiciones = [];
    const params = [];

    if (buscar) {
      condiciones.push('(p.nombre LIKE ? OR p.descripcion LIKE ?)');
      params.push(`%${buscar}%`, `%${buscar}%`);
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `${SELECT_BASE} ${where} ORDER BY p.nombre ASC`,
      params
    );
    return rows;
  },

  async buscarPorId(id) {
    const [rows] = await pool.query(`${SELECT_BASE} WHERE p.id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async crear(datos) {
    const {
      nombre,
      descripcion = null,
      precio = 0,
      stock_actual = 0,
      stock_minimo = 0,
      fecha_caducidad = null,
      proveedor_id = null,
    } = datos;

    const [result] = await pool.query(
      `INSERT INTO productos
         (nombre, descripcion, precio, stock_actual, stock_minimo, fecha_caducidad, proveedor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, precio, stock_actual, stock_minimo, fecha_caducidad, proveedor_id]
    );
    return this.buscarPorId(result.insertId);
  },

  async actualizar(id, datos) {
    const {
      nombre,
      descripcion = null,
      precio = 0,
      stock_minimo = 0,
      fecha_caducidad = null,
      proveedor_id = null,
    } = datos;

    // Nota: stock_actual NO se edita aquí; cambia solo vía movimientos (sección 5.1).
    const [result] = await pool.query(
      `UPDATE productos
          SET nombre = ?, descripcion = ?, precio = ?, stock_minimo = ?,
              fecha_caducidad = ?, proveedor_id = ?
        WHERE id = ?`,
      [nombre, descripcion, precio, stock_minimo, fecha_caducidad, proveedor_id, id]
    );
    if (result.affectedRows === 0) return null;
    return this.buscarPorId(id);
  },

  /**
   * Eliminación FÍSICA del producto (DELETE).
   * Primero elimina sus movimientos asociados (la FK es RESTRICT), todo dentro
   * de una transacción para garantizar integridad. Si algo falla, rollback.
   * @returns {boolean} true si se eliminó, false si no existía.
   */
  async eliminar(id) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('DELETE FROM movimientos WHERE producto_id = ?', [id]);
      const [result] = await conn.query('DELETE FROM productos WHERE id = ?', [id]);
      await conn.commit();
      return result.affectedRows > 0;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /* ---------- Consultas para alertas ---------- */
  async stockBajo() {
    const [rows] = await pool.query(
      `${SELECT_BASE} WHERE p.stock_actual <= p.stock_minimo
        ORDER BY p.stock_actual ASC`
    );
    return rows;
  },

  async porVencer(dias = 30) {
    const [rows] = await pool.query(
      `${SELECT_BASE}
        WHERE p.fecha_caducidad IS NOT NULL
          AND p.fecha_caducidad >= CURDATE()
          AND p.fecha_caducidad <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
        ORDER BY p.fecha_caducidad ASC`,
      [dias]
    );
    return rows;
  },
};

module.exports = ProductoModel;
