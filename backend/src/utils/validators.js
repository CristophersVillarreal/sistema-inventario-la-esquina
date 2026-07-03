/* ============================================================
   utils/validators.js — Revalidación en backend (sección 7 de la spec)
   Cada función devuelve un string con el error, o '' si es válido.
   Reproduce las reglas del frontend (objeto V de data.jsx).
   ============================================================ */

const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validators = {
  nombre(v) {
    if (!v || !String(v).trim()) return 'Este campo es obligatorio.';
    if (!soloLetras.test(String(v).trim()))
      return 'Solo se permiten letras y espacios (sin números ni símbolos).';
    return '';
  },

  correo(v) {
    if (!v || !String(v).trim()) return 'El correo es obligatorio.';
    if (!correoRegex.test(String(v).trim()))
      return 'Ingresa un correo válido (ej. usuario@dominio.com).';
    return '';
  },

  celular(v) {
    if (!v || !String(v).trim()) return 'El celular es obligatorio.';
    if (!/^[0-9]{9}$/.test(String(v).trim()))
      return 'Debe tener exactamente 9 dígitos numéricos.';
    return '';
  },

  password(v) {
    if (!v) return 'La contraseña es obligatoria.';
    if (v.length < 8) return 'Mínimo 8 caracteres.';
    if (!/[A-Z]/.test(v)) return 'Debe incluir al menos una mayúscula.';
    if (!/[0-9]/.test(v)) return 'Debe incluir al menos un número.';
    if (!/[^A-Za-z0-9]/.test(v)) return 'Debe incluir al menos un carácter especial.';
    return '';
  },

  requerido(v, etiqueta = 'Este campo') {
    return !v || !String(v).trim() ? `${etiqueta} es obligatorio.` : '';
  },

  // Numérico y positivo (cantidades / precios)
  positivo(v, etiqueta = 'El valor') {
    if (v === '' || v === null || v === undefined) return `${etiqueta} es obligatorio.`;
    if (isNaN(Number(v)) || Number(v) <= 0) return `${etiqueta} debe ser un número mayor a 0.`;
    return '';
  },

  // Entero positivo (cantidades de stock)
  enteroPositivo(v, etiqueta = 'La cantidad') {
    if (v === '' || v === null || v === undefined) return `${etiqueta} es obligatoria.`;
    const n = Number(v);
    if (isNaN(n) || !Number.isInteger(n) || n <= 0)
      return `${etiqueta} debe ser un número entero mayor a 0.`;
    return '';
  },

  // No negativo (stock mínimo, etc.)
  noNegativo(v, etiqueta = 'El valor') {
    if (v === '' || v === null || v === undefined) return '';
    const n = Number(v);
    if (isNaN(n) || n < 0) return `${etiqueta} no puede ser negativo.`;
    return '';
  },
};

/**
 * Ejecuta un conjunto de reglas y devuelve un objeto de errores { campo: mensaje }.
 * @param {Object} reglas  { campo: () => mensajeError }
 * @returns {Object} errores (vacío si todo es válido)
 */
function recolectarErrores(reglas) {
  const errores = {};
  for (const [campo, fn] of Object.entries(reglas)) {
    const msg = fn();
    if (msg) errores[campo] = msg;
  }
  return errores;
}

module.exports = { validators, recolectarErrores };
