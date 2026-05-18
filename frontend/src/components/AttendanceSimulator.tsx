import React, { useState, useRef, useEffect } from 'react';

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

export function AttendanceSimulator({ onValidation }: { onValidation?: (success: boolean) => void }) {
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
      setBubble({ html: "<span style='color:#791F1F'>Ya usaste tu intento.</span>", cls: "err" });
      return;
    }
    setUsedAttempt(true);

    let mal = 0;
    blocks.forEach((b, i) => { if (b.correct !== i) mal++; });

    if (mal > 0) {
      const txt = mal === 1 ? "Solo te equivocaste en <b>1</b> posición." : `Los bloques no están en orden (<b>${mal}</b> mal).`;
      addLog("cb-err", "ERROR", txt + " Has perdido tu único intento.");
      setBubble({ html: `<span style='color:#791F1F'>${txt}<br>Presiona <b>Reiniciar</b>.</span>`, cls: "err" });
      if (onValidation) onValidation(false);
      return;
    }

    if (onValidation) onValidation(true);
    
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
        .sim-app { border-radius: 0 0 2rem 2rem; overflow: hidden; background: #fff; text-align: left; }
        .sim-topbar { background: #534AB7; padding: 10px 16px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .sim-topbar-title { color: #fff; font-size: 15px; font-weight: 500; flex: 1; display: flex; align-items: center; gap: 6px; margin: 0; }
        .sim-run-btn { display: flex; align-items: center; gap: 5px; padding: 7px 16px; border-radius: 20px; background: #FAC775; color: #412402; font-size: 13px; font-weight: 500; cursor: pointer; border: none; font-family: inherit; transition: background .15s; }
        .sim-run-btn:hover { background: #EF9F27; }
        .sim-run-btn:disabled { background: #D3D1C7; color: #888; cursor: not-allowed; }
        .sim-reset-btn { display: flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 20px; background: transparent; color: #CECBF6; border: 1.5px solid #7F77DD; font-size: 13px; cursor: pointer; font-family: inherit; }
        .sim-reset-btn:hover { background: #3C3489; color: #fff; }
        
        .sim-body { display: grid; grid-template-columns: 260px 1fr; min-height: 450px; }
        @media (max-width: 600px) { .sim-body { grid-template-columns: 1fr; } }
        
        .sim-blocks { background: #F0EDFF; border-right: 0.5px solid #AFA9EC; padding: 10px 8px; display: flex; flex-direction: column; gap: 5px; }
        .sim-blocks-head { font-size: 10px; font-weight: 500; letter-spacing: .07em; color: #534AB7; text-transform: uppercase; padding: 2px 6px; margin-bottom: 2px; }
        .sim-blk { border-radius: 8px; padding: 8px 10px; font-size: 12px; font-weight: 500; display: flex; align-items: flex-start; gap: 7px; line-height: 1.4; transition: transform .12s; cursor: grab; user-select: none; }
        .sim-blk:active { cursor: grabbing; }
        .sim-blk i { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
        .sim-blk.active { outline: 3px solid #185FA5; outline-offset: 1px; transform: scale(1.03); z-index: 10; }
        
        .blk-start { background: #FAC775; color: #412402; }
        .blk-list { background: #B5D4F4; color: #042C53; }
        .blk-loop { background: #9FE1CB; color: #04342C; }
        .blk-ask { background: #CECBF6; color: #26215C; }
        .blk-val { background: #F5C4B3; color: #4A1B0C; }
        .blk-cnt { background: #C0DD97; color: #173404; }
        .blk-show { background: #FAC775; color: #412402; }
        .blk-end { background: #D3D1C7; color: #2C2C2A; }
        
        .sim-blk + .sim-blk { border-top: 2px dashed #AFA9EC; margin-top: 0; }
        .sim-blk.dragging { opacity: 0.4; }
        .sim-blk.drag-over { border-top: 3px solid #185FA5; }
        
        .sim-stage { display: flex; flex-direction: column; background: #fff; overflow: hidden; }
        .sim-instr { background: #FAEEDA; border-bottom: 1px solid #FAC775; padding: 8px 14px; font-size: 12px; color: #412402; line-height: 1.5; margin: 0; }
        .sim-instr strong { color: #633806; }
        
        .sim-sprite-area { background: #E6F1FB; padding: 12px 16px; display: flex; align-items: center; gap: 14px; border-bottom: 0.5px solid #B5D4F4; min-height: 90px; }
        .sim-sprite-fig { text-align: center; }
        .sim-sprite-icon { font-size: 44px; line-height: 1; }
        .sim-sprite-lbl { font-size: 11px; color: #0C447C; font-weight: 500; margin-top: 3px; }
        .sim-bubble { background: #fff; border: 2px solid #378ADD; border-radius: 12px; padding: 9px 13px; font-size: 13px; color: #042C53; line-height: 1.5; flex: 1; position: relative; }
        .sim-bubble::before { content: ''; position: absolute; left: -11px; top: 50%; transform: translateY(-50%); border: 5px solid transparent; border-right-color: #378ADD; }
        .sim-bubble.ok { border-color: #1D9E75; color: #04342C; }
        .sim-bubble.ok::before { border-right-color: #1D9E75; }
        .sim-bubble.err { border-color: #E24B4A; color: #501313; }
        .sim-bubble.err::before { border-right-color: #E24B4A; }
        
        .sim-console { flex: 1; padding: 10px 14px; max-height: 240px; overflow-y: auto; background: #fafafa; border-bottom: 0.5px solid #D3D1C7; }
        .sim-cline { display: flex; align-items: flex-start; gap: 8px; padding: 4px 0; border-bottom: 0.5px solid #eee; font-size: 12.5px; line-height: 1.5; }
        .sim-cline:last-child { border-bottom: none; }
        .sim-cbadge { border-radius: 4px; padding: 1px 6px; font-size: 10px; font-weight: 500; flex-shrink: 0; margin-top: 2px; white-space: nowrap; }
        .cb-loop { background: #9FE1CB; color: #04342C; }
        .cb-ask { background: #CECBF6; color: #26215C; }
        .cb-ok { background: #C0DD97; color: #173404; }
        .cb-err { background: #F5C4B3; color: #4A1B0C; }
        .cb-res { background: #FAC775; color: #412402; }
        .cb-inf { background: #D3D1C7; color: #2C2C2A; }
        .sim-ctext { color: #2C2C2A; }
        .sim-ctext b { color: #042C53; }
        
        .sim-res-grid { display: none; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 12px 14px; background: #fff; }
        .sim-res-grid.show { display: grid; }
        .sim-rc { background: #F1EFE8; border-radius: 8px; padding: 10px; text-align: center; }
        .sim-rc .rl { font-size: 11px; color: #5F5E5A; margin-bottom: 4px; }
        .sim-rc .rv { font-size: 22px; font-weight: 500; color: #2C2C2A; }
        .sim-rc.rg .rv { color: #085041; }
        .sim-rc.rr .rv { color: #791F1F; }
        .sim-rc.rb .rv { color: #0C447C; }
        
        .sim-bar-wrap { height: 10px; background: #D3D1C7; border-radius: 5px; margin: 0 14px 14px; overflow: hidden; display: none; }
        .sim-bar-wrap.show { display: block; }
        .sim-bar-fill { height: 100%; background: #1D9E75; border-radius: 5px; transition: width .7s ease; }
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
