import type {RowDataPacket} from "mysql2";
import {deleteKeys} from "@/server/crypto/key-vault";
import {experimentalPool} from "@/server/mysql/experimental";
type VaultRef=RowDataPacket&{clave_referencia:string};
/** Retirada de la copia experimental B tras confirmar SUPRESION en Fabric. */
export async function removeExperimentalDetail(recordId:string){
 const [rows]=await experimentalPool().execute<VaultRef[]>(
  "SELECT clave_referencia FROM detalles_b WHERE registro_id=?",[recordId]);
 for(const item of rows)await deleteKeys(item.clave_referencia);
 await experimentalPool().execute("DELETE FROM detalles_b WHERE registro_id=?",[recordId]);
 // Los payloads pendientes/confirmados no deben conservar detalles del registro.
 await experimentalPool().execute(
  "UPDATE operaciones SET evento_json=NULL WHERE registro_id=? AND estado='CONFIRMADO'",[recordId]);
}
