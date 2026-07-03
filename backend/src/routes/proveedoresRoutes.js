/* ============================================================
   routes/proveedoresRoutes.js — todas solo administrador
   ============================================================ */
const express = require('express');
const ProveedoresController = require('../controllers/proveedoresController');
const { verificarToken } = require('../middlewares/auth');
const { soloAdmin } = require('../middlewares/roles');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(verificarToken, soloAdmin);

router.get('/', asyncHandler(ProveedoresController.listar));
router.post('/', asyncHandler(ProveedoresController.crear));
router.put('/:id', asyncHandler(ProveedoresController.actualizar));
router.delete('/:id', asyncHandler(ProveedoresController.eliminar));

module.exports = router;
