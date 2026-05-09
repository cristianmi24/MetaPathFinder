import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code2, ChevronRight, Brain, Target, BarChart3, ArrowLeft, Send, AlertCircle, Quote } from 'lucide-react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface Question {
  id: number;
  category: string;
  text: string;
  options: string[];
  correctIndex: number;
}

const challengeQuestions: Question[] = [
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

export function CognitiveChallenge() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'socratic' | 'results'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ category: string, isCorrect: boolean }[]>([]);
  const [isBrakeActive, setIsBrakeActive] = useState(false);
  
  const { addEvent, updateCognitiveMetrics, events, latentStrategies } = useCognitiveStore();
  const navigate = useNavigate();

  // Find pre-test perceptions for comparison
  const preTestEvent = events.find(e => e.metadata?.phase === 'Juicio_Pretest');
  const perceptions = preTestEvent?.metadata?.perceptions || [];

  const handleStart = () => {
    setStep('quiz');
    addEvent('PHASE_START', { phase: 'Desafío_Cognitivo', theme: 'Fundamentos_Técnicos' });
  };

  const handleAnswerSelect = (optionIdx: number) => {
    const now = Date.now();
    const lastEventTime = useCognitiveStore.getState().lastEventTime;
    const duration = now - lastEventTime;
    
    // Metacognitive Brake logic (Dynamic Threshold)
    if (duration < 5000) {
      setIsBrakeActive(true);
      addEvent('QUIZ_ANSWER', { 
        is_reflexive_brake: true, 
        duration_ms: duration,
        theme: challengeQuestions[currentIdx].category,
        transfer_prompt: `Detección de Impulsividad: Tu latencia de procesamiento (${(duration/1000).toFixed(1)}s) es inferior al umbral de razonamiento profundo.`
      });
      setStep('socratic');
      return;
    }

    processAnswer(optionIdx);
  };

  const processAnswer = (optionIdx: number) => {
    const isCorrect = optionIdx === challengeQuestions[currentIdx].correctIndex;
    const newAnswers = [...answers, { category: challengeQuestions[currentIdx].category, isCorrect }];
    setAnswers(newAnswers);
    setIsBrakeActive(false);
    
    if (currentIdx < challengeQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setStep('quiz');
    } else {
      completePhase(newAnswers);
    }
  };

  const completePhase = (finalAnswers: { category: string, isCorrect: boolean }[]) => {
    const correctCount = finalAnswers.filter(a => a.isCorrect).length;
    const scorePercent = (correctCount / challengeQuestions.length) * 100;
    
    // Average confidence from phase 1
    const avgPerception = perceptions.reduce((a: any, b: any) => a + b.value, 0) / perceptions.length / 10;
    const currentCalibration = scorePercent / 100;

    // Detect Metacognitive Mismatch: High score but low previous calibration
    updateCognitiveMetrics(0.75, currentCalibration, scorePercent);
    
    addEvent('EVALUATION_COMPLETED', {
      phase: 'Desafío_Cognitivo',
      theme: 'Fundamentos_Técnicos',
      score: scorePercent,
      calibration: currentCalibration,
      initial_perception: avgPerception,
      calibration_gap: Number((avgPerception - currentCalibration).toFixed(2)),
      latent_strategy: scorePercent > 70 ? 'STRUCTURAL_MAPPING' : 'SYSTEMATIC_VERIFICATION'
    });

    setStep('results');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bento-card p-12 text-center"
          >
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-primary/20">
              <Zap className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Fase 2: Desafío Cognitivo</h2>
            <p className="text-lg text-on-surface-variant mb-10 max-w-xl mx-auto font-medium">
              Validaremos tus habilidades técnicas en tiempo real. Compararemos tu ejecución con el juicio de valor que emitiste en la fase anterior.
            </p>
            <button
              onClick={handleStart}
              className="px-12 py-5 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 mx-auto"
            >
              Iniciar Evaluación Técnica <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}

        {step === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
               <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                 <span className="text-xs font-bold uppercase tracking-widest text-primary">{challengeQuestions[currentIdx].category}</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold opacity-50 uppercase">Tu Percepción Inicial:</span>
                 <span className="text-xs font-black text-secondary">
                   {perceptions.find((p:any) => p.category === challengeQuestions[currentIdx].category)?.value || '?'} / 10
                 </span>
               </div>
            </div>

            <div className="bento-card p-10 bg-white border-2 border-primary/5 shadow-xl">
              <h3 className="text-2xl font-bold mb-10 text-on-surface leading-tight">
                {challengeQuestions[currentIdx].text}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {challengeQuestions[currentIdx].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswerSelect(i)}
                    className="p-6 text-left rounded-2xl border-2 border-outline-variant/20 hover:border-primary hover:bg-primary/5 transition-all group flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="text-lg font-bold">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 'socratic' && (
          <motion.div
            key="socratic"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bento-card p-12 border-2 border-error bg-error/5 text-center"
          >
            <div className="w-20 h-20 bg-error text-on-error rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black text-error mb-4">FRENO METACOGNITIVO</h3>
            
            <div className="bg-white p-8 rounded-3xl border border-error/20 mb-8 max-w-2xl mx-auto">
              <p className="text-xl font-medium italic text-on-surface-variant">
                "Detección de Primado Cognitivo: Estás respondiendo por impulso mecánico. ¿Cómo se conecta este problema con la heurística de {latentStrategies[0]?.replace(/_/g, ' ') || 'Verificación Sistemática'} que dominaste antes?"
              </p>
            </div>

            <button
               onClick={() => setStep('quiz')}
               className="px-12 py-5 bg-error text-on-error rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-error/30"
            >
              Reiniciar Ciclo de Razonamiento
            </button>
          </motion.div>
        )}

        {step === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
             <div className="bento-card p-12 text-center border-t-8 border-secondary">
               <h2 className="text-4xl font-black mb-2">Resultados de Calibración</h2>
               <p className="text-on-surface-variant mb-12">Mapa comparativo: Autopercepción (Fase 1) vs Realidad Técnica (Fase 2)</p>
               
               <div className="grid grid-cols-1 gap-4 mb-12 text-left">
                 {challengeQuestions.map((q, i) => {
                   const pValue = perceptions.find((p:any) => p.category === q.category)?.value || 0;
                   const isCorrect = answers[i]?.isCorrect;
                   const gap = (pValue / 10) - (isCorrect ? 1 : 0);
                   
                   return (
                     <div key={i} className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                       <div>
                         <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{q.category}</p>
                         <p className="text-lg font-bold">{isCorrect ? 'Éxito Técnico' : 'Fallo de Concepto'}</p>
                       </div>
                       <div className="flex gap-8 items-center">
                         <div className="text-center">
                           <p className="text-xs font-bold opacity-50 mb-1">Percepción</p>
                           <p className="text-2xl font-black text-primary">{pValue*10}%</p>
                         </div>
                         <div className="w-px h-10 bg-outline-variant/30" />
                         <div className="text-center">
                           <p className="text-xs font-bold opacity-50 mb-1">Realidad</p>
                           <p className={cn("text-2xl font-black", isCorrect ? "text-secondary" : "text-error")}>
                             {isCorrect ? '100%' : '0%'}
                           </p>
                         </div>
                         <div className="w-px h-10 bg-outline-variant/30" />
                         <div className="text-center">
                           <p className="text-xs font-bold opacity-50 mb-1">Gap</p>
                           <p className="text-2xl font-black text-on-surface">{Math.abs(gap).toFixed(1)}</p>
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>

               <button
                 onClick={() => navigate('/')}
                 className="px-12 py-5 bg-secondary text-on-secondary rounded-2xl font-bold shadow-2xl shadow-secondary/30 hover:scale-105 transition-all"
               >
                 Guardar Rastro y Volver al Perfil
               </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
