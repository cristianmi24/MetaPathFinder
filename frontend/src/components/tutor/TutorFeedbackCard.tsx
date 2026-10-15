import { ArrowRight, Bot, CheckCircle2, Sparkles, ThumbsDown, ThumbsUp, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import type { TutorPhaseCResult } from '../../services/api';
import { LEVEL_SHORT } from '../../lib/tutorEngine';
import { WhyThis } from './WhyThis';
import './tutor.css';

interface Props {
  result: TutorPhaseCResult;
  strategyNames: Record<string, string>;
  onRate?: (resourceId: string, helpful: boolean) => void;
}

/** Retroalimentación con enfoque de desarrollo: «Ya logras ___. Tu siguiente paso es ___». */
export function TutorFeedbackCard({ result, strategyNames, onRate }: Props) {
  const [rated, setRated] = useState<boolean | null>(null);
  const { feedback, reading, zdp_after, strategy_outcome, criteria_observed } = result;
  const observed = Object.entries(criteria_observed).filter(([, v]) => v !== null) as [string, boolean][];

  return (
    <div className="tut-panel" style={{ gap: 14 }}>
      <div className="tut-head">
        <div className="tut-avatar"><Bot size={20} /></div>
        <div>
          <div className="tut-title">Lo que tu tutor observó</div>
          <div className="tut-sub">Enfoque de desarrollo: lo que ya haces y lo que sigue</div>
        </div>
        <span className="tut-chip accent" style={{ marginLeft: 'auto' }}>ZDP · {LEVEL_SHORT[zdp_after.zdp]}</span>
      </div>

      <div className="tut-bubble ok" style={{ fontSize: 14 }}>
        <div className="tut-bubble-tag"><Sparkles size={11} /> Ya logras · siguiente paso</div>
        {feedback.message}
        {feedback.level_change && <div style={{ marginTop: 8, fontWeight: 700 }}>🎉 {feedback.level_change}</div>}
      </div>

      <div>
        <div className="tut-gauge-row" style={{ marginBottom: 6 }}>
          <span>{feedback.reading_sentence}</span>
          <WhyThis title="Qué indicadores pesaron en esta lectura">
            <ul>
              {reading.contributions.map((c) => (
                <li key={c.indicator}><b style={{ fontFamily: 'var(--font-mono)' }}>{c.indicator}</b> {c.weight >= 0 ? 'a favor' : 'en contra'} ({c.weight > 0 ? '+' : ''}{c.weight}): {c.text}</li>
              ))}
            </ul>
            {reading.missing_for_next.length > 0 && (
              <p style={{ margin: '8px 0 0' }}>Para el siguiente nivel te falta: {reading.missing_for_next.map((m) => m.text.toLowerCase().replace(/\.$/, '')).join('; ')}.</p>
            )}
          </WhyThis>
        </div>
        {(['basico', 'medio', 'avanzado'] as const).map((lvl) => (
          <div key={lvl} className="tut-crit-row" style={{ gridTemplateColumns: '70px 1fr 42px' }}>
            <span className="tut-crit-id">{LEVEL_SHORT[lvl]}</span>
            <div className="tut-crit-bar"><i className={lvl === reading.level ? 'ok' : ''} style={{ width: `${Math.round(reading.posterior[lvl] * 100)}%` }} /></div>
            <span className="tut-crit-p">{Math.round(reading.posterior[lvl] * 100)}%</span>
          </div>
        ))}
      </div>

      {observed.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {observed.map(([id, ok]) => (
            <span key={id} className={`tut-chip ${ok ? 'ok' : ''}`} title={ok ? 'Criterio cumplido en este reto' : 'Criterio no cumplido en este reto'}>
              {ok ? <CheckCircle2 size={11} /> : null} {id}
            </span>
          ))}
          {feedback.newly_mastered.length > 0 && <span className="tut-chip accent"><TrendingUp size={11} /> Consolidaste {feedback.newly_mastered.join(', ')}</span>}
        </div>
      )}

      {strategy_outcome && (
        <div className="tut-sub">
          Estrategia «{strategyNames[strategy_outcome.strategy_id] ?? strategy_outcome.strategy_id}»: {strategy_outcome.success ? 'redujo tu desfase' : 'aún no redujo tu desfase'} (de {strategy_outcome.prev_bias > 0 ? '+' : ''}{strategy_outcome.prev_bias} a {strategy_outcome.bias > 0 ? '+' : ''}{strategy_outcome.bias}). El tutor lo tiene en cuenta para la próxima asignación.
        </div>
      )}

      {onRate && (
        <div className="tut-rate">
          ¿Fue clara esta retroalimentación?
          <button type="button" className={rated === true ? 'sel' : ''} onClick={() => { setRated(true); onRate('feedback:desarrollo', true); }} aria-label="Sí"><ThumbsUp size={12} /></button>
          <button type="button" className={rated === false ? 'sel' : ''} onClick={() => { setRated(false); onRate('feedback:desarrollo', false); }} aria-label="No"><ThumbsDown size={12} /></button>
          {rated === false && <span><ArrowRight size={11} /> Te mostraremos la explicación con un ejemplo la próxima vez.</span>}
        </div>
      )}
    </div>
  );
}
