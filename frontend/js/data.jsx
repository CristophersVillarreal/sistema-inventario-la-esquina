/* ============================================================
   data.jsx — Datos simulados, validaciones y utilidades
   ============================================================ */

// Exponer hooks de React como globales (cada archivo Babel tiene su propio scope)
const { useState, useEffect, useRef, useMemo, useCallback } = React;
Object.assign(window, { useState, useEffect, useRef, useMemo, useCallback });

const CATEGORIES = ['Panadería', 'Lácteos', 'Bebidas', 'Abarrotes'];

const SEED_SUPPLIERS = [
  { id: 'PROV-001', name: 'Distribuidora Lima SAC', ruc: '20512345678', phone: '987654321', email: 'ventas@dlima.pe',    contact: 'Carlos Pérez',  address: 'Av. Argentina 1234, Lima', status: 'Activo' },
  { id: 'PROV-002', name: 'Backus y Johnston',      ruc: '20100113610', phone: '014112000', email: 'pedidos@backus.pe',  contact: 'Lucía Romero',  address: 'Av. Nicolás Ayllón 3986, Ate', status: 'Activo' },
  { id: 'PROV-003', name: 'Gloria S.A.',            ruc: '20100190797', phone: '014706000', email: 'atencion@gloria.pe', contact: 'María Salas',   address: 'Av. República de Panamá 2461', status: 'Activo' },
  { id: 'PROV-004', name: 'Alicorp S.A.A.',         ruc: '20100055237', phone: '013156000', email: 'contacto@alicorp.pe',contact: 'Jorge Ríos',    address: 'Av. Argentina 4793, Callao', status: 'Inactivo' },
  { id: 'PROV-005', name: 'Costeño Alimentos',      ruc: '20330033313', phone: '016184141', email: 'ventas@costeno.pe',  contact: 'Andrea Vega',   address: 'Av. Materiales 2354, Lima', status: 'Activo' },
];

// stock, min, precio, vencimiento, proveedor preseleccionado
const SEED_PRODUCTS = [
  { id: 'COD-001', name: 'Pan francés',      cat: 'Panadería', price: 0.50,  stock: 120, min: 30, expiry: '2026-06-12', supplier: 'PROV-001' },
  { id: 'COD-002', name: 'Leche Gloria 1L',  cat: 'Lácteos',   price: 4.50,  stock: 8,   min: 15, expiry: '2026-06-17', supplier: 'PROV-003' },
  { id: 'COD-003', name: 'Coca Cola 500ml',  cat: 'Bebidas',   price: 3.00,  stock: 45,  min: 20, expiry: '2026-11-30', supplier: 'PROV-002' },
  { id: 'COD-004', name: 'Arroz Costeño 1kg', cat: 'Abarrotes', price: 5.20, stock: 60,  min: 25, expiry: '2027-01-15', supplier: 'PROV-005' },
  { id: 'COD-005', name: 'Yogurt Laive 1L',  cat: 'Lácteos',   price: 7.80,  stock: 12,  min: 10, expiry: '2026-05-20', supplier: 'PROV-003' },
  { id: 'COD-006', name: 'Inca Kola 1.5L',   cat: 'Bebidas',   price: 6.50,  stock: 30,  min: 15, expiry: '2026-12-10', supplier: 'PROV-002' },
  { id: 'COD-007', name: 'Pan integral',     cat: 'Panadería', price: 1.20,  stock: 5,   min: 20, expiry: '2026-06-24', supplier: 'PROV-001' },
  { id: 'COD-008', name: 'Aceite Primor 1L', cat: 'Abarrotes', price: 12.00, stock: 22,  min: 10, expiry: '2027-03-01', supplier: 'PROV-004' },
  { id: 'COD-009', name: 'Queso fresco 500g', cat: 'Lácteos',  price: 14.50, stock: 18,  min: 12, expiry: '2026-05-15', supplier: 'PROV-003' },
  { id: 'COD-010', name: 'Agua San Luis 625ml', cat: 'Bebidas', price: 1.50, stock: 90,  min: 20, expiry: '2027-02-20', supplier: 'PROV-002' },
];

const SEED_USERS = [
  { id: 'U-001', nombre: 'Juan',   apellido: 'Quispe',  email: 'admin@laesquina.pe',  phone: '987111222', role: 'admin',  status: 'Activo', created: '2025-08-10' },
  { id: 'U-002', nombre: 'María',  apellido: 'Flores',  email: 'maria@laesquina.pe',  phone: '987333444', role: 'cajero', status: 'Activo', created: '2025-09-02' },
  { id: 'U-003', nombre: 'Carlos', apellido: 'Mendoza', email: 'carlos@laesquina.pe', phone: '987555666', role: 'cajero', status: 'Activo', created: '2026-01-18' },
  { id: 'U-004', nombre: 'Rosa',   apellido: 'Huamán',  email: 'rosa@laesquina.pe',   phone: '987777888', role: 'cajero', status: 'Inactivo', created: '2026-02-25' },
];

const SEED_MOVES = [
  { id: 'M-009', type: 'entrada', code: 'COD-003', name: 'Coca Cola 500ml', qty: 24, user: 'Juan Quispe',  date: '2026-05-11 09:14', supplier: 'PROV-002', note: 'Reposición semanal' },
  { id: 'M-008', type: 'salida',  code: 'COD-001', name: 'Pan francés',     qty: 30, user: 'María Flores', date: '2026-05-11 08:42', supplier: null, note: 'Venta mostrador' },
  { id: 'M-007', type: 'entrada', code: 'COD-002', name: 'Leche Gloria 1L', qty: 12, user: 'Juan Quispe',  date: '2026-05-10 17:20', supplier: 'PROV-003', note: '' },
  { id: 'M-006', type: 'salida',  code: 'COD-004', name: 'Arroz Costeño 1kg', qty: 5, user: 'Carlos Mendoza', date: '2026-05-10 15:05', supplier: null, note: '' },
  { id: 'M-005', type: 'entrada', code: 'COD-006', name: 'Inca Kola 1.5L',  qty: 20, user: 'Juan Quispe',  date: '2026-05-09 11:30', supplier: 'PROV-002', note: '' },
  { id: 'M-004', type: 'salida',  code: 'COD-010', name: 'Agua San Luis 625ml', qty: 8, user: 'María Flores', date: '2026-05-09 10:02', supplier: null, note: '' },
  { id: 'M-003', type: 'entrada', code: 'COD-008', name: 'Aceite Primor 1L', qty: 15, user: 'Juan Quispe', date: '2026-05-08 16:40', supplier: 'PROV-004', note: '' },
  { id: 'M-002', type: 'salida',  code: 'COD-003', name: 'Coca Cola 500ml', qty: 6, user: 'Carlos Mendoza', date: '2026-05-08 12:15', supplier: null, note: '' },
];

// Ventas (salidas POS) — incluye método de pago
const SEED_SALES = [
  { id: 'V-001', code: 'COD-003', name: 'Coca Cola 500ml',  qty: 3,  total: 9.00,  method: 'Efectivo', user: 'María Flores',   client: 'Cliente mostrador', date: '2026-06-09 12:13' },
  { id: 'V-002', code: 'COD-001', name: 'Pan francés',      qty: 12, total: 6.00,  method: 'Yape',     user: 'María Flores',   client: 'Cliente mostrador', date: '2026-06-09 11:40' },
  { id: 'V-003', code: 'COD-002', name: 'Leche Gloria 1L',  qty: 2,  total: 9.00,  method: 'Tarjeta',  user: 'Carlos Mendoza', client: 'Lucía Ramos',       date: '2026-06-08 18:05' },
  { id: 'V-004', code: 'COD-004', name: 'Arroz Costeño 1kg', qty: 4, total: 20.80, method: 'Efectivo', user: 'Carlos Mendoza', client: 'Cliente mostrador', date: '2026-06-08 16:22' },
  { id: 'V-005', code: 'COD-006', name: 'Inca Kola 1.5L',   qty: 5,  total: 32.50, method: 'Yape',     user: 'María Flores',   client: 'Cliente mostrador', date: '2026-06-08 10:11' },
  { id: 'V-006', code: 'COD-008', name: 'Aceite Primor 1L', qty: 2,  total: 24.00, method: 'Tarjeta',  user: 'María Flores',   client: 'José Torres',       date: '2026-06-07 19:30' },
  { id: 'V-007', code: 'COD-003', name: 'Coca Cola 500ml',  qty: 6,  total: 18.00, method: 'Efectivo', user: 'Carlos Mendoza', client: 'Cliente mostrador', date: '2026-06-07 13:48' },
  { id: 'V-008', code: 'COD-010', name: 'Agua San Luis 625ml', qty: 7, total: 10.50, method: 'Efectivo', user: 'María Flores', client: 'Cliente mostrador', date: '2026-06-07 09:55' },
];

// Ranking de más vendidos (acumulado del mes)
const SEED_TOPSELL = [
  { code: 'COD-001', name: 'Pan francés',      cat: 'Panadería', units: 320, income: 160.00 },
  { code: 'COD-003', name: 'Coca Cola 500ml',  cat: 'Bebidas',   units: 280, income: 840.00 },
  { code: 'COD-006', name: 'Inca Kola 1.5L',   cat: 'Bebidas',   units: 245, income: 1592.50 },
  { code: 'COD-010', name: 'Agua San Luis 625ml', cat: 'Bebidas', units: 220, income: 330.00 },
  { code: 'COD-004', name: 'Arroz Costeño 1kg', cat: 'Abarrotes', units: 190, income: 988.00 },
  { code: 'COD-002', name: 'Leche Gloria 1L',  cat: 'Lácteos',   units: 165, income: 742.50 },
  { code: 'COD-008', name: 'Aceite Primor 1L', cat: 'Abarrotes', units: 140, income: 1680.00 },
  { code: 'COD-005', name: 'Yogurt Laive 1L',  cat: 'Lácteos',   units: 95,  income: 741.00 },
  { code: 'COD-009', name: 'Queso fresco 500g', cat: 'Lácteos',  units: 78,  income: 1131.00 },
  { code: 'COD-007', name: 'Pan integral',     cat: 'Panadería', units: 60,  income: 72.00 },
];

const WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MOVE_WEEK = [
  { d: 'Lun', entradas: 24, salidas: 18 },
  { d: 'Mar', entradas: 12, salidas: 22 },
  { d: 'Mié', entradas: 30, salidas: 14 },
  { d: 'Jue', entradas: 18, salidas: 26 },
  { d: 'Vie', entradas: 40, salidas: 32 },
  { d: 'Sáb', entradas: 22, salidas: 38 },
  { d: 'Dom', entradas: 10, salidas: 16 },
];
const SALES_WEEK = [225, 290, 195, 340, 410, 520, 305];
const PAY_METHODS = [
  { name: 'Efectivo', value: 57.50, color: 'var(--green)' },
  { name: 'Yape',     value: 38.50, color: 'var(--blue)' },
  { name: 'Tarjeta',  value: 33.00, color: 'var(--amber)' },
];

/* ---------- Utilidades ---------- */
const TODAY = new Date('2026-06-09');
const soles = (n) => 'S/ ' + Number(n).toFixed(2);
const catColor = (c) => ({ 'Panadería': '#1e3a8a', 'Lácteos': '#3b82f6', 'Bebidas': '#f59e0b', 'Abarrotes': '#10b981' }[c] || '#64748b');

function daysUntil(dateStr) {
  const d = new Date(dateStr);
  return Math.round((d - TODAY) / 86400000);
}
function stockState(p) {
  if (p.stock <= p.min * 0.5) return { label: 'Crítico', cls: 'badge--red' };
  if (p.stock <= p.min) return { label: 'Stock bajo', cls: 'badge--red' };
  if (daysUntil(p.expiry) <= 30 && daysUntil(p.expiry) >= 0) return { label: 'Por vencer', cls: 'badge--amber' };
  return { label: 'Disponible', cls: 'badge--green' };
}
function nextId(prefix, list, pad) {
  const max = list.reduce((m, x) => {
    const n = parseInt(String(x.id).split('-')[1], 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return prefix + '-' + String(max + 1).padStart(pad, '0');
}

/* ---------- Validaciones (reglas del registro) ---------- */
const V = {
  name: (v) => {
    if (!v || !v.trim()) return 'Este campo es obligatorio.';
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(v.trim())) return 'Solo se permiten letras y espacios (sin números ni símbolos).';
    return '';
  },
  email: (v) => {
    if (!v || !v.trim()) return 'El correo es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Ingresa un correo válido (ej. usuario@dominio.com).';
    return '';
  },
  phone: (v) => {
    if (!v || !v.trim()) return 'El celular es obligatorio.';
    if (!/^[0-9]{9}$/.test(v.trim())) return 'Debe tener exactamente 9 dígitos numéricos.';
    return '';
  },
  password: (v) => {
    if (!v) return 'La contraseña es obligatoria.';
    if (v.length < 8) return 'Mínimo 8 caracteres.';
    if (!/[A-Z]/.test(v)) return 'Debe incluir al menos una mayúscula.';
    if (!/[0-9]/.test(v)) return 'Debe incluir al menos un número.';
    if (!/[^A-Za-z0-9]/.test(v)) return 'Debe incluir al menos un carácter especial.';
    return '';
  },
  ruc: (v) => {
    if (!v || !v.trim()) return 'El RUC es obligatorio.';
    if (!/^[0-9]{11}$/.test(v.trim())) return 'El RUC debe tener 11 dígitos.';
    return '';
  },
  required: (v) => (!v || !String(v).trim()) ? 'Este campo es obligatorio.' : '',
  dni: (v) => {
    if (!v || !v.trim()) return '';
    if (!/^[0-9]{8}$/.test(v.trim())) return 'El DNI debe tener 8 dígitos.';
    return '';
  },
  positive: (v) => {
    if (v === '' || v === null || v === undefined) return 'Este campo es obligatorio.';
    if (isNaN(Number(v)) || Number(v) <= 0) return 'Debe ser un número mayor a 0.';
    return '';
  },
};

function passwordStrength(v) {
  const checks = [v.length >= 8, /[A-Z]/.test(v), /[0-9]/.test(v), /[^A-Za-z0-9]/.test(v)];
  return checks.filter(Boolean).length;
}

Object.assign(window, {
  CATEGORIES, SEED_SUPPLIERS, SEED_PRODUCTS, SEED_USERS, SEED_MOVES, SEED_SALES,
  SEED_TOPSELL, WEEK, MOVE_WEEK, SALES_WEEK, PAY_METHODS,
  TODAY, soles, catColor, daysUntil, stockState, nextId, V, passwordStrength,
});
