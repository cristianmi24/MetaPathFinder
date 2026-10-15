import { motion } from 'motion/react';
import { Gauge } from 'lucide-react';
import './tutor.css';

export const CERTAINTY_OPTIONS = [
  { id: 'dudoso', label: 'Dudoso/a', value: 3, hint: 'Creo que falta algo' },
  { id: 'confiado', label: 'Confiado/a', value: 6, hint: 'Probablemente está bien' },
  { id: 'seguro', label: 'Seguro/a', value: 9, hint: 'Estoy casi seguro/a' },
] as const;

export type CertaintyValue = (typeof CERTAINTY_OPTIONS)[number]['value'];

interface Props {
  open: boolean;
  onAnswer: (value: CertaintyValue, label: string) => void;
}

/** Juicio de certeza (COP) justo antes de verificar: se contrasta después con el resultado. */
export function CertaintyPrompt({ open, onAnswer }: Props) {
  if (!open) return null;
  return (
    <div className="tut-dim" role="dialog" aria-modal="true" aria-label="¿Qué tan seguro estás de tu respuesta?">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tut-modal" style={{ maxWidth: 440 }}>
        <span className="tut-chip accent"><Gauge size={11} /> Juicio de certeza</span>
        <h3>Antes de verificar: ¿qué tan seguro/a estás de tu respuesta?</h3>
        <p>No afecta tu puntaje. Sirve para comparar lo que crees con lo que pasa, y afinar tu calibración.</p>
        <div className="tut-certainty">
          {CERTAINTY_OPTIONS.map((o) => (
            <button key={o.id} type="button" onClick={() => onAnswer(o.value, o.label)}>
              <b>{o.label}</b>
              <small>{o.hint}</small>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/** Mensaje de contraste confianza declarada vs. resultado (escala 0-10 vs 0-100). */
export function certaintyContrast(certainty: number | null, label: string | null, score: number): string | null {
  if (certainty === null || label === null) return null;
  const perf = score / 10;
  const gap = certainty - perf;
  if (Math.abs(gap) <= 1.5) return `Marcaste «${label}» (${certainty}/10) y obtuviste ${score}/100: tu juicio estuvo bien calibrado.`;
  if (gap > 0) return `Marcaste «${label}» (${certainty}/10) y obtuviste ${score}/100: te sentías más seguro/a de lo que mostró el resultado. Revisa qué criterio diste por hecho.`;
  return `Marcaste «${label}» (${certainty}/10) y obtuviste ${score}/100: sabías más de lo que creías. Confía un poco más en lo que ya dominas.`;
}
