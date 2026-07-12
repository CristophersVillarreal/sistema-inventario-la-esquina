/* ============================================================
   routes/reportesRoutes.js — todas solo administrador
   ============================================================ */
const express = require('express');
const ReportesController = require('../controllers/reportesController');
const { verificarToken } = require('../middlewares/auth');
const { soloAdmin } = require('../middlewares/roles');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(verificarToken, soloAdmin);

router.get('/inventario', asyncHandler(ReportesController.inventario));

module.exports = router;
