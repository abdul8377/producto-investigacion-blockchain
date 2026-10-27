import {NextRequest} from "next/server";
import {guard,json} from "@/server/http/api";
import {stageEvent} from "@/modules/eventos/stage";
import {dispatchEvent} from "@/modules/eventos/dispatch";
export const runtime="nodejs";
export async function POST(request:NextRequest){
 const denied=guard(request);if(denied)return denied;
 const origin=request.headers.get("origin");
 if(origin&&origin!==request.nextUrl.origin)return json({error:"Origen no autorizado"},403);
 const eventId=request.headers.get("idempotency-key");
 if(!eventId)return json({error:"Se requiere cabecera Idempotency-Key con UUID v4"},400);
 const body=await request.json().catch(()=>null);
 if(!body||typeof body.experimentoId!=="string"||!body.detail||
    typeof body.detail!=="object"||Array.isArray(body.detail))
  return json({error:"Solicitud de registro inválida"},400);
 try{
  const queued=await stageEvent(body.experimentoId,eventId,body.detail);
  const result=await dispatchEvent(queued.eventId);
  return json({...result,reused:queued.reused},result.status==="CONFIRMADO"?201:202);
 }catch{return json({error:"Registro no aceptado; comprueba datos, configuración y migraciones"},400);}
}
