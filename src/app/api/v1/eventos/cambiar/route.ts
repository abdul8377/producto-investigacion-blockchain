import {NextRequest} from "next/server";
import {guard,json} from "@/server/http/api";
import {stageChange} from "@/modules/eventos/changes";
import {dispatchEvent} from "@/modules/eventos/dispatch";
import {safeDetail} from "@/modules/eventos/validation";
export const runtime="nodejs";
export async function POST(request:NextRequest){
 const denied=guard(request);if(denied)return denied;
 const origin=request.headers.get("origin");
 if(origin&&origin!==request.nextUrl.origin)return json({error:"Origen no permitido"},403);
 const eventId=request.headers.get("idempotency-key");
 if(!eventId)return json({error:"Se requiere Idempotency-Key UUID v4"},400);
 const body=await request.json().catch(()=>null);
 if(!body||typeof body.recordId!=="string"||typeof body.expectedVersion!=="number"||
    !["RECTIFICACION","REVOCACION","SUPRESION"].includes(body.operation))
  return json({error:"Cambio inválido"},400);
 try{
  if(body.operation!=="RECTIFICACION"&&body.detail!==undefined)throw Error("Detalle no permitido");
  const detail=body.operation==="RECTIFICACION"?safeDetail(body.detail):undefined;
  const staged=await stageChange(body.recordId,eventId,body.expectedVersion,body.operation,detail);
  const outcome=await dispatchEvent(staged.eventId);
  return json({...outcome,reused:staged.reused},outcome.status==="CONFIRMADO"?200:202);
 }catch{return json({error:"Cambio rechazado; revisa versión, estado y estrategia"},409);}
}
