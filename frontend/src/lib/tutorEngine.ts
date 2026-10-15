/**
 * Motor del tutor en el cliente.
 *
 * Replica, con los mismos parámetros que sirve el backend (/api/tutor/domain),
 * los cálculos que deben ocurrir en tiempo real sin ida y vuelta al servidor:
 * probabilidad de bloqueo (Naive Bayes de dos clases), escalera de andamiaje
 * N0–N4, freno metacognitivo personalizado y estilo de aprendizaje abreviado.
 * Con 50 estudiantes simultáneos esto evita una petición por cada evento.
 */
import type { TutorDomain } from '../services/api';

/* ---------------------------------------------------------------------------
 * Parámetros por defecto (idénticos a backend-python/app/services/tutor/domain.py)
 * ------------------------------------------------------------------------- */
export const DEFAULT_BLOCKING_PRIOR = 0.2;
export const DEFAULT_BLOCKING_SIGNALS: Record<string, { blocked: number; flowing: number }> = {
  errores_seguidos: { blocked: 0.8, flowing: 0.2 },
  pausa_larga: { blocked: 0.7, flowing: 0.3 },
  ediciones_sin_exito: { blocked: 0.6, flowing: 0.3 },
  cambio_pestana: { blocked: 0.4, flowing: 0.15 },
};

export type ScaffoldLevel = 'N0' | 'N1' | 'N2' | 'N3' | 'N4';

export interface BlockingSignals {
  errores_seguidos: boolean;
  pausa_larga: boolean;
  ediciones_sin_exito: boolean;
  cambio_pestana: boolean;
}

const clip = (p: number) => Math.min(0.98, Math.max(0.02, p));

/** P(bloqueado | señales). Las cuatro señales se consideran observadas (sí/no). */
export function blockingProbability(signals: Partial<BlockingSignals>, domain?: TutorDomain | null): number {
  const table = domain?.blocking_signals ?? DEFAULT_BLOCKING_SIGNALS;
  const prior = domain?.blocking_prior ?? DEFAULT_BLOCKING_PRIOR;
  let lb = Math.log(prior);
  let lf = Math.log(1 - prior);
  for (const [k, v] of Object.entries(table)) {
    const on = Boolean((signals as Record<string, boolean | undefined>)[k]);
    lb += Math.log(on ? clip(v.blocked) : 1 - clip(v.blocked));
    lf += Math.log(on ? clip(v.flowing) : 1 - clip(v.flowing));
  }
  const m = Math.max(lb, lf);
  const wb = Math.exp(lb - m);
  const wf = Math.exp(lf - m);
  return wb / (wb + wf);
}

/** Escalera de Wood: más ayuda si falla, menos si avanza. */
export function scaffoldLevel(pBlock: number, consecutiveHigh = 0): ScaffoldLevel | null {
  if (pBlock >= 0.7) return consecutiveHigh >= 2 ? 'N3' : 'N2';
  if (pBlock >= 0.55) return 'N1';
  if (pBlock >= 0.4) return 'N0';
  return null;
}

export const SCAFFOLD_INFO: Record<ScaffoldLevel, { name: string; tactic: string; tacticLabel: string }> = {
  N0: { name: 'Pregunta metacognitiva', tactic: 'pregunta_socratica', tacticLabel: 'Pregunta socrática' },
  N1: { name: 'Orientación', tactic: 'senalamiento', tacticLabel: 'Señalamiento del error' },
  N2: { name: 'Recordatorio estratégico', tactic: 'recordatorio_estrategia', tacticLabel: 'Recordatorio de estrategia' },
  N3: { name: 'Paso parcial', tactic: 'ejemplo_resuelto', tacticLabel: 'Desglose paso a paso' },
  N4: { name: 'Solución explicada', tactic: 'solucion_guiada', tacticLabel: 'Solución análoga guiada' },
};

/* ---------------------------------------------------------------------------
 * Freno metacognitivo personalizado
 * ------------------------------------------------------------------------- */
export const BRAKE_COLD_START_SECONDS = 5;   // umbral fijo mientras hay < 3 muestras
export const BRAKE_FLOOR_SECONDS = 2;        // nunca por debajo de 2 s
export const BRAKE_MIN_SAMPLES = 3;

/** Umbral del freno: la mitad de la mediana de las latencias propias (con piso y arranque en frío). */
export function brakeThreshold(samples: number[]): number {
  if (samples.length < BRAKE_MIN_SAMPLES) return BRAKE_COLD_START_SECONDS;
  const sorted = [...samples].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return Math.max(BRAKE_FLOOR_SECONDS, median / 2);
}

export function isImpulsive(latencySeconds: number, samples: number[]): boolean {
  return latencySeconds < brakeThreshold(samples);
}

/* ---------------------------------------------------------------------------
 * Pausa larga relativa al propio ritmo (en lugar de 30 s fijos)
 * ------------------------------------------------------------------------- */
export function longPauseThreshold(pauseSamples: number[], fallbackSeconds = 30): number {
  if (pauseSamples.length < 3) return fallbackSeconds;
  const mean = pauseSamples.reduce((a, b) => a + b, 0) / pauseSamples.length;
  return Math.max(10, mean * 2);
}

/* ---------------------------------------------------------------------------
 * Estilo de aprendizaje (Felder-Silverman, versión abreviada de 8 ítems)
 * ------------------------------------------------------------------------- */
export interface StyleItem {
  id: string;
  dimension: 'vv' | 'gs';
  question: string;
  a: string; // opción que puntúa +1 (visual / global)
  b: string; // opción que puntúa −1 (verbal / secuencial)
}

export const STYLE_ITEMS: StyleItem[] = [
  { id: 'vv1', dimension: 'vv', question: 'Cuando aprendo algo nuevo, me ayuda más…', a: 'un diagrama, un esquema o una imagen', b: 'una explicación escrita o hablada' },
  { id: 'vv2', dimension: 'vv', question: 'Recuerdo mejor…', a: 'lo que vi', b: 'lo que leí o escuché' },
  { id: 'vv3', dimension: 'vv', question: 'Si me explican cómo armar algo, prefiero…', a: 'un video o un dibujo de los pasos', b: 'instrucciones escritas paso a paso' },
  { id: 'vv4', dimension: 'vv', question: 'Cuando pienso en un problema, lo veo como…', a: 'imágenes o mapas mentales', b: 'palabras y frases' },
  { id: 'gs1', dimension: 'gs', question: 'Al resolver un reto, prefiero…', a: 'ver primero el panorama completo y luego los detalles', b: 'avanzar paso a paso, en orden' },
  { id: 'gs2', dimension: 'gs', question: 'Entiendo mejor un tema cuando…', a: 'conecto ideas de distintas partes, aunque salte entre ellas', b: 'sigo una secuencia lógica sin saltos' },
  { id: 'gs3', dimension: 'gs', question: 'Cuando navego un curso en línea, me gusta…', a: 'saltar libremente entre temas', b: 'seguir el botón "siguiente"' },
  { id: 'gs4', dimension: 'gs', question: 'Suelo resolver problemas…', a: 'de repente, "me cae la idea" aunque no sepa explicar los pasos', b: 'con pasos claros que puedo explicar uno a uno' },
];

export function scoreLearningStyle(answers: Record<string, 'a' | 'b'>): { visual_verbal: number; global_sequential: number; label: string } {
  const score = (dim: 'vv' | 'gs') => {
    const items = STYLE_ITEMS.filter((i) => i.dimension === dim);
    const sum = items.reduce((acc, i) => acc + (answers[i.id] === 'a' ? 1 : answers[i.id] === 'b' ? -1 : 0), 0);
    return Math.max(-1, Math.min(1, sum / items.length));
  };
  const vv = score('vv');
  const gs = score('gs');
  return {
    visual_verbal: vv,
    global_sequential: gs,
    label: `${vv >= 0 ? 'Visual' : 'Verbal'} · ${gs >= 0 ? 'Global' : 'Secuencial'}`,
  };
}

/* ---------------------------------------------------------------------------
 * Concepciones erróneas: el mismo error frecuente repetido en varios retos
 * ------------------------------------------------------------------------- */
export function detectMisconception(errorsByChallenge: Record<string, number>, commonErrorText: Record<string, string>): { challengeId: string; text: string; count: number } | null {
  let best: { challengeId: string; text: string; count: number } | null = null;
  for (const [id, count] of Object.entries(errorsByChallenge)) {
    if (count >= 2 && commonErrorText[id] && (!best || count > best.count)) {
      best = { challengeId: id, text: commonErrorText[id], count };
    }
  }
  return best;
}

export const LEVEL_SHORT: Record<string, string> = { basico: 'Básico', medio: 'Medio', avanzado: 'Avanzado' };
export const PROFILE_LABEL: Record<string, string> = { over: 'Sobreconfianza', sub: 'Subestimación', cal: 'Calibrado' };
