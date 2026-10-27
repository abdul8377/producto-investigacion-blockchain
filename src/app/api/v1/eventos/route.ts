import {NextRequest} from "next/server";
import {guard,json} from "@/server/http/api";
import {stageEvent} from "@/modules/eventos/stage";
import {dispatchEvent} from "@/modules/eventos/dispatch";
import {safeDetail} from "@/modules/eventos/validation";
export const runtime="nodejs";
export async function POST(request:NextRequest){
 const denied=guard(request);if(denied)return denied;
 const origin=request.headers.get("origin");
 if(origin&&origin!==request.nextUrl.origin)return json({error:"Origen no autorizado"},403);
 const eventId=request.headers.get("idempotency-key");
 if(!eventId)return json({error:"Se requiere Idempotency-Key UUID v4"},400);
 const body=await request.json().catch(()=>null);
 if(!body||typeof body.experimentoId!=="string")return json({error:"Solicitud inválida"},400);
 try{
  const detail=safeDetail(body.detail);
  const queued=await stageEvent(body.experimentoId,eventId,detail);
  const result=await dispatchEvent(queued.eventId);
  return json({...result,reused:queued.reused},result.status==="CONFIRMADO"?201:202);
 }catch{return json({error:"Registro rechazado; comprueba los datos y la configuración"},400);}
}
