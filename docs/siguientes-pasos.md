# Trabajo posterior

La entrega actual se detiene en la estructura. Esta lista describe futuras fases y no supone que se hayan iniciado.

1. Validar Docker/WSL2 y compatibilidad de versiones; configurar MySQL e importar el origen en una base nueva con comprobaciones.
2. Diseñar el esquema experimental y definir contratos de eventos, evidencia, errores y estados.
3. Implementar acceso del operador, consultas paginadas y vistas de cobertura y consulta académica.
4. Implementar copias de ensayo, estrategias A/B, chaincode, HMAC, control de versiones e idempotencia.
5. Incorporar conciliación, verificación, revocación, supresión y desvinculación.
6. Integrar Caliper, realizar un piloto y ejecutar la evaluación reproducible.
7. Analizar resultados y preparar la demostración y el informe del PPI.

## Validación prevista al desarrollar

Las pruebas de integración cubrirán origen protegido, commit válido, reintentos sin duplicación, versión desactualizada, recuperación tras interrupciones, alteración deliberada, revocación frente a supresión y ausencia de datos nominativos en evidencia y resultados.

La estructura tests/integration y tests/e2e está reservada; no contiene pruebas ficticias ni herramientas instaladas aún.

## Protocolo de referencia del plan

Dos estrategias × dos cargas (notas de 2026 y asistencias) × tres tasas (10/50/100 TPS) × tres cantidades de workers (2/4/8) × cinco repeticiones = 180 corridas.

Cada corrida prevé 15 segundos de calentamiento y 60 de medición; timeout de solicitud de 30 segundos y conciliación de hasta 90 segundos. La API contará confirmaciones válidas y distinguirá los resultados tardíos.

Se fijarán configuración, selección de datos, hardware, parámetros de red y orden alternado A/B. Los criterios aceptan resultados desfavorables y no exigen una mejora predeterminada.

No se han creado escenarios ejecutables ni se ha realizado ninguna corrida.
