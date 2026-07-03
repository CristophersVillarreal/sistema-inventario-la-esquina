/* ============================================================
   models/movimientoModel.js — Movimientos de almacén
   Reglas de negocio (sección 5):
     5.1 Actualización automática de stock (misma transacción)
     5.2 Validación pre-venta (stock suficiente)
     5.3 Transacciones con rollback
     5.4 Anular revierte el efecto en stock (no se borra)
   ============================================================ */
const { pool } = require('../config/db');

const SELECT_BASE = `
  SELECT m.id, m.producto_id, p.nombre AS producto_nombre,
         m.tipo, m.cantidad, m.usuario_id,
         CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre,
         m.fecha, m.anulado, m.metodo_pago, m.cliente, m.nota
    FROM movimientos m
    JOIN productos p ON p.id = m.producto_id
    JOIN usuarios  u ON u.id = m.usuario_id
`;

const MovimientoModel = {
  /**
   * Historial con filtros opcionales.
   * @param {Object} opts { tipo, producto_id, usuario_id, desde, hasta, incluirAnulados }
   */
  async listar({
    tipo = '',
    producto_id = '',
    usuario_id = '',
    desde = '',
    hasta = '',
    incluirAnulados = true,
  } = {}) {
    const cond = [];
    const params = [];

    if (tipo) {
      cond.push('m.tipo = ?');
      params.push(tipo);
    }
    if (producto_id) {
      cond.push('m.producto_id = ?');
      params.push(producto_id);
    }
    if (usuario_id) {
      cond.push('m.usuario_id = ?');
      params.push(usuario_id);
    }
    if (desde) {
      cond.push('m.fecha >= ?');
      params.push(desde);
    }
    if (hasta) {
      cond.push('m.fecha <= ?');
      params.push(hasta);
    }
    if (!incluirAnulados) {
      cond.push('m.anulado = FALSE');
    }

    const where = cond.length ? `WHERE ${cond.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `${SELECT_BASE} ${where} ORDER BY m.fecha DESC, m.id DESC`,
      params
    );
    return rows;
  },

  async buscarPorId(id) {
    const [rows] = await pool.query(`${SELECT_BASE} WHERE m.id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  /**
   * Registra un movimiento (entrada o salida) y actualiza el stock
   * dentro de una transacción. Si algo falla, hace rollback.
   *
   * @returns {Object} { ok, status, mensaje?, movimiento? }
   */
  async registrar({ producto_id, tipo, cantidad, usuario_id, metodo_pago = null, cliente = null, nota = null }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Bloquea la fila del producto para evitar condiciones de carrera.
      const [prodRows] = await conn.query(
        'SELECT id, stock_actual FROM productos WHERE id = ? FOR UPDATE',
        [producto_id]
      );
      const producto = prodRows[0];

      if (!producto) {
        await conn.rollback();
        return { ok: false, status: 404, mensaje: 'El producto indicado no existe.' };
      }

      // 5.2 Validación pre-venta: stock suficiente para salidas.
      if (tipo === 'salida' && producto.stock_actual < cantidad) {
        await conn.rollback();
        return {
          ok: false,
          status: 409,
          mensaje: `Stock insuficiente. Disponible: ${producto.stock_actual}, solicitado: ${cantidad}.`,
        };
      }

      // Inserta el movimiento (auditoría: usuario_id + fecha).
      const [ins] = await conn.query(
        `INSERT INTO movimientos
           (producto_id, tipo, cantidad, usuario_id, metodo_pago, cliente, nota)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [producto_id, tipo, cantidad, usuario_id, metodo_pago, cliente, nota]
      );

      // 5.1 Actualiza el stock en la misma transacción.
      const signo = tipo === 'entrada' ? '+' : '-';
      await conn.query(
        `UPDATE productos SET stock_actual = stock_actual ${signo} ? WHERE id = ?`,
        [cantidad, producto_id]
      );

      await conn.commit();

      const movimiento = await this.buscarPorId(ins.insertId);
      return { ok: true, status: 201, movimiento };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Anula un movimiento: revierte su efecto en el stock y marca anulado = TRUE.
   * No elimina el registro (preserva la auditoría). Todo en una transacción.
   *
   * @returns {Object} { ok, status, mensaje?, movimiento? }
   */
  async anular(id) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [movRows] = await conn.query(
        'SELECT * FROM movimientos WHERE id = ? FOR UPDATE',
        [id]
      );
      const mov = movRows[0];

      if (!mov) {
        await conn.rollback();
        return { ok: false, status: 404, mensaje: 'El movimiento no existe.' };
      }
      if (mov.anulado) {
        await conn.rollback();
        return { ok: false, status: 409, mensaje: 'Este movimiento ya fue anulado.' };
      }

      // Efecto inverso: una entrada anulada resta stock; una salida anulada lo devuelve.
      const [prodRows] = await conn.query(
        'SELECT stock_actual FROM productos WHERE id = ? FOR UPDATE',
        [mov.producto_id]
      );
      const stockActual = prodRows[0] ? prodRows[0].stock_actual : 0;

      if (mov.tipo === 'entrada' && stockActual < mov.cantidad) {
        await conn.rollback();
        return {
          ok: false,
          status: 409,
          mensaje:
            'No se puede anular: el stock actual es menor que la cantidad de la entrada (ya se consumió).',
        };
      }

      const signo = mov.tipo === 'entrada' ? '-' : '+';
      await conn.query(
        `UPDATE productos SET stock_actual = stock_actual ${signo} ? WHERE id = ?`,
        [mov.cantidad, mov.producto_id]
      );
      await conn.query('UPDATE movimientos SET anulado = TRUE WHERE id = ?', [id]);

      await conn.commit();

      const movimiento = await this.buscarPorId(id);
      return { ok: true, status: 200, movimiento };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = MovimientoModel;
