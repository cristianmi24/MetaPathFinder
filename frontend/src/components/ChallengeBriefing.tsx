import { motion } from 'motion/react';
import {
  ArrowRight, BookOpen, Clock, LifeBuoy, ListChecks, Lightbulb, Shuffle,
  Sparkles, Target, TriangleAlert, Wrench,
} from 'lucide-react';
import type { getChallengeBriefing } from '../data/challengeBriefings';

type Briefing = ReturnType<typeof getChallengeBriefing>;

interface ChallengeBriefingProps {
  titulo: string;
  nivel: string;
  subNivel: string;
  componente: string;
  briefing: Briefing;
  isRetryVariation: boolean;
  onBegin: () => void;
}

const cap = (t: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);

const REMEMBER_ICONS = [
  { icon: Lightbulb, tone: 'bg-warning/10 text-warning' },
  { icon: TriangleAlert, tone: 'bg-tertiary/10 text-tertiary' },
  { icon: Wrench, tone: 'bg-secondary/10 text-secondary' },
];

const Chip = ({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'primary' | 'warning' }) => (
  <span
    className={
      'ui-sans inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ' +
      (tone === 'primary'
        ? 'bg-primary/10 text-primary border-primary/20'
        : tone === 'warning'
          ? 'bg-warning/10 text-warning border-warning/25'
          : 'bg-surface-container-lowest/70 text-on-surface-variant border-outline-variant/70')
    }
  >
    {children}
  </span>
);

export function ChallengeBriefing({
  titulo, nivel, subNivel, componente, briefing, isRetryVariation, onBegin,
}: ChallengeBriefingProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Cabecera del reto */}
      <motion.section
        id="tour-assignment"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bento-card relative overflow-hidden"
      >
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-primary/12 via-transparent to-secondary/10">
          <span aria-hidden className="pointer-events-none absolute -right-10 -bottom-12 w-48 h-48 rounded-full bg-primary/10 blur-2xl" />
          <span aria-hidden className="pointer-events-none absolute right-24 -top-10 w-32 h-32 rounded-full bg-secondary/10 blur-2xl" />
          <Sparkles aria-hidden className="pointer-events-none absolute right-6 bottom-5 w-20 h-20 text-primary/15 hidden sm:block" />
          <div className="flex flex-wrap gap-2">
            <Chip tone="primary">Nivel {nivel} · {subNivel}</Chip>
            {componente && <Chip>{componente}</Chip>}
            {briefing.tiempoSugerido && (
              <Chip><Clock className="w-3.5 h-3.5" /> {briefing.tiempoSugerido}</Chip>
            )}
            {isRetryVariation ? (
              <Chip tone="warning"><LifeBuoy className="w-3.5 h-3.5" /> Variación de apoyo</Chip>
            ) : (
              <Chip><Shuffle className="w-3.5 h-3.5" /> Reto al azar</Chip>
            )}
          </div>

          <h1 className="font-serif mt-5 text-2xl sm:text-4xl font-semibold leading-tight text-on-surface">{titulo}</h1>
          <p className="ui-sans mt-3 max-w-2xl text-on-surface-variant leading-relaxed line-clamp-2">
            {briefing.saludo}
          </p>
        </div>
      </motion.section>

      <div id="tour-briefing" className="space-y-5">
        {/* Aprenderás + Meta */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: BookOpen, tone: 'bg-primary/10 text-primary', label: 'Aprenderás', text: briefing.queVasAprender },
            { icon: Target, tone: 'bg-secondary/10 text-secondary', label: 'Tu meta', text: cap(briefing.tareaConcreta) },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
              className="bento-card p-5 flex gap-4 items-start"
            >
              <span className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${c.tone}`}>
                <c.icon className="w-5 h-5" />
              </span>
              <div>
                <p className="ui-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">{c.label}</p>
                <p className="ui-sans mt-1 text-sm text-on-surface leading-relaxed">{c.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pasos */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bento-card p-5 sm:p-6"
        >
          <h2 className="font-serif text-lg font-semibold text-on-surface flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" /> Pasos
          </h2>
          <ol className="mt-4 space-y-0">
            {briefing.pasosDetallados.map((step: string, i: number, arr: string[]) => (
              <li key={i} className="relative flex gap-4 pb-4 last:pb-0">
                {i < arr.length - 1 && (
                  <span aria-hidden className="absolute left-[15px] top-8 bottom-0 w-px bg-outline-variant" />
                )}
                <span className="ui-sans relative z-10 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <p className="ui-sans text-sm text-on-surface leading-relaxed pt-1">{step.replace(/^\d+\.\s*/, '')}</p>
              </li>
            ))}
          </ol>
        </motion.section>

        {/* Recuerda */}
        <div className="grid gap-3 md:grid-cols-3">
          {briefing.recuerda.map((item: string, i: number) => {
            const r = REMEMBER_ICONS[i % REMEMBER_ICONS.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="rounded-xl border border-outline-variant/60 bg-surface-container-low/60 p-4 flex gap-3 items-start"
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${r.tone}`}>
                  <r.icon className="w-4 h-4" />
                </span>
                <p className="ui-sans text-xs text-on-surface-variant leading-relaxed">{item}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Iniciar preguntas */}
        <div id="tour-begin-jol" className="flex justify-center pt-1">
          <button
            type="button"
            onClick={onBegin}
            className="ui-sans w-full sm:w-auto sm:min-w-[280px] inline-flex items-center justify-center gap-2 rounded-md bg-primary px-10 py-3.5 text-base font-semibold text-on-primary hover:opacity-90 active:scale-[0.99] transition"
          >
            Comenzar preguntas <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
