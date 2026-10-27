"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const {registerEvent,getRecord,getEvent,listEvents} = require("../src/ledger-core.cjs");
const a = "00000000-0000-4000-8000-000000000001";
const b = "00000000-0000-4000-8000-000000000002";
const c = "00000000-0000-4000-8000-000000000003";
const record = "00000000-0000-4000-8000-000000000010";
const date = "2026-10-27T00:00:00Z";
const hmac = "a".repeat(64);

function mockCtx() {
  const data = new Map();
  return {stub:{
    async getState(k){return data.get(k) || Buffer.alloc(0);},
    async putState(k,v){data.set(k,v);},
    createCompositeKey(type, parts){return type+"~"+parts.join("~");},
    async getStateByPartialCompositeKey(type, parts){
      const entries=[...data.entries()].filter(([k])=>k.startsWith(type+"~"+parts.join("~")+"~"))
        .sort(([x],[y])=>x.localeCompare(y)); let pos=0;
      return {async next(){if(pos>=entries.length)return {done:true};return {done:false,value:{value:entries[pos++][1]}};},async close(){}};
    }
  }};
}
const initial = (other={}) => ({
  eventId:a, recordId:record, strategy:"B", operation:"REGISTRO",
  version:1, timestamp:date, hmac,...other
});
test("B persiste HMAC, sin detalle",async()=>{
  const ctx=mockCtx();
  assert.equal((await registerEvent(ctx,initial())).status,"ACEPTADO");
  assert.equal((await getRecord(ctx,record)).version,1);
  assert.equal((await getEvent(ctx,a)).hmac,hmac);
  assert.equal((await getEvent(ctx,a)).detail,undefined);
});
test("reintento idéntico es idempotente; cambio de contenido falla",async()=>{
  const ctx=mockCtx(); await registerEvent(ctx,initial());
  assert.equal((await registerEvent(ctx,initial())).status,"DUPLICADO");
  await assert.rejects(registerEvent(ctx,initial({hmac:"b".repeat(64)})),/reutilizado/);
});
test("rectificación encadenada y rechazo de versión obsoleta",async()=>{
  const ctx=mockCtx(); await registerEvent(ctx,initial());
  const fix={...initial(),eventId:b,operation:"RECTIFICACION",version:2,previousEventId:a,hmac:"b".repeat(64)};
  await registerEvent(ctx,fix);
  await assert.rejects(registerEvent(ctx,{...fix,eventId:c}),/conflicto/);
  assert.deepEqual((await listEvents(ctx,record)).map(e=>e.version),[1,2]);
});
test("supresión B crea marca sin información detallada y bloquea nuevas versiones",async()=>{
  const ctx=mockCtx(); await registerEvent(ctx,initial());
  await registerEvent(ctx,{eventId:b,recordId:record,strategy:"B",operation:"SUPRESION",version:2,timestamp:date,previousEventId:a});
  assert.equal((await getRecord(ctx,record)).status,"SUPRIMIDO");
  assert.equal((await getEvent(ctx,b)).hmac,undefined);
  await assert.rejects(registerEvent(ctx,{...initial(),eventId:c,version:3,operation:"RECTIFICACION",previousEventId:b}),/no activo/);
});
test("A conserva detalle académico acotado; no permite supresión",async()=>{
  const ctx=mockCtx();
  await registerEvent(ctx,{...initial({strategy:"A",detail:{tipo:"CALIFICACION",anio:2026,periodo:2,valor:"AD"}}),hmac:undefined});
  assert.equal((await getEvent(ctx,a)).detail.valor,"AD");
  await assert.rejects(registerEvent(ctx,{eventId:b,recordId:record,strategy:"A",operation:"SUPRESION",version:2,timestamp:date,previousEventId:a}),/solo disponible para B/);
});
test("rechaza identificadores de fuente, nombres y detalle en B",async()=>{
  const ctx=mockCtx();
  await assert.rejects(registerEvent(ctx,initial({studentId:"EST-123"})),/campo no permitido/);
  await assert.rejects(registerEvent(ctx,initial({detail:{tipo:"CALIFICACION",anio:2026,periodo:1,valor:"10"}})),/prohíbe detalle/);
  await assert.rejects(registerEvent(ctx,{...initial({strategy:"A",detail:{tipo:"CALIFICACION",anio:2026,periodo:1,valor:"Apellido Nombre"}}),hmac:undefined}),/etiqueta académica breve/);
});
