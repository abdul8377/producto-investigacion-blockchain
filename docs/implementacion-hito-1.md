# Hito 1 — Núcleo de trazabilidad experimental

## Propósito

Se entrega código del contrato de estado para Hyperledger Fabric con dos políticas de almacenamiento, pruebas unitarias independientes del peer, una migración **exclusiva** para MySQL experimental y una portada informativa.

## Alcance real

- `chaincode/src/ledger-core.cjs`: validación estricta del evento, control de secuencia y estrategia, idempotencia por identificador y contenido, estado terminal de revocación/supresión.
- `chaincode/src/contract.cjs`: interfaz Fabric (`RegistrarEvento`, `ConsultarRegistro`, `ConsultarEvento`, `ConsultarHistorial`). Escritura restringida a Org1MSP/Org2MSP de laboratorio.
- `database/experimental/migrations/001_laboratorio.sql`: esquema relacional para ensayos y trazas operativas, **sin importar datos**.
- `chaincode/test/ledger-core.test.cjs`: pruebas ejecutables con mock de `ctx.stub`.

## Contrato y estrategias

Los IDs `recordId` y `eventId` son UUID v4 aleatorios, emitidos para el ensayo. No derivarlos de identificadores académicos, fechas de nacimiento ni códigos de estudiantes. `version` comienza en 1 y cada operación siguiente requiere `previousEventId` igual al último evento confirmado.

- **A**: `REGISTRO` y `RECTIFICACION` incluyen únicamente un detalle académico sintético reducido (`tipo`, `anio`, `periodo`, `valor`). El historial de A no se puede suprimir y persiste incluso tras revocación.
- **B**: `REGISTRO` y `RECTIFICACION` incluyen `hmac` hexadecimal, calculado en el servidor a partir de un detalle experimental canonizado y una clave independiente por evento. No incluyen detalle en cadena. `SUPRESION` representa una marca de estado; **no elimina por sí sola datos fuera de cadena**.
- **Ambas**: `REVOCACION` es terminal, conserva historial. Se rechaza reutilizar `eventId` con contenido diferente.

La restricción de campos es deliberada para que un cliente no pueda introducir nombres, DNI, códigos originales o identificadores de la fuente dentro del ledger. No constituye anonimato demostrado: los patrones de uso y HMAC aún requieren análisis de vinculabilidad.

## Ejemplo B (únicamente con UUID/HMAC ficticios)

```json
{
  "eventId":"00000000-0000-4000-8000-000000000001",
  "recordId":"00000000-0000-4000-8000-000000000010",
  "strategy":"B",
  "operation":"REGISTRO",
  "version":1,
  "timestamp":"2026-10-27T00:00:00Z",
  "hmac":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
}
```

Los valores del ejemplo son *solo ilustrativos*, no son un ensayo criptográfico.

## Comprobación mínima

Desde `chaincode/` ejecutar `node --test test/*.test.cjs`. El núcleo no requiere red Fabric para esas pruebas. Para ejecutar el contrato real hace falta instalar dependencias del subproyecto, arrancar una red Fabric autorizada y desplegar el chaincode. No se certifica todavía la compatibilidad operativa del despliegue.

## Trabajo pendiente para PR posteriores

1. Importador del SQL seudonimizado en base **nueva**, auditoría de cantidades y consultas de origen solo lectura.
2. Servicio de HMAC y canonización versionada, gestión de claves aislada, cifrado autenticado de detalle B y supresión real con conciliación.
3. Gateway de Fabric, identidad y certificados; outbox transaccional e idempotencia también del lado HTTP.
4. APIs y pantallas de datos, académico, laboratorio, trazabilidad y experimentos con autenticación del operador.
5. Caliper, escenarios comparables A/B, análisis de supresión, métricas y evaluación de validez.

## Limitación importante

Este hito **no implementa** la eliminación de datos ni demuestra conformidad con el GDPR. La supresión del contrato es solo una anotación irreversible en el ledger: la eliminación real de copias y claves se implementará mediante una operación transaccional coordinada fuera de cadena. Tampoco se han ejecutado pruebas de rendimiento ni desplegado red Fabric/MySQL.
