import { useState } from 'react';
import { motion } from 'motion/react';
import { ListChecks, LifeBuoy, Route, Sparkles } from 'lucide-react';
import { getTutorHint3 } from '../../data/tutorHints';
import './tutor.css';

export type ReplanChoice = 'guiado' | 'simplificado' | 'continuar';

interface Props {
  open: boolean;
  challengeId: string;
  challengeTitle: string;
  hasSimplified: boolean;
  onChoose: (choice: ReplanChoice) => void;
}

/**
 * Replanificación instruccional en tiempo real: al tercer error seguido la pantalla se
 * atenúa y el tutor cambia de táctica (desglose paso a paso o versión simplificada)
 * en lugar de repetir la misma explicación. El estudiante conserva la agencia.
 */
export function ReplanModal({ open, challengeId, challengeTitle, hasSimplified, onChoose }: Props) {
  const [mode, setMode] = useState<'elegir' | 'guiado'>('elegir');
  const [done, setDone] = useState<boolean[]>([]);
  if (!open) return null;
  const hint = getTutorHint3(challengeId);
  const steps = hint.pasosGuiados;
  const allDone = steps.length > 0 && steps.every((_, i) => done[i]);

  return (
    <div className="tut-dim" role="dialog" aria-modal="true" aria-label="Vamos a abordarlo de otra forma">
      <motion.div initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="tut-modal">
        <span className="tut-chip warn"><Sparkles size={11} /> Táctica nueva · {mode === 'guiado' ? 'Desglose paso a paso' : 'Replanificación'}</span>
        {mode === 'elegir' ? (
          <>
            <h3>Parece que este reto se resiste. Vamos a abordarlo de otra forma.</h3>
            <p>
              Tres intentos seguidos sin acertar en «{challengeTitle}» no es un fracaso: es la señal de cambiar de camino.
              Elige cómo quieres seguir.
            </p>
            <div className="tut-options">
              <button type="button" className="tut-option" onClick={() => setMode('guiado')}>
                <ListChecks size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span><b>Modo guiado paso a paso</b><small>El mismo reto dividido en {steps.length} pasos cortos; marcas cada uno al cumplirlo.</small></span>
              </button>
              {hasSimplified && (
                <button type="button" className="tut-option" onClick={() => onChoose('simplificado')}>
                  <LifeBuoy size={20} style={{ color: 'var(--warn)', flexShrink: 0 }} />
                  <span><b>Versión simplificada (N1)</b><small>Un reto más sencillo del mismo componente para reconstruir la base y volver.</small></span>
                </button>
              )}
              <button type="button" className="tut-option" onClick={() => onChoose('continuar')}>
                <Route size={20} style={{ color: 'var(--ok)', flexShrink: 0 }} />
                <span><b>Seguir por mi cuenta</b><small>Prefiero intentarlo de nuevo sin cambiar de enfoque (queda registrado como tu decisión).</small></span>
              </button>
            </div>
          </>
        ) : (
          <>
            <h3>Resolvamos primero esta versión paso a paso</h3>
            <p>Marca cada paso cuando lo hayas hecho en la actividad. Al terminar, verifica de nuevo.</p>
            <div className="tut-steps">
              {steps.map((s, i) => (
                <button type="button" key={i} className={`tut-step ${done[i] ? 'done' : ''}`} onClick={() => setDone((d) => { const n = [...d]; n[i] = !n[i]; return n; })}>
                  <span className="tut-step-n">{i + 1}</span>
                  <span>{s}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <button type="button" className="tut-btn ghost" onClick={() => setMode('elegir')}>Volver</button>
              <button type="button" className="tut-btn" disabled={!allDone} onClick={() => onChoose('guiado')}>Listo, voy a verificar</button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
