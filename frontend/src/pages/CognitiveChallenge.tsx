import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useTheme } from '../ThemeContext';
import { Challenge } from '../data/challengeBank';
import './CognitiveChallenge.css';

export function CognitiveChallenge() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { addEvent, currentLevel } = useCognitiveStore();

  const challenge: Challenge = location.state?.challenge || {
    id: "0",
    nombre: "Reto no seleccionado",
    ejercicio_fase_b: "Selecciona un reto en la Fase A.",
    evaluacion_desempeño: "N/A",
    interfaz: 'logic',
    pista: "Sin pistas.",
    jol_preguntas: []
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
    if (challenge.interfaz === 'web' && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    }
  }, [code, challenge.interfaz]);

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
    const isSuccess = consoleMessages.some(m => m.type === 'ok');
    
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
      <div className="fb-header-clean">
        <div className="fb-header-left">
          <div className="fb-logo-mini">MP</div>
          <div className="fb-header-info">
            <span className="fb-level-tag">Reto {challenge.id}</span>
            <h1 className="fb-task-name">{challenge.nombre}</h1>
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
            <p className="fb-instruction-text">{challenge.ejercicio_fase_b}</p>
            <div className="fb-criteria-box">
              <span className="fb-box-label">Criterio de éxito</span>
              <p>{challenge.evaluacion_desempeño}</p>
            </div>
            
            <AnimatePresence>
              {showHint && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="fb-hint-minimal">
                  <i className="ti ti-bulb"></i>
                  <span>{challenge.pista}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Editor Central */}
        <div className="fb-editor-container">
          <div className="fb-editor-toolbar">
            <div className="fb-tabs-minimal">
              <button className={`fb-tab-btn ${activeTab === 'editor' ? 'active' : ''}`} onClick={() => setActiveTab('editor')}>
                <i className="ti ti-code"></i> Editor
              </button>
              {challenge.interfaz === 'web' && (
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
            ) : challenge.interfaz === 'terminal' ? (
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

          {/* Consola Integrada */}
          <div className="fb-console-clean">
            <div className="fb-console-title">Salida de Consola</div>
            <div className="fb-console-lines">
              {consoleMessages.map((m, i) => (
                <div key={i} className={`fb-console-line ${m.type}`}>{m.text}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
