import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { usePhaseSync } from '../hooks/usePhaseSync';
import { useTheme } from '../ThemeContext';
import { DynamicChallenge, dynamicChallengeBank } from '../data/dynamicChallengeBank';
import { EvaluationTracker } from '../components/EvaluationTracker';
import { DragAndDropBoard } from '../components/DragAndDropBoard';
import { EssayBoard } from '../components/EssayBoard';
import { CanvasBoard } from '../components/CanvasBoard';
import { PhoneDismantlingBoard } from '../components/PhoneDismantlingBoard';
import { CodingIDEBoard } from '../components/CodingIDEBoard';
import { SqlBlockBoard } from '../components/SqlBlockBoard';
import { ArduinoBlockBoard } from '../components/ArduinoBlockBoard';
import { CodeBlockBoard } from '../components/CodeBlockBoard';
import { AdvancedIcfesBoard } from '../components/AdvancedIcfesBoard';

// Import interactive custom components
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
import MiniExcelBoard from '../components/MiniExcelBoard';
import { DigitalIdentityBoard } from '../components/DigitalIdentityBoard';
import { ArduinoHuertaBoard } from '../components/ArduinoHuertaBoard';
import { SandwichAlgorithm } from '../components/SandwichAlgorithm';
import LibraryPseudocode from '../components/LibraryPseudocode';
import { nuevasEstrategias } from '../data/metacognitiveStrategies';
import { getChallengeInstructions } from '../data/challengeInstructions';
import { getChallengeProfile } from '../data/challengeProfiles';
import { getChallengeBriefing } from '../data/challengeBriefings';
import { getStrategyChallengeGuidance } from '../data/strategyChallengeGuidance';
import { StrategyEvidence } from '../components/StrategyMonitor';
import { StrategyHelpToolkit } from '../components/StrategyHelpToolkit';
import { normalizeJolAverage } from '../lib/jolNormalization';
import { ActivitySetupTour } from '../components/ActivitySetupTour';

import './CognitiveChallenge.css';

export function CognitiveChallenge() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { addEvent, currentLevel, assignedStrategyId, currentSessionId, user } = useCognitiveStore();
  const { syncPhaseB } = usePhaseSync();

  // Estado del Tutorial Spotlight para la actividad interactiva
  const [isActivityTourOpen, setIsActivityTourOpen] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('mpf_has_seen_activity_tour');
    if (currentLevel === 1 && !hasSeenTour) {
      setIsActivityTourOpen(true);
    }
  }, [currentLevel]);

  const handleCloseActivityTour = () => {
    setIsActivityTourOpen(false);
    localStorage.setItem('mpf_has_seen_activity_tour', 'true');
  };

  // Obtener estrategia activa (desde location state o desde el store)
  const activeStrategyId = location.state?.assignedStrategyId || assignedStrategyId;
  const activeStrategy = activeStrategyId
    ? (nuevasEstrategias.find(e => e.id === activeStrategyId) || null)
    : null;

  const boardWrapperClass = "flex-1 w-full flex flex-col justify-start bg-surface-container dark:bg-surface-container-high rounded-b-lg overflow-y-auto overflow-x-hidden p-1 md:p-4 min-h-0 relative border border-outline-variant/40";

  const getBoardType = (id: string): 'drag_drop' | 'text' | 'upload' | 'code' | 'canvas' | 'spreadsheet' | 'phone' | 'ide' => {
    const mappings: Record<string, 'drag_drop' | 'text' | 'upload' | 'code' | 'canvas' | 'spreadsheet' | 'phone' | 'ide'> = {
      // Básico
      "RB-C1-N1": "drag_drop", "RB-C2-N1": "drag_drop", "RB-C3-N1": "canvas", "RB-C4-N1": "canvas",
      "RB-C1-N2": "upload", "RB-C2-N2": "upload", "RB-C3-N2": "code", "RB-C4-N2": "text",
      "RB-C1-N3": "text", "RB-C2-N3": "spreadsheet", "RB-C3-N3": "drag_drop", "RB-C4-N3": "text",
      // Medio
      "RM-C1-N1": "canvas", "RM-C1-N2": "text", "RM-C1-N3": "text", 
      "RM-C2-N1": "spreadsheet", "RM-C2-N2": "canvas", "RM-C2-N3": "spreadsheet", 
      "RM-C3-N1": "upload", "RM-C3-N2": "code", "RM-C3-N3": "code", 
      "RM-C4-N1": "text", "RM-C4-N2": "text", "RM-C4-N3": "text",
      // Avanzado
      "RA-C1-N1": "phone", "RA-C1-N2": "text", "RA-C1-N3": "text", 
      "RA-C2-N1": "ide", "RA-C2-N2": "ide", "RA-C2-N3": "ide",
      "RA-C3-N1": "ide", "RA-C3-N2": "ide", "RA-C3-N3": "ide", 
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

  const challengeProfile = getChallengeProfile(challenge.id);
  const challengeBriefing = getChallengeBriefing(challenge.id, challenge.tiempo_estimado);
  const strategyGuidance = activeStrategy
    ? getStrategyChallengeGuidance(challenge.id, activeStrategy.id)
    : null;

  const initialJolAnswers = location.state?.jolAnswers || {};
  const jolTimes = location.state?.jolTimes || {};
  const estimatedTime = location.state?.estimatedTime || 0;

  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [editCount, setEditCount] = useState(0);
  const [pauseSecs, setPauseSecs] = useState(0);
  const [totalRuns, setTotalRuns] = useState(0);
  const [errCount, setErrCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [mouseDistance, setMouseDistance] = useState(0);
  const [mouseHistory, setMouseHistory] = useState<{x: number, y: number}[]>([]);
  const boardAreaRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('editor');
  const [hintCount, setHintCount] = useState(0);
  const [strategyEvidence, setStrategyEvidence] = useState<Partial<StrategyEvidence>>({});
  
  const [showHint, setShowHint] = useState(false);
  const [activeHint, setActiveHint] = useState<null | 1 | 2>(null);
  const [boardSuccess, setBoardSuccess] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultScore, setResultScore] = useState(0);
  const [resultPassed, setResultPassed] = useState(false);
  const [alternativeChallenge, setAlternativeChallenge] = useState<DynamicChallenge | null>(null);

  const secondsRef = useRef(seconds);
  const clickCountRef = useRef(clickCount);
  secondsRef.current = seconds;
  clickCountRef.current = clickCount;
  const lastBoardValidationRef = useRef<boolean | null>(null);

  // Callback estable: los tableros hijos lo usan en useEffect y no debe cambiar cada tick.
  const handleBoardValidation = useCallback((success: boolean, customMessage?: string) => {
    if (lastBoardValidationRef.current === success) return;
    lastBoardValidationRef.current = success;

    setBoardSuccess(success);
    setTotalRuns(prev => prev + 1);

    if (success) {
      setConsoleMessages([{
        type: 'ok',
        text: customMessage || '> ¡Reto interactivo completado con éxito! Puedes avanzar.'
      }]);
      setErrCount(0);
    } else {
      setErrCount(prev => prev + 1);
      addEvent('QUIZ_ANSWER', {
        questionId: challenge.id,
        correct: false,
        timeSpent: secondsRef.current,
        clicks: clickCountRef.current,
        timestamp: Date.now(),
        source: 'phase-b-board'
      });
    }
  }, [addEvent, challenge.id]);

  const componentMap: Record<string, React.ReactNode> = {
    // Nivel Básico (RB)
    'RB-C1-N1': <TimelineGame onValidation={handleBoardValidation} />,
    'RB-C1-N2': <MatchImageTerms onValidation={handleBoardValidation} />,
    'RB-C1-N3': <MatchTechSituations onValidation={handleBoardValidation} />,
    'RB-C2-N1': <DriveFileSorter onValidation={handleBoardValidation} />,
    'RB-C2-N2': <DragAndDropBoard challengeId="RB-C2-N2" onValidation={handleBoardValidation} />,
    'RB-C2-N3': <DragAndDropBoard challengeId="RB-C2-N3" onValidation={handleBoardValidation} />,
    'RB-C3-N1': <SandwichAlgorithm challengeId="RB-C3-N1" onValidation={handleBoardValidation} />,
    'RB-C3-N2': <AttendanceSimulator challengeId="RB-C3-N2" onValidation={handleBoardValidation} />,
    'RB-C3-N3': <LibraryPseudocode onValidation={handleBoardValidation} />,
    'RB-C4-N1': <DigitalAccessQuiz challengeId="RB-C4-N1" onValidation={handleBoardValidation} />,
    'RB-C4-N2': <SocialMediaQuiz challengeId="RB-C4-N2" onValidation={handleBoardValidation} />,
    'RB-C4-N3': <EssayBoard challengeId="RB-C4-N3" onValidation={handleBoardValidation} />,
    // Nivel Medio (RM)
    'RM-C1-N1': <SmartphoneAnatomyQuiz challengeId="RM-C1-N1" onValidation={handleBoardValidation} />,
    'RM-C1-N2': <ComputingEvolutionQuiz challengeId="RM-C1-N2" onValidation={handleBoardValidation} />,
    'RM-C1-N3': <ProspectiveTechEssay challengeId="RM-C1-N3" onValidation={handleBoardValidation} />,
    'RM-C2-N1': <MiniExcelBoard challengeId="RM-C2-N1" onValidation={handleBoardValidation} />,
    'RM-C2-N2': <DigitalIdentityBoard challengeId="RM-C2-N2" onValidation={handleBoardValidation} />,
    'RM-C2-N3': <SqlBlockBoard challengeId="RM-C2-N3" onValidation={handleBoardValidation} />,
    'RM-C3-N1': <ArduinoBlockBoard challengeId="RM-C3-N1" onValidation={handleBoardValidation} />,
    'RM-C3-N2': <CodeBlockBoard challengeId="RM-C3-N2" onValidation={handleBoardValidation} />,
    'RM-C3-N3': <CodeBlockBoard challengeId="RM-C3-N3" onValidation={handleBoardValidation} />,
    'RM-C4-N1': <EssayBoard challengeId="RM-C4-N1" onValidation={handleBoardValidation} />,
    'RM-C4-N2': <EssayBoard challengeId="RM-C4-N2" onValidation={handleBoardValidation} />,
    'RM-C4-N3': <EssayBoard challengeId="RM-C4-N3" onValidation={handleBoardValidation} />,
    // Nivel Avanzado (RA)
    'RA-C1-N1': <PhoneDismantlingBoard challengeId="RA-C1-N1" onValidation={handleBoardValidation} />,
    'RA-C1-N2': <CodingIDEBoard challengeId="RA-C1-N2" onValidation={handleBoardValidation} />,
    'RA-C1-N3': <EssayBoard challengeId="RA-C1-N3" onValidation={handleBoardValidation} />,
    'RA-C2-N1': <CodingIDEBoard challengeId="RA-C2-N1" onValidation={handleBoardValidation} />,
    'RA-C2-N2': <CodingIDEBoard challengeId="RA-C2-N2" onValidation={handleBoardValidation} />,
    'RA-C2-N3': <CodingIDEBoard challengeId="RA-C2-N3" onValidation={handleBoardValidation} />,
    'RA-C3-N1': <ArduinoHuertaBoard challengeId="RA-C3-N1" onValidation={handleBoardValidation} />,
    'RA-C3-N2': <CodingIDEBoard challengeId="RA-C3-N2" onValidation={handleBoardValidation} />,
    'RA-C3-N3': <CodingIDEBoard challengeId="RA-C3-N3" onValidation={handleBoardValidation} />,
    'RA-C4-N1': <AdvancedIcfesBoard challengeId="RA-C4-N1" onValidation={handleBoardValidation} />,
    'RA-C4-N2': <AdvancedIcfesBoard challengeId="RA-C4-N2" onValidation={handleBoardValidation} />,
    'RA-C4-N3': <AdvancedIcfesBoard challengeId="RA-C4-N3" onValidation={handleBoardValidation} />,
  };

  const handleStrategyEvidence = useCallback((ev: Partial<StrategyEvidence>) => {
    setStrategyEvidence(prev => {
      const next = { ...prev, ...ev };
      const unchanged = Object.keys(ev).every(
        k => prev[k as keyof StrategyEvidence] === next[k as keyof StrategyEvidence]
      );
      return unchanged ? prev : next;
    });
  }, []);

  const handleBoardAreaClick = () => {
    setClickCount(p => p + 1);
  };

  // Abre una pista como alerta modal y la contabiliza para la calibración.
  // La Pista 2 se habilita en cuanto ya se pidió la Pista 1.
  const openHint = (n: 1 | 2) => {
    if (n === 2 && !showHint) return;
    setActiveHint(n);
    setShowHint(true);
    setHintCount(hc => hc + 1);
  };

  // JOL promedio de Fase A, normalizado a 0-10 según la escala real de cada pregunta
  // (mezclar minutos/intentos/porcentajes/1-10 sin normalizar produce valores fuera de rango, p.ej. "27/10")
  const estimatedMinutes = typeof estimatedTime === 'number' ? estimatedTime : parseInt(estimatedTime) || 0;
  const jolInicial = Object.keys(initialJolAnswers).length > 0
    ? normalizeJolAverage(initialJolAnswers, estimatedMinutes)
    : undefined;
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

    window.addEventListener('mousemove', trackMouse);
    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', trackMouse);
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
      if (newRuns >= 2 && !showHint) {
        setShowHint(true);
        setActiveHint(1); // tras 2 intentos fallidos, la pista aparece sola (no cuenta contra la calibración)
      }
    }
  };

  const handleVerify = () => {
    let score = 0;
    let passed = false;

    if (boardSuccess) {
      score = Math.max(60, 100 - errCount * 10 - hintCount * 5 - Math.floor(seconds / 120) * 5);
      passed = true;
    } else {
      const hasOk = consoleMessages.some(m => m.type === 'ok');
      if (hasOk) {
        score = Math.max(60, 100 - errCount * 10 - hintCount * 5 - Math.floor(seconds / 120) * 5);
        passed = true;
      } else if (code.length > 30 || totalRuns > 0) {
        score = Math.max(0, 30 - errCount * 10);
        passed = false;
      }
    }

    // Si falla, calcular un reto alternativo del mismo componente
    if (!passed) {
      const currentComp = challenge.componente;
      const currentSubNivel = challenge.sub_nivel; // 'N1', 'N2', 'N3'
      const currentNivel = challenge.nivel;

      // Intentar bajar al N1 del mismo componente si no está en N1
      let alt: DynamicChallenge | null = null;
      if (currentSubNivel !== 'N1') {
        alt = dynamicChallengeBank.find(
          c => c.componente === currentComp && c.sub_nivel === 'N1' && c.id !== challenge.id
        ) || null;
      }

      // Si ya está en N1, buscar cualquier otro N1 del mismo nivel (diferente componente)
      if (!alt) {
        const otherN1 = dynamicChallengeBank.filter(
          c => c.nivel === currentNivel && c.sub_nivel === 'N1' && c.id !== challenge.id
        );
        if (otherN1.length > 0) {
          alt = otherN1[Math.floor(Math.random() * otherN1.length)];
        }
      }

      setAlternativeChallenge(alt);
    } else {
      setAlternativeChallenge(null);
    }

    setResultScore(Math.round(Math.max(0, Math.min(100, score))));
    setResultPassed(passed);
    setShowResultModal(true);
  };

  const handleSubmit = async () => {
    const isSuccess = boardSuccess || consoleMessages.some(m => m.type === 'ok');
    const finalScore = resultScore > 0 ? resultScore : (isSuccess ? 80 : 20);

    const payload = {
      challengeId: challenge.id,
      level: currentLevel,
      jolAnswers: initialJolAnswers,
      jolTimes,
      estimatedTime,
      estrategia_monitoreada: activeStrategyId,
      evidencias_estrategia: strategyEvidence,
      metricas_tecnicas: {
        score: finalScore,
        runs: totalRuns,
        hints: hintCount,
        edits: editCount,
        final_code: code,
        passed: isSuccess,
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
    await syncPhaseB();
    navigate('/calibration', { state: payload });
  };

  const getJolDisplay = () => {
    if (jolInicial === undefined) return 'JOL inicial: 8/10';
    return `JOL inicial: ${jolInicial.toFixed(1)}/10`;
  };

  const getDynamicAlert = () => {
    if (pauseSecs > 15) {
      return {
        icon: "ti ti-alert-triangle",
        text: "Alta latencia detectada. Posible bloqueo conceptual. Intenta usar las pistas de andamiaje."
      };
    }
    if (errCount >= 2) {
      return {
        icon: "ti ti-bug",
        text: "Múltiples errores detectados. Revisa los criterios de aceptación y las pistas."
      };
    }
    if (editCount > 30 && !boardSuccess) {
      return {
        icon: "ti ti-info-circle",
        text: "Alta densidad de edición. Te recomendamos repasar los criterios del reto."
      };
    }
    return {
      icon: "ti ti-activity",
      text: "Capturando métricas de ejecución. Tu proceso de calibración cognitiva se registra en tiempo real."
    };
  };

  const isChallengeDone = boardSuccess || consoleMessages.some(m => m.type === 'ok');
  const alertInfo = getDynamicAlert();

  return (
    <div className={`fb-root ${theme} clean-ui`}>
      <h2 style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
        Meta-Pathfinder Fase B: Área de trabajo del estudiante. Editor de código con métricas metacognitivas en tiempo real.
      </h2>

      {/* Header Premium */}
      <EvaluationTracker 
        currentPhase="B" 
        showTimerAndJol={true}
        seconds={seconds}
        jolDisplay={getJolDisplay()}
      />

      {/* Tutorial Spotlight Alert Flotante para la actividad interactiva */}
      <ActivitySetupTour
        isOpen={isActivityTourOpen}
        onClose={handleCloseActivityTour}
      />

      <div className="fb-layout">
        {/* Lateral Izquierdo: Reto y Criterios */}
        <div className="fb-sidebar-l" id="tour-activity-criteria">
          <div className="fb-panel-title">
            <i className="ti ti-target" aria-hidden="true" style={{ fontSize: '13px' }}></i>
            Reto activo
          </div>

          <div className="fb-reto-card">
            <div className="fb-reto-tag">MEN · {challenge.nivel} · {challenge.sub_nivel}</div>
            <div className="fb-reto-title">{challenge.titulo}</div>
            <div className="fb-reto-desc">{challengeBriefing.resumenSuave}</div>
          </div>

          {challengeProfile && (
            <div style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--fb-text-muted)', marginBottom: 12, padding: '10px 12px', background: 'var(--fb-surface-2, rgba(255,255,255,0.04))', borderRadius: 8, borderLeft: '3px solid var(--primary, #4f378b)' }}>
              <div style={{ fontWeight: 800, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--primary, #4f378b)', marginBottom: 6 }}>
                Consejo del profesor
              </div>
              {challengeProfile.consejoProfesor}
            </div>
          )}

          <div className="fb-criteria" style={{ marginBottom: '12px' }}>
            <div className="fb-criteria-title">Cómo completar esta actividad</div>
            {getChallengeInstructions(challenge.id).map((step, i) => (
              <div key={i} className="fb-criterion">
                <span className="fb-criterion-dot"></span>
                {step}
              </div>
            ))}
          </div>

          <div className="fb-criteria">
            <div className="fb-criteria-title">Criterios del reto</div>
            {challenge.criterios.map((c: string, i: number) => {
              const done = isChallengeDone || (consoleMessages.some(m => m.type === 'ok') && i === 0);
              return (
                <div key={i} className={`fb-criterion ${done ? 'done' : ''}`}>
                  <span className="fb-criterion-dot"></span>
                  {c}
                </div>
              );
            })}
          </div>
        </div>

        {/* Zona Central: Tablero o Editor */}
        <div className="fb-editor-zone" id="tour-activity-area">
          {activeStrategy && (
            <StrategyHelpToolkit
              variant="floating"
              challengeId={challenge.id}
              strategy={activeStrategy}
              seconds={seconds}
              editCount={editCount}
              errCount={errCount}
              totalRuns={totalRuns}
              hintCount={hintCount}
              clickCount={clickCount}
              isChallengeDone={isChallengeDone}
              criteriaCount={challenge.criterios.length}
              criteriaLabels={challenge.criterios}
              jolInicial={jolInicial}
              estimatedMinutes={estimatedMinutes}
              isCodeChallenge={
                !componentMap[challenge.id]
                  ? (getBoardType(challenge.id) === 'code' || getBoardType(challenge.id) === 'ide')
                  : ['RA-C1-N2', 'RA-C2-N1', 'RA-C2-N2', 'RA-C2-N3', 'RA-C3-N2', 'RA-C3-N3'].includes(challenge.id)
              }
              onEvidence={handleStrategyEvidence}
            />
          )}
          {componentMap[challenge.id] ? (
            <div ref={boardAreaRef} onClick={handleBoardAreaClick} className={boardWrapperClass}>
              {React.cloneElement(componentMap[challenge.id] as any, {
                challengeId: challenge.id,
                onValidation: (success: boolean) => handleBoardValidation(success)
              })}
            </div>
          ) : getBoardType(challenge.id) === 'drag_drop' ? (
            <div ref={boardAreaRef} onClick={handleBoardAreaClick} className={boardWrapperClass}>
              <DragAndDropBoard 
                challengeId={challenge.id} 
                onValidation={(success) => handleBoardValidation(success, '> ¡Orden correcto! Reto completado con éxito.')} 
              />
            </div>
          ) : getBoardType(challenge.id) === 'text' ? (
            <div ref={boardAreaRef} onClick={handleBoardAreaClick} className={boardWrapperClass}>
              <EssayBoard 
                challengeId={challenge.id} 
                onValidation={(success) => handleBoardValidation(success)} 
              />
            </div>
          ) : getBoardType(challenge.id) === 'canvas' ? (
            <div ref={boardAreaRef} onClick={handleBoardAreaClick} className={boardWrapperClass}>
              <CanvasBoard 
                challengeId={challenge.id} 
                onValidation={(success) => handleBoardValidation(success)} 
              />
            </div>
          ) : getBoardType(challenge.id) === 'phone' ? (
            <div ref={boardAreaRef} onClick={handleBoardAreaClick} className={boardWrapperClass}>
              <PhoneDismantlingBoard 
                challengeId={challenge.id} 
                onValidation={(success) => handleBoardValidation(success)} 
              />
            </div>
          ) : getBoardType(challenge.id) === 'ide' ? (
            <div ref={boardAreaRef} onClick={handleBoardAreaClick} className={boardWrapperClass}>
              <CodingIDEBoard 
                challengeId={challenge.id} 
                onValidation={(success) => handleBoardValidation(success)} 
              />
            </div>
          ) : (
            <>
              <div className="fb-editor-tabs">
                <div className="fb-tab active">
                  <i className="ti ti-brand-python" aria-hidden="true" style={{ fontSize: '13px' }}></i>
                  solucion.py
                  <span className="fb-tab-dot" title="Sin guardar"></span>
                </div>
                <div style={{ marginLeft: 'auto', padding: '0 14px', display: 'flex', alignItems: 'center' }}>
                  <span className="fb-live-badge">
                    <span className="fb-timer-dot" style={{ width: '5px', height: '5px' }}></span>
                    Capturando métricas
                  </span>
                </div>
              </div>

              <div ref={boardAreaRef} onClick={handleBoardAreaClick} className="fb-editor-area">
                <textarea
                  className="fb-editor-field"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setEditCount(c => c+1); lastEditTime.current = Date.now(); }}
                  spellCheck={false}
                  placeholder="# Desarrolla tu código aquí..."
                />
              </div>

              <div className="fb-editor-footer">
                <div className="fb-status-items">
                  <span className="fb-status-item">
                    <i className="ti ti-circle-dot" aria-hidden="true" style={{ fontSize: '12px', color: '#238636' }}></i>
                    Python 3.11
                  </span>
                  <span className="fb-status-item">
                    <i className="ti ti-pencil" aria-hidden="true" style={{ fontSize: '12px' }}></i>
                    Ediciones: <span style={{ color: 'var(--fb-text)', marginLeft: '3px' }}>{editCount}</span>
                  </span>
                  <span className="fb-status-item">
                    <i className="ti ti-clock" aria-hidden="true" style={{ fontSize: '12px' }}></i>
                    Pausa: <span style={{ color: 'var(--fb-warn)', marginLeft: '3px' }}>{pauseSecs}s</span>
                  </span>
                </div>
                <button className="fb-run-btn" onClick={handleRun}>
                  <i className="ti ti-player-play" aria-hidden="true" style={{ fontSize: '13px' }}></i>
                  Ejecutar
                </button>
              </div>

              <div className="fb-console">
                <div className="fb-console-line fb-console-muted">— Salida de Consola —</div>
                {consoleMessages.map((m, i) => (
                  <div key={i} className={`fb-console-line fb-console-${m.type}`}>
                    {m.text}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Lateral Derecho: Métricas y Progreso */}
        <div className="fb-sidebar-r">
          <div className="fb-panel-title">
            <i className="ti ti-chart-bar" aria-hidden="true" style={{ fontSize: '13px' }}></i>
            Métricas de proceso
            <span className="fb-live-badge" style={{ marginLeft: 'auto', marginRight: '0' }}>live</span>
          </div>

          {activeStrategy && (
            <div style={{
              background: activeStrategy.iconBg,
              border: `1px solid ${activeStrategy.color}33`,
              borderRadius: '10px',
              padding: '10px 12px',
              marginBottom: '12px',
              fontSize: '10px',
              color: 'var(--fb-text-muted)',
            }}>
              <div style={{ fontWeight: 800, color: activeStrategy.color, marginBottom: '4px', fontSize: '9px', textTransform: 'uppercase' }}>
                Estrategia activa
              </div>
              <div style={{ fontWeight: 700, color: 'var(--fb-text)', marginBottom: '6px' }}>{activeStrategy.nombre}</div>
              {strategyGuidance && (
                <div style={{ fontSize: 10, lineHeight: 1.45, marginBottom: 6 }}>
                  {strategyGuidance.mensajeProfesor}
                </div>
              )}
              {activeStrategy.herramientas.map(h => (
                <div key={h.id} style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 3 }}>
                  <i className={`ti ${h.icon}`} style={{ color: activeStrategy.color, fontSize: 10 }} />
                  <span>{h.nombre}</span>
                </div>
              ))}
              <div style={{ marginTop: 6, fontSize: 9, color: activeStrategy.color }}>
                Panel flotante de herramientas (esquina inferior izquierda). Puedes moverlo o minimizarlo.
              </div>
            </div>
          )}

          <div className="fb-metric-block">
            <div className="fb-metric-label">Latencia cognitiva</div>
            <div className="fb-metric-val">
              {pauseSecs} <span className="fb-metric-unit">seg pausa</span>
            </div>
            <div className="fb-metric-bar">
              <div 
                className="fb-metric-fill" 
                style={{ 
                  width: `${Math.min((pauseSecs / 30) * 100, 100)}%`, 
                  background: pauseSecs > 15 ? '#ff7b72' : pauseSecs > 5 ? '#f2cc60' : '#238636'
                }}
              ></div>
            </div>
          </div>

          <div className="fb-metric-block">
            <div className="fb-metric-label">Densidad de edición</div>
            <div className="fb-metric-val">
              {editCount} <span className="fb-metric-unit">cambios</span>
            </div>
            <div className="fb-metric-bar">
              <div 
                className="fb-metric-fill" 
                style={{ 
                  width: `${Math.min((editCount / 50) * 100, 100)}%`, 
                  background: '#388bfd' 
                }}
              ></div>
            </div>
          </div>

          <div className="fb-metric-block">
            <div className="fb-metric-label">Tasa de error</div>
            <div className="fb-metric-val">
              {errCount} <span className="fb-metric-unit">/ {totalRuns} runs</span>
            </div>
            <div className="fb-metric-bar">
              <div 
                className="fb-metric-fill" 
                style={{ 
                  width: `${totalRuns > 0 ? Math.min((errCount / totalRuns) * 100, 100) : 0}%`, 
                  background: '#ff7b72' 
                }}
              ></div>
            </div>
          </div>

          <div className="fb-alert">
            <i className={alertInfo.icon} aria-hidden="true" style={{ fontSize: '13px', color: 'var(--fb-warn)', marginTop: '2px' }}></i>
            <span>{alertInfo.text}</span>
          </div>

          <div className="fb-andamiaje">
            <div className="fb-andamiaje-title">Pistas de ayuda</div>
            <div className="fb-hint-item" onClick={() => openHint(1)}>
              <i className="ti ti-bulb" aria-hidden="true" style={{ color: 'var(--fb-blue)' }}></i>
              Pista 1: consejo para empezar
            </div>
            <div
              className={`fb-hint-item ${!showHint ? 'locked' : ''}`}
              onClick={() => openHint(2)}
              title={!showHint ? 'Pide primero la Pista 1' : undefined}
            >
              <i className={`ti ${showHint ? 'ti-bulb' : 'ti-lock'}`} aria-hidden="true" style={{ color: showHint ? 'var(--fb-blue)' : 'inherit' }}></i>
              Pista 2: errores frecuentes {!showHint && '(pide antes la Pista 1)'}
            </div>
          </div>

          <div className="fb-checkpoint">
            <div className="fb-checkpoint-title">
              <i className="ti ti-list-check" aria-hidden="true" style={{ fontSize: '12px' }}></i>
              Progreso del reto
            </div>
            {challenge.criterios.map((c: string, i: number) => {
              const done = isChallengeDone || (consoleMessages.some(m => m.type === 'ok') && i === 0);
              return (
                <div key={i} className="fb-checkpoint-item">
                  <i className={`ti fb-check-icon ${done ? 'ti-circle-check done' : 'ti-circle pending'}`} aria-hidden="true"></i>
                  <span style={{ fontSize: '11px', color: done ? '#238636' : 'var(--fb-text-muted)' }}>
                    {c.replace(/^\d+\.\s*/, '')}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="fb-submit-zone" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              className="fb-btn-verify" 
              onClick={handleVerify}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                background: 'var(--primary, #4f378b)', color: '#fff',
                border: 'none', fontWeight: 800, fontSize: '13px',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px'
              }}
            >
              <i className="ti ti-check" aria-hidden="true"></i>
              Verificar Respuesta
            </button>
            <button 
              className={`fb-btn-submit ${isChallengeDone ? 'ready' : ''}`} 
              id="submitBtn" 
              onClick={handleSubmit}
            >
              <i className="ti ti-send" aria-hidden="true" style={{ fontSize: '13px' }}></i>
              Enviar y ver mi análisis
            </button>
            <div style={{ fontSize: '10px', fontFamily: 'IBM Plex Mono, monospace', color: 'var(--fb-text-secondary)', textAlign: 'center', marginTop: '6px' }}>
              {isChallengeDone ? "¡Reto superado con éxito!" : "Completa la actividad para activar"}
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {showResultModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setShowResultModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)', padding: '28px',
                maxWidth: '420px', width: '100%',
                textAlign: 'center', border: `1px solid ${resultPassed ? 'var(--ok)' : 'var(--danger)'}`
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '14px' }}>
                {resultPassed ? '✓' : '✕'}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: resultPassed ? 'var(--ok)' : 'var(--danger)', marginBottom: '8px' }}>
                {resultPassed ? '¡Correcto!' : 'Resultado: No superado'}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--fb-text-muted, #8b949e)', marginBottom: '20px' }}>
                {resultPassed
                  ? 'Tu respuesta es correcta. Continúa a tu análisis de calibración.'
                  : 'La actividad no se completó del todo. Te proponemos una actividad de apoyo más sencilla.'}
              </p>
              <div style={{
                background: 'var(--surface-2)', borderRadius: 'var(--radius-md)',
                padding: '18px', marginBottom: '18px'
              }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  Puntaje
                </div>
                <div style={{ fontSize: '40px', fontWeight: 700, color: resultPassed ? 'var(--ok)' : 'var(--danger)' }}>
                  {resultScore}<span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>/100</span>
                </div>
              </div>

              {/* Actividad alternativa cuando falla */}
              {!resultPassed && alternativeChallenge && (
                <div style={{
                  background: 'rgba(56,139,253,0.08)',
                  border: '1px solid rgba(56,139,253,0.3)',
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '16px',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#388bfd', marginBottom: '6px' }}>
                    🔄 Actividad alternativa asignada
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fb-text, #c9d1d9)', marginBottom: '4px' }}>
                    {alternativeChallenge.titulo}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--fb-text-muted, #8b949e)' }}>
                    {alternativeChallenge.nivel} · {alternativeChallenge.sub_nivel} · {alternativeChallenge.componente}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => {
                    setShowResultModal(false);
                    if (resultPassed) {
                      handleSubmit();
                    } else if (alternativeChallenge) {
                      // Navegar a Fase A con el reto alternativo pre-asignado
                      const { setCurrentChallengeId } = useCognitiveStore.getState();
                      setCurrentChallengeId(alternativeChallenge.id);
                      navigate('/evaluation-prep', {
                        state: {
                          retryVariation: true,
                          previousChallengeId: challenge.id,
                          forcedChallengeId: alternativeChallenge.id
                        }
                      });
                    }
                  }}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 'var(--radius-md)',
                    background: resultPassed ? 'var(--ok)' : 'var(--accent)', color: 'var(--color-on-primary)',
                    border: 'none', fontWeight: 600, fontSize: '14px', fontFamily: 'var(--font-sans)',
                    cursor: 'pointer'
                  }}
                >
                  {resultPassed
                    ? 'Ver mi análisis'
                    : alternativeChallenge
                      ? 'Ir a la actividad de apoyo'
                      : 'Cerrar e intentar de nuevo'}
                </button>

                {!resultPassed && (
                  <button
                    onClick={() => setShowResultModal(false)}
                    style={{
                      width: '100%', padding: '11px', borderRadius: 'var(--radius-md)',
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                      fontWeight: 500, fontSize: '13px', fontFamily: 'var(--font-sans)',
                      cursor: 'pointer'
                    }}
                  >
                    Seguir intentando esta actividad
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerta de Pista */}
      <AnimatePresence>
        {activeHint !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 10000,
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}
            onClick={() => setActiveHint(null)}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--surface)',
                border: '2px solid var(--tour-hl)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                maxWidth: '420px', width: '100%',
                boxShadow: '0 20px 50px -12px rgba(0,0,0,0.4), 0 0 0 4px color-mix(in srgb, var(--tour-hl) 15%, transparent)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <i className="ti ti-bulb" style={{ fontSize: 22, color: 'var(--tour-hl)' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--tour-hl)' }}>
                  {activeHint === 1 ? 'Pista 1 · Consejo para empezar' : 'Pista 2 · Errores frecuentes'}
                </span>
              </div>

              {activeHint === 1 ? (
                <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6 }}>
                  <p style={{ margin: '0 0 10px 0' }}>
                    {challengeProfile?.consejoProfesor || challengeBriefing?.resumenSuave || 'Lee con calma la meta y los criterios del reto antes de actuar. Divídelo en pasos pequeños.'}
                  </p>
                  {challengeProfile?.metaConcreta && (
                    <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <strong style={{ color: 'var(--text)' }}>Tu meta: </strong>{challengeProfile.metaConcreta}
                    </p>
                  )}
                  {challengeProfile?.interaccionUI && (
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                      <strong style={{ color: 'var(--text)' }}>Cómo se hace: </strong>{challengeProfile.interaccionUI}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6 }}>
                  {challengeProfile?.erroresComunes && (
                    <p style={{ margin: '0 0 10px 0' }}>
                      <strong>Suele fallarse en: </strong>{challengeProfile.erroresComunes}
                    </p>
                  )}
                  <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text)' }}>Se comprueba con: </strong>
                    {challengeProfile?.verificarCon || 'el botón «Verificar»'}
                  </p>
                  {challenge.criterios?.length > 0 && (
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {challenge.criterios.map((c: string, i: number) => (
                        <li key={i} style={{ marginBottom: 3 }}>{c.replace(/^\d+\.\s*/, '')}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <button
                onClick={() => setActiveHint(null)}
                style={{
                  marginTop: '18px', width: '100%', padding: '11px',
                  borderRadius: 'var(--radius-md)', border: 'none',
                  background: 'var(--accent)', color: 'var(--color-on-primary)',
                  fontWeight: 600, fontSize: '14px', fontFamily: 'var(--font-sans)', cursor: 'pointer',
                }}
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
