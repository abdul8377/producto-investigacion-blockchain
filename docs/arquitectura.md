# Arquitectura prevista

Estado: diseño de la estructura; integración pendiente.

## Decisión principal

Un monolito modular: una aplicación Next.js reúne la interfaz y la API. MySQL y Hyperledger Fabric son servicios externos. El chaincode y el generador de carga tienen carpetas independientes, sin constituir todavía paquetes instalados.

Esta estructura evita introducir un backend separado para el prototipo y permite comparar las dos estrategias con el mismo recorrido por la API.

```text
Navegador del operador             Caliper / carga HTTP
          |                                |
          +---------------+----------------+
                          |
             Next.js: vistas / API Node.js
                          |
                Casos de uso por módulo
                          |
          Adaptadores del servidor y estrategias A/B
                 /                         \
      MySQL 8.4                        Fabric 2.5
      - origen, solo lectura           - evidencia B
      - laboratorio experimental       - evento completo A
```

## Capas y dirección de dependencias

| Ubicación | Responsabilidad futura |
|---|---|
| src/app | Composición de páginas y Route Handlers; traducción HTTP |
| src/modules | Reglas y casos de uso agrupados por módulo |
| src/server | Conexiones, persistencia, criptografía y adaptadores |
| src/shared | Componentes, tipos y validación reutilizables |
| chaincode | Contrato de Fabric, independiente del cliente web |
| benchmarks/caliper | Carga experimental mediante la misma API HTTP |
| infra | Configuración futura de servicios locales |
| database | Preparación del origen y migraciones del laboratorio |
| scripts | Comandos futuros de importación, conciliación y experimentos |

Flujo previsto: app → módulos → adaptadores del servidor. Los contratos necesarios se definirán en los módulos durante la implementación. La UI no accede directamente a MySQL, identidades de Fabric ni secretos; el chaincode no importa Next.js.

No se crean archivos de clases, interfaces o repositorios vacíos. Cada módulo podrá separar casos de uso, contratos y validación cuando exista comportamiento que lo necesite.

## Persistencia y aislamiento

1. **Origen:** base `investigacion_peruschool`, nombre observado en el SQL adjunto. Su futura importación se realizará con una cuenta de preparación; la aplicación usará otra cuenta limitada a SELECT.
2. **Laboratorio:** base propuesta `investigacion_experimental`, con copias, versiones, estados de operaciones, claves por evento y mediciones. No existe todavía.
3. **Correspondencia privada:** permanece fuera del repositorio, del servidor y de las pruebas.
4. **Fabric:** red de laboratorio con dos organizaciones, un peer por organización y un orderer, según el plan. Aún no se instala ni inicia.

La configuración de conexiones y secretos será exclusivamente del servidor; no utilizar prefijos NEXT_PUBLIC_ para credenciales, claves o rutas de identidades.

## Estrategias experimentales

| Estrategia | Persistencia confirmada prevista |
|---|---|
| A — referencia | Evento de ensayo completo en Fabric; contenido temporal local retirado después de la confirmación |
| B — híbrida | Detalle en MySQL; identificador opaco, operación, versión, fecha experimental y HMAC en Fabric |

Ambas implementarán el mismo contrato de almacenamiento y los mismos casos de uso. La configuración de cada experimento fijará la estrategia, sin cambiarla durante la corrida.

Los identificadores originales solo se usarán para consulta y procedencia fuera de la cadena. Los eventos tendrán identificadores aleatorios de laboratorio. El HMAC utilizará una clave aleatoria por evento y una serialización determinista versionada; es independiente de la seudonimización del conjunto.

## Operaciones y consistencia

Diseño futuro, sin implementación:

- Registrar primero una operación pendiente en MySQL.
- Enviar a Fabric con identificador y contenido estables para permitir reintentos idempotentes.
- Confirmar éxito después de un commit válido y de completar el estado local.
- Validar la versión esperada para rechazar rectificaciones desactualizadas.
- Conciliar operaciones interrumpidas mediante un comando independiente en scripts/reconciliation.
- Distinguir confirmación técnica, vigencia académica y resultado de verificación.

La supresión en modo B retirará detalle, claves y enlaces de todas las versiones experimentales seleccionadas; la evidencia persistirá como detalle retirado. Revocar en modo A no eliminará el contenido histórico de Fabric.

## Ejecución local prevista

Next.js se prepara en Windows en esta entrega. MySQL, Fabric y Caliper se integrarán posteriormente con Docker y WSL2. Antes de integrar Fabric se decidirá y verificará la ubicación de ejecución de Next.js y el acceso a certificados, rutas y puertos entre Windows y WSL2.

Los experimentos usarán Next.js en producción. Las mediciones corresponderán a un laboratorio en un equipo, sin atribuirles representatividad de una red institucional.

## Referencias técnicas consultadas

- [Creación de proyectos Next.js](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
- [Instalación de Next.js](https://nextjs.org/docs/app/getting-started/installation).
- [Instalación de Fabric 2.5](https://hyperledger-fabric.readthedocs.io/en/release-2.5/install.html).

La elección del monolito modular y la organización de carpetas son decisiones de este proyecto basadas en el alcance del plan proporcionado.
