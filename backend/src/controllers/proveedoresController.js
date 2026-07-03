/* ============================================================
   controllers/proveedoresController.js
   ============================================================ */
const ProveedorModel = require('../models/proveedorModel');
const { validators, recolectarErrores } = require('../utils/validators');

function validarProveedor(body) {
  return recolectarErrores({
    nombre: () => validators.requerido(body.nombre, 'El nombre'),
  });
}

const ProveedoresController = {
  /* GET /api/proveedores — listar (admin) */
  async listar(req, res) {
    const soloActivos = String(req.query.activos) === 'true';
    const proveedores = await ProveedorModel.listar({ soloActivos });
    return res.json({ proveedores });
  },

  /* POST /api/proveedores — crear (admin) */
  async crear(req, res) {
    const errores = validarProveedor(req.body);
    if (Object.keys(errores).length) {
      return res.status(400).json({ mensaje: 'Revisa los datos del proveedor.', errores });
    }
    const proveedor = await ProveedorModel.crear(req.body);
    return res.status(201).json({ mensaje: 'Proveedor creado.', proveedor });
  },

  /* PUT /api/proveedores/:id — editar (admin) */
  async actualizar(req, res) {
    const { id } = req.params;
    const existente = await ProveedorModel.buscarPorId(id);
    if (!existente) return res.status(404).json({ mensaje: 'Proveedor no encontrado.' });

    const errores = validarProveedor(req.body);
    if (Object.keys(errores).length) {
      return res.status(400).json({ mensaje: 'Revisa los datos del proveedor.', errores });
    }
    const proveedor = await ProveedorModel.actualizar(id, req.body);
    return res.json({ mensaje: 'Proveedor actualizado.', proveedor });
  },

  /* DELETE /api/proveedores/:id — eliminación física (admin) */
  async eliminar(req, res) {
    const { id } = req.params;
    const existente = await ProveedorModel.buscarPorId(id);
    if (!existente) return res.status(404).json({ mensaje: 'Proveedor no encontrado.' });

    const eliminado = await ProveedorModel.eliminar(id);
    if (!eliminado) return res.status(404).json({ mensaje: 'Proveedor no encontrado.' });
    return res.json({ mensaje: 'Proveedor eliminado correctamente.' });
  },
};

module.exports = ProveedoresController;
