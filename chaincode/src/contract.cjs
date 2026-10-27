"use strict";
const {Contract} = require("fabric-contract-api");
const ledger = require("./ledger-core.cjs");

class TrazabilidadContract extends Contract {
  constructor() { super("ppi.trazabilidad"); }
  _authorize(ctx) {
    const msp = ctx.clientIdentity.getMSPID();
    if (!["Org1MSP","Org2MSP"].includes(msp)) throw new Error("MSP sin permiso de escritura");
  }
  async RegistrarEvento(ctx, payload) {
    this._authorize(ctx);
    return JSON.stringify(await ledger.registerEvent(ctx,payload));
  }
  async ConsultarRegistro(ctx, recordId) {
    return JSON.stringify(await ledger.getRecord(ctx,recordId));
  }
  async ConsultarEvento(ctx, eventId) {
    return JSON.stringify(await ledger.getEvent(ctx,eventId));
  }
  async ConsultarHistorial(ctx, recordId) {
    return JSON.stringify(await ledger.listEvents(ctx,recordId));
  }
}
module.exports = TrazabilidadContract;
