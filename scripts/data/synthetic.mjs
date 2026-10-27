// Generador reproducible sin estudiantes reales ni identificadores de origen.
import {createHash} from "node:crypto";
function code(index){return "SYN-"+createHash("sha256").update("ppi-demo-2026-"+index).digest("hex").slice(0,12).toUpperCase();}
const grades=["AD","A","B","C"];
const attendance=["ASIST","ASIST","ASIST","FI","TI"];
const rows=Array.from({length:32},(_,i)=>({
 id:code(i),anio:2026,tipo:i%2===0?"CALIFICACION":"ASISTENCIA",
 periodo:i%2===0?1+(i%4):"2026-08-"+String(1+i%27).padStart(2,"0"),
 valor:i%2===0?grades[i%grades.length]:attendance[i%attendance.length],
 origen:"SINTETICO"
}));
process.stdout.write(JSON.stringify({schema:"ppi-synthetic-v1",ficticio:true,records:rows},null,2)+"\n");
