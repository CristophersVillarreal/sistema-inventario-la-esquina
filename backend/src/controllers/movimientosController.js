/* ============================================================
   controllers/movimientosController.js
   ============================================================ */
const MovimientoModel = require('../models/movimientoModel');
const { validators, recolectarErrores } = require('../utils/validators');

const METODOS_PAGO = ['efectivo', 'yape', 'tarjeta'];

const MovimientosController = {
  /* GET /api/movimientos — historial con filtros (admin) */
  async listar(req, res) {
    const { tipo, producto_id, usuario_id, desde, hasta, incluirAnulados } = req.query;
    const movimientos = await MovimientoModel.listar({
      tipo,
      producto_id,
      usuario_id,
      desde,
      hasta,
      incluirAnulados: incluirAnulados !== 'false',
    });
    return res.json({ movimientos });
  },

  /* POST /api/movimientos/entrada — registrar entrada (admin) */
  async entrada(req, res) {
    const { producto_id, cantidad, nota } = req.body;
    const errores = recolectarErrores({
      producto_id: () => validators.requerido(producto_id, 'El producto'),
      cantidad: () => validators.enteroPositivo(cantidad, 'La cantidad'),
    });
    if (Object.keys(errores).length) {
      return res.status(400).json({ mensaje: 'Revisa los datos del movimiento.', errores });
    }

    const resultado = await MovimientoModel.registrar({
      producto_id,
      tipo: 'entrada',
      cantidad: Number(cantidad),
      usuario_id: req.usuario.id,
      nota: nota || null,
    });

    if (!resultado.ok) {
      return res.status(resultado.status).json({ mensaje: resultado.mensaje });
    }
    return res.status(201).json({
      mensaje: 'Entrada registrada. Stock actualizado.',
      movimiento: resultado.movimiento,
    });
  },

  /* POST /api/movimientos/salida — registrar salida/venta (admin y cajero) */
  async salida(req, res) {
    const { producto_id, cantidad, metodo_pago, cliente, nota } = req.body;

    // metodo_pago es opcional: obligatorio en ventas (POS), no en ajustes de almacén.
    // Si viene, debe ser uno de los válidos.
    const metodo = metodo_pago ? String(metodo_pago).toLowerCase() : null;
    const errores = recolectarErrores({
      producto_id: () => validators.requerido(producto_id, 'El producto'),
      cantidad: () => validators.enteroPositivo(cantidad, 'La cantidad'),
      metodo_pago: () =>
        metodo && !METODOS_PAGO.includes(metodo)
          ? 'El método de pago debe ser efectivo, yape o tarjeta.'
          : '',
    });
    if (Object.keys(errores).length) {
      return res.status(400).json({ mensaje: 'Revisa los datos de la venta.', errores });
    }

    // El modelo valida el stock (pre-venta) dentro de la transacción.
    const resultado = await MovimientoModel.registrar({
      producto_id,
      tipo: 'salida',
      cantidad: Number(cantidad),
      usuario_id: req.usuario.id,
      metodo_pago: metodo,
      cliente: cliente || null,
      nota: nota || null,
    });

    if (!resultado.ok) {
      return res.status(resultado.status).json({ mensaje: resultado.mensaje });
    }
    return res.status(201).json({
      mensaje: 'Venta registrada. Stock actualizado.',
      movimiento: resultado.movimiento,
    });
  },

  /* PATCH /api/movimientos/:id/anular — anular y revertir stock (admin) */
  async anular(req, res) {
    const { id } = req.params;
    const resultado = await MovimientoModel.anular(id);
    if (!resultado.ok) {
      return res.status(resultado.status).json({ mensaje: resultado.mensaje });
    }
    return res.json({
      mensaje: 'Movimiento anulado. Stock revertido.',
      movimiento: resultado.movimiento,
    });
  },
};

module.exports = MovimientosController;
