/* ============================================================
   controllers/reportesController.js — Reportes de inventario (admin)
   ============================================================ */
const ReporteModel = require('../models/reporteModel');

const ReportesController = {
  /* GET /api/reportes/inventario */
  async inventario(req, res) {
    const data = await ReporteModel.inventario();
    return res.json(data);
  },

  /* GET /api/reportes/ventas-por-metodo?desde=&hasta= */
  async ventasPorMetodo(req, res) {
    const { desde, hasta } = req.query;
    const metodos = await ReporteModel.ventasPorMetodo({ desde, hasta });
    return res.json({ metodos });
  },

  /* GET /api/reportes/stock-bajo */
  async stockBajo(req, res) {
    const productos = await ReporteModel.stockBajo();
    return res.json({ productos });
  },

  /* GET /api/reportes/vencimientos?dias=30 */
  async vencimientos(req, res) {
    const dias = Number(req.query.dias) || 30;
    const productos = await ReporteModel.vencimientos(dias);
    return res.json({ umbral_dias: dias, productos });
  },

  /* GET /api/reportes/entradas-salidas?desde=&hasta= */
  async entradasSalidas(req, res) {
    const { desde, hasta } = req.query;
    const data = await ReporteModel.entradasSalidas({ desde, hasta });
    return res.json(data);
  },
};

module.exports = ReportesController;
