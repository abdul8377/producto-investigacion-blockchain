const modules = [
  {name:"Datos", detail:"Cobertura, procedencia y consistencia de fuentes", status:"Por conectar"},
  {name:"Académico", detail:"Notas y asistencias seudonimizadas de origen", status:"Por conectar"},
  {name:"Laboratorio", detail:"Eventos, rectificaciones y revocaciones A/B", status:"Núcleo creado"},
  {name:"Trazabilidad", detail:"Ledger versionado y consultas de historial", status:"Contrato creado"},
  {name:"Experimentos", detail:"Comparación de latencia, TPS y almacenamiento", status:"Pendiente"}
];
export default function Home() {
  return (
    <main className="shell">
      <header className="topbar"><div className="brand"><span className="brand-mark">B</span><span>BLOCKLAB <small>UNIVERSIDAD PERUANA UNIÓN · PPI</small></span></div><span className="environment">ENTORNO DE INVESTIGACIÓN</span></header>
      <section className="hero">
        <div><span className="eyebrow">PROTOTIPO EXPERIMENTAL · HITO 1</span>
        <h1>Trazabilidad académica<br/><em>sin comprometer la privacidad.</em></h1>
        <p>Arquitectura híbrida de blockchain para comparar la persistencia completa en cadena frente al resguardo de evidencia verificable con datos académicos fuera de cadena.</p>
        <div className="hero-tags"><span>Next.js 16</span><span>MySQL 8.4</span><span>Hyperledger Fabric 2.5</span></div>
        </div><aside className="strategy"><span className="eyebrow">DOS ESTRATEGIAS · UNA EVALUACIÓN</span>
          <div className="strategy-row"><b>A</b><div><strong>Referencia · On-chain</strong><small>Detalle de ensayo dentro de Fabric</small></div></div>
          <div className="strategy-row"><b>B</b><div><strong>Híbrida · On/Off-chain</strong><small>Detalle cifrado en MySQL; evidencia HMAC en Fabric</small></div></div>
          <p>La estrategia B incorpora un mecanismo experimental de supresión del detalle fuera de cadena. No equivale a cumplimiento legal demostrado.</p>
        </aside>
      </section>
      <section className="section"><div className="section-head"><div><span className="eyebrow">PLATAFORMA</span><h2>Módulos de investigación</h2></div><span className="stage">Implementación progresiva</span></div>
      <div className="module-grid">{modules.map((m,i)=><article className="module" key={m.name}><div className="module-head"><span className="module-number">0{i+1}</span><span className={m.status.includes("creado")?"active":"pending"}>{m.status}</span></div><h3>{m.name}</h3><p>{m.detail}</p><div className="module-foot">MÓDULO EXPERIMENTAL <span>↗</span></div></article>)}</div></section>
      <section className="notice"><div><strong>Estado de implementación</strong><p>El contrato versionado y la migración experimental están preparados. No se han importado los datos, conectado MySQL o Fabric, ni ejecutado pruebas experimentales. Las cifras de cobertura del plan no son mediciones de esta plataforma.</p></div><a href="https://github.com/abdul8377/producto-investigacion-blockchain">Ver repositorio ↗</a></section>
      <footer>BLOCKLAB · Arquitectura híbrida para trazabilidad microcurricular · Juliaca, 2026</footer>
    </main>
  );
}
