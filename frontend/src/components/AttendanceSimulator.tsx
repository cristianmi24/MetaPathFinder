import React, { useState, useRef, useEffect } from 'react';
import { type OnValidation, attempt } from '../lib/boardValidation';

const NAMES = [
  "Ana García","Luis Martínez","Sofía López","Carlos Pérez",
  "Valentina Ruiz","Juan Torres","Isabella Díaz","Sebastián Vargas",
  "Camila Moreno","Tomás Restrepo"
];

const INITIAL_BLOCKS = [
  { id: 'b0', correct: 0, typeClass: 'blk-start', icon: 'ti-player-play', text: 'Al presionar Ejecutar' },
  { id: 'b3', correct: 3, typeClass: 'blk-ask', icon: 'ti-message-question', text: 'Preguntar: ¿asistió? (sí / no)' },
  { id: 'b5', correct: 5, typeClass: 'blk-cnt', icon: 'ti-plus', text: 'Sumar a presentes o ausentes' },
  { id: 'b1', correct: 1, typeClass: 'blk-list', icon: 'ti-list', text: 'Cargar lista de 10 estudiantes' },
  { id: 'b2', correct: 2, typeClass: 'blk-loop', icon: 'ti-repeat', text: 'Repetir por cada estudiante' },
  { id: 'b4', correct: 4, typeClass: 'blk-val', icon: 'ti-alert-triangle', text: 'Si es inválido → pedir de nuevo' },
  { id: 'b6', correct: 6, typeClass: 'blk-show', icon: 'ti-chart-bar', text: 'Mostrar totales y % asistencia' },
  { id: 'b7', correct: 7, typeClass: 'blk-end', icon: 'ti-flag', text: 'Fin del programa' }
];

export function AttendanceSimulator({ challengeId, onValidation }: { challengeId?: string, onValidation?: OnValidation }) {
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
  const [running, setRunning] = useState(false);
  const [usedAttempt, setUsedAttempt] = useState(false);
  const [presentes, setPresentes] = useState(0);
  const [ausentes, setAusentes] = useState(0);
  const [pct, setPct] = useState(0);
  const [activeBlockCorrectId, setActiveBlockCorrectId] = useState<number | null>(null);
  const [bubble, setBubble] = useState({ html: "¡Ordena los bloques en la secuencia correcta! Luego presiona <strong>Ejecutar programa</strong>.", cls: "" });
  const [logs, setLogs] = useState([{ badgeCls: "cb-inf", badgeTxt: "INFO", html: "Arrastra los bloques para ordenarlos del paso 1 al final" }]);
  const [showRes, setShowRes] = useState(false);
  
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const consoleEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (idx !== draggedIdx) {
      setDragOverIdx(idx);
    }
  };

  const handleDragLeave = () => {
    setDragOverIdx(null);
  };

  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(null);
    if (draggedIdx === null || draggedIdx === idx) return;
    
    const newBlocks = [...blocks];
    const temp = newBlocks[draggedIdx];
    newBlocks[draggedIdx] = newBlocks[idx];
    newBlocks[idx] = temp;
    
    setBlocks(newBlocks);
    setDraggedIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const addLog = (badgeCls: string, badgeTxt: string, html: string) => {
    setLogs(prev => [...prev, { badgeCls, badgeTxt, html }]);
  };

  const startProgram = () => {
    if (running) return;
    if (usedAttempt) {
      addLog("cb-err", "BLOQUEADO", "Ya usaste tu único intento. Presiona <b>Reiniciar</b>.");
      setBubble({ html: "<span style='color:color-mix(in srgb, var(--color-error) 50%, var(--color-on-surface))'>Ya usaste tu intento.</span>", cls: "err" });
      return;
    }
    setUsedAttempt(true);

    let mal = 0;
    blocks.forEach((b, i) => { if (b.correct !== i) mal++; });

    if (mal > 0) {
      const txt = mal === 1 ? "Solo te equivocaste en <b>1</b> posición." : `Los bloques no están en orden (<b>${mal}</b> mal).`;
      addLog("cb-err", "ERROR", txt + " Has perdido tu único intento.");
      setBubble({ html: `<span style='color:color-mix(in srgb, var(--color-error) 50%, var(--color-on-surface))'>${txt}<br>Presiona <b>Reiniciar</b>.</span>`, cls: "err" });
      if (onValidation) onValidation(false, attempt(blocks.map(b => b.correct)));
      return;
    }

    if (onValidation) onValidation(true, attempt(blocks.map(b => b.correct)));
    
    setRunning(true);
    setPresentes(0);
    setAusentes(0);
    setShowRes(false);
    setLogs([]);

    setActiveBlockCorrectId(0);
    setBubble({ html: "¡Orden correcto! Pasando lista...", cls: "" });
    addLog("cb-inf", "INICIO", "Orden correcto. Programa iniciado.");

    setTimeout(() => {
      setActiveBlockCorrectId(1);
      addLog("cb-inf", "LISTA", "Lista cargada: <b>" + NAMES.join(", ") + "</b>");
      setBubble({ html: "Lista cargada. Revisando asistencia...", cls: "" });
      
      let currIdx = 0;
      let currPres = 0;
      let currAus = 0;

      const autoPass = () => {
        if (currIdx >= NAMES.length) {
          showResults(currPres, currAus);
          return;
        }
        setActiveBlockCorrectId(2);
        const name = NAMES[currIdx];
        setBubble({ html: `Revisando <strong>${name}</strong> (${currIdx + 1}/${NAMES.length})...`, cls: "" });
        
        setTimeout(() => {
          setActiveBlockCorrectId(3);
          const asiste = Math.random() > 0.5;
          setTimeout(() => {
            setActiveBlockCorrectId(5); // Skipping 4 (validation) visually to jump to logic
            if (asiste) {
              currPres++;
              setPresentes(currPres);
              addLog("cb-ok", "PRESENTE", `<b>${name}</b> ✓ | presentes: ${currPres}`);
              setBubble({ html: `<strong>${name}</strong> presente ✓`, cls: "ok" });
            } else {
              currAus++;
              setAusentes(currAus);
              addLog("cb-err", "AUSENTE", `<b>${name}</b> ✗ | ausentes: ${currAus}`);
              setBubble({ html: `<strong>${name}</strong> ausente ✗`, cls: "" });
            }
            currIdx++;
            setTimeout(() => autoPass(), 400);
          }, 350);
        }, 350);
      };

      setTimeout(() => autoPass(), 700);
    }, 700);
  };

  const showResults = (pres: number, aus: number) => {
    setActiveBlockCorrectId(6);
    const percentage = Math.round((pres / NAMES.length) * 100);
    setPct(percentage);
    addLog("cb-res", "RESULTADO", `Presentes: <b>${pres}</b> | Ausentes: <b>${aus}</b> | Asistencia: <b>${percentage}%</b>`);
    
    setTimeout(() => {
      setActiveBlockCorrectId(7);
      addLog("cb-inf", "FIN", "Programa completado.");
      const msg = percentage === 100 ? "¡Todos asistieron! 🎉" : percentage >= 70 ? `Buena asistencia: ${percentage}%.` : `Asistencia baja: ${percentage}%.`;
      setBubble({ html: msg, cls: percentage >= 70 ? "ok" : "" });
      setShowRes(true);
      setRunning(false);
    }, 500);
  };

  const resetProgram = () => {
    setUsedAttempt(false);
    setRunning(false);
    setPresentes(0);
    setAusentes(0);
    setPct(0);
    setActiveBlockCorrectId(null);
    setBubble({ html: "¡Ordena los bloques en la secuencia correcta! Luego presiona <strong>Ejecutar programa</strong>.", cls: "" });
    setLogs([{ badgeCls: "cb-inf", badgeTxt: "INFO", html: "Arrastra los bloques para ordenarlos del paso 1 al final" }]);
    setShowRes(false);
  };

  return (
    <div className="sim-app-wrapper" style={{ width: '100%', fontFamily: 'var(--font-sans, sans-serif)' }}>
      <style>{`
        .sim-app { border-radius: 0 0 1.25rem 1.25rem; overflow: hidden; background: var(--color-surface-container-lowest); color: var(--color-on-surface); text-align: left; }
        .sim-topbar { background: var(--color-primary); padding: 10px 16px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .sim-topbar-title { color: var(--color-on-primary); font-size: 15px; font-weight: 500; flex: 1; display: flex; align-items: center; gap: 6px; margin: 0; }
        .sim-run-btn { display: flex; align-items: center; gap: 5px; padding: 7px 16px; border-radius: 20px; background: color-mix(in srgb, #d18a1c 30%, var(--color-surface-container-lowest)); color: color-mix(in srgb, #d18a1c 40%, var(--color-on-surface)); font-size: 13px; font-weight: 500; cursor: pointer; border: none; font-family: inherit; transition: background .15s; }
        .sim-run-btn:hover { background: color-mix(in srgb, #d18a1c 50%, var(--color-surface-container-lowest)); }
        .sim-run-btn:disabled { background: var(--color-surface-container-highest); color: var(--color-on-surface-variant); cursor: not-allowed; }
        .sim-reset-btn { display: flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 20px; background: transparent; color: var(--color-on-primary); border: 1.5px solid color-mix(in srgb, var(--color-on-primary) 45%, transparent); font-size: 13px; cursor: pointer; font-family: inherit; }
        .sim-reset-btn:hover { background: color-mix(in srgb, var(--color-on-primary) 16%, transparent); }
        
        .sim-body { display: grid; grid-template-columns: 260px 1fr; min-height: 450px; }
        @media (max-width: 600px) { .sim-body { grid-template-columns: 1fr; } }
        
        .sim-blocks { background: color-mix(in srgb, var(--color-primary) 14%, var(--color-surface-container-lowest)); border-right: 0.5px solid color-mix(in srgb, var(--color-primary) 50%, var(--color-surface-container-lowest)); padding: 10px 8px; display: flex; flex-direction: column; gap: 5px; }
        .sim-blocks-head { font-size: 10px; font-weight: 500; letter-spacing: .07em; color: color-mix(in srgb, var(--color-primary) 72%, var(--color-on-surface)); text-transform: uppercase; padding: 2px 6px; margin-bottom: 2px; }
        .sim-blk { border-radius: 8px; padding: 8px 10px; font-size: 12px; font-weight: 500; display: flex; align-items: flex-start; gap: 7px; line-height: 1.4; transition: transform .12s; cursor: grab; user-select: none; }
        .sim-blk:active { cursor: grabbing; }
        .sim-blk i { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
        .sim-blk.active { outline: 3px solid color-mix(in srgb, #378ADD 72%, var(--color-on-surface)); outline-offset: 1px; transform: scale(1.03); z-index: 10; }
        
        .blk-start { background: color-mix(in srgb, #d18a1c 30%, var(--color-surface-container-lowest)); color: color-mix(in srgb, #d18a1c 40%, var(--color-on-surface)); }
        .blk-list { background: color-mix(in srgb, #378ADD 30%, var(--color-surface-container-lowest)); color: color-mix(in srgb, #378ADD 40%, var(--color-on-surface)); }
        .blk-loop { background: color-mix(in srgb, var(--color-secondary) 30%, var(--color-surface-container-lowest)); color: color-mix(in srgb, var(--color-secondary) 40%, var(--color-on-surface)); }
        .blk-ask { background: color-mix(in srgb, var(--color-primary) 30%, var(--color-surface-container-lowest)); color: color-mix(in srgb, var(--color-primary) 40%, var(--color-on-surface)); }
        .blk-val { background: color-mix(in srgb, #D85A30 30%, var(--color-surface-container-lowest)); color: color-mix(in srgb, #D85A30 40%, var(--color-on-surface)); }
        .blk-cnt { background: color-mix(in srgb, #639922 30%, var(--color-surface-container-lowest)); color: color-mix(in srgb, #639922 40%, var(--color-on-surface)); }
        .blk-show { background: color-mix(in srgb, #d18a1c 30%, var(--color-surface-container-lowest)); color: color-mix(in srgb, #d18a1c 40%, var(--color-on-surface)); }
        .blk-end { background: var(--color-surface-container-highest); color: var(--color-on-surface); }
        
        .sim-blk + .sim-blk { border-top: 2px dashed color-mix(in srgb, var(--color-primary) 50%, var(--color-surface-container-lowest)); margin-top: 0; }
        .sim-blk.dragging { opacity: 0.4; }
        .sim-blk.drag-over { border-top: 3px solid color-mix(in srgb, #378ADD 72%, var(--color-on-surface)); }
        
        .sim-stage { display: flex; flex-direction: column; background: var(--color-surface-container-lowest); overflow: hidden; }
        .sim-instr { background: color-mix(in srgb, #d18a1c 14%, var(--color-surface-container-lowest)); border-bottom: 1px solid color-mix(in srgb, #d18a1c 30%, var(--color-surface-container-lowest)); padding: 8px 14px; font-size: 12px; color: color-mix(in srgb, #d18a1c 40%, var(--color-on-surface)); line-height: 1.5; margin: 0; }
        .sim-instr strong { color: color-mix(in srgb, #d18a1c 50%, var(--color-on-surface)); }
        
        .sim-sprite-area { background: color-mix(in srgb, #378ADD 14%, var(--color-surface-container-lowest)); padding: 12px 16px; display: flex; align-items: center; gap: 14px; border-bottom: 0.5px solid color-mix(in srgb, #378ADD 30%, var(--color-surface-container-lowest)); min-height: 90px; }
        .sim-sprite-fig { text-align: center; }
        .sim-sprite-icon { font-size: 44px; line-height: 1; }
        .sim-sprite-lbl { font-size: 11px; color: color-mix(in srgb, #378ADD 50%, var(--color-on-surface)); font-weight: 500; margin-top: 3px; }
        .sim-bubble { background: var(--color-surface-container-lowest); border: 2px solid color-mix(in srgb, #378ADD 88%, var(--color-on-surface)); border-radius: 12px; padding: 9px 13px; font-size: 13px; color: color-mix(in srgb, #378ADD 40%, var(--color-on-surface)); line-height: 1.5; flex: 1; position: relative; }
        .sim-bubble::before { content: ''; position: absolute; left: -11px; top: 50%; transform: translateY(-50%); border: 5px solid transparent; border-right-color: color-mix(in srgb, #378ADD 88%, var(--color-on-surface)); }
        .sim-bubble.ok { border-color: var(--color-secondary); color: color-mix(in srgb, var(--color-secondary) 40%, var(--color-on-surface)); }
        .sim-bubble.ok::before { border-right-color: var(--color-secondary); }
        .sim-bubble.err { border-color: var(--color-error); color: color-mix(in srgb, var(--color-error) 40%, var(--color-on-surface)); }
        .sim-bubble.err::before { border-right-color: var(--color-error); }
        
        .sim-console { flex: 1; padding: 10px 14px; max-height: 240px; overflow-y: auto; background: var(--color-surface-container-low); border-bottom: 0.5px solid var(--color-surface-container-highest); }
        .sim-cline { display: flex; align-items: flex-start; gap: 8px; padding: 4px 0; border-bottom: 1px solid var(--color-outline-variant); font-size: 12.5px; line-height: 1.5; }
        .sim-cline:last-child { border-bottom: none; }
        .sim-cbadge { border-radius: 4px; padding: 1px 6px; font-size: 10px; font-weight: 500; flex-shrink: 0; margin-top: 2px; white-space: nowrap; }
        .cb-loop { background: color-mix(in srgb, var(--color-secondary) 30%, var(--color-surface-container-lowest)); color: color-mix(in srgb, var(--color-secondary) 40%, var(--color-on-surface)); }
        .cb-ask { background: color-mix(in srgb, var(--color-primary) 30%, var(--color-surface-container-lowest)); color: color-mix(in srgb, var(--color-primary) 40%, var(--color-on-surface)); }
        .cb-ok { background: color-mix(in srgb, #639922 30%, var(--color-surface-container-lowest)); color: color-mix(in srgb, #639922 40%, var(--color-on-surface)); }
        .cb-err { background: color-mix(in srgb, #D85A30 30%, var(--color-surface-container-lowest)); color: color-mix(in srgb, #D85A30 40%, var(--color-on-surface)); }
        .cb-res { background: color-mix(in srgb, #d18a1c 30%, var(--color-surface-container-lowest)); color: color-mix(in srgb, #d18a1c 40%, var(--color-on-surface)); }
        .cb-inf { background: var(--color-surface-container-highest); color: var(--color-on-surface); }
        .sim-ctext { color: var(--color-on-surface); }
        .sim-ctext b { color: color-mix(in srgb, #378ADD 40%, var(--color-on-surface)); }
        
        .sim-res-grid { display: none; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 12px 14px; background: var(--color-surface-container-lowest); }
        .sim-res-grid.show { display: grid; }
        .sim-rc { background: var(--color-surface-container); border-radius: 8px; padding: 10px; text-align: center; }
        .sim-rc .rl { font-size: 11px; color: var(--color-on-surface-variant); margin-bottom: 4px; }
        .sim-rc .rv { font-size: 22px; font-weight: 500; color: var(--color-on-surface); }
        .sim-rc.rg .rv { color: color-mix(in srgb, var(--color-secondary) 50%, var(--color-on-surface)); }
        .sim-rc.rr .rv { color: color-mix(in srgb, var(--color-error) 50%, var(--color-on-surface)); }
        .sim-rc.rb .rv { color: color-mix(in srgb, #378ADD 50%, var(--color-on-surface)); }
        
        .sim-bar-wrap { height: 10px; background: var(--color-surface-container-highest); border-radius: 5px; margin: 0 14px 14px; overflow: hidden; display: none; }
        .sim-bar-wrap.show { display: block; }
        .sim-bar-fill { height: 100%; background: var(--color-secondary); border-radius: 5px; transition: width .7s ease; }
      `}</style>
      
      <div className="sim-app">
        <div className="sim-topbar">
          <div className="sim-topbar-title">
            <i className="ti ti-puzzle" aria-hidden="true" style={{ fontSize: 16 }}></i>
            Simulador de asistencia
          </div>
          <button className="sim-run-btn" onClick={startProgram} disabled={running}>
            <i className="ti ti-player-play" aria-hidden="true"></i> Ejecutar programa
          </button>
          <button className="sim-reset-btn" onClick={resetProgram}>
            <i className="ti ti-refresh" aria-hidden="true"></i> Reiniciar
          </button>
        </div>
        
        <div className="sim-body">
          <div className="sim-blocks">
            <div className="sim-blocks-head">Arrastra los bloques</div>
            {blocks.map((blk, idx) => (
              <div
                key={blk.id}
                className={`sim-blk ${blk.typeClass} ${activeBlockCorrectId === blk.correct ? 'active' : ''} ${draggedIdx === idx ? 'dragging' : ''} ${dragOverIdx === idx ? 'drag-over' : ''}`}
                draggable={!running}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
              >
                <i className={`ti ${blk.icon}`} aria-hidden="true"></i>
                <span>{blk.text}</span>
              </div>
            ))}
          </div>
          
          <div className="sim-stage">
            <div className="sim-instr">
              <strong>Instrucciones:</strong> Arrastra los bloques de la izquierda para ponerlos en el <strong>orden correcto</strong> (de principio a fin). Luego presiona <strong>Ejecutar programa</strong>. <strong>Solo tienes 1 intento.</strong>
            </div>
            
            <div className="sim-sprite-area">
              <div className="sim-sprite-fig">
                <div className="sim-sprite-icon">👩‍🏫</div>
                <div className="sim-sprite-lbl">Profesora</div>
              </div>
              <div className={`sim-bubble ${bubble.cls}`} dangerouslySetInnerHTML={{ __html: bubble.html }}></div>
            </div>
            
            <div className="sim-console">
              {logs.map((log, i) => (
                <div className="sim-cline" key={i}>
                  <span className={`sim-cbadge ${log.badgeCls}`}>{log.badgeTxt}</span>
                  <span className="sim-ctext" dangerouslySetInnerHTML={{ __html: log.html }}></span>
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>
            
            <div className={`sim-res-grid ${showRes ? 'show' : ''}`}>
              <div className="sim-rc rg"><div className="rl">Presentes</div><div className="rv">{presentes}</div></div>
              <div className="sim-rc rr"><div className="rl">Ausentes</div><div className="rv">{ausentes}</div></div>
              <div className="sim-rc rb"><div className="rl">Asistencia</div><div className="rv">{pct}%</div></div>
            </div>
            <div className={`sim-bar-wrap ${showRes ? 'show' : ''}`}>
              <div className="sim-bar-fill" style={{ width: `${pct}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceSimulator;
