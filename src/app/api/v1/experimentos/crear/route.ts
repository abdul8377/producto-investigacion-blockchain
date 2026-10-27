import {NextRequest,NextResponse} from "next/server";
import {guard} from "@/server/http/api";
import {createExperiment} from "@/modules/experimentos/service";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 const denied=guard(req);if(denied)return denied;
 const origin=req.headers.get("origin");
 if(origin && origin!==req.nextUrl.origin)
   return NextResponse.json({error:"Origen no autorizado"},{status:403});
 const body=await req.json().catch(()=>null);
 if(!body || typeof body.nombre!=="string" ||
    !["A","B"].includes(body.estrategia))
   return NextResponse.json({error:"Parámetros inválidos"},{status:400});
 try{
   const created=await createExperiment(body.nombre,body.estrategia);
   return NextResponse.json(created,{status:201,headers:{"Cache-Control":"no-store"}});
 }catch{
   return NextResponse.json({error:"No se pudo crear el experimento"},{status:503});
 }
}
