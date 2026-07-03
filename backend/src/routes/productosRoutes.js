/* ============================================================
   routes/productosRoutes.js
   ============================================================ */
const express = require('express');
const ProductosController = require('../controllers/productosController');
const { verificarToken } = require('../middlewares/auth');
const { soloAdmin } = require('../middlewares/roles');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Todas requieren sesión iniciada.
router.use(verificarToken);

// Listar/buscar: admin (completo) y cajero (solo lectura del catálogo).
router.get('/', asyncHandler(ProductosController.listar));

// Gestión: solo administrador.
router.post('/', soloAdmin, asyncHandler(ProductosController.crear));
router.put('/:id', soloAdmin, asyncHandler(ProductosController.actualizar));
router.delete('/:id', soloAdmin, asyncHandler(ProductosController.eliminar));

module.exports = router;
