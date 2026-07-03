/* ============================================================
   utils/asyncHandler.js — Envuelve controladores async para
   capturar errores y pasarlos al manejador central de Express.
   ============================================================ */
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
