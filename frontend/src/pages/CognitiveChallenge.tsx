import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code2, ChevronRight, Brain, Target, BarChart3, ArrowLeft, Send, AlertCircle, Quote, Zap, RotateCcw, TrendingUp, Award } from 'lucide-react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useStudentTestTracking } from '../hooks/useStudentTestTracking';
import { phase1Levels, questionVariations, Level, LevelData, Question } from '../data/phase1Questions';

type Phase = 'judgment' | 'resolution' | 'calibration';

const levelData: LevelData[] = phase1Levels;

export function CognitiveChallenge() {
  const [currentLevel, setCurrentLevel] = useState<Level>('basic');
  const [currentPhase, setCurrentPhase] = useState<Phase>('judgment');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [levelAttempts, setLevelAttempts] = useState<Record<Level, number>>({ basic: 0, intermediate: 0, expert: 0 });
  const [judgments, setJudgments] = useState<Record<Level, number[]>>({ basic: [], intermediate: [], expert: [] });
  const [answers, setAnswers] = useState<Record<Level, { isCorrect: boolean; timeSpent: number; clicks: number }[]>>({ basic: [], intermediate: [], expert: [] });
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [questionClicks, setQuestionClicks] = useState<number>(0);
  const [showCalibration, setShowCalibration] = useState(false);

  const { addEvent, updateCognitiveMetrics, events } = useCognitiveStore();
  const { trackClick, trackQuestionAnswer, trackPageNavigation, trackLevelJudgment, trackLevelCalibration, trackLevelRepeat } = useStudentTestTracking();
  const navigate = useNavigate();

  const currentLevelData = levelData.find(l => l.level === currentLevel)!;
  const currentQuestions = currentLevelData.questions;
  const currentQuestion = currentQuestions[currentQuestionIdx];

  // Find pre-test perceptions for comparison
  const preTestEvent = events.find(e => e.metadata?.phase === 'Juicio_Pretest');
  const perceptions = preTestEvent?.metadata?.perceptions || [];

  useEffect(() => {
    setQuestionStartTime(Date.now());
    setQuestionClicks(0);
  }, [currentQuestionIdx, currentPhase]);

  const handleJudgmentSubmit = (confidence: number) => {
    const newJudgments = { ...judgments };
    newJudgments[currentLevel] = [...(newJudgments[currentLevel] || []), confidence];
    setJudgments(newJudgments);

    trackLevelJudgment(currentLevel, confidence, levelAttempts[currentLevel] + 1);

    setCurrentPhase('resolution');
    trackPageNavigation('judgment', 'resolution');
  };

  const handleAnswerSelect = (optionIdx: number) => {
    const timeSpent = Date.now() - questionStartTime;
    const selectedOption = currentQuestion.options[optionIdx];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    trackClick('answer-option');
    trackQuestionAnswer(currentQuestion.id, isCorrect, timeSpent, questionClicks + 1);

    const newAnswers = { ...answers };
    newAnswers[currentLevel] = [...(newAnswers[currentLevel] || []), {
      isCorrect,
      timeSpent,
      clicks: questionClicks + 1
    }];
    setAnswers(newAnswers);

    if (currentQuestionIdx < currentQuestions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      setCurrentPhase('calibration');
      setShowCalibration(true);
    }
  };

  const calculateLevelCalibration = (level: Level): { score: number; calibration: number; gap: number } => {
    const levelAnswers = answers[level] || [];
    const levelJudgments = judgments[level] || [];

    if (levelAnswers.length === 0 || levelJudgments.length === 0) return { score: 0, calibration: 0, gap: 0 };

    const correctCount = levelAnswers.filter(a => a.isCorrect).length;
    const score = (correctCount / levelAnswers.length) * 100;
    const avgJudgment = levelJudgments.reduce((a, b) => a + b, 0) / levelJudgments.length / 10;
    const calibration = score / 100;
    const gap = Math.abs(avgJudgment - calibration);

    return { score, calibration, gap };
  };

  const handleCalibrationComplete = () => {
    const { score, calibration, gap } = calculateLevelCalibration(currentLevel);
    const requiredCalibration = currentLevelData.requiredCalibration;

    trackLevelCalibration(currentLevel, score, calibration, gap, calibration >= requiredCalibration, levelAttempts[currentLevel] + 1);

    updateCognitiveMetrics(0.7, calibration, score);

    // Decisión crítica: ¿Pasar al siguiente nivel o repetir?
    if (calibration >= requiredCalibration) {
      // Calibración adecuada - pasar al siguiente nivel
      const nextLevel = getNextLevel(currentLevel);
      if (nextLevel) {
        setCurrentLevel(nextLevel);
        setCurrentPhase('judgment');
        setCurrentQuestionIdx(0);
        setShowCalibration(false);
        trackPageNavigation(`level-${currentLevel}`, `level-${nextLevel}`);
      } else {
        // Completó todos los niveles
        navigate('/dashboard');
      }
    } else {
      // Sobreconfianza detectada - repetir nivel con variación
      const newAttempts = { ...levelAttempts };
      newAttempts[currentLevel] = (newAttempts[currentLevel] || 0) + 1;
      setLevelAttempts(newAttempts);

      // Reset para repetir nivel
      setCurrentPhase('judgment');
      setCurrentQuestionIdx(0);
      setShowCalibration(false);

      trackLevelRepeat(currentLevel, 'insufficient_calibration', gap, newAttempts[currentLevel]);
    }
  };

  const getNextLevel = (level: Level): Level | null => {
    const levels: Level[] = ['basic', 'intermediate', 'expert'];
    const currentIndex = levels.indexOf(level);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  };

  const getQuestionVariation = (questionId: string): Question => {
    const variations = questionVariations[questionId];
    if (variations && levelAttempts[currentLevel] > 0) {
      const variationIndex = levelAttempts[currentLevel] % variations.length;
      return variations[variationIndex];
    }
    return currentQuestion;
  };

  const renderJudgmentPhase = () => (
    <motion.div
      key="judgment"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bento-card p-12 text-center"
    >
      <div className="w-24 h-24 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-primary/20">
        <Brain className="w-12 h-12" />
      </div>
      <h2 className="text-4xl font-bold mb-4 tracking-tight">{currentLevelData.name}</h2>
      <p className="text-lg text-on-surface-variant mb-10 max-w-xl mx-auto font-medium">
        {currentLevelData.description}
      </p>

      <div className="bg-surface-container p-8 rounded-3xl mb-8">
        <h3 className="text-xl font-bold mb-6">Fase A: Juicio de Aprendizaje</h3>
        <p className="text-on-surface-variant mb-6">
          Antes de resolver los retos, indica qué tan seguro te sientes con tu conocimiento en este nivel.
        </p>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => handleJudgmentSubmit(num)}
              className="aspect-square rounded-2xl bg-surface hover:bg-primary hover:text-on-primary transition-all font-bold text-lg border-2 border-outline-variant/20 hover:border-primary"
            >
              {num}
            </button>
          ))}
        </div>

        <div className="flex justify-between text-xs text-on-surface-variant">
          <span>No tengo idea</span>
          <span>Estoy 100% seguro</span>
        </div>
      </div>

      {levelAttempts[currentLevel] > 0 && (
        <div className="bg-error-container p-6 rounded-2xl border border-error">
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw className="w-5 h-5 text-error" />
            <span className="font-bold text-error">Repitiendo Nivel</span>
          </div>
          <p className="text-sm text-on-error-container">
            En tu intento anterior, hubo un desfase entre tu confianza y tu desempeño.
            Esta es tu oportunidad de demostrar una mejor calibración metacognitiva.
          </p>
        </div>
      )}
    </motion.div>
  );

  const renderResolutionPhase = () => {
    const questionToShow = getQuestionVariation(currentQuestion.id);

    return (
      <motion.div
        key="resolution"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">
              {currentLevelData.name} - Pregunta {currentQuestionIdx + 1}/{currentQuestions.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold opacity-50 uppercase">Tu Juicio:</span>
            <span className="text-xs font-black text-secondary">
              {judgments[currentLevel]?.[judgments[currentLevel].length - 1] || '?'} / 10
            </span>
          </div>
        </div>

        <div className="bento-card p-10 bg-white border-2 border-secondary/5 shadow-xl">
          <div className="mb-6 text-sm text-on-surface-variant">
            <p className="font-semibold text-on-surface">Tema: {questionToShow.category}</p>
            <p>{questionToShow.context}</p>
          </div>
          <p className="text-base font-semibold text-on-surface mb-8">{questionToShow.metacognitivePrompt}</p>
          <h3 className="text-2xl font-bold mb-10 text-on-surface leading-tight">
            {questionToShow.text}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {questionToShow.options.map((option, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuestionClicks(prev => prev + 1);
                  handleAnswerSelect(i);
                }}
                className="p-6 text-left rounded-2xl border-2 border-outline-variant/20 hover:border-secondary hover:bg-secondary/5 transition-all group flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center font-bold text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="text-lg font-bold">{option}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderCalibrationPhase = () => {
    const { score, calibration, gap } = calculateLevelCalibration(currentLevel);
    const requiredCalibration = currentLevelData.requiredCalibration;
    const passed = calibration >= requiredCalibration;

    return (
      <motion.div
        key="calibration"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "bento-card p-12 text-center",
          passed ? "border-2 border-secondary bg-secondary/5" : "border-2 border-error bg-error/5"
        )}
      >
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl",
          passed ? "bg-secondary text-on-secondary" : "bg-error text-on-error"
        )}>
          {passed ? <Award className="w-12 h-12" /> : <AlertCircle className="w-12 h-12" />}
        </div>

        <h2 className="text-4xl font-bold mb-4 tracking-tight">
          {passed ? '¡Excelente Calibración!' : 'Desfase Detectado'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface-container p-6 rounded-2xl">
            <p className="text-sm text-on-surface-variant font-bold mb-2">TU JUICIO PROMEDIO</p>
            <p className="text-3xl font-bold text-primary">
              {(judgments[currentLevel]?.reduce((a, b) => a + b, 0) / judgments[currentLevel]?.length || 0).toFixed(1)}/10
            </p>
          </div>
          <div className="bg-surface-container p-6 rounded-2xl">
            <p className="text-sm text-on-surface-variant font-bold mb-2">TU DESEMPEÑO REAL</p>
            <p className="text-3xl font-bold text-secondary">{score.toFixed(1)}%</p>
          </div>
          <div className="bg-surface-container p-6 rounded-2xl">
            <p className="text-sm text-on-surface-variant font-bold mb-2">CALIBRACIÓN</p>
            <p className={cn(
              "text-3xl font-bold",
              passed ? "text-secondary" : "text-error"
            )}>
              {(calibration * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-surface-container p-8 rounded-3xl mb-8">
          <h3 className="text-xl font-bold mb-4">Fase C: Reflexión Metacognitiva</h3>
          <p className="text-on-surface-variant mb-6">
            {passed
              ? `¡Perfecto! Tu juicio (${(judgments[currentLevel]?.reduce((a, b) => a + b, 0) / judgments[currentLevel]?.length || 0).toFixed(1)}/10) se alinea muy bien con tu desempeño real (${score.toFixed(1)}%). Esto demuestra una excelente conciencia metacognitiva.`
              : `Hay un desfase entre tu confianza (${(judgments[currentLevel]?.reduce((a, b) => a + b, 0) / judgments[currentLevel]?.length || 0).toFixed(1)}/10) y tu desempeño real (${score.toFixed(1)}%). Para pasar al siguiente nivel, necesitas demostrar una mejor calibración resolviendo retos similares.`
            }
          </p>

          {!passed && (
            <div className="bg-error-container p-4 rounded-2xl border border-error">
              <p className="text-sm text-on-error-container">
                <strong>Recomendación:</strong> Repetirás este nivel con variaciones de los retos para fortalecer tu capacidad de autoevaluación.
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleCalibrationComplete}
          className={cn(
            "px-12 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 mx-auto",
            passed ? "bg-secondary text-on-secondary shadow-secondary/30" : "bg-error text-on-error shadow-error/30"
          )}
        >
          {passed ? 'Avanzar al Siguiente Nivel' : 'Repetir Nivel con Variaciones'}
          <ChevronRight className="w-6 h-6" />
        </button>
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <AnimatePresence mode="wait">
        {currentPhase === 'judgment' && renderJudgmentPhase()}
        {currentPhase === 'resolution' && renderResolutionPhase()}
        {currentPhase === 'calibration' && renderCalibrationPhase()}
      </AnimatePresence>
    </div>
  );
}
