import {createHash} from "node:crypto";
import type {RowDataPacket} from "mysql2";
import {canonicalDetail,encryptDetail,newEvidenceKeys,type AcademicDetail} from "@/server/crypto/evidence";
import {saveKeys,deleteKeys} from "@/server/crypto/key-vault";
import {experimentalPool,transaction} from "@/server/mysql/experimental";
import type {ChainEvent,Operation} from "./types";
type RecordState=RowDataPacket&{estrategia:"A"|"B";version_actual:number;estado:string};
type Prior=RowDataPacket&{evento_id:string};
export async function stageChange(recordId:string,eventId:string,expectedVersion:number,operation:Operation,detail?:AcademicDetail){
 if(!/^[0-9a-f-]{36}$/i.test(recordId)||!/^[0-9a-f-]{36}$/i.test(eventId))throw Error("UUID inválido");
 if(!Number.isSafeInteger(expectedVersion)||expectedVersion<1)throw Error("Versión inválida");
 if(!["RECTIFICACION","REVOCACION","SUPRESION"].includes(operation))throw Error("Operación inválida");
 const carries=operation==="RECTIFICACION";
 if(carries!==Boolean(detail))throw Error("Detalle incompatible con la operación");
 if(detail)canonicalDetail(detail);
 const requestHash=createHash("sha256").update(JSON.stringify({recordId,expectedVersion,operation,detail})).digest("hex");
 const [old]=await experimentalPool().execute<(RowDataPacket&{request_hash:string;registro_id:string;estado:string})[]>(
  "SELECT request_hash,registro_id,estado FROM operaciones WHERE evento_id=?",[eventId]);
 if(old.length){
  if(old[0].request_hash!==requestHash)throw Error("Evento duplicado con otra solicitud");
  return {eventId,recordId,status:old[0].estado,reused:true};
 }
 const [records]=await experimentalPool().execute<RecordState[]>(
  "SELECT estrategia,version_actual,estado FROM registros WHERE registro_id=?",[recordId]);
 if(records.length!==1||records[0].estado!=="ACTIVO"||records[0].version_actual!==expectedVersion)throw Error("Conflicto de versión");
 const strategy=records[0].estrategia;
 if(operation==="SUPRESION"&&strategy!=="B")throw Error("Solo la estrategia B permite supresión");
 const [previous]=await experimentalPool().execute<Prior[]>(
  "SELECT evento_id FROM operaciones WHERE registro_id=? AND version=? AND estado='CONFIRMADO'",[recordId,expectedVersion]);
 if(previous.length!==1)throw Error("Versión previa no confirmada");
 const event:ChainEvent={eventId,recordId,strategy,operation,version:expectedVersion+1,
  timestamp:new Date().toISOString(),previousEventId:previous[0].evento_id};
 let encrypted:ReturnType<typeof encryptDetail>|undefined,hasKeys=false;
 if(detail&&strategy==="A")event.detail=detail;
 if(detail&&strategy==="B"){
  const keys=newEvidenceKeys();encrypted=encryptDetail(detail,keys,recordId+":"+eventId+":"+event.version);
  event.hmac=encrypted.hmac;await saveKeys(eventId,keys);hasKeys=true;
 }
 try{
  await transaction(async conn=>{
   const [locked]=await conn.execute<RecordState[]>("SELECT version_actual,estado FROM registros WHERE registro_id=? FOR UPDATE",[recordId]);
   if(locked.length!==1||locked[0].estado!=="ACTIVO"||locked[0].version_actual!==expectedVersion)throw Error("Conflicto de versión");
   const json=JSON.stringify(event);
   await conn.execute("INSERT INTO operaciones (evento_id,registro_id,version,operacion,payload_hash,request_hash,evento_json) VALUES (?,?,?,?,?,?,?)",
    [eventId,recordId,event.version,operation,createHash("sha256").update(json).digest("hex"),requestHash,json]);
   if(encrypted)await conn.execute("INSERT INTO detalles_b (evento_id,registro_id,payload_cifrado,nonce,etiqueta,clave_referencia) VALUES (?,?,?,?,?,?)",
    [eventId,recordId,encrypted.payload,encrypted.nonce,encrypted.tag,eventId]);
  });
 }catch(error){if(hasKeys)await deleteKeys(eventId);throw error;}
 return {eventId,recordId,status:"PENDIENTE",reused:false};
}
