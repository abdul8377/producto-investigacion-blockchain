import {NextRequest} from "next/server";
import {guard,json} from "@/server/http/api";
import {evaluateRecord} from "@/server/fabric/gateway";
export const runtime="nodejs";
export async function GET(request:NextRequest,context:{params:Promise<{recordId:string}>}){
 const denied=guard(request);if(denied)return denied;
 const {recordId}=await context.params;
 if(!/^[0-9a-f-]{36}$/i.test(recordId))return json({error:"ID inválido"},400);
 try{return json({record:await evaluateRecord(recordId)});}
 catch{return json({error:"Registro no disponible en Fabric"},503);}
}
