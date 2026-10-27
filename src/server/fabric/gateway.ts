import * as grpc from "@grpc/grpc-js";
import {connect,signers} from "@hyperledger/fabric-gateway";
import {createPrivateKey} from "node:crypto";
import {readFile} from "node:fs/promises";
import type {ChainEvent} from "@/modules/eventos/types";

function need(name:string):string{
 const value=process.env[name];if(!value)throw Error("Falta configuración Fabric: "+name);return value;
}
async function withContract<T>(action:(contract:ReturnType<ReturnType<ReturnType<typeof connect>["getNetwork"]>["getContract"]>)=>Promise<T>):Promise<T>{
 const tls=await readFile(need("FABRIC_TLS_CERT_PATH"));
 const identity=await readFile(need("FABRIC_IDENTITY_CERT_PATH"));
 const privateKey=createPrivateKey(await readFile(need("FABRIC_IDENTITY_KEY_PATH")));
 const endpoint=need("FABRIC_GATEWAY_ENDPOINT");
 const options:grpc.ClientOptions={};
 if(process.env.FABRIC_PEER_HOST_ALIAS){
   options["grpc.ssl_target_name_override"]=process.env.FABRIC_PEER_HOST_ALIAS;
   options["grpc.default_authority"]=process.env.FABRIC_PEER_HOST_ALIAS;
 }
 const client=new grpc.Client(endpoint,grpc.credentials.createSsl(tls),options);
 const gateway=connect({client,identity:{mspId:need("FABRIC_MSP_ID"),credentials:identity},
   signer:signers.newPrivateKeySigner(privateKey),
   evaluateOptions:()=>({deadline:Date.now()+5000}),
   endorseOptions:()=>({deadline:Date.now()+15000}),
   submitOptions:()=>({deadline:Date.now()+15000}),
   commitStatusOptions:()=>({deadline:Date.now()+60000})});
 try{
   const contract=gateway.getNetwork(need("FABRIC_CHANNEL")).getContract(need("FABRIC_CHAINCODE"),"ppi.trazabilidad");
   return await action(contract);
 }finally{gateway.close();client.close();}
}
/** Devuelve éxito solo después del commit VALID, no tras el mero submit. */
export async function submitEvent(event:ChainEvent):Promise<{transactionId:string;result:string}>{
 return withContract(async contract=>{
   const submitted=await contract.submitAsync("RegistrarEvento",{arguments:[JSON.stringify(event)]});
   const status=await submitted.getStatus();
   if(!status.successful)throw Error("Commit Fabric rechazado: "+String(status.code));
   return {transactionId:status.transactionId,result:Buffer.from(submitted.getResult()).toString("utf8")};
 });
}
export async function evaluateRecord(id:string):Promise<unknown>{
 return withContract(async contract=>
   JSON.parse(Buffer.from(await contract.evaluateTransaction("ConsultarRegistro",id)).toString("utf8")));
}
export async function evaluateEvent(id:string):Promise<unknown>{
 return withContract(async contract=>
   JSON.parse(Buffer.from(await contract.evaluateTransaction("ConsultarEvento",id)).toString("utf8")));
}
