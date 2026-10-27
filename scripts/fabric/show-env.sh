#!/usr/bin/env bash
set -euo pipefail
: "${FABRIC_SAMPLES_DIR:?Define FABRIC_SAMPLES_DIR}"
net="$(cd "$FABRIC_SAMPLES_DIR/test-network" && pwd)"
org="$net/organizations/peerOrganizations/org1.example.com"
tls="$org/peers/peer0.org1.example.com/tls/ca.crt"
cert="$org/users/User1@org1.example.com/msp/signcerts/cert.pem"
keydir="$org/users/User1@org1.example.com/msp/keystore"
if [[ ! -f "$tls" || ! -f "$cert" || ! -d "$keydir" ]]; then
  echo "No existen los certificados; arranca la test-network con -ca." >&2
  exit 1
fi
mapfile -t keys < <(find "$keydir" -maxdepth 1 -type f)
if [[ ${#keys[@]} -ne 1 ]]; then
  echo "Se esperaba exactamente una clave privada en la identidad User1." >&2
  exit 1
fi
cat <<CONFIG
# Copia estas rutas a .env.local; NUNCA copies el contenido de las claves a Git.
FABRIC_GATEWAY_ENDPOINT=localhost:7051
FABRIC_PEER_HOST_ALIAS=peer0.org1.example.com
FABRIC_MSP_ID=Org1MSP
FABRIC_CHANNEL=ppi-channel
FABRIC_CHAINCODE=ppi-chaincode
FABRIC_TLS_CERT_PATH=$tls
FABRIC_IDENTITY_CERT_PATH=$cert
FABRIC_IDENTITY_KEY_PATH=${keys[0]}
CONFIG
