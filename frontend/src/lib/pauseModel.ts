/**
 * Umbral de "pausa larga" relativo al propio ritmo del estudiante.
 *
 * Solo cuentan las pausas TERMINADAS (su duración final, al volver la actividad). Antes se
 * guardaba una muestra cada 15 s de la pausa en curso (15, 30, 45…), así que el umbral
 * (2 × media) crecía con la misma pausa y casi nunca la alcanzaba: a los 101 s el umbral
 * ya iba en ~105 s y la señal `pausa_larga` del Naive Bayes no se encendía.
 *
 * Módulo sin dependencias: se prueba con `npm run test:unit` (node --test).
 */
export const MIN_PAUSE_SECS = 5;      // las micro-pausas entre clics no describen el ritmo de pensar
export const MAX_PAUSE_SAMPLES = 20;
export const DEFAULT_LONG_PAUSE_SECS = 30;

export function longPauseThreshold(pauseSamples: number[], fallbackSeconds = DEFAULT_LONG_PAUSE_SECS): number {
  if (pauseSamples.length < 3) return fallbackSeconds;
  const mean = pauseSamples.reduce((a, b) => a + b, 0) / pauseSamples.length;
  return Math.max(10, mean * 2);
}

/** Añade una pausa terminada (en segundos) a la ventana de muestras; ignora las micro-pausas. */
export function recordFinishedPause(pauseSamples: number[], seconds: number): number[] {
  if (!(seconds >= MIN_PAUSE_SECS)) return pauseSamples;
  return [...pauseSamples.slice(-(MAX_PAUSE_SAMPLES - 1)), Math.round(seconds)];
}
