import {NextRequest,NextResponse} from "next/server";
import {COOKIE,configured,sessionValid,signSession,verifyPassword} from "@/server/auth/session";
export const runtime="nodejs";
export async function GET(request:NextRequest){return NextResponse.json({authenticated:sessionValid(request.cookies.get(COOKIE)?.value),configured:configured()});}
export async function POST(request:NextRequest){
  if(!configured())return NextResponse.json({error:"Configura operador"},{status:503});
  const origin=request.headers.get("origin");
  if(origin && origin!==request.nextUrl.origin)return NextResponse.json({error:"Origen inválido"},{status:403});
  const input=await request.json().catch(()=>null);
  if(!verifyPassword(input?.password))return NextResponse.json({error:"Acceso denegado"},{status:401});
  const response=NextResponse.json({authenticated:true});
  response.cookies.set(COOKIE,signSession(),{httpOnly:true,sameSite:"strict",secure:process.env.NODE_ENV==="production",maxAge:28800,path:"/"});
  return response;
}
