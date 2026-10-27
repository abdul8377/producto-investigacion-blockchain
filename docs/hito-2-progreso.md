# Hito 2 — cobertura académica

Implementación inicial: operador local, cookie firmada, conexión MySQL de origen y consulta real de cantidades en /datos y /api/v1/datos/resumen.

## Configurar

Crear una base de origen separada a partir de investigacion_mysql.sql en un MySQL autorizado. Crear una cuenta SQL exclusivamente con permisos SELECT para investigacion_peruschool. Nunca importar correspondencia_privada_mysql.sql al proyecto.

En .env.local configurar MYSQL_SOURCE_HOST, MYSQL_SOURCE_PORT, MYSQL_SOURCE_DATABASE=investigacion_peruschool, MYSQL_SOURCE_USER y MYSQL_SOURCE_PASSWORD. Configurar LAB_OPERATOR_PASSWORD (mínimo 12 caracteres) y LAB_SESSION_SECRET (mínimo 32 caracteres aleatorios).

Ejecutar pnpm install --no-frozen-lockfile (es necesario regenerar pnpm-lock.yaml porque se incorporó mysql2), pnpm dev, y abrir /acceso, luego /datos.

## Pendiente

El repositorio aún no tiene lockfile regenerado ni verificación de compilación. Las pruebas de integración y carga siguen pendientes. No fusionar hasta resolver dependencias. No hay aún API paginada de notas y asistencias ni Gateway Fabric. El control de acceso es de laboratorio, no institucional.
