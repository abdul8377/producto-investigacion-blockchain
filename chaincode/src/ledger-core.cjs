"use strict";

/**
 * Núcleo determinista para Fabric. No registra identificadores académicos de origen.
 * El servidor genera UUID aleatorios y HMAC antes de invocar este contrato.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HMAC = /^[0-9a-f]{64}$/i;
const OPS = new Set(["REGISTRO", "RECTIFICACION", "REVOCACION", "SUPRESION"]);
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

function assertKeys(o, allowed, label) {
  if (!o || typeof o !== "object" || Array.isArray(o)) throw new Error(label + ": se espera objeto");
  for (const key of Object.keys(o)) {
    if (!allowed.includes(key)) throw new Error(label + ": campo no permitido " + key);
  }
}
function assertUuid(value, label) {
  if (typeof value !== "string" || !UUID.test(value)) throw new Error(label + ": UUID v4 requerido");
}
function assertTimestamp(value) {
  if (typeof value !== "string" || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value) ||
      !Number.isFinite(Date.parse(value))) throw new Error("fecha: UTC ISO 8601 requerida");
}
function validateDetail(detail) {
  assertKeys(detail, ["tipo", "anio", "periodo", "valor"], "detalle");
  if (!["CALIFICACION", "ASISTENCIA"].includes(detail.tipo)) throw new Error("tipo inválido");
  if (!Number.isInteger(detail.anio) || detail.anio < 2024 || detail.anio > 2026) throw new Error("año inválido");
  if (detail.tipo === "CALIFICACION") {
    if (detail.anio !== 2026 || !Number.isInteger(detail.periodo) || detail.periodo < 1 || detail.periodo > 4)
      throw new Error("calificación: solo periodos 1-4 de 2026");
  } else if (typeof detail.periodo !== "string" || !/^20(24|25|26)-\d\d-\d\d$/.test(detail.periodo) ||
             !Number.isFinite(Date.parse(detail.periodo))) {
    throw new Error("asistencia: fecha 2024-2026 requerida");
  }
  // Solo una etiqueta académica corta, nunca nombres, DNI ni identificadores de fuentes.
  if (typeof detail.valor !== "string" || !/^[A-Za-z0-9+.,-]{1,12}$/.test(detail.valor))
    throw new Error("valor: etiqueta académica breve requerida");
}
function parseEvent(input) {
  const e = typeof input === "string" ? JSON.parse(input) : input;
  assertKeys(e, ["eventId","recordId","strategy","operation","version","timestamp","previousEventId","detail","hmac"], "evento");
  assertUuid(e.eventId, "eventId");
  assertUuid(e.recordId, "recordId");
  if (!["A", "B"].includes(e.strategy)) throw new Error("estrategia inválida");
  if (!OPS.has(e.operation)) throw new Error("operación inválida");
  if (!Number.isSafeInteger(e.version) || e.version < 1) throw new Error("versión inválida");
  assertTimestamp(e.timestamp);
  if (e.version === 1 && e.operation !== "REGISTRO") throw new Error("primera operación debe ser REGISTRO");
  if (e.version > 1 && e.operation === "REGISTRO") throw new Error("REGISTRO solo permite versión inicial");
  if (e.version === 1) {
    if (own(e,"previousEventId")) throw new Error("no incluir evento anterior al crear");
  } else {
    assertUuid(e.previousEventId, "previousEventId");
  }
  if (e.operation === "SUPRESION" && e.strategy !== "B") throw new Error("supresión solo disponible para B");
  const carriesData = ["REGISTRO","RECTIFICACION"].includes(e.operation);
  if (carriesData && e.strategy === "A") {
    if (!own(e,"detail") || own(e,"hmac")) throw new Error("A requiere detalle y prohíbe HMAC");
    validateDetail(e.detail);
  } else if (carriesData && e.strategy === "B") {
    if (!HMAC.test(e.hmac || "") || own(e,"detail")) throw new Error("B requiere HMAC y prohíbe detalle");
  } else if (own(e,"detail") || own(e,"hmac")) {
    throw new Error("revocación/supresión no admite detalle ni HMAC");
  }
  return e;
}
function canonicalEvent(e) {
  const o = {
    eventId:e.eventId, recordId:e.recordId, strategy:e.strategy,
    operation:e.operation, version:e.version, timestamp:e.timestamp
  };
  if (e.previousEventId) o.previousEventId = e.previousEventId;
  if (e.detail) o.detail = {tipo:e.detail.tipo, anio:e.detail.anio, periodo:e.detail.periodo, valor:e.detail.valor};
  if (e.hmac) o.hmac = e.hmac.toLowerCase();
  return o;
}
async function readJson(ctx, key) {
  const bytes = await ctx.stub.getState(key);
  return bytes && bytes.length ? JSON.parse(bytes.toString()) : null;
}
async function registerEvent(ctx, json) {
  const e = canonicalEvent(parseEvent(json));
  const eventKey = "event:" + e.eventId;
  const recordKey = "record:" + e.recordId;
  const existing = await readJson(ctx,eventKey);
  if (existing) {
    if (JSON.stringify(existing) !== JSON.stringify(e)) throw new Error("eventId reutilizado con contenido diferente");
    return {status:"DUPLICADO", eventId:e.eventId, recordId:e.recordId, version:e.version};
  }
  const current = await readJson(ctx,recordKey);
  if (!current) {
    if (e.version !== 1 || e.operation !== "REGISTRO") throw new Error("registro inexistente");
  } else {
    if (current.strategy !== e.strategy) throw new Error("estrategia inmutable por registro");
    if (current.status !== "ACTIVO") throw new Error("registro no activo");
    if (e.version !== current.version + 1 || e.previousEventId !== current.lastEventId)
      throw new Error("conflicto de versión o evento anterior");
  }
  const status = e.operation === "REVOCACION" ? "REVOCADO"
    : e.operation === "SUPRESION" ? "SUPRIMIDO" : "ACTIVO";
  const next = {recordId:e.recordId, strategy:e.strategy, version:e.version,
    lastEventId:e.eventId, status, timestamp:e.timestamp};
  await ctx.stub.putState(eventKey, Buffer.from(JSON.stringify(e)));
  await ctx.stub.putState(recordKey, Buffer.from(JSON.stringify(next)));
  await ctx.stub.putState(
    ctx.stub.createCompositeKey("recordEvent", [e.recordId, String(e.version).padStart(12,"0"), e.eventId]),
    Buffer.from(e.eventId)
  );
  return {status:"ACEPTADO", eventId:e.eventId, recordId:e.recordId, version:e.version};
}
async function getRecord(ctx, id) {
  assertUuid(id,"recordId");
  const r = await readJson(ctx,"record:"+id);
  if (!r) throw new Error("registro no encontrado");
  return r;
}
async function getEvent(ctx,id) {
  assertUuid(id,"eventId");
  const e = await readJson(ctx,"event:"+id);
  if (!e) throw new Error("evento no encontrado");
  return e;
}
async function listEvents(ctx,id) {
  assertUuid(id,"recordId");
  await getRecord(ctx,id);
  const iterator = await ctx.stub.getStateByPartialCompositeKey("recordEvent",[id]);
  const events = [];
  try {
    while (true) {
      const item = await iterator.next();
      if (item.value) {
        const eventId = item.value.value.toString();
        events.push(await getEvent(ctx,eventId));
      }
      if (item.done) break;
    }
  } finally { await iterator.close(); }
  return events;
}
module.exports = {parseEvent, canonicalEvent, registerEvent, getRecord, getEvent, listEvents};
