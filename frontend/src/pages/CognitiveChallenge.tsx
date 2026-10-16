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
import { getEstrategia } from '../data/metacognitiveStrategies';
import { getChallengeInstructions } from '../data/challengeInstructions';
import { getChallengeProfile } from '../data/challengeProfiles';
import { getChallengeBriefing } from '../data/challengeBriefings';
import { getStrategyChallengeGuidance } from '../data/strategyChallengeGuidance';
import { StrategyEvidence } from '../components/StrategyMonitor';
import { StrategyHelpToolkit } from '../components/StrategyHelpToolkit';
import { normalizeJolAverage } from '../lib/jolNormalization';
import { ActivitySetupTour } from '../components/ActivitySetupTour';
import { TutorAdvisor, type HintLevel } from '../components/tutor/TutorAdvisor';
import { ReplanModal, type ReplanChoice } from '../components/tutor/ReplanModal';
import { certaintyContrast } from '../components/tutor/CertaintyPrompt';
import { getTutorHint3 } from '../data/tutorHints';
import { useTutorStore } from '../stores/useTutorStore';
import { blockingProbability, scaffoldLevel, longPauseThreshold, recordFinishedPause, SCAFFOLD_INFO, type BlockingSignals } from '../lib/tutorEngine';
import { api } from '../services/api';
import { ATTEMPT, answerDelta, compactAnswer, isTrialAndError, type BoardAnswer, type ValidationOpts } from '../lib/boardValidation';
import { AttemptConfidence } from '../components/tutor/AttemptConfidence';
import { v4 as uuidv4 } from 'uuid';

import './CognitiveChallenge.css';
import '../components/tutor/tutor.css';

export function CognitiveChallenge() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { addEvent, currentLevel, assignedStrategyId, currentSessionId, user, dbUserId } = useCognitiveStore();
  const { syncPhaseB } = usePhaseSync();
  const tutorPlan = useTutorStore((s) => s.plan);
  const tutorState = useTutorStore((s) => s.state);
  const tutorDomain = useTutorStore((s) => s.domain);
  const pushLatency = useTutorStore((s) => s.pushLatency);
  const recordShownResource = useTutorStore((s) => s.recordShownResource);

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
  const activeStrategy = getEstrategia(activeStrategyId);

  const boardWrapperClass = "flex-1 w-full flex flex-col justify-start bg-surface-container dark:bg-surface-container-high rounded-b-lg overflow-y-auto overflow-x-hidden p-1 md:p-3 min-h-0 relative border border-outline-variant/40 [&>*]:min-h-0 [&>*]:w-full [&>*]:flex-1";

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
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolsAttention, setToolsAttention] = useState(false);
  const [activeHint, setActiveHint] = useState<null | HintLevel>(null);

  // --- Estado del tutor (Fase B) ---
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [consecutiveHigh, setConsecutiveHigh] = useState(0);
  const [openedHints, setOpenedHints] = useState<HintLevel[]>([]);
  const [hintRatings, setHintRatings] = useState<Partial<Record<HintLevel, boolean>>>({});
  const [alternativeHint, setAlternativeHint] = useState<{ level: HintLevel; variant: 'analogia' | 'contraejemplo' } | null>(null);
  const [peerRecommendation, setPeerRecommendation] = useState<{ level: HintLevel; ratio: number; neighbours: number } | null>(null);
  const [checkpoints, setCheckpoints] = useState<number[]>([]);
  const [checkpointDue, setCheckpointDue] = useState(false);
  // Juicio de certeza para el contraste del resultado: la última confianza declarada por intento.
  const [certainty, setCertainty] = useState<{ value: number; label: string } | null>(null);
  // Un solo botón: al acertar con «Verificar» del tablero se abre el resultado sin otro botón.
  const [finishRequested, setFinishRequested] = useState(false);
  // Celular: el reto y el tutor son paneles flotantes; la actividad ocupa la pantalla.
  const [mobilePanel, setMobilePanel] = useState<null | 'reto' | 'tutor'>(null);
  const [tabChanges, setTabChanges] = useState(0);
  const [lastTabChangeAt, setLastTabChangeAt] = useState<number | null>(null);
  const [editsSinceRun, setEditsSinceRun] = useState(0);
  const [replanOpen, setReplanOpen] = useState(false);
  const [replanChoice, setReplanChoice] = useState<ReplanChoice | null>(null);
  const [pauseSamples, setPauseSamples] = useState<number[]>([]);
  const tutorMeta = useRef({
    autoHintShown: false, hintAfterError: null as boolean | null, hintBeforeThird: null as boolean | null,
    attemptsAfterHint: 0, firstEditAt: null as number | null, brakeTriggered: false, scaffoldShown: [] as string[],
    replanShownAt: 0, lastValidationAt: Date.now(), evidenceBeforeHelp: null as boolean | null,
  });

  // --- Registro de intervenciones del tutor (panel del administrador) ---
  // Cada intervención se envía en vivo; las que no lleguen (sin red o sin sesión) se reenvían en la Fase B.
  type TutorLogEvent = { event_type: 'TUTOR_INTERVENTION' | 'TUTOR_RESPONSE'; timestamp: string; metadata: Record<string, unknown>; sent: boolean };
  const tutorLog = useRef<TutorLogEvent[]>([]);
  const lastCheckpointRef = useRef<string | null>(null);
  const lastReplanRef = useRef<string | null>(null);
  const secondsNowRef = useRef(0);
  const sendTutorEvent = (ev: TutorLogEvent) => {
    tutorLog.current.push(ev);
    api.trackEvents({ session_id: currentSessionId, events: [{ event_type: ev.event_type, timestamp: ev.timestamp, metadata: ev.metadata }] })
      .then((r) => { if (r.stored > 0) ev.sent = true; })
      .catch(() => {});
  };
  const logIntervention = (kind: 'pista' | 'pista_auto' | 'andamiaje' | 'punto_control' | 'replanificacion' | 'freno',
    data: { level?: string | number | null; tactic?: string | null; initiator?: 'tutor' | 'estudiante'; detail?: string | null; p_block?: number | null } = {}): string => {
    const id = uuidv4();
    sendTutorEvent({
      event_type: 'TUTOR_INTERVENTION', timestamp: new Date().toISOString(), sent: false,
      metadata: { id, kind, challenge_id: challenge.id, t_seconds: secondsNowRef.current, initiator: data.initiator ?? 'tutor',
        level: data.level ?? null, tactic: data.tactic ?? null, detail: data.detail ?? null,
        p_block: data.p_block ?? null, err_count: errCountRef.current, runs: runsRef.current },
    });
    return id;
  };
  const logResponse = (ref: string | null, response: unknown) => {
    if (!ref) return;
    sendTutorEvent({ event_type: 'TUTOR_RESPONSE', timestamp: new Date().toISOString(), sent: false,
      metadata: { ref, response, challenge_id: challenge.id, t_seconds: secondsNowRef.current } });
  };
  const [boardSuccess, setBoardSuccess] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultScore, setResultScore] = useState(0);
  const [resultPassed, setResultPassed] = useState(false);
  const [alternativeChallenge, setAlternativeChallenge] = useState<DynamicChallenge | null>(null);

  const secondsRef = useRef(seconds);
  const errCountRef = useRef(0);
  const runsRef = useRef(0);
  const clickCountRef = useRef(clickCount);
  secondsRef.current = seconds;
  errCountRef.current = errCount;
  runsRef.current = totalRuns;
  clickCountRef.current = clickCount;
  // Último reporte de estado: los tableros que reportan en cada cambio (ensayos, orden tras
  // arrastrar) repiten el mismo valor; solo importa cuando pasa de aprobado a no aprobado o al revés.
  const lastStateReportRef = useRef<boolean | null>(null);
  // Contadores síncronos de intentos: dos verificaciones en el mismo tick no se pierden.
  const attemptStatsRef = useRef({ runs: 0, errors: 0 });

  // --- Captura por intento (respuesta, cambio, confianza y ayuda) ---
  // Última respuesta por ítem (la pregunta en los intentos parciales; '·' para el tablero entero).
  const lastAnswerRef = useRef(new Map<string, BoardAnswer>());
  const lastStateAnswerRef = useRef<BoardAnswer | undefined>(undefined);
  const lastFeedbackAtRef = useRef<number | null>(null);
  type AttemptLog = { t: number; correct: boolean; partial: boolean; confidence: number | null; delta: number | null;
    secs_since_feedback: number | null; trial_and_error: boolean };
  type HintLog = { t: number; level: HintLevel; auto: boolean; visible_ms: number; next_delta: number | null; next_changed: boolean | null };
  const attemptLogRef = useRef<AttemptLog[]>([]);
  const hintLogRef = useRef<HintLog[]>([]);
  const editsSinceRunRef = useRef(0);
  // Confianza por intento, por muestreo: tras un intento sin pregunta se pregunta con p = 0,5
  // y nunca dos seguidos → tasa estacionaria p / (1 + p) = 1/3 de los intentos.
  const confidenceRef = useRef<{ asked: boolean; value: number | null }>({ asked: Math.random() < 0.5, value: null });
  const [confidenceAsk, setConfidenceAsk] = useState(confidenceRef.current.asked);
  const [confidenceValue, setConfidenceValue] = useState<number | null>(null);
  const [confidenceDismissed, setConfidenceDismissed] = useState(false);

  // Callback estable: los tableros hijos lo usan en useEffect y no debe cambiar cada tick.
  // Contrato (lib/boardValidation): solo los intentos explícitos cuentan como run o error.
  const handleBoardValidation = useCallback((success: boolean, opts?: ValidationOpts, customMessage?: string) => {
    const showDone = () => setConsoleMessages([{
      type: 'ok',
      text: customMessage || '> ¡Lo lograste! La actividad quedó completa. Revisa los criterios y envía cuando quieras.'
    }]);

    if (!opts?.attempt) {
      // Trayectoria de la respuesta en tableros sin botón de verificar (arrastrar y soltar):
      // no cuenta como intento, pero deja ver cuánto cambia entre movimientos.
      const answer = compactAnswer(opts?.answer);
      if (answer !== undefined && answerDelta(lastStateAnswerRef.current, answer) !== 0) {
        addEvent('BOARD_STATE', { challengeId: challenge.id, correct: success, answer,
          delta: answerDelta(lastStateAnswerRef.current, answer), t_seconds: secondsRef.current });
        lastStateAnswerRef.current = answer;
      }
      if (lastStateReportRef.current === success) return;
      lastStateReportRef.current = success;
      setBoardSuccess(success);
      if (success) {
        showDone();
        // Cuestionarios: la última respuesta (intento parcial) cierra el tablero con este reporte.
        // Si hubo intentos, el resultado se abre solo; en ensayos y arrastres sin intentos no se
        // interrumpe al estudiante y queda el botón «Terminar».
        if (attemptStatsRef.current.runs > 0) setFinishRequested(true);
      }
      return;
    }

    const stats = attemptStatsRef.current;
    stats.runs += 1;
    if (!success) stats.errors += 1;
    setTotalRuns(stats.runs);
    setErrCount(stats.errors);
    // Latencia entre verificaciones: alimenta el freno metacognitivo personalizado.
    const now = Date.now();
    const latency = (now - tutorMeta.current.lastValidationAt) / 1000;
    pushLatency(latency);
    tutorMeta.current.lastValidationAt = now;
    setEditsSinceRun(0);
    const editsBefore = editsSinceRunRef.current;
    editsSinceRunRef.current = 0;

    // Cuánto cambió la respuesta frente al intento anterior del mismo ítem y cuánto esperó tras el resultado.
    const itemKey = opts.item !== undefined ? String(opts.item) : '·';
    const answer = compactAnswer(opts.answer);
    const delta = answerDelta(lastAnswerRef.current.get(itemKey), answer);
    if (answer !== undefined) lastAnswerRef.current.set(itemKey, answer);
    const secsSinceFeedback = lastFeedbackAtRef.current === null ? null : Number(((now - lastFeedbackAtRef.current) / 1000).toFixed(1));
    lastFeedbackAtRef.current = now;
    const trialAndError = isTrialAndError(delta, secsSinceFeedback);

    // Confianza de este intento (si tocaba preguntarla) y sorteo del siguiente.
    const conf = confidenceRef.current;
    const confidence = conf.asked ? conf.value : null;
    const nextAsk = conf.asked ? false : Math.random() < 0.5;
    confidenceRef.current = { asked: nextAsk, value: null };
    setConfidenceAsk(nextAsk);
    setConfidenceValue(null);
    setConfidenceDismissed(false);

    // Pistas abiertas desde el intento anterior: ¿el intento siguiente cambió algo?
    const hintsBefore = hintLogRef.current.filter(h => h.next_changed === null);
    hintsBefore.forEach(h => { h.next_delta = delta; h.next_changed = delta !== null ? delta > 0 : editsBefore > 0; });

    attemptLogRef.current.push({ t: secondsRef.current, correct: success, partial: Boolean(opts.partial), confidence,
      delta, secs_since_feedback: secsSinceFeedback, trial_and_error: trialAndError });
    if (confidence !== null) setCertainty({ value: confidence, label: `confianza ${confidence}` });
    if (tutorMeta.current.hintAfterError !== null || tutorMeta.current.autoHintShown) tutorMeta.current.attemptsAfterHint += 1;

    if (success) {
      setConsecutiveErrors(0);
    } else {
      setConsecutiveErrors(prev => prev + 1);
      // Antes que ATTEMPT: el freno reflexivo mide el tiempo desde el evento anterior.
      addEvent('QUIZ_ANSWER', {
        questionId: challenge.id,
        correct: false,
        timeSpent: secondsRef.current,
        clicks: clickCountRef.current,
        timestamp: now,
        source: 'phase-b-board'
      });
    }
    // Un evento por verificación (aciertos incluidos): permite reconstruir fallo, fallo, acierto.
    addEvent('ATTEMPT', {
      challengeId: challenge.id,
      correct: success,
      partial: Boolean(opts.partial),
      latency_s: Number(latency.toFixed(1)),
      errors_so_far: stats.errors,
      run: stats.runs,
      t_seconds: secondsRef.current,
      source: 'phase-b-board',
      item: opts.item ?? null,
      answer: answer ?? null,
      delta,
      secs_since_feedback: secsSinceFeedback,
      trial_and_error: trialAndError,
      confidence,
      confidence_prompted: conf.asked,
      edits_before: editsBefore,
      hints_before: hintsBefore.map(h => h.level),
    });

    // Un intento parcial (una pregunta, un paso) no decide si el tablero quedó completo.
    if (!opts.partial) {
      lastStateReportRef.current = success;
      setBoardSuccess(success);
      if (success) { showDone(); setFinishRequested(true); }
    }
  }, [addEvent, challenge.id, pushLatency]);

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

  // Detector único de actividad en el tablero (fase de captura, así ningún tablero lo bloquea).
  // Toda actividad reinicia la pausa. Cuenta como edición cada pointerdown (también inicia los
  // arrastres) y cada ráfaga de escritura (teclas separadas por más de 2 s), no cada tecla:
  // si no, un párrafo bastaría para disparar "ediciones sin éxito".
  const lastActivityAt = useRef(0);
  const registerActivity = useCallback((kind: 'pointerdown' | 'keydown' | 'input' | 'dragend' | 'drop') => {
    const now = Date.now();
    const sinceLast = now - lastActivityAt.current;
    lastActivityAt.current = now;
    // La pausa que acaba de terminar es una muestra del propio ritmo (nunca la pausa en curso).
    const finishedPause = (now - lastEditTime.current) / 1000;
    setPauseSamples(prev => recordFinishedPause(prev, finishedPause));
    lastEditTime.current = now;
    setPauseSecs(0);
    const typing = kind === 'keydown' || kind === 'input';
    if (kind !== 'pointerdown' && !(typing && sinceLast > 2000)) return;
    setEditCount(c => c + 1);
    setEditsSinceRun(c => c + 1);
    editsSinceRunRef.current += 1;
    if (tutorMeta.current.firstEditAt === null) tutorMeta.current.firstEditAt = secondsRef.current;
  }, []);
  const activityProps = {
    onPointerDownCapture: () => registerActivity('pointerdown'),
    onKeyDownCapture: () => registerActivity('keydown'),
    onInputCapture: () => registerActivity('input'),
    onDragEndCapture: () => registerActivity('dragend'),
    onDropCapture: () => registerActivity('drop'),
  };

  // Tableros en <iframe srcDoc>: el HTML interno avisa con postMessage({type:'ACTIVITY'}).
  // Solo se aceptan mensajes de un iframe que esté dentro del tablero.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type !== 'ACTIVITY') return;
      const frames = Array.from(boardAreaRef.current?.querySelectorAll('iframe') ?? []);
      if (!frames.some(f => f.contentWindow === e.source)) return;
      if (e.data.kind === 'keydown') registerActivity('keydown');
      else { setClickCount(p => p + 1); registerActivity('pointerdown'); }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [registerActivity]);

  // Pistas escalonadas (1 pregunta reflexiva · 2 señalamiento · 3 solución análoga).
  // Cada nivel se habilita tras el anterior. Se registra cuándo se pidió (tras error, antes del 3.er intento).
  const openHint = (n: HintLevel) => {
    if (n > 1 && !openedHints.includes((n - 1) as HintLevel) && !(n === 2 && showHint)) return;
    setActiveHint(n);
    setShowHint(true);
    if (!openedHints.includes(n)) {
      setOpenedHints(prev => [...prev, n]);
      setHintCount(hc => hc + 1);
      if (tutorMeta.current.hintAfterError === null) {
        tutorMeta.current.hintAfterError = errCount > 0;
        tutorMeta.current.hintBeforeThird = totalRuns < 3;
        tutorMeta.current.evidenceBeforeHelp = Object.values(strategyEvidence).some(v => v !== undefined && v !== null && v !== 0 && v !== '' && !(Array.isArray(v) && v.length === 0));
      }
      hintLogRef.current.push({ t: secondsRef.current, level: n, auto: false, visible_ms: 0, next_delta: null, next_changed: null });
      recordShownResource({ id: `${challenge.id}:hint${n}`, challengeId: challenge.id, level: n, tactic: n === 1 ? 'pregunta_socratica' : n === 2 ? 'senalamiento' : 'solucion_guiada' });
      addEvent('HINT_OPENED', { challengeId: challenge.id, level: n, errCount, runs: totalRuns });
      logIntervention('pista', { level: n, initiator: 'estudiante',
        tactic: n === 1 ? 'Pregunta socrática' : n === 2 ? 'Señalamiento del error' : (alternativeHint?.variant === 'contraejemplo' ? 'Contraejemplo' : 'Analogía cotidiana'),
        detail: n === 1 ? 'Pregunta reflexiva' : n === 2 ? 'Error frecuente del reto' : 'Solución análoga guiada' });
    }
  };

  // Tiempo que cada pista estuvo a la vista (se suma si se reabre).
  const hintOpenRef = useRef<{ level: HintLevel; since: number } | null>(null);
  useEffect(() => {
    const prev = hintOpenRef.current;
    if (prev) {
      const ms = Date.now() - prev.since;
      const entry = [...hintLogRef.current].reverse().find(h => h.level === prev.level);
      if (entry) entry.visible_ms += ms;
      addEvent('HINT_CLOSED', { challengeId: challenge.id, level: prev.level, visible_ms: ms, t_seconds: secondsRef.current });
    }
    hintOpenRef.current = activeHint !== null ? { level: activeHint, since: Date.now() } : null;
  }, [activeHint]);

  const pickConfidence = (value: number) => {
    confidenceRef.current.value = value;
    setConfidenceValue(value);
  };

  const rateHint = (level: HintLevel, helpful: boolean) => {
    setHintRatings(prev => ({ ...prev, [level]: helpful }));
    const resourceId = `${challenge.id}:hint${level}`;
    if (dbUserId) api.rateResource({ user_id: dbUserId, resource_id: resourceId, challenge_id: challenge.id, helpful }).catch(() => {});
    addEvent('RESOURCE_RATED', { resourceId, helpful });
    const hintEv = [...tutorLog.current].reverse().find(e => e.event_type === 'TUTOR_INTERVENTION' && e.metadata.kind === 'pista' && e.metadata.level === level);
    logResponse((hintEv?.metadata.id as string) ?? null, helpful ? 'útil' : 'no útil');
    if (!helpful) {
      if (level === 3) {
        // Sustitución en caliente: si la analogía no ayudó, se muestra el contraejemplo (y viceversa).
        const current = alternativeHint?.variant ?? 'analogia';
        setAlternativeHint({ level: 3, variant: current === 'analogia' ? 'contraejemplo' : 'analogia' });
      }
      // Recuperación por pares (k-NN): qué pista les sirvió a compañeros con un perfil parecido.
      if (dbUserId) {
        api.recommendResource(dbUserId, challenge.id, resourceId).then((r) => {
          const m = r.resource_id?.match(/:hint([123])$/);
          if (m) {
            setPeerRecommendation({ level: Number(m[1]) as HintLevel, ratio: r.helpful_ratio ?? 0.5, neighbours: r.neighbours });
            logIntervention('pista', { level: 'pares', tactic: 'Recomendación por pares (k-NN)', detail: `Pista ${m[1]} recomendada por ${r.neighbours} compañeros parecidos` });
          }
        }).catch(() => null);
      }
    }
  };

  const handleCheckpoint = (value: number) => {
    setCheckpoints(prev => [...prev, value]);
    setCheckpointDue(false);
    addEvent('CONFIDENCE_CHECKPOINT', { challengeId: challenge.id, value, seconds, errCount });
    if (lastCheckpointRef.current) { logResponse(lastCheckpointRef.current, `confianza ${value}/10`); lastCheckpointRef.current = null; }
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

  secondsNowRef.current = seconds;
  const brakeActive = useCognitiveStore((s) => s.isReflexiveBrakeActive);
  const brakeMessage = useCognitiveStore((s) => s.brakeMessage);
  useEffect(() => {
    if (brakeActive) logIntervention('freno', { tactic: 'Pausa reflexiva', detail: brakeMessage ?? 'Respuesta más rápida que su propio ritmo' });
  }, [brakeActive]);

  // Cambios de pestaña durante el reto (señal de bloqueo / distracción).
  useEffect(() => {
    const onVis = () => { if (document.hidden) { setTabChanges(t => t + 1); setLastTabChangeAt(Date.now()); } };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Puntos de control obligatorios (ZDP Básico) cada 3 minutos, salvo que la estrategia ya los pida.
  const mandatoryCheckpoints = Boolean(tutorPlan?.scaffold?.mandatory_checkpoints) && activeStrategyId !== 'est2';
  useEffect(() => {
    if (!mandatoryCheckpoints) return;
    if (seconds > 0 && seconds % 180 === 0) {
      setCheckpointDue(true);
      lastCheckpointRef.current = logIntervention('punto_control', { level: 'confianza', tactic: 'Punto de control obligatorio', detail: '¿Qué tan seguro/a vas? (ZDP Básico)' });
    }
  }, [seconds, mandatoryCheckpoints]);

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

    // Runs, errores, latencia y evento ATTEMPT se registran igual que en los tableros.
    handleBoardValidation(isSuccess, ATTEMPT, '> Reto completado con éxito. Puedes terminar la fase.');
    const newRuns = attemptStatsRef.current.runs;
    if (!isSuccess) {
      setConsoleMessages(prev => [...prev, { type: 'err', text: `> Buen intento ${newRuns}: aún no cumple. Mira la condición que falta y prueba otra vez.` }]);
      if (newRuns >= 2 && !showHint) {
        setShowHint(true);
        setActiveHint(1); // tras 2 intentos fallidos, la pista aparece sola (no cuenta contra la calibración)
        tutorMeta.current.autoHintShown = true;
        hintLogRef.current.push({ t: secondsRef.current, level: 1, auto: true, visible_ms: 0, next_delta: null, next_changed: null });
        logIntervention('pista_auto', { level: 1, tactic: 'Pregunta socrática', detail: 'Pista 1 automática tras 2 intentos fallidos' });
      }
    }
  };


  function runVerify() {
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
  }

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
      },
      tutor: {
        err_count: errCount,
        hint_count: hintCount,
        auto_hint_shown: tutorMeta.current.autoHintShown,
        hint_requested_after_error: tutorMeta.current.hintAfterError,
        hint_requested_before_third_attempt: tutorMeta.current.hintBeforeThird,
        attempts_after_hint: tutorMeta.current.attemptsAfterHint,
        reflexive_brake_triggered: useCognitiveStore.getState().events.some(e => e.metadata?.is_reflexive_brake && e.timestamp > Date.now() - seconds * 1000 - 5000),
        // Confianzas durante el reto (puntos de control, estrategia y por intento), en orden.
        checkpoints: [...checkpoints, ...(strategyEvidence.checkpointsConfianza ?? []),
          ...attemptLogRef.current.filter(a => a.confidence !== null).map(a => a.confidence as number)],
        checkpoints_requested: mandatoryCheckpoints || activeStrategyId === 'est2' || Boolean(certainty),
        certainty_prompted: Boolean(certainty),
        certainty_answered: Boolean(certainty),
        certainty_value: certainty?.value ?? null,
        tab_changes: tabChanges,
        time_before_first_edit: tutorMeta.current.firstEditAt,
        subtasks_created: strategyEvidence.subtasksCreated ?? 0,
        strategy_evidence_before_help: tutorMeta.current.evidenceBeforeHelp,
        mouse_erratic: mouseDistance > 15000 * Math.max(1, seconds / 300),
        scaffold_levels_shown: tutorMeta.current.scaffoldShown,
        replan_choice: replanChoice,
        hint_ratings: hintRatings,
        p_block_final: pBlock,
        // Por intento y por pista (Fase C: Brier por intento, Kalman con cada par, abuso/evitación de la ayuda).
        attempt_log: attemptLogRef.current,
        hint_log: hintLogRef.current,
      },
      challengeMeta: { titulo: challenge.titulo, criterios: challenge.criterios },
      tutorPendingEvents: tutorLog.current.filter(e => !e.sent).map(({ sent, ...e }) => e),
      tutorInterventionCount: tutorLog.current.filter(e => e.event_type === 'TUTOR_INTERVENTION').length,
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

  const isChallengeDone = boardSuccess || consoleMessages.some(m => m.type === 'ok');

  // Tras acertar con el «Verificar» del tablero, el resultado aparece solo (deja ver antes la
  // retroalimentación del tablero un momento). Es el único botón: el resultado lleva a la Fase C.
  useEffect(() => {
    if (!finishRequested) return;
    if (!isChallengeDone) { setFinishRequested(false); return; }
    const id = setTimeout(() => { setFinishRequested(false); setMobilePanel(null); runVerify(); }, 1300);
    return () => clearTimeout(id);
  }, [finishRequested, isChallengeDone]);

  // --- Probabilidad de bloqueo (Naive Bayes de dos clases) y escalera de andamiaje ---
  const pauseThreshold = longPauseThreshold(pauseSamples);
  const signals: BlockingSignals = {
    errores_seguidos: consecutiveErrors >= 2,
    pausa_larga: !isChallengeDone && pauseSecs > pauseThreshold,
    ediciones_sin_exito: !isChallengeDone && editsSinceRun > 10,
    cambio_pestana: lastTabChangeAt !== null && Date.now() - lastTabChangeAt < 60000,
  };
  const pBlock = isChallengeDone ? 0 : blockingProbability(signals, tutorDomain);
  const scaffold = isChallengeDone ? null : scaffoldLevel(pBlock, consecutiveHigh);

  // Instantánea del progreso cada 30 s: el envío en vivo la lleva al servidor y deja
  // rastro de tiempo, clics y bloqueo aunque el estudiante no llegue a enviar el reto.
  const progressRef = useRef({ pBlock, hintCount, editCount, tabChanges, mouseDistance, isChallengeDone });
  progressRef.current = { pBlock, hintCount, editCount, tabChanges, mouseDistance, isChallengeDone };
  useEffect(() => {
    const id = setInterval(() => {
      const p = progressRef.current;
      addEvent('CHALLENGE_PROGRESS', {
        challengeId: challenge.id, t_seconds: secondsRef.current, clicks: clickCountRef.current,
        runs: runsRef.current, err_count: errCountRef.current, hints: p.hintCount, edits: p.editCount,
        tab_changes: p.tabChanges, mouse_distance: Math.round(p.mouseDistance),
        p_block: Number(p.pBlock.toFixed(3)), done: p.isChallengeDone,
      });
    }, 30000);
    return () => clearInterval(id);
  }, [addEvent, challenge.id]);

  // Racha de probabilidad alta (N3). Las muestras de pausa se toman al terminar cada pausa (registerActivity).
  useEffect(() => {
    setConsecutiveHigh(prev => (pBlock >= 0.7 ? prev + 1 : 0));
  }, [errCount, totalRuns, signals.pausa_larga, signals.ediciones_sin_exito]);
  useEffect(() => {
    if (scaffold && !tutorMeta.current.scaffoldShown.includes(scaffold)) {
      tutorMeta.current.scaffoldShown.push(scaffold);
      addEvent('SCAFFOLD_SHOWN', { challengeId: challenge.id, level: scaffold, p_block: Number(pBlock.toFixed(3)), tactic: SCAFFOLD_INFO[scaffold].tactic });
      const active = (Object.entries(signals) as [string, boolean][]).filter(([, v]) => v).map(([k]) => k.replace(/_/g, ' '));
      logIntervention('andamiaje', { level: scaffold, tactic: SCAFFOLD_INFO[scaffold].tacticLabel, p_block: Number(pBlock.toFixed(3)),
        detail: `${SCAFFOLD_INFO[scaffold].name} · señales: ${active.join(', ') || '—'}` });
    }
  }, [scaffold]);

  // Replanificación en tiempo real: al tercer error seguido, la pantalla se atenúa y cambia la táctica.
  useEffect(() => {
    if (consecutiveErrors >= 3 && consecutiveErrors !== tutorMeta.current.replanShownAt && !isChallengeDone) {
      tutorMeta.current.replanShownAt = consecutiveErrors;
      setReplanOpen(true);
      addEvent('REPLAN_TRIGGERED', { challengeId: challenge.id, consecutiveErrors });
      lastReplanRef.current = logIntervention('replanificacion', { level: consecutiveErrors, tactic: 'Cambio de táctica', detail: `${consecutiveErrors} errores seguidos: pantalla atenuada con caminos alternativos` });
    }
  }, [consecutiveErrors, isChallengeDone]);

  const simplifiedChallenge = challenge.sub_nivel !== 'N1'
    ? dynamicChallengeBank.find(c => c.componente === challenge.componente && c.sub_nivel === 'N1' && c.id !== challenge.id) ?? null
    : null;

  const handleReplanChoice = (choice: ReplanChoice) => {
    setReplanOpen(false);
    setReplanChoice(choice);
    addEvent('REPLAN_CHOICE', { challengeId: challenge.id, choice });
    logResponse(lastReplanRef.current, choice === 'guiado' ? 'modo guiado paso a paso' : choice === 'simplificado' ? 'versión simplificada N1' : 'seguir por su cuenta');
    if (choice === 'continuar' && dbUserId) {
      api.tutorOverride({ user_id: dbUserId, session_id: currentSessionId, kind: 'advance', reason: 'continuar tras replanificación' }).catch(() => {});
    }
    if (choice === 'simplificado' && simplifiedChallenge) {
      useCognitiveStore.getState().setCurrentChallengeId(simplifiedChallenge.id);
      navigate('/evaluation-prep', { state: { retryVariation: true, previousChallengeId: challenge.id, forcedChallengeId: simplifiedChallenge.id } });
    }
    if (choice === 'guiado') setConsecutiveErrors(0);
  };

  const pendingCriteriaTexts = (tutorPlan?.zdp?.pending_criteria ?? tutorState?.zdp?.pending_criteria ?? [])
    .map(id => ({ id, text: tutorDomain?.criteria.find(c => c.id === id)?.text ?? tutorState?.criteria?.[id]?.text ?? '' }))
    .filter(c => c.text);

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
        <div className={`fb-sidebar-l ${mobilePanel === 'reto' ? 'fb-sheet-open' : ''}`} id="tour-activity-criteria">
          <div className="fb-sheet-head">
            <span>Reto y criterios</span>
            <button type="button" onClick={() => setMobilePanel(null)} aria-label="Cerrar panel"><i className="ti ti-x" aria-hidden="true" /></button>
          </div>
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
            <>
              <div
                id="tour-strategy-panel"
                className="fb-panel-title"
                style={{ margin: 0, flexShrink: 0, background: 'var(--fb-bg)', transition: 'background .2s' }}
              >
                <i className={`ti ${activeStrategy.icon}`} aria-hidden="true" style={{ fontSize: '13px', color: activeStrategy.color }}></i>
                <span style={{ color: activeStrategy.color }}>Herramientas de apoyo</span>
                <span className="hidden truncate sm:inline" style={{ textTransform: 'none', letterSpacing: 0, opacity: 0.8 }}>
                  · {toolsAttention && !toolsOpen ? 'toca revisar tu confianza' : activeStrategy.nombre}
                </span>
                <button
                  type="button"
                  onClick={() => { setToolsOpen((o) => !o); setToolsAttention(false); }}
                  className="fb-live-badge"
                  style={{
                    marginLeft: 'auto',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    background: toolsOpen ? activeStrategy.color : activeStrategy.iconBg,
                    borderColor: `${activeStrategy.color}${toolsAttention ? 'ff' : '66'}`,
                    color: toolsOpen ? 'var(--bg)' : activeStrategy.color,
                    boxShadow: toolsAttention ? `0 0 0 3px ${activeStrategy.color}33` : 'none',
                  }}
                >
                  {toolsOpen ? 'Volver' : 'Abrir'}
                </button>
              </div>

              {/* El panel permanece montado (oculto) para no perder lo que el estudiante anotó */}
              <div className={toolsOpen ? 'min-h-0 flex-1 overflow-y-auto p-3 md:p-5' : 'hidden'}>
                <StrategyHelpToolkit
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
                  onAttention={() => setToolsAttention((prev) => (toolsOpen ? prev : true))}
                  onClose={() => setToolsOpen(false)}
                  onRequestHint={() => { setToolsOpen(false); openHint(showHint ? 2 : 1); }}
                />
              </div>
            </>
          )}
          <div className={toolsOpen ? 'hidden' : 'contents'}>
          {confidenceAsk && !confidenceDismissed && !isChallengeDone && (
            <AttemptConfidence value={confidenceValue} onPick={pickConfidence} onDismiss={() => setConfidenceDismissed(true)} />
          )}
          {componentMap[challenge.id] ? (
            <div ref={boardAreaRef} onClick={handleBoardAreaClick} {...activityProps} className={boardWrapperClass}>
              {React.cloneElement(componentMap[challenge.id] as any, {
                challengeId: challenge.id,
                onValidation: handleBoardValidation
              })}
            </div>
          ) : getBoardType(challenge.id) === 'drag_drop' ? (
            <div ref={boardAreaRef} onClick={handleBoardAreaClick} {...activityProps} className={boardWrapperClass}>
              <DragAndDropBoard 
                challengeId={challenge.id} 
                onValidation={(success, opts) => handleBoardValidation(success, opts, '> ¡Orden correcto! Reto completado con éxito.')} 
              />
            </div>
          ) : getBoardType(challenge.id) === 'text' ? (
            <div ref={boardAreaRef} onClick={handleBoardAreaClick} {...activityProps} className={boardWrapperClass}>
              <EssayBoard 
                challengeId={challenge.id} 
                onValidation={handleBoardValidation} 
              />
            </div>
          ) : getBoardType(challenge.id) === 'canvas' ? (
            <div ref={boardAreaRef} onClick={handleBoardAreaClick} {...activityProps} className={boardWrapperClass}>
              <CanvasBoard 
                challengeId={challenge.id} 
                onValidation={handleBoardValidation} 
              />
            </div>
          ) : getBoardType(challenge.id) === 'phone' ? (
            <div ref={boardAreaRef} onClick={handleBoardAreaClick} {...activityProps} className={boardWrapperClass}>
              <PhoneDismantlingBoard 
                challengeId={challenge.id} 
                onValidation={handleBoardValidation} 
              />
            </div>
          ) : getBoardType(challenge.id) === 'ide' ? (
            <div ref={boardAreaRef} onClick={handleBoardAreaClick} {...activityProps} className={boardWrapperClass}>
              <CodingIDEBoard 
                challengeId={challenge.id} 
                onValidation={handleBoardValidation} 
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

              <div ref={boardAreaRef} onClick={handleBoardAreaClick} {...activityProps} className="fb-editor-area">
                <textarea
                  className="fb-editor-field"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
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
        </div>

        {/* Lateral Derecho: Métricas y Progreso */}
        <div className={`fb-sidebar-r ${mobilePanel === 'tutor' ? 'fb-sheet-open' : ''}`}>
          <div className="fb-sheet-head">
            <span>Tu tutor y progreso</span>
            <button type="button" onClick={() => setMobilePanel(null)} aria-label="Cerrar panel"><i className="ti ti-x" aria-hidden="true" /></button>
          </div>
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
                Ábrelas con el botón «Herramientas de apoyo», arriba de la actividad.
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

          <TutorAdvisor
            challengeId={challenge.id}
            criteria={challenge.criterios}
            profile={challengeProfile}
            strategy={activeStrategy}
            pBlock={pBlock}
            scaffold={scaffold}
            signals={signals}
            consecutiveErrors={consecutiveErrors}
            openedHints={openedHints}
            activeHint={activeHint}
            onOpenHint={openHint}
            onRateHint={rateHint}
            ratings={hintRatings}
            alternativeHint={alternativeHint}
            zdp={tutorPlan?.zdp ?? tutorState?.zdp ?? null}
            scaffoldPlan={tutorPlan?.scaffold ?? tutorState?.scaffold ?? null}
            jolInicial={jolInicial}
            checkpoints={checkpoints}
            onCheckpoint={handleCheckpoint}
            checkpointDue={checkpointDue}
            isDone={isChallengeDone}
            pendingCriteriaTexts={pendingCriteriaTexts}
            peerRecommendation={peerRecommendation}
            alertsBlocked={replanOpen || showResultModal || activeHint !== null || isActivityTourOpen}
            onAlertDismissed={(info) => addEvent('ALERT_DISMISSED', { challengeId: challenge.id, ...info, t_seconds: secondsRef.current })}
            onAffect={(affect) => addEvent('AFFECT_REPORT', {
              // Autoinforme con el estado del modelo de bloqueo en ese instante: permite validar p_block después.
              challengeId: challenge.id, affect, source: 'checkpoint', p_block: Number(pBlock.toFixed(3)), scaffold,
              signals, consecutive_errors: consecutiveErrors, pause_secs: pauseSecs, edits_since_run: editsSinceRun,
              runs: totalRuns, err_count: errCount, hints: hintCount, t_seconds: secondsRef.current,
            })}
          />

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
            {isChallengeDone ? (
              <button className="fb-btn-submit ready" id="submitBtn" onClick={runVerify}>
                <i className="ti ti-flag" aria-hidden="true" style={{ fontSize: '13px' }}></i>
                Terminar y ver mi resultado
              </button>
            ) : (
              <>
                <div style={{ fontSize: '11px', color: 'var(--fb-text-secondary)', textAlign: 'center', lineHeight: 1.45 }}>
                  Usa el botón de la actividad para comprobar tu trabajo. Cuando esté bien, verás tu resultado.
                </div>
                <button type="button" className="fb-giveup" onClick={runVerify}>No puedo terminarlo: entregar así</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Celular: el reto y el tutor se abren como paneles flotantes; la actividad ocupa la pantalla */}
      {mobilePanel && <div className="fb-sheet-backdrop" onClick={() => setMobilePanel(null)} aria-hidden="true" />}
      <nav className="fb-mobile-dock" aria-label="Paneles del reto">
        <button type="button" onClick={() => setMobilePanel(p => (p === 'reto' ? null : 'reto'))} aria-pressed={mobilePanel === 'reto'}>
          <i className="ti ti-target" aria-hidden="true" /> Reto
        </button>
        <button type="button" onClick={() => setMobilePanel(p => (p === 'tutor' ? null : 'tutor'))} aria-pressed={mobilePanel === 'tutor'}>
          <i className="ti ti-robot" aria-hidden="true" /> Tutor
          {scaffold && !isChallengeDone && <span className="fb-dock-dot" aria-label="El tutor tiene una sugerencia" />}
        </button>
        {isChallengeDone ? (
          <button type="button" className="fb-dock-primary" onClick={() => { setMobilePanel(null); runVerify(); }}>
            <i className="ti ti-flag" aria-hidden="true" /> Terminar
          </button>
        ) : (
          <span className="fb-dock-hint">Comprueba con el botón de la actividad</span>
        )}
      </nav>

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
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: resultPassed ? 'var(--ok)' : 'var(--warn)', marginBottom: '8px' }}>
                {resultPassed ? '¡Lo lograste!' : 'Aún no, pero vas por buen camino'}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--fb-text-muted, #8b949e)', marginBottom: '12px' }}>
                {resultPassed
                  ? 'Tu solución cumple los criterios. Sigamos a tu análisis de calibración.'
                  : 'El esfuerzo cuenta: cada intento te acerca. Puedes seguir aquí o reconstruir la base con una actividad de apoyo.'}
              </p>
              {certaintyContrast(certainty?.value ?? null, certainty?.label ?? null, resultScore) && (
                <div className="tut-bubble" style={{ textAlign: 'left', marginBottom: 16 }}>
                  <div className="tut-bubble-tag">Tu juicio de certeza vs. el resultado</div>
                  {certaintyContrast(certainty?.value ?? null, certainty?.label ?? null, resultScore)}
                </div>
              )}
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

      <ReplanModal
        open={replanOpen}
        challengeId={challenge.id}
        challengeTitle={challenge.titulo}
        hasSimplified={Boolean(simplifiedChallenge)}
        onChoose={handleReplanChoice}
      />

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
                  {activeHint === 1 ? 'Pista 1/3 · Pregunta reflexiva' : activeHint === 2 ? 'Pista 2/3 · Señalamiento del error' : 'Pista 3/3 · Solución análoga guiada'}
                </span>
                <span className="tut-chip" style={{ marginLeft: 'auto' }}>
                  Táctica · {activeHint === 1 ? 'Pregunta socrática' : activeHint === 2 ? 'Señalamiento' : (alternativeHint?.variant === 'contraejemplo' ? 'Contraejemplo' : 'Analogía cotidiana')}
                </span>
              </div>

              {activeHint === 3 ? (
                <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6 }}>
                  <p style={{ margin: '0 0 10px 0' }}>
                    {alternativeHint?.variant === 'contraejemplo' ? getTutorHint3(challenge.id).contraejemplo : getTutorHint3(challenge.id).analogia}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text)' }}>Si aún no sale: </strong>
                    {alternativeHint?.variant === 'contraejemplo' ? getTutorHint3(challenge.id).analogia : getTutorHint3(challenge.id).contraejemplo}
                  </p>
                </div>
              ) : activeHint === 1 ? (
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
