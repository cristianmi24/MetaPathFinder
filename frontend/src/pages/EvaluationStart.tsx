import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { dynamicChallengeBank, DynamicChallenge, JolEspecifico } from '../data/dynamicChallengeBank';
import { jolGenerales } from '../data/jolGenerales';
import { EvaluationTracker } from '../components/EvaluationTracker';
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
  const { addEvent, currentLevel, currentChallengeId, setCurrentChallengeId, setCurrentSessionId, currentSessionId } = useCognitiveStore();
  
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
      const n2n3Candidates = candidates.filter(c => c.sub_nivel === 'N2' || c.sub_nivel === 'N3');
      
      if (n2n3Candidates.length > 0) {
        const randomIdx = Math.floor(Math.random() * n2n3Candidates.length);
        setCurrentChallengeId(n2n3Candidates[randomIdx].id);
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
  
  const stepStartTime = useRef(Date.now());

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
    }
  }, [currentChallenge?.id]);

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

  const handleStart = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      addEvent('PHASE_START', {
        phase: 'Juicio_Pretest',
        challengeId: currentChallenge!.id,
        jol_answers: jolAnswers,
        jol_times: jolTimes,
      });

      navigate('/challenge', {
        state: { 
          challenge: currentChallenge,
          jolAnswers, 
          jolTimes,
        },
      });
    }, 2200);
  };

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
          <p className="mp-reto-desc">{currentChallenge.descripcion}</p>

          <div className="mp-divider"></div>

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
                  Pregunta {activeStep + 1} de {selectedJols.length}
                </div>
                <p className="mp-meta-q">{currentJolQuestion.pregunta}</p>
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
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginBottom: '24px' }}>
                  Has completado las {selectedJols.length} preguntas de autoevaluación. <br/>
                  Tiempo estimado del reto: <strong>{currentChallenge.tiempo_estimado} min</strong>
                </p>
                <button className="mp-btn-iniciar ready" onClick={handleStart} style={{ fontSize: '18px', padding: '16px 40px' }}>
                  Iniciar Reto <i className="ti ti-rocket"></i>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className={`mp-toast ${showToast ? 'show' : ''}`} id="toast">
        <i className="ti ti-rocket"></i> ¡Reto iniciado!
      </div>
    </div>
  );
}
