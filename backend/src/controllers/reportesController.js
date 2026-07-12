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
};

module.exports = ReportesController;
