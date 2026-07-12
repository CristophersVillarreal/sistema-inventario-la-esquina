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
};

module.exports = ReportesController;
