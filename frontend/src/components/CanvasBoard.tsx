import { useState, useRef, useCallback, useEffect } from 'react';
import './CanvasBoard.css';

interface StepDef {
  id: string;
  text: string;
}

const stepsA: StepDef[] = [
  {id:'a1', text:'Definir el viewBox y namespace del contenedor SVG'},
  {id:'a2', text:'Declarar gradientes y símbolos reutilizables en <defs>'},
  {id:'a3', text:'Dibujar la forma base del símbolo (rect, circle, polygon)'},
  {id:'a4', text:'Agregar formas interiores y detalles del ícono'},
  {id:'a5', text:'Incorporar el texto del nombre y eslogan'},
  {id:'a6', text:'Ajustar colores, opacidad y stroke finales'},
];
const correctA = ['a1','a2','a3','a4','a5','a6'];

const stepsB: StepDef[] = [
  {id:'b1', text:'Definir la paleta de colores (hex o variables CSS)'},
  {id:'b2', text:'Crear gradientes en <defs> si se necesitan'},
  {id:'b3', text:'Aplicar fill y stroke a las formas principales'},
  {id:'b4', text:'Ajustar opacidad y stroke-width para jerarquía visual'},
  {id:'b5', text:'Verificar contraste y legibilidad en distintos fondos'},
];
const correctB = ['b1','b2','b3','b4','b5'];

interface CanvasBoardProps {
  challengeId: string;
  onValidation: (success: boolean) => void;
}

export function CanvasBoard({ challengeId, onValidation }: CanvasBoardProps) {
  const [phase, setPhase] = useState(0);
  const totalPhases = 5;

  // Phase 1: Color editor
  const [cFill, setCFill] = useState('#7F77DD');
  const [cStroke, setCStroke] = useState('#3C3489');
  const [cOpacity, setCOpacity] = useState(0.9);
  const [cStrokeW, setCStrokeW] = useState(3);
  const [colorCode, setColorCode] = useState(`<circle cx="60" cy="60" r="45"\n  fill="#7F77DD"\n  stroke="#3C3489"\n  stroke-width="3"\n  opacity="0.9"/>`);

  // Phase 2: Logo
  const [lFill, setLFill] = useState('#7F77DD');
  const [lText, setLText] = useState('#534AB7');
  const [lRadius, setLRadius] = useState(12);

  // Phase 3: Evaluation A
  const [srcA, setSrcA] = useState<StepDef[]>([]);
  const [dropA, setDropA] = useState<StepDef[]>([]);
  const [resultA, setResultA] = useState<{ok:boolean;msg:string} | null>(null);
  const [scoreA, setScoreA] = useState(false);

  // Phase 3: Evaluation B
  const [srcB, setSrcB] = useState<StepDef[]>([]);
  const [dropB, setDropB] = useState<StepDef[]>([]);
  const [resultB, setResultB] = useState<{ok:boolean;msg:string} | null>(null);
  const [scoreB, setScoreB] = useState(false);

  // Drag state
  const [dragItem, setDragItem] = useState<{step:StepDef; source:'srcA'|'dropA'|'srcB'|'dropB'} | null>(null);

  const logRef = useRef<HTMLDivElement>(null);

  const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  useEffect(() => {
    setSrcA(shuffle(stepsA));
    setSrcB(shuffle(stepsB));
  }, []);

  useEffect(() => {
    const total = (scoreA ? 1 : 0) + (scoreB ? 1 : 0);
    onValidation(total >= 2);
  }, [scoreA, scoreB, onValidation]);

  const goPhase = (n: number) => setPhase(n);

  const updateColorPreview = useCallback(() => {
    setColorCode(`<circle cx="60" cy="60" r="45"\n  fill="${cFill}"\n  stroke="${cStroke}"\n  stroke-width="${cStrokeW}"\n  opacity="${cOpacity}"/>`);
  }, [cFill, cStroke, cOpacity, cStrokeW]);

  useEffect(() => { updateColorPreview(); }, [cFill, cStroke, cOpacity, cStrokeW, updateColorPreview]);

  // Drag handlers
  const handleDragStart = (step: StepDef, source: 'srcA'|'dropA'|'srcB'|'dropB') => {
    setDragItem({ step, source });
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDropOnSrc = (targetSource: 'srcA'|'srcB') => {
    if (!dragItem) return;
    const { step, source } = dragItem;
    if (source === targetSource) { setDragItem(null); return; }

    if (targetSource === 'srcA') {
      setSrcA(prev => [...prev, step]);
      setDropA(prev => prev.filter(s => s.id !== step.id));
    } else {
      setSrcB(prev => [...prev, step]);
      setDropB(prev => prev.filter(s => s.id !== step.id));
    }
    setDragItem(null);
  };

  const handleDropOnDrop = (targetSource: 'dropA'|'dropB', targetStep?: StepDef) => {
    if (!dragItem) return;
    const { step, source } = dragItem;

    const addToDrop = (
      setSrc: React.Dispatch<React.SetStateAction<StepDef[]>>,
      setDrop: React.Dispatch<React.SetStateAction<StepDef[]>>,
      targetStep?: StepDef
    ) => {
      if (source.startsWith('src')) {
        setSrc(prev => prev.filter(s => s.id !== step.id));
      } else {
        const srcKey = source === 'dropA' ? 'srcA' : 'srcB';
        const otherSrc = source === 'dropA' ? setSrcA : setSrcB;
        const otherDrop = source === 'dropA' ? setDropA : setDropB;
        otherDrop(prev => prev.filter(s => s.id !== step.id));
      }
      setDrop(prev => {
        if (!targetStep) return [...prev, step];
        const idx = prev.indexOf(targetStep);
        const next = [...prev];
        next.splice(idx, 0, step);
        return next;
      });
    };

    if (targetSource === 'dropA') addToDrop(setSrcA, setDropA, targetStep);
    else addToDrop(setSrcB, setDropB, targetStep);
    setDragItem(null);
  };

  const checkOrder = (
    drop: StepDef[],
    correct: string[],
    setScore: React.Dispatch<React.SetStateAction<boolean>>,
    setResult: React.Dispatch<React.SetStateAction<{ok:boolean;msg:string} | null>>
  ) => {
    if (drop.length === 0) {
      setResult({ ok: false, msg: 'Arrastra los bloques al área de respuesta primero.' });
      return;
    }
    const placed = drop.map(s => s.id);
    let allCorrect = placed.length === correct.length;
    placed.forEach((id, i) => {
      if (id !== correct[i]) allCorrect = false;
    });
    if (allCorrect) {
      setResult({ ok: true, msg: '¡Orden correcto! Excelente comprensión del flujo SVG.' });
      setScore(true);
    } else {
      setResult({ ok: false, msg: 'Hay pasos fuera de lugar. Revisa el orden e intenta de nuevo.' });
    }
  };

  const resetEval = (
    steps: StepDef[],
    setSrc: React.Dispatch<React.SetStateAction<StepDef[]>>,
    setDrop: React.Dispatch<React.SetStateAction<StepDef[]>>,
    setScore: React.Dispatch<React.SetStateAction<boolean>>,
    setResult: React.Dispatch<React.SetStateAction<{ok:boolean;msg:string} | null>>
  ) => {
    setScore(false);
    setSrc(shuffle(steps));
    setDrop([]);
    setResult(null);
  };

  const totalScore = (scoreA ? 1 : 0) + (scoreB ? 1 : 0);
  const medals = ['😐', '🏅', '🏆'];
  const msgs = [
    'Sigue practicando. Revisa las lecciones y vuelve a intentarlo.',
    '¡Bien! Dominaste un ejercicio. Completa el segundo para perfeccionar.',
    '¡Excelente! Dominas el flujo de construcción SVG y el manejo de colores.'
  ];

  const renderBlock = (step: StepDef, index: number, isDrop: boolean, dropArr: StepDef[], correct: string[]) => {
    const placed = dropArr.map(s => s.id);
    const isCorrect = placed[index] === correct[index];
    return (
      <div
        key={step.id}
        className={`cv-block ${isDrop ? (placed[index] ? (isCorrect ? 'cv-correct' : 'cv-incorrect') : '') : ''}`}
        draggable
        onDragStart={() => handleDragStart(step, isDrop ? (dropArr === dropA ? 'dropA' : 'dropB') : (dropArr === dropA ? 'srcA' : 'srcB'))}
      >
        <i className="ti ti-grip-vertical cv-drag-handle" />
        <span className="cv-block-num">{isDrop ? (isCorrect ? '✓' : '✗') : '?'}</span>
        <span>{step.text}</span>
      </div>
    );
  };

  return (
    <div className="cv-root">
      <h2 className="cv-sr-only">Módulo interactivo: diseño de logos y estructuras en SVG</h2>
      <div className="cv-module">
        <div className="cv-progress-bar">
          <div className="cv-progress-fill" style={{ width: `${((phase + 1) / totalPhases) * 100}%` }} />
        </div>

        <div className="cv-phase-tabs">
          {['Estructura SVG', 'Paleta de colores', 'Diseño de logo', 'Evaluación', 'Resultado'].map((label, i) => (
            <div
              key={i}
              className={`cv-phase-tab ${phase === i ? 'active' : ''} ${phase > i ? 'done' : ''}`}
              onClick={() => goPhase(i)}
            >
              {label}
            </div>
          ))}
        </div>

        {/* PHASE 0: SVG Structure */}
        <div className={`cv-phase ${phase === 0 ? 'active' : ''}`}>
          <div className="cv-section-title">Anatomía de un SVG</div>
          <div className="cv-section-sub">Aprende las etiquetas y atributos fundamentales antes de diseñar.</div>

          <div className="cv-step-intro">
            <h3><i className="ti ti-code" /> Contenedor SVG</h3>
            <p>Todo logo SVG comienza con la etiqueta <strong>svg</strong>. El atributo <strong>viewBox</strong> define el sistema de coordenadas interno — es lo que permite que el SVG sea escalable sin perder calidad.</p>
          </div>

          <div className="cv-code-block">{'<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\n  {/* tus formas aquí */}\n</svg>'}</div>

          <div className="cv-step-intro">
            <h3><i className="ti ti-shapes" /> Formas primitivas</h3>
            <p>SVG ofrece formas base que se combinan para crear logos complejos. Cada forma tiene sus propios atributos de posición y tamaño.</p>
          </div>

          <div className="cv-svg-demo">
            <svg viewBox="0 0 220 60" width="320" height="88" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="10" width="40" height="40" rx="4" fill="#EEEDFE" stroke="#7F77DD" strokeWidth="1.5" />
              <circle cx="75" cy="30" r="20" fill="#E1F5EE" stroke="#1D9E75" strokeWidth="1.5" />
              <polygon points="125,10 145,50 105,50" fill="#FAECE7" stroke="#D85A30" strokeWidth="1.5" />
              <ellipse cx="185" cy="30" rx="28" ry="16" fill="#E6F1FB" stroke="#378ADD" strokeWidth="1.5" />
              <text x="25" y="62" fontSize="8" fill="#534AB7" textAnchor="middle" fontFamily="sans-serif">rect</text>
              <text x="75" y="62" fontSize="8" fill="#0F6E56" textAnchor="middle" fontFamily="sans-serif">circle</text>
              <text x="125" y="62" fontSize="8" fill="#993C1D" textAnchor="middle" fontFamily="sans-serif">polygon</text>
              <text x="185" y="62" fontSize="8" fill="#185FA5" textAnchor="middle" fontFamily="sans-serif">ellipse</text>
            </svg>
          </div>

          <div className="cv-code-block">{'<rect x="10" y="10" width="80" height="80" rx="8"/>\n<circle cx="50" cy="50" r="30"/>\n<polygon points="50,10 90,90 10,90"/>\n<ellipse cx="50" cy="50" rx="40" ry="20"/>'}</div>

          <div className="cv-step-intro">
            <h3><i className="ti ti-stack-2" /> Agrupaciones y transformaciones</h3>
            <p>Usa <strong>{'<g>'}</strong> para agrupar formas y aplicarles transformaciones juntas. Es fundamental para logos compuestos.</p>
          </div>

          <div className="cv-code-block">{'<g transform="translate(50,50) rotate(45)">\n  <rect x="-20" y="-20" width="40" height="40" rx="4"/>\n  <text x="0" y="6" text-anchor="middle" font-size="12">A</text>\n</g>'}</div>

          <div className="cv-tip"><i className="ti ti-bulb" /> <strong>Tip:</strong> el atributo <strong>rx</strong> en un &lt;rect&gt; redondea las esquinas — perfecto para íconos de apps.</div>

          <div className="cv-nav-btns">
            <button className="cv-btn-next" onClick={() => goPhase(1)}>Siguiente: Paleta de colores <i className="ti ti-arrow-right" /></button>
          </div>
        </div>

        {/* PHASE 1: Color Palette */}
        <div className={`cv-phase ${phase === 1 ? 'active' : ''}`}>
          <div className="cv-section-title">La paleta de colores en SVG</div>
          <div className="cv-section-sub">Domina fill, stroke, opacity y gradientes básicos.</div>

          <div className="cv-step-intro">
            <h3><i className="ti ti-palette" /> Fill y Stroke</h3>
            <p><strong>fill</strong> es el color de relleno. <strong>stroke</strong> es el color del borde. <strong>stroke-width</strong> controla el grosor.</p>
          </div>

          <div className="cv-live-svg-area">
            <div className="cv-live-editor">
              <div className="cv-editor-pane">
                <p style={{fontSize:11, color:'var(--cv-text2)', marginBottom:6}}>Edita el código:</p>
                <textarea value={colorCode} onChange={e => setColorCode(e.target.value)} />
              </div>
              <div className="cv-preview-pane">
                <svg id="cvColorPreview" viewBox="0 0 120 120" width="120" height="120" xmlns="http://www.w3.org/2000/svg"
                  dangerouslySetInnerHTML={{ __html: colorCode.replace(/<\/?svg[^>]*>/g, '') }}
                />
              </div>
            </div>
          </div>

          <div className="cv-step-intro">
            <h3><i className="ti ti-adjustments-horizontal" /> Control interactivo de color</h3>
            <p>Experimenta con los controles para ver cómo cambian los atributos de color en tiempo real.</p>
          </div>

          <div className="cv-color-interactive">
            <div className="cv-color-row">
              <label>Fill</label>
              <input type="color" value={cFill} onChange={e => setCFill(e.target.value)} />
              <span className="cv-val">{cFill}</span>
            </div>
            <div className="cv-color-row">
              <label>Stroke</label>
              <input type="color" value={cStroke} onChange={e => setCStroke(e.target.value)} />
              <span className="cv-val">{cStroke}</span>
            </div>
            <div className="cv-color-row">
              <label>Opacidad</label>
              <input type="range" min="0" max="1" step="0.05" value={cOpacity} onChange={e => setCOpacity(parseFloat(e.target.value))} />
              <span className="cv-val">{cOpacity.toFixed(2)}</span>
            </div>
            <div className="cv-color-row">
              <label>Stroke width</label>
              <input type="range" min="0" max="10" step="0.5" value={cStrokeW} onChange={e => setCStrokeW(parseFloat(e.target.value))} />
              <span className="cv-val">{cStrokeW.toFixed(1)}</span>
            </div>
            <div style={{display:'flex',justifyContent:'center',marginTop:'1rem'}}>
              <svg viewBox="0 0 120 120" width="140" height="140" xmlns="http://www.w3.org/2000/svg">
                <circle cx="60" cy="60" r="45" fill={cFill} stroke={cStroke} strokeWidth={cStrokeW} opacity={cOpacity} />
              </svg>
            </div>
          </div>

          <div className="cv-step-intro">
            <h3><i className="ti ti-layers-difference" /> Gradientes en SVG</h3>
            <p>Los gradientes se definen en <strong>{'<defs>'}</strong> y se referencian con <strong>url(#id)</strong>.</p>
          </div>

          <div className="cv-code-block">{'<defs>\n  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">\n    <stop offset="0%" stop-color="#7F77DD"/>\n    <stop offset="100%" stop-color="#1D9E75"/>\n  </linearGradient>\n</defs>\n<rect width="100" height="100" fill="url(#grad1)" rx="12"/>'}</div>

          <div className="cv-svg-demo">
            <svg viewBox="0 0 100 100" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7F77DD" /><stop offset="100%" stopColor="#1D9E75" /></linearGradient></defs>
              <rect width="100" height="100" fill="url(#g1)" rx="12" />
              <text x="50" y="55" textAnchor="middle" fontSize="14" fill="white" fontFamily="sans-serif" fontWeight="bold">AB</text>
            </svg>
          </div>

          <div className="cv-tip"><i className="ti ti-bulb" /> <strong>Tip:</strong> usa <strong>radialGradient</strong> para efectos de profundidad y brillo, ideal para logos con efecto 3D sutil.</div>

          <div className="cv-nav-btns">
            <button className="cv-btn-back" onClick={() => goPhase(0)}><i className="ti ti-arrow-left" /> Atrás</button>
            <button className="cv-btn-next" onClick={() => goPhase(2)}>Siguiente: Diseño de logo <i className="ti ti-arrow-right" /></button>
          </div>
        </div>

        {/* PHASE 2: Logo Design */}
        <div className={`cv-phase ${phase === 2 ? 'active' : ''}`}>
          <div className="cv-section-title">Construyendo un logo SVG</div>
          <div className="cv-section-sub">Combina todo lo aprendido: formas, colores, texto y agrupaciones.</div>

          <div className="cv-step-intro">
            <h3><i className="ti ti-grid-dots" /> Estructura de un logo profesional</h3>
            <p>Un logo bien construido en SVG sigue una estructura en capas: fondo → ícono/símbolo → texto → detalles.</p>
          </div>

          <div className="cv-code-block">{'<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">\n  <g id="simbolo">\n    <rect x="5" y="10" width="60" height="60" rx="12" fill="#7F77DD"/>\n    <polygon points="35,22 52,52 18,52" fill="white" opacity="0.9"/>\n  </g>\n  <g id="texto">\n    <text x="78" y="38" font-size="22" font-weight="bold" fill="#534AB7" font-family="sans-serif">MiMarca</text>\n    <text x="78" y="56" font-size="11" fill="#888780" font-family="sans-serif">soluciones digitales</text>\n  </g>\n</svg>'}</div>

          <div className="cv-svg-demo">
            <svg viewBox="0 0 200 80" width="280" height="112" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="10" width="60" height="60" rx="12" fill="#7F77DD" />
              <polygon points="35,22 52,52 18,52" fill="white" opacity="0.9" />
              <text x="78" y="38" fontSize="22" fontWeight="bold" fill="#534AB7" fontFamily="sans-serif">MiMarca</text>
              <text x="78" y="56" fontSize="11" fill="#888780" fontFamily="sans-serif">soluciones digitales</text>
            </svg>
          </div>

          <div className="cv-step-intro">
            <h3><i className="ti ti-adjustments" /> Ajusta tu logo</h3>
            <p>Modifica los colores del logo de ejemplo usando los controles.</p>
          </div>

          <div className="cv-color-interactive">
            <div className="cv-color-row">
              <label>Color principal</label>
              <input type="color" value={lFill} onChange={e => setLFill(e.target.value)} />
              <span className="cv-val">{lFill}</span>
            </div>
            <div className="cv-color-row">
              <label>Color texto</label>
              <input type="color" value={lText} onChange={e => setLText(e.target.value)} />
              <span className="cv-val">{lText}</span>
            </div>
            <div className="cv-color-row">
              <label>Radio esquinas</label>
              <input type="range" min="0" max="30" step="1" value={lRadius} onChange={e => setLRadius(parseInt(e.target.value))} />
              <span className="cv-val">{lRadius}</span>
            </div>
          </div>

          <div style={{display:'flex',justifyContent:'center',padding:'.5rem',border:'1px solid var(--cv-border)',borderRadius:'var(--cv-radius)',background:'white',margin:'.5rem 0'}}>
            <svg viewBox="0 0 200 80" width="280" height="112" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="10" width="60" height="60" rx={lRadius} fill={lFill} />
              <polygon points="35,22 52,52 18,52" fill="white" opacity="0.9" />
              <text x="78" y="38" fontSize="22" fontWeight="bold" fill={lText} fontFamily="sans-serif">MiMarca</text>
              <text x="78" y="56" fontSize="11" fill="#888780" fontFamily="sans-serif">soluciones digitales</text>
            </svg>
          </div>

          <div className="cv-tip"><i className="ti ti-bulb" /> <strong>Tip:</strong> siempre define el <strong>viewBox</strong> con coordenadas desde 0,0. Evita usar width/height fijos en el SVG raíz — deja que CSS controle el tamaño real.</div>

          <div className="cv-nav-btns">
            <button className="cv-btn-back" onClick={() => goPhase(1)}><i className="ti ti-arrow-left" /> Atrás</button>
            <button className="cv-btn-next" onClick={() => goPhase(3)}>Ir a la evaluación <i className="ti ti-arrow-right" /></button>
          </div>
        </div>

        {/* PHASE 3: Evaluation */}
        <div className={`cv-phase ${phase === 3 ? 'active' : ''}`}>
          <div className="cv-section-title">Evaluación: Ordena los pasos</div>
          <div className="cv-section-sub">Arrastra los bloques al orden correcto para crear un logo SVG profesional.</div>

          {/* Eval A */}
          <div className="cv-eval-section">
            <div className="cv-eval-title"><i className="ti ti-drag-drop" /> Pregunta 1 — Orden de construcción de un logo SVG</div>
            <p style={{fontSize:13,color:'var(--cv-text2)',marginBottom:'1rem'}}>Arrastra los bloques al área de respuesta en el orden correcto:</p>

            <div
              className="cv-drag-source"
              onDragOver={handleDragOver}
              onDrop={() => handleDropOnSrc('srcA')}
            >
              {srcA.map(s => renderBlock(s, srcA.indexOf(s), false, dropA, correctA))}
            </div>

            <p style={{fontSize:12,color:'var(--cv-text3)',marginBottom:'.5rem'}}>Tu respuesta (arrastra aquí):</p>
            <div
              className="cv-blocks-container"
              onDragOver={handleDragOver}
              onDrop={() => handleDropOnDrop('dropA')}
            >
              {dropA.map((s, i) => {
                const placed = dropA.map(x => x.id);
                const isCorrect = placed[i] === correctA[i];
                return (
                  <div
                    key={s.id}
                    className={`cv-block ${isCorrect ? 'cv-correct' : placed[i] ? 'cv-incorrect' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(s, 'dropA')}
                  >
                    <i className="ti ti-grip-vertical cv-drag-handle" />
                    <span className="cv-block-num">{isCorrect ? '✓' : '✗'}</span>
                    <span>{s.text}</span>
                  </div>
                );
              })}
            </div>

            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              <button className="cv-check-btn" onClick={() => checkOrder(dropA, correctA, setScoreA, setResultA)}>
                <i className="ti ti-check" /> Verificar orden
              </button>
              <button className="cv-check-btn" onClick={() => resetEval(stepsA, setSrcA, setDropA, setScoreA, setResultA)} style={{color:'var(--cv-text2)'}}>
                <i className="ti ti-refresh" /> Reiniciar
              </button>
            </div>
            {resultA && (
              <div className={`cv-result-badge ${resultA.ok ? 'cv-result-ok' : 'cv-result-fail'}`}>
                <i className={`ti ti-${resultA.ok ? 'check' : 'x'}`} /> {resultA.msg}
              </div>
            )}
          </div>

          {/* Eval B */}
          <div className="cv-eval-section" style={{marginTop:'2rem'}}>
            <div className="cv-eval-title"><i className="ti ti-drag-drop" /> Pregunta 2 — Orden para aplicar colores correctamente</div>
            <p style={{fontSize:13,color:'var(--cv-text2)',marginBottom:'1rem'}}>¿Cuál es el flujo correcto al trabajar con colores en un SVG?</p>

            <div
              className="cv-drag-source"
              onDragOver={handleDragOver}
              onDrop={() => handleDropOnSrc('srcB')}
            >
              {srcB.map(s => renderBlock(s, srcB.indexOf(s), false, dropB, correctB))}
            </div>

            <p style={{fontSize:12,color:'var(--cv-text3)',marginBottom:'.5rem'}}>Tu respuesta:</p>
            <div
              className="cv-blocks-container"
              onDragOver={handleDragOver}
              onDrop={() => handleDropOnDrop('dropB')}
            >
              {dropB.map((s, i) => {
                const placed = dropB.map(x => x.id);
                const isCorrect = placed[i] === correctB[i];
                return (
                  <div
                    key={s.id}
                    className={`cv-block ${isCorrect ? 'cv-correct' : placed[i] ? 'cv-incorrect' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(s, 'dropB')}
                  >
                    <i className="ti ti-grip-vertical cv-drag-handle" />
                    <span className="cv-block-num">{isCorrect ? '✓' : '✗'}</span>
                    <span>{s.text}</span>
                  </div>
                );
              })}
            </div>

            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              <button className="cv-check-btn" onClick={() => checkOrder(dropB, correctB, setScoreB, setResultB)}>
                <i className="ti ti-check" /> Verificar orden
              </button>
              <button className="cv-check-btn" onClick={() => resetEval(stepsB, setSrcB, setDropB, setScoreB, setResultB)} style={{color:'var(--cv-text2)'}}>
                <i className="ti ti-refresh" /> Reiniciar
              </button>
            </div>
            {resultB && (
              <div className={`cv-result-badge ${resultB.ok ? 'cv-result-ok' : 'cv-result-fail'}`}>
                <i className={`ti ti-${resultB.ok ? 'check' : 'x'}`} /> {resultB.msg}
              </div>
            )}
          </div>

          <div className="cv-nav-btns">
            <button className="cv-btn-back" onClick={() => goPhase(2)}><i className="ti ti-arrow-left" /> Atrás</button>
            <button className="cv-btn-next" onClick={() => goPhase(4)}>Ver resultado final <i className="ti ti-award" /></button>
          </div>
        </div>

        {/* PHASE 4: Result */}
        <div className={`cv-phase ${phase === 4 ? 'active' : ''}`}>
          <div className="cv-section-title">Resultado del módulo</div>
          <div className="cv-section-sub">Tu desempeño en la evaluación de SVG y diseño de logos.</div>

          <div className="cv-score-display">
            <div className="cv-medal">{medals[totalScore]}</div>
            <div className="cv-score-num">{totalScore} / 2</div>
            <p style={{fontSize:14,color:'var(--cv-text2)',marginTop:'.5rem'}}>{msgs[totalScore]}</p>
          </div>

          <div style={{marginTop:'1.5rem'}}>
            <div className="cv-step-intro">
              <h3>Repaso de respuestas correctas</h3>
              <p style={{fontSize:13,color:'var(--cv-text2)',marginBottom:'.75rem'}}>Orden correcto para construir un logo SVG:</p>
              {correctA.map((id, i) => {
                const s = stepsA.find(x => x.id === id)!;
                return (
                  <div key={id} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:6}}>
                    <span style={{minWidth:20,height:20,borderRadius:'50%',background:'rgba(127,119,221,0.15)',color:'#b8b0f0',fontSize:11,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:500}}>{i + 1}</span>
                    <span style={{fontSize:13,color:'var(--cv-text)'}}>{s.text}</span>
                  </div>
                );
              })}
              <p style={{fontSize:13,color:'var(--cv-text2)',margin:'1rem 0 .75rem'}}>Orden correcto para aplicar colores:</p>
              {correctB.map((id, i) => {
                const s = stepsB.find(x => x.id === id)!;
                return (
                  <div key={id} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:6}}>
                    <span style={{minWidth:20,height:20,borderRadius:'50%',background: 'rgba(74,222,128,0.15)',color:'var(--cv-accent)',fontSize:11,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:500}}>{i + 1}</span>
                    <span style={{fontSize:13,color:'var(--cv-text)'}}>{s.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cv-nav-btns">
            <button className="cv-btn-back" onClick={() => goPhase(3)}><i className="ti ti-arrow-left" /> Revisar evaluación</button>
          </div>
        </div>
      </div>
    </div>
  );
}
