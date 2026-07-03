/* ============================================================
   routes/alertasRoutes.js — admin y cajero
   ============================================================ */
const express = require('express');
const AlertasController = require('../controllers/alertasController');
const { verificarToken } = require('../middlewares/auth');
const { adminOCajero } = require('../middlewares/roles');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', verificarToken, adminOCajero, asyncHandler(AlertasController.listar));

module.exports = router;
