import {createHash} from "node:crypto";
import type {ResultSetHeader,RowDataPacket} from "mysql2";
import {experimentalPool,transaction} from "@/server/mysql/experimental";
import {evaluateEvent,submitEvent} from "@/server/fabric/gateway";
import {removeExperimentalDetail} from "@/modules/privacidad/cleanup";
import type {ChainEvent} from "./types";

type QueueItem=RowDataPacket&{
 registro_id:string;estado:string;payload_hash:string;
 evento_json:string|ChainEvent|null;fabric_tx_id:string|null;
};
type DispatchResult={eventId:string;recordId:string;status:string;transactionId:string|null};

async function ledgerContains(event:ChainEvent):Promise<boolean>{
 try{
  const actual=await evaluateEvent(event.eventId) as ChainEvent;
  // Normalización explícita: no se acepta un evento con el mismo ID y otro contenido.
  const sorted=(obj:unknown):string=>JSON.stringify(obj,(_,value)=>{
   if(value && typeof value==="object" && !Array.isArray(value)){
    return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)));
   }
   return value;
  });
  if(sorted(actual)!==sorted(event))throw Error("EVENT_CONFLICT: contenido del ledger diferente");
  return true;
 }catch(error){
  if(error instanceof Error && error.message.startsWith("EVENT_CONFLICT"))throw error;
  // Una falla de consulta no demuestra que el evento esté ausente.
  return false;
 }
}

export async function dispatchEvent(eventId:string):Promise<DispatchResult>{
 const [rows]=await experimentalPool().execute<QueueItem[]>(
  "SELECT registro_id,estado,payload_hash,evento_json,fabric_tx_id FROM operaciones WHERE evento_id=?",
  [eventId]);
 if(rows.length!==1)throw Error("Evento no encontrado");
 const row=rows[0];
 if(row.estado==="CONFIRMADO")return {
  eventId,recordId:row.registro_id,status:"CONFIRMADO",transactionId:row.fabric_tx_id
 };
 if(!row.evento_json)throw Error("Falta el evento pendiente");
 const event=typeof row.evento_json==="string"?JSON.parse(row.evento_json) as ChainEvent:row.evento_json;
 if(createHash("sha256").update(JSON.stringify(event)).digest("hex")!==row.payload_hash)
  throw Error("Payload pendiente alterado");

 // Solo un trabajador reclama el evento. Un ENVIANDO abandonado se puede retomar tras 2 minutos.
 const [claim]=await experimentalPool().execute<ResultSetHeader>(
  `UPDATE operaciones SET estado='ENVIANDO',error_codigo=NULL
   WHERE evento_id=? AND (estado IN ('PENDIENTE','ERROR')
    OR (estado='ENVIANDO' AND actualizado_en < CURRENT_TIMESTAMP(3)-INTERVAL 2 MINUTE))`,
  [eventId]);
 if(claim.affectedRows===0){
  return {eventId,recordId:row.registro_id,status:"EN_PROCESO",transactionId:null};
 }

 try{
  // Si Fabric confirmó antes de que cayera MySQL, se reconstruye el resultado sin
  // volver a enviar una nueva operación lógica.
  let transactionId:string|null=null;
  if(!(await ledgerContains(event))){
   const sent=await submitEvent(event);
   transactionId=sent.transactionId;
  }
  // El historial previo de B puede seguir almacenado incluso si se perdió la respuesta
  // de Fabric. Repetir la retirada es idempotente para la copia activa.
  if(event.operation==="SUPRESION")await removeExperimentalDetail(event.recordId);
  const newState=event.operation==="REVOCACION"?"REVOCADO":
   event.operation==="SUPRESION"?"SUPRIMIDO":"ACTIVO";
  await transaction(async conn=>{
   const [update]=await conn.execute<ResultSetHeader>(
    "UPDATE operaciones SET estado='CONFIRMADO',fabric_tx_id=COALESCE(?,fabric_tx_id),error_codigo=NULL,evento_json=NULL WHERE evento_id=? AND estado='ENVIANDO'",
    [transactionId,eventId]);
   if(update.affectedRows!==1)throw Error("Se perdió la posesión del evento");
   await conn.execute(
    "UPDATE registros SET version_actual=?,estado=? WHERE registro_id=?",
    [event.version,newState,event.recordId]);
  });
  return {eventId,recordId:event.recordId,status:"CONFIRMADO",transactionId};
 }catch(error){
  console.error("[dispatch] pendiente para conciliación",eventId,
   error instanceof Error?error.name:"unknown");
  await experimentalPool().execute(
   "UPDATE operaciones SET estado='ERROR',error_codigo='REQUIERE_CONCILIACION' WHERE evento_id=? AND estado='ENVIANDO'",
   [eventId]);
  return {eventId,recordId:row.registro_id,status:"PENDIENTE_CONCILIACION",transactionId:null};
 }
}
