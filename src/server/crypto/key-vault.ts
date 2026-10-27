import {mkdir,open,readFile,unlink} from "node:fs/promises";
import {isAbsolute,join,relative,resolve} from "node:path";
import type {EvidenceKeys} from "./evidence";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function keyPath(eventId:string):string{
 if(!UUID.test(eventId))throw Error("Identificador de evento inválido");
 const dir=process.env.LAB_KEYS_DIR;
 if(!dir||!isAbsolute(dir))throw Error("LAB_KEYS_DIR debe ser absoluta");
 const directory=resolve(dir),cwd=resolve(process.cwd()),rel=relative(cwd,directory);
 if(!rel.startsWith("..")&&rel!==".." )throw Error("LAB_KEYS_DIR no debe estar dentro del proyecto");
 return join(directory,eventId+".json");
}
export async function saveKeys(eventId:string,keys:EvidenceKeys):Promise<void>{
 const path=keyPath(eventId);
 await mkdir(resolve(path,".."),{recursive:true,mode:0o700});
 const file=await open(path,"wx",0o600);
 try{await file.writeFile(JSON.stringify({mac:keys.mac.toString("base64"),cipher:keys.cipher.toString("base64")}));}
 finally{await file.close();}
}
export async function loadKeys(eventId:string):Promise<EvidenceKeys>{
 const value=JSON.parse(await readFile(keyPath(eventId),"utf8"));
 if(typeof value.mac!=="string"||typeof value.cipher!=="string")throw Error("Claves inválidas");
 const keys={mac:Buffer.from(value.mac,"base64"),cipher:Buffer.from(value.cipher,"base64")};
 if(keys.mac.length!==32||keys.cipher.length!==32)throw Error("Claves inválidas");
 return keys;
}
/** Borra la copia activa; no garantiza borrado físico en SSD ni respaldos. */
export async function deleteKeys(eventId:string):Promise<void>{
 try{await unlink(keyPath(eventId));}
 catch(e){if((e as NodeJS.ErrnoException).code!=="ENOENT")throw e;}
}
