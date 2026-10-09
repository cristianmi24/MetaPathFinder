import { motion } from 'motion/react';
import {
  Brain, ArrowRight, Heart, ShieldCheck, Play, Coffee, CheckCircle2,
  BookOpen, ListChecks, Laptop, Lightbulb, Target, Clock,
} from 'lucide-react';
import { cn } from '../lib/utils';

const HELP_CARDS = [
  { icon: Brain, tone: 'primary', title: 'Conocerte como aprendiz', text: 'Descubre qué tan bien calibras tu confianza.' },
  { icon: Target, tone: 'secondary', title: 'Estrategias que sí funcionan', text: 'Prueba herramientas de metacognición mientras haces retos.' },
  { icon: Coffee, tone: 'tertiary', title: 'Sin presión de nota', text: 'Importa cómo piensas, no si aciertas a la primera.' },
  { icon: ShieldCheck, tone: 'warning', title: 'Retos variados y justos', text: 'El sistema te asigna un reto al azar de tu nivel.' },
] as const;

const TODO_STEPS = [
  { icon: BookOpen, tone: 'primary', title: 'Leer con calma', text: 'Te explicamos el reto paso a paso.' },
  { icon: ListChecks, tone: 'secondary', title: 'Responder', text: 'Preguntas cortas, sin respuestas correctas.' },
  { icon: Laptop, tone: 'tertiary', title: 'Hacer una actividad', text: 'Usas herramientas de tecnología con apoyo.' },
  { icon: Lightbulb, tone: 'warning', title: 'Reflexionar', text: 'Al final eliges una estrategia para el siguiente nivel.' },
] as const;

const TONES: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  tertiary: 'bg-tertiary/10 text-tertiary',
  warning: 'bg-warning/10 text-warning',
};

const JOURNEY = ['Autopercepción', 'Actividad', 'Reflexión'];

interface StudentHomeProps {
  name: string;
  hasStarted: boolean;
  level: number;
  /** [autopercepción, actividad, reflexión] completadas */
  steps: boolean[];
  ctaLabel: string;
  onBegin: () => void;
  metrics: { calibration: number; load: number; readiness: number };
}

export function StudentHome({ name, hasStarted, level, steps, ctaLabel, onBegin, metrics }: StudentHomeProps) {
  const current = steps.findIndex((done) => !done);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-4">
      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-on-surface">¡Hola, {name}!</h1>
        <p className="ui-sans text-on-surface-variant mt-1">Tu espacio personal en Meta-Pathfinder</p>
      </motion.header>

      {/* Misión de hoy + recorrido */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bento-card overflow-hidden grid lg:grid-cols-[1.45fr_1fr]"
      >
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
          <span className="ui-sans inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-primary bg-primary/10 px-3 py-1 rounded-md">
            Tu misión de hoy
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl lg:text-[2.1rem] font-semibold leading-tight text-on-surface max-w-xl">
            Explora <span className="text-primary italic">cómo aprendes</span> y descubre qué estrategias funcionan mejor para ti.
          </h2>
          <p className="ui-sans mt-3 text-on-surface-variant max-w-lg leading-relaxed">
            Harás un reto adaptado a tu nivel. No te preocupes: no se califica, aquí importa tu proceso.
          </p>
          <div className="hidden sm:flex absolute right-6 top-6 w-12 h-12 rounded-full bg-warning/15 text-warning items-center justify-center">
            <Lightbulb className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-outline-variant/50 bg-surface-container-low/60 flex flex-col gap-6">
          <button
            type="button"
            onClick={onBegin}
            className="ui-sans w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-md bg-primary text-on-primary font-semibold text-base hover:opacity-90 active:scale-[0.99] transition"
          >
            <Play className="w-4 h-4 fill-current" /> {ctaLabel} <ArrowRight className="w-4 h-4" />
          </button>

          <div>
            <p className="ui-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant mb-4">
              Tu recorrido{hasStarted ? ` · Nivel ${level}` : ''}
            </p>
            <ol className="grid grid-cols-3 gap-2">
              {JOURNEY.map((label, i) => {
                const done = steps[i];
                const isCurrent = !done && i === current && hasStarted;
                return (
                  <li key={label} className="relative flex flex-col items-center text-center gap-1.5">
                    {i > 0 && (
                      <span
                        aria-hidden
                        className={cn(
                          'absolute top-3.5 right-1/2 w-full h-0.5',
                          steps[i - 1] ? 'bg-secondary' : 'bg-outline-variant/70'
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        'relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ui-sans',
                        done && 'bg-secondary text-on-secondary',
                        isCurrent && 'bg-primary text-on-primary ring-4 ring-primary/20',
                        !done && !isCurrent && 'bg-surface-container-high text-on-surface-variant'
                      )}
                    >
                      {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </span>
                    <span className="ui-sans text-xs font-semibold text-on-surface leading-tight">{label}</span>
                    <span className="ui-sans text-[11px] text-on-surface-variant leading-tight">
                      {done ? 'Completado' : isCurrent ? 'En curso' : hasStarted ? 'Pendiente' : i === 0 ? 'Aún no empiezas' : 'Te guiamos'}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </motion.section>

      {/* Tranquilidad */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-secondary/30 bg-secondary/10 p-4 sm:p-5 flex items-center gap-4"
      >
        <span className="w-11 h-11 rounded-full bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5" />
        </span>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-on-surface">Tranquilo: esto no se califica</h3>
          <p className="ui-sans text-sm text-on-surface-variant leading-relaxed">
            Meta-Pathfinder es un análisis metacognitivo: solo mira cómo aprendes. No hay respuestas trampa ni castigo por equivocarte.
          </p>
        </div>
      </motion.section>

      {/* Cómo te ayuda */}
      <section>
        <h3 className="text-lg font-semibold text-on-surface mb-3">¿Cómo te ayuda esto?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HELP_CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.04 }}
              className="bento-card p-4 flex flex-col gap-3"
            >
              <span className={cn('w-10 h-10 rounded-full flex items-center justify-center', TONES[c.tone])}>
                <c.icon className="w-5 h-5" />
              </span>
              <div>
                <p className="ui-sans text-sm font-semibold text-on-surface leading-snug">{c.title}</p>
                <p className="ui-sans text-xs text-on-surface-variant leading-relaxed mt-1">{c.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Qué vas a hacer */}
      <section className="bento-card p-5 sm:p-6">
        <h3 className="text-lg font-semibold text-on-surface mb-5">¿Qué vas a hacer?</h3>
        <ol className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-4">
          {TODO_STEPS.map((st, i) => (
            <li key={st.title} className="relative flex md:flex-col items-start gap-3">
              <span className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ui-sans shrink-0', TONES[st.tone])}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p className="ui-sans text-sm font-semibold text-on-surface flex items-center gap-2">
                  <st.icon className="w-4 h-4 text-primary shrink-0" /> {st.title}
                </p>
                <p className="ui-sans text-xs text-on-surface-variant leading-relaxed mt-1">{st.text}</p>
              </div>
              {i < TODO_STEPS.length - 1 && (
                <ArrowRight aria-hidden className="hidden md:block absolute -right-3 top-2 w-4 h-4 text-outline" />
              )}
            </li>
          ))}
        </ol>
        <p className="ui-sans mt-5 flex items-center gap-2.5 rounded-lg bg-primary/5 border border-primary/15 px-4 py-3 text-sm italic text-on-surface-variant">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          Tómate el tiempo que necesites. No hay cronómetro que te apure.
        </p>
      </section>

      {/* Métricas (solo si ya avanzó) */}
      {hasStarted && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Tu calibración', value: metrics.calibration, hint: 'Qué tan alineada está tu confianza con tu desempeño' },
            { label: 'Esfuerzo mental', value: metrics.load, hint: 'Solo informativo: no es bueno ni malo' },
            { label: 'Preparación', value: metrics.readiness, hint: 'Cómo vas integrando lo aprendido' },
          ].map((m) => (
            <div key={m.label} className="bento-card p-4 text-center">
              <p className="ui-sans text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">{m.label}</p>
              <p className="text-3xl font-semibold text-on-surface mt-1">{m.value}%</p>
              <p className="ui-sans text-xs text-on-surface-variant mt-1">{m.hint}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
