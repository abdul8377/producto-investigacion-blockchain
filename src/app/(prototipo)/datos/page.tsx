import {cookies} from "next/headers";
import Link from "next/link";
import {redirect} from "next/navigation";
import {COOKIE,sessionValid} from "@/server/auth/session";
import {sourceQuery} from "@/server/mysql/source";
import type {RowDataPacket} from "mysql2";
export const dynamic="force-dynamic";
type Total=RowDataPacket&{estudiantes:number;matriculas:number;asistencias:number;calificaciones:number};
export default async function Datos(){
 if(!sessionValid((await cookies()).get(COOKIE)?.value))redirect("/acceso");
 let total:Total|undefined;let error=false;
 try{total=(await sourceQuery<Total>("SELECT (SELECT COUNT(*) FROM estudiantes) estudiantes,(SELECT COUNT(*) FROM matriculas) matriculas,(SELECT COUNT(*) FROM asistencias) asistencias,(SELECT COUNT(*) FROM calificaciones WHERE registrada=1) calificaciones"))[0];}
 catch{error=true;}
 return <main className="data-page"><Link href="/">← BlockLab</Link><span className="eyebrow">DATOS Y COBERTURA</span><h1>Origen académico seudonimizado</h1><p>Lectura desde MySQL. No se importan ni modifican datos institucionales.</p>
 {error?<div className="notice">La base de origen no está configurada o no responde. Comprueba las variables de entorno y el usuario de solo lectura.</div>:<div className="data-grid">{Object.entries(total||{}).map(([label,value])=><article className="data-kpi" key={label}><strong>{Number(value).toLocaleString("es-PE")}</strong><span>{label.replaceAll("_"," ")}</span></article>)}</div>}
 <p className="data-footnote">Calificaciones: únicamente filas marcadas registrada = 1. La disponibilidad histórica depende del origen importado.</p>
 </main>;
}
