import { useState, useEffect, useRef } from 'react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { dynamicChallengeBank } from '../data/dynamicChallengeBank';
import { jolGenerales } from '../data/jolGenerales';
import { getChallengeBriefing } from '../data/challengeBriefings';
import { EvaluationTracker } from '../components/EvaluationTracker';
import { usePhaseSync } from '../hooks/usePhaseSync';
import { nuevasEstrategias, getEstrategia, Estrategia } from '../data/metacognitiveStrategies';
import { ChallengeBriefing } from '../components/ChallengeBriefing';
import { JolQuestion, JolReady, type JolItem } from '../components/JolFlow';
import './EvaluationStart.css';

export function EvaluationStart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { addEvent, currentLevel, currentChallengeId, setCurrentChallengeId, setCurrentSessionId, currentSessionId, assignedStrategyId, strategyAssignedRandomly, setAssignedStrategyId } = useCognitiveStore();
  const { syncPhaseA } = usePhaseSync();

  const assignedStrategy: Estrategia | null = getEstrategia(assignedStrategyId);

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
  };

  const currentJolQuestion = selectedJols[activeStep];
  const allJolsDone = activeStep >= selectedJols.length;

  // --- Handler genérico para confirmar una respuesta JOL ---
  const confirmAnswer = (val: number | string) => {
    const timeTaken = Math.round((Date.now() - stepStartTime.current) / 1000);
    setJolAnswers(prev => ({ ...prev, [currentJolQuestion.id]: val }));
    setJolTimes(prev => ({ ...prev, [currentJolQuestion.id]: timeTaken }));
    setActiveStep(prev => prev + 1);
    stepStartTime.current = Date.now();
  };

  const getEstimatedMinutes = (): number => {
    const timeJol = selectedJols.find(j => /min/i.test(j.escala));
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
  const isRetryVariation = Boolean(location.state?.retryVariation);

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

  return (
    <div className={`mp-root ${theme}`}>
      <EvaluationTracker currentPhase="A" />

      <div className={`mp-body sidebar-closed`}>
        <div className="mp-main">
          {!showJolPhase ? (
            briefing ? (
              <ChallengeBriefing
                titulo={currentChallenge.titulo}
                nivel={currentChallenge.nivel}
                subNivel={currentChallenge.sub_nivel}
                componente={currentChallenge.componente}
                briefing={briefing}
                isRetryVariation={isRetryVariation}
                onBegin={handleBeginJol}
              />
            ) : (
              <h1 className="mp-reto-title">{currentChallenge.titulo}</h1>
            )
          ) : allJolsDone ? (
            <JolReady
              minutes={currentChallenge.tiempo_estimado}
              strategy={assignedStrategy}
              randomly={strategyAssignedRandomly}
              onStart={handleStart}
            />
          ) : (
            <JolQuestion
              item={currentJolQuestion}
              index={activeStep}
              total={selectedJols.length}
              value={jolAnswers[currentJolQuestion.id]}
              onChange={(v) => setJolAnswers((prev) => ({ ...prev, [currentJolQuestion.id]: v }))}
              onConfirm={confirmAnswer}
              challengeTitle={currentChallenge.titulo}
            />
          )}
        </div>
      </div>

      <div className={`mp-toast ${showToast ? 'show' : ''}`} id="toast">
        <i className="ti ti-rocket"></i> ¡Reto iniciado!
      </div>
    </div>
  );
}
