/* ============================================================
   routes/usuariosRoutes.js — todas solo administrador
   ============================================================ */
const express = require('express');
const UsuariosController = require('../controllers/usuariosController');
const { verificarToken } = require('../middlewares/auth');
const { soloAdmin } = require('../middlewares/roles');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(verificarToken, soloAdmin);

router.get('/', asyncHandler(UsuariosController.listar));
router.put('/:id/rol', asyncHandler(UsuariosController.cambiarRol));
router.put('/:id/estado', asyncHandler(UsuariosController.cambiarEstado));

module.exports = router;
