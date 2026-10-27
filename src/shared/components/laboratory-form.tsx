"use client";
import {useState} from "react";
export function LaboratoryForm(){
 const [strategy,setStrategy]=useState<"A"|"B">("B");
 const [type,setType]=useState<"CALIFICACION"|"ASISTENCIA">("CALIFICACION");
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 async function submit(){
  setBusy(true);setMessage("");
  try{
   const experiment=await fetch("/api/v1/experimentos/crear",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({nombre:"Ensayo sintetico "+new Date().toISOString().slice(0,19),estrategia:strategy})
   });
   const first=await experiment.json();
   if(!experiment.ok)throw Error(first.error||"No se pudo crear experimento");
   const detail=type==="CALIFICACION"
    ?{tipo:"CALIFICACION",anio:2026,periodo:2,valor:"AD"}
    :{tipo:"ASISTENCIA",anio:2026,periodo:"2026-08-14",valor:"ASIST"};
   const result=await fetch("/api/v1/eventos",{
    method:"POST",headers:{"Content-Type":"application/json","Idempotency-Key":crypto.randomUUID()},
    body:JSON.stringify({experimentoId:first.experimentoId,detail})
   });
   const second=await result.json();
   if(!result.ok)throw Error(second.error||"No se pudo registrar evento");
   setMessage("Operación: "+second.status+" · Evento: "+second.eventId);
  }catch(e){setMessage(e instanceof Error?e.message:"Error desconocido");}
  finally{setBusy(false);}
 }
 return <section className="lab-form"><label>Estrategia experimental
 <select value={strategy} onChange={e=>setStrategy(e.target.value as "A"|"B")}><option value="A">A · Referencia on-chain</option><option value="B">B · Híbrida</option></select></label>
 <label>Dato sintético
 <select value={type} onChange={e=>setType(e.target.value as "CALIFICACION"|"ASISTENCIA")}><option value="CALIFICACION">Calificación: AD, 2.º periodo 2026</option><option value="ASISTENCIA">Asistencia: ASIST, 14/08/2026</option></select></label>
 <button onClick={submit} disabled={busy}>{busy?"Preparando evento...":"Registrar evento ficticio"}</button>
 <p role="status">{message}</p>
 <small>Una operación pendiente no equivale a confirmación blockchain. El estado CONFIRMADO requiere un commit válido.</small>
 </section>;
}
