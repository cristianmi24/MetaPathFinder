import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, CheckCircle2, ChevronRight, Target, AlertCircle, RefreshCcw, ArrowLeft, Send, BarChart3, Code2, Quote } from 'lucide-react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useCognitiveTracking } from '../hooks/useCognitiveTracking';

interface PerceptionQuestion {
  id: number;
  category: string;
  text: string;
}

interface ChallengeQuestion {
  id: number;
  category: string;
  text: string;
  options: string[];
  correctIndex: number;
}

const perceptionQuestions: PerceptionQuestion[] = [
  { id: 1, category: "Lógica y Condicionales", text: "¿Cómo te sientes resolviendo problemas que implican múltiples condiciones anidadas (if/else)?" },
  { id: 2, category: "Ciclos e Iteración", text: "¿Qué tan seguro te sientes al implementar bucles complejos y controlar su terminación?" },
  { id: 3, category: "Estructuras de Datos", text: "¿Qué tanto dominas el acceso y la manipulación de datos en arreglos y matrices?" },
  { id: 4, category: "Pensamiento Algorítmico", text: "¿Cómo calificarías tu capacidad para descomponer un problema complejo en pasos lógicos?" }
];

const challengeQuestions: ChallengeQuestion[] = [
  {
    id: 1,
    category: "Lógica y Condicionales",
    text: "¿Cuál es el resultado de la expresión: (true && false) || (true && !false)?",
    options: ["true", "false", "undefined", "null"],
    correctIndex: 0
  },
  {
    id: 2,
    category: "Ciclos e Iteración",
    text: "En un bucle 'while (x < 10)', si x comienza en 5 e incrementamos x en 2 cada iteración, ¿cuántas veces se ejecuta el bloque?",
    options: ["2 veces", "3 veces", "5 veces", "Infinita"],
    correctIndex: 1
  },
  {
    id: 3,
    category: "Estructuras de Datos",
    text: "Si tenemos un arreglo 'data = [5, 10, 15]', ¿qué devuelve específicamente el método data.pop()?",
    options: ["5", "10", "15", "[5, 10]"],
    correctIndex: 2
  },
  {
    id: 4,
    category: "Pensamiento Algorítmico",
    text: "Para encontrar el número más grande en una lista desordenada de 'n' elementos, ¿cuántas comparaciones se realizan en el peor caso?",
    options: ["n/2", "n", "n-1", "log n"],
    correctIndex: 2
  }
];

export function Evaluations() {
  const [phase, setPhase] = useState<'intro' | 'perception' | 'challenge' | 'socratic' | 'results'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [perceptions, setPerceptions] = useState<{ category: string, value: number }[]>([]);
  const [currentValue, setCurrentValue] = useState(5);
  const [answers, setAnswers] = useState<{ category: string, isCorrect: boolean }[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  
  const { addEvent, updateCognitiveMetrics, latentStrategies } = useCognitiveStore();
  const navigate = useNavigate();
  const questionStartTime = useRef(Date.now());

  // Activate tracking during challenge phase
  useCognitiveTracking(phase === 'challenge');

  useEffect(() => {
    if (phase === 'challenge') {
      questionStartTime.current = Date.now();
    }
  }, [phase, currentIdx]);

  const handleStart = () => {
    setPhase('perception');
    addEvent('PHASE_START', { phase: 'Juicio_Pretest', theme: 'Autopercepción_Programación' });
  };

  const handlePerceptionSubmit = () => {
    const newPerceptions = [...perceptions, { category: perceptionQuestions[currentIdx].category, value: currentValue }];
    setPerceptions(newPerceptions);
    
    if (currentIdx < perceptionQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setCurrentValue(5);
    } else {
      setCurrentIdx(0);
      setPhase('challenge');
      addEvent('PHASE_COMPLETED', { phase: 'Juicio_Pretest', theme: 'Autopercepción_Programación' });
      addEvent('PHASE_START', { phase: 'Desafío_Cognitivo', theme: 'Fundamentos_Técnicos' });
    }
  };

  const handleAnswerSelect = (optionIdx: number) => {
    const now = Date.now();
    const duration = now - questionStartTime.current;
    
    // 1. Detección de Impulsividad (Clicks rápidos)
    if (duration < 5000) {
      addEvent('COGNITIVE_BIAS', { 
        interpretation: 'Impulsividad',
        trigger: 'Fast response',
        duration_ms: duration,
        theme: challengeQuestions[currentIdx].category,
        is_reflexive_brake: true
      });
      setPhase('socratic');
      return;
    }

    // 2. Detección de Frustración o Sobrecarga (Tiempo excesivo)
    if (duration > 30000) {
      addEvent('COGNITIVE_BIAS', {
        interpretation: 'Frustración o sobrecarga',
        trigger: 'Excessive time',
        duration_ms: duration,
        theme: challengeQuestions[currentIdx].category
      });
    }

    const isCorrect = optionIdx === challengeQuestions[currentIdx].correctIndex;
    const newAnswers = [...answers, { category: challengeQuestions[currentIdx].category, isCorrect }];
    setAnswers(newAnswers);
    
    if (currentIdx < challengeQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      addEvent('PHASE_COMPLETED', { phase: 'Desafío_Cognitivo', theme: 'Fundamentos_Técnicos' });
      completeEvaluation(newAnswers);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    addEvent('COGNITIVE_BIAS', {
      interpretation: 'Persistencia',
      trigger: 'Manual retry after brake',
      type: 'retry'
    });
    setPhase('challenge');
    questionStartTime.current = Date.now();
  };

  const completeEvaluation = (finalAnswers: { category: string, isCorrect: boolean }[]) => {
    const correctCount = finalAnswers.filter(a => a.isCorrect).length;
    const scorePercent = (correctCount / challengeQuestions.length) * 100;
    
    const avgPerception = perceptions.reduce((a, b) => a + b.value, 0) / perceptions.length / 10;
    const currentCalibration = scorePercent / 100;

    updateCognitiveMetrics(0.75, currentCalibration, scorePercent);
    
    addEvent('EVALUATION_COMPLETED', {
      phase: 'Final_Full_Flow',
      theme: 'Fundamentos_Técnicos',
      score: scorePercent,
      calibration: currentCalibration,
      initial_perception: avgPerception,
      calibration_gap: Number((avgPerception - currentCalibration).toFixed(2)),
      latent_strategy: scorePercent > 70 ? 'STRUCTURAL_MAPPING' : 'SYSTEMATIC_VERIFICATION',
      total_retries: retryCount
    });

    addEvent('PHASE_COMPLETED', { phase: 'Desfase', theme: 'Calibración_Meta' });
    setPhase('results');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bento-card p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Brain className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Evaluación de 3 Fases</h2>
            <p className="text-lg text-on-surface-variant mb-10 max-w-xl mx-auto font-medium">
              Este proceso medirá tu autopercepción inicial, validará tus habilidades técnicas y analizará el desfase metacognitivo resultante.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <InfoCard icon={Target} title="Fase 1" desc="Juicio de Percepción" />
              <InfoCard icon={Code2} title="Fase 2" desc="Desafío Cognitivo" />
              <InfoCard icon={BarChart3} title="Fase 3" desc="Análisis de Desfase" />
            </div>
            <button onClick={handleStart} className="px-12 py-5 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-3 mx-auto">
              Comenzar Proceso <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}

        {phase === 'perception' && (
          <motion.div key="perc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="text-center">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-4">FASE 1: JUICIO</div>
              <h3 className="text-3xl font-bold mb-2">{perceptionQuestions[currentIdx].text}</h3>
              <p className="text-on-surface-variant">Pregunta {currentIdx+1} de {perceptionQuestions.length}</p>
            </div>
            <div className="bento-card p-12 bg-white border border-primary/20 text-center">
              <div className="flex justify-between mb-8">
                {[...Array(10)].map((_, i) => (
                  <span key={i} className={cn("text-[10px] font-bold", currentValue > i ? "text-primary" : "text-outline")}>{i+1}</span>
                ))}
              </div>
              <input type="range" min="1" max="10" value={currentValue} onChange={(e) => setCurrentValue(parseInt(e.target.value))} className="w-full h-3 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary mb-12" />
              <div className="flex justify-between items-center p-8 bg-primary/5 rounded-3xl border border-primary/10">
                <div className="text-left"><p className="text-xs font-bold text-primary uppercase">Confianza</p><p className="text-4xl font-black">{currentValue} / 10</p></div>
                <button onClick={handlePerceptionSubmit} className="px-10 py-5 bg-primary text-on-primary rounded-2xl font-bold flex items-center gap-2 shadow-xl">Siguiente <Send className="w-4 h-4 ml-2" /></button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'challenge' && (
          <motion.div key="chal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
               <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-primary animate-pulse" /><span className="text-xs font-bold uppercase tracking-widest text-primary">{challengeQuestions[currentIdx].category}</span></div>
               <span className="text-xs font-black text-secondary">Percepción: {perceptions[currentIdx]?.value} / 10</span>
            </div>
            <div className="bento-card p-10 bg-white border-2 border-primary/5 shadow-xl">
              <h3 className="text-2xl font-bold mb-10 text-on-surface leading-tight">{challengeQuestions[currentIdx].text}</h3>
              <div className="grid grid-cols-1 gap-3">
                {challengeQuestions[currentIdx].options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswerSelect(i)} className="p-6 text-left rounded-2xl border-2 border-outline-variant/20 hover:border-primary hover:bg-primary/5 transition-all group flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">{String.fromCharCode(65 + i)}</div>
                    <span className="text-lg font-bold">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'socratic' && (
          <motion.div key="soc" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bento-card p-12 border-2 border-error bg-error/5 text-center">
            <div className="w-20 h-20 bg-error text-on-error rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl"><AlertCircle className="w-12 h-12" /></div>
            <h3 className="text-3xl font-black text-error mb-4">FRENO METACOGNITIVO</h3>
            <div className="bg-white p-8 rounded-3xl border border-error/20 mb-8 max-w-2xl mx-auto">
              <p className="text-xl font-medium italic text-on-surface-variant">
                "Detección de Primado Cognitivo: Estás respondiendo por impulso mecánico. ¿Cómo se conecta este problema con la heurística de {latentStrategies[0]?.replace(/_/g, ' ') || 'Verificación Sistemática'} que dominaste antes?"
              </p>
            </div>
            <button onClick={handleRetry} className="px-12 py-5 bg-error text-on-error rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-error/30">Reiniciar Ciclo de Razonamiento</button>
          </motion.div>
        )}

        {phase === 'results' && (
          <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
             <div className="bento-card p-12 text-center border-t-8 border-secondary">
               <h2 className="text-4xl font-black mb-2">Análisis de Desfase</h2>
               <p className="text-on-surface-variant mb-12">Fase 3: Comparación de Rastro de Autopercepción vs Realidad Ejecutiva</p>
               <div className="grid grid-cols-1 gap-4 mb-12 text-left">
                 {challengeQuestions.map((q, i) => {
                   const pValue = perceptions.find(p => p.category === q.category)?.value || 0;
                   const isCorrect = answers[i]?.isCorrect;
                   return (
                     <div key={i} className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                       <div><p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{q.category}</p><p className="text-lg font-bold">{isCorrect ? 'Acierto Técnico' : 'Fallo de Concepto'}</p></div>
                       <div className="flex gap-8 items-center text-center">
                         <div><p className="text-xs font-bold opacity-50 mb-1">Percepción</p><p className="text-2xl font-black text-primary">{pValue*10}%</p></div>
                         <div className="w-px h-10 bg-outline-variant/30" />
                         <div><p className="text-xs font-bold opacity-50 mb-1">Realidad</p><p className={cn("text-2xl font-black", isCorrect ? "text-secondary" : "text-error")}>{isCorrect ? '100%' : '0%'}</p></div>
                       </div>
                     </div>
                   );
                 })}
               </div>
               <button onClick={() => navigate('/')} className="px-12 py-5 bg-secondary text-on-secondary rounded-2xl font-bold shadow-2xl shadow-secondary/30 hover:scale-105 transition-all">Guardar Rastro y Finalizar</button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 text-left">
      <Icon className="w-6 h-6 text-primary mb-3" />
      <h4 className="font-bold text-sm mb-1">{title}</h4>
      <p className="text-[11px] text-on-surface-variant font-medium leading-tight">{desc}</p>
    </div>
  );
}

