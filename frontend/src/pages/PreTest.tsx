import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code2, ChevronRight, Brain, Target, BarChart3, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface PerceptionQuestion {
  id: number;
  category: string;
  text: string;
}

const preTestQuestions: PerceptionQuestion[] = [
  {
    id: 1,
    category: "Lógica y Condicionales",
    text: "¿Cómo te sientes resolviendo problemas que implican múltiples condiciones anidadas (if/else)?"
  },
  {
    id: 2,
    category: "Ciclos e Iteración",
    text: "¿Qué tan seguro te sientes al implementar bucles complejos y controlar su terminación?"
  },
  {
    id: 3,
    category: "Estructuras de Datos",
    text: "¿Qué tanto dominas el acceso y la manipulación de datos en arreglos y matrices?"
  },
  {
    id: 4,
    category: "Pensamiento Algorítmico",
    text: "¿Cómo calificarías tu capacidad para descomponer un problema complejo en pasos lógicos?"
  }
];

export function PreTest() {
  const [step, setStep] = useState<'intro' | 'perception' | 'results'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [perceptions, setPerceptions] = useState<{ category: string, value: number }[]>([]); 
  const [currentPerception, setCurrentPerception] = useState(5);
  
  const { addEvent, updateCognitiveMetrics } = useCognitiveStore();
  const navigate = useNavigate();

  const handleStart = () => {
    setStep('perception');
    addEvent('PHASE_START', { phase: 'Juicio_Pretest', theme: 'Autopercepción_Programación' });
  };

  const handlePerceptionSubmit = () => {
    const newPerceptions = [...perceptions, { category: preTestQuestions[currentIdx].category, value: currentPerception }];
    setPerceptions(newPerceptions);
    
    if (currentIdx < preTestQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setCurrentPerception(5);
    } else {
      completePhase(newPerceptions);
    }
  };

  const completePhase = (finalPerceptions: any[]) => {
    // Average confidence (Initial Calibration)
    const avgConfidence = finalPerceptions.reduce((a, b) => a + b.value, 0) / finalPerceptions.length / 10; 
    
    // In Phase 1, score is actually just their self-estimation
    updateCognitiveMetrics(0.3, avgConfidence);
    
    addEvent('EVALUATION_COMPLETED', {
      phase: 'Juicio_Pretest',
      theme: 'Autopercepción_Programación',
      perceptions: finalPerceptions,
      calibration: avgConfidence,
      latent_strategy: 'PREVENTIVE_LOAD_MANAGEMENT'
    });

    setStep('results');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="bento-card p-12 text-center"
          >
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Brain className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Fase 1: Juicio de Autopercepción</h2>
            <p className="text-lg text-on-surface-variant mb-10 max-w-xl mx-auto font-medium">
              Antes de enfrentarte al código, calibraremos tu propia percepción sobre tus habilidades. Esta es la base de la meta-cognición.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 text-left">
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                <Target className="w-5 h-5 text-primary mb-2" />
                <h4 className="font-bold text-xs uppercase tracking-widest opacity-60">Foco</h4>
                <p className="text-sm font-bold">Auto-estimación</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                <Code2 className="w-5 h-5 text-secondary mb-2" />
                <h4 className="font-bold text-xs uppercase tracking-widest opacity-60">Dominio</h4>
                <p className="text-sm font-bold">Programación</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                <BarChart3 className="w-5 h-5 text-tertiary mb-2" />
                <h4 className="font-bold text-xs uppercase tracking-widest opacity-60">Variable</h4>
                <p className="text-sm font-bold">Confianza Base</p>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="px-12 py-5 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 mx-auto"
            >
              Iniciar Percepción <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}

        {step === 'perception' && (
          <motion.div
            key="perception"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-10">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                {preTestQuestions[currentIdx].category}
              </div>
              <h3 className="text-3xl font-bold tracking-tight mb-2">{preTestQuestions[currentIdx].text}</h3>
              <p className="text-on-surface-variant font-medium">Pregunta {currentIdx + 1} de {preTestQuestions.length}</p>
            </div>

            <div className="bento-card p-12 bg-white border border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between mb-8 px-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                  <div key={val} className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-1 h-3 rounded-full",
                      currentPerception >= val ? "bg-primary" : "bg-outline-variant"
                    )} />
                    <span className={cn(
                      "text-[10px] font-bold",
                      currentPerception === val ? "text-primary scale-125 font-black" : "text-outline"
                    )}>{val}</span>
                  </div>
                ))}
              </div>
              
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={currentPerception}
                onChange={(e) => setCurrentPerception(parseInt(e.target.value))}
                className="w-full h-4 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary mb-12"
              />

              <div className="flex justify-between items-center p-8 bg-primary/5 rounded-3xl border border-primary/10">
                <div className="text-left">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Nivel de Confianza</p>
                  <p className="text-4xl font-black text-on-surface">{currentPerception} <span className="text-lg opacity-40">/ 10</span></p>
                </div>
                <button
                  onClick={handlePerceptionSubmit}
                  className="px-10 py-5 bg-primary text-on-primary rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-primary/20 hover:translate-y-[-2px] active:translate-y-0 transition-all"
                >
                  {currentIdx === preTestQuestions.length - 1 ? 'Finalizar Juicio' : 'Siguiente'} <Send className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bento-card p-12 text-center border-t-8 border-secondary"
          >
            <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Juicio Completado</h2>
            <p className="text-on-surface-variant font-medium mb-12 max-w-md mx-auto">
              Tu rastro de autopercepción ha sido guardado. Ahora estás listo para el desafío real: compararemos tu percepción con tu ejecución técnica.
            </p>

            <div className="bg-surface-container-low p-8 rounded-3xl mb-12">
               <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Confianza Meta-Cognitiva Media</p>
               <p className="text-5xl font-black text-secondary">
                 {((perceptions.reduce((a,b)=>a+b.value,0)/perceptions.length) * 10).toFixed(0)}%
               </p>
            </div>

            <button
              onClick={() => navigate('/')}
              className="px-10 py-5 bg-secondary text-on-secondary rounded-2xl font-bold shadow-xl shadow-secondary/30 hover:scale-105 transition-all flex items-center gap-3 mx-auto"
            >
              Regresar al Perfil <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
