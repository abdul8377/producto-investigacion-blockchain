import {createCipheriv,createDecipheriv,createHmac,randomBytes,timingSafeEqual} from "node:crypto";

export type AcademicDetail={tipo:"CALIFICACION"|"ASISTENCIA";anio:number;periodo:number|string;valor:string};
export type EncryptedDetail={payload:Buffer;nonce:Buffer;tag:Buffer;hmac:string};
export type EvidenceKeys={mac:Buffer;cipher:Buffer};

/** Serialización versionada, idéntica para estrategias A y B. */
export function canonicalDetail(detail:AcademicDetail):Buffer{
  if(!["CALIFICACION","ASISTENCIA"].includes(detail.tipo))throw Error("Tipo inválido");
  if(!Number.isInteger(detail.anio)||detail.anio<2024||detail.anio>2026)throw Error("Año inválido");
  if(detail.tipo==="CALIFICACION"&&
    (detail.anio!==2026||!Number.isInteger(detail.periodo)||Number(detail.periodo)<1||Number(detail.periodo)>4))throw Error("Periodo inválido");
  if(detail.tipo==="ASISTENCIA"&&
    (typeof detail.periodo!=="string"||!/^20(24|25|26)-\d{2}-\d{2}$/.test(detail.periodo)||
      !Number.isFinite(Date.parse(detail.periodo))||Number(detail.periodo.slice(0,4))!==detail.anio))throw Error("Fecha inválida");
  if(typeof detail.valor!=="string"||!/^[A-Za-z0-9+.,-]{1,12}$/.test(detail.valor))throw Error("Valor no permitido");
  return Buffer.from(JSON.stringify({schema:"ppi-detail-v1",tipo:detail.tipo,
    anio:detail.anio,periodo:detail.periodo,valor:detail.valor}),"utf8");
}
export function newEvidenceKeys():EvidenceKeys{return {mac:randomBytes(32),cipher:randomBytes(32)};}
export function hmacDetail(detail:AcademicDetail,key:Buffer):string{
  if(key.length!==32)throw Error("Clave HMAC inválida");
  return createHmac("sha256",key).update(canonicalDetail(detail)).digest("hex");
}
export function encryptDetail(detail:AcademicDetail,keys:EvidenceKeys,aad:string):EncryptedDetail{
  if(keys.cipher.length!==32||keys.mac.length!==32)throw Error("Claves inválidas");
  const nonce=randomBytes(12);
  const cipher=createCipheriv("aes-256-gcm",keys.cipher,nonce);
  cipher.setAAD(Buffer.from(aad,"utf8"));
  const payload=Buffer.concat([cipher.update(canonicalDetail(detail)),cipher.final()]);
  return {payload,nonce,tag:cipher.getAuthTag(),hmac:hmacDetail(detail,keys.mac)};
}
export function decryptDetail(encrypted:Pick<EncryptedDetail,"payload"|"nonce"|"tag">,key:Buffer,aad:string):AcademicDetail{
  if(key.length!==32)throw Error("Clave AES inválida");
  const decipher=createDecipheriv("aes-256-gcm",key,encrypted.nonce);
  decipher.setAAD(Buffer.from(aad,"utf8"));
  decipher.setAuthTag(encrypted.tag);
  const decoded=JSON.parse(Buffer.concat([decipher.update(encrypted.payload),decipher.final()]).toString("utf8"));
  if(decoded.schema!=="ppi-detail-v1")throw Error("Versión de detalle no admitida");
  const detail={tipo:decoded.tipo,anio:decoded.anio,periodo:decoded.periodo,valor:decoded.valor} as AcademicDetail;
  canonicalDetail(detail);
  return detail;
}
export function matchesEvidence(detail:AcademicDetail,key:Buffer,expected:string):boolean{
  if(!/^[a-f0-9]{64}$/.test(expected))return false;
  const actual=Buffer.from(hmacDetail(detail,key),"hex");
  return timingSafeEqual(actual,Buffer.from(expected,"hex"));
}
