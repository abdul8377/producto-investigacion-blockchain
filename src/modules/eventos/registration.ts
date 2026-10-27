import {randomUUID,createHash} from "node:crypto";
import type {RowDataPacket} from "mysql2";
import {canonicalDetail,type AcademicDetail} from "@/server/crypto/evidence";
import {experimentalPool} from "@/server/mysql/experimental";
import type {ChainEvent,Strategy} from "./types";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function prepareRegistration(experimentId:string,eventId:string,detail:AcademicDetail){
 if(!UUID.test(experimentId)||!UUID.test(eventId))throw Error("Identificador inválido");
 const fields=Object.keys(detail);
 if(fields.length!==4||fields.some(x=>!["tipo","anio","periodo","valor"].includes(x)))throw Error("Campos no permitidos");
 const payload=canonicalDetail(detail);
 const [rows]=await experimentalPool().execute<(RowDataPacket&{estrategia:Strategy;estado:string})[]>(
  "SELECT estrategia,estado FROM experimentos WHERE experimento_id=?",[experimentId]);
 if(rows.length!==1||!["PREPARADO","EJECUTANDO"].includes(rows[0].estado))throw Error("Experimento no disponible");
 const recordId=randomUUID(),strategy=rows[0].estrategia;
 const requestHash=createHash("sha256").update(experimentId).update(payload).digest("hex");
 const event:ChainEvent={eventId,recordId,strategy,operation:"REGISTRO",version:1,timestamp:new Date().toISOString()};
 return {event,requestHash,payload,detail};
}
