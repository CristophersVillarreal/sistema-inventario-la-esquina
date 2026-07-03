/* ============================================================
   routes/movimientosRoutes.js
   ============================================================ */
const express = require('express');
const MovimientosController = require('../controllers/movimientosController');
const { verificarToken } = require('../middlewares/auth');
const { soloAdmin, adminOCajero } = require('../middlewares/roles');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(verificarToken);

// Historial: solo administrador.
router.get('/', soloAdmin, asyncHandler(MovimientosController.listar));

// Entrada: solo administrador.
router.post('/entrada', soloAdmin, asyncHandler(MovimientosController.entrada));

// Salida/venta: administrador y cajero.
router.post('/salida', adminOCajero, asyncHandler(MovimientosController.salida));

// Anular: solo administrador.
router.patch('/:id/anular', soloAdmin, asyncHandler(MovimientosController.anular));

module.exports = router;
