# Investigación blockchain — prototipo PPI

**Estado al 27 de octubre de 2026: estructura y preparación, sin funcionalidades implementadas.**

Base creada en `C:\Users\ASUS\Documents\investigacion-blockchain` mediante `create-next-app`, con Next.js 16, App Router, TypeScript, Tailwind CSS y ESLint.

La única interfaz ejecutable es la página vacía de la plantilla oficial. No se han desarrollado pantallas, endpoints, lógica académica, autenticación, consultas SQL ni chaincode. Las carpetas adicionales contienen documentación y archivos `.gitkeep`.

## Ejecutar la base

En PowerShell:

```powershell
cd C:\Users\ASUS\Documents\investigacion-blockchain
pnpm.cmd dev
```

Abrir http://localhost:3000. Detener con Ctrl+C.

`pnpm.cmd lint` revisa la plantilla; `pnpm.cmd build` genera la compilación de producción y `pnpm.cmd start` la sirve una vez compilada. Para reinstalar exactamente las dependencias: `pnpm.cmd install --frozen-lockfile`.

Se utilizó pnpm porque está disponible en este entorno y npm no se encontró en PATH. La versión del gestor está fijada en `package.json` y las dependencias quedan resueltas en `pnpm-lock.yaml`.

## Documentación

- [Arquitectura](docs/arquitectura.md): componentes, límites y estrategias A/B.
- [Módulos](docs/modulos.md): responsabilidades y rutas previstas.
- [Estructura](docs/estructura.md): mapa de carpetas.
- [Datos](docs/datos.md): fuentes, esquema observado y tratamiento previsto.
- [Entorno](docs/entorno.md): dependencias y servicios pendientes.
- [Siguientes pasos](docs/siguientes-pasos.md): fases posteriores, todavía no ejecutadas.

## Alcance de esta entrega

Se crearon la base ejecutable, sus dependencias y la estructura documental. MySQL, Fabric y Caliper están previstos en la arquitectura, pero no están conectados ni desplegados. No se importaron datos ni se copiaron los archivos privados al proyecto.

El documento externo `PLAN (10).md` se utilizó como referencia de requisitos; sus instrucciones de implementación e importación corresponden a fases futuras. La solicitud actual limita esta entrega a la estructura.

Los archivos originales de Downloads se conservan en su ubicación. Los nombres reales y su correspondencia privada quedan fuera de la aplicación y de sus pruebas.

## Verificación de esta entrega

Compilación de producción, ESLint y comprobación de TypeScript completadas correctamente. Ver [registro de verificación](docs/verificacion.md).
