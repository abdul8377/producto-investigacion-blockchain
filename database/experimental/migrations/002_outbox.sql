-- Ejecutar UNA sola vez después de 001_laboratorio.sql en la base experimental.
-- El evento JSON contiene datos académicos ficticios SOLO en modo A mientras está pendiente.
-- Una vez confirmado A, se elimina evento_json local; la copia A permanece en blockchain.
USE investigacion_experimental;
ALTER TABLE operaciones ADD COLUMN request_hash CHAR(64) NULL AFTER payload_hash;
ALTER TABLE operaciones ADD COLUMN evento_json JSON NULL AFTER request_hash;
-- No añadir nombres, DNI, códigos institucionales ni correspondencias a estas tablas.
