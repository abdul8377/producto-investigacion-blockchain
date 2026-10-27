import type {AcademicDetail} from "@/server/crypto/evidence";
export function safeDetail(raw:unknown):AcademicDetail{
 if(!raw||typeof raw!=="object"||Array.isArray(raw))throw Error("Detalle inválido");
 const data=raw as Record<string,unknown>;
 const keys=Object.keys(data);
 if(keys.length!==4||keys.some(k=>!["tipo","anio","periodo","valor"].includes(k)))
  throw Error("Se recibieron campos no autorizados");
 if(!["CALIFICACION","ASISTENCIA"].includes(String(data.tipo)))throw Error("Tipo inválido");
 if(!Number.isInteger(data.anio))throw Error("Año inválido");
 if(typeof data.valor!=="string")throw Error("Valor inválido");
 if(data.tipo==="CALIFICACION"&&!/^(AD|A|B|C|[0-9]|1[0-9]|20)$/.test(data.valor))
  throw Error("Calificación no admitida en ensayo");
 if(data.tipo==="ASISTENCIA"&&!["ASIST","FI","TI","PRM"].includes(data.valor))
  throw Error("Asistencia no admitida en ensayo");
 return {tipo:data.tipo as AcademicDetail["tipo"],anio:data.anio as number,
  periodo:data.periodo as AcademicDetail["periodo"],valor:data.valor};
}
