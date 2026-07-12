/* ============================================================
   models/reporteModel.js — Consultas agregadas para reportes
   ============================================================ */
const { pool } = require('../config/db');

const ReporteModel = {
  // Valorización del inventario (stock * precio) por producto.
  async inventario() {
    const [rows] = await pool.query(
      `SELECT p.id, p.nombre, p.stock_actual, p.precio,
              ROUND(p.stock_actual * p.precio, 2) AS valor_total
         FROM productos p
        ORDER BY valor_total DESC`
    );
    const [tot] = await pool.query(
      `SELECT ROUND(SUM(stock_actual * precio), 2) AS valor_inventario,
              SUM(stock_actual) AS unidades_totales,
              COUNT(*) AS productos
         FROM productos`
    );
    return { resumen: tot[0], detalle: rows };
  },

  // Ventas por método de pago (para el donut del frontend).
  async ventasPorMetodo({ desde = null, hasta = null } = {}) {
    const cond = ["m.tipo = 'salida'", 'm.anulado = FALSE', 'm.metodo_pago IS NOT NULL'];
    const params = [];
    if (desde) { cond.push('m.fecha >= ?'); params.push(desde); }
    if (hasta) { cond.push('m.fecha <= ?'); params.push(hasta); }

    const [rows] = await pool.query(
      `SELECT m.metodo_pago,
              COUNT(*) AS operaciones,
              ROUND(SUM(m.cantidad * p.precio), 2) AS total
         FROM movimientos m
         JOIN productos p ON p.id = m.producto_id
        WHERE ${cond.join(' AND ')}
        GROUP BY m.metodo_pago`,
      params
    );
    return rows;
  },

  // Productos con stock por debajo (o igual) del mínimo.
  async stockBajo() {
    const [rows] = await pool.query(
      `SELECT id, nombre, stock_actual, stock_minimo
         FROM productos
        WHERE stock_actual <= stock_minimo
        ORDER BY stock_actual ASC`
    );
    return rows;
  },
};

module.exports = ReporteModel;
