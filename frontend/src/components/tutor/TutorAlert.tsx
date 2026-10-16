import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Lightbulb, Sparkles, Target, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { SCAFFOLD_INFO, type ScaffoldLevel } from '../../lib/tutorEngine';

type HintLevel = 1 | 2 | 3;

export interface TutorAlertProps {
  scaffold: ScaffoldLevel | null;
  activeHint: HintLevel | null;
  checkpointDue: boolean;
  consecutiveErrors: number;
  isDone: boolean;
  /** Mensaje del tutor para el estado actual (el mismo del panel lateral). */
  message: string;
  hintTitle: (level: HintLevel) => string;
  hintText: (level: HintLevel) => string;
  goal?: string;
  reasons: string[];
  jolInicial?: number;
  ratings: Partial<Record<HintLevel, boolean>>;
  hintOpened: (level: HintLevel) => boolean;
  onOpenHint: (level: HintLevel) => void;
  onRateHint: (level: HintLevel, helpful: boolean) => void;
  onCheckpoint: (value: number) => void;
  /** Cierre de la alerta: cuánto estuvo abierta y cómo se cerró (latencia de lectura / descarte). */
  onDismiss?: (info: AlertDismissal) => void;
  /** Autoinforme de estado en los puntos de control (un toque). */
  onAffect?: (affect: AffectId) => void;
  /**
   * Hay un modal bloqueante abierto (replanificación, juicio de certeza, pista, resultado).
   * Una intervención a la vez: la alerta queda en espera y aparece al cerrarse el modal,
   * en lugar de quedar debajo sin poder tocarse.
   */
  blocked?: boolean;
}

export type AlertKind = 'scaffold' | 'hint' | 'checkpoint' | 'error' | 'done';
export type AlertDismissVia = 'entendido' | 'x' | 'fondo' | 'escape' | 'respuesta' | 'accion' | 'reemplazada';
export type AlertDismissal = { kind: AlertKind; ms: number; via: AlertDismissVia; scaffold: ScaffoldLevel | null; hint: HintLevel | null };
export type AffectId = 'bien' | 'confundido' | 'frustrado' | 'aburrido';
export const AFFECTS: { id: AffectId; emoji: string; label: string }[] = [
  { id: 'bien', emoji: '🙂', label: 'Bien' },
  { id: 'confundido', emoji: '😕', label: 'Confundido/a' },
  { id: 'frustrado', emoji: '😣', label: 'Frustrado/a' },
  { id: 'aburrido', emoji: '😴', label: 'Aburrido/a' },
];

type Popup = { kind: AlertKind; hint?: HintLevel };
const RANK: Record<ScaffoldLevel, number> = { N0: 0, N1: 1, N2: 2, N3: 3, N4: 4 };

/**
 * Alerta flotante en el centro de la pantalla: cada intervención nueva del tutor
 * (subida de andamiaje, pista, punto de control, primer error, reto logrado) se
 * muestra una vez para que el estudiante la vea; el panel lateral la conserva.
 */
export function TutorAlert(p: TutorAlertProps) {
  const [popup, setPopup] = useState<Popup | null>(null);
  const shown = useRef({ scaffoldRank: -1, hints: new Set<HintLevel>(), done: false });
  const [affect, setAffect] = useState<AffectId | null>(null);

  // Latencia de cierre: cada alerta registra cuánto estuvo abierta y cómo se cerró.
  // Si otra alerta la reemplaza sin que el estudiante la cierre, queda como 'reemplazada'.
  // shownMs acumula el tiempo realmente visible: mientras está en espera no corre el reloj.
  const openRef = useRef<{ kind: AlertKind; hint: HintLevel | null; at: number | null; shownMs: number } | null>(null);
  const viaRef = useRef<AlertDismissVia | null>(null);
  const blocked = Boolean(p.blocked);
  const blockedRef = useRef(blocked);
  blockedRef.current = blocked;
  const scaffoldRef = useRef(p.scaffold);
  scaffoldRef.current = p.scaffold;
  const onDismissRef = useRef(p.onDismiss);
  onDismissRef.current = p.onDismiss;
  useEffect(() => {
    const prev = openRef.current;
    if (prev) {
      const ms = prev.shownMs + (prev.at !== null ? Date.now() - prev.at : 0);
      onDismissRef.current?.({ kind: prev.kind, hint: prev.hint, ms, via: viaRef.current ?? 'reemplazada', scaffold: scaffoldRef.current });
    }
    viaRef.current = null;
    openRef.current = popup ? { kind: popup.kind, hint: popup.hint ?? null, at: blockedRef.current ? null : Date.now(), shownMs: 0 } : null;
    setAffect(null);
  }, [popup]);

  useEffect(() => {
    const o = openRef.current;
    if (!o) return;
    if (blocked && o.at !== null) { o.shownMs += Date.now() - o.at; o.at = null; }
    else if (!blocked && o.at === null) o.at = Date.now();
  }, [blocked]);
  const visible = blocked ? null : popup;

  useEffect(() => {
    if (!p.scaffold) { shown.current.scaffoldRank = -1; return; } // al bajar, una nueva subida vuelve a avisar
    if (p.isDone) return;
    if (RANK[p.scaffold] > shown.current.scaffoldRank) {
      shown.current.scaffoldRank = RANK[p.scaffold];
      setPopup({ kind: 'scaffold' });
    }
  }, [p.scaffold, p.isDone]);

  useEffect(() => {
    if (p.activeHint && !shown.current.hints.has(p.activeHint)) {
      shown.current.hints.add(p.activeHint);
      setPopup({ kind: 'hint', hint: p.activeHint });
    }
  }, [p.activeHint]);

  useEffect(() => { if (p.checkpointDue && !p.isDone) setPopup({ kind: 'checkpoint' }); }, [p.checkpointDue]);

  useEffect(() => {
    if (p.consecutiveErrors === 1 && !p.scaffold && !p.isDone) setPopup(cur => cur ?? { kind: 'error' });
  }, [p.consecutiveErrors]);

  useEffect(() => {
    if (p.isDone && !shown.current.done) { shown.current.done = true; setPopup({ kind: 'done' }); }
  }, [p.isDone]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close('escape'); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  const close = (via: AlertDismissVia) => { viaRef.current = via; setPopup(null); };
  const pickAffect = (id: AffectId) => { setAffect(id); p.onAffect?.(id); };
  const title = !popup ? '' :
    popup.kind === 'hint' ? p.hintTitle(popup.hint!) :
    popup.kind === 'scaffold' && p.scaffold ? `Ayuda ${p.scaffold} · ${SCAFFOLD_INFO[p.scaffold].name}` :
    popup.kind === 'checkpoint' ? 'Punto de control' :
    popup.kind === 'done' ? '¡Reto logrado!' : 'Mensaje del tutor';
  const tone = popup?.kind === 'done' ? 'ok' : popup?.kind === 'scaffold' && (p.scaffold === 'N2' || p.scaffold === 'N3') ? 'warn' : 'info';
  const bar = tone === 'warn' ? 'bg-warning' : tone === 'ok' ? 'bg-secondary' : 'bg-primary';
  const badge = tone === 'warn' ? 'bg-warning-container text-on-warning-container'
    : tone === 'ok' ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary-container text-on-primary-container';

  return createPortal(
    <AnimatePresence>
      {visible && popup && (
        <motion.div key="tutor-alert" className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => close('fondo')} />
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest font-sans text-on-surface shadow-2xl"
          >
            <div className={`h-1.5 w-full ${bar}`} />
            <div className="p-5">
              <div className="mb-3 flex items-start gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${badge}`}>
                  {popup.kind === 'hint' ? <Lightbulb size={20} /> : popup.kind === 'checkpoint' ? <Target size={20} /> : popup.kind === 'done' ? <Sparkles size={20} /> : <Bot size={20} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Tu tutor</div>
                  <div className="text-base font-semibold leading-snug">{title}</div>
                </div>
                <button type="button" onClick={() => close('x')} aria-label="Cerrar" className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container">
                  <X size={18} />
                </button>
              </div>

              {popup.kind === 'hint' && popup.hint ? (
                <>
                  <p className="text-sm leading-relaxed">{p.hintText(popup.hint)}</p>
                  {popup.hint === 1 && p.goal && <p className="mt-2 text-sm text-on-surface-variant"><b className="text-on-surface">Tu meta:</b> {p.goal}</p>}
                  <div className="mt-4 flex items-center gap-2 text-sm text-on-surface-variant">
                    ¿Te sirvió?
                    <button type="button" onClick={() => p.onRateHint(popup.hint!, true)} aria-label="Sí me sirvió"
                      className={`rounded-lg border px-2.5 py-1 ${p.ratings[popup.hint] === true ? 'border-secondary bg-secondary-container' : 'border-outline-variant'}`}><ThumbsUp size={14} /></button>
                    <button type="button" onClick={() => p.onRateHint(popup.hint!, false)} aria-label="No me sirvió"
                      className={`rounded-lg border px-2.5 py-1 ${p.ratings[popup.hint] === false ? 'border-error bg-error-container' : 'border-outline-variant'}`}><ThumbsDown size={14} /></button>
                  </div>
                </>
              ) : popup.kind === 'checkpoint' ? (
                <>
                  <p className="text-sm leading-relaxed">¿Cómo te sientes ahora?</p>
                  <div className="mb-4 mt-2 grid grid-cols-4 gap-1.5" role="group" aria-label="Cómo te sientes ahora">
                    {AFFECTS.map((a) => (
                      <button key={a.id} type="button" onClick={() => pickAffect(a.id)} aria-pressed={affect === a.id}
                        className={`flex flex-col items-center gap-0.5 rounded-lg border py-1.5 text-xs transition-colors ${
                          affect === a.id ? 'border-primary bg-primary-container' : 'border-outline-variant hover:bg-surface-container'}`}>
                        <span className="text-xl leading-none" aria-hidden="true">{a.emoji}</span>{a.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed">
                    ¿Qué tan seguro/a vas de lograr el reto?{p.jolInicial !== undefined && <> Al inicio dijiste <b>{p.jolInicial.toFixed(0)}</b>.</>}
                  </p>
                  <div className="mt-3 grid grid-cols-5 gap-1.5 sm:grid-cols-10" role="group" aria-label="Confianza actual del 1 al 10">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <button key={n} type="button" onClick={() => { p.onCheckpoint(n); close('respuesta'); }}
                        className="rounded-lg border border-outline-variant py-2 text-sm font-semibold tabular-nums transition-colors hover:border-primary hover:bg-primary-container/40">{n}</button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm leading-relaxed">{p.message}</p>
              )}

              {popup.kind === 'scaffold' && p.reasons.length > 0 && (
                <p className="mt-3 text-xs text-on-surface-variant">Lo noto por: {p.reasons.join(', ')}.</p>
              )}

              {popup.kind !== 'checkpoint' && (
                <div className="mt-5 flex justify-end gap-2">
                  {popup.kind === 'scaffold' && !p.hintOpened(1) && (
                    <button type="button" onClick={() => { viaRef.current = 'accion'; p.onOpenHint(1); }}
                      className="rounded-xl border border-outline-variant px-4 py-2 text-sm hover:bg-surface-container">Ver pista 1</button>
                  )}
                  <button type="button" autoFocus onClick={() => close('entendido')}
                    className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-on-primary">Entendido</button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
