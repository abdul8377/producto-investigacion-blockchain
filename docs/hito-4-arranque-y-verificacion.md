# Hito 4 — Preparación del laboratorio y conciliación

## Estado (octubre de 2026)
Esta etapa deja **scripts y configuración**, no una red ya desplegada. La infraestructura se ejecutará en el equipo del proyecto con Docker Desktop + WSL2. Se corrigió la recuperación de operaciones con un reclamo exclusivo y una consulta del evento ya escrito en Fabric. La verificación integral sigue pendiente.

## 1. Preparar WSL2 y dependencias

Trabajar preferentemente **dentro de Ubuntu/WSL2** con el repositorio, Fabric y Next.js en el mismo sistema para que las rutas de certificados sean válidas. Instalar Docker Desktop con integración WSL2, Node.js según `.node-version` y pnpm según `package.json`. Comprobar `docker info`.

Descargar `fabric-samples` oficial compatible con la línea Fabric 2.5 y los binarios/imágenes de Fabric 2.5 siguiendo la documentación oficial:

- https://hyperledger-fabric.readthedocs.io/en/release-2.5/install.html
- https://hyperledger-fabric.readthedocs.io/en/release-2.5/test_network.html

No utilizar una red institucional, ni ejecutar `network.sh down` en redes que deban conservarse.

## 2. MySQL experimental

Crear un archivo local ignorado `.env.mysql` con `MYSQL_ROOT_PASSWORD` aleatoria; restringir permisos del archivo. Desde la raíz del repositorio:

```bash
docker compose --env-file .env.mysql -f infra/mysql/compose.yaml up -d
docker compose --env-file .env.mysql -f infra/mysql/compose.yaml ps
```

Se utiliza la imagen `mysql:8.4`, solo accesible por `127.0.0.1:3306`. Las migraciones `001_laboratorio.sql` y `002_outbox.sql` se ejecutan desde `docker-entrypoint-initdb.d` **solo durante la primera creación del volumen**. Si el volumen ya existía, aplicar migraciones pendientes manualmente, nunca borrar el volumen para forzar una reinicialización. Las migraciones solo afectan `investigacion_experimental`.

Importar `investigacion_mysql.sql` (seudonimizado) **localmente** en una base separada `investigacion_peruschool`, con autorización. No importar `correspondencia_privada_mysql.sql` ni subir datos de alumnos a GitHub.

Crear dos cuentas SQL distintas: una cuenta origen con **solo SELECT** sobre `investigacion_peruschool.*` y otra cuenta de laboratorio con SELECT/INSERT/UPDATE/DELETE sobre `investigacion_experimental.*`. La app no debe utilizar root. Usar claves largas aleatorias, definidas exclusivamente en `.env.local`.

El archivo `database/source/auditoria.sql` contiene solo consultas de conteo y permite comprobar cobertura sin exportar filas personales.

## 3. Fabric 2.5 de laboratorio

Configurar `FABRIC_SAMPLES_DIR` con la ruta absoluta de `fabric-samples` y, desde la raíz de este proyecto:

```bash
bash scripts/fabric/bootstrap-test-network.sh
bash scripts/fabric/show-env.sh
```

El primer script solicita al `test-network` oficial dos organizaciones, un canal `ppi-channel` y despliegue del chaincode JavaScript `ppi-chaincode`. El segundo muestra **rutas** (nunca valores de llaves) de la identidad User1 de Org1. Copiar esas rutas a `.env.local`. La red debe estar funcionando y el chaincode confirmado antes de usar el Gateway.

## 4. Aplicación y claves

Crear `LAB_KEYS_DIR` como ruta absoluta **fuera del repositorio**, con permisos restringidos. Usar una ubicación que no se publique ni se sincronice automáticamente a carpetas públicas.

```bash
pnpm install --no-frozen-lockfile
pnpm lint
pnpm exec tsc --noEmit
pnpm build
node --test chaincode/test/*.test.cjs
node --experimental-strip-types --test tests/evidence.test.mjs
```

Revisar los cambios de `pnpm-lock.yaml` y guardarlos en Git antes de fusionar. El lockfile del PR todavía no está sincronizado; la CI lo indicará. Para ejecutar la interfaz, configurar `.env.local` y usar `pnpm dev` (desarrollo) o `pnpm start` después de build (pruebas experimentales).

## 5. Ruta mínima de verificación integrada

1. Crear un experimento sintético A desde `/laboratorio`; registrar y comprobar `CONFIRMADO` y `ConsultarEvento` en Fabric.
2. Repetir en B; comprobar que el chaincode conserva HMAC, pero no detalle, y que MySQL conserva el payload cifrado.
3. Rectificar con `expectedVersion=1`; verificar versión 2 y asociación con evento anterior.
4. Revocar otro registro; verificar que el historial continúa consultable y que no acepta rectificación posterior.
5. Solicitar supresión B; verificar que Fabric refleja SUPRIMIDO y que se retiran claves y detalles **solo de la copia experimental activa**.
6. Simular caída antes/después del commit y ejecutar `/api/v1/eventos/reintentar`; observar que no se pierde ni duplica la operación lógica.
7. Reservar Caliper/TPS, latencias, mediciones de recursos y evaluación del mecanismo de supresión para la fase experimental posterior.

**Limitaciones:** la comparación A/B debe hacerse en hardware y condiciones constantes; el prototipo no certifica cumplimiento GDPR, no borra respaldos ni garantiza anonimato. Las pruebas anteriores son un protocolo pendiente, no resultados ejecutados.
