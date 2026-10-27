import {createHmac,timingSafeEqual} from "node:crypto";
export const COOKIE="ppi_operator";
const secret=()=>process.env.LAB_SESSION_SECRET;
export function configured(){return !!secret()&&secret()!.length>=32&&!!process.env.LAB_OPERATOR_PASSWORD&&process.env.LAB_OPERATOR_PASSWORD.length>=12;}
function same(a:string,b:string){const x=Buffer.from(a);const y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export function verifyPassword(password:unknown){return configured()&&typeof password==="string"&&same(password,process.env.LAB_OPERATOR_PASSWORD!);}
export function signSession(){if(!configured())throw new Error("No configurado");const until=Date.now()+8*3600000;const data=String(until);return data+"."+createHmac("sha256",secret()!).update(data).digest("hex");}
export function sessionValid(token?:string){if(!configured()||!token)return false;const [until,mac,...extra]=token.split(".");if(extra.length||!/^\d{13}$/.test(until)||!mac||!/^[0-9a-f]{64}$/.test(mac))return false;if(Number(until)<Date.now()||Number(until)>Date.now()+8*3600000)return false;return same(mac,createHmac("sha256",secret()!).update(until).digest("hex"));}
