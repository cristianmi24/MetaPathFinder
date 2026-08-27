import React from 'react';
import { motion } from 'motion/react';
import { CircleGauge, MousePointerClick, LineChart, ChevronRight } from 'lucide-react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useNavigate } from 'react-router-dom';

export function Tutorial() {
  const navigate = useNavigate();
  const { addEvent, setCurrentLevel, setCurrentChallengeId } = useCognitiveStore();

  const startAfterTutorial = () => {
    setCurrentLevel(1);
    setCurrentChallengeId(null);
    addEvent('PHASE_START', { phase: 'Juicio_Pretest', theme: 'Autopercepción_Programación' });
    navigate('/evaluation-prep');
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bento-card p-8 md:p-10"
      >
        <span className="ui-sans inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          Cómo funciona
        </span>
        <h1 className="text-2xl md:text-3xl font-semibold text-on-surface leading-tight">
          Un <span className="text-primary italic">análisis metacognitivo</span>, no una prueba
        </h1>
        <p className="mt-3 text-on-surface-variant leading-relaxed">
          No se califica y no hay nota. Solo comparamos lo que <em>crees</em> que sabes con lo
          que ocurre cuando lo haces. Son 3 momentos:
        </p>

        <div className="mt-7 grid gap-3">
          <Step
            n="1"
            icon={CircleGauge}
            title="Antes — cómo te sientes"
            desc="Respondes 5 preguntas rápidas sobre tu confianza (JOL). No hay respuestas correctas."
          />
          <Step
            n="2"
            icon={MousePointerClick}
            title="Durante — la actividad"
            desc="Resuelves un reto interactivo: arrastrar, ordenar, escribir o completar código."
          />
          <Step
            n="3"
            icon={LineChart}
            title="Después — tu calibración"
            desc="Ves si tu confianza inicial coincidió con tu desempeño real, y qué ajustar."
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_260px] md:items-start">
          <div className="ui-sans rounded-md border border-outline-variant/60 p-4 text-sm text-on-surface-variant leading-relaxed">
            <p className="mb-2">
              <strong className="text-on-surface">El reto se asigna al azar</strong> según tu nivel
              (Básico, Medio o Avanzado). Cada sesión puede ser distinta.
            </p>
            <p className="font-medium text-on-surface mb-1">Cómo responder las preguntas JOL</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Escala 1–10 o porcentaje: elige el valor y pulsa «Continuar».</li>
              <li>Minutos o intentos: escribe un número y pulsa «Continuar».</li>
              <li>Opciones de texto: haz clic en la frase que te describa.</li>
            </ul>
          </div>

          <div className="rounded-lg overflow-hidden border border-outline-variant/60 bg-surface-container-highest aspect-[9/16] w-full max-w-[260px] mx-auto">
            <video
              src="/Instructivoevalaucion.webm"
              controls
              preload="metadata"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center border-t border-outline-variant/40 pt-6">
          <button
            onClick={startAfterTutorial}
            className="ui-sans px-10 py-3.5 bg-primary text-on-primary rounded-md font-semibold text-base hover:opacity-90 transition-opacity active:scale-[0.99] flex items-center gap-2"
          >
            Empezar <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Step({
  n,
  title,
  desc,
  icon: Icon,
}: {
  n: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex gap-3.5 p-3.5 rounded-md border border-transparent hover:border-outline-variant/50 hover:bg-surface-container transition-colors">
      <div className="ui-sans w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
        {n}
      </div>
      <div>
        <h3 className="font-semibold text-on-surface flex items-center gap-2 text-[0.95rem]">
          {title} <Icon className="w-4 h-4 text-primary/50" />
        </h3>
        <p className="ui-sans text-sm text-on-surface-variant leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
