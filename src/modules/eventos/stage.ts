import {createHash} from "node:crypto";
import type {RowDataPacket} from "mysql2";
import {canonicalDetail,encryptDetail,newEvidenceKeys,type AcademicDetail} from "@/server/crypto/evidence";
import {saveKeys,deleteKeys} from "@/server/crypto/key-vault";
import {experimentalPool,transaction} from "@/server/mysql/experimental";
import {prepareRegistration} from "./registration";

type Operation=RowDataPacket&{registro_id:string;estado:string;request_hash:string};
export async function stageEvent(experimentId:string,eventId:string,detail:AcademicDetail){
 const requestHash=createHash("sha256").update(experimentId).update(canonicalDetail(detail)).digest("hex");
 const existing=async()=>{
  const [rows]=await experimentalPool().execute<Operation[]>(
   "SELECT registro_id,estado,request_hash FROM operaciones WHERE evento_id=?",[eventId]);
  if(!rows.length)return null;
  if(rows[0].request_hash!==requestHash)throw Error("Identificador reutilizado con otro contenido");
  return {eventId,recordId:rows[0].registro_id,status:rows[0].estado,reused:true};
 };
 const found=await existing();if(found)return found;
 const {event}=await prepareRegistration(experimentId,eventId,detail);
 let encrypted:ReturnType<typeof encryptDetail>|undefined,hasKeys=false;
 if(event.strategy==="A")event.detail=detail;
 else{
  const keys=newEvidenceKeys();
  encrypted=encryptDetail(detail,keys,event.recordId+":"+eventId+":1");
  event.hmac=encrypted.hmac;
  await saveKeys(eventId,keys);hasKeys=true;
 }
 const serial=JSON.stringify(event);
 const hash=createHash("sha256").update(serial).digest("hex");
 try{
  await transaction(async conn=>{
   await conn.execute("INSERT INTO registros (registro_id,experimento_id,estrategia) VALUES (?,?,?)",
    [event.recordId,experimentId,event.strategy]);
   await conn.execute("INSERT INTO operaciones (evento_id,registro_id,version,operacion,payload_hash,request_hash,evento_json) VALUES (?,?,1,'REGISTRO',?,?,?)",
    [eventId,event.recordId,hash,requestHash,serial]);
   if(encrypted)await conn.execute(
    "INSERT INTO detalles_b (evento_id,registro_id,payload_cifrado,nonce,etiqueta,clave_referencia) VALUES (?,?,?,?,?,?)",
    [eventId,event.recordId,encrypted.payload,encrypted.nonce,encrypted.tag,eventId]);
   await conn.execute("UPDATE experimentos SET estado='EJECUTANDO' WHERE experimento_id=?",[experimentId]);
  });
 }catch(error){
  if(hasKeys)await deleteKeys(eventId);
  const other=await existing();if(other)return other;
  throw error;
 }
 return {eventId,recordId:event.recordId,status:"PENDIENTE",reused:false};
}
