import React from 'react';
import { motion } from 'motion/react';
import { Target, Zap, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useNavigate } from 'react-router-dom';

export function Tutorial() {
  const navigate = useNavigate();
  const { addEvent, setCurrentLevel, setCurrentChallengeId } = useCognitiveStore();

  const startEvaluationAfterTutorial = () => {
    setCurrentLevel(1);
    setCurrentChallengeId(null);
    addEvent('PHASE_START', { phase: 'Juicio_Pretest', theme: 'Autopercepción_Programación' });
    navigate('/evaluation-prep');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-8"
      >
        <div className="bento-card p-12 bg-white border-2 border-primary/10 shadow-2xl rounded-[2.5rem]">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="w-4 h-4" /> Guía de Supervivencia Cognitiva
              </div>
              <h3 className="text-4xl font-black text-on-surface tracking-tight leading-tight">
                ¿Cómo funciona esta <span className="text-primary italic">Evaluación</span>?
              </h3>
              <p className="text-on-surface-variant font-medium text-lg leading-relaxed">
                No es un examen tradicional. Es un entorno de <strong>calibración intensa</strong> diseñado para mapear tus fortalezas y puntos ciegos.
              </p>

              <div className="space-y-4">
                <TutorialStep
                  number="1"
                  title="Fase A: Autopercepción"
                  desc="Te presentamos el tema y nos dices qué tan seguro te sientes (1-10) antes de ver el reto."
                  icon={Target}
                />
                <TutorialStep
                  number="2"
                  title="Fase B: Ejecución Técnica"
                  desc="Resuelves el desafío técnico en un contexto real (Médico, Gaming, E-commerce, etc)."
                  icon={Zap}
                />
                <TutorialStep
                  number="3"
                  title="Protocolo de Andamiaje"
                  desc="Si fallas, te damos una segunda oportunidad con un contexto diferente. Si fallas de nuevo, bloqueamos el nodo para que no te frustres."
                  icon={ShieldCheck}
                />
              </div>
            </div>

            <div className="w-full md:w-[350px] aspect-[9/16] bg-surface-container-highest rounded-[3rem] border-8 border-on-surface shadow-2xl relative overflow-hidden">
              <video
                src="/Instructivoevalaucion.webm"
                controls
                preload="metadata"
                className="w-full h-full object-cover absolute inset-0"
              />
            </div>
          </div>

          <div className="mt-12 flex justify-center pt-8 border-t border-outline-variant/10">
            <button
              onClick={startEvaluationAfterTutorial}
              className="px-16 py-6 bg-primary text-on-primary rounded-[2rem] font-black text-2xl shadow-2xl shadow-primary/40 hover:scale-105 transition-all active:scale-95 flex items-center gap-4"
            >
              Entendido, ¡Empecemos! <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function TutorialStep({ number, title, desc, icon: Icon }: { number: string; title: string; desc: string; icon: any }) {
  return (
    <div className="flex gap-4 p-4 hover:bg-surface-container transition-colors rounded-2xl border border-transparent hover:border-outline-variant/10">
      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">
        {number}
      </div>
      <div>
        <h4 className="font-bold text-on-surface flex items-center gap-2">
          {title} <Icon className="w-4 h-4 text-primary/60" />
        </h4>
        <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
