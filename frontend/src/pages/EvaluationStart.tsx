import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { dynamicChallengeBank } from '../data/dynamicChallengeBank';
import { jolGenerales } from '../data/jolGenerales';
import { getChallengeBriefing } from '../data/challengeBriefings';
import { getStrategyChallengeGuidance } from '../data/strategyChallengeGuidance';
import { EvaluationTracker } from '../components/EvaluationTracker';
import { usePhaseSync } from '../hooks/usePhaseSync';
import { nuevasEstrategias, Estrategia } from '../data/metacognitiveStrategies';
import { ChallengeSetupTour } from '../components/ChallengeSetupTour';
import './EvaluationStart.css';

// --- Motor de detección de tipo de escala ---
type ScaleType = 'slider' | 'number' | 'options' | 'percent';

function detectScaleType(escala: string): ScaleType {
  if (/numérico/i.test(escala)) return 'number';
  if (/%/.test(escala) && /\d+\s*%?\s*[–-]\s*\d+\s*%/.test(escala)) return 'percent';
  if (/·/.test(escala) && !/\d\s*[–=-]\s*\d/.test(escala)) return 'options';
  if (/·/.test(escala) && /\d\s*[=]\s*/.test(escala)) return 'options';
  if (/\d+\s*[–-]\s*\d+/.test(escala)) return 'slider';
  return 'slider';
}

function parseSliderRange(escala: string): { min: number; max: number } {
  const match = escala.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (match) return { min: parseInt(match[1]), max: parseInt(match[2]) };
  return { min: 1, max: 10 };
}

function parseOptions(escala: string): string[] {
  return escala.split('·').map(s => s.trim()).filter(s => s.length > 0);
}

interface JolItem {
  id: string;
  pregunta: string;
  escala: string;
}

export function EvaluationStart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { addEvent, currentLevel, currentChallengeId, setCurrentChallengeId, setCurrentSessionId, currentSessionId, assignedStrategyId, strategyAssignedRandomly, setAssignedStrategyId } = useCognitiveStore();
  const { syncPhaseA } = usePhaseSync();

  // Estado del Tutorial Spotlight (alert flotante para el primer reto)
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('mpf_has_seen_first_challenge_tour');
    if (currentLevel === 1 && !hasSeenTour) {
      setIsTourOpen(true);
    }
  }, [currentLevel]);

  const handleCloseTour = () => {
    setIsTourOpen(false);
    localStorage.setItem('mpf_has_seen_first_challenge_tour', 'true');
  };

  const assignedStrategy: Estrategia | null = assignedStrategyId
    ? (nuevasEstrategias.find(e => e.id === assignedStrategyId) || null)
    : null;

  const strategyAssignedRef = useRef(false);
  useEffect(() => {
    if (!assignedStrategyId && !strategyAssignedRef.current) {
      strategyAssignedRef.current = true;
      const randomIdx = Math.floor(Math.random() * nuevasEstrategias.length);
      setAssignedStrategyId(nuevasEstrategias[randomIdx].id, true);
    }
  }, [assignedStrategyId, setAssignedStrategyId]);
  
  useEffect(() => {
    if (currentLevel === 1 || !currentSessionId) {
      const newSessionId = `SESS-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      setCurrentSessionId(newSessionId);
      console.log('🚀 Nueva sesión iniciada:', newSessionId);
    } else {
      console.log('🔄 Continuando sesión existente:', currentSessionId);
    }
  }, [currentLevel, setCurrentSessionId]);

  const levelMap: Record<number, string> = { 1: "Básico", 2: "Medio", 3: "Avanzado" };
  const currentLevelString = levelMap[currentLevel] || "Básico";
  
  useEffect(() => {
    // 1. Si viene con forcedChallengeId (desde el modal de reto fallido), usar ese reto directamente
    if (location.state?.forcedChallengeId) {
      const forced = dynamicChallengeBank.find(c => c.id === location.state.forcedChallengeId);
      if (forced && currentChallengeId !== forced.id) {
        setCurrentChallengeId(forced.id);
        return;
      }
    }

    // 2. Lógica de Fallback a N1 (retryVariation sin forcedChallengeId)
    if (location.state?.retryVariation && location.state?.previousChallengeId) {
      const prevChallenge = dynamicChallengeBank.find(c => c.id === location.state.previousChallengeId);
      if (prevChallenge) {
        const n1Challenge = dynamicChallengeBank.find(c => c.componente === prevChallenge.componente && c.sub_nivel === 'N1');
        if (n1Challenge && currentChallengeId !== n1Challenge.id) {
          setCurrentChallengeId(n1Challenge.id);
          return;
        }
      }
    }

    if (!currentChallengeId) {
      const candidates = dynamicChallengeBank.filter(c => c.nivel === currentLevelString);
      const n1n2Candidates = candidates.filter(c => c.sub_nivel === 'N1' || c.sub_nivel === 'N2');
      
      if (n1n2Candidates.length > 0) {
        const randomIdx = Math.floor(Math.random() * n1n2Candidates.length);
        setCurrentChallengeId(n1n2Candidates[randomIdx].id);
      } else if (candidates.length > 0) {
        setCurrentChallengeId(candidates[0].id);
      }
    }
  }, [currentLevelString, currentChallengeId, setCurrentChallengeId, location.state]);

  const currentChallenge = currentChallengeId
    ? dynamicChallengeBank.find(r => r.id === currentChallengeId)
    : null;

  // Selección de JOLs: 3 generales del nivel + 2 específicos (con escala)
  const [selectedJols, setSelectedJols] = useState<JolItem[]>([]);
  const [jolAnswers, setJolAnswers] = useState<Record<string, number | string>>({});
  const [jolTimes, setJolTimes] = useState<Record<string, number>>({});
  const [showToast, setShowToast] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showJolPhase, setShowJolPhase] = useState(false);

  const stepStartTime = useRef(Date.now());
  const jolSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentChallenge) {
      // 1. JOLs específicos del reto (con escala)
      const specificJols: JolItem[] = [
        { id: `${currentChallenge.id}_esp_1`, pregunta: currentChallenge.jol_esp_1.pregunta, escala: currentChallenge.jol_esp_1.escala },
        { id: `${currentChallenge.id}_esp_2`, pregunta: currentChallenge.jol_esp_2.pregunta, escala: currentChallenge.jol_esp_2.escala }
      ];

      // 2. JOLs generales del nivel (con escala)
      const generalJols: JolItem[] = jolGenerales
        .filter(j => j.nivel === currentChallenge.nivel)
        .slice(0, 3)
        .map(j => ({ id: j.id, pregunta: j.pregunta, escala: j.escala }));
      
      setSelectedJols([...generalJols, ...specificJols]);
      setActiveStep(0);
      setJolAnswers({});
      setJolTimes({});
      setShowJolPhase(false);
    }
  }, [currentChallenge?.id]);

  const handleBeginJol = () => {
    setShowJolPhase(true);
    stepStartTime.current = Date.now();
    setTimeout(() => {
      jolSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const currentJolQuestion = selectedJols[activeStep];
  const allJolsDone = activeStep >= selectedJols.length;

  // --- Colores semánticos para sliders ---
  const getSliderColor = (val: number, max: number) => {
    const pct = val / max;
    if (pct <= 0.2) return '#e24b4a';
    if (pct <= 0.4) return '#ef9f27';
    if (pct <= 0.6) return '#f2cc60';
    if (pct <= 0.8) return '#5dcaa5';
    return '#238636';
  };

  // --- Handler genérico para confirmar una respuesta JOL ---
  const confirmAnswer = (val: number | string) => {
    const timeTaken = Math.round((Date.now() - stepStartTime.current) / 1000);
    setJolAnswers(prev => ({ ...prev, [currentJolQuestion.id]: val }));
    setJolTimes(prev => ({ ...prev, [currentJolQuestion.id]: timeTaken }));
    setActiveStep(prev => prev + 1);
    stepStartTime.current = Date.now();
  };

  const getEstimatedMinutes = (): number => {
    const timeJol = selectedJols.find(j => j.id === 'JG-B2' || j.id === 'JG-M2');
    if (timeJol && jolAnswers[timeJol.id] !== undefined) {
      const val = parseInt(String(jolAnswers[timeJol.id]));
      return isNaN(val) ? 0 : val;
    }
    return parseInt(currentChallenge?.tiempo_estimado || '0') || 0;
  };

  const handleStart = async () => {
    await syncPhaseA();
    setShowToast(true);
    const estimatedTime = getEstimatedMinutes();
    setTimeout(() => {
      setShowToast(false);
      addEvent('PHASE_START', {
        phase: 'Juicio_Pretest',
        challengeId: currentChallenge!.id,
        jol_answers: jolAnswers,
        jol_times: jolTimes,
        estrategia_asignada: assignedStrategyId,
        estimatedTime,
      });

      navigate('/challenge', {
        state: { 
          challenge: currentChallenge,
          jolAnswers, 
          jolTimes,
          assignedStrategyId,
          estimatedTime,
        },
      });
    }, 2200);
  };

  const briefing = currentChallenge
    ? getChallengeBriefing(currentChallenge.id, currentChallenge.tiempo_estimado)
    : null;
  const strategyGuidance = currentChallenge && assignedStrategy
    ? getStrategyChallengeGuidance(currentChallenge.id, assignedStrategy.id)
    : null;

  const isRetryVariation = Boolean(location.state?.retryVariation);
  const isRandomAssignment = !isRetryVariation;

  if (!currentChallenge || selectedJols.length === 0) {
    return (
      <div className={`mp-root ${theme} flex items-center justify-center`} style={{ height: 'calc(100vh - 4rem)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Preparando tu reto...</p>
        </div>
      </div>
    );
  }

  // --- Renderizador inteligente de preguntas JOL ---
  const renderJolInput = (jol: JolItem) => {
    const scaleType = detectScaleType(jol.escala);
    const currentVal = jolAnswers[jol.id];

    // Generar color semántico para el valor seleccionado
    const getNumColor = (n: number) => {
      if (n <= 2) return '#e24b4a';
      if (n <= 4) return '#ef9f27';
      if (n <= 6) return '#f2cc60';
      if (n <= 8) return '#5dcaa5';
      return '#238636';
    };

    switch (scaleType) {
      // ========== ESCALA NUMÉRICA 1-10 (Botones) ==========
      case 'slider': {
        const { min, max } = parseSliderRange(jol.escala);
        const selected = currentVal as number | undefined;
        const hasSelected = selected !== undefined;
        const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        return (
          <div className="mp-jol-scale-container">
            <div className="mp-jol-scale-legend">
              <span>😟 {min} = Muy inseguro</span>
              <span>{max} = Totalmente seguro 💪</span>
            </div>
            <div className="mp-jol-num-grid">
              {numbers.map(n => (
                <button
                  key={n}
                  className={`mp-jol-num-btn ${selected === n ? 'selected' : ''}`}
                  onClick={() => setJolAnswers(prev => ({ ...prev, [jol.id]: n }))}
                  style={selected === n ? { background: `linear-gradient(135deg, ${getNumColor(n)}, ${getNumColor(n)}dd)`, borderColor: getNumColor(n) } : {}}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              id="tour-jol-continue"
              className={`mp-btn-iniciar ${hasSelected ? 'ready' : ''}`}
              disabled={!hasSelected}
              style={{ marginTop: '8px', width: 'auto' }}
              onClick={() => hasSelected && confirmAnswer(selected!)}
            >
              Continuar <i className="ti ti-arrow-right"></i>
            </button>
          </div>
        );
      }

      // ========== PORCENTAJE (0%-100%) → Escala 1 al 10 ==========
      case 'percent': {
        const selected = currentVal as number | undefined;
        const hasSelected = selected !== undefined;
        const numbers = Array.from({ length: 10 }, (_, i) => (i + 1) * 10);
        return (
          <div className="mp-jol-scale-container">
            <div className="mp-jol-scale-legend">
              <span>😟 10% = Casi seguro que no</span>
              <span>100% = Totalmente seguro 💪</span>
            </div>
            <div className="mp-jol-num-grid">
              {numbers.map(n => (
                <button
                  key={n}
                  className={`mp-jol-num-btn ${selected === n ? 'selected' : ''}`}
                  onClick={() => setJolAnswers(prev => ({ ...prev, [jol.id]: n }))}
                  style={selected === n ? { background: `linear-gradient(135deg, ${getNumColor(n / 10)}, ${getNumColor(n / 10)}dd)`, borderColor: getNumColor(n / 10) } : {}}
                >
                  {n}%
                </button>
              ))}
            </div>
            <button
              id="tour-jol-continue"
              className={`mp-btn-iniciar ${hasSelected ? 'ready' : ''}`}
              disabled={!hasSelected}
              style={{ marginTop: '8px', width: 'auto' }}
              onClick={() => hasSelected && confirmAnswer(selected!)}
            >
              Continuar <i className="ti ti-arrow-right"></i>
            </button>
          </div>
        );
      }

      // ========== INPUT NUMÉRICO (minutos, intentos) ==========
      case 'number': {
        const val = (currentVal as string) || '';
        const isNumValid = val !== '' && !isNaN(parseInt(val as string)) && parseInt(val as string) > 0;
        const isMinutes = /min/i.test(jol.escala);
        const unit = isMinutes ? 'minutos' : /intentos/i.test(jol.escala) ? 'intentos' : '';
        const presets = isMinutes ? [5, 10, 15, 20, 25, 30] : [1, 2, 3, 4, 5];

        return (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '13px', color: 'var(--on-surface)', marginBottom: '10px', fontWeight: 600 }}>
              ✍️ Escribe tu estimación o pulsa una sugerencia rápida:
            </div>

            {/* Fila principal con input numérico ultra visible y de alto contraste */}
            <div className="mp-time-row" style={{ background: 'var(--mp-card-bg)', border: '2px solid var(--mp-border)', padding: '14px 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <input
                type="number"
                min="1"
                max="999"
                value={val}
                onChange={(e) => setJolAnswers(prev => ({ ...prev, [jol.id]: e.target.value }))}
                placeholder="0"
                className="mp-time-input"
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  width: '120px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: isNumValid ? '2px solid #388bfd' : '2px solid var(--mp-border)',
                  background: 'var(--mp-input-bg)',
                  color: 'var(--mp-text)',
                  textAlign: 'center',
                }}
                autoFocus
              />
              {unit && (
                <span className="mp-time-unit" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--on-surface)' }}>
                  {unit}
                </span>
              )}
            </div>

            {/* Botones de selección rápida */}
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', fontWeight: 600, marginRight: '4px' }}>
                Valores sugeridos:
              </span>
              {presets.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setJolAnswers(prev => ({ ...prev, [jol.id]: p }))}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: String(val) === String(p) ? '1.5px solid #388bfd' : '1px solid var(--mp-border)',
                    background: String(val) === String(p) ? 'rgba(56, 139, 253, 0.15)' : 'var(--mp-card-bg)',
                    color: String(val) === String(p) ? '#388bfd' : 'var(--on-surface)',
                    fontWeight: String(val) === String(p) ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {p} {unit}
                </button>
              ))}
            </div>

            <button
              id="tour-jol-continue"
              className={`mp-btn-iniciar ${isNumValid ? 'ready' : ''}`}
              disabled={!isNumValid}
              style={{ marginTop: '16px', width: 'auto' }}
              onClick={() => confirmAnswer(parseInt(val as string))}
            >
              Continuar <i className="ti ti-arrow-right"></i>
            </button>
          </div>
        );
      }

      // ========== OPCIONES DESCRIPTIVAS (Radio Buttons) ==========
      case 'options': {
        const options = parseOptions(jol.escala);
        const selectedOption = currentVal as string;
        return (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '8px 0' }}>
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setJolAnswers(prev => ({ ...prev, [jol.id]: opt }))}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '16px',
                    border: selectedOption === opt ? '2px solid var(--primary)' : '2px solid var(--mp-divider, #e0e0e0)',
                    background: selectedOption === opt ? 'var(--primary-container, rgba(79,55,139,0.1))' : 'transparent',
                    color: selectedOption === opt ? 'var(--primary)' : 'var(--on-surface)',
                    fontWeight: selectedOption === opt ? 800 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '15px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            <button id="tour-jol-continue" className={`mp-btn-iniciar ${selectedOption ? 'ready' : ''}`} disabled={!selectedOption} style={{ marginTop: '12px', width: 'auto' }} onClick={() => confirmAnswer(selectedOption)}>
              Continuar <i className="ti ti-arrow-right"></i>
            </button>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={`mp-root ${theme}`}>
      <EvaluationTracker currentPhase="A" />

      {/* Tutorial Spotlight Alert Flotante para el primer reto */}
      <ChallengeSetupTour
        isOpen={isTourOpen}
        onClose={handleCloseTour}
        showJolPhase={showJolPhase}
        activeJolStep={activeStep}
        totalJols={selectedJols.length}
        allJolsDone={allJolsDone}
        challengeTitle={currentChallenge?.titulo || ''}
        challengeLevel={currentChallenge?.nivel || 'Básico'}
        challengeSubLevel={currentChallenge?.sub_nivel || 'N1'}
        challengeComponent={currentChallenge?.componente || ''}
        estimatedTime={currentChallenge?.tiempo_estimado || '15'}
        queVasAprender={briefing?.queVasAprender}
        tareaConcreta={briefing?.tareaConcreta}
        currentJolQuestion={currentJolQuestion}
        isJolAnswered={currentJolQuestion ? jolAnswers[currentJolQuestion.id] !== undefined : false}
      />

      <div className={`mp-body sidebar-closed`}>
        <div className="mp-main">
          {/* Header con botón para activar tutorial en cualquier momento */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div className="mp-competencia-tag">Nivel: {currentChallenge.nivel} ({currentChallenge.sub_nivel}) | {currentChallenge.componente}</div>
            <button
              onClick={() => setIsTourOpen(true)}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#388bfd',
                background: 'rgba(56, 139, 253, 0.1)',
                border: '1px solid rgba(56, 139, 253, 0.25)',
                borderRadius: '8px',
                padding: '4px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <i className="ti ti-help-circle" /> ¿Cómo funciona?
            </button>
          </div>

          <h1 className="mp-reto-title">{currentChallenge.titulo}</h1>

          {/* Tarjeta de Sorteo / Asignación del Reto (Target Paso 1 del Tour) */}
          {!showJolPhase && isRandomAssignment && (
            <div
              id="tour-assignment"
              style={{
                marginTop: '14px',
                padding: '14px 16px',
                background: 'var(--surface-2)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <i className="ti ti-dice-5" style={{ color: 'var(--accent)', fontSize: 18, marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.55, margin: 0 }}>
                {currentLevel === 1 ? 'Tu primer reto, ' : 'Reto '}asignado al azar en nivel <strong>{currentChallenge.nivel}</strong>. Cada sesión puede ser distinta.
              </p>
            </div>
          )}

          {!showJolPhase && isRetryVariation && (
            <div style={{
              marginTop: '14px',
              padding: '14px 18px',
              background: 'rgba(242, 204, 96, 0.1)',
              borderRadius: '14px',
              border: '1px solid rgba(242, 204, 96, 0.35)',
              fontSize: '13px',
              color: 'var(--on-surface)',
              lineHeight: 1.55,
            }}>
              <i className="ti ti-info-circle" style={{ color: '#f2cc60', marginRight: 6 }} />
              Esta es una <strong>variación de apoyo</strong> asignada según tu desempeño previo.
            </div>
          )}

          {/* Presentación Sintetizada del Reto (Target Paso 2 del Tour) */}
          {!showJolPhase && briefing && (
            <div id="tour-briefing" style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '16px 18px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)' }}>
                    El reto
                  </div>
                  {briefing.tiempoSugerido && (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                      <i className="ti ti-clock" style={{ marginRight: 4 }} />
                      {briefing.tiempoSugerido}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '14.5px', color: 'var(--text)', lineHeight: 1.55, margin: '0 0 6px 0', fontWeight: 600 }}>{briefing.saludo}</p>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>{briefing.contexto} {briefing.puente}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                <div style={{ padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>Qué vas a aprender</div>
                  <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>{briefing.queVasAprender}</p>
                </div>
                <div style={{ padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>Tu meta</div>
                  <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>{briefing.tareaConcreta}</p>
                </div>
              </div>

              <div style={{ padding: '14px 18px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: '8px' }}>
                  Pasos
                </div>
                <ol style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {briefing.pasosDetallados.map((step, i) => (
                    <li key={i} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.45 }}>{step}</li>
                  ))}
                </ol>
              </div>

              <div style={{ padding: '12px 16px', background: 'color-mix(in srgb, var(--ok) 8%, transparent)', borderRadius: 'var(--radius-md)', border: '1px solid color-mix(in srgb, var(--ok) 25%, transparent)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ok)', marginBottom: '4px' }}>
                  Recuerda
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {briefing.recuerda.map((item, i) => (
                    <li key={i} style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.45 }}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Botón para iniciar JOL (Target Paso 3 del Tour) */}
              <div id="tour-begin-jol" style={{ textAlign: 'center', paddingTop: '8px' }}>
                <button
                  type="button"
                  className="mp-btn-iniciar ready"
                  onClick={handleBeginJol}
                  style={{ fontSize: '16px', padding: '14px 36px' }}
                >
                  Comenzar preguntas <i className="ti ti-arrow-right" />
                </button>
              </div>
            </div>
          )}

          {showJolPhase && (
            <div ref={jolSectionRef} style={{ marginTop: '12px' }}>
              {!allJolsDone && (
                <>
                  <div style={{ padding: '16px 18px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '18px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: '8px' }}>
                      <i className="ti ti-brain" style={{ marginRight: 6 }} />
                      {selectedJols.length} preguntas antes de empezar
                    </div>
                    <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
                      Son juicios de aprendizaje (JOL): dinos cómo de preparado te sientes ahora mismo.
                      No se califican y no hay respuesta correcta. Responde con honestidad, una por una.
                    </p>
                  </div>
                  <div className="mp-divider" />
                </>
              )}

              {/* Indicador de progreso de preguntas (5 pasos claros y explícitos) */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                    Pregunta JOL {activeStep + 1} de {selectedJols.length}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', fontFamily: 'IBM Plex Mono, monospace' }}>
                    {Math.round(((activeStep) / selectedJols.length) * 100)}% completado
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selectedJols.length}, 1fr)`, gap: '8px' }}>
                  {selectedJols.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'IBM Plex Mono, monospace',
                        background: i < activeStep ? 'rgba(35, 134, 54, 0.15)' : i === activeStep ? 'rgba(56, 139, 253, 0.2)' : 'var(--surface-container-low, rgba(0,0,0,0.04))',
                        border: i === activeStep ? '1.5px solid #388bfd' : i < activeStep ? '1.5px solid #238636' : '1px solid var(--outline-variant, #e0e0e0)44',
                        color: i < activeStep ? '#238636' : i === activeStep ? '#388bfd' : 'var(--on-surface-variant)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {i < activeStep ? '✓ ' : ''}JOL {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
            {!allJolsDone ? (
              <motion.div
                id="tour-jol-card"
                key={currentJolQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mp-meta-card"
              >
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
                  Pregunta JOL {activeStep + 1} de {selectedJols.length}
                </div>
                <p className="mp-meta-q">{currentJolQuestion.pregunta}</p>
                <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginBottom: '12px', lineHeight: 1.5 }}>
                  {detectScaleType(currentJolQuestion.escala) === 'slider' && 'Mueve el deslizador hasta el valor que sientas y pulsa «Continuar».'}
                  {detectScaleType(currentJolQuestion.escala) === 'percent' && 'Ajusta el porcentaje de confianza y pulsa «Continuar».'}
                  {detectScaleType(currentJolQuestion.escala) === 'number' && 'Escribe un número estimado y pulsa «Continuar».'}
                  {detectScaleType(currentJolQuestion.escala) === 'options' && 'Haz clic en la opción que mejor te describa. Se resaltará al seleccionarla. Luego pulsa «Continuar».'}
                </p>
                {renderJolInput(currentJolQuestion)}
              </motion.div>
            ) : (
              <motion.div
                key="ready-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mp-meta-card"
                style={{ textAlign: 'center' }}
              >
                <p className="mp-meta-q" style={{ fontSize: '19px', marginBottom: 4 }}>Listo para empezar</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '18px' }}>
                  Preguntas respondidas. Tiempo estimado: <strong>{currentChallenge.tiempo_estimado} min</strong>
                </p>

                {/* Estrategia de apoyo asignada para este nivel */}
                {assignedStrategy && (
                  <motion.div
                    id="tour-strategy"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px 18px',
                      marginBottom: '18px',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <i className={`ti ${assignedStrategy.icon}`} style={{ color: 'var(--accent)', fontSize: '20px' }}></i>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                          {strategyAssignedRandomly ? 'Estrategia de apoyo (al azar)' : 'Tu estrategia elegida'}
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{assignedStrategy.nombre}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                      {strategyGuidance?.mensajeProfesor || assignedStrategy.desc}
                    </p>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        Herramientas que verás en la actividad
                      </div>
                      {assignedStrategy.herramientas.map(h => (
                        <div key={h.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <i className={`ti ${h.icon}`} style={{ color: 'var(--accent)', fontSize: '14px', marginTop: '2px' }} />
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{h.nombre}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{h.descripcion}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <button id="tour-start-challenge" className="mp-btn-iniciar ready" onClick={handleStart} style={{ fontSize: '16px', padding: '14px 36px' }}>
                  Empezar el reto <i className="ti ti-arrow-right"></i>
                </button>
              </motion.div>
            )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className={`mp-toast ${showToast ? 'show' : ''}`} id="toast">
        <i className="ti ti-rocket"></i> ¡Reto iniciado!
      </div>
    </div>
  );
}
