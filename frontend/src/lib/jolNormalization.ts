import { jolGenerales } from '../data/jolGenerales';

// Opciones de texto de los JOL generales de "nivel de dominio" (JG-B3/M3/A3),
// distribuidas uniformemente en 0-10 — debe coincidir con CAPACITY_MAP del backend
// (backend-python/app/services/calibration.py).
const CAPACITY_OPTIONS: Record<string, number[]> = {
  'JG-B3': [1, 3.3, 6.6, 10],
  'JG-M3': [2.5, 5, 7.5, 10],
  'JG-A3': [1, 3.3, 6.6, 10],
};

export function clamp010(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(10, value));
}

/**
 * Normaliza un valor crudo de JOL (que puede venir en escalas MUY distintas:
 * 1-10 directo, minutos estimados sin límite, número de intentos, porcentaje 0-100,
 * u opciones de texto) a una escala común 0-10.
 *
 * Promediar valores crudos de distintas escalas sin pasar por esta función es la causa
 * de calibraciones imposibles como "27/10": un estimado de "45 minutos" para JG-B2 no es
 * comparable con una respuesta "8" en una escala 1-10.
 */
export function normalizeJolValue(jolId: string, value: number | string, tiempoEstimado?: number): number {
  if (typeof value === 'string') {
    const numMatch = value.match(/^(\d+)=/);
    if (numMatch) {
      const n = parseInt(numMatch[1]);
      const maxOpts = value.split('=').length > 0 ? Math.max(n, 4) : 5;
      return clamp010(((n - 1) / (maxOpts - 1)) * 10);
    }
    const opts = CAPACITY_OPTIONS[jolId];
    if (opts) {
      const idx = jolGenerales
        .find(j => j.id === jolId)
        ?.escala.split('·')
        .map(s => s.trim())
        .findIndex(o => o.toLowerCase() === value.toLowerCase().trim());
      if (idx !== undefined && idx >= 0 && idx < opts.length) return clamp010(opts[idx]);
    }
    return 5;
  }

  const general = jolGenerales.find(j => j.id === jolId);
  if (general) {
    if (/min/i.test(general.escala)) {
      const maxTime = tiempoEstimado || 15;
      return clamp010(10 - (value / maxTime) * 10);
    }
    if (/intentos/i.test(general.escala)) {
      const maxAttempts = 10;
      return clamp010(10 - (value / maxAttempts) * 10);
    }
    if (/%/.test(general.escala)) {
      return clamp010(value / 10);
    }
  }

  // Sin metadata (p.ej. JOL específico de reto): asumir que ya viene en 0-10 si cabe ahí,
  // o en 0-5 si el máximo observado sugiere esa escala. Nunca se devuelve sin acotar.
  if (value >= 0 && value <= 10) return value;
  if (value > 10 && value <= 100) return clamp010(value / 10);
  return clamp010(value);
}

/**
 * Promedia un conjunto de respuestas JOL (id -> valor crudo) normalizando cada una
 * según su propia escala antes de promediar. Siempre devuelve un número en [0, 10].
 */
export function normalizeJolAverage(jolAnswers: Record<string, number | string>, tiempoEstimado?: number): number {
  const entries = Object.entries(jolAnswers || {});
  if (entries.length === 0) return 5;
  const values = entries.map(([id, val]) => normalizeJolValue(id, val, tiempoEstimado));
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return clamp010(avg);
}
