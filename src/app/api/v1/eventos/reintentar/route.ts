import {NextRequest} from "next/server";
import {guard,json} from "@/server/http/api";
import {dispatchEvent} from "@/modules/eventos/dispatch";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 const denied=guard(req);if(denied)return denied;
 const origin=req.headers.get("origin");if(origin&&origin!==req.nextUrl.origin)return json({error:"Origen inválido"},403);
 const body=await req.json().catch(()=>null);
 if(!body||typeof body.eventId!=="string"||!/^[0-9a-f-]{36}$/i.test(body.eventId))
  return json({error:"Identificador inválido"},400);
 try{
  const result=await dispatchEvent(body.eventId);
  return json(result,result.status==="CONFIRMADO"?200:202);
 }catch{return json({error:"No se pudo conciliar el evento"},503);}
}
