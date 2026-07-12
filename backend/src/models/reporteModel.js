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
};

module.exports = ReporteModel;
