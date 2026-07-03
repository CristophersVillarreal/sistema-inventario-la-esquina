/* ============================================================
   routes/authRoutes.js
   ============================================================ */
const express = require('express');
const AuthController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/registro', asyncHandler(AuthController.registro)); // público
router.post('/login', asyncHandler(AuthController.login));        // público
router.get('/perfil', verificarToken, asyncHandler(AuthController.perfil)); // autenticado

module.exports = router;
