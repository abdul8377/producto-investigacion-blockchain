import {NextRequest} from "next/server";
import type {RowDataPacket} from "mysql2";
import {sourceQuery} from "@/server/mysql/source";
import {guard,json,handleError,parseLimit} from "@/server/http/api";
export const runtime="nodejs";export const dynamic="force-dynamic";
type Grade=RowDataPacket&{estudiante_id:string;asignatura:string;periodo:number;valor_fuente:string|null;registrada:number};
type Count=RowDataPacket&{total:number};
export async function GET(request:NextRequest){
 const denied=guard(request);if(denied)return denied;
 try{
 const filters=request.nextUrl.searchParams;
 const pagina=parseLimit(filters.get("pagina"),1,10000),limite=parseLimit(filters.get("limite"),20,50);
 const id=(filters.get("estudianteId")||"").toUpperCase();
 if(id&&!/^EST-[0-9A-F]{20}$/.test(id))throw Error("Invalid filter");
 const onlyRegistered=filters.get("todas")!=="1";
 const sqlFrom=" FROM calificaciones c INNER JOIN ofertas o ON c.oferta_id=o.oferta_id INNER JOIN asignaturas a ON a.asignatura_id=o.asignatura_id INNER JOIN periodos p ON p.periodo_id=c.periodo_id";
 const filtersSql=["c.anio=2026"],params:unknown[]=[];
 if(onlyRegistered)filtersSql.push("c.registrada=1");
 if(id){filtersSql.push("c.estudiante_id=?");params.push(id);}
 const where=" WHERE "+filtersSql.join(" AND ");
 const count=await sourceQuery<Count>("SELECT COUNT(*) AS total"+sqlFrom+where,params);
 const items=await sourceQuery<Grade>("SELECT c.estudiante_id,a.nombre AS asignatura,p.numero AS periodo,c.valor_fuente,c.registrada"+sqlFrom+where+" ORDER BY c.estudiante_id,a.nombre,p.numero LIMIT ? OFFSET ?",[...params,limite,(pagina-1)*limite]);
 return json({items,total:Number(count[0].total),pagina,limite,anio:2026});
 }catch(error){return handleError(error);}
}
