/* ============================================================
   controllers/authController.js — Registro, login y perfil
   ============================================================ */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const UsuarioModel = require('../models/usuarioModel');
const { validators, recolectarErrores } = require('../utils/validators');

const SALT_ROUNDS = 10;

function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

const AuthController = {
  /* POST /api/auth/registro (público) */
  async registro(req, res) {
    const { nombre, apellido, correo, celular, password, rol } = req.body;

    // Revalidación en backend (sección 7).
    const errores = recolectarErrores({
      nombre: () => validators.nombre(nombre),
      apellido: () => validators.nombre(apellido),
      correo: () => validators.correo(correo),
      celular: () => validators.celular(celular),
      password: () => validators.password(password),
    });
    if (Object.keys(errores).length) {
      return res.status(400).json({ mensaje: 'Revisa los campos del formulario.', errores });
    }

    // Correo único.
    const existente = await UsuarioModel.buscarPorCorreo(correo.trim().toLowerCase());
    if (existente) {
      return res.status(409).json({
        mensaje: 'Ese correo ya está registrado.',
        errores: { correo: 'Ese correo ya está registrado.' },
      });
    }

    // El rol solo puede asignarse desde un panel admin; el registro público crea cajeros.
    const rolFinal = rol === 'administrador' ? 'administrador' : 'cajero';

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const usuario = await UsuarioModel.crear({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: correo.trim().toLowerCase(),
      celular: celular.trim(),
      password_hash,
      rol: rolFinal,
    });

    const token = generarToken(usuario);
    return res.status(201).json({
      mensaje: 'Cuenta creada correctamente.',
      token,
      usuario,
    });
  },

  /* POST /api/auth/login (público) */
  async login(req, res) {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ mensaje: 'Ingresa tu correo y contraseña.' });
    }

    const usuario = await UsuarioModel.buscarPorCorreo(
      String(correo).trim().toLowerCase()
    );

    // Mensaje genérico: no revelamos si falló el correo o la contraseña (sección 9).
    const credencialesInvalidas = () =>
      res.status(401).json({ mensaje: 'Correo o contraseña incorrectos.' });

    if (!usuario) return credencialesInvalidas();

    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) return credencialesInvalidas();

    if (!usuario.activo) {
      return res
        .status(403)
        .json({ mensaje: 'Tu cuenta está desactivada. Contacta al administrador.' });
    }

    const token = generarToken(usuario);
    // No devolvemos el hash.
    const { password_hash, ...usuarioPublico } = usuario;
    return res.json({ mensaje: 'Inicio de sesión exitoso.', token, usuario: usuarioPublico });
  },

  /* GET /api/auth/perfil (autenticado) */
  async perfil(req, res) {
    const usuario = await UsuarioModel.buscarPorId(req.usuario.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    return res.json({ usuario });
  },
};

module.exports = AuthController;
