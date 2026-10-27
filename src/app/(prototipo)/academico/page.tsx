import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {COOKIE,sessionValid} from "@/server/auth/session";
import Link from "next/link";
export default async function Page(){
 const session=(await cookies()).get(COOKIE)?.value;
 if(!sessionValid(session))redirect("/acceso");
 return <main className="data-page"><Link href="/datos">← Datos</Link><h1>Consulta académica</h1><p>Las consultas paginadas están disponibles mediante la API para operadores autenticados.</p><p>Rutas: /api/v1/academico/estudiantes, /api/v1/academico/calificaciones y /api/v1/academico/asistencias.</p><p>La visualización tabular se incorporará en la siguiente iteración.</p></main>;
}
