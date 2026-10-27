import test from "node:test";
import assert from "node:assert/strict";
import {canonicalDetail,newEvidenceKeys,hmacDetail,encryptDetail,decryptDetail,matchesEvidence} from "../src/server/crypto/evidence.ts";

const detail={tipo:"CALIFICACION",anio:2026,periodo:2,valor:"AD"};
test("HMAC estable con la misma clave y cambia si el dato cambia",()=>{
 const keys=newEvidenceKeys();const sig=hmacDetail(detail,keys.mac);
 assert.equal(sig.length,64);
 assert.equal(sig,hmacDetail({...detail},keys.mac));
 assert.ok(matchesEvidence(detail,keys.mac,sig));
 assert.ok(!matchesEvidence({...detail,valor:"B"},keys.mac,sig));
});
test("cifrado AES-GCM y AAD ligan el payload al evento",()=>{
 const keys=newEvidenceKeys();const value=encryptDetail(detail,keys,"evento:1");
 assert.deepEqual(decryptDetail(value,keys.cipher,"evento:1"),detail);
 assert.throws(()=>decryptDetail(value,keys.cipher,"evento:2"));
 const tampered={...value,payload:Buffer.from(value.payload)};
 tampered.payload[0]^=1;
 assert.throws(()=>decryptDetail(tampered,keys.cipher,"evento:1"));
});
test("rechaza nombres, año de nota no disponible y etiquetas inválidas",()=>{
 assert.throws(()=>canonicalDetail({...detail,valor:"Nombre Apellido"}));
 assert.throws(()=>canonicalDetail({...detail,anio:2025}));
 assert.throws(()=>canonicalDetail({tipo:"ASISTENCIA",anio:2026,periodo:"2025-01-12",valor:"P"}));
});
