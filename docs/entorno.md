# Entorno de preparación

## Base instalada

La base se generó con:

```powershell
pnpm.cmd dlx create-next-app@16 'C:\Users\ASUS\Documents\investigacion-blockchain' --typescript --eslint --tailwind --src-dir --app --import-alias '@/*' --empty --use-pnpm --disable-git --no-react-compiler --no-agent-feedback --yes
```

No volver a ejecutar este comando sobre la carpeta existente.

| Herramienta | Versión utilizada |
|---|---|
| Node.js | 24.22.1 |
| pnpm | 11.25.0 |
| create-next-app / Next.js | 16.4.3 |
| React / React DOM | 19.3.0 |
| TypeScript | 5.9.3 |
| Tailwind CSS / integración Turbopack | 4.3.3 |
| ESLint | 9.39.5 |
| eslint-config-next | 16.4.3 |

Los parches exactos de todas las dependencias se conservan en pnpm-lock.yaml. ESLint 9 es la versión que instala esta plantilla y el gestor mostró su aviso de fin de soporte; se evaluará su actualización compatible cuando empiece el desarrollo.

No se instaló npm ni se modificó el PATH del sistema. Si se abre otra terminal, debe disponer de Node y pnpm para usar los comandos del README.

## Configuración

Se conserva la configuración de Next.js creada por el generador, sin integraciones de aplicación. El alias @/* apunta a src/*. El archivo .node-version registra el Node usado; no instala ni cambia Node automáticamente.

.env.example documenta variables previstas. Ninguna está consumida por la plantilla y no se generaron secretos. Un futuro .env.local se excluye de Git.

## Dependencias previstas, todavía sin instalar

| Integración | Dependencia o herramienta futura |
|---|---|
| MySQL | mysql2/promise, provisto por el paquete mysql2 |
| Fabric Gateway | @hyperledger/fabric-gateway y transporte @grpc/grpc-js |
| Chaincode JavaScript | fabric-contract-api y fabric-shim en un paquete independiente |
| Medición | Hyperledger Caliper y conector HTTP propio, en entorno independiente |

Las versiones de esas integraciones deberán verificarse conjuntamente con Fabric 2.5 antes de instalarlas. No se añaden por adelantado ORM, librerías de estado, componentes UI o herramientas de prueba adicionales.

## Servicios pendientes

- MySQL 8.4: dos bases y cuentas separadas.
- Fabric 2.5: dos organizaciones, peers, orderer, canal e identidades.
- Docker Desktop / WSL2: verificar daemon, integración Linux, recursos y puertos.
- Caliper: resolver runtime y conector HTTP en la fase de evaluación.

Se encontraron ejecutables de Docker y WSL en PATH. Esto no confirma que sus servicios o distribuciones estén operativos. No se iniciaron contenedores, redes ni bases.
