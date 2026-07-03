/* ============================================================
   app.js — Configuración de Express (middlewares, rutas, errores)
   ============================================================ */
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productosRoutes = require('./routes/productosRoutes');
const movimientosRoutes = require('./routes/movimientosRoutes');
const proveedoresRoutes = require('./routes/proveedoresRoutes');
const alertasRoutes = require('./routes/alertasRoutes');
const reportesRoutes = require('./routes/reportesRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');

const app = express();

/* ---------- CORS ----------
   Por defecto (CORS_ORIGIN=* o sin definir) se refleja cualquier origen:
   cómodo en desarrollo local. En producción, define CORS_ORIGIN con la
   lista de orígenes permitidos (separados por comas) para restringirlo. */
const corsConfig = (process.env.CORS_ORIGIN || '*').trim();
if (corsConfig === '*' || corsConfig === '') {
  app.use(cors()); // refleja el origen de la petición (sin cookies)
} else {
  const allowedOrigins = corsConfig.split(',').map((o) => o.trim()).filter(Boolean);
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Origen no permitido por CORS'));
      },
    })
  );
}

/* ---------- Parseo de JSON ---------- */
app.use(express.json());

/* ---------- Frontend (React) servido como estáticos ----------
   Se sirve el frontend en http://localhost:PORT/app  → mismo origen que la API,
   así Babel puede cargar los .jsx por HTTP y no hay problemas de CORS. */
app.use('/app', express.static(path.join(__dirname, '..', '..', 'frontend')));
app.get('/', (req, res) => res.redirect('/app/'));

/* ---------- Ruta de salud ---------- */
app.get('/api/health', (req, res) => {
  res.json({ ok: true, servicio: 'La Esquina API', hora: new Date().toISOString() });
});

/* ---------- Rutas de la API ---------- */
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/usuarios', usuariosRoutes);

/* ---------- 404 ---------- */
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Recurso no encontrado.' });
});

/* ---------- Manejador de errores centralizado ---------- */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ mensaje: 'Origen no permitido por CORS.' });
  }
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido.' });
  }
  console.error('Error no controlado:', err);
  res.status(500).json({ mensaje: 'Ocurrió un error inesperado en el servidor.' });
});

module.exports = app;
