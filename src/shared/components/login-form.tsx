"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
export function LoginForm(){
 const router=useRouter(),[password,setPassword]=useState(""),[error,setError]=useState(""),[working,setWorking]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setWorking(true);setError("");
 try{const response=await fetch("/api/v1/autenticacion/sesion",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});const data=await response.json();if(!response.ok){setError(data.error);return;}router.push("/datos");router.refresh();}catch{setError("Sin conexión");}finally{setWorking(false);}}
 return <form className="access-form" onSubmit={submit}><label htmlFor="pass">Contraseña del operador</label><input type="password" id="pass" value={password} onChange={e=>setPassword(e.target.value)} required/>{error&&<p role="alert" className="error-msg">{error}</p>}<button disabled={working}>{working?"Ingresando...":"Ingresar"}</button></form>;
}
