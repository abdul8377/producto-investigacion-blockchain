import type {AcademicDetail} from "@/server/crypto/evidence";
export type Strategy="A"|"B";
export type Operation="REGISTRO"|"RECTIFICACION"|"REVOCACION"|"SUPRESION";
export type ChainEvent={
 eventId:string;recordId:string;strategy:Strategy;operation:Operation;
 version:number;timestamp:string;previousEventId?:string;
 detail?:AcademicDetail;hmac?:string;
};
export type Experiment={experimentoId:string;estrategia:Strategy;nombre:string;estado:string};
