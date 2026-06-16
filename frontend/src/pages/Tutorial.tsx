import React from 'react';
import { motion } from 'motion/react';
import { Target, Zap, ShieldCheck, ChevronRight, Sparkles, MousePointerClick, ListOrdered } from 'lucide-react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useNavigate } from 'react-router-dom';

export function Tutorial() {
  const navigate = useNavigate();
  const { addEvent, setCurrentLevel, setCurrentChallengeId } = useCognitiveStore();

  const startDiagnosisAfterTutorial = () => {
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
                <Sparkles className="w-4 h-4" /> Guía de inicio
              </div>
              <h3 className="text-4xl font-black text-on-surface tracking-tight leading-tight">
                ¿Cómo funciona este <span className="text-primary italic">diagnóstico</span>?
              </h3>
              <p className="text-on-surface-variant font-medium text-lg leading-relaxed">
                No es un examen tradicional. Es un entorno de <strong>diagnóstico metacognitivo</strong> que mapea tus fortalezas, lagunas y cómo calibras tu propia confianza antes y después de cada actividad.
              </p>

              <div className="space-y-4">
                <TutorialStep
                  number="1"
                  title="Fase A: Autopercepción (preguntas JOL)"
                  desc="Antes del reto verás 5 preguntas de juicio de aprendizaje (JOL). Responde con honestidad: desliza el control, escribe un número o haz clic en la opción que mejor te describa. No hay respuestas correctas."
                  icon={Target}
                />
                <TutorialStep
                  number="2"
                  title="Fase B: Actividad interactiva"
                  desc="Resolverás un reto en pantalla: ordenar bloques, arrastrar elementos, escribir un texto o completar código. Lee las instrucciones paso a paso que aparecen antes de comenzar."
                  icon={Zap}
                />
                <TutorialStep
                  number="3"
                  title="Fase C: Calibración y retroalimentación"
                  desc="El sistema compara tu confianza inicial con tu desempeño real y te muestra si estabas bien calibrado, sobreconfiado o subestimado."
                  icon={ShieldCheck}
                />
              </div>

              <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant/20 space-y-3">
                <h4 className="font-bold text-on-surface flex items-center gap-2 text-sm">
                  <ListOrdered className="w-4 h-4 text-primary" /> ¿Cómo se elige tu reto?
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  El sistema selecciona <strong>aleatoriamente</strong> un reto de nivel Básico, Medio o Avanzado (según tu progreso), priorizando actividades N1 o N2 del componente curricular. Cada sesión puede ser diferente.
                </p>
              </div>

              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/20 space-y-3">
                <h4 className="font-bold text-on-surface flex items-center gap-2 text-sm">
                  <MousePointerClick className="w-4 h-4 text-primary" /> Cómo responder las preguntas JOL
                </h4>
                <ul className="text-xs text-on-surface-variant space-y-2 list-disc pl-4 leading-relaxed">
                  <li><strong>Escala numérica (1–10):</strong> mueve el deslizador y pulsa «Continuar».</li>
                  <li><strong>Porcentaje (0 %–100 %):</strong> ajusta el control hasta el valor que sientas y confirma.</li>
                  <li><strong>Número (minutos o intentos):</strong> escribe un valor y pulsa «Continuar».</li>
                  <li><strong>Opciones de texto:</strong> haz clic en la frase que mejor te represente; se resaltará en color. Luego pulsa «Continuar».</li>
                </ul>
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
              onClick={startDiagnosisAfterTutorial}
              className="px-16 py-6 bg-primary text-on-primary rounded-[2rem] font-black text-2xl shadow-2xl shadow-primary/40 hover:scale-105 transition-all active:scale-95 flex items-center gap-4"
            >
              Entendido, ¡empecemos! <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function TutorialStep({ number, title, desc, icon: Icon }: { number: string; title: string; desc: string; icon: React.ComponentType<{ className?: string }> }) {
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