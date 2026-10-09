import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, Clock, MousePointer2, Play } from 'lucide-react';
import type { Estrategia } from '../data/metacognitiveStrategies';
import { getStrategyBenefit } from '../data/strategyBenefits';

/* ───────────────── Tipos de escala (se detectan por el texto de la escala) ───────────────── */

export type ScaleType = 'slider' | 'number' | 'options' | 'percent';

export interface JolItem {
  id: string;
  pregunta: string;
  escala: string;
}

export function detectScaleType(escala: string): ScaleType {
  if (/numérico/i.test(escala)) return 'number';
  if (/%/.test(escala) && /\d+\s*%?\s*[–-]\s*\d+\s*%/.test(escala)) return 'percent';
  if (/·/.test(escala) && !/\d\s*[–=-]\s*\d/.test(escala)) return 'options';
  if (/·/.test(escala) && /\d\s*[=]\s*/.test(escala)) return 'options';
  if (/\d+\s*[–-]\s*\d+/.test(escala)) return 'slider';
  return 'slider';
}

function parseSliderRange(escala: string): { min: number; max: number } {
  const match = escala.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (match) return { min: parseInt(match[1]), max: parseInt(match[2]) };
  return { min: 1, max: 10 };
}

function parseOptions(escala: string): string[] {
  return escala.split('·').map((s) => s.trim()).filter((s) => s.length > 0);
}

/** Color semántico de 0 (rojo suave) a 1 (verde) usando los tokens del sistema. */
const scaleColor = (t: number) =>
  t < 0.5
    ? `color-mix(in srgb, var(--warn) ${Math.round(t * 200)}%, var(--danger))`
    : `color-mix(in srgb, var(--ok) ${Math.round((t - 0.5) * 200)}%, var(--warn))`;

const tint = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

/* ───────────────────────────── Pregunta ───────────────────────────── */

/**
 * Todas las preguntas se responden con un valor numérico del 1 al 10.
 * La única excepción es la estimación de tiempo, que se escribe en minutos.
 */
type Kind = 'scale' | 'minutes';

const kindOf = (escala: string): Kind => (detectScaleType(escala) === 'number' && /min/i.test(escala) ? 'minutes' : 'scale');

const INSTRUCTIONS: Record<Kind, { s1: string; s2: string; line: string }> = {
  scale: {
    s1: 'Toca un número del 1 al 10',
    s2: 'Pulsa «Continuar»',
    line: 'Toca el número del 1 al 10 que mejor te represente y pulsa «Continuar».',
  },
  minutes: {
    s1: 'Escribe los minutos o toca uno',
    s2: 'Pulsa «Continuar»',
    line: 'Escribe cuántos minutos crees que tardarás (o toca una sugerencia) y pulsa «Continuar».',
  },
};

interface Legend {
  low: { n: number; label: string };
  high: { n: number; label: string };
  neutral: boolean;
}

const capitalize = (t: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);

/**
 * Muchas preguntas traen la leyenda dentro del texto: «(1 = muy inseguro · 10 = totalmente seguro)».
 * Se separa del enunciado para mostrarla debajo de los círculos con los números en círculo.
 */
function splitQuestion(pregunta: string): { text: string; legend: Legend | null } {
  const m = pregunta.match(/\(\s*(\d+)\s*=\s*([^·)]+?)\s*·\s*(\d+)\s*=\s*([^)]+?)\s*\)/);
  if (!m) return { text: pregunta, legend: null };
  const text = pregunta.replace(m[0], '').replace(/\s{2,}/g, ' ').replace(/\s+([?.!,])/g, '$1').trim();
  return {
    text,
    legend: {
      low: { n: parseInt(m[1]), label: capitalize(m[2]) },
      high: { n: parseInt(m[3]), label: capitalize(m[4]) },
      neutral: false,
    },
  };
}

/** Extremos de la escala 1–10 cuando la leyenda no viene en el texto de la pregunta. */
function legendFor(escala: string): Legend {
  if (/intentos/i.test(escala)) {
    return { low: { n: 1, label: 'Pocos intentos' }, high: { n: 10, label: 'Muchos intentos' }, neutral: true };
  }
  if (detectScaleType(escala) === 'options') {
    const labels = parseOptions(escala).map((o) => o.replace(/^\d+\s*=\s*/, ''));
    if (labels.length >= 2) {
      return { low: { n: 1, label: labels[0] }, high: { n: 10, label: labels[labels.length - 1] }, neutral: false };
    }
  }
  return { low: { n: 1, label: 'Muy inseguro' }, high: { n: 10, label: 'Totalmente seguro' }, neutral: false };
}

interface JolQuestionProps {
  item: JolItem;
  index: number;
  total: number;
  value: number | string | undefined;
  onChange: (v: number | string) => void;
  onConfirm: (v: number | string) => void;
  challengeTitle: string;
}

export function JolQuestion({ item, index, total, value, onChange, onConfirm, challengeTitle }: JolQuestionProps) {
  const kind = kindOf(item.escala);
  const { text: questionText, legend: questionLegend } = splitQuestion(item.pregunta);
  const ready =
    kind === 'minutes' ? value !== undefined && value !== '' && parseInt(String(value)) > 0 : value !== undefined && value !== '';

  const confirm = () => {
    if (!ready) return;
    onConfirm(kind === 'minutes' ? parseInt(String(value)) : (value as number));
  };

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-9rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
      {/* Columna principal */}
      <div className="flex flex-col items-center gap-7 text-center">
        {/* Progreso: puntos redondos */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2.5" aria-label={`Pregunta ${index + 1} de ${total}`}>
            {Array.from({ length: total }, (_, i) => {
              const done = i < index;
              const current = i === index;
              return (
                <span
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: current ? 16 : 11,
                    height: current ? 16 : 11,
                    background: done ? 'var(--ok)' : current ? 'var(--accent)' : 'transparent',
                    border: done || current ? 'none' : '2px solid var(--border)',
                    boxShadow: current ? `0 0 0 5px ${tint('var(--accent)', 22)}` : 'none',
                  }}
                />
              );
            })}
          </div>
          <p className="ui-sans text-xs text-on-surface-variant">
            Pregunta {index + 1} de {total} · <span className="opacity-80">{challengeTitle}</span>
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex w-full flex-col items-center gap-8"
          >
            <div className="space-y-3">
              <h2 className="font-serif text-2xl font-semibold leading-snug text-on-surface sm:text-3xl lg:text-4xl">{questionText}</h2>
              <p className="ui-sans text-sm text-on-surface-variant sm:text-base">{INSTRUCTIONS[kind].line}</p>
            </div>

            {kind === 'scale' ? (
              <Circles legend={questionLegend ?? legendFor(item.escala)} value={value as number | undefined} onChange={onChange} />
            ) : (
              <MinutesInput value={value} onChange={onChange} onEnter={confirm} />
            )}
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          id="jol-continue"
          onClick={confirm}
          disabled={!ready}
          className="ui-sans inline-flex items-center justify-center gap-2 rounded-full bg-primary px-12 py-4 text-lg font-semibold text-on-primary shadow-lg shadow-primary/20 transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
        >
          {index + 1 === total ? 'Terminar' : 'Continuar'} <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Ejemplo animado de cómo responder */}
      <HowTo kind={kind} />
    </div>
  );
}

/* Escala del 1 al 10: círculos grandes de color */
function Circles({ legend, value, onChange }: { legend: Legend; value: number | undefined; onChange: (v: number) => void }) {
  const numbers = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="grid w-full max-w-xl grid-cols-5 gap-3 sm:gap-4">
        {numbers.map((n, i) => {
          const c = legend.neutral ? 'var(--accent)' : scaleColor(i / 9);
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(n)}
              className="ui-sans mx-auto flex aspect-square w-full max-w-[5rem] items-center justify-center rounded-full text-xl font-semibold transition-all hover:scale-110 sm:text-2xl"
              style={
                selected
                  ? { background: c, color: 'var(--bg)', border: `3px solid ${c}`, transform: 'scale(1.12)', boxShadow: `0 10px 24px ${tint(c, 50)}` }
                  : { background: tint(c, legend.neutral ? 8 + i * 2 : 15), color: c, border: `3px solid ${tint(c, 38)}` }
              }
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="ui-sans flex w-full max-w-xl items-center justify-between gap-4 text-xs text-on-surface-variant sm:text-sm">
        {([['low', 0], ['high', 9]] as const).map(([side, idx]) => {
          const item = legend[side];
          const c = legend.neutral ? 'var(--accent)' : scaleColor(idx / 9);
          const badge = (
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: tint(c, legend.neutral && side === 'low' ? 14 : 22), color: c, border: `2px solid ${tint(c, 55)}` }}
            >
              {item.n}
            </span>
          );
          return (
            <span key={side} className={`inline-flex items-center gap-2 ${side === 'high' ? 'flex-row-reverse text-right' : 'text-left'}`}>
              {badge}
              <span className="leading-tight">{item.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* Minutos: píldora grande + sugerencias redondas */
function MinutesInput({ value, onChange, onEnter }: { value: number | string | undefined; onChange: (v: string) => void; onEnter: () => void }) {
  const presets = [5, 10, 15, 20, 25, 30];
  const val = value === undefined ? '' : String(value);
  const valid = val !== '' && parseInt(val) > 0;
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="flex items-center gap-4 rounded-full px-10 py-3 transition-colors"
        style={{ border: `3px solid ${valid ? 'var(--accent)' : 'var(--border)'}`, background: tint('var(--accent)', valid ? 8 : 0) }}
      >
        <input
          ref={ref}
          type="number"
          min={1}
          max={999}
          value={val}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onEnter()}
          placeholder="0"
          className="w-32 bg-transparent text-center font-serif text-6xl font-semibold text-on-surface outline-none placeholder:text-on-surface-variant/40"
        />
        <span className="ui-sans text-base font-medium text-on-surface-variant">minutos</span>
      </div>
      <div className="flex max-w-md flex-wrap justify-center gap-3">
        {presets.map((p, i) => {
          const c = scaleColor(i / (presets.length - 1));
          const selected = val === String(p);
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(String(p))}
              className="ui-sans flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold transition-all hover:scale-110"
              style={selected ? { background: c, color: 'var(--bg)', border: `3px solid ${c}`, boxShadow: `0 8px 18px ${tint(c, 45)}` } : { background: tint(c, 13), color: c, border: `3px solid ${tint(c, 35)}` }}
            >
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────── Ejemplo animado: cómo se marca una respuesta ───────────── */

// Ciclo de la animación (0 → 1): llega el cursor, marca, se activa «Continuar», lo pulsa y reinicia.
const T = [0, 0.2, 0.28, 0.45, 0.6, 0.68, 0.74, 0.88, 1];
const LOOP = { duration: 6, repeat: Infinity, repeatDelay: 0.3, ease: 'easeInOut' as const, times: T };

const SELECTED_OPACITY = [0, 0, 1, 1, 1, 1, 1, 0, 0];
const SELECTED_SCALE = [1, 1, 1.28, 1.28, 1.28, 1.28, 1.28, 1, 1];
const PILL_OPACITY = [0.35, 0.35, 1, 1, 1, 1, 1, 0.35, 0.35];
const PILL_SCALE = [1, 1, 1, 1, 1, 0.92, 1, 1, 1];
const CURSOR_OPACITY = [0, 1, 1, 1, 1, 1, 1, 0, 0];
const STEP1 = [0.35, 1, 1, 1, 0.35, 0.35, 0.35, 0.35, 0.35];
const STEP2 = [0.35, 0.35, 0.35, 0.35, 1, 1, 1, 0.35, 0.35];

// Posiciones del cursor (px dentro del escenario de 300×170): inicio, objetivo, botón «Continuar», salida.
const path = (tx: number, ty: number) => ({
  x: [250, tx, tx, tx, 150, 150, 150, 150, 250],
  y: [14, ty, ty, ty, 140, 140, 140, 140, 14],
});

function HowTo({ kind }: { kind: Kind }) {
  const ins = INSTRUCTIONS[kind];
  // Escala: marca el 7 (círculo n.º 7 de 10). Minutos: toca la sugerencia «10».
  const cursor = kind === 'minutes' ? path(110, 84) : path(197, 58);

  return (
    <aside className="hidden lg:flex">
      <div className="w-full rounded-[2rem] border border-outline-variant/60 bg-surface-container-low/60 p-6">
        <p className="ui-sans mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
          <Play className="h-3 w-3 fill-current" /> Así se responde
        </p>

        <div className="relative mx-auto" style={{ width: 300, height: 170 }}>
          {kind === 'scale' ? (
            Array.from({ length: 10 }, (_, i) => {
              const c = scaleColor(i / 9);
              return (
                <div
                  key={i}
                  className="ui-sans absolute flex items-center justify-center rounded-full text-[10px] font-semibold"
                  style={{ left: 3 + i * 30, top: 44, width: 24, height: 24, background: tint(c, 16), color: c, border: `2px solid ${tint(c, 40)}` }}
                >
                  {i + 1}
                  {i === 6 && (
                    <motion.div
                      className="absolute -inset-0.5 flex items-center justify-center rounded-full"
                      style={{ background: c, color: 'var(--bg)', boxShadow: `0 6px 14px ${tint(c, 50)}` }}
                      animate={{ opacity: SELECTED_OPACITY, scale: SELECTED_SCALE }}
                      transition={LOOP}
                    >
                      7
                    </motion.div>
                  )}
                </div>
              );
            })
          ) : (
            <>
              <div
                className="absolute flex items-center justify-center rounded-full font-serif text-2xl font-semibold text-on-surface"
                style={{ left: 75, top: 10, width: 150, height: 44, border: '2px solid var(--border)' }}
              >
                <span className="text-on-surface-variant/40">0</span>
                <motion.span className="absolute" animate={{ opacity: SELECTED_OPACITY }} transition={LOOP}>
                  10
                </motion.span>
              </div>
              {[5, 10, 15, 20, 25].map((n, i) => {
                const c = scaleColor(i / 4);
                return (
                  <div
                    key={n}
                    className="absolute flex items-center justify-center rounded-full text-xs font-semibold"
                    style={{ left: 40 + i * 44, top: 66, width: 36, height: 36, background: tint(c, 14), color: c, border: `2px solid ${tint(c, 38)}` }}
                  >
                    {n}
                    {n === 10 && (
                      <motion.div
                        className="absolute -inset-0.5 flex items-center justify-center rounded-full"
                        style={{ background: c, color: 'var(--bg)' }}
                        animate={{ opacity: SELECTED_OPACITY, scale: SELECTED_SCALE }}
                        transition={LOOP}
                      >
                        10
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Botón «Continuar» de ejemplo */}
          <motion.div
            className="ui-sans absolute flex items-center justify-center rounded-full bg-primary text-xs font-semibold text-on-primary"
            style={{ left: 90, top: 124, width: 120, height: 32 }}
            animate={{ opacity: PILL_OPACITY, scale: PILL_SCALE }}
            transition={LOOP}
          >
            Continuar
          </motion.div>

          {/* Cursor */}
          <motion.div
            className="pointer-events-none absolute left-0 top-0 text-on-surface"
            animate={{ x: cursor.x, y: cursor.y, opacity: CURSOR_OPACITY }}
            transition={LOOP}
          >
            <MousePointer2 className="h-6 w-6 fill-current drop-shadow-md" />
          </motion.div>
        </div>

        <ol className="ui-sans mt-5 space-y-2 text-sm text-on-surface">
          <motion.li animate={{ opacity: STEP1 }} transition={LOOP} className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">1</span>
            {ins.s1}
          </motion.li>
          <motion.li animate={{ opacity: STEP2 }} transition={LOOP} className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">2</span>
            {ins.s2}
          </motion.li>
        </ol>

        <p className="ui-sans mt-4 border-t border-outline-variant/50 pt-3 text-xs text-on-surface-variant">
          No hay respuestas correctas ni incorrectas: elige lo que realmente sientes.
        </p>
      </div>
    </aside>
  );
}

/* ───────────────────────────── Pantalla "listo" ───────────────────────────── */

interface JolReadyProps {
  minutes: string;
  strategy: Estrategia | null;
  randomly: boolean;
  onStart: () => void;
}

export function JolReady({ minutes, strategy, randomly, onStart }: JolReadyProps) {
  const benefit = strategy ? getStrategyBenefit(strategy.id) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-2xl flex-col items-center justify-center gap-5 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/15 text-secondary">
        <Check className="h-7 w-7" strokeWidth={2.5} />
      </span>
      <div>
        <h2 className="font-serif text-2xl font-semibold text-on-surface sm:text-3xl">Listo para empezar</h2>
        <p className="ui-sans mt-2 inline-flex items-center gap-1.5 rounded-full border border-outline-variant/70 px-3 py-1 text-xs text-on-surface-variant">
          <Clock className="h-3.5 w-3.5" /> ~{minutes} min
        </p>
      </div>

      {strategy && (
        <div
          id="tour-strategy"
          className="w-full rounded-[2rem] border p-5 sm:p-6"
          style={{ background: strategy.iconBg, borderColor: `${strategy.color}55` }}
        >
          <div className="flex items-center justify-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ background: `${strategy.color}22`, color: strategy.color }}
            >
              <i className={`ti ${strategy.icon}`} style={{ fontSize: 22 }} />
            </span>
            <div className="text-left">
              <p className="ui-sans text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: strategy.color }}>
                El sistema eligió para ti{randomly ? ' (al azar)' : ''}
              </p>
              <p className="font-serif text-lg font-semibold leading-snug text-on-surface">{strategy.nombre}</p>
            </div>
          </div>

          {benefit && (
            <p className="ui-sans mt-3 text-sm leading-relaxed text-on-surface">
              <strong style={{ color: strategy.color }}>Te ayuda a: </strong>
              {benefit.paraQue}
            </p>
          )}

          <div className="mt-4 grid gap-3 text-left sm:grid-cols-2">
            {strategy.herramientas.map((h) => (
              <div
                key={h.id}
                className="rounded-2xl p-3.5"
                style={{ background: 'color-mix(in srgb, var(--surface) 70%, transparent)', border: `1px solid ${strategy.color}33` }}
              >
                <p className="ui-sans flex items-center gap-2 text-sm font-semibold text-on-surface">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full"
                    style={{ background: `${strategy.color}1c`, color: strategy.color }}
                  >
                    <i className={`ti ${h.icon}`} />
                  </span>
                  {h.nombre}
                </p>
                <p className="ui-sans mt-1.5 text-xs leading-relaxed text-on-surface-variant">
                  {benefit?.herramientas[h.id] ?? h.descripcion}
                </p>
              </div>
            ))}
          </div>

          <p className="ui-sans mt-4 text-xs text-on-surface-variant">
            {benefit?.cuando} Las encontrarás arriba de la actividad, en el botón <strong>«Herramientas de apoyo»</strong>.
          </p>
        </div>
      )}

      <button
        type="button"
        id="tour-start-challenge"
        onClick={onStart}
        className="ui-sans inline-flex items-center justify-center gap-2 rounded-full bg-primary px-10 py-3.5 text-base font-semibold text-on-primary transition hover:opacity-90 active:scale-[0.98]"
      >
        Empezar el reto <ArrowRight className="h-5 w-5" />
      </button>
    </motion.div>
  );
}
