import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { challengeBank, JOLQuestion } from '../data/challengeBank';
import { EvaluationTracker } from '../components/EvaluationTracker';
import './EvaluationStart.css';

export function EvaluationStart() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { addEvent, currentLevel, currentChallengeId, setCurrentChallengeId, setCurrentSessionId, currentSessionId } = useCognitiveStore();
  
  useEffect(() => {
    // Solo generar un ID nuevo si estamos empezando desde el Nivel 1 o no hay una sesión activa
    if (currentLevel === 1 || !currentSessionId) {
      const newSessionId = `SESS-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      setCurrentSessionId(newSessionId);
      console.log('🚀 Nueva sesión iniciada:', newSessionId);
    } else {
      console.log('🔄 Continuando sesión existente:', currentSessionId);
    }
  }, [currentLevel, setCurrentSessionId]);

  const levelData = challengeBank.find(l => l.nivel === currentLevel) || challengeBank[0];
  
  useEffect(() => {
    if (!currentChallengeId) {
      const candidates = levelData.retos.filter(r => 
        r.dificultad === "Fácil" || r.dificultad === "Un poco más difícil"
      );
      const randomIdx = Math.floor(Math.random() * candidates.length);
      setCurrentChallengeId(candidates[randomIdx].id);
    }
  }, [currentLevel, currentChallengeId, levelData.retos, setCurrentChallengeId]);

  const currentChallenge = currentChallengeId 
    ? levelData.retos.find(r => r.id === currentChallengeId) 
    : null;

  // Selección de JOLs: 2 específicos + 1 aleatorio fijo
  const [selectedJols, setSelectedJols] = useState<JOLQuestion[]>([]);
  const [jolAnswers, setJolAnswers] = useState<Record<string, number>>({});
  const [jolTimes, setJolTimes] = useState<Record<string, number>>({});
  const [timeEstimate, setTimeEstimate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [activeStep, setActiveStep] = useState(0); 
  
  const stepStartTime = useRef(Date.now());

  useEffect(() => {
    if (currentChallenge) {
      const specific = currentChallenge.jol_preguntas.filter(q => q.tipo === 'especifico');
      const fixed = currentChallenge.jol_preguntas.filter(q => q.tipo === 'fijo');
      const randomFixed = fixed[Math.floor(Math.random() * fixed.length)];
      
      setSelectedJols([...specific, randomFixed]);
    }
  }, [currentChallenge?.id]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().slice(0, 8));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentJolQuestion = selectedJols[activeStep];
  const isReady = activeStep === selectedJols.length && timeEstimate !== '' && parseInt(timeEstimate) > 0;

  const states: Record<number, { label: string; color: string }> = {
    1: { label: 'Muy inseguro/a', color: '#e24b4a' },
    2: { label: 'Inseguro/a', color: '#e24b4a' },
    3: { label: 'Poca confianza', color: '#ef9f27' },
    4: { label: 'Algo inseguro/a', color: '#ef9f27' },
    5: { label: 'Neutral', color: '#f2cc60' },
    6: { label: 'Algo seguro/a', color: '#97c459' },
    7: { label: 'Seguro/a', color: '#5dcaa5' },
    8: { label: 'Alta confianza', color: '#238636' },
    9: { label: 'Muy seguro/a', color: '#238636' },
    10: { label: 'Experto/a total', color: '#1a7f37' },
  };

  const handleJolAnswer = (val: number) => {
    const timeTaken = Math.round((Date.now() - stepStartTime.current) / 1000);
    setJolAnswers(prev => ({ ...prev, [currentJolQuestion.id]: val }));
    setJolTimes(prev => ({ ...prev, [currentJolQuestion.id]: timeTaken }));
    
    setActiveStep(prev => prev + 1);
    stepStartTime.current = Date.now();
  };

  const handleStart = () => {
    if (!isReady) return;
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
      addEvent('PHASE_START', {
        phase: 'Juicio_Pretest',
        challengeId: currentChallenge.id,
        jol_answers: jolAnswers,
        jol_times: jolTimes,
        estimated_time: parseInt(timeEstimate),
      });

      navigate('/challenge', {
        state: { 
          challenge: currentChallenge,
          jolAnswers, 
          jolTimes,
          estimatedTime: parseInt(timeEstimate) 
        },
      });
    }, 2200);
  };

  if (!currentChallenge || selectedJols.length === 0) {
    return (
      <div className={`mp-root ${theme} flex items-center justify-center`} style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Preparando reto aleatorio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mp-root ${theme}`}>
      <EvaluationTracker currentPhase="A" />

      <div className={`mp-body sidebar-closed`}>
        <div className="mp-main">
          <div className="mp-competencia-tag">{currentChallenge.dificultad}</div>
          <h1 className="mp-reto-title">{currentChallenge.nombre}</h1>
          <p className="mp-reto-desc">{currentChallenge.ejercicio_fase_b}</p>

          <div className="mp-divider"></div>

          <AnimatePresence mode="wait">
            {activeStep < selectedJols.length ? (
              <motion.div
                key={currentJolQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mp-meta-card"
              >
                <p className="mp-meta-q">{currentJolQuestion.pregunta}</p>
                <div className="mp-slider-labels"><span>Mínima</span><span>Máxima</span></div>
                <input
                  type="range" min="1" max="10" 
                  value={jolAnswers[currentJolQuestion.id] || 5}
                  onChange={(e) => setJolAnswers(prev => ({ ...prev, [currentJolQuestion.id]: parseInt(e.target.value) }))}
                  className="mp-jol-slider"
                  style={{ background: `linear-gradient(to right, ${states[jolAnswers[currentJolQuestion.id] || 5].color} ${(( (jolAnswers[currentJolQuestion.id] || 5) - 1) / 9) * 100}%, var(--mp-divider) ${(( (jolAnswers[currentJolQuestion.id] || 5) - 1) / 9) * 100}%)` }}
                />
                <div className="mp-jol-value">
                  <span className="mp-jol-number" style={{ color: states[jolAnswers[currentJolQuestion.id] || 5].color }}>{jolAnswers[currentJolQuestion.id] || 5}</span>
                  <button className="mp-btn-iniciar ready" style={{ width: 'auto' }} onClick={() => handleJolAnswer(jolAnswers[currentJolQuestion.id] || 5)}>
                    Continuar <i className="ti ti-arrow-right"></i>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="time-step"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mp-meta-card"
              >
                <p className="mp-meta-q">¿En cuántos minutos estimas que completarás este reto?</p>
                <div className="mp-time-row">
                  <input
                    type="number" min="1" max="120" value={timeEstimate}
                    onChange={(e) => setTimeEstimate(e.target.value)}
                    placeholder="—" className="mp-time-input" autoFocus
                  />
                  <span className="mp-time-unit">minutos</span>
                </div>
                <button className={`mp-btn-iniciar ${isReady ? 'ready' : ''}`} disabled={!isReady} onClick={handleStart} style={{ marginTop: '24px' }}>
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
