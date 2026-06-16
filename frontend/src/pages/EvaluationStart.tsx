import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { dynamicChallengeBank, DynamicChallenge, JolEspecifico } from '../data/dynamicChallengeBank';
import { jolGenerales } from '../data/jolGenerales';
import { getChallengeBriefing } from '../data/challengeBriefings';
import { getStrategyChallengeGuidance } from '../data/strategyChallengeGuidance';
import { EvaluationTracker } from '../components/EvaluationTracker';
import { nuevasEstrategias, Estrategia } from '../data/metacognitiveStrategies';
import './EvaluationStart.css';

// --- Motor de detección de tipo de escala ---
type ScaleType = 'slider' | 'number' | 'options' | 'percent';

function detectScaleType(escala: string): ScaleType {
  if (/numérico/i.test(escala)) return 'number';
  if (/%/.test(escala) && /\d+\s*%?\s*[–-]\s*\d+\s*%/.test(escala)) return 'percent';
  if (/·/.test(escala) && !/\d\s*[–=-]\s*\d/.test(escala)) return 'options';
  if (/·/.test(escala) && /\d\s*[=]\s*/.test(escala)) return 'options'; // "1=Nada · 2=Algo..."
  if (/\d+\s*[–-]\s*\d+/.test(escala)) return 'slider';
  return 'slider'; // fallback
}

function parseSliderRange(escala: string): { min: number; max: number } {
  const match = escala.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (match) return { min: parseInt(match[1]), max: parseInt(match[2]) };
  return { min: 1, max: 10 };
}

function parseOptions(escala: string): string[] {
  return escala.split('·').map(s => s.trim()).filter(s => s.length > 0);
}

function parseMaxWords(escala: string): number {
  const match = escala.match(/máx\.?\s*(\d+)/i);
  return match ? parseInt(match[1]) : 60;
}

// --- Interfaz enriquecida para JOL con escala ---
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

  // Asignar estrategia aleatoria en el nivel 1, o recuperar la del store
  const assignedStrategy: Estrategia | null = assignedStrategyId
    ? (nuevasEstrategias.find(e => e.id === assignedStrategyId) || null)
    : null;

  useEffect(() => {
    if (!assignedStrategyId) {
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
    // Lógica de Fallback a N1
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

  const handleStart = () => {
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
          <p className="text-muted-foreground font-medium">Preparando reto aleatorio...</p>
        </div>
      </div>
    );
  }

  // --- Renderizador inteligente de preguntas JOL ---
  const renderJolInput = (jol: JolItem) => {
    const scaleType = detectScaleType(jol.escala);
    const currentVal = jolAnswers[jol.id];

    switch (scaleType) {
      // ========== SLIDER NUMÉRICO (1-5, 1-10) ==========
      case 'slider': {
        const { min, max } = parseSliderRange(jol.escala);
        const val = (currentVal as number) || Math.ceil((min + max) / 2);
        const color = getSliderColor(val, max);
        const pct = ((val - min) / (max - min)) * 100;
        return (
          <div>
            <div className="mp-slider-labels"><span>{min}</span><span>{max}</span></div>
            <input
              type="range" min={min} max={max}
              value={val}
              onChange={(e) => setJolAnswers(prev => ({ ...prev, [jol.id]: parseInt(e.target.value) }))}
              className="mp-jol-slider"
              style={{ background: `linear-gradient(to right, ${color} ${pct}%, var(--mp-divider) ${pct}%)` }}
            />
            <div className="mp-jol-value">
              <span className="mp-jol-number" style={{ color }}>{val}</span>
              <button className="mp-btn-iniciar ready" style={{ width: 'auto' }} onClick={() => confirmAnswer(val)}>
                Continuar <i className="ti ti-arrow-right"></i>
              </button>
            </div>
          </div>
        );
      }

      // ========== PORCENTAJE (0%-100%) ==========
      case 'percent': {
        const val = (currentVal as number) || 50;
        const color = getSliderColor(val, 100);
        return (
          <div>
            <div className="mp-slider-labels"><span>0%</span><span>100%</span></div>
            <input
              type="range" min={0} max={100} step={5}
              value={val}
              onChange={(e) => setJolAnswers(prev => ({ ...prev, [jol.id]: parseInt(e.target.value) }))}
              className="mp-jol-slider"
              style={{ background: `linear-gradient(to right, ${color} ${val}%, var(--mp-divider) ${val}%)` }}
            />
            <div className="mp-jol-value">
              <span className="mp-jol-number" style={{ color }}>{val}%</span>
              <button className="mp-btn-iniciar ready" style={{ width: 'auto' }} onClick={() => confirmAnswer(val)}>
                Continuar <i className="ti ti-arrow-right"></i>
              </button>
            </div>
          </div>
        );
      }

      // ========== INPUT NUMÉRICO (minutos, intentos) ==========
      case 'number': {
        const val = (currentVal as string) || '';
        const isNumValid = val !== '' && parseInt(val as string) > 0;
        const unit = /min/i.test(jol.escala) ? 'minutos' : /intentos/i.test(jol.escala) ? 'intentos' : '';
        return (
          <div>
            <div className="mp-time-row">
              <input
                type="number" min="1" max="999"
                value={val}
                onChange={(e) => setJolAnswers(prev => ({ ...prev, [jol.id]: e.target.value }))}
                placeholder="—" className="mp-time-input" autoFocus
              />
              {unit && <span className="mp-time-unit">{unit}</span>}
            </div>
            <button className={`mp-btn-iniciar ${isNumValid ? 'ready' : ''}`} disabled={!isNumValid} style={{ marginTop: '16px', width: 'auto' }} onClick={() => confirmAnswer(parseInt(val as string))}>
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
            <button className={`mp-btn-iniciar ${selectedOption ? 'ready' : ''}`} disabled={!selectedOption} style={{ marginTop: '12px', width: 'auto' }} onClick={() => confirmAnswer(selectedOption)}>
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

      <div className={`mp-body sidebar-closed`}>
        <div className="mp-main">
          <div className="mp-competencia-tag">Nivel: {currentChallenge.nivel} ({currentChallenge.sub_nivel}) | {currentChallenge.componente}</div>
          <h1 className="mp-reto-title">{currentChallenge.titulo}</h1>

          {!showJolPhase && isRandomAssignment && (
            <div style={{
              marginTop: '14px',
              padding: '16px 18px',
              background: 'rgba(56, 139, 253, 0.08)',
              borderRadius: '14px',
              border: '1px solid rgba(56, 139, 253, 0.28)',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(56, 139, 253, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <i className="ti ti-dice-5" style={{ color: '#388bfd', fontSize: 18 }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#388bfd', marginBottom: '6px' }}>
                  {currentLevel === 1 ? 'Tu primer reto — asignado al azar' : 'Reto asignado al azar'}
                </div>
                {currentLevel === 1 ? (
                  <p style={{ fontSize: '14px', color: 'var(--on-surface)', lineHeight: 1.6, margin: 0 }}>
                    Acabas de empezar el diagnóstico. Entre todos los retos del nivel <strong>{currentChallenge.nivel}</strong>, el sistema
                    {' '}<strong>te tocó este al azar</strong> — como un sorteo. Tú no lo elegiste: simplemente fue el que salió.
                    Cada compañero puede recibir uno distinto, y eso es normal. Lo importante es cómo trabajas en él, no cuál te tocó.
                  </p>
                ) : (
                  <p style={{ fontSize: '14px', color: 'var(--on-surface)', lineHeight: 1.6, margin: 0 }}>
                    Para el nivel <strong>{currentChallenge.nivel}</strong>, el sistema <strong>te asignó este reto al azar</strong> entre
                    las actividades disponibles ({currentChallenge.sub_nivel}). No lo seleccionaste tú — fue el sorteo del sistema.
                  </p>
                )}

              </div>
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
              Esta es una <strong>variación de apoyo</strong> del mismo tema, para que puedas practicar con un reto un poco más accesible. No fue sorteo: el sistema te la asignó según tu recorrido anterior.
            </div>
          )}

          {!showJolPhase && briefing && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '18px 20px', background: 'linear-gradient(135deg, var(--primary-container, rgba(79,55,139,0.12)) 0%, transparent 100%)', borderRadius: '16px', border: '1px solid var(--primary, #4f378b)33' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)', marginBottom: '10px' }}>
                  <i className="ti ti-school" style={{ marginRight: 6 }} />
                  Presentación del reto
                </div>
                <p style={{ fontSize: '15px', color: 'var(--on-surface)', lineHeight: 1.65, margin: '0 0 14px 0', fontWeight: 500 }}>{briefing.saludo}</p>
                <p style={{ fontSize: '14px', color: 'var(--on-surface)', lineHeight: 1.65, margin: '0 0 14px 0' }}>{briefing.contexto}</p>
                <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>{briefing.puente}</p>
              </div>

              <div style={{ padding: '16px 20px', background: 'var(--surface-container-low, rgba(0,0,0,0.03))', borderRadius: '14px', border: '1px solid var(--outline-variant, #e0e0e0)44' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
                  ¿Qué vas a aprender?
                </div>
                <p style={{ fontSize: '14px', color: 'var(--on-surface)', lineHeight: 1.55, margin: 0 }}>{briefing.queVasAprender}</p>
              </div>

              <div style={{ padding: '16px 20px', background: 'var(--surface-container-low, rgba(0,0,0,0.03))', borderRadius: '14px', border: '1px solid var(--outline-variant, #e0e0e0)44' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
                  ¿Qué vas a hacer en pantalla?
                </div>
                <p style={{ fontSize: '14px', color: 'var(--on-surface)', lineHeight: 1.6, margin: '0 0 12px 0' }}>{briefing.queVasHacer}</p>
                <div style={{ padding: '12px 14px', background: 'var(--primary-container, rgba(79,55,139,0.06))', borderRadius: '10px', borderLeft: '3px solid var(--primary, #4f378b)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--primary)', marginBottom: '6px' }}>
                    Cuando llegue el momento, tu trabajo debe incluir
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--on-surface)', lineHeight: 1.55, margin: 0 }}>{briefing.tareaConcreta}</p>
                </div>
                {briefing.tiempoSugerido && (
                  <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', margin: '12px 0 0 0' }}>
                    <i className="ti ti-clock" style={{ marginRight: 4 }} />
                    Tiempo orientativo: <strong>{briefing.tiempoSugerido}</strong>
                  </p>
                )}
              </div>

              <div style={{ padding: '16px 20px', background: 'var(--primary-container, rgba(79,55,139,0.08))', borderRadius: '16px', border: '1px solid var(--primary, #4f378b)22' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)', marginBottom: '10px' }}>
                  Instrucciones paso a paso (sigue este orden)
                </div>
                <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {briefing.pasosDetallados.map((step, i) => (
                    <li key={i} style={{ fontSize: '13px', color: 'var(--on-surface)', lineHeight: 1.55, fontWeight: 500 }}>{step}</li>
                  ))}
                </ol>
              </div>

              <div style={{ padding: '14px 18px', background: 'rgba(35,134,54,0.08)', borderRadius: '12px', border: '1px solid rgba(35,134,54,0.25)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#238636', marginBottom: '8px' }}>
                  Recuerda
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {briefing.recuerda.map((item, i) => (
                    <li key={i} style={{ fontSize: '12px', color: 'var(--on-surface)', lineHeight: 1.5 }}>{item}</li>
                  ))}
                </ul>
              </div>

              <div style={{ textAlign: 'center', paddingTop: '8px' }}>
                <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: '0 0 16px 0', lineHeight: 1.55 }}>
                  Cuando hayas leído todo y te sientas listo/a, pulsa el botón para continuar.
                  <br />
                  El siguiente paso son unas preguntas cortas sobre cómo te sientes — todavía no entras al reto.
                </p>
                <button
                  type="button"
                  className="mp-btn-iniciar ready"
                  onClick={handleBeginJol}
                  style={{ fontSize: '17px', padding: '14px 36px' }}
                >
                  Comenzar <i className="ti ti-arrow-right" />
                </button>
              </div>
            </div>
          )}

          {showJolPhase && (
            <div ref={jolSectionRef} style={{ marginTop: '12px' }}>
              {!allJolsDone && (
                <>
                  <div style={{ padding: '18px 20px', background: 'var(--surface-container-low, rgba(0,0,0,0.03))', borderRadius: '16px', border: '1px solid var(--outline-variant, #e0e0e0)55', marginBottom: '20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)', marginBottom: '10px' }}>
                      <i className="ti ti-brain" style={{ marginRight: 6 }} />
                      ¿Qué son las preguntas JOL?
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--on-surface)', lineHeight: 1.65, margin: '0 0 12px 0' }}>
                      <strong>JOL</strong> significa <em>Juicio de Aprendizaje</em>. Son {selectedJols.length} preguntas breves que te hacemos <strong>antes</strong> de entrar al reto, para saber cómo te percibes en este momento.
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: 1.6, margin: '0 0 12px 0' }}>
                      No es un examen: <strong>no hay respuestas correctas ni incorrectas</strong>. Lo que importa es que respondas con honestidad, como cuando un profesor pregunta «¿qué tan preparado te sientes?» antes de una actividad.
                    </p>
                    <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px', fontSize: '13px', color: 'var(--on-surface)', lineHeight: 1.55 }}>
                      <li style={{ marginBottom: '6px' }}>Algunas preguntas son generales (tu confianza, el tiempo que crees que tardarás).</li>
                      <li style={{ marginBottom: '6px' }}>Otras son específicas de este reto: «{currentChallenge.titulo}».</li>
                      <li>Después compararemos lo que pensabas con lo que ocurre en la actividad — eso ayuda a entrenar tu metacognición.</li>
                    </ul>
                    <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', margin: 0, fontStyle: 'italic' }}>
                      Responde pregunta por pregunta. Puedes usar el deslizador, escribir un número o elegir una opción, según cada pregunta.
                    </p>
                  </div>
                  <div className="mp-divider" />
                </>
              )}

              {/* Indicador de progreso de preguntas */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', justifyContent: 'center' }}>
                {selectedJols.map((_, i) => (
                  <div key={i} style={{
                    width: i === activeStep ? '32px' : '10px',
                    height: '10px',
                    borderRadius: '99px',
                    background: i < activeStep ? 'var(--primary)' : i === activeStep ? 'var(--primary)' : 'var(--mp-divider, #ddd)',
                    opacity: i < activeStep ? 0.4 : 1,
                    transition: 'all 0.3s ease'
                  }} />
                ))}
              </div>

              <AnimatePresence mode="wait">
            {!allJolsDone ? (
              <motion.div
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
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚀</div>
                <p className="mp-meta-q" style={{ fontSize: '20px' }}>¡Listo para iniciar!</p>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginBottom: '20px' }}>
                  Has completado tus preguntas de autopercepción. <br/>
                  Tiempo estimado del reto: <strong>{currentChallenge.tiempo_estimado} min</strong>
                </p>

                {/* Tarjeta de estrategia asignada */}
                {assignedStrategy && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: assignedStrategy.iconBg,
                      border: `1.5px solid ${assignedStrategy.color}55`,
                      borderRadius: '16px',
                      padding: '16px 20px',
                      marginBottom: '20px',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{
                      padding: '12px 14px',
                      background: strategyAssignedRandomly ? 'rgba(56, 139, 253, 0.08)' : 'rgba(93, 202, 165, 0.08)',
                      borderRadius: '10px',
                      border: `1px solid ${strategyAssignedRandomly ? 'rgba(56, 139, 253, 0.25)' : 'rgba(93, 202, 165, 0.3)'}`,
                      marginBottom: '12px',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                    }}>
                      <i className={`ti ${strategyAssignedRandomly ? 'ti-dice-5' : 'ti-hand-click'}`} style={{ color: strategyAssignedRandomly ? '#388bfd' : '#5dcaa5', fontSize: 16, marginTop: 2 }} />
                      <p style={{ fontSize: '12px', color: 'var(--on-surface)', lineHeight: 1.55, margin: 0 }}>
                        {strategyAssignedRandomly ? (
                          <>
                            Entre las 8 estrategias metacognitivas, el sistema <strong>te asignó esta al azar</strong> para el Nivel {currentChallenge.nivel}.
                            No la elegiste tú — fue sorteo, igual que el reto. Durante la actividad tendrás herramientas de apoyo basadas en ella.
                          </>
                        ) : (
                          <>
                            Esta es la estrategia que <strong>tú elegiste</strong> al terminar el nivel anterior.
                            La usarás como apoyo durante este reto del Nivel {currentChallenge.nivel}.
                          </>
                        )}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ background: assignedStrategy.iconBg, border: `1px solid ${assignedStrategy.color}44`, borderRadius: '10px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`ti ${assignedStrategy.icon}`} style={{ color: assignedStrategy.color, fontSize: '18px' }}></i>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: assignedStrategy.color, marginBottom: '2px' }}>
                          {strategyAssignedRandomly ? 'Estrategia asignada al azar' : 'Tu estrategia elegida'}
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--on-surface)' }}>{assignedStrategy.nombre}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: '0 0 8px 0', lineHeight: 1.5 }}>{assignedStrategy.desc}</p>
                    {strategyGuidance && (
                      <div style={{ fontSize: '12px', color: 'var(--on-surface)', lineHeight: 1.5, marginBottom: '10px', padding: '10px 12px', background: `${assignedStrategy.color}10`, borderRadius: '10px', borderLeft: `3px solid ${assignedStrategy.color}` }}>
                        <strong style={{ color: assignedStrategy.color }}>En este reto concreto: </strong>
                        {strategyGuidance.mensajeProfesor}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', fontWeight: 700, color: assignedStrategy.color, background: `${assignedStrategy.color}18`, borderRadius: '8px', padding: '6px 10px', display: 'inline-block', marginBottom: '12px' }}>
                      <i className="ti ti-eye" style={{ marginRight: '5px' }}></i>
                      {assignedStrategy.teoria}
                    </div>
                    {strategyGuidance && strategyGuidance.pasosEnEsteReto.length > 0 && (
                      <ol style={{ margin: '0 0 12px 0', paddingLeft: '18px', fontSize: '11px', lineHeight: 1.5, color: 'var(--on-surface-variant)' }}>
                        {strategyGuidance.pasosEnEsteReto.slice(0, 3).map((paso, i) => (
                          <li key={i} style={{ marginBottom: 4 }}>{paso}</li>
                        ))}
                      </ol>
                    )}
                    <div style={{ textAlign: 'left', borderTop: `1px solid ${assignedStrategy.color}33`, paddingTop: '10px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: assignedStrategy.color, marginBottom: '8px' }}>
                        Herramientas que usarás durante la actividad
                      </div>
                      {assignedStrategy.herramientas.map(h => (
                        <div key={h.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <i className={`ti ${h.icon}`} style={{ color: assignedStrategy.color, fontSize: '14px', marginTop: '2px' }} />
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--on-surface)' }}>{h.nombre}</div>
                            <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>{h.descripcion}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <button className="mp-btn-iniciar ready" onClick={handleStart} style={{ fontSize: '18px', padding: '16px 40px' }}>
                  Iniciar Reto <i className="ti ti-rocket"></i>
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
