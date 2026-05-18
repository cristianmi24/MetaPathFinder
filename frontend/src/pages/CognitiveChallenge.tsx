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
import TimelineGame from '../components/TimelineGame';
import MatchImageTerms from '../components/MatchImageTerms';
import MatchTechSituations from '../components/MatchTechSituations';
import DriveFileSorter from '../components/DriveFileSorter';
import AttendanceSimulator from '../components/AttendanceSimulator';
import DigitalAccessQuiz from '../components/DigitalAccessQuiz';
import SocialMediaQuiz from '../components/SocialMediaQuiz';
import { SmartphoneAnatomyQuiz } from '../components/SmartphoneAnatomyQuiz';
import { ComputingEvolutionQuiz } from '../components/ComputingEvolutionQuiz';
import { ProspectiveTechEssay } from '../components/ProspectiveTechEssay';
import { SqlBlockBoard } from '../components/SqlBlockBoard';
import { ArduinoBlockBoard } from '../components/ArduinoBlockBoard';
import { CodeBlockBoard } from '../components/CodeBlockBoard';
import { PhoneDismantlingBoard } from '../components/PhoneDismantlingBoard';
import { CodingIDEBoard } from '../components/CodingIDEBoard';
import './CognitiveChallenge.css';

export function CognitiveChallenge() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { addEvent, currentLevel } = useCognitiveStore();

  const getBoardType = (id: string): 'drag_drop' | 'text' | 'upload' | 'code' | 'canvas' | 'spreadsheet' | 'phone_dismantle' => {
    const mappings: Record<string, 'drag_drop' | 'text' | 'upload' | 'code' | 'canvas' | 'spreadsheet' | 'phone_dismantle'> = {
      // BÃ¡sico
      "RB-C1-N1": "drag_drop", "RB-C2-N1": "drag_drop", "RB-C3-N1": "drag_drop", "RB-C4-N1": "drag_drop",
      "RB-C1-N2": "upload", "RB-C2-N2": "upload", "RB-C3-N2": "code", "RB-C4-N2": "drag_drop",
      "RB-C1-N3": "text", "RB-C2-N3": "spreadsheet", "RB-C3-N3": "drag_drop", "RB-C4-N3": "drag_drop",
      // Medio
      "RM-C1-N1": "canvas", "RM-C1-N2": "text", "RM-C1-N3": "text", 
      "RM-C2-N1": "spreadsheet", "RM-C2-N2": "canvas", "RM-C2-N3": "spreadsheet", 
      "RM-C3-N1": "upload", "RM-C3-N2": "code", "RM-C3-N3": "code", 
      "RM-C4-N1": "text", "RM-C4-N2": "text", "RM-C4-N3": "text",
      // Avanzado
      "RA-C1-N1": "phone_dismantle", "RA-C1-N2": "text", "RA-C1-N3": "text", 
      "RA-C2-N1": "code", "RA-C2-N2": "upload", "RA-C2-N3": "code",
      "RA-C3-N1": "upload", "RA-C3-N2": "upload", "RA-C3-N3": "upload", 
      "RA-C4-N1": "text", "RA-C4-N2": "upload", "RA-C4-N3": "upload"
    };
    return mappings[id] || 'code';
  };

  const challenge: DynamicChallenge = location.state?.challenge || {
    id: "0",
    nivel: "BÃ¡sico",
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
        case '1.1': return `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .card {\n      border: 1px solid #ccc;\n      padding: 20px;\n      text-align: left;\n    }\n  </style>\n</head>\n<body>\n  <div class="card">\n    <h1>Mi Tarjeta</h1>\n    <p>Estudiante de TecnologÃ­a</p>\n    <img src="" alt="Foto">\n  </div>\n</body>\n</html>`;
        case '1.2': return `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    ul {\n      list-style: none;\n      padding: 0;\n      display: block;\n    }\n    li { margin: 0 15px; }\n  </style>\n</head>\n<body>\n  <ul>\n    <li><a href="#">Inicio</a></li>\n    <li><a href="#">Cursos</a></li>\n    <li><a href="#">Perfil</a></li>\n  </ul>\n</body>\n</html>`;
        case '1.3': return `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .container { display: flex; gap: 20px; }\n    .col { flex: 1; background: #eee; padding: 10px; }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <div class="col">Noticia 1</div>\n    <div class="col">Noticia 2</div>\n    <div class="col">Noticia 3</div>\n  </div>\n</body>\n</html>`;
        case '2.1': return `let contador = 0;\nconst btn = document.querySelector("#miBoton");\nbtn?.addEventListener("click", () => {\n  contador++;\n  document.getElementById("display").innerText = contador;\n});`;
        case '2.2': return `function verificarEdad(edad) {\n  const res = document.getElementById("resultado");\n  if (condition) {\n    \n  } else {\n    \n  }\n}`;
        case '3.1': return `function generarColor() {\n  const r = Math.floor(Math.random() * 10);\n  const g = Math.floor(Math.random() * 10);\n  const b = Math.floor(Math.random() * 10);\n  return \`rgb(\${r},\${g},\${b})\`;\n}`;
        case '3.2': return `function agregarTarea() {\n  const input = document.getElementById("task");\n  const lista = document.getElementById("lista");\n}`;
        case '3.3': return `async function buscarUsuario(nombre) {\n  try {\n    \n  } catch (err) {\n    console.error("Error en la peticiÃ³n");\n  }\n}`;
        default: return `// Desarrolla tu soluciÃ³n aquÃ­...`;
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
    
    // Sistema de ValidaciÃ³n por Reto
    let isSuccess = false;
    const cleanCode = code.replace(/\s/g, '');

    switch (challenge.id) {
      case '1.1': // Tarjeta: busca center y src
        isSuccess = code.includes('text-align: center') && (code.includes('src="http') || code.includes("src='http"));
        break;
      case '1.2': // MenÃº: busca display:flex
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
        isSuccess = code.length > 30; // ValidaciÃ³n genÃ©rica para otros
    }

    if (isSuccess) {
      setConsoleMessages(prev => [...prev, { type: 'ok', text: `> Reto completado con Ã©xito. Puedes terminar la fase.` }]);
      setErrCount(0);
    } else {
      setConsoleMessages(prev => [...prev, { type: 'err', text: `> Error: ValidaciÃ³n fallida (Intento ${newRuns}). Revisa tu lÃ³gica.` }]);
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

    console.log('🚀 Enviando metricas reales a Fase C:', payload);
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
            <span className="fb-level-tag">{challenge.nivel} Â· {challenge.sub_nivel} | {challenge.componente}</span>
            <h1 className="fb-task-name">{challenge.titulo}</h1>
          </div>
        </div>
        <div className="fb-header-right">
          <div className="fb-timer-minimal">
            <i className="ti ti-clock"></i>
            {Math.floor(seconds / 60).toString().padStart(2, '0')}:{(seconds % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="fb-main-container">
        {/* Left Sidebar */}
        <div className="fb-sidebar-l">
          <div className="fb-panel-title">
            <i className="ti ti-target" style={{fontSize:13}}></i>
            Reto activo
          </div>

          <div className="fb-reto-card">
            <div className="fb-reto-tag">{challenge.nivel} &middot; {challenge.componente}</div>
            <div className="fb-reto-title">{challenge.titulo}</div>
            <div className="fb-reto-desc">{challenge.descripcion}</div>
          </div>

          <div className="fb-criteria">
            <div className="fb-criteria-title">Criterios de evaluaci&oacute;n</div>
            {challenge.criterios.map((c: string, i: number) => (
              <div key={i} className={`fb-criterion ${boardSuccess ? 'done' : ''}`}>
                <span className="fb-criterion-dot"></span>
                {c}
              </div>
            ))}
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="fb-hint-minimal" style={{margin:'8px 12px'}}>
                <i className="ti ti-bulb"></i>
                <span>{(challenge as any).pista || "Revisa los recursos disponibles para completar el reto."}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tablero DinÃ¡mico (Multimodal) */}
        <div className="fb-editor-container">
          {challenge.id === 'RB-C1-N1' ? (
            <div className="fb-board-cell">
              <TimelineGame />
            </div>
          ) : challenge.id === 'RB-C1-N2' ? (
            <div className="fb-board-cell">
              <MatchImageTerms />
            </div>
          ) : challenge.id === 'RB-C1-N3' ? (
            <div className="fb-board-cell">
              <MatchTechSituations />
            </div>
          ) : challenge.id === 'RB-C2-N1' ? (
            <div className="fb-board-cell">
              <DriveFileSorter />
            </div>
          ) : challenge.id === 'RB-C2-N2' ? (
            <div className="fb-board-cell">
              <DragAndDropBoard 
                challengeId="RB-C2-N2" 
                onValidation={(success) => {
                  setBoardSuccess(success);
                  if (success) {
                    setConsoleMessages([{ type: 'ok', text: '> Â¡Reto completado con Ã©xito!' }]);
                    setErrCount(0);
                  } else {
                    setErrCount(prev => prev + 1);
                  }
                }} 
              />
            </div>
          ) : challenge.id === 'RB-C2-N3' ? (
            <div className="fb-board-cell">
              <DragAndDropBoard 
                challengeId="RB-C2-N3" 
                onValidation={(success) => {
                  setBoardSuccess(success);
                  if (success) {
                    setConsoleMessages([{ type: 'ok', text: '> Â¡Reto completado con Ã©xito!' }]);
                    setErrCount(0);
                  } else {
                    setErrCount(prev => prev + 1);
                  }
                }} 
              />
            </div>
          ) : challenge.id === 'RB-C4-N1' ? (
            <div className="fb-board-cell">
              <DigitalAccessQuiz 
                onValidation={(success) => {
                  setBoardSuccess(success);
                  if (success) {
                    setConsoleMessages([{ type: 'ok', text: '> Â¡Reto completado con Ã©xito!' }]);
                    setErrCount(0);
                  } else {
                    setErrCount(prev => prev + 1);
                  }
                }} 
              />
            </div>
          ) : challenge.id === 'RB-C4-N2' ? (
            <div className="fb-board-cell">
              <SocialMediaQuiz 
                onValidation={(success) => {
                  setBoardSuccess(success);
                  if (success) {
                    setConsoleMessages([{ type: 'ok', text: '> Â¡Reto completado con Ã©xito!' }]);
                    setErrCount(0);
                  } else {
                    setErrCount(prev => prev + 1);
                  }
                }} 
              />
            </div>
          ) : challenge.id === 'RB-C3-N1' ? (
            <div className="fb-board-cell">
              <DragAndDropBoard 
                challengeId={challenge.id} 
                onValidation={(success) => {
                  setBoardSuccess(success);
                  if (success) {
                    setConsoleMessages([{ type: 'ok', text: '> Â¡Orden correcto! Reto completado con Ã©xito.' }]);
                    setErrCount(0);
                  } else {
                    setConsoleMessages([{ type: 'sys', text: '> Entorno preparado.' }]);
                    setErrCount(prev => prev + 1);
                  }
                }} 
              />
            </div>
          ) : challenge.id === 'RB-C3-N2' ? (
            <div className="fb-board-cell">
              <AttendanceSimulator 
                onValidation={(success) => {
                  setBoardSuccess(success);
                  if (success) {
                    setConsoleMessages([{ type: 'ok', text: '> Â¡Reto completado con Ã©xito!' }]);
                    setErrCount(0);
                  } else {
                    setErrCount(prev => prev + 1);
                  }
                }} 
              />
            </div>
          ) : challenge.id === 'RM-C1-N1' ? (
            <div className="fb-board-cell">
              <SmartphoneAnatomyQuiz 
                onValidation={(success) => {
                  setBoardSuccess(success);
                  if (success) {
                    setConsoleMessages([{ type: 'ok', text: '> Â¡Reto completado con Ã©xito!' }]);
                    setErrCount(0);
                  } else {
                    setErrCount(prev => prev + 1);
                  }
                }} 
              />
            </div>
          ) : challenge.id === 'RM-C1-N2' ? (
            <div className="fb-board-cell">
              <ComputingEvolutionQuiz 
                onValidation={(success) => {
                  setBoardSuccess(success);
                  if (success) {
                    setConsoleMessages([{ type: 'ok', text: '> Â¡Reto completado con Ã©xito!' }]);
                    setErrCount(0);
                  } else {
                    setErrCount(prev => prev + 1);
                  }
                }} 
              />
            </div>
          ) : challenge.id === 'RM-C1-N3' ? (
            <div className="fb-board-cell">
              <ProspectiveTechEssay 
                challengeId="RM-C1-N3" 
                onValidation={(success) => {
                  setBoardSuccess(success);
                  if (success) {
                    setConsoleMessages([{ type: 'ok', text: '> Â¡Reto completado con Ã©xito!' }]);
                    setErrCount(0);
                  } else {
                    setErrCount(prev => prev + 1);
                  }
                }} 
              />
            </div>
          ) : challenge.id === 'RM-C2-N3' ? (
            <div className="fb-board-cell">
              <SqlBlockBoard 
                challengeId="RM-C2-N3" 
                onValidation={(success) => {
                  setBoardSuccess(success);
                  if (success) {
                    setConsoleMessages([{ type: 'ok', text: '> Â¡Consulta ejecutada con Ã©xito!' }]);
                    setErrCount(0);
                  } else {
                    setErrCount(prev => prev + 1);
                  }
                }} 
              />
            </div>
          ) : challenge.id === 'RM-C3-N1' ? (
            <div className="fb-board-cell">
              <ArduinoBlockBoard 
                challengeId="RM-C3-N1" 
                onValidation={(success) => {
                  setBoardSuccess(success);
                  if (success) {
                    setConsoleMessages([{ type: 'ok', text: '> Â¡CÃ³digo Arduino correcto! SimulaciÃ³n lista.' }]);
                    setErrCount(0);
                  } else {
                    setErrCount(prev => prev + 1);
                  }
                }} 
              />
            </div>
          ) : (challenge.id === 'RM-C3-N2' || challenge.id === 'RM-C3-N3') ? (
            <div className="fb-board-cell">
              <CodeBlockBoard 
                id={challenge.id} 
                onValidation={(success) => {
                  setBoardSuccess(success);
                  if (success) {
                    setConsoleMessages([{ type: 'ok', text: '> ¡Código correcto! Reto completado.' }]);
                    setErrCount(0);
                  } else {
                    setErrCount(prev => prev + 1);
                  }
                }} 
              />
            </div>
          ) : ['RA-C2-N1', 'RA-C2-N2', 'RA-C2-N3', 'RA-C3-N2', 'RA-C3-N3'].includes(challenge.id) ? (
            <div className="fb-board-cell">
              <CodingIDEBoard
                challengeId={challenge.id}
                onValidation={(success) => {
                  setBoardSuccess(success);
                  if (success) {
                    setConsoleMessages([{ type: 'ok', text: '> Evaluación completada con éxito.' }]);
                    setErrCount(0);
                  } else {
                    setErrCount(prev => prev + 1);
                  }
                }}
              />
            </div>
          ) : getBoardType(challenge.id) === 'drag_drop' ? (
            <div className="fb-board-cell">
              <DragAndDropBoard 
                challengeId={challenge.id} 
                onValidation={(success) => {
                  setBoardSuccess(success);
                  if (success) {
                    setConsoleMessages([{ type: 'ok', text: '> Â¡Orden correcto! Reto completado con Ã©xito.' }]);
                    setErrCount(0);
                  } else {
                    setConsoleMessages([{ type: 'sys', text: '> Entorno preparado.' }]);
                    setErrCount(prev => prev + 1);
                  }
                }} 
              />
            </div>
          ) : getBoardType(challenge.id) === 'text' ? (
            <div className="fb-board-cell">
              <EssayBoard 
                challengeId={challenge.id} 
                onValidation={(success) => {
                  setBoardSuccess(success);
                }} 
              />
            </div>
          ) : getBoardType(challenge.id) === 'phone_dismantle' ? (
            <div className="fb-board-cell">
              <PhoneDismantlingBoard 
                challengeId={challenge.id} 
                onValidation={(success) => {
                  setBoardSuccess(success);
                  if (success) {
                    setConsoleMessages([{ type: 'ok', text: '> Evaluacion completada con exito.' }]);
                    setErrCount(0);
                  } else {
                    setErrCount(prev => prev + 1);
                  }
                }} 
              />
            </div>
          ) : getBoardType(challenge.id) === 'upload' ? (
            <div className="fb-board-cell">
              <UploadBoard 
                challengeId={challenge.id} 
                onValidation={(success) => {
                  setBoardSuccess(success);
                }} 
              />
            </div>
          ) : getBoardType(challenge.id) === 'canvas' ? (
            <div className="fb-board-cell">
              <CanvasBoard 
                challengeId={challenge.id} 
                onValidation={(success) => {
                  setBoardSuccess(success);
                }} 
              />
            </div>
          ) : getBoardType(challenge.id) === 'spreadsheet' ? (
            <div className="fb-board-cell">
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

        {/* Right Sidebar */}
        <div className="fb-sidebar-r">
          <div className="fb-panel-title">
            <i className="ti ti-chart-bar" style={{fontSize:13}}></i>
            M&eacute;tricas de proceso
            <span className="fb-live-badge" style={{marginLeft:'auto',marginRight:0}}>live</span>
          </div>

          <div className="fb-metric-block">
            <div className="fb-metric-label">Latencia cognitiva</div>
            <div className="fb-metric-val">
              {pauseSecs} <span className="fb-metric-unit">seg pausa</span>
            </div>
            <div className="fb-metric-bar">
              <div className="fb-metric-fill" style={{
                width: Math.min((pauseSecs / 30) * 100, 100) + '%',
                background: pauseSecs > 10 ? '#ff7b72' : pauseSecs > 5 ? '#f2cc60' : '#238636'
              }}></div>
            </div>
          </div>

          <div className="fb-metric-block">
            <div className="fb-metric-label">Densidad de edici&oacute;n</div>
            <div className="fb-metric-val">
              {editCount} <span className="fb-metric-unit">cambios</span>
            </div>
            <div className="fb-metric-bar">
              <div className="fb-metric-fill" style={{
                width: Math.min((editCount / 50) * 100, 100) + '%',
                background: editCount > 35 ? '#ff7b72' : '#388bfd'
              }}></div>
            </div>
          </div>

          <div className="fb-metric-block">
            <div className="fb-metric-label">Tasa de error</div>
            <div className="fb-metric-val">
              {errCount} <span className="fb-metric-unit">/ {totalRuns || 1} runs</span>
            </div>
            <div className="fb-metric-bar">
              <div className="fb-metric-fill" style={{
                width: Math.min(totalRuns > 0 ? (errCount / totalRuns) * 100 : 0, 100) + '%',
                background: '#ff7b72'
              }}></div>
            </div>
          </div>

          {errCount >= 2 && !boardSuccess && (
            <div className="fb-alert">
              <i className="ti ti-alert-triangle"></i>
              <span>Alta latencia detectada. Posible bloqueo conceptual.</span>
            </div>
          )}

          <div className="fb-andamiaje">
            <div className="fb-andamiaje-title">Andamiaje disponible</div>
            <div className="fb-hint-item" onClick={() => setShowHint(true)}>
              <i className="ti ti-bulb"></i>
              Pista 1: revisa los recursos
            </div>
            <div className={`fb-hint-item ${errCount < 2 ? 'locked' : ''}`}>
              <i className={`ti ${errCount < 2 ? 'ti-lock' : 'ti-bulb'}`}></i>
              Pista 2: verifica la sintaxis
            </div>
          </div>

          <div className="fb-checkpoint">
            <div className="fb-checkpoint-title">
              <i className="ti ti-list-check" style={{fontSize:12}}></i>
              Progreso del reto
            </div>
            <div className="fb-checkpoint-item">
              <i className={`ti ${boardSuccess ? 'ti-circle-check' : 'ti-circle'} fb-check-icon`} style={{color: boardSuccess ? '#238636' : '#3d444d'}}></i>
              <span style={{fontSize:11, color: boardSuccess ? '#238636' : '#8b949e'}}>C&oacute;digo completado</span>
            </div>
            <div className="fb-checkpoint-item">
              <i className={`ti ${totalRuns > 0 && errCount === 0 ? 'ti-circle-check' : 'ti-circle'} fb-check-icon`} style={{color: totalRuns > 0 && errCount === 0 ? '#238636' : '#3d444d'}}></i>
              <span style={{fontSize:11, color: totalRuns > 0 && errCount === 0 ? '#238636' : '#8b949e'}}>Ejecuci&oacute;n exitosa</span>
            </div>
            <div className="fb-checkpoint-item">
              <i className={`ti ${boardSuccess ? 'ti-circle-check' : 'ti-circle'} fb-check-icon`} style={{color: boardSuccess ? '#238636' : '#3d444d'}}></i>
              <span style={{fontSize:11, color: boardSuccess ? '#238636' : '#8b949e'}}>Criterios cumplidos</span>
            </div>
          </div>

          <div className="fb-submit-zone">
            <button
              className={`fb-btn-submit ${boardSuccess ? 'ready' : ''}`}
              onClick={handleSubmit}
            >
              <i className="ti ti-send" style={{fontSize:13}}></i>
              Enviar soluci&oacute;n &rarr; Fase C
            </button>
            <div style={{fontSize:10,fontFamily:'\"IBM Plex Mono\",monospace',color:'#3d444d',textAlign:'center',marginTop:6}}>
              {boardSuccess ? 'Listo para enviar' : 'Completa todos los criterios'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

