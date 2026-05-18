import React, { useEffect } from 'react';

export default function MiniExcelBoard({ challengeId, onValidation }: { challengeId?: string; onValidation?: (success: boolean) => void }) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'QUIZ_SUCCESS') {
        onValidation?.(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onValidation]);

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MiniExcel — Calificaciones</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#0e0f11;--surface:#16181c;--surface2:#1e2026;--surface3:#252830;
  --border:#2e3038;--border2:#3a3d48;
  --accent:#4ade80;--accent-dim:rgba(74,222,128,0.12);--accent-mid:rgba(74,222,128,0.25);
  --danger:#f87171;--danger-dim:rgba(248,113,113,0.15);
  --warning:#fbbf24;--info:#60a5fa;--info-dim:rgba(96,165,250,0.12);
  --purple:#c084fc;--purple-dim:rgba(192,132,252,0.12);
  --text:#e8eaed;--text2:#9aa0ac;--text3:#5a5f6e;
  --mono:'JetBrains Mono',monospace;--sans:'DM Sans',sans-serif;
  --radius:6px;--radius-lg:10px;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:var(--sans);background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden;}

.app-header{background:var(--surface);border-bottom:1px solid var(--border);padding:0 20px;height:48px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:100;}
.app-logo{font-family:var(--mono);font-size:13px;font-weight:700;color:var(--accent);letter-spacing:.05em;display:flex;align-items:center;gap:6px;}
.app-logo span{color:var(--text2);font-weight:400;}
.header-sep{width:1px;height:20px;background:var(--border);}
.file-name{font-size:13px;color:var(--text2);font-family:var(--mono);}
.header-spacer{flex:1;}

.formula-bar{background:var(--surface);border-bottom:1px solid var(--border);padding:6px 20px;display:flex;align-items:center;gap:10px;}
.cell-ref{font-family:var(--mono);font-size:12px;color:var(--accent);background:var(--surface2);border:1px solid var(--border);padding:3px 8px;border-radius:var(--radius);width:64px;text-align:center;}
.fx-icon{font-family:var(--mono);font-size:12px;color:var(--info);font-style:italic;}
.formula-input{flex:1;font-family:var(--mono);font-size:12px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:3px 10px;color:var(--text);outline:none;}

.toolbar{background:var(--surface);border-bottom:1px solid var(--border);padding:8px 20px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.toolbar-group{display:flex;align-items:center;gap:4px;padding-right:10px;border-right:1px solid var(--border);margin-right:4px;}
.toolbar-group:last-child{border-right:none;}
.tb-label{font-size:10px;color:var(--text3);font-family:var(--mono);text-transform:uppercase;letter-spacing:.08em;margin-right:2px;}
.btn{font-family:var(--sans);font-size:12px;font-weight:500;padding:5px 12px;border-radius:var(--radius);border:1px solid var(--border2);background:var(--surface2);color:var(--text);cursor:pointer;transition:all .12s;white-space:nowrap;display:flex;align-items:center;gap:5px;}
.btn:hover{background:var(--surface3);}
.btn:active{transform:scale(.97);}
.btn-macro{background:var(--accent-dim);border-color:rgba(74,222,128,.35);color:var(--accent);font-weight:600;}
.btn-macro:hover{background:var(--accent-mid);}
.btn-scratch{background:var(--purple-dim);border-color:rgba(192,132,252,.35);color:var(--purple);font-weight:600;}
.btn-scratch:hover{background:rgba(192,132,252,.22);}

.group-tabs{padding:8px 20px 0;background:var(--surface);border-bottom:1px solid var(--border);display:flex;gap:2px;}
.gtab{padding:5px 14px;font-size:11px;font-family:var(--mono);font-weight:600;color:var(--text3);cursor:pointer;border-radius:4px 4px 0 0;border:1px solid transparent;border-bottom:none;transition:all .1s;user-select:none;}
.gtab:hover{color:var(--text2);background:var(--surface2);}
.gtab.active{background:var(--bg);border-color:var(--border);color:var(--accent);}

.app-body{display:flex;height:calc(100vh - 48px - 47px - 37px - 38px);min-height:400px;}

.sheet-panel{flex:1;overflow:auto;}
.table-wrap{overflow:auto;height:100%;}
table{border-collapse:collapse;font-family:var(--mono);font-size:12px;width:100%;min-width:760px;}
thead th{position:sticky;top:0;z-index:10;background:var(--surface2);border:1px solid var(--border);padding:6px 10px;font-size:11px;font-weight:700;color:var(--text2);text-align:center;white-space:nowrap;letter-spacing:.05em;text-transform:uppercase;user-select:none;}
thead th.col-nombre{text-align:left;min-width:155px;}
thead th.col-idx{width:40px;background:var(--surface3);color:var(--text3);}
td{border:1px solid var(--border);padding:4px 10px;background:var(--surface);transition:background .15s;white-space:nowrap;}
td.row-idx{background:var(--surface3);color:var(--text3);font-size:11px;text-align:center;padding:4px 8px;user-select:none;}
td.cell-nombre{font-family:var(--sans);font-size:12px;font-weight:500;}
td.cell-grupo{text-align:center;color:var(--text2);}
td.cell-nota{text-align:center;}
td.cell-nota input{width:50px;background:transparent;border:none;text-align:center;font-family:var(--mono);font-size:12px;color:var(--text);outline:none;padding:0;}
td.cell-nota:focus-within{background:var(--info-dim);outline:1px solid var(--info);outline-offset:-1px;}
td.cell-prom{text-align:center;font-weight:600;}
td.cell-result{text-align:center;}
tr.row-fail td{background:var(--danger-dim)!important;}
tr.row-fail td.cell-nota input{color:var(--danger);font-weight:700;}
tr.row-fail td.cell-prom{color:var(--danger);}
tr.row-pass td.cell-prom{color:var(--accent);}
tr:hover td{filter:brightness(1.08);}
.summary-section tr td{background:var(--surface2);font-weight:600;font-size:11px;}
.summary-section tr.s-min td{color:var(--danger);}
.summary-section tr.s-max td{color:var(--accent);}
.summary-section tr.s-avg td{color:var(--warning);}
.summary-section tr.s-label td{color:var(--text3);font-size:10px;background:var(--surface3);border-top:2px solid var(--border2);}
.badge{display:inline-block;font-size:9px;font-family:var(--mono);font-weight:700;padding:1px 5px;border-radius:3px;letter-spacing:.04em;}
.badge-pass{background:var(--accent-dim);color:var(--accent);}
.badge-fail{background:var(--danger-dim);color:var(--danger);}

.side-panel{width:290px;min-width:290px;background:var(--surface);border-left:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;}
.side-title{padding:12px 16px 10px;font-family:var(--mono);font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;border-bottom:1px solid var(--border);}
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;border-bottom:1px solid var(--border);}
.stat-card{background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:10px 12px;}
.stat-label{font-size:10px;color:var(--text3);font-family:var(--mono);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;}
.stat-value{font-size:20px;font-family:var(--mono);font-weight:700;}
.stat-sub{font-size:10px;color:var(--text3);margin-top:2px;}
.stat-pass .stat-value{color:var(--accent);}
.stat-fail .stat-value{color:var(--danger);}
.stat-avg  .stat-value{color:var(--warning);}
.stat-total .stat-value{color:var(--info);}
.log-section{padding:8px 12px;flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:4px;}
.log-entry{font-family:var(--mono);font-size:10px;padding:4px 8px;border-radius:4px;border-left:2px solid var(--border);color:var(--text2);animation:fadeIn .2s ease;}
@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1}}
.log-info{border-color:var(--info);color:var(--info);background:var(--info-dim);}
.log-ok{border-color:var(--accent);color:var(--accent);background:var(--accent-dim);}
.log-warn{border-color:var(--danger);color:var(--danger);background:var(--danger-dim);}
.log-plain{border-color:var(--border);color:var(--text2);}

::-webkit-scrollbar{width:6px;height:6px;}
::-webkit-scrollbar-track{background:var(--surface);}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px;}

/* ═══ MODAL SCRATCH ═══ */
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:999;align-items:center;justify-content:center;}
.modal-overlay.open{display:flex;}
.modal-box{background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius-lg);width:720px;max-width:96vw;max-height:92vh;display:flex;flex-direction:column;overflow:hidden;}
.modal-header{padding:14px 20px 12px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;gap:10px;}
.modal-header-title{font-weight:600;font-size:15px;color:var(--text);flex:1;}
.modal-header-sub{font-size:11px;color:var(--text3);font-family:var(--mono);margin-top:2px;}
.modal-close{cursor:pointer;font-size:16px;color:var(--text3);background:none;border:1px solid var(--border);padding:3px 9px;border-radius:var(--radius);margin-top:2px;}
.modal-close:hover{background:var(--surface2);color:var(--text);}

.scratch-instr{padding:9px 20px;background:var(--purple-dim);border-bottom:1px solid rgba(192,132,252,.2);font-size:11px;color:#d8b4fe;font-family:var(--mono);display:flex;align-items:flex-start;gap:8px;line-height:1.5;}
.scratch-instr b{color:#e9d5ff;}

.scratch-work{display:flex;flex:1;overflow:hidden;min-height:0;}

/* BANCO */
.scratch-bank{width:230px;min-width:230px;padding:12px 10px;border-right:1px solid var(--border);overflow-y:auto;display:flex;flex-direction:column;gap:5px;}
.section-label{font-size:10px;color:var(--text3);font-family:var(--mono);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px;padding-bottom:4px;border-bottom:1px solid var(--border);}

/* ZONA DROP */
.scratch-drop-zone{flex:1;padding:12px 14px;overflow-y:auto;display:flex;flex-direction:column;gap:5px;}
.drop-slots{display:flex;flex-direction:column;gap:5px;}

.drop-slot{
  min-height:42px;border:1.5px dashed var(--border2);border-radius:var(--radius);
  display:flex;align-items:center;padding:0 10px 0 34px;
  font-size:10px;color:var(--text3);font-family:var(--mono);
  transition:border-color .15s,background .15s;position:relative;
}
.drop-slot.drag-over{border-color:var(--purple);background:var(--purple-dim);}
.drop-slot.filled{border-style:solid;border-color:var(--border2);background:var(--surface2);}
.slot-num{position:absolute;left:8px;font-size:10px;color:var(--text3);font-family:var(--mono);font-weight:700;width:20px;text-align:right;}

/* BLOQUES */
.block{
  padding:7px 10px;border-radius:var(--radius);font-family:var(--mono);font-size:11px;font-weight:500;
  cursor:grab;user-select:none;border-left:3px solid transparent;
  display:flex;align-items:center;gap:7px;transition:transform .1s,opacity .15s;
  line-height:1.4;
}
.block:active{cursor:grabbing;transform:scale(.97);}
.block.dragging{opacity:.3;}
.block.in-slot{cursor:default;width:100%;}
.block.in-slot:hover{opacity:.8;}

.block-declare{background:rgba(96,165,250,.13);border-color:var(--info);color:#bfdbfe;}
.block-set    {background:rgba(192,132,252,.13);border-color:var(--purple);color:#e9d5ff;}
.block-loop   {background:rgba(251,191,36,.1);border-color:var(--warning);color:#fde68a;}
.block-if     {background:rgba(248,113,113,.12);border-color:var(--danger);color:#fecaca;}
.block-call   {background:rgba(74,222,128,.1);border-color:var(--accent);color:#bbf7d0;}
.block-end    {background:rgba(90,95,110,.15);border-color:var(--text3);color:var(--text2);}

.block-icon{font-size:14px;flex-shrink:0;}
.block-tag{font-size:9px;opacity:.6;margin-left:auto;flex-shrink:0;padding-left:4px;}

/* feedback */
.feedback-bar{padding:9px 20px;font-family:var(--mono);font-size:11px;font-weight:600;display:none;align-items:center;gap:8px;border-top:1px solid var(--border);}
.feedback-bar.ok{display:flex;background:var(--accent-dim);color:var(--accent);}
.feedback-bar.err{display:flex;background:var(--danger-dim);color:var(--danger);}

.scratch-footer{padding:10px 20px;border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.btn-verify{background:var(--purple-dim);border-color:rgba(192,132,252,.4);color:var(--purple);font-weight:700;font-size:13px;padding:7px 20px;}
.btn-verify:hover{background:rgba(192,132,252,.22);}
.btn-hint{font-size:12px;color:var(--warning);border-color:rgba(251,191,36,.3);background:rgba(251,191,36,.07);}
.hint-count{font-size:10px;color:var(--text3);font-family:var(--mono);}
.score-display{font-family:var(--mono);font-size:11px;color:var(--text3);margin-left:auto;}
.score-display b{color:var(--purple);}

@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}
.shake{animation:shake .35s ease;}
@keyframes bounceIn{0%{transform:scale(.9)}60%{transform:scale(1.04)}100%{transform:scale(1)}}
.bounce-anim{animation:bounceIn .35s ease;}
</style>
</head>
<body>

<div class="app-header">
  <div class="app-logo">⬛ MiniExcel <span>v1.0</span></div>
  <div class="header-sep"></div>
  <div class="file-name">calificaciones_grupos.xlsx</div>
  <div class="header-spacer"></div>
  <div style="font-size:11px;color:var(--text3);font-family:var(--mono)">20 estudiantes · 5 grupos</div>
</div>

<div class="formula-bar">
  <div class="cell-ref" id="cellRef">A1</div>
  <div class="fx-icon">fx</div>
  <input class="formula-input" id="formulaInput" readonly value="=PROMEDIO(C2:G2)" />
</div>

<div class="toolbar">
  <div class="toolbar-group">
    <span class="tb-label">Macro</span>
    <button class="btn btn-macro" onclick="runMacro()">▶ Ejecutar Macro</button>
    <button class="btn" onclick="resetSheet()">↺ Resetear</button>
  </div>
  <div class="toolbar-group">
    <span class="tb-label">Datos</span>
    <button class="btn" onclick="shuffleGrades()">⟳ Aleatorizar notas</button>
    <button class="btn" onclick="fillWorstCase()">⚠ Caso crítico</button>
  </div>
  <div class="toolbar-group">
    <span class="tb-label">Reto</span>
    <button class="btn btn-scratch" onclick="openScratch()">🧩 Ordenar Macro</button>
  </div>
</div>

<div class="group-tabs">
  <div class="gtab active" onclick="filterGroup('all',this)">Todos</div>
  <div class="gtab" onclick="filterGroup('G1',this)">Grupo 1</div>
  <div class="gtab" onclick="filterGroup('G2',this)">Grupo 2</div>
  <div class="gtab" onclick="filterGroup('G3',this)">Grupo 3</div>
  <div class="gtab" onclick="filterGroup('G4',this)">Grupo 4</div>
  <div class="gtab" onclick="filterGroup('G5',this)">Grupo 5</div>
</div>

<div class="app-body">
  <div class="sheet-panel">
    <div class="table-wrap">
      <table id="mainTable">
        <thead>
          <tr>
            <th class="col-idx">#</th>
            <th class="col-nombre">Nombre</th>
            <th>Grupo</th>
            <th>Parcial 1</th><th>Parcial 2</th><th>Parcial 3</th>
            <th>Trabajo</th><th>Final</th>
            <th>Promedio</th><th>Estado</th>
          </tr>
        </thead>
        <tbody id="tableBody"></tbody>
        <tbody class="summary-section" id="summaryBody"></tbody>
      </table>
    </div>
  </div>

  <div class="side-panel">
    <div class="side-title">📊 Panel de análisis</div>
    <div class="stats-grid">
      <div class="stat-card stat-total"><div class="stat-label">Total</div><div class="stat-value" id="s-total">20</div><div class="stat-sub">estudiantes</div></div>
      <div class="stat-card stat-avg"><div class="stat-label">Promedio</div><div class="stat-value" id="s-avg">—</div><div class="stat-sub">general</div></div>
      <div class="stat-card stat-pass"><div class="stat-label">Aprobados</div><div class="stat-value" id="s-pass">—</div><div class="stat-sub">nota ≥ 3.0</div></div>
      <div class="stat-card stat-fail"><div class="stat-label">Reprobados</div><div class="stat-value" id="s-fail">—</div><div class="stat-sub">nota &lt; 3.0</div></div>
    </div>
    <div class="instructions-section" style="padding:10px 12px;border-bottom:1px solid var(--border);font-size:11px;line-height:1.6;color:var(--text2);">
      <div class="section-label" style="margin-bottom:6px;">📋 Instrucciones</div>
      <ol style="padding-left:18px;margin:0;">
        <li style="margin-bottom:4px;"><b style="color:var(--accent);">▶ Ejecutar Macro</b> — Corre la macro completa paso a paso para ver la secuencia correcta.</li>
        <li style="margin-bottom:4px;"><b style="color:var(--purple);">🧩 Ordenar Macro</b> — Arrastra los bloques al orden correcto en el modal. ¡Sin distractores!</li>
        <li style="margin-bottom:4px;">Si aciertas el orden, la macro se ejecutará automáticamente 🚀</li>
        <li style="margin-bottom:0;">Usa <b style="color:var(--warning);">💡 Pista</b> si te trabas (3 disponibles).</li>
      </ol>
    </div>
    <div style="padding:8px 12px 4px;border-bottom:1px solid var(--border);">
      <div class="section-label">Log de ejecución</div>
    </div>
    <div class="log-section" id="logSection">
      <div class="log-entry log-plain">💡 Haz clic en <b>▶ Ejecutar Macro</b> para ver la secuencia o en <b>🧩 Ordenar Macro</b> para practicar el orden de los bloques.</div>
  </div>
</div>

<!-- ═══ MODAL SCRATCH ═══ -->
<div class="modal-overlay" id="scratchModal">
  <div class="modal-box">
    <div class="modal-header">
      <div style="flex:1">
        <div class="modal-header-title">🧩 Reto: Ordena los bloques de la Macro</div>
        <div class="modal-header-sub">Arrastra los pasos al orden correcto · Si aciertas, la macro se ejecuta</div>
      </div>
      <button class="modal-close" onclick="closeScratch()">✕ cerrar</button>
    </div>

    <div class="scratch-instr">
      <span>⚡</span>
      <span>Una macro VBA/Apps Script sigue una <b>secuencia lógica estricta</b>. Arrastra los bloques correctos a la columna derecha en el orden que deben ejecutarse. Los bloques <b>distractores</b> no pertenecen a esta macro — ten cuidado.</span>
    </div>

    <div class="scratch-work">
      <div class="scratch-bank">
        <div class="section-label">Bloques disponibles</div>
        <div id="bankSlots" style="display:flex;flex-direction:column;gap:5px;"></div>
      </div>
      <div class="scratch-drop-zone">
        <div class="section-label">Secuencia de ejecución (ordena aquí)</div>
        <div class="drop-slots" id="dropZone"></div>
      </div>
    </div>

    <div class="feedback-bar" id="feedbackBar"></div>

    <div class="scratch-footer">
      <button class="btn btn-verify" onclick="verifyOrder()">✔ Verificar</button>
      <button class="btn btn-hint" onclick="giveHint()" id="btnHint">💡 Pista</button>
      <button class="btn" onclick="reshuffleBlocks()">⟳ Mezclar</button>
      <span class="hint-count" id="hintCount">Pistas: 3</span>
      <div class="score-display">Intentos: <b id="attemptCount">0</b></div>
    </div>
  </div>
</div>

<script>
// ── DATOS ──
const NOMBRES=["Valentina Torres","Santiago Gómez","Mariana López","Juan Rodríguez","Camila Martínez","Andrés Herrera","Isabella Castro","Diego Morales","Sofía Jiménez","Sebastián Ruiz","Luciana Vargas","Felipe Mendoza","Daniela Reyes","Mateo Álvarez","Paula Sánchez","Tomás Ortega","Gabriela Pérez","Nicolás Rivera","Verónica Flores","Esteban Romero"];
const GRUPOS=["G1","G1","G1","G1","G2","G2","G2","G2","G3","G3","G3","G3","G4","G4","G4","G5","G5","G5","G5","G5"];
let students=[],macroRan=false,currentFilter="all";

function rand(a,b){return Math.round((Math.random()*(b-a)+a)*10)/10;}

function initStudents(mode="normal"){
  students=NOMBRES.map((nombre,i)=>{
    let notas;
    if(mode==="worst"){const f=Math.random()<.6;notas=[f?rand(1,2.9):rand(3,5),f?rand(1,2.9):rand(3,5),rand(1.5,4.5),f?rand(1.5,2.8):rand(3,5),rand(1,5)];}
    else{notas=[rand(2,5),rand(2,5),rand(2.5,5),rand(2.5,5),rand(1.5,5)];}
    return{nombre,grupo:GRUPOS[i],notas,promedio:null,estado:null};
  });
}

function renderTable(){
  const tb=document.getElementById("tableBody");tb.innerHTML="";
  const vis=students.filter(s=>currentFilter==="all"||s.grupo===currentFilter);
  vis.forEach(s=>{
    const gi=students.indexOf(s);const tr=document.createElement("tr");
    if(macroRan)tr.className=s.promedio<3?"row-fail":"row-pass";
    tr.innerHTML=\`<td class="row-idx">\${gi+1}</td><td class="cell-nombre">\${s.nombre}</td><td class="cell-grupo">\${s.grupo}</td>\${s.notas.map((n,j)=>\`<td class="cell-nota"><input type="number" min="0" max="5" step="0.1" value="\${n.toFixed(1)}" onchange="updateNota(\${gi},\${j},this.value)" onfocus="showFormula(\${gi},\${j})"/></td>\`).join("")}<td class="cell-prom">\${macroRan?s.promedio.toFixed(2):"—"}</td><td class="cell-result">\${macroRan?\`<span class="badge \${s.promedio>=3?"badge-pass":"badge-fail"}">\${s.promedio>=3?"APRUEBA":"REPRUEBA"}</span>\`:"—"}</td>\`;
    tb.appendChild(tr);
  });
  renderSummary();renderStats();
}

function renderSummary(){
  const sb=document.getElementById("summaryBody");sb.innerHTML="";
  if(!macroRan)return;
  const vis=students.filter(s=>currentFilter==="all"||s.grupo===currentFilter);
  const proms=vis.map(s=>s.promedio);
  const nc=[0,1,2,3,4].map(j=>vis.map(s=>s.notas[j]));
  const avg=proms.reduce((a,b)=>a+b,0)/proms.length;
  const cAvg=nc.map(c=>c.reduce((a,b)=>a+b,0)/c.length);
  const cMin=nc.map(c=>Math.min(...c));const cMax=nc.map(c=>Math.max(...c));
  function row(l,v,cl,pv){return\`<tr class="\${cl}"><td class="row-idx"></td><td class="cell-nombre" style="font-family:var(--mono)">\${l}</td><td></td>\${v.map(x=>\`<td class="cell-nota" style="text-align:center">\${x.toFixed(2)}</td>\`).join("")}<td class="cell-prom">\${pv.toFixed(2)}</td><td></td></tr>\`;}
  sb.innerHTML=\`<tr class="s-label"><td class="row-idx"></td><td colspan="9" class="cell-nombre">— Estadísticas —</td></tr>\${row("PROMEDIO",cAvg,"s-avg",avg)}\${row("MÍNIMO",cMin,"s-min",Math.min(...proms))}\${row("MÁXIMO",cMax,"s-max",Math.max(...proms))}\`;
}

function renderStats(){
  if(!macroRan)return;
  const vis=students.filter(s=>currentFilter==="all"||s.grupo===currentFilter);
  const proms=vis.map(s=>s.promedio);
  const pass=proms.filter(p=>p>=3).length,fail=proms.filter(p=>p<3).length;
  const avg=proms.reduce((a,b)=>a+b,0)/proms.length;
  document.getElementById("s-total").textContent=vis.length;
  document.getElementById("s-avg").textContent=avg.toFixed(2);
  document.getElementById("s-pass").textContent=pass;
  document.getElementById("s-fail").textContent=fail;
}

function updateNota(si,ni,val){
  const v=Math.min(5,Math.max(0,parseFloat(val)||0));students[si].notas[ni]=v;
  if(macroRan){students[si].promedio=students[si].notas.reduce((a,b)=>a+b,0)/5;students[si].estado=students[si].promedio>=3?"APRUEBA":"REPRUEBA";renderTable();addLog(\`Actualizado → \${students[si].nombre}: \${students[si].promedio.toFixed(2)}\`,"info");}
}
function showFormula(si,ni){const cols=["C","D","E","F","G"];document.getElementById("cellRef").textContent=cols[ni]+(si+2);document.getElementById("formulaInput").value=\`=PROMEDIO(C\${si+2}:G\${si+2})\`;}
function filterGroup(g,el){currentFilter=g;document.querySelectorAll(".gtab").forEach(t=>t.classList.remove("active"));el.classList.add("active");renderTable();}

async function runMacro(){
  macroRan=false;clearLog();
  const steps=[
    {m:"Iniciando Sub AutoCalificaciones()",t:"info"},
    {m:"Dim ws, lastRow, i, prom — variables declaradas",t:"plain"},
    {m:"Set ws = ActiveSheet",t:"plain"},
    {m:"lastRow = "+(students.length+1)+" filas detectadas",t:"plain"},
    {m:"Limpiando formatos anteriores...",t:"plain"},
    {m:"For i = 2 To lastRow — iniciando bucle",t:"plain"},
    {m:"prom = Average(C:G) — calculando promedios",t:"plain"},
    {m:"If prom < 3.0 → Interior.Color = RGB(255,80,80)",t:"warn"},
    {m:"Cells(i,8) = Round(prom,2) — escribiendo promedio",t:"plain"},
    {m:"Next i — fin de bucle",t:"plain"},
    {m:"Insertando fila PROMEDIO / MÍN / MÁX",t:"plain"},
  ];
  for(const s of steps){await delay(180);addLog(s.m,s.t);}
  students.forEach(s=>{s.promedio=s.notas.reduce((a,b)=>a+b,0)/s.notas.length;s.estado=s.promedio>=3?"APRUEBA":"REPRUEBA";});
  macroRan=true;renderTable();
  const fails=students.filter(s=>s.promedio<3).length;
  addLog(\`✔ Macro completada. \${fails} reprobado(s) resaltados en rojo.\`,"ok");
}

function delay(ms){return new Promise(r=>setTimeout(r,ms));}
function shuffleGrades(){initStudents("normal");macroRan=false;renderTable();clearLog();addLog("Notas aleatorizadas. Ejecuta la macro.","info");}
function fillWorstCase(){initStudents("worst");macroRan=false;renderTable();clearLog();addLog("⚠ Caso crítico cargado.","warn");}
function resetSheet(){
  initStudents("normal");macroRan=false;currentFilter="all";
  document.querySelectorAll(".gtab").forEach(t=>t.classList.remove("active"));
  document.querySelector(".gtab").classList.add("active");
  renderTable();clearLog();addLog("Hoja restablecida.","plain");
  ["s-avg","s-pass","s-fail"].forEach(id=>document.getElementById(id).textContent="—");
}
function clearLog(){document.getElementById("logSection").innerHTML="";}
function addLog(msg,type="plain"){
  const el=document.createElement("div");el.className=\`log-entry log-\${type}\`;
  const ts=new Date().toLocaleTimeString("es",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
  el.textContent=\`[\${ts}] \${msg}\`;const log=document.getElementById("logSection");log.appendChild(el);log.scrollTop=log.scrollHeight;
}
// ═══════════════════════════════════════════════════════════
// SCRATCH — BLOQUES
// ═══════════════════════════════════════════════════════════

const CORRECT_BLOCKS = [
  {id:"b1",type:"declare",icon:"📦",text:"Dim ws, lastRow, i, prom As Double",tag:"DECLARAR"},
  {id:"b2",type:"set",    icon:"📌",text:"Set ws = ThisWorkbook.ActiveSheet",tag:"APUNTAR"},
  {id:"b3",type:"set",    icon:"🔢",text:"lastRow = ws.Cells(Rows.Count,1).End(xlUp).Row",tag:"RANGO"},
  {id:"b4",type:"call",   icon:"🧹",text:"ws.Range(\\"A2:J\\" & lastRow).Interior.ColorIndex = xlNone",tag:"LIMPIAR"},
  {id:"b5",type:"loop",   icon:"🔁",text:"For i = 2 To lastRow",tag:"BUCLE"},
  {id:"b6",type:"call",   icon:"➕",text:"prom = WorksheetFunction.Average(ws.Range(Cells(i,3),Cells(i,7)))",tag:"CALCULAR"},
  {id:"b7",type:"if",     icon:"❓",text:"If prom < 3.0 Then → color rojo / Else → sin color",tag:"CONDICIONAL"},
  {id:"b8",type:"call",   icon:"✍️", text:"ws.Cells(i,8).Value = Round(prom, 2)",tag:"ESCRIBIR"},
  {id:"b9",type:"end",    icon:"↩️", text:"Next i",tag:"FIN BUCLE"},
  {id:"b10",type:"call",  icon:"📊",text:"Insertar fila PROMEDIO, MÍN y MÁX al final",tag:"ESTADÍSTICAS"},
  {id:"b11",type:"end",   icon:"🏁",text:"End Sub",tag:"FIN MACRO"},
];

const DECOYS = [
  {id:"d1",type:"if",  icon:"❓",text:"If i = 0 Then Exit Sub",tag:"DISTRACTOR"},
  {id:"d2",type:"call",icon:"📂",text:"Workbooks.Open(\\"datos.xlsx\\")",tag:"DISTRACTOR"},
  {id:"d3",type:"set", icon:"📌",text:"Set ws = Workbooks(1).Sheets(2)",tag:"DISTRACTOR"},
  {id:"d4",type:"loop",icon:"🔁",text:"Do While i < 100 : i = i + 1 : Loop",tag:"DISTRACTOR"},
  {id:"d5",type:"call",icon:"💾",text:"ActiveWorkbook.SaveAs \\"backup.xlsx\\"",tag:"DISTRACTOR"},
];

let bankBlocks=[], dropSlots=[], dragSrc=null, hintsLeft=3, attempts=0;

function openScratch(){
  hintsLeft=3;attempts=0;
  document.getElementById("hintCount").textContent="Pistas: 3";
  document.getElementById("attemptCount").textContent="0";
  document.getElementById("btnHint").disabled=false;
  document.getElementById("feedbackBar").className="feedback-bar";
  reshuffleBlocks();
  document.getElementById("scratchModal").classList.add("open");
}

function closeScratch(){document.getElementById("scratchModal").classList.remove("open");}

function reshuffleBlocks(){
  const all=[...CORRECT_BLOCKS,...DECOYS].map(b=>({...b,placed:false}));
  bankBlocks=all.sort(()=>Math.random()-.5);
  dropSlots=Array(CORRECT_BLOCKS.length).fill(null);
  document.getElementById("feedbackBar").className="feedback-bar";
  renderBank();renderDropZone();
}

function renderBank(){
  const c=document.getElementById("bankSlots");c.innerHTML="";
  bankBlocks.filter(b=>!b.placed).forEach(b=>c.appendChild(makeBlock(b,"bank",null)));
}

function renderDropZone(){
  const zone=document.getElementById("dropZone");zone.innerHTML="";
  dropSlots.forEach((block,idx)=>{
    const slot=document.createElement("div");
    slot.className="drop-slot"+(block?" filled":"");
    slot.dataset.idx=idx;
    const num=document.createElement("span");num.className="slot-num";num.textContent=(idx+1)+".";
    slot.appendChild(num);
    if(block){
      const bl=makeBlock(block,"slot",idx);bl.classList.add("in-slot");
      slot.appendChild(bl);
    } else {
      const ph=document.createElement("span");ph.style.cssText="font-size:10px;color:var(--text3);margin-left:4px;";ph.textContent="Arrastra aquí...";slot.appendChild(ph);
    }
    slot.addEventListener("dragover",e=>{e.preventDefault();slot.classList.add("drag-over");});
    slot.addEventListener("dragleave",()=>slot.classList.remove("drag-over"));
    slot.addEventListener("drop",e=>{e.preventDefault();slot.classList.remove("drag-over");handleDrop(idx);});
    zone.appendChild(slot);
  });
}

function makeBlock(block,source,slotIdx){
  const el=document.createElement("div");
  el.className=\`block block-\${block.type}\`;
  el.draggable=true;
  el.innerHTML=\`<span class="block-icon">\${block.icon}</span><span style="flex:1;line-height:1.4">\${block.text}</span><span class="block-tag">\${block.tag}</span>\`;
  el.addEventListener("dragstart",()=>{dragSrc={block,source,slotIdx};el.classList.add("dragging");});
  el.addEventListener("dragend",()=>el.classList.remove("dragging"));
  if(source==="slot"){el.title="Clic para devolver al banco";el.addEventListener("click",()=>returnToBank(block,slotIdx));}
  return el;
}

function handleDrop(targetIdx){
  if(!dragSrc)return;
  const{block,source,slotIdx}=dragSrc;
  if(dropSlots[targetIdx]){
    const d=dropSlots[targetIdx];d.placed=false;
    if(!bankBlocks.find(b=>b.id===d.id))bankBlocks.push(d);
  }
  if(source==="bank"){bankBlocks=bankBlocks.filter(b=>b.id!==block.id);}
  else if(source==="slot"){dropSlots[slotIdx]=null;}
  block.placed=true;dropSlots[targetIdx]=block;
  dragSrc=null;renderBank();renderDropZone();
}

function returnToBank(block,slotIdx){
  dropSlots[slotIdx]=null;block.placed=false;
  if(!bankBlocks.find(b=>b.id===block.id))bankBlocks.push(block);
  renderBank();renderDropZone();
}

async function verifyOrder(){
  attempts++;document.getElementById("attemptCount").textContent=attempts;

  if(dropSlots.some(s=>s===null)){
    showFeedback("err",\`⚠ Faltan \${dropSlots.filter(s=>s===null).length} bloque(s) por colocar. Necesitas \${CORRECT_BLOCKS.length} pasos.\`);
    shakeDrop();return;
  }

  const hasDecoy=dropSlots.some(b=>DECOYS.find(d=>d.id===b.id));
  if(hasDecoy){
    const decoyBlock=dropSlots.find(b=>DECOYS.find(d=>d.id===b.id));
    showFeedback("err",\`✘ Error: "\${decoyBlock.text}" es un distractor y no pertenece a esta macro. Revísalo.\`);
    shakeDrop();addLog(\`[Reto] Distractor detectado: "\${decoyBlock.text}"\`,"warn");return;
  }

  let firstWrong=-1;
  for(let i=0;i<CORRECT_BLOCKS.length;i++){
    if(!dropSlots[i]||dropSlots[i].id!==CORRECT_BLOCKS[i].id){firstWrong=i;break;}
  }

  if(firstWrong===-1){
    showFeedback("ok",\`✔ ¡Perfecto! Orden correcto en \${attempts} intento(s). Ejecutando macro... 🚀\`);
    addLog("[Reto] ¡Orden correcto! Lanzando macro automáticamente.","ok");
    const box=document.querySelector(".modal-box");box.classList.add("bounce-anim");
    setTimeout(()=>box.classList.remove("bounce-anim"),400);
    // Notificamos éxito al componente React padre
    window.parent.postMessage({ type: 'QUIZ_SUCCESS' }, '*');
    await delay(1500);closeScratch();await delay(400);runMacro();
  } else {
    const b=dropSlots[firstWrong];
    const expected=CORRECT_BLOCKS[firstWrong];
    showFeedback("err",\`✘ Paso \${firstWrong+1} incorrecto: pusiste "\${b.text}" pero aquí va "\${expected.text}".\`);
    shakeDrop();
    addLog(\`[Reto] Error paso \${firstWrong+1}: esperaba "\${expected.tag}", encontró "\${b.tag}"\`,"warn");
  }
}

function showFeedback(type,msg){
  const bar=document.getElementById("feedbackBar");
  bar.className=\`feedback-bar \${type}\`;
  bar.innerHTML=\`<span>\${type==="ok"?"✅":"❌"} \${msg}</span>\`;
}

function shakeDrop(){
  const z=document.getElementById("dropZone");z.classList.add("shake");setTimeout(()=>z.classList.remove("shake"),400);
}

function giveHint(){
  if(hintsLeft<=0)return;
  for(let i=0;i<CORRECT_BLOCKS.length;i++){
    const correct=CORRECT_BLOCKS[i];
    if(!dropSlots[i]||dropSlots[i].id!==correct.id){
      if(dropSlots[i]){const d=dropSlots[i];d.placed=false;if(!bankBlocks.find(b=>b.id===d.id))bankBlocks.push(d);}
      let found=bankBlocks.find(b=>b.id===correct.id);
      if(found){bankBlocks=bankBlocks.filter(b=>b.id!==found.id);}
      else{
        const oi=dropSlots.findIndex(b=>b&&b.id===correct.id);
        if(oi>-1){found=dropSlots[oi];dropSlots[oi]=null;}
      }
      if(found){found.placed=true;dropSlots[i]=found;}
      hintsLeft--;
      document.getElementById("hintCount").textContent=\`Pistas: \${hintsLeft}\`;
      if(hintsLeft<=0)document.getElementById("btnHint").disabled=true;
      addLog(\`[Pista] Paso \${i+1} resuelto: "\${correct.text}"\`,"info");
      renderBank();renderDropZone();return;
    }
  }
  showFeedback("ok","¡Ya todos los bloques están en el lugar correcto!");
}

initStudents("normal");
renderTable();
</script>
</body>
</html>
  `;

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '620px', borderRadius: '0 0 2rem 2rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <iframe 
        srcDoc={htmlContent} 
        style={{ width: '100%', height: '100%', flex: 1, border: 'none' }} 
        title="MiniExcel — Calificaciones"
      />
    </div>
  );
}
