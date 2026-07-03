/* ============================================================
   controllers/alertasController.js — Stock mínimo y caducidad próxima
   ============================================================ */
const ProductoModel = require('../models/productoModel');

const UMBRAL_DIAS_CADUCIDAD = 30; // sección 5.6

const AlertasController = {
  /* GET /api/alertas — (admin y cajero) */
  async listar(req, res) {
    const dias = Number(req.query.dias) || UMBRAL_DIAS_CADUCIDAD;

    const [stockBajo, porVencer] = await Promise.all([
      ProductoModel.stockBajo(),
      ProductoModel.porVencer(dias),
    ]);

    return res.json({
      umbral_dias: dias,
      stock_minimo: stockBajo,
      caducidad_proxima: porVencer,
      total: stockBajo.length + porVencer.length,
    });
  },
};

module.exports = AlertasController;
