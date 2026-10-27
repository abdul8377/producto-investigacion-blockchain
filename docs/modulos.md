# Módulos del prototipo

Todas las filas describen trabajo futuro. Las carpetas reservadas no contienen implementación.

| Módulo | Responsabilidad | Vista prevista |
|---|---|---|
| datos | Cobertura por año, procedencia, conteos y discrepancias | /datos |
| academico | Lectura paginada de estudiantes seudónimos, matrículas, notas y asistencias | /academico |
| eventos | Copias de ensayo, registro, rectificación y versiones | /laboratorio |
| trazabilidad | Historial, evidencia, confirmación y verificación de integridad | /trazabilidad |
| privacidad | Revocación, retirada de detalle y desvinculación experimental | Acciones en laboratorio y trazabilidad |
| experimentos | Configuraciones inmutables, corridas, métricas y exportaciones | /experimentos |
| autenticacion | Operador local y token independiente del generador de carga | /acceso |

Se mantienen cinco vistas principales del plan; acceso será una vista auxiliar. Privacidad se integra en las acciones del laboratorio y no necesita otra pantalla principal.

## Espacios de API reservados

Bajo `src/app/api/v1/`: datos, academico, eventos, trazabilidad, privacidad, experimentos y autenticacion.

Cada espacio contiene solo un marcador. Los métodos HTTP, validaciones, contratos de entrada/salida, errores y autorización se definirán al comenzar la codificación. No existe ningún `route.ts` personalizado.

## Servicios transversales reservados

| Carpeta en src/server | Uso futuro |
|---|---|
| mysql | Pools separados para origen y laboratorio, transacciones y consultas parametrizadas |
| fabric | Gateway, identidades, envío y confirmación |
| crypto | HMAC, serialización determinista y claves por evento |
| storage-strategies | Adaptadores A y B bajo un contrato común |
| reconciliation | Recuperación de operaciones pendientes |
| config | Variables de entorno y validación de configuración |
| observability | Tiempos, errores y métricas sin datos nominativos |

La autenticación pertenece a su módulo; los adaptadores externos se incorporarán aquí solo si son necesarios.
