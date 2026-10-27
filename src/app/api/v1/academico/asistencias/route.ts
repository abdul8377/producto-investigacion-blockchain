import {NextRequest} from "next/server";
import type {RowDataPacket} from "mysql2";
import {sourceQuery} from "@/server/mysql/source";
import {guard,json,handleError,parseLimit} from "@/server/http/api";
export const runtime="nodejs";export const dynamic="force-dynamic";
type Attendance=RowDataPacket&{estudiante_id:string;fecha:string;estado:string;estado_codigo:string;grado:string;seccion:string};
type Count=RowDataPacket&{total:number};
export async function GET(request:NextRequest){
 const denied=guard(request);if(denied)return denied;
 try{
 const p=request.nextUrl.searchParams;
 const anio=Number(p.get("anio")||2026);
 if(![2024,2025,2026].includes(anio))throw Error("Invalid filter");
 const pagina=parseLimit(p.get("pagina"),1,10000),limite=parseLimit(p.get("limite"),20,50);
 const estudiante=(p.get("estudianteId")||"").toUpperCase();
 if(estudiante&&!/^EST-[0-9A-F]{20}$/.test(estudiante))throw Error("Invalid filter");
 const constraints=["a.anio=?"],params:unknown[]=[anio];
 if(estudiante){constraints.push("a.estudiante_id=?");params.push(estudiante);}
 const where=" WHERE "+constraints.join(" AND ");
 const count=await sourceQuery<Count>("SELECT COUNT(*) AS total FROM asistencias a"+where,params);
 const items=await sourceQuery<Attendance>("SELECT a.estudiante_id,a.fecha,a.estado,a.estado_codigo,s.grado,s.seccion FROM asistencias a JOIN secciones s ON s.seccion_id=a.seccion_id"+where+" ORDER BY a.fecha DESC,a.estudiante_id LIMIT ? OFFSET ?",[...params,limite,(pagina-1)*limite]);
 return json({items,total:Number(count[0].total),pagina,limite,anio});
 }catch(error){return handleError(error);}
}
