# BlockLab — Producto de Investigación PPI

Prototipo experimental de trazabilidad microcurricular. Compara la estrategia **A (detalle sintético dentro de Fabric)** y la estrategia **B (detalle experimental cifrado en MySQL y HMAC en Fabric)**.

## Estado de implementación

- **Hito 1:** chaincode versionado y migración inicial de MySQL experimental.
- **Hito 2:** autenticación local, lectura del conjunto seudonimizado, consultas académicas paginadas.
- **Hito 3 (en desarrollo):** Gateway de Fabric, preparación de operaciones, cifrado y HMAC, registro, rectificación, revocación, supresión B y reintentos.

Los cambios se mantienen en pull requests de borrador; aún no están fusionados en `main`.

## Requisitos

Next.js 16 + Node.js, MySQL 8.4 y red Hyperledger Fabric 2.5 de laboratorio. Se necesita configurar las credenciales de servidor en `.env.local`, sin usar variables públicas para secretos, y una carpeta `LAB_KEYS_DIR` **fuera del repositorio**.

En MySQL importar las migraciones `database/experimental/migrations/001_laboratorio.sql` y `002_outbox.sql`. La base académica de origen usa una cuenta exclusiva SELECT y no debe modificarse.

Antes de ejecutar: regenerar `pnpm-lock.yaml` con `pnpm install --no-frozen-lockfile` y revisar las dependencias. Después ejecutar `pnpm dev` y visitar `/acceso`, `/datos` y `/laboratorio`. La red Fabric y los certificados deberán estar listos para confirmar las transacciones.

## Protección de datos

El repositorio es público. No contiene nombres reales, correspondencias privadas, datos de menores ni dumps de la base de investigación. El generador `node scripts/data/synthetic.mjs` produce ejemplos **ficticios**. Los archivos con datos reales se conservarán localmente, fuera de GitHub.

La supresión demostrada es exclusivamente técnica, limitada a la copia experimental activa. No acredita cumplimiento GDPR ni eliminación de respaldos.

## Limitaciones actuales

No se han ejecutado las pruebas integradas de MySQL/Fabric, revisado el lockfile nuevo ni realizado las mediciones Caliper. No interpretar operaciones enviadas como confirmadas hasta que exista commit válido y persistencia local coherente. No fusionar PR en borrador sin las verificaciones necesarias.
