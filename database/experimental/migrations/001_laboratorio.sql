-- Ejecutar únicamente sobre la base experimental aislada. Nunca sobre el origen.
CREATE DATABASE IF NOT EXISTS investigacion_experimental CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE investigacion_experimental;
CREATE TABLE IF NOT EXISTS experimentos (
  experimento_id CHAR(36) NOT NULL PRIMARY KEY,
  estrategia ENUM('A','B') NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  estado ENUM('PREPARADO','EJECUTANDO','COMPLETADO','FALLIDO') NOT NULL DEFAULT 'PREPARADO',
  creado_en TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  iniciado_en TIMESTAMP(3) NULL,
  finalizado_en TIMESTAMP(3) NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS registros (
  registro_id CHAR(36) NOT NULL PRIMARY KEY,
  experimento_id CHAR(36) NOT NULL,
  estrategia ENUM('A','B') NOT NULL,
  version_actual INT UNSIGNED NOT NULL DEFAULT 0,
  estado ENUM('PENDIENTE','ACTIVO','REVOCADO','SUPRIMIDO') NOT NULL DEFAULT 'PENDIENTE',
  creado_en TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (experimento_id) REFERENCES experimentos(experimento_id),
  INDEX idx_experimento (experimento_id, estado)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS operaciones (
  evento_id CHAR(36) NOT NULL PRIMARY KEY,
  registro_id CHAR(36) NOT NULL,
  version INT UNSIGNED NOT NULL,
  operacion ENUM('REGISTRO','RECTIFICACION','REVOCACION','SUPRESION') NOT NULL,
  estado ENUM('PENDIENTE','ENVIANDO','CONFIRMADO','ERROR') NOT NULL DEFAULT 'PENDIENTE',
  payload_hash CHAR(64) NOT NULL,
  fabric_tx_id VARCHAR(128) NULL,
  error_codigo VARCHAR(80) NULL,
  creado_en TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actualizado_en TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_registro_version (registro_id,version),
  FOREIGN KEY (registro_id) REFERENCES registros(registro_id),
  INDEX idx_pendientes (estado,creado_en)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS detalles_b (
  evento_id CHAR(36) NOT NULL PRIMARY KEY,
  registro_id CHAR(36) NOT NULL,
  payload_cifrado LONGBLOB NOT NULL,
  nonce VARBINARY(12) NOT NULL,
  etiqueta VARBINARY(16) NOT NULL,
  clave_referencia CHAR(36) NOT NULL,
  creado_en TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (evento_id) REFERENCES operaciones(evento_id),
  FOREIGN KEY (registro_id) REFERENCES registros(registro_id),
  INDEX idx_detalles_registro (registro_id)
) ENGINE=InnoDB;
-- Las claves reales deben residir fuera de esta base y jamás entrar en la cadena.
-- La supresión requiere retirar TODAS las versiones en detalles_b, sus claves externas
-- y cualquier vínculo experimental antes de marcar el registro como SUPRIMIDO.
-- La revocación conserva historial. La supresión no afecta el origen ni respaldos.
CREATE TABLE IF NOT EXISTS metricas (
  metrica_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  experimento_id CHAR(36) NOT NULL,
  evento_id CHAR(36) NULL,
  operacion VARCHAR(32) NOT NULL,
  duracion_ms DECIMAL(12,3) NULL,
  bytes_payload BIGINT UNSIGNED NULL,
  exito BOOLEAN NOT NULL,
  registrado_en TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (experimento_id) REFERENCES experimentos(experimento_id),
  INDEX idx_metricas (experimento_id,operacion,registrado_en)
) ENGINE=InnoDB;
