/* ============================================================
   api.jsx — Capa de conexión con el backend (Node/Express + MySQL)
   ------------------------------------------------------------
   - Cliente fetch con token JWT (guardado en localStorage).
   - Mapeadores entre la forma del backend (nombre, precio, stock_actual…)
     y la forma que usan las pantallas (name, price, stock…).
   - El frontend conserva IDs "bonitos" (COD-001) para mostrar, y lleva
     además el id numérico real de la BD en `dbId` para las llamadas a la API.
   ============================================================ */

// Mismo origen que sirve este HTML (http://localhost:4000) → /api
const API_BASE = '/api';
const TOKEN_KEY = 'le_token';

const getToken = () => localStorage.getItem(TOKEN_KEY) || '';
const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

const pad = (n, w = 3) => String(n).padStart(w, '0');
const codeToId = (code) => {
  if (code === null || code === undefined || code === '') return null;
  const n = parseInt(String(code).split('-')[1], 10);
  return isNaN(n) ? null : n;
};

/**
 * Llama a la API. Lanza un Error con { status, mensaje, errores } si falla.
 */
async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && getToken()) headers.Authorization = 'Bearer ' + getToken();

  let res;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    const err = new Error('No se pudo conectar con el servidor. ¿Está encendido el backend?');
    err.status = 0;
    throw err;
  }

  let data = {};
  try { data = await res.json(); } catch (_) { /* respuesta sin cuerpo */ }

  if (!res.ok) {
    const err = new Error(data.mensaje || 'Ocurrió un error.');
    err.status = res.status;
    err.errores = data.errores || null;
    throw err;
  }
  return data;
}

/* ---------- Mapeadores backend → frontend ---------- */
const mapProducto = (b) => ({
  dbId: b.id,
  id: 'COD-' + pad(b.id),
  name: b.nombre,
  cat: b.descripcion || 'Abarrotes',
  price: Number(b.precio),
  stock: b.stock_actual,
  min: b.stock_minimo,
  expiry: b.fecha_caducidad ? String(b.fecha_caducidad).slice(0, 10) : '',
  supplier: b.proveedor_id ? 'PROV-' + pad(b.proveedor_id) : '',
  supplierName: b.proveedor_nombre || '',
});

const mapProveedor = (b) => ({
  dbId: b.id,
  id: 'PROV-' + pad(b.id),
  name: b.nombre,
  ruc: '',                       // la spec simplificó proveedores (sin RUC/correo/dirección)
  phone: b.telefono || '',
  email: '',
  contact: b.contacto || '',
  address: '',
  status: b.activo ? 'Activo' : 'Inactivo',
});

const mapUsuario = (b) => ({
  dbId: b.id,
  id: 'U-' + pad(b.id),
  nombre: b.nombre,
  apellido: b.apellido,
  email: b.correo,
  phone: b.celular,
  role: b.rol === 'administrador' ? 'admin' : 'cajero',
  status: b.activo ? 'Activo' : 'Inactivo',
  created: b.creado_en ? String(b.creado_en).slice(0, 10) : '',
});

const mapMovimiento = (b) => ({
  dbId: b.id,
  id: 'M-' + pad(b.id),
  type: b.tipo,
  code: 'COD-' + pad(b.producto_id),
  name: b.producto_nombre,
  qty: b.cantidad,
  user: b.usuario_nombre,
  date: String(b.fecha).replace('T', ' ').slice(0, 16),
  supplier: null,
  note: b.nota || '',
  anulado: !!b.anulado,
  method: b.metodo_pago,
});

/* ---------- API pública ---------- */
const API = {
  getToken,
  setToken,
  logout: () => setToken(null),

  /* Auth */
  async login(correo, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      auth: false,
      body: { correo, password },
    });
    setToken(data.token);
    return mapUsuario(data.usuario);
  },

  async registro(f) {
    const data = await apiFetch('/auth/registro', {
      method: 'POST',
      auth: false,
      body: {
        nombre: f.nombre,
        apellido: f.apellido,
        correo: f.email,
        celular: f.phone,
        password: f.password,
        rol: f.role === 'admin' ? 'administrador' : 'cajero',
      },
    });
    return data;
  },

  async perfil() {
    const data = await apiFetch('/auth/perfil');
    return mapUsuario(data.usuario);
  },

  /* Cargadores */
  async getProductos() {
    const { productos } = await apiFetch('/productos');
    return productos.map(mapProducto);
  },
  async getProveedores() {
    const { proveedores } = await apiFetch('/proveedores');
    return proveedores.map(mapProveedor);
  },
  async getUsuarios() {
    const { usuarios } = await apiFetch('/usuarios');
    return usuarios.map(mapUsuario);
  },
  async getMovimientos() {
    const { movimientos } = await apiFetch('/movimientos');
    return movimientos.map(mapMovimiento);
  },

  /* Productos */
  productoBody(f) {
    return {
      nombre: f.name,
      descripcion: f.cat,
      precio: Number(f.price),
      stock_actual: Number(f.stock) || 0,
      stock_minimo: Number(f.min) || 0,
      fecha_caducidad: f.expiry || null,
      proveedor_id: codeToId(f.supplier),
    };
  },
  async crearProducto(f) {
    return apiFetch('/productos', { method: 'POST', body: this.productoBody(f) });
  },
  async editarProducto(dbId, f) {
    return apiFetch('/productos/' + dbId, { method: 'PUT', body: this.productoBody(f) });
  },
  async eliminarProducto(dbId) {
    return apiFetch('/productos/' + dbId, { method: 'DELETE' });
  },

  /* Movimientos */
  async entrada({ code, qty, note }) {
    return apiFetch('/movimientos/entrada', {
      method: 'POST',
      body: { producto_id: codeToId(code), cantidad: Number(qty), nota: note || null },
    });
  },
  async salida({ code, qty, method, client, note }) {
    return apiFetch('/movimientos/salida', {
      method: 'POST',
      body: {
        producto_id: codeToId(code),
        cantidad: Number(qty),
        metodo_pago: method ? String(method).toLowerCase() : null,
        cliente: client || null,
        nota: note || null,
      },
    });
  },

  /* Proveedores */
  proveedorBody(f) {
    return {
      nombre: f.name,
      contacto: f.contact || null,
      telefono: f.phone || null,
      activo: f.status !== 'Inactivo',
    };
  },
  async crearProveedor(f) {
    return apiFetch('/proveedores', { method: 'POST', body: this.proveedorBody(f) });
  },
  async editarProveedor(dbId, f) {
    return apiFetch('/proveedores/' + dbId, { method: 'PUT', body: this.proveedorBody(f) });
  },
  async eliminarProveedor(dbId) {
    return apiFetch('/proveedores/' + dbId, { method: 'DELETE' });
  },

  /* Usuarios */
  async crearUsuario(f) {
    return this.registro(f); // el registro acepta rol y crea el usuario
  },
  async cambiarRolUsuario(dbId, role) {
    return apiFetch('/usuarios/' + dbId + '/rol', {
      method: 'PUT',
      body: { rol: role === 'admin' ? 'administrador' : 'cajero' },
    });
  },
  async cambiarEstadoUsuario(dbId, activo) {
    return apiFetch('/usuarios/' + dbId + '/estado', {
      method: 'PUT',
      body: { activo },
    });
  },
};

Object.assign(window, { API, codeToId });
