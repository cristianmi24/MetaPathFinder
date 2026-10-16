import { useEffect } from 'react';

/**
 * Contrato entre los tableros de actividad y la Fase B.
 *
 * - Intento (`attempt: true`): el estudiante pulsó Verificar / Ejecutar / respondió.
 *   Cuenta siempre como run y, si falla, como error. Nunca se deduplica.
 * - Intento parcial (`attempt: true, partial: true`): una pregunta o un paso dentro del tablero.
 *   Cuenta como run (y como error si falla), pero no decide si el tablero quedó completo.
 * - Reporte de estado (sin `attempt`): el tablero cambió de aprobado a no aprobado o al revés
 *   (texto del ensayo, orden tras arrastrar, reiniciar). Solo actualiza el estado; no cuenta.
 *   Si trae `answer`, se registra como BOARD_STATE (trayectoria de la respuesta, sin contar).
 *
 * `answer` (opcional): la respuesta compacta del tablero en ese momento, para medir cuánto cambió
 * entre intentos. Solo ids, opciones o posiciones: nunca texto libre del estudiante (son menores).
 * `item`: en los intentos parciales, la pregunta o paso al que pertenece la respuesta; el cambio
 * (`delta`) se mide contra el intento anterior del mismo ítem.
 */
export type AnswerValue = string | number | boolean | null;
export type BoardAnswer = AnswerValue | AnswerValue[] | Record<string, AnswerValue | AnswerValue[]>;
export type ValidationOpts = { attempt?: boolean; partial?: boolean; answer?: BoardAnswer; item?: string | number };
export type OnValidation = (success: boolean, opts?: ValidationOpts) => void;

export const ATTEMPT: ValidationOpts = { attempt: true };
export const PARTIAL_ATTEMPT: ValidationOpts = { attempt: true, partial: true };

/** Atajos para adjuntar la respuesta: `attempt(answer)`, `partialAttempt(answer, item)`, `stateReport(answer)`. */
export const attempt = (answer: BoardAnswer): ValidationOpts => ({ attempt: true, answer });
export const partialAttempt = (answer: BoardAnswer, item: string | number): ValidationOpts => ({ attempt: true, partial: true, answer, item });
export const stateReport = (answer: BoardAnswer): ValidationOpts => ({ answer });

const MAX_ITEMS = 40;
const MAX_STR = 24;
const clip = (v: AnswerValue): AnswerValue => (typeof v === 'string' ? v.slice(0, MAX_STR) : v);

/** Acota la respuesta para el evento: listas y objetos de hasta 40 elementos, cadenas cortas. */
export function compactAnswer(a: BoardAnswer | undefined): BoardAnswer | undefined {
  if (a === undefined) return undefined;
  if (Array.isArray(a)) return a.slice(0, MAX_ITEMS).map(clip);
  if (a !== null && typeof a === 'object') {
    return Object.fromEntries(Object.entries(a).slice(0, MAX_ITEMS)
      .map(([k, v]) => [k.slice(0, MAX_STR), Array.isArray(v) ? v.slice(0, MAX_ITEMS).map(clip) : clip(v)]));
  }
  return clip(a as AnswerValue);
}

const same = (x: unknown, y: unknown) => JSON.stringify(x) === JSON.stringify(y);

/**
 * Cuánto cambió la respuesta frente al intento anterior:
 * listas → posiciones distintas (más la diferencia de longitud); objetos → claves con otro valor;
 * valores sueltos → 0 o 1. `null` si no hay intento anterior con el que comparar.
 */
export function answerDelta(prev: BoardAnswer | undefined, next: BoardAnswer | undefined): number | null {
  if (prev === undefined || next === undefined) return null;
  if (Array.isArray(prev) && Array.isArray(next)) {
    let d = Math.abs(prev.length - next.length);
    for (let i = 0; i < Math.min(prev.length, next.length); i++) if (!same(prev[i], next[i])) d++;
    return d;
  }
  const isObj = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
  if (isObj(prev) && isObj(next)) {
    const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
    let d = 0;
    keys.forEach(k => { if (!same(prev[k], next[k])) d++; });
    return d;
  }
  return same(prev, next) ? 0 : 1;
}

/** Ensayo y error: casi no cambió nada (≤ 1) y volvió a verificar antes de 5 s de ver el resultado. */
export const TRIAL_ERROR_MAX_DELTA = 1;
export const TRIAL_ERROR_MAX_SECS = 5;
export function isTrialAndError(delta: number | null, secsSinceFeedback: number | null): boolean {
  return delta !== null && secsSinceFeedback !== null && delta <= TRIAL_ERROR_MAX_DELTA && secsSinceFeedback < TRIAL_ERROR_MAX_SECS;
}

/**
 * Script que se inyecta en los tableros con <iframe srcDoc>: la actividad dentro del iframe
 * no llega a la ventana principal, así que se avisa al padre en cada pointerdown / keydown.
 */
export const IFRAME_ACTIVITY_SCRIPT = `<script>
(function(){
  function send(kind, e){
    try { window.parent.postMessage({ type: 'ACTIVITY', kind: kind, x: e.clientX || 0, y: e.clientY || 0 }, '*'); } catch (err) {}
  }
  document.addEventListener('pointerdown', function(e){ send('pointerdown', e); }, true);
  document.addEventListener('keydown', function(e){ send('keydown', e); }, true);
})();
</script>`;

/**
 * Escucha los resultados que publican los tableros en iframe:
 * `QUIZ_SUCCESS` / `QUIZ_FAIL` / `EVAL_SUCCESS` / `EVAL_FAIL`, con `attempt: true` cuando
 * el mensaje viene de un botón de verificar (si no, es un reporte de estado), `partial: true`
 * cuando es un paso dentro del tablero y, opcionalmente, `answer` / `item`.
 */
export function useIframeValidation(onValidation?: OnValidation) {
  useEffect(() => {
    if (!onValidation) return;
    const handleMessage = (event: MessageEvent) => {
      const type = event.data?.type;
      const d = event.data ?? {};
      const opts: ValidationOpts | undefined = d.attempt
        ? { attempt: true, partial: Boolean(d.partial), answer: d.answer, item: d.item }
        : d.answer !== undefined ? { answer: d.answer } : undefined;
      if (type === 'QUIZ_SUCCESS' || type === 'EVAL_SUCCESS') onValidation(true, opts);
      else if (type === 'QUIZ_FAIL' || type === 'EVAL_FAIL') onValidation(false, opts);
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onValidation]);
}
