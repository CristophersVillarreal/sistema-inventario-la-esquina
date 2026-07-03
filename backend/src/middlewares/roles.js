/* ============================================================
   middlewares/roles.js — Control de acceso por rol
   Se usa SIEMPRE después de verificarToken.
   ============================================================ */

/**
 * Permite el acceso solo a los roles indicados.
 * Ej.: requiereRol('administrador')  |  requiereRol('administrador', 'cajero')
 */
function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ mensaje: 'No autorizado.' });
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: 'No tienes permiso para realizar esta acción.',
      });
    }
    next();
  };
}

// Atajos legibles
const soloAdmin = requiereRol('administrador');
const adminOCajero = requiereRol('administrador', 'cajero');

module.exports = { requiereRol, soloAdmin, adminOCajero };
