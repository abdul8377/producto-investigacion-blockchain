#!/usr/bin/env bash
# Laboratorio local únicamente. Requiere Docker, Fabric 2.5 y fabric-samples instalados.
set -euo pipefail
: "${FABRIC_SAMPLES_DIR:?Define FABRIC_SAMPLES_DIR con la ruta absoluta de fabric-samples}"
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
samples_dir="$(cd "$FABRIC_SAMPLES_DIR" && pwd)"
test_network="$samples_dir/test-network"
if [[ ! -x "$test_network/network.sh" ]]; then
  echo "No existe network.sh en $test_network" >&2
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  echo "Docker no está activo o no tienes permisos." >&2
  exit 1
fi
if [[ ! -f "$project_dir/chaincode/package.json" ]]; then
  echo "No se encuentra el chaincode del PPI." >&2
  exit 1
fi

cd "$test_network"
# No ejecutar ./network.sh down sin autorización; destruye la red previa.
./network.sh up createChannel -c ppi-channel -ca
./network.sh deployCC -c ppi-channel -ccn ppi-chaincode -ccp "$project_dir/chaincode" -ccl javascript
echo "Red de ensayo solicitada; confirma el despliegue con docker ps y consultas al ledger."
echo "Para generar las rutas de .env.local, ejecuta scripts/fabric/show-env.sh"
