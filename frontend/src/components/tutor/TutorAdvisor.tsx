import { useMemo, useState } from 'react';
import { Bot, Lightbulb, Lock, Sparkles, ThumbsDown, ThumbsUp, Target } from 'lucide-react';
import { WhyThis } from './WhyThis';
import { TutorAlert, type AffectId, type AlertDismissal } from './TutorAlert';
import { SCAFFOLD_INFO, LEVEL_SHORT, type BlockingSignals, type ScaffoldLevel } from '../../lib/tutorEngine';
import { getTutorHint3 } from '../../data/tutorHints';
import type { ChallengeProfile } from '../../data/challengeProfiles';
import type { Estrategia } from '../../data/metacognitiveStrategies';
import type { TutorScaffold, TutorZdp } from '../../services/api';
import './tutor.css';

export type HintLevel = 1 | 2 | 3;

export interface TutorAdvisorProps {
  challengeId: string;
  criteria: string[];
  profile: ChallengeProfile | null;
  strategy: Estrategia | null;
  pBlock: number;
  scaffold: ScaffoldLevel | null;
  signals: BlockingSignals;
  consecutiveErrors: number;
  openedHints: HintLevel[];
  activeHint: HintLevel | null;
  onOpenHint: (level: HintLevel) => void;
  onRateHint: (level: HintLevel, helpful: boolean) => void;
  ratings: Partial<Record<HintLevel, boolean>>;
  alternativeHint: { level: HintLevel; variant: 'analogia' | 'contraejemplo' } | null;
  zdp: TutorZdp | null;
  scaffoldPlan: TutorScaffold | null;
  jolInicial?: number;
  checkpoints: number[];
  onCheckpoint: (value: number) => void;
  checkpointDue: boolean;
  isDone: boolean;
  pendingCriteriaTexts: { id: string; text: string }[];
  peerRecommendation?: { level: HintLevel; ratio: number; neighbours: number } | null;
  onAlertDismissed?: (info: AlertDismissal) => void;
  onAffect?: (affect: AffectId) => void;
  /** Hay un modal bloqueante abierto: las alertas del tutor esperan a que se cierre. */
  alertsBlocked?: boolean;
}

const LEVEL_META: Record<HintLevel, { title: string; tactic: string }> = {
  1: { title: 'Pregunta reflexiva', tactic: 'Pregunta socrática' },
  2: { title: 'Señalamiento del error', tactic: 'Señalamiento directo' },
  3: { title: 'Solución análoga guiada', tactic: 'Analogía / contraejemplo' },
};

export function TutorAdvisor(p: TutorAdvisorProps) {
  const [sel, setSel] = useState<number | null>(null);
  const hint3 = useMemo(() => getTutorHint3(p.challengeId), [p.challengeId]);
  const pct = Math.round(p.pBlock * 100);
  const tone = p.isDone ? 'ok' : p.scaffold === 'N2' || p.scaffold === 'N3' ? 'warn' : '';

  const message = useMemo(() => {
    if (p.isDone) return '¡Lo lograste! Antes de enviar, revisa una vez más los criterios: así tu confianza y tu resultado quedan alineados.';
    if (p.scaffold === 'N3') return 'Llevas varios intentos seguidos sin avanzar. Vamos a dividirlo: te muestro un paso resuelto y tú sigues desde ahí.';
    if (p.scaffold === 'N2') return p.strategy
      ? `Parece que estás atascado/a. Recuerda tu estrategia «${p.strategy.nombre}»: ${p.strategy.pasos[0].toLowerCase()}.`
      : 'Parece que estás atascado/a. Relee la meta y elige solo el primer paso.';
    if (p.scaffold === 'N1') return p.profile ? `Mira con calma esto: ${p.profile.erroresComunes}. ¿Es lo que te está pasando?` : 'Mira con calma el último intento: ¿qué criterio no se cumplió?';
    if (p.scaffold === 'N0') return `¿Qué te pide exactamente el criterio «${(p.criteria[0] || '').replace(/^\d+\.\s*/, '')}»? Dilo con tus palabras antes de seguir.`;
    if (p.consecutiveErrors === 1) return '¡Buen intento! Estuviste cerca. Un error es información: ¿qué te dice sobre tu plan?';
    return 'Estoy aquí mientras trabajas. Avanza a tu ritmo: pediré tu confianza de vez en cuando y te ofreceré ayuda solo si la necesitas.';
  }, [p.isDone, p.scaffold, p.strategy, p.profile, p.criteria, p.consecutiveErrors]);

  const hintText = (level: HintLevel) => {
    if (level === 1) return p.profile?.consejoProfesor || 'Lee con calma la meta y los criterios del reto antes de actuar. Divídelo en pasos pequeños.';
    if (level === 2) return `Suele fallarse en: ${p.profile?.erroresComunes || 'saltarse un criterio'}. Se comprueba con ${p.profile?.verificarCon || 'el botón «Verificar»'}.`;
    const variant = p.alternativeHint?.level === 3 ? p.alternativeHint.variant : 'analogia';
    return variant === 'analogia' ? hint3.analogia : hint3.contraejemplo;
  };

  const canOpen = (level: HintLevel) => level === 1 || p.openedHints.includes((level - 1) as HintLevel);
  const activeSignals = (Object.entries(p.signals) as [keyof BlockingSignals, boolean][]).filter(([, v]) => v).map(([k]) => k);
  const SIGNAL_LABEL: Record<keyof BlockingSignals, string> = {
    errores_seguidos: 'dos o más errores seguidos', pausa_larga: 'una pausa más larga que tu ritmo habitual',
    ediciones_sin_exito: 'muchos cambios sin verificar', cambio_pestana: 'cambio de pestaña',
  };

  return (
    <>
    <TutorAlert
      scaffold={p.scaffold}
      activeHint={p.activeHint}
      checkpointDue={p.checkpointDue}
      consecutiveErrors={p.consecutiveErrors}
      isDone={p.isDone}
      message={message}
      hintTitle={(level) => `Pista ${level}: ${LEVEL_META[level].title}`}
      hintText={hintText}
      goal={p.profile?.metaConcreta}
      reasons={activeSignals.map((s) => SIGNAL_LABEL[s])}
      jolInicial={p.jolInicial}
      ratings={p.ratings}
      hintOpened={(level) => p.openedHints.includes(level)}
      onOpenHint={p.onOpenHint}
      onRateHint={p.onRateHint}
      onCheckpoint={(n) => { setSel(n); p.onCheckpoint(n); }}
      onDismiss={p.onAlertDismissed}
      onAffect={p.onAffect}
      blocked={p.alertsBlocked}
    />
    <aside className="tut-panel" id="tour-tutor-panel" aria-label="Tu tutor">
      <div className="tut-head">
        <div className="tut-avatar"><Bot size={20} /></div>
        <div style={{ minWidth: 0 }}>
          <div className="tut-title">Tu tutor</div>
          <div className="tut-sub">
            {p.zdp ? `Andamiaje para tu zona: ${LEVEL_SHORT[p.zdp.zdp]}` : 'Andamiaje adaptativo'}
          </div>
        </div>
        {p.scaffold && !p.isDone && (
          <span className="tut-chip accent" style={{ marginLeft: 'auto' }} title={SCAFFOLD_INFO[p.scaffold].name}>
            {SCAFFOLD_INFO[p.scaffold].tacticLabel}
          </span>
        )}
      </div>

      <div className={`tut-bubble ${tone}`}>
        <div className="tut-bubble-tag"><Sparkles size={11} /> {p.scaffold && !p.isDone ? `Ayuda ${p.scaffold} · ${SCAFFOLD_INFO[p.scaffold].name}` : 'Mensaje del tutor'}</div>
        {message}
      </div>

      <div className="tut-gauge">
        <div className="tut-gauge-row">
          <span>¿Qué tan atascado/a pareces?</span>
          <span className="tut-gauge-val">{pct}%</span>
        </div>
        <div className="tut-gauge-bar">
          <div className="tut-gauge-fill" style={{ width: `${pct}%`, background: pct >= 70 ? 'var(--danger)' : pct >= 40 ? 'var(--warn)' : 'var(--ok)' }} />
        </div>
        <div className="tut-ladder" aria-hidden>
          {(['N0', 'N1', 'N2', 'N3'] as ScaffoldLevel[]).map((l) => (
            <span key={l} className={p.scaffold && ['N0', 'N1', 'N2', 'N3'].indexOf(p.scaffold) >= ['N0', 'N1', 'N2', 'N3'].indexOf(l) ? 'on' : ''} />
          ))}
        </div>
        <WhyThis title="Por qué el tutor interviene así">
          <p style={{ margin: 0 }}>
            Combino cuatro señales con un modelo bayesiano (ninguna decide sola). Ahora mismo:
          </p>
          <ul>
            {activeSignals.length === 0 && <li>No hay señales de bloqueo activas: no te interrumpo.</li>}
            {activeSignals.map((s) => <li key={s}>{SIGNAL_LABEL[s]}</li>)}
          </ul>
          <p style={{ margin: '6px 0 0' }}>
            Probabilidad de bloqueo: <b>{pct}%</b>. La ayuda sube de N0 (pregunta) a N3 (paso resuelto) solo si la probabilidad se mantiene alta,
            y baja cuando avanzas (regla de contingencia de Wood).
          </p>
        </WhyThis>
      </div>

      {(p.checkpointDue || p.scaffoldPlan?.mandatory_checkpoints) && !p.isDone && (
        <div>
          <div className="tut-bubble-tag"><Target size={11} /> Punto de control · ¿qué tan seguro/a vas? {p.jolInicial !== undefined && <span>(al inicio dijiste {p.jolInicial.toFixed(0)})</span>}</div>
          <div className="tut-checkpoint" role="group" aria-label="Confianza actual del 1 al 10">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" className={sel === n ? 'sel' : ''} onClick={() => { setSel(n); p.onCheckpoint(n); }}>{n}</button>
            ))}
          </div>
          {p.checkpoints.length > 0 && (
            <div className="tut-sub" style={{ marginTop: 5 }}>Registros: {p.checkpoints.join(' → ')}</div>
          )}
        </div>
      )}

      <div>
        <div className="tut-bubble-tag"><Lightbulb size={11} /> Pistas escalonadas · {p.openedHints.length}/3 usadas</div>
        <div className="tut-hints">
          {([1, 2, 3] as HintLevel[]).map((level) => {
            const opened = p.openedHints.includes(level);
            const isActive = p.activeHint === level;
            const enabled = canOpen(level);
            return (
              <div key={level}>
                <button
                  type="button"
                  className={`tut-hint-btn ${isActive ? 'open' : ''}`}
                  disabled={!enabled}
                  onClick={() => p.onOpenHint(level)}
                  title={!enabled ? `Pide primero la pista ${level - 1}` : undefined}
                >
                  <span className="tut-hint-num">{enabled ? `${level}/3` : <Lock size={12} />}</span>
                  <span className="tut-hint-meta">
                    <b>Pista {level}: {LEVEL_META[level].title}</b>
                    <small>Táctica · {LEVEL_META[level].tactic}{opened ? ' · vista' : ''}</small>
                  </span>
                </button>
                {isActive && (
                  <div className="tut-hint-body" style={{ marginTop: 6 }}>
                    {hintText(level)}
                    {level === 1 && p.profile?.metaConcreta && (
                      <div style={{ marginTop: 6, color: 'var(--text-muted)' }}><b style={{ color: 'var(--text)' }}>Tu meta:</b> {p.profile.metaConcreta}</div>
                    )}
                    <div className="tut-rate">
                      ¿Te sirvió?
                      <button type="button" className={p.ratings[level] === true ? 'sel' : ''} onClick={() => p.onRateHint(level, true)} aria-label="Sí me sirvió"><ThumbsUp size={12} /></button>
                      <button type="button" className={p.ratings[level] === false ? 'sel' : ''} onClick={() => p.onRateHint(level, false)} aria-label="No me sirvió"><ThumbsDown size={12} /></button>
                      {p.ratings[level] === false && level === 3 && p.alternativeHint && (
                        <span>Te muestro otra forma de verlo ({p.alternativeHint.variant === 'analogia' ? 'analogía' : 'contraejemplo'}).</span>
                      )}
                      {p.ratings[level] === false && level !== 3 && <span>Prueba la siguiente pista: cambia la táctica.</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {p.peerRecommendation && (
        <div className="tut-bubble" style={{ fontSize: 12 }}>
          <div className="tut-bubble-tag">Curaduría por pares</div>
          A {p.peerRecommendation.neighbours} compañeros con un perfil parecido al tuyo les sirvió la <b>pista {p.peerRecommendation.level}</b>
          {' '}({Math.round(p.peerRecommendation.ratio * 100)} % de utilidad).{' '}
          <button type="button" className="tut-why-btn" onClick={() => p.onOpenHint(p.peerRecommendation!.level)}>Verla</button>
        </div>
      )}

      {p.pendingCriteriaTexts.length > 0 && (
        <div>
          <div className="tut-bubble-tag">Mi autorregulación · en lo que estamos trabajando</div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, lineHeight: 1.5, color: 'var(--text-muted)' }}>
            {p.pendingCriteriaTexts.slice(0, 2).map((c) => <li key={c.id}><b style={{ fontFamily: 'var(--font-mono)' }}>{c.id}</b> · {c.text}</li>)}
          </ul>
        </div>
      )}
    </aside>
    </>
  );
}
