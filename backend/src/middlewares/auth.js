/* ============================================================
   middlewares/auth.js — Verificación de JWT
   Adjunta req.usuario = { id, rol } si el token es válido.
   ============================================================ */
const jwt = require('jsonwebtoken');
require('dotenv').config();

function verificarToken(req, res, next) {
  const header = req.headers.authorization || '';
  const [esquema, token] = header.split(' ');

  if (esquema !== 'Bearer' || !token) {
    return res
      .status(401)
      .json({ mensaje: 'No autorizado. Falta el token de acceso.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: payload.id, rol: payload.rol };
    next();
  } catch (err) {
    const expirado = err.name === 'TokenExpiredError';
    return res.status(401).json({
      mensaje: expirado
        ? 'Tu sesión expiró. Inicia sesión nuevamente.'
        : 'Token inválido.',
    });
  }
}

module.exports = { verificarToken };
