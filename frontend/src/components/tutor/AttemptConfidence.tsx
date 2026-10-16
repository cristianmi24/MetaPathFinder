import { Gauge, X } from 'lucide-react';

interface Props {
  value: number | null;
  onPick: (value: number) => void;
  onDismiss: () => void;
}

/**
 * Confianza por intento: barra de 1 a 10 encima del tablero, de un toque, antes de «Verificar».
 * No bloquea: si el estudiante verifica sin tocarla, el intento queda con `confidence: null`.
 * Se muestra por muestreo (≈1 de cada 3 intentos, nunca dos seguidos) para no cansar.
 * En el celular la escala ocupa todo el ancho y cada número mide ~32×40 px (toque con el dedo).
 */
export function AttemptConfidence({ value, onPick, onDismiss }: Props) {
  return (
    <div role="group" aria-label="Antes de verificar: qué tan seguro/a estás, del 1 al 10"
      className="shrink-0 border-b border-outline-variant/60 bg-primary-container/30 px-3 py-2 font-sans text-on-surface">
      <div className="flex items-center gap-2">
        <Gauge size={16} className="shrink-0 text-primary" aria-hidden="true" />
        <span className="min-w-0 flex-1 text-xs font-semibold leading-snug sm:text-sm">
          {value === null ? 'Antes de verificar: ¿qué tan seguro/a estás?' : `Tu confianza: ${value}/10. Ahora verifica.`}
        </span>
        <button type="button" onClick={onDismiss} aria-label="Ocultar"
          className="-mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container sm:h-8 sm:w-8">
          <X size={16} />
        </button>
      </div>
      <div className="mt-1 grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button key={n} type="button" onClick={() => onPick(n)} aria-pressed={value === n} aria-label={`${n} de 10`}
            className={`h-10 rounded-lg text-sm font-semibold tabular-nums transition-colors sm:h-8 sm:text-xs ${
              value !== null && n <= value ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-container'
            }`}>{n}</button>
        ))}
      </div>
      <div className="mt-0.5 flex justify-between text-[10px] text-on-surface-variant" aria-hidden="true">
        <span>nada seguro/a</span><span>totalmente</span>
      </div>
    </div>
  );
}
