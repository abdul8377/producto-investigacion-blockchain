import mysql,{type Pool,type RowDataPacket} from "mysql2/promise";

let pool:Pool|undefined;
function config(){
 const env=process.env;
 if(env.MYSQL_SOURCE_DATABASE!=="investigacion_peruschool" ||
    !env.MYSQL_SOURCE_HOST || !env.MYSQL_SOURCE_USER ||
    env.MYSQL_SOURCE_PASSWORD===undefined)throw Error("SOURCE_NOT_CONFIGURED");
 const port=Number(env.MYSQL_SOURCE_PORT||3306);
 if(!Number.isInteger(port)||port<1||port>65535)throw Error("SOURCE_NOT_CONFIGURED");
 return {host:env.MYSQL_SOURCE_HOST,user:env.MYSQL_SOURCE_USER,
  password:env.MYSQL_SOURCE_PASSWORD,database:env.MYSQL_SOURCE_DATABASE,port};
}
export function sourcePool():Pool{
 if(!pool)pool=mysql.createPool({...config(),connectionLimit:5,
  multipleStatements:false,dateStrings:true,queueLimit:30,waitForConnections:true});
 return pool;
}
export async function sourceQuery<T extends RowDataPacket>(sql:string,values:unknown[]=[]):Promise<T[]>{
 if(!/^\s*SELECT\b/i.test(sql)||sql.includes(";"))throw Error("Consulta no permitida: solo SELECT");
 const [data]=await sourcePool().execute<RowDataPacket[]>(sql,values as (string|number|boolean|null)[]);
 return data as T[];
}
