import {createHash} from "node:crypto";
import type {RowDataPacket} from "mysql2";
import {experimentalPool,transaction} from "@/server/mysql/experimental";
import {submitEvent} from "@/server/fabric/gateway";
import type {ChainEvent} from "./types";

type QueueItem=RowDataPacket&{registro_id:string;estado:string;payload_hash:string;evento_json:string|ChainEvent|null;estrategia:"A"|"B";fabric_tx_id:string|null};
export async function dispatchEvent(eventId:string){
 const [rows]=await experimentalPool().execute<QueueItem[]>(
  "SELECT o.registro_id,o.estado,o.payload_hash,o.evento_json,o.fabric_tx_id,r.estrategia FROM operaciones o JOIN registros r ON r.registro_id=o.registro_id WHERE o.evento_id=?",[eventId]);
 if(rows.length!==1)throw Error("Evento no encontrado");
 const op=rows[0];
 if(op.estado==="CONFIRMADO")return {eventId,recordId:op.registro_id,status:"CONFIRMADO",transactionId:op.fabric_tx_id};
 if(!op.evento_json)throw Error("Payload pendiente inexistente");
 const event=typeof op.evento_json==="string"?JSON.parse(op.evento_json) as ChainEvent:op.evento_json;
 const digest=createHash("sha256").update(JSON.stringify(event)).digest("hex");
 if(digest!==op.payload_hash)throw Error("Payload pendiente alterado");
 await experimentalPool().execute("UPDATE operaciones SET estado='ENVIANDO' WHERE evento_id=?",[eventId]);
 try {
  const result=await submitEvent(event);
  await transaction(async conn=>{
   await conn.execute("UPDATE operaciones SET estado='CONFIRMADO',fabric_tx_id=?,error_codigo=NULL,evento_json=CASE WHEN ?='A' THEN NULL ELSE evento_json END WHERE evento_id=?",
    [result.transactionId,op.estrategia,eventId]);
   await conn.execute("UPDATE registros SET version_actual=1,estado='ACTIVO' WHERE registro_id=?",
    [op.registro_id]);
  });
  return {eventId,recordId:op.registro_id,status:"CONFIRMADO",transactionId:result.transactionId};
 }catch{
  await experimentalPool().execute("UPDATE operaciones SET estado='ERROR',error_codigo='FABRIC_OR_DB' WHERE evento_id=? AND estado<>'CONFIRMADO'",[eventId]);
  return {eventId,recordId:op.registro_id,status:"PENDIENTE_CONCILIACION",transactionId:null};
 }
}
