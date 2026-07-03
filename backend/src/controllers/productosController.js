/* ============================================================
   controllers/productosController.js
   ============================================================ */
const ProductoModel = require('../models/productoModel');
const ProveedorModel = require('../models/proveedorModel');
const { validators, recolectarErrores } = require('../utils/validators');

async function validarPayloadProducto(body) {
  const { nombre, precio, stock_minimo, proveedor_id } = body;
  const errores = recolectarErrores({
    nombre: () => validators.requerido(nombre, 'El nombre'),
    precio: () => validators.positivo(precio, 'El precio'),
    stock_minimo: () => validators.noNegativo(stock_minimo, 'El stock mínimo'),
  });

  // Si se indica proveedor, debe existir.
  if (proveedor_id !== undefined && proveedor_id !== null && proveedor_id !== '') {
    const prov = await ProveedorModel.buscarPorId(proveedor_id);
    if (!prov) errores.proveedor_id = 'El proveedor seleccionado no existe.';
  }
  return errores;
}

const ProductosController = {
  /* GET /api/productos — listar / buscar */
  async listar(req, res) {
    const { buscar = '' } = req.query;
    const productos = await ProductoModel.listar({ buscar });
    return res.json({ productos });
  },

  /* POST /api/productos — crear (admin) */
  async crear(req, res) {
    const errores = await validarPayloadProducto(req.body);
    if (Object.keys(errores).length) {
      return res.status(400).json({ mensaje: 'Revisa los datos del producto.', errores });
    }
    const producto = await ProductoModel.crear({
      ...req.body,
      stock_actual: req.body.stock_actual ?? 0,
    });
    return res.status(201).json({ mensaje: 'Producto creado.', producto });
  },

  /* PUT /api/productos/:id — editar (admin) */
  async actualizar(req, res) {
    const { id } = req.params;
    const existente = await ProductoModel.buscarPorId(id);
    if (!existente) return res.status(404).json({ mensaje: 'Producto no encontrado.' });

    const errores = await validarPayloadProducto(req.body);
    if (Object.keys(errores).length) {
      return res.status(400).json({ mensaje: 'Revisa los datos del producto.', errores });
    }
    const producto = await ProductoModel.actualizar(id, req.body);
    return res.json({ mensaje: 'Producto actualizado.', producto });
  },

  /* DELETE /api/productos/:id — eliminación física (admin) */
  async eliminar(req, res) {
    const { id } = req.params;
    const existente = await ProductoModel.buscarPorId(id);
    if (!existente) return res.status(404).json({ mensaje: 'Producto no encontrado.' });

    const eliminado = await ProductoModel.eliminar(id);
    if (!eliminado) return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    return res.json({ mensaje: 'Producto eliminado correctamente.' });
  },
};

module.exports = ProductosController;
