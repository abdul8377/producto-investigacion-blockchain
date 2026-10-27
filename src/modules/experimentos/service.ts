import {randomUUID} from "node:crypto";
import {experimentalPool,experimentalRows} from "@/server/mysql/experimental";
import type {RowDataPacket} from "mysql2";
type Experiment=RowDataPacket&{experimento_id:string;estrategia:"A"|"B";nombre:string;estado:string};
export async function createExperiment(name:string,strategy:"A"|"B"){
 if(typeof name!=="string"||name.length<4||name.length>120)throw Error("Nombre inválido");
 const id=randomUUID();
 await experimentalPool().execute("INSERT INTO experimentos (experimento_id,estrategia,nombre) VALUES (?,?,?)",[id,strategy,name]);
 return {experimentoId:id,estrategia:strategy,nombre:name,estado:"PREPARADO"};
}
export function listExperiments(){return experimentalRows<Experiment>("SELECT experimento_id,estrategia,nombre,estado FROM experimentos ORDER BY creado_en DESC LIMIT 100");}
