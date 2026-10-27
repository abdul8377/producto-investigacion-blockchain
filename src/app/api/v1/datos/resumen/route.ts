import {NextRequest} from "next/server";
import type {RowDataPacket} from "mysql2";
import {sourceQuery} from "@/server/mysql/source";
import {guard,json,handleError} from "@/server/http/api";
export const runtime="nodejs";
export const dynamic="force-dynamic";
type Totals=RowDataPacket & {estudiantes:number;matriculas:number;asistencias:number;calificaciones:number};
export async function GET(request:NextRequest){
 const denied=guard(request);
 if(denied)return denied;
 try {
 const values=await sourceQuery<Totals>("SELECT (SELECT COUNT(*) FROM estudiantes) AS estudiantes, (SELECT COUNT(*) FROM matriculas) AS matriculas, (SELECT COUNT(*) FROM asistencias) AS asistencias, (SELECT COUNT(*) FROM calificaciones WHERE registrada=1) AS calificaciones");
 return json({total:values[0]});
 } catch(error) {return handleError(error);}
}
