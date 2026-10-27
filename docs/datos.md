# Datos disponibles y límites de esta preparación

## Archivos proporcionados

Ubicación actual: `C:\Users\ASUS\Downloads`.

| Archivo | Uso previsto | Acción en esta entrega |
|---|---|---|
| PLAN (10).md | Referencia de alcance del PPI | Leído para definir estructura |
| investigacion_mysql.sql | Origen relacional seudonimizado | Inspección del esquema y consultas finales; no ejecutado |
| datos_investigacion.xlsx | Fuente complementaria | Sin importar ni validar celdas |
| correspondencia_privada (1).xlsx | Correspondencia nominativa privada | Sin incorporar ni inspeccionar contenido |
| correspondencia_privada_mysql.sql | Correspondencia nominativa privada | Sin incorporar ni ejecutar |

No se copiaron datasets al repositorio. Las carpetas data/source y data/experimental están vacías y sus contenidos futuros están excluidos de Git.

## Esquema observado en el SQL

Base declarada: `investigacion_peruschool`.

Tablas: ciclos, estudiantes, secciones, asignaturas, periodos, ofertas, fuentes, matriculas, asistencias, calificaciones y controles.

Se observaron claves foráneas para año, estudiante, sección, oferta, periodo y fuente. La tabla calificaciones diferencia valor original, valor numérico y el indicador registrada, y conserva hoja, fila y columna de procedencia.

El archivo termina con consultas de comprobación de matrículas y asistencias por año, notas registradas por año y controles discrepantes. Su ejecución y validación quedan pendientes de la fase de datos.

## Cobertura declarada por el plan

Estas cifras son referencias del documento proporcionado; **no son el resultado de una importación o auditoría realizada en esta entrega**.

| Elemento | Referencia |
|---|---|
| Estudiantes seudónimos | 552 |
| Matrículas/registros anuales | 1.100, entre 2024 y 2026 |
| Secciones-año | 57 |
| Asistencias | 142.882 |
| Notas registradas | 11.419, solo de 2026 |
| Celdas de notas | 24.676, incluyendo guiones y vacíos |
| Asignaturas / ofertas / periodos | 37 / 336 / 4 |
| Fuentes | 62 |
| Discrepancias de asistencia que documentar | 5 |

## Reglas para una fase posterior

- Importar el SQL únicamente en una base nueva y conservar identificadores y relaciones.
- Usar una cuenta de lectura para el origen y otra conexión para el laboratorio.
- Seleccionar notas registradas mediante registrada = 1.
- Conservar años, guiones, vacíos y etiquetas con espacios iniciales; no fabricar correcciones.
- Comparar notas y asistencias conjuntamente sobre 2026.
- Mantener fuera de blockchain los nombres, códigos institucionales e identificadores originales.
- Identificar rectificaciones y supresiones como operaciones experimentales.
- Tratar las notas como bimestrales y las asistencias como diarias, según el plan; no inventar evaluaciones individuales.
- Limitar la retirada de detalle a las copias experimentales activas. No implica eliminar el origen ni los respaldos.

Estas reglas forman parte del diseño pendiente; no autorizan ni ejecutan importaciones en la fase actual.
