# API "La Esquina" — Sistema de Inventario

Backend REST para el minimarket **La Esquina**. Da soporte al frontend en React: autenticación con roles (administrador / cajero), productos, movimientos de almacén (entradas/salidas), ventas, proveedores, alertas y reportes.

**Stack:** Node.js + Express · MySQL/MariaDB (XAMPP) · `mysql2` (pool + consultas parametrizadas) · JWT · bcrypt.

---

## 1. Requisitos

- **Node.js 18+** (probado con Node 24).
- **XAMPP** con **MySQL/MariaDB** y **Apache** (para phpMyAdmin) encendidos.

## 2. Puesta en marcha (paso a paso)

### a) Crear la base de datos

1. Inicia **XAMPP** y enciende **Apache** y **MySQL**.
2. Abre phpMyAdmin: <http://localhost/phpmyadmin>.
3. Pestaña **Importar** → selecciona el archivo [`database.sql`](database.sql) → **Continuar**.
   - Crea la base `la_esquina`, todas las tablas y datos de ejemplo (productos, proveedores y un administrador).

### b) Configurar variables de entorno

```bash
cd backend
copy .env.example .env      # en Windows (PowerShell/CMD)
# cp .env.example .env      # en Mac/Linux
```

Edita `.env` si tu MySQL usa otra contraseña/puerto. Por defecto XAMPP usa
`DB_USER=root` y `DB_PASSWORD=` (vacío).

> **Importante:** cambia `JWT_SECRET` por una cadena larga y aleatoria.

### c) Instalar dependencias y arrancar

```bash
npm install
npm start          # producción
# npm run dev      # recarga automática (node --watch)
```

Al iniciar verás:

```
API "La Esquina" — Sistema de Inventario
Escuchando en: http://localhost:4000
✅ Conexión a la base de datos establecida.
```

### d) Abrir la aplicación (frontend ya conectado)

El backend **sirve el frontend React** y lo conecta con la API. Abre en tu navegador:

👉 **<http://localhost:4000>**  (redirige a la app en `/app/`)

Inicia sesión con los accesos rápidos de demostración o con las credenciales de abajo.
Prueba de salud de la API: <http://localhost:4000/api/health>

### e) Usuarios iniciales

El `database.sql` ya incluye un admin y un cajero. Si prefieres (re)generarlos desde Node:

```bash
npm run seed
```

| Rol           | Correo                | Contraseña   |
|---------------|-----------------------|--------------|
| Administrador | `admin@laesquina.pe`  | `Admin123!`  |
| Cajero        | `maria@laesquina.pe`  | `Cajero123!` |

> El registro público (`POST /api/auth/registro`) crea usuarios con rol **cajero**.
> Para volver administrador a alguien, un admin usa `PUT /api/usuarios/:id/rol`.

---

## 3. Autenticación

1. `POST /api/auth/login` con `{ correo, password }` devuelve un **token JWT**.
2. Envía ese token en cada petición protegida:

```
Authorization: Bearer <token>
```

El token incluye `id` y `rol`. La autorización por rol se valida **siempre en el backend**.

### Permisos por rol

| | **Administrador** | **Cajero** |
|---|---|---|
| Productos (gestión) | ✅ crear/editar/eliminar | ❌ |
| Catálogo (lectura) | ✅ | ✅ solo activos |
| Entradas de almacén | ✅ | ❌ |
| Salidas / ventas | ✅ | ✅ |
| Historial de movimientos | ✅ | ❌ |
| Anular movimientos | ✅ | ❌ |
| Proveedores | ✅ | ❌ |
| Alertas | ✅ | ✅ |
| Reportes | ✅ | ❌ |
| Usuarios / roles | ✅ | ❌ |

---

## 4. Endpoints

Prefijo: `/api`. (rol requerido entre paréntesis)

### Autenticación
| Método | Ruta | Rol |
|---|---|---|
| POST | `/auth/registro` | público |
| POST | `/auth/login` | público |
| GET  | `/auth/perfil` | autenticado |

### Productos
| Método | Ruta | Rol |
|---|---|---|
| GET    | `/productos?buscar=` | admin / cajero (catálogo) |
| POST   | `/productos` | admin |
| PUT    | `/productos/:id` | admin |
| DELETE | `/productos/:id` — eliminación física | admin |

### Movimientos / Inventario
| Método | Ruta | Rol |
|---|---|---|
| GET   | `/movimientos?tipo=&producto_id=&desde=&hasta=` | admin |
| POST  | `/movimientos/entrada` | admin |
| POST  | `/movimientos/salida` | admin / cajero |
| PATCH | `/movimientos/:id/anular` | admin |

### Proveedores
| Método | Ruta | Rol |
|---|---|---|
| GET    | `/proveedores?activos=true` | admin |
| POST   | `/proveedores` | admin |
| PUT    | `/proveedores/:id` | admin |
| DELETE | `/proveedores/:id` — eliminación física | admin |

### Alertas y reportes
| Método | Ruta | Rol |
|---|---|---|
| GET | `/alertas?dias=30` | admin / cajero |
| GET | `/reportes/inventario` | admin |
| GET | `/reportes/stock-bajo` | admin |
| GET | `/reportes/vencimientos?dias=30` | admin |
| GET | `/reportes/entradas-salidas?desde=&hasta=` | admin |
| GET | `/reportes/mas-vendidos?limite=10` | admin |
| GET | `/reportes/ventas-por-metodo?desde=&hasta=` | admin |

### Usuarios
| Método | Ruta | Rol |
|---|---|---|
| GET | `/usuarios` | admin |
| PUT | `/usuarios/:id/rol` | admin |
| PUT | `/usuarios/:id/estado` | admin |

---

## 5. Reglas de negocio implementadas

- **Stock automático:** cada movimiento ajusta `productos.stock_actual` (+ entrada / − salida) **en la misma transacción**.
- **Validación pre-venta:** una salida se rechaza si `stock_actual < cantidad` (HTTP 409). No hay "ventas fantasma".
- **Transacciones con rollback:** registrar y anular movimientos usan `START TRANSACTION` + `FOR UPDATE`; si algo falla, se revierte todo.
- **Anular ≠ borrar (movimientos):** anular revierte el efecto en stock y marca `anulado = true`; el registro permanece (auditoría).
- **Eliminación física (productos y proveedores):** el botón **Eliminar** borra el registro con `DELETE`.
  - Producto: se borran sus movimientos asociados y luego el producto, **en una transacción**.
  - Proveedor: la FK `productos.proveedor_id` es `ON DELETE SET NULL`, así que los productos de ese proveedor quedan sin proveedor (no se borran).
- **Alertas:** stock mínimo (`stock_actual <= stock_minimo`) y caducidad próxima (≤ 30 días, configurable).
- **Auditoría:** cada movimiento guarda `usuario_id` + `fecha` (quién y cuándo).

## 6. Validaciones (sección 7 de la spec)

Revalidadas en el backend (espejo del frontend):

| Campo | Regla |
|---|---|
| nombre / apellido | solo letras (incluye tildes y ñ) y espacios |
| correo | formato válido + único |
| celular | exactamente 9 dígitos |
| contraseña | mín. 8, una mayúscula, un número y un carácter especial |
| cantidades / precios | numéricos y positivos |

Errores → HTTP 400 con `{ mensaje, errores: { campo: "..." } }`, en español.

## 7. Seguridad

- Contraseñas hasheadas con **bcrypt** (nunca en texto plano).
- **Consultas parametrizadas** (sin concatenar SQL) → previene inyección.
- **JWT** con expiración y secreto en `.env`.
- Login con mensaje genérico (no revela si falló correo o contraseña).
- **CORS** restringido al origen del frontend (`CORS_ORIGIN`).

## 8. Estructura del proyecto

```
backend/
├── src/
│   ├── config/        db.js (pool MySQL)
│   ├── controllers/   lógica de cada recurso
│   ├── routes/        definición de endpoints + roles
│   ├── middlewares/   auth (JWT) y roles
│   ├── models/        consultas SQL por entidad
│   ├── utils/         validadores, asyncHandler, seed
│   ├── app.js         configuración de Express
│   └── server.js      punto de entrada
├── database.sql
├── .env.example
└── package.json
```

## 9. Frontend conectado

El frontend React (en `../frontend`) **ya está conectado a esta API** y se sirve
desde el propio backend en `http://localhost:4000/app`, por lo que comparte origen con la
API y no hay problemas de CORS.

- **`js/api.jsx`** — capa de conexión: cliente `fetch` con token JWT (guardado en
  `localStorage`), y mapeadores entre la forma del backend (`nombre`, `precio`,
  `stock_actual`…) y la del frontend (`name`, `price`, `stock`…).
- El frontend conserva los IDs "bonitos" para mostrar (`COD-008`) pero lleva el `id`
  numérico real de la BD en `dbId` para las llamadas a la API (la spec usa **IDs enteros
  autoincrementales**).
- Login, registro, productos, inventario (entradas/salidas), ventas (POS), proveedores,
  usuarios, alertas y reportes operan contra la base de datos real.

**Limitaciones conocidas (por diseño de la spec):**
- La tabla `proveedores` es la mínima de la spec (`nombre`, `contacto`, `telefono`,
  `activo`). Los campos RUC, correo y dirección del formulario no se guardan.
- El historial de ventas y movimientos es exclusivo de **administrador** (`GET /movimientos`),
  así que la pestaña "Historial" del POS no se llena en la vista de cajero.
- Algunos gráficos (tendencia semanal, ranking del mes) usan datos de muestra del prototipo.
