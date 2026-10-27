import mysql,{type Pool,type PoolConnection,type RowDataPacket} from "mysql2/promise";

let pool:Pool|undefined;
export function experimentalPool():Pool{
 if(!pool){
  const e=process.env;
  if(!e.MYSQL_EXPERIMENTAL_HOST||!e.MYSQL_EXPERIMENTAL_USER||
     e.MYSQL_EXPERIMENTAL_PASSWORD===undefined||
     e.MYSQL_EXPERIMENTAL_DATABASE!=="investigacion_experimental")
    throw Error("Laboratorio MySQL no configurado");
  const port=Number(e.MYSQL_EXPERIMENTAL_PORT||3306);
  if(!Number.isInteger(port)||port<1||port>65535)throw Error("Puerto MySQL inválido");
  pool=mysql.createPool({host:e.MYSQL_EXPERIMENTAL_HOST,user:e.MYSQL_EXPERIMENTAL_USER,
    password:e.MYSQL_EXPERIMENTAL_PASSWORD,database:e.MYSQL_EXPERIMENTAL_DATABASE,
    port,connectionLimit:8,waitForConnections:true,queueLimit:50,multipleStatements:false,dateStrings:true});
 }
 return pool;
}
export async function transaction<T>(fn:(conn:PoolConnection)=>Promise<T>):Promise<T>{
 const conn=await experimentalPool().getConnection();
 try{await conn.beginTransaction();const result=await fn(conn);await conn.commit();return result;}
 catch(e){await conn.rollback();throw e;}finally{conn.release();}
}
export async function experimentalRows<T extends RowDataPacket>(sql:string,params:unknown[]=[]):Promise<T[]>{
 if(!/^SELECT\s/i.test(sql)||sql.includes(";"))throw Error("Solo SELECT permitido en consulta de laboratorio");
 const [rows]=await experimentalPool().execute<RowDataPacket[]>(sql,params as (string|number|boolean|null)[]);
 return rows as T[];
}
