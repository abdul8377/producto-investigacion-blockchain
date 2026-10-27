import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {COOKIE,sessionValid} from "@/server/auth/session";
import {LaboratoryForm} from "@/shared/components/laboratory-form";
export default async function Laboratory(){
 if(!sessionValid((await cookies()).get(COOKIE)?.value))redirect("/acceso");
 return <main className="data-page"><span className="eyebrow">OPERACIONES DE LABORATORIO</span><h1>Registrar evidencia experimental</h1><p>Utiliza únicamente valores ficticios. La estrategia A lleva el detalle a Fabric; la B almacena el detalle cifrado en MySQL y un HMAC en Fabric.</p><LaboratoryForm/></main>;
}
