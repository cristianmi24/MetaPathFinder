export interface EarlySupportSignals {
  pausa_larga?: boolean;
  ediciones_sin_exito?: boolean;
}

/**
 * Ofrece una pregunta de apoyo de bajo nivel cuando aparece una señal temprana
 * observable, sin esperar a que el estudiante acumule errores. La ayuda no
 * diagnostica bloqueo: invita a revisar el siguiente paso y puede descartarse.
 */
export function shouldOfferEarlySupport(
  signals: EarlySupportSignals,
  isDone = false,
): boolean {
  return !isDone && (Boolean(signals.pausa_larga) || Boolean(signals.ediciones_sin_exito));
}
