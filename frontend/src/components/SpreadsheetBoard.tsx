import { useState, useRef, useCallback, useEffect } from 'react';
import './SpreadsheetBoard.css';

interface Student {
  nombre: string;
  grupo: string;
  notas: number[];
  promedio: number | null;
  estado: string | null;
}

interface Block {
  id: string;
  type: string;
  icon: string;
  text: string;
  tag: string;
}

const NOMBRES = [
  "Valentina Torres","Santiago Gómez","Mariana López","Juan Rodríguez","Camila Martínez",
  "Andrés Herrera","Isabella Castro","Diego Morales","Sofía Jiménez","Sebastián Ruiz",
  "Luciana Vargas","Felipe Mendoza","Daniela Reyes","Mateo Álvarez","Paula Sánchez",
  "Tomás Ortega","Gabriela Pérez","Nicolás Rivera","Verónica Flores","Esteban Romero"
];

const GRUPOS = ["G1","G1","G1","G1","G2","G2","G2","G2","G3","G3","G3","G3","G4","G4","G4","G5","G5","G5","G5","G5"];

const CORRECT_BLOCKS: Block[] = [
  {id:"b1",type:"declare",icon:"📦",text:"Dim ws, lastRow, i, prom As Double",tag:"DECLARAR"},
  {id:"b2",type:"set",    icon:"📌",text:"Set ws = ThisWorkbook.ActiveSheet",tag:"APUNTAR"},
  {id:"b3",type:"set",    icon:"🔢",text:"lastRow = ws.Cells(Rows.Count,1).End(xlUp).Row",tag:"RANGO"},
  {id:"b4",type:"call",   icon:"🧹",text:'ws.Range("A2:J" & lastRow).Interior.ColorIndex = xlNone',tag:"LIMPIAR"},
  {id:"b5",type:"loop",   icon:"🔁",text:"For i = 2 To lastRow",tag:"BUCLE"},
  {id:"b6",type:"call",   icon:"➕",text:"prom = WorksheetFunction.Average(ws.Range(Cells(i,3),Cells(i,7)))",tag:"CALCULAR"},
  {id:"b7",type:"if",     icon:"❓",text:"If prom < 3.0 Then → color rojo / Else → sin color",tag:"CONDICIONAL"},
  {id:"b8",type:"call",   icon:"✍️", text:"ws.Cells(i,8).Value = Round(prom, 2)",tag:"ESCRIBIR"},
  {id:"b9",type:"end",    icon:"↩️", text:"Next i",tag:"FIN BUCLE"},
  {id:"b10",type:"call",  icon:"📊",text:"Insertar fila PROMEDIO, MÍN y MÁX al final",tag:"ESTADÍSTICAS"},
  {id:"b11",type:"end",   icon:"🏁",text:"End Sub",tag:"FIN MACRO"},
];

const DECOYS: Block[] = [
  {id:"d1",type:"if",  icon:"❓",text:"If i = 0 Then Exit Sub",tag:"DISTRACTOR"},
  {id:"d2",type:"call",icon:"📂",text:'Workbooks.Open("datos.xlsx")',tag:"DISTRACTOR"},
  {id:"d3",type:"set", icon:"📌",text:"Set ws = Workbooks(1).Sheets(2)",tag:"DISTRACTOR"},
  {id:"d4",type:"loop",icon:"🔁",text:"Do While i < 100 : i = i + 1 : Loop",tag:"DISTRACTOR"},
  {id:"d5",type:"call",icon:"💾",text:'ActiveWorkbook.SaveAs "backup.xlsx"',tag:"DISTRACTOR"},
];

function rand(a: number, b: number) {
  return Math.round((Math.random() * (b - a) + a) * 10) / 10;
}

function initStudents(mode: 'normal' | 'worst' = 'normal'): Student[] {
  return NOMBRES.map((nombre, i) => {
    let notas: number[];
    if (mode === 'worst') {
      const f = Math.random() < 0.6;
      notas = [f ? rand(1,2.9) : rand(3,5), f ? rand(1,2.9) : rand(3,5), rand(1.5,4.5), f ? rand(1.5,2.8) : rand(3,5), rand(1,5)];
    } else {
      notas = [rand(2,5), rand(2,5), rand(2.5,5), rand(2.5,5), rand(1.5,5)];
    }
    return { nombre, grupo: GRUPOS[i], notas, promedio: null, estado: null };
  });
}

interface SpreadsheetBoardProps {
  challengeId: string;
  onValidation: (success: boolean) => void;
}

export function SpreadsheetBoard({ challengeId, onValidation }: SpreadsheetBoardProps) {
  const [students, setStudents] = useState<Student[]>(() => initStudents('normal'));
  const [macroRan, setMacroRan] = useState(false);
  const [filter, setFilter] = useState('all');
  const [logs, setLogs] = useState<string[]>(["💡 Haz clic en ▶ Ejecutar Macro para ver la secuencia o en 🧩 Ordenar Macro para practicar el orden de los bloques."]);
  const [modalOpen, setModalOpen] = useState(false);
  const [bankBlocks, setBankBlocks] = useState<Block[]>([]);
  const [dropSlots, setDropSlots] = useState<(Block | null)[]>(Array(CORRECT_BLOCKS.length).fill(null));
  const [hintsLeft, setHintsLeft] = useState(3);
  const [attempts, setAttempts] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState<'ok' | 'err' | ''>('');
  const [shakeDrop, setShakeDrop] = useState(false);
  const [dragSrc, setDragSrc] = useState<{ block: Block; source: 'bank' | 'slot'; slotIdx: number | null } | null>(null);
  const [running, setRunning] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const filtered = filter === 'all' ? students : students.filter(s => s.grupo === filter);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => {
      const ts = new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return [...prev, `[${ts}] ${msg}`];
    });
  }, []);

  const clearLog = useCallback(() => setLogs([]), []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    if (modalOpen) {
      setHintsLeft(3);
      setAttempts(0);
      setFeedbackMsg('');
      setFeedbackType('');
      reshuffleBlocks();
    }
  }, [modalOpen]);

  const updateNota = (si: number, ni: number, val: string) => {
    const v = Math.min(5, Math.max(0, parseFloat(val) || 0));
    setStudents(prev => {
      const next = [...prev];
      next[si] = { ...next[si], notas: [...next[si].notas] };
      next[si].notas[ni] = v;
      if (macroRan) {
        const prom = next[si].notas.reduce((a, b) => a + b, 0) / 5;
        next[si].promedio = prom;
        next[si].estado = prom >= 3 ? 'APRUEBA' : 'REPRUEBA';
        addLog(`Actualizado → ${next[si].nombre}: ${prom.toFixed(2)}`);
      }
      return next;
    });
  };

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  const runMacro = async () => {
    if (running) return;
    setRunning(true);
    setMacroRan(false);
    clearLog();
    const steps = [
      { m: "Iniciando Sub AutoCalificaciones()", t: "info" },
      { m: "Dim ws, lastRow, i, prom — variables declaradas", t: "plain" },
      { m: "Set ws = ActiveSheet", t: "plain" },
      { m: "lastRow = " + (students.length + 1) + " filas detectadas", t: "plain" },
      { m: "Limpiando formatos anteriores...", t: "plain" },
      { m: "For i = 2 To lastRow — iniciando bucle", t: "plain" },
      { m: "prom = Average(C:G) — calculando promedios", t: "plain" },
      { m: "If prom < 3.0 → Interior.Color = RGB(255,80,80)", t: "warn" },
      { m: "Cells(i,8) = Round(prom,2) — escribiendo promedio", t: "plain" },
      { m: "Next i — fin de bucle", t: "plain" },
      { m: "Insertando fila PROMEDIO / MÍN / MÁX", t: "plain" },
    ];
    for (const s of steps) {
      await delay(180);
      addLog(s.m);
    }
    setStudents(prev => prev.map(s => {
      const prom = s.notas.reduce((a, b) => a + b, 0) / s.notas.length;
      return { ...s, promedio: prom, estado: prom >= 3 ? 'APRUEBA' : 'REPRUEBA' };
    }));
    setMacroRan(true);
    const fails = students.filter(s => {
      const prom = s.notas.reduce((a, b) => a + b, 0) / s.notas.length;
      return prom < 3;
    }).length;
    addLog(`✔ Macro completada. ${fails} reprobado(s) resaltados en rojo.`);
    onValidation(true);
    setRunning(false);
  };

  const shuffleGrades = () => {
    setStudents(initStudents('normal'));
    setMacroRan(false);
    clearLog();
    addLog("Notas aleatorizadas. Ejecuta la macro.");
  };

  const fillWorstCase = () => {
    setStudents(initStudents('worst'));
    setMacroRan(false);
    clearLog();
    addLog("⚠ Caso crítico cargado.");
  };

  const resetSheet = () => {
    setStudents(initStudents('normal'));
    setMacroRan(false);
    setFilter('all');
    clearLog();
    addLog("Hoja restablecida.");
  };

  const reshuffleBlocks = () => {
    const all: Block[] = [...CORRECT_BLOCKS.map(b => ({ ...b })), ...DECOYS.map(b => ({ ...b }))];
    setBankBlocks(all.sort(() => Math.random() - 0.5));
    setDropSlots(Array(CORRECT_BLOCKS.length).fill(null));
    setFeedbackMsg('');
    setFeedbackType('');
  };

  const handleDragStart = (block: Block, source: 'bank' | 'slot', slotIdx: number | null) => {
    setDragSrc({ block, source, slotIdx });
  };

  const handleDrop = (targetIdx: number) => {
    if (!dragSrc) return;
    const { block, source, slotIdx } = dragSrc;
    setDragSrc(null);

    if (source === 'bank') {
      setBankBlocks(prev => prev.filter(b => b.id !== block.id));
    }

    setDropSlots(prev => {
      const next = [...prev];
      const existing = next[targetIdx];
      if (existing && !prev.some((_, i) => i !== targetIdx && prev[i]?.id === existing.id)) {
        setBankBlocks(bk => (bk.some(b => b.id === existing.id) ? bk : [...bk, existing]));
      }
      if (source === 'slot' && slotIdx !== null) {
        next[slotIdx] = null;
      }
      next[targetIdx] = block;
      return next;
    });
  };

  const returnToBank = (block: Block, slotIdx: number) => {
    setDropSlots(prev => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
    if (!bankBlocks.find(b => b.id === block.id)) {
      setBankBlocks(prev => [...prev, block]);
    }
  };

  const verifyOrder = async () => {
    setAttempts(prev => prev + 1);
    if (dropSlots.some(s => s === null)) {
      setFeedbackType('err');
      setFeedbackMsg(`⚠ Faltan ${dropSlots.filter(s => s === null).length} bloque(s) por colocar. Necesitas ${CORRECT_BLOCKS.length} pasos.`);
      setShakeDrop(true);
      setTimeout(() => setShakeDrop(false), 400);
      return;
    }
    const hasDecoy = dropSlots.some(b => DECOYS.find(d => d.id === b!.id));
    if (hasDecoy) {
      const decoyBlock = dropSlots.find(b => DECOYS.find(d => d.id === b!.id));
      setFeedbackType('err');
      setFeedbackMsg(`✘ Error: "${decoyBlock?.text}" es un distractor y no pertenece a esta macro. Revísalo.`);
      setShakeDrop(true);
      setTimeout(() => setShakeDrop(false), 400);
      addLog(`[Reto] Distractor detectado: "${decoyBlock?.text}"`);
      return;
    }
    let firstWrong = -1;
    for (let i = 0; i < CORRECT_BLOCKS.length; i++) {
      if (!dropSlots[i] || dropSlots[i]!.id !== CORRECT_BLOCKS[i].id) { firstWrong = i; break; }
    }
    if (firstWrong === -1) {
      setFeedbackType('ok');
      setFeedbackMsg(`✔ ¡Perfecto! Orden correcto en ${attempts + 1} intento(s). Ejecutando macro... 🚀`);
      addLog("[Reto] ¡Orden correcto! Lanzando macro automáticamente.");
      await delay(1500);
      setModalOpen(false);
      await delay(400);
      runMacro();
    } else {
      const b = dropSlots[firstWrong];
      const expected = CORRECT_BLOCKS[firstWrong];
      setFeedbackType('err');
      setFeedbackMsg(`✘ Paso ${firstWrong + 1} incorrecto: pusiste "${b?.text}" pero aquí va "${expected.text}".`);
      setShakeDrop(true);
      setTimeout(() => setShakeDrop(false), 400);
      addLog(`[Reto] Error paso ${firstWrong + 1}: esperaba "${expected.tag}", encontró "${b?.tag}"`);
    }
  };

  const giveHint = () => {
    if (hintsLeft <= 0) return;
    for (let i = 0; i < CORRECT_BLOCKS.length; i++) {
      const correct = CORRECT_BLOCKS[i];
      if (!dropSlots[i] || dropSlots[i]!.id !== correct.id) {
        setDropSlots(prev => {
          const next = [...prev];
          if (next[i]) {
            const d = next[i]!;
            if (!bankBlocks.find(b => b.id === d.id)) {
              setBankBlocks(bk => [...bk, d]);
            }
          }
          let found = bankBlocks.find(b => b.id === correct.id);
          if (found) {
            setBankBlocks(bk => bk.filter(b => b.id !== found!.id));
          } else {
            const oi = next.findIndex(b => b && b.id === correct.id);
            if (oi > -1) {
              found = next[oi];
              next[oi] = null;
            }
          }
          if (found) next[i] = found;
          return next;
        });
        setHintsLeft(prev => prev - 1);
        addLog(`[Pista] Paso ${i + 1} resuelto: "${correct.text}"`);
        return;
      }
    }
    setFeedbackType('ok');
    setFeedbackMsg("¡Ya todos los bloques están en el lugar correcto!");
  };

  const stats = macroRan ? (() => {
    const proms = filtered.map(s => s.promedio!);
    const pass = proms.filter(p => p >= 3).length;
    const fail = proms.filter(p => p < 3).length;
    const avg = proms.reduce((a, b) => a + b, 0) / proms.length;
    return { total: filtered.length, avg, pass, fail };
  })() : null;

  return (
    <div className="sb-root">
      {/* Header */}
      <div className="sb-header">
        <div className="sb-logo">⬛ MiniExcel <span>v1.0</span></div>
        <div className="sb-sep" />
        <div className="sb-filename">calificaciones_grupos.xlsx</div>
        <div className="sb-header-spacer" />
        <div className="sb-header-info">{students.length} estudiantes · 5 grupos</div>
      </div>

      {/* Formula bar */}
      <div className="sb-formula-bar">
        <div className="sb-cell-ref">A1</div>
        <div className="sb-fx-icon">fx</div>
        <input className="sb-formula-input" readOnly value="=PROMEDIO(C2:G2)" />
      </div>

      {/* Toolbar */}
      <div className="sb-toolbar">
        <div className="sb-tb-group">
          <span className="sb-tb-label">Macro</span>
          <button className="sb-btn sb-btn-macro" onClick={runMacro} disabled={running}>▶ Ejecutar Macro</button>
          <button className="sb-btn" onClick={resetSheet}>↺ Resetear</button>
        </div>
        <div className="sb-tb-group">
          <span className="sb-tb-label">Datos</span>
          <button className="sb-btn" onClick={shuffleGrades}>⟳ Aleatorizar notas</button>
          <button className="sb-btn" onClick={fillWorstCase}>⚠ Caso crítico</button>
        </div>
        <div className="sb-tb-group">
          <span className="sb-tb-label">Reto</span>
          <button className="sb-btn sb-btn-scratch" onClick={() => setModalOpen(true)}>🧩 Ordenar Macro</button>
        </div>
      </div>

      {/* Group tabs */}
      <div className="sb-group-tabs">
        {['all', 'G1', 'G2', 'G3', 'G4', 'G5'].map(g => (
          <div key={g} className={`sb-gtab ${filter === g ? 'active' : ''}`} onClick={() => setFilter(g)}>
            {g === 'all' ? 'Todos' : g}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="sb-body">
        <div className="sb-sheet-panel">
          <div className="sb-table-wrap">
            <table className="sb-table">
              <thead>
                <tr>
                  <th className="sb-col-idx">#</th>
                  <th className="sb-col-nombre">Nombre</th>
                  <th>Grupo</th>
                  <th>Parcial 1</th><th>Parcial 2</th><th>Parcial 3</th>
                  <th>Trabajo</th><th>Final</th>
                  <th>Promedio</th><th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, vi) => {
                  const gi = students.indexOf(s);
                  const rowClass = macroRan ? (s.promedio! < 3 ? 'sb-row-fail' : 'sb-row-pass') : '';
                  return (
                    <tr key={gi} className={rowClass}>
                      <td className="sb-row-idx">{gi + 1}</td>
                      <td className="sb-cell-nombre">{s.nombre}</td>
                      <td className="sb-cell-grupo">{s.grupo}</td>
                      {s.notas.map((n, j) => (
                        <td key={j} className="sb-cell-nota">
                          <input
                            type="number" min="0" max="5" step="0.1"
                            value={n.toFixed(1)}
                            onChange={e => updateNota(gi, j, e.target.value)}
                          />
                        </td>
                      ))}
                      <td className="sb-cell-prom">{macroRan ? s.promedio!.toFixed(2) : '—'}</td>
                      <td className="sb-cell-result">
                        {macroRan ? (
                          <span className={`sb-badge ${s.promedio! >= 3 ? 'sb-badge-pass' : 'sb-badge-fail'}`}>
                            {s.promedio! >= 3 ? 'APRUEBA' : 'REPRUEBA'}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {macroRan && (
                <tbody className="sb-summary-section">
                  {(() => {
                    const proms = filtered.map(s => s.promedio!);
                    const nc = [0,1,2,3,4].map(j => filtered.map(s => s.notas[j]));
                    const avg = proms.reduce((a,b) => a+b, 0) / proms.length;
                    const cAvg = nc.map(c => c.reduce((a,b) => a+b, 0) / c.length);
                    const cMin = nc.map(c => Math.min(...c));
                    const cMax = nc.map(c => Math.max(...c));
                    const row = (label: string, vals: number[], cls: string, pv: number) => (
                      <tr className={cls}>
                        <td className="sb-row-idx" />
                        <td className="sb-cell-nombre" style={{ fontFamily: 'var(--sb-mono)' }}>{label}</td>
                        <td />
                        {vals.map((x, i) => <td key={i} className="sb-cell-nota" style={{ textAlign: 'center' }}>{x.toFixed(2)}</td>)}
                        <td className="sb-cell-prom">{pv.toFixed(2)}</td>
                        <td />
                      </tr>
                    );
                    return (
                      <>
                        <tr className="sb-s-label">
                          <td className="sb-row-idx" />
                          <td className="sb-cell-nombre" colSpan={9}>— Estadísticas —</td>
                        </tr>
                        {row('PROMEDIO', cAvg, 'sb-s-avg', avg)}
                        {row('MÍNIMO', cMin, 'sb-s-min', Math.min(...proms))}
                        {row('MÁXIMO', cMax, 'sb-s-max', Math.max(...proms))}
                      </>
                    );
                  })()}
                </tbody>
              )}
            </table>
          </div>
        </div>

        {/* Side panel */}
        <div className="sb-side-panel">
          <div className="sb-side-title">📊 Panel de análisis</div>
          <div className="sb-stats-grid">
            <div className="sb-stat-card sb-stat-total">
              <div className="sb-stat-label">Total</div>
              <div className="sb-stat-value">{stats ? stats.total : filtered.length}</div>
              <div className="sb-stat-sub">estudiantes</div>
            </div>
            <div className="sb-stat-card sb-stat-avg">
              <div className="sb-stat-label">Promedio</div>
              <div className="sb-stat-value">{stats ? stats.avg.toFixed(2) : '—'}</div>
              <div className="sb-stat-sub">general</div>
            </div>
            <div className="sb-stat-card sb-stat-pass">
              <div className="sb-stat-label">Aprobados</div>
              <div className="sb-stat-value">{stats ? stats.pass : '—'}</div>
              <div className="sb-stat-sub">nota ≥ 3.0</div>
            </div>
            <div className="sb-stat-card sb-stat-fail">
              <div className="sb-stat-label">Reprobados</div>
              <div className="sb-stat-value">{stats ? stats.fail : '—'}</div>
              <div className="sb-stat-sub">nota &lt; 3.0</div>
            </div>
          </div>
          <div className="sb-instructions">
            <div className="sb-section-label">📋 Instrucciones</div>
            <ol>
              <li><b>▶ Ejecutar Macro</b> — Corre la macro completa paso a paso.</li>
              <li><b>🧩 Ordenar Macro</b> — Arrastra los bloques al orden correcto.</li>
              <li>Si aciertas el orden, la macro se ejecuta automáticamente 🚀</li>
              <li>Usa <b>💡 Pista</b> si te trabas (3 disponibles).</li>
            </ol>
          </div>
          <div className="sb-side-title" style={{ borderTop: '1px solid var(--sb-border)', paddingTop: '8px', marginTop: '4px' }}>Log de ejecución</div>
          <div className="sb-log-section" ref={logRef}>
            {logs.map((msg, i) => (
              <div key={i} className="sb-log-entry sb-log-plain">{msg}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ MODAL SCRATCH ═══ */}
      {modalOpen && (
        <div className="sb-modal-overlay open" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="sb-modal-box">
            <div className="sb-modal-header">
              <div style={{ flex: 1 }}>
                <div className="sb-modal-header-title">🧩 Reto: Ordena los bloques de la Macro</div>
                <div className="sb-modal-header-sub">Arrastra los pasos al orden correcto · Si aciertas, la macro se ejecuta</div>
              </div>
              <button className="sb-modal-close" onClick={() => setModalOpen(false)}>✕ cerrar</button>
            </div>

            <div className="sb-scratch-instr">
              <span>⚡</span>
              <span>Una macro VBA/Apps Script sigue una <b>secuencia lógica estricta</b>. Arrastra los bloques correctos a la columna derecha en el orden que deben ejecutarse. Los bloques <b>distractores</b> no pertenecen a esta macro — ten cuidado.</span>
            </div>

            <div className="sb-scratch-work">
              <div className="sb-scratch-bank">
                <div className="sb-section-label">Bloques disponibles</div>
                <div className="sb-bank-slots">
                  {bankBlocks.map(block => (
                    <div
                      key={block.id}
                      className={`sb-block sb-block-${block.type}`}
                      draggable
                      onDragStart={() => handleDragStart(block, 'bank', null)}
                    >
                      <span className="sb-block-icon">{block.icon}</span>
                      <span className="sb-block-text">{block.text}</span>
                      <span className="sb-block-tag">{block.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sb-scratch-drop-zone">
                <div className="sb-section-label">Secuencia de ejecución (ordena aquí)</div>
                <div className={`sb-drop-slots ${shakeDrop ? 'shake' : ''}`}>
                  {dropSlots.map((block, idx) => (
                    <div
                      key={idx}
                      className={`sb-drop-slot ${block ? 'filled' : ''}`}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); handleDrop(idx); }}
                    >
                      <span className="sb-slot-num">{idx + 1}.</span>
                      {block ? (
                        <div
                          className={`sb-block sb-block-${block.type} sb-in-slot`}
                          title="Clic para devolver al banco"
                          onClick={() => returnToBank(block, idx)}
                        >
                          <span className="sb-block-icon">{block.icon}</span>
                          <span className="sb-block-text">{block.text}</span>
                          <span className="sb-block-tag">{block.tag}</span>
                        </div>
                      ) : (
                        <span className="sb-slot-placeholder">Arrastra aquí...</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {feedbackMsg && (
              <div className={`sb-feedback-bar ${feedbackType}`}>
                <span>{feedbackType === 'ok' ? '✅' : '❌'} {feedbackMsg}</span>
              </div>
            )}

            <div className="sb-scratch-footer">
              <button className="sb-btn sb-btn-verify" onClick={verifyOrder}>✔ Verificar</button>
              <button className="sb-btn sb-btn-hint" onClick={giveHint} disabled={hintsLeft <= 0}>💡 Pista</button>
              <button className="sb-btn" onClick={reshuffleBlocks}>⟳ Mezclar</button>
              <span className="sb-hint-count">Pistas: {hintsLeft}</span>
              <div className="sb-score-display">Intentos: <b>{attempts}</b></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
