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
import { useTutorStore } from '../stores/useTutorStore';
import { api } from '../services/api';
import { LearningStyleQuiz } from '../components/tutor/LearningStyleQuiz';
import './EvaluationStart.css';

const RECOMMENDED_BY_PROFILE: Record<string, string[]> = { over: ['est2', 'est8'], sub: ['est7', 'est2'], cal: ['est4', 'est7'] };

const levelMap: Record<number, string> = { 1: "Básico", 2: "Medio", 3: "Avanzado" };

export function EvaluationStart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { addEvent, currentLevel, currentChallengeId, setCurrentChallengeId, setCurrentSessionId, currentSessionId, assignedStrategyId, strategyAssignedRandomly, setAssignedStrategyId, dbUserId } = useCognitiveStore();
  const { syncPhaseA } = usePhaseSync();
  const { plan, setPlan, setState: setTutorState, state: tutorState, learningStyle, dismissedStyleQuiz } = useTutorStore();
  const [showStyleQuiz, setShowStyleQuiz] = useState(false);

  const assignedStrategy: Estrategia | null = getEstrategia(assignedStrategyId);

  // Plan del tutor (Fase A): reto del escalón de la ZDP técnica + estrategia por muestreo de Thompson
  // (grupo experimental) o al azar (grupo control). Si el servidor no responde, regla local por perfil.
  const planRequestedRef = useRef<string | null>(null);
  useEffect(() => {
    const forced = location.state?.forcedChallengeId as string | undefined;
    const key = `${currentLevel}-${forced ?? ''}-${currentChallengeId ?? ''}`;
    if (planRequestedRef.current === key) return;
    if (assignedStrategyId && (currentChallengeId || forced)) { planRequestedRef.current = key; return; }
    planRequestedRef.current = key;
    const levelName = levelMap[currentLevel] || 'Básico';
    const available = dynamicChallengeBank.filter(c => c.nivel === levelName).map(c => ({ id: c.id }));
    const applyFallback = () => {
      if (!assignedStrategyId) {
        const profile = tutorState?.last_profile;
        const rec = profile ? RECOMMENDED_BY_PROFILE[profile] : null;
        const pick = rec ? rec[Math.floor(Math.random() * rec.length)] : nuevasEstrategias[Math.floor(Math.random() * nuevasEstrategias.length)].id;
        setAssignedStrategyId(pick, !rec);
      }
    };
    if (!dbUserId) { applyFallback(); return; }
    api.tutorPlan({ user_id: dbUserId, level_name: levelName, available, session_id: currentSessionId })
      .then((p) => {
        setPlan(p);
        if (!assignedStrategyId) setAssignedStrategyId(p.strategy.strategy_id, p.strategy.method === 'aleatoria');
        if (!forced && !currentChallengeId && p.challenge.challenge_id) setCurrentChallengeId(p.challenge.challenge_id);
      })
      .catch(() => applyFallback());
  }, [currentLevel, currentChallengeId, assignedStrategyId, dbUserId, location.state]);

  useEffect(() => {
    if (dbUserId && !tutorState) api.getTutorState(dbUserId).then(setTutorState).catch(() => {});
  }, [dbUserId]);

  useEffect(() => {
    if (!learningStyle && !dismissedStyleQuiz && !tutorState?.learning_style) setShowStyleQuiz(true);
  }, [learningStyle, dismissedStyleQuiz, tutorState]);
  
  useEffect(() => {
    if (currentLevel === 1 || !currentSessionId) {
      const newSessionId = `SESS-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      setCurrentSessionId(newSessionId);
      console.log('🚀 Nueva sesión iniciada:', newSessionId);
    } else {
      console.log('🔄 Continuando sesión existente:', currentSessionId);
    }
  }, [currentLevel, setCurrentSessionId]);

  const currentLevelString = levelMap[currentLevel] || "Básico";
  
  useEffect(() => {
    // 1. Si viene con forcedChallengeId (desde el modal de reto fallido), usar ese reto directamente
    if (location.state?.forcedChallengeId) {
      const forced = dynamicChallengeBank.find(c => c.id === location.state.forcedChallengeId);
      if (forced) {
        // El reto forzado manda: si además se aplicara el respaldo a N1 de abajo (retryVariation),
        // los dos se pisarían en cada render (bucle infinito, React error #185).
        if (currentChallengeId !== forced.id) setCurrentChallengeId(forced.id);
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

    if (!currentChallengeId && !dbUserId) {
      // Sin usuario autenticado no hay plan del tutor: escalón más bajo del nivel.
      const candidates = dynamicChallengeBank.filter(c => c.nivel === currentLevelString && c.sub_nivel === 'N1');
      if (candidates.length > 0) setCurrentChallengeId(candidates[0].id);
    }
  }, [currentLevelString, currentChallengeId, setCurrentChallengeId, location.state, dbUserId]);

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

  const handleChangeStrategy = (id: string) => {
    if (dbUserId) api.tutorOverride({ user_id: dbUserId, session_id: currentSessionId, kind: 'strategy', chosen: id, suggested: assignedStrategyId ?? undefined }).catch(() => {});
    addEvent('TUTOR_OVERRIDE', { kind: 'strategy', chosen: id, suggested: assignedStrategyId });
    setAssignedStrategyId(id, false);
  };
  const handleChangeChallenge = (id: string) => {
    if (dbUserId) api.tutorOverride({ user_id: dbUserId, session_id: currentSessionId, kind: 'challenge', chosen: id, suggested: currentChallengeId ?? undefined }).catch(() => {});
    addEvent('TUTOR_OVERRIDE', { kind: 'challenge', chosen: id, suggested: currentChallengeId });
    setCurrentChallengeId(id);
  };
  const planMatchesChallenge = Boolean(plan && currentChallenge && plan.challenge.challenge_id === currentChallenge.id);

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
      <LearningStyleQuiz open={showStyleQuiz} userId={dbUserId} onClose={() => setShowStyleQuiz(false)} />

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
                tutorReason={planMatchesChallenge ? plan!.challenge.reason : (location.state?.fromMap ? 'Lo elegiste tú en el mapa de retos.' : null)}
                alternatives={planMatchesChallenge ? plan!.challenge.alternatives.filter(a => a.unlocked).map(a => ({ id: a.id, titulo: dynamicChallengeBank.find(c => c.id === a.id)?.titulo ?? a.id, p: a.p_dominio })) : []}
                onChangeChallenge={handleChangeChallenge}
                presentationHint={learningStyle ? (learningStyle.visual_verbal >= 0 ? 'visual' : 'verbal') : null}
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
              reason={plan && plan.strategy.strategy_id === assignedStrategyId ? plan.strategy.reason : (strategyAssignedRandomly ? 'Se asignó al azar (grupo de comparación o sin conexión con el tutor).' : 'La elegiste tú.')}
              onChangeStrategy={handleChangeStrategy}
              scaffoldMessage={plan?.scaffold?.messages?.[0] ?? null}
              zdpLabel={plan?.zdp?.zdp_label ?? null}
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
