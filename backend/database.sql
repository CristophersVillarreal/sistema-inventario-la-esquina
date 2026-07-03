-- ============================================================
-- database.sql — Sistema de Inventario "La Esquina"
-- MySQL / MariaDB (XAMPP, phpMyAdmin)
-- ------------------------------------------------------------
-- Cómo usar:
--   1) Abre phpMyAdmin (http://localhost/phpmyadmin)
--   2) Pestaña "Importar" y selecciona este archivo, o
--   3) Pestaña "SQL" y pega todo el contenido, luego "Continuar".
-- ============================================================

CREATE DATABASE IF NOT EXISTS la_esquina
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE la_esquina;

-- Para poder re-ejecutar el script sin errores de llaves foráneas.
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS movimientos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS proveedores;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- usuarios
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100)  NOT NULL,
  apellido      VARCHAR(100)  NOT NULL,
  correo        VARCHAR(150)  NOT NULL UNIQUE,
  celular       VARCHAR(9)    NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  rol           ENUM('administrador','cajero') NOT NULL DEFAULT 'cajero',
  activo        BOOLEAN       NOT NULL DEFAULT TRUE,
  creado_en     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- proveedores
-- ------------------------------------------------------------
CREATE TABLE proveedores (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(150) NOT NULL,
  contacto  VARCHAR(100) NULL,
  telefono  VARCHAR(20)  NULL,
  activo    BOOLEAN      NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- productos
-- ------------------------------------------------------------
CREATE TABLE productos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(150)   NOT NULL,
  descripcion     VARCHAR(255)   NULL,
  precio          DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  stock_actual    INT            NOT NULL DEFAULT 0,
  stock_minimo    INT            NOT NULL DEFAULT 0,
  fecha_caducidad DATE           NULL,
  proveedor_id    INT            NULL,
  creado_en       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_productos_proveedor
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_productos_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- movimientos  (entradas / salidas — corazón de la trazabilidad)
-- ------------------------------------------------------------
CREATE TABLE movimientos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT           NOT NULL,
  tipo        ENUM('entrada','salida') NOT NULL,
  cantidad    INT           NOT NULL,
  usuario_id  INT           NOT NULL,
  fecha       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  anulado     BOOLEAN       NOT NULL DEFAULT FALSE,
  metodo_pago ENUM('efectivo','yape','tarjeta') NULL,
  cliente     VARCHAR(150)  NULL,
  nota        VARCHAR(255)  NULL,
  CONSTRAINT fk_mov_producto
    FOREIGN KEY (producto_id) REFERENCES productos(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_mov_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_mov_cantidad CHECK (cantidad > 0),
  INDEX idx_mov_tipo (tipo),
  INDEX idx_mov_fecha (fecha),
  INDEX idx_mov_producto (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DATOS SEMILLA (opcional, para probar de inmediato)
-- ------------------------------------------------------------
-- Usuarios iniciales:
--   Admin   → correo: admin@laesquina.pe   contraseña: Admin123!
--   Cajero  → correo: maria@laesquina.pe   contraseña: Cajero123!
-- Los hashes bcrypt corresponden a esas contraseñas. Cámbialas tras el primer login.
-- (También puedes regenerarlos con: npm run seed)
-- ============================================================

INSERT INTO usuarios (nombre, apellido, correo, celular, password_hash, rol, activo) VALUES
('Juan',  'Quispe', 'admin@laesquina.pe', '987111222', '$2b$10$I/V9BBcrwsqKAvMC4S2TcudsExIRgxDafgOXs8EXjnJALX19f4yE2', 'administrador', TRUE),
('María', 'Flores', 'maria@laesquina.pe', '987333444', '$2b$10$f8oQ6GO/PggvCkn731RAeegWo..xNdKoUOehnoJkiUiWaLdgdKUpG', 'cajero', TRUE);

INSERT INTO proveedores (nombre, contacto, telefono, activo) VALUES
('Distribuidora Lima SAC', 'Carlos Pérez', '987654321', TRUE),
('Backus y Johnston',      'Lucía Romero', '014112000', TRUE),
('Gloria S.A.',            'María Salas',  '014706000', TRUE),
('Alicorp S.A.A.',         'Jorge Ríos',   '013156000', FALSE),
('Costeño Alimentos',      'Andrea Vega',  '016184141', TRUE);

INSERT INTO productos (nombre, descripcion, precio, stock_actual, stock_minimo, fecha_caducidad, proveedor_id) VALUES
('Pan francés',         'Panadería',  0.50,  120, 30, '2026-06-12', 1),
('Leche Gloria 1L',     'Lácteos',    4.50,  8,   15, '2026-06-17', 3),
('Coca Cola 500ml',     'Bebidas',    3.00,  45,  20, '2026-11-30', 2),
('Arroz Costeño 1kg',   'Abarrotes',  5.20,  60,  25, '2027-01-15', 5),
('Yogurt Laive 1L',     'Lácteos',    7.80,  12,  10, '2026-05-20', 3),
('Inca Kola 1.5L',      'Bebidas',    6.50,  30,  15, '2026-12-10', 2),
('Pan integral',        'Panadería',  1.20,  5,   20, '2026-06-24', 1),
('Aceite Primor 1L',    'Abarrotes', 12.00,  22,  10, '2027-03-01', 4),
('Queso fresco 500g',   'Lácteos',   14.50,  18,  12, '2026-05-15', 3),
('Agua San Luis 625ml', 'Bebidas',    1.50,  90,  20, '2027-02-20', 2);
