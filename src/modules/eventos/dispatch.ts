import {createHash} from "node:crypto";
import type {RowDataPacket} from "mysql2";
import {experimentalPool,transaction} from "@/server/mysql/experimental";
import {submitEvent} from "@/server/fabric/gateway";
import {removeExperimentalDetail} from "@/modules/privacidad/cleanup";
import type {ChainEvent} from "./types";

type QueueItem=RowDataPacket&{registro_id:string;estado:string;payload_hash:string;evento_json:string|ChainEvent|null;fabric_tx_id:string|null};
export async function dispatchEvent(eventId:string){
 const [rows]=await experimentalPool().execute<QueueItem[]>(
  "SELECT registro_id,estado,payload_hash,evento_json,fabric_tx_id FROM operaciones WHERE evento_id=?",[eventId]);
 if(rows.length!==1)throw Error("Evento no encontrado");
 const op=rows[0];
 if(op.estado==="CONFIRMADO")return {eventId,recordId:op.registro_id,status:"CONFIRMADO",transactionId:op.fabric_tx_id};
 if(!op.evento_json)throw Error("Payload pendiente inexistente");
 const event=typeof op.evento_json==="string"?JSON.parse(op.evento_json) as ChainEvent:op.evento_json;
 if(createHash("sha256").update(JSON.stringify(event)).digest("hex")!==op.payload_hash)throw Error("Payload alterado");
 await experimentalPool().execute("UPDATE operaciones SET estado='ENVIANDO' WHERE evento_id=?",[eventId]);
 try{
  const result=await submitEvent(event);
  if(event.operation==="SUPRESION")await removeExperimentalDetail(event.recordId);
  const status=event.operation==="REVOCACION"?"REVOCADO":event.operation==="SUPRESION"?"SUPRIMIDO":"ACTIVO";
  await transaction(async conn=>{
   await conn.execute("UPDATE operaciones SET estado='CONFIRMADO',fabric_tx_id=?,error_codigo=NULL,evento_json=NULL WHERE evento_id=?",
    [result.transactionId,eventId]);
   await conn.execute("UPDATE registros SET version_actual=?,estado=? WHERE registro_id=?",
    [event.version,status,event.recordId]);
  });
  return {eventId,recordId:event.recordId,status:"CONFIRMADO",transactionId:result.transactionId};
 }catch{
  await experimentalPool().execute("UPDATE operaciones SET estado='ERROR',error_codigo='FABRIC_OR_DB' WHERE evento_id=? AND estado<>'CONFIRMADO'",[eventId]);
  return {eventId,recordId:op.registro_id,status:"PENDIENTE_CONCILIACION",transactionId:null};
 }
}
