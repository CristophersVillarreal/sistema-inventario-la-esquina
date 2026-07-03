/* ============================================================
   controllers/usuariosController.js — Gestión de usuarios (admin)
   ============================================================ */
const UsuarioModel = require('../models/usuarioModel');

const ROLES_VALIDOS = ['administrador', 'cajero'];

const UsuariosController = {
  /* GET /api/usuarios — listar (admin) */
  async listar(req, res) {
    const usuarios = await UsuarioModel.listar();
    return res.json({ usuarios });
  },

  /* PUT /api/usuarios/:id/rol — cambiar rol (admin) */
  async cambiarRol(req, res) {
    const { id } = req.params;
    const { rol } = req.body;

    if (!ROLES_VALIDOS.includes(rol)) {
      return res
        .status(400)
        .json({ mensaje: 'El rol debe ser "administrador" o "cajero".' });
    }

    // Evita que un admin se quite a sí mismo el último acceso por error.
    if (Number(id) === req.usuario.id && rol !== 'administrador') {
      return res
        .status(409)
        .json({ mensaje: 'No puedes quitarte a ti mismo el rol de administrador.' });
    }

    const usuario = await UsuarioModel.cambiarRol(id, rol);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    return res.json({ mensaje: 'Rol actualizado.', usuario });
  },

  /* PUT /api/usuarios/:id/estado — activar/desactivar (admin) */
  async cambiarEstado(req, res) {
    const { id } = req.params;
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      return res.status(400).json({ mensaje: 'El campo "activo" debe ser true o false.' });
    }
    if (Number(id) === req.usuario.id && activo === false) {
      return res.status(409).json({ mensaje: 'No puedes desactivar tu propia cuenta.' });
    }

    const usuario = await UsuarioModel.cambiarActivo(id, activo);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    return res.json({
      mensaje: activo ? 'Usuario activado.' : 'Usuario desactivado.',
      usuario,
    });
  },
};

module.exports = UsuariosController;
