import {NextRequest,NextResponse} from "next/server";
import {guard} from "@/server/http/api";
import {createExperiment} from "@/modules/experimentos/service";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 const denied=guard(req);if(denied)return denied;
 const body=await req.json().catch(()=>null);
 if(!body || typeof body.nombre!=="string" || !["A","B"].includes(body.estrategia)){
  return NextResponse.json({error:"Parámetros inválidos"},{status:400});
 }
 try{return NextResponse.json(await createExperiment(body.nombre,body.estrategia),{status:201});}
 catch{return NextResponse.json({error:"Operación no disponible"},{status:503});}
}
