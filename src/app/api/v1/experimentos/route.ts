import {NextRequest,NextResponse} from "next/server";
import {guard} from "@/server/http/api";
import {listExperiments} from "@/modules/experimentos/service";
export const runtime="nodejs";
export async function GET(req:NextRequest){
 const denied=guard(req);if(denied)return denied;
 try{return NextResponse.json({items:await listExperiments()});}
 catch{return NextResponse.json({error:"No disponible"},{status:503});}
}
