import {NextRequest} from "next/server";
import {sourceQuery} from "@/server/mysql/source";
import {guard,json,handleError,parseLimit} from "@/server/http/api";
import type {RowDataPacket} from "mysql2";
export const runtime="nodejs";export const dynamic="force-dynamic";
type Student=RowDataPacket&{estudiante_id:string;anio:number;grado:string;seccion:string;estado:string};
type Count=RowDataPacket&{total:number};
export async function GET(request:NextRequest) {
 const denied=guard(request);if(denied)return denied;
 try{
 const p=request.nextUrl.searchParams;
 const anio=Number(p.get("anio")||"2026");
 if(![2024,2025,2026].includes(anio))throw Error("Invalid filter");
 const pagina=parseLimit(p.get("pagina"),1,10000);
 const limite=parseLimit(p.get("limite"),20,50);
 const buscar=(p.get("buscar")||"").toUpperCase();
 if(!/^[A-Z0-9-]{0,24}$/.test(buscar))throw Error("Invalid filter");
 const criteria=" WHERE m.anio=? AND m.estudiante_id LIKE ?";
 const parameters=[anio,"%"+buscar+"%"];
 const total=await sourceQuery<Count>("SELECT COUNT(*) AS total FROM matriculas m"+criteria,parameters);
 const items=await sourceQuery<Student>("SELECT m.estudiante_id,m.anio,s.grado,s.seccion,m.estado FROM matriculas m INNER JOIN secciones s ON s.seccion_id=m.seccion_id"+criteria+" ORDER BY m.estudiante_id LIMIT ? OFFSET ?",[...parameters,limite,(pagina-1)*limite]);
 return json({items,total:Number(total[0].total),pagina,limite});
 }catch(e){return handleError(e);}
}
