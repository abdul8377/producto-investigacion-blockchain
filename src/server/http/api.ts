import {NextRequest,NextResponse} from "next/server";
import {COOKIE,sessionValid} from "@/server/auth/session";
export const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
export const reject=(message:string,status:number)=>json({error:message},status);
export function guard(req:NextRequest){return sessionValid(req.cookies.get(COOKIE)?.value)?null:reject("Sesión de operador requerida",401);}
export function parseLimit(raw:string|null,defaultValue:number,max:number){if(raw===null)return defaultValue;if(!/^\d{1,5}$/.test(raw))throw Error("Invalid filter");const n=Number(raw);if(n<1||n>max)throw Error("Invalid filter");return n;}
export function handleError(e:unknown){if(e instanceof Error&&e.message==="Invalid filter")return reject("Filtros inválidos",400);console.error("Error de consulta",e instanceof Error?e.name:"unknown");return reject("Origen no disponible o no configurado",503);}
