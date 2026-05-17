import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useTheme } from '../ThemeContext';
import { DynamicChallenge } from '../data/dynamicChallengeBank';
import { EvaluationTracker } from '../components/EvaluationTracker';
import { DragAndDropBoard } from '../components/DragAndDropBoard';
import { EssayBoard } from '../components/EssayBoard';
import { UploadBoard } from '../components/UploadBoard';
import { CanvasBoard } from '../components/CanvasBoard';
import { SpreadsheetBoard } from '../components/SpreadsheetBoard';
import './CognitiveChallenge.css';

export function CognitiveChallenge() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { addEvent, currentLevel } = useCognitiveStore();

  const getBoardType = (id: string): 'drag_drop' | 'text' | 'upload' | 'code' | 'canvas' | 'spreadsheet' => {
    const mappings: Record<string, 'drag_drop' | 'text' | 'upload' | 'code' | 'canvas' | 'spreadsheet'> = {
      // Básico
      "RB-C1-N1": "drag_drop", "RB-C2-N1": "drag_drop", "RB-C3-N1": "canvas", "RB-C4-N1": "canvas",
      "RB-C1-N2": "upload", "RB-C2-N2": "upload", "RB-C3-N2": "code", "RB-C4-N2": "text",
      "RB-C1-N3": "text", "RB-C2-N3": "spreadsheet", "RB-C3-N3": "canvas", "RB-C4-N3": "text",
      // Medio
      "RM-C1-N1": "canvas", "RM-C1-N2": "text", "RM-C1-N3": "text", 
      "RM-C2-N1": "spreadsheet", "RM-C2-N2": "canvas", "RM-C2-N3": "spreadsheet", 
      "RM-C3-N1": "upload", "RM-C3-N2": "code", "RM-C3-N3": "code", 
      "RM-C4-N1": "text", "RM-C4-N2": "text", "RM-C4-N3": "text",
      // Avanzado
      "RA-C1-N1": "upload", "RA-C1-N2": "text", "RA-C1-N3": "text", 
      "RA-C2-N1": "code", "RA-C2-N2": "upload", "RA-C2-N3": "code",
      "RA-C3-N1": "upload", "RA-C3-N2": "upload", "RA-C3-N3": "upload", 
      "RA-C4-N1": "text", "RA-C4-N2": "upload", "RA-C4-N3": "upload"
    };
    return mappings[id] || 'code';
  };

  const challenge: DynamicChallenge = location.state?.challenge || {
    id: "0",
    nivel: "Básico",
    sub_nivel: "N1",
    componente: "Ninguno",
    codigo_men: "0",
    titulo: "Reto no seleccionado",
    descripcion: "Selecciona un reto en la Fase A.",
    criterios: ["N/A"],
    recursos: "Sin recursos.",
    tiempo_estimado: "0",
    jol_esp_1: { pregunta: "", escala: "" },
    jol_esp_2: { pregunta: "", escala: "" }
  };

  const initialJolAnswers = location.state?.jolAnswers || {};
  const jolTimes = location.state?.jolTimes || {};
  const estimatedTime = location.state?.estimatedTime || 0;

  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [editCount, setEditCount] = useState(0);
  const [pauseSecs, setPauseSecs] = useState(0);
  const [totalRuns, setTotalRuns] = useState(0);
  const [errCount, setErrCount] = useState(0);  const [clickCount, setClickCount] = useState(0);
  const [mouseDistance, setMouseDistance] = useState(0);
  const [mouseHistory, setMouseHistory] = useState<{x: number, y: number}[]>([]);
  const [activeTab, setActiveTab] = useState('editor');
  
  const [showHint, setShowHint] = useState(false);
  const [boardSuccess, setBoardSuccess] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState([
    { type: 'sys', text: '> Entorno preparado.' }
  ]);
  
  const lastEditTime = useRef(Date.now());
  const lastMousePos = useRef({ x: 0, y: 0 });
  const currentMousePos = useRef({ x: 0, y: 0 });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const getInitialCode = (id: string): string => {
      switch (id) {
        case '1.1': return `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .card {\n      border: 1px solid #ccc;\n      padding: 20px;\n      text-align: left;\n    }\n  </style>\n</head>\n<body>\n  <div class="card">\n    <h1>Mi Tarjeta</h1>\n    <p>Estudiante de Tecnología</p>\n    <img src="" alt="Foto">\n  </div>\n</body>\n</html>`;
        case '1.2': return `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    ul {\n      list-style: none;\n      padding: 0;\n      display: block;\n    }\n    li { margin: 0 15px; }\n  </style>\n</head>\n<body>\n  <ul>\n    <li><a href="#">Inicio</a></li>\n    <li><a href="#">Cursos</a></li>\n    <li><a href="#">Perfil</a></li>\n  </ul>\n</body>\n</html>`;
        case '1.3': return `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .container { display: flex; gap: 20px; }\n    .col { flex: 1; background: #eee; padding: 10px; }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <div class="col">Noticia 1</div>\n    <div class="col">Noticia 2</div>\n    <div class="col">Noticia 3</div>\n  </div>\n</body>\n</html>`;
        case '2.1': return `let contador = 0;\nconst btn = document.querySelector("#miBoton");\nbtn?.addEventListener("click", () => {\n  contador++;\n  document.getElementById("display").innerText = contador;\n});`;
        case '2.2': return `function verificarEdad(edad) {\n  const res = document.getElementById("resultado");\n  if (condition) {\n    \n  } else {\n    \n  }\n}`;
        case '3.1': return `function generarColor() {\n  const r = Math.floor(Math.random() * 10);\n  const g = Math.floor(Math.random() * 10);\n  const b = Math.floor(Math.random() * 10);\n  return \`rgb(\${r},\${g},\${b})\`;\n}`;
        case '3.2': return `function agregarTarea() {\n  const input = document.getElementById("task");\n  const lista = document.getElementById("lista");\n}`;
        case '3.3': return `async function buscarUsuario(nombre) {\n  try {\n    \n  } catch (err) {\n    console.error("Error en la petición");\n  }\n}`;
        default: return `// Desarrolla tu solución aquí...`;
      }
    };
    setCode(getInitialCode(challenge.id));

    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
      setPauseSecs(Math.floor((Date.now() - lastEditTime.current) / 1000));
      
      if (currentMousePos.current.x !== lastMousePos.current.x) {
        setMouseHistory(prev => [...prev.slice(-200), { ...currentMousePos.current }]);
        lastMousePos.current = { ...currentMousePos.current };
      }
    }, 500);

    const trackMouse = (e: MouseEvent) => {
      const d = Math.sqrt(Math.pow(e.clientX - currentMousePos.current.x, 2) + Math.pow(e.clientY - currentMousePos.current.y, 2));
      setMouseDistance(p => p + d);
      currentMousePos.current = { x: e.clientX, y: e.clientY };
    };
    const trackClick = () => setClickCount(p => p + 1);

    window.addEventListener('mousemove', trackMouse);
    window.addEventListener('click', trackClick);
    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', trackMouse);
      window.removeEventListener('click', trackClick);
    };
  }, [challenge.id]);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    }
  }, [code]);

  const handleRun = () => {
    const newRuns = totalRuns + 1;
    setTotalRuns(newRuns);
    
    // Sistema de Validación por Reto
    let isSuccess = false;
    const cleanCode = code.replace(/\s/g, '');

    switch (challenge.id) {
      case '1.1': // Tarjeta: busca center y src
        isSuccess = code.includes('text-align: center') && (code.includes('src="http') || code.includes("src='http"));
        break;
      case '1.2': // Menú: busca display:flex
        isSuccess = code.includes('display: flex') || code.includes('display:flex');
        break;
      case '1.3': // Media Query
        isSuccess = code.includes('@media') && code.includes('768px') && code.includes('flex-direction');
        break;
      case '2.1': // Contador: busca #btn-click o selector correcto
        isSuccess = code.includes('#btn-click') || code.includes('btn-click');
        break;
      case '2.2': // Validador edad: busca if, else, >= 18
        isSuccess = code.includes('if') && code.includes('else') && (code.includes('>= 18') || code.includes('18 <='));
        break;
      case '3.1': // Colores: busca * 256
        isSuccess = code.includes('* 256') || code.includes('*256') || code.includes('* 255') || code.includes('*255');
        break;
      case '3.2': // To-Do: busca createElement, appendChild
        isSuccess = code.includes('createElement') && code.includes('appendChild');
        break;
      case '3.3': // Fetch: busca fetch, await, try, catch
        isSuccess = code.includes('fetch') && code.includes('await') && (code.includes('try') || code.includes('then'));
        break;
      default:
        isSuccess = code.length > 30; // Validación genérica para otros
    }

    if (isSuccess) {
      setConsoleMessages(prev => [...prev, { type: 'ok', text: `> Reto completado con éxito. Puedes terminar la fase.` }]);
      setErrCount(0);
    } else {
      setConsoleMessages(prev => [...prev, { type: 'err', text: `> Error: Validación fallida (Intento ${newRuns}). Revisa tu lógica.` }]);
      setErrCount(prev => prev + 1);
      if (newRuns >= 2) setShowHint(true);
    }
  };

  const handleSubmit = () => {
    const isSuccess = boardSuccess || consoleMessages.some(m => m.type === 'ok');
    
    const payload = {
      challengeId: challenge.id,
      level: currentLevel,
      jolAnswers: initialJolAnswers,
      jolTimes,
      estimatedTime,
      технические_метрики: {
        score: isSuccess ? 100 : 0,
        runs: totalRuns,
        hints: showHint ? 1 : 0,
        edits: editCount,
        final_code: code,
      },
      biometricas: {
        clicks: clickCount,
        mouse_distance: Math.round(mouseDistance),
        mouse_history: mouseHistory,
        total_time: seconds,
      }
    };

    console.log('🚀 Enviando métricas reales a Fase C:', payload);
    addEvent('CHALLENGE_COMPLETED', payload);
    navigate('/calibration', { state: payload });
  };

  return (
    <div className={`fb-root ${theme} clean-ui`}>
      {/* Header Minimalista */}
      <EvaluationTracker currentPhase="B" />
      
      {/* Header Minimalista (Adaptado para convivir con el Tracker) */}
      <div className="fb-header-clean" style={{ marginTop: '50px', background: 'transparent', borderBottom: 'none' }}>
        <div className="fb-header-left">
          <div className="fb-header-info">
            <span className="fb-level-tag">{challenge.nivel} · {challenge.sub_nivel} | {challenge.componente}</span>
            <h1 className="fb-task-name">{challenge.titulo}</h1>
          </div>
        </div>
        <div className="fb-header-right">
          <div className="fb-timer-minimal">
            <i className="ti ti-clock"></i>
            {Math.floor(seconds / 60).toString().padStart(2, '0')}:{(seconds % 60).toString().padStart(2, '0')}
          </div>
          <button className="fb-btn-finish" onClick={handleSubmit}>
            Terminar Reto <i className="ti ti-arrow-right"></i>
          </button>
        </div>
      </div>

      <div className="fb-main-container">
        {/* Panel de Instrucciones Colapsable o Fijo Estilizado */}
        <div className="fb-side-panel instructions">
          <div className="fb-panel-label">Instrucciones</div>
          <div className="fb-content-scroll">
            <p className="fb-instruction-text">{challenge.descripcion}</p>
            <div className="fb-criteria-box">
              <span className="fb-box-label">Criterios de evaluación</span>
              <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                  {challenge.criterios.map((c: string, i: number) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            
            <AnimatePresence>
              {showHint && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="fb-hint-minimal">
                  <i className="ti ti-bulb"></i>
                  <span>{(challenge as any).pista || "Recuerda leer atentamente las instrucciones antes de enviar tu solución."}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tablero Dinámico (Multimodal) */}
        <div className="fb-editor-container">
          {getBoardType(challenge.id) === 'drag_drop' ? (
            <div className="flex-1 w-full flex items-center justify-center bg-surface-container-lowest border-t border-outline-variant/20 rounded-b-[2rem]">
              <DragAndDropBoard 
                challengeId={challenge.id} 
                onValidation={(success) => {
                  setBoardSuccess(success);
                  if (success) {
                    setConsoleMessages([{ type: 'ok', text: '> ¡Orden correcto! Reto completado con éxito.' }]);
                    setErrCount(0);
                  } else {
                    setConsoleMessages([{ type: 'sys', text: '> Entorno preparado.' }]);
                    setErrCount(prev => prev + 1);
                  }
                }} 
              />
            </div>
          ) : getBoardType(challenge.id) === 'text' ? (
            <div className="flex-1 w-full flex items-center justify-center bg-surface-container-lowest border-t border-outline-variant/20 rounded-b-[2rem]">
              <EssayBoard 
                challengeId={challenge.id} 
                onValidation={(success) => {
                  setBoardSuccess(success);
                }} 
              />
            </div>
          ) : getBoardType(challenge.id) === 'upload' ? (
            <div className="flex-1 w-full flex items-center justify-center bg-surface-container-lowest border-t border-outline-variant/20 rounded-b-[2rem]">
              <UploadBoard 
                challengeId={challenge.id} 
                onValidation={(success) => {
                  setBoardSuccess(success);
                }} 
              />
            </div>
          ) : getBoardType(challenge.id) === 'canvas' ? (
            <div className="flex-1 w-full flex items-center justify-center bg-surface-container-lowest border-t border-outline-variant/20 rounded-b-[2rem]">
              <CanvasBoard 
                challengeId={challenge.id} 
                onValidation={(success) => {
                  setBoardSuccess(success);
                }} 
              />
            </div>
          ) : getBoardType(challenge.id) === 'spreadsheet' ? (
            <div className="flex-1 w-full flex items-center justify-center bg-surface-container-lowest border-t border-outline-variant/20 rounded-b-[2rem]">
              <SpreadsheetBoard 
                challengeId={challenge.id} 
                onValidation={(success) => {
                  setBoardSuccess(success);
                }} 
              />
            </div>
          ) : (
            <>
              <div className="fb-editor-toolbar">
                <div className="fb-tabs-minimal">
                  <button className={`fb-tab-btn ${activeTab === 'editor' ? 'active' : ''}`} onClick={() => setActiveTab('editor')}>
                    <i className="ti ti-code"></i> Editor
                  </button>
                  {true && (
                    <button className={`fb-tab-btn ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>
                      <i className="ti ti-eye"></i> Vista Previa
                    </button>
                  )}
                </div>
                <button className="fb-run-btn-clean" onClick={handleRun}>
                  <i className="ti ti-player-play"></i> Ejecutar
                </button>
              </div>

              <div className="fb-workspace">
                {activeTab === 'preview' ? (
                  <iframe ref={iframeRef} title="preview" className="fb-preview-frame-clean" />
                ) : false ? (
                  <div className="fb-terminal-clean">
                    <div className="fb-term-scroll">
                      <div className="fb-term-line sys">{">"} Git Terminal Ready</div>
                      <div className="fb-term-line in">$ git branch</div>
                      <div className="fb-term-line ok">* main</div>
                    </div>
                    <div className="fb-term-input-line">
                      <span className="fb-term-cursor">$</span>
                      <input type="text" className="fb-term-field" placeholder="Escribe un comando..." />
                    </div>
                  </div>
                ) : (
                  <textarea
                    className="fb-editor-field"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setEditCount(c => c+1); lastEditTime.current = Date.now(); }}
                    spellCheck={false}
                  />
                )}
              </div>

              {/* Consola Integrada (Solo para Medio/Avanzado) */}
              <div className="fb-console-clean">
                <div className="fb-console-title">Salida de Consola</div>
                <div className="fb-console-lines">
                  {consoleMessages.map((m, i) => (
                    <div key={i} className={`fb-console-line ${m.type}`}>{m.text}</div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
