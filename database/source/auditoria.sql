-- Solo lectura de cobertura: ejecutar en investigacion_peruschool, cuenta ppi_reader.
-- Sin nombres, códigos de estudiantes ni exportaciones de filas individuales.
SELECT 'estudiantes' AS entidad, COUNT(*) AS cantidad FROM estudiantes
UNION ALL SELECT 'matriculas',COUNT(*) FROM matriculas
UNION ALL SELECT 'asistencias',COUNT(*) FROM asistencias
UNION ALL SELECT 'notas_registradas',COUNT(*) FROM calificaciones WHERE registrada=1
UNION ALL SELECT 'notas_celdas',COUNT(*) FROM calificaciones
UNION ALL SELECT 'fuentes',COUNT(*) FROM fuentes
UNION ALL SELECT 'diferencias_asistencia',COUNT(*) FROM controles WHERE coincide=0;
SELECT anio,COUNT(*) AS matriculas FROM matriculas GROUP BY anio ORDER BY anio;
SELECT anio,COUNT(*) AS asistencias FROM asistencias GROUP BY anio ORDER BY anio;
SELECT anio,COUNT(*) AS notas_registradas FROM calificaciones
 WHERE registrada=1 GROUP BY anio ORDER BY anio;
