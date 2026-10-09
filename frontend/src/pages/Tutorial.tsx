import React from 'react';
import { motion } from 'motion/react';
import { CircleGauge, MousePointerClick, LineChart, ChevronRight, Shuffle, Play } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bento-card overflow-hidden"
      >
        <div className="grid lg:grid-cols-[1.25fr_1fr]">
          {/* Texto */}
          <div className="p-6 sm:p-8 lg:p-10">
            <span className="ui-sans inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-primary bg-primary/10 px-3 py-1 rounded-md">
              Cómo funciona
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-semibold leading-tight text-on-surface">
              Un <span className="text-primary italic">análisis</span>, no una prueba
            </h1>
            <p className="ui-sans mt-2 text-on-surface-variant">
              No se califica. Solo comparas lo que crees con lo que haces.
            </p>

            <ol className="mt-7 space-y-5">
              <Step n="1" icon={CircleGauge} tone="primary" title="Antes" desc="5 preguntas rápidas sobre tu confianza (JOL)." />
              <Step n="2" icon={MousePointerClick} tone="secondary" title="Durante" desc="Un reto interactivo con herramientas de apoyo." />
              <Step n="3" icon={LineChart} tone="tertiary" title="Después" desc="Ves si tu confianza coincidió con tu desempeño." />
            </ol>

            <div className="ui-sans mt-7 flex flex-wrap gap-2 text-xs text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/70 px-3 py-1.5">
                <Shuffle className="w-3.5 h-3.5 text-primary" /> Reto al azar según tu nivel
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/70 px-3 py-1.5">
                <MousePointerClick className="w-3.5 h-3.5 text-primary" /> Elige o escribe y pulsa «Continuar»
              </span>
            </div>
          </div>

          {/* Video */}
          <div className="p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-outline-variant/50 bg-surface-container-low/60 flex flex-col items-center justify-center gap-3">
            <p className="ui-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant flex items-center gap-1.5">
              <Play className="w-3 h-3 fill-current" /> Míralo en acción
            </p>
            <div className="w-full max-w-[250px] aspect-[9/16] rounded-xl overflow-hidden border border-outline-variant bg-surface-container-highest shadow-lg">
              <video
                src="/Instructivoevalaucion.webm"
                controls
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center border-t border-outline-variant/50 px-6 py-5 bg-surface-container-lowest">
          <button
            onClick={startAfterTutorial}
            className="ui-sans w-full sm:w-auto sm:min-w-[260px] inline-flex items-center justify-center gap-2 px-10 py-3.5 bg-primary text-on-primary rounded-md font-semibold text-base hover:opacity-90 active:scale-[0.99] transition"
          >
            Empezar <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const TONES: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  tertiary: 'bg-tertiary/10 text-tertiary',
};

function Step({
  n,
  title,
  desc,
  icon: Icon,
  tone,
}: {
  n: string;
  title: string;
  desc: string;
  tone: keyof typeof TONES;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <li className="flex gap-4 items-start">
      <span className={`ui-sans w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${TONES[tone]}`}>
        {n}
      </span>
      <div>
        <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2 leading-tight">
          {title} <Icon className="w-4 h-4 text-on-surface-variant" />
        </h3>
        <p className="ui-sans text-sm text-on-surface-variant leading-relaxed mt-0.5">{desc}</p>
      </div>
    </li>
  );
}
