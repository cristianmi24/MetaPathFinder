import { useMemo } from 'react';
import { AlertTriangle, Brain, Compass, Pencil } from 'lucide-react';
import { useTutorStore } from '../../stores/useTutorStore';
import { useCognitiveStore } from '../../stores/useCognitiveStore';
import { challengeProfiles } from '../../data/challengeProfiles';
import { detectMisconception, LEVEL_SHORT, PROFILE_LABEL } from '../../lib/tutorEngine';
import { WhyThis } from './WhyThis';
import './tutor.css';

const DIM_LABEL: Record<string, string> = { D1: 'Planificación', D2: 'Monitoreo', D3: 'Búsqueda de ayuda', D4: 'Evaluación' };

/** Tarjeta «Mi perfil de aprendizaje»: estilo, overlay, calibración, progresión metacognitiva y concepciones erróneas. */
export function LearnerProfileCard({ onEditStyle }: { onEditStyle?: () => void }) {
  const { state, learningStyle } = useTutorStore();
  const events = useCognitiveStore((s) => s.events);

  const overlayPct = useMemo(() => {
    if (!state?.overlay) return { dominado: 0, en_proceso: 0, total: 36 };
    let d = 0, e = 0, t = 0;
    for (const c of Object.values(state.overlay)) for (const s of Object.values(c.steps)) { t++; if (s.status === 'dominado') d++; else if (s.status === 'en_proceso') e++; }
    return { dominado: d, en_proceso: e, total: t };
  }, [state]);

  const misconception = useMemo(() => {
    const errs: Record<string, number> = {};
    for (const ev of events) if (ev.type === 'QUIZ_ANSWER' && ev.metadata?.correct === false && ev.metadata?.questionId) errs[ev.metadata.questionId] = (errs[ev.metadata.questionId] || 0) + 1;
    const common: Record<string, string> = {};
    for (const [id, p] of Object.entries(challengeProfiles)) common[id] = p.erroresComunes;
    return detectMisconception(errs, common);
  }, [events]);

  const r = 34, c = 2 * Math.PI * r;
  const pctD = overlayPct.total ? overlayPct.dominado / overlayPct.total : 0;
  const pctE = overlayPct.total ? overlayPct.en_proceso / overlayPct.total : 0;
  const criteria = state?.criteria;
  const zdp = state?.zdp;

  return (
    <div className="tut-panel" style={{ gap: 14 }}>
      <div className="tut-head">
        <div className="tut-avatar"><Brain size={20} /></div>
        <div>
          <div className="tut-title">Mi perfil de aprendizaje</div>
          <div className="tut-sub">Lo que el tutor sabe de ti (y por qué)</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <WhyThis title="De dónde sale este perfil">
            <ul>
              <li><b>Estilo</b>: cuestionario abreviado de Felder-Soloman (8 ítems).</li>
              <li><b>Dominio</b>: probabilidad Beta-Bernoulli por escalón, actualizada con cada reto.</li>
              <li><b>Progresión</b>: 12 criterios observables (Griffin); un criterio cuenta como logrado con ≥ 70 % y 3 observaciones.</li>
              <li><b>Calibración</b>: confianza declarada menos desempeño del último reto.</li>
            </ul>
          </WhyThis>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 14, alignItems: 'center' }}>
        <svg className="tut-donut" viewBox="0 0 84 84" aria-label="Dominio del temario">
          <circle cx="42" cy="42" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
          <circle cx="42" cy="42" r={r} fill="none" stroke="var(--warn)" strokeWidth="10" strokeDasharray={`${(pctD + pctE) * c} ${c}`} transform="rotate(-90 42 42)" />
          <circle cx="42" cy="42" r={r} fill="none" stroke="var(--ok)" strokeWidth="10" strokeDasharray={`${pctD * c} ${c}`} transform="rotate(-90 42 42)" />
          <text x="42" y="46" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)">{Math.round(pctD * 100)}%</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          <div><span className="tut-chip accent"><Compass size={11} /> {learningStyle?.label ?? 'Estilo sin definir'}</span>
            {onEditStyle && <button type="button" className="tut-why-btn" style={{ marginLeft: 8 }} onClick={onEditStyle}><Pencil size={11} /> {learningStyle ? 'cambiar' : 'responder'}</button>}
          </div>
          <div><b style={{ color: 'var(--ok)' }}>{overlayPct.dominado}</b> escalones dominados · <b style={{ color: 'var(--warn)' }}>{overlayPct.en_proceso}</b> en proceso · {overlayPct.total - overlayPct.dominado - overlayPct.en_proceso} pendientes</div>
          <div>
            Última calibración: <b>{state?.last_profile ? PROFILE_LABEL[state.last_profile] : '—'}</b>
            {state?.last_bias !== null && state?.last_bias !== undefined && <span style={{ color: 'var(--text-muted)' }}> (sesgo {state.last_bias > 0 ? '+' : ''}{state.last_bias})</span>}
          </div>
          {zdp && <div>Zona de desarrollo metacognitiva: <b>{LEVEL_SHORT[zdp.zdp]}</b>{zdp.consolidated ? ` · consolidado ${LEVEL_SHORT[zdp.consolidated]}` : ' · aún sin nivel consolidado'}</div>}
        </div>
      </div>

      {criteria && (
        <div className="tut-crit">
          <div className="tut-bubble-tag">Progresión metacognitiva · probabilidad de dominio por criterio</div>
          {Object.entries(criteria).map(([id, c]) => (
            <div key={id} className="tut-crit-row" title={c.text}>
              <span className="tut-crit-id">{id}</span>
              <div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 2 }}>{DIM_LABEL[c.dimension]} · {LEVEL_SHORT[c.level]}{c.n ? ` · ${c.n} obs.` : ''}</div>
                <div className="tut-crit-bar"><i className={c.mastered ? 'ok' : ''} style={{ width: `${Math.round(c.p * 100)}%` }} /></div>
              </div>
              <span className="tut-crit-p">{Math.round(c.p * 100)}%</span>
            </div>
          ))}
        </div>
      )}

      {misconception && (
        <div className="tut-bubble warn" style={{ display: 'flex', gap: 8 }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div className="tut-bubble-tag">Posible concepción errónea (se repitió {misconception.count} veces)</div>
            En «{challengeProfiles[misconception.challengeId]?.tituloCorto}» detectamos un patrón: {misconception.text}. No es un descuido: conviene revisar la idea de fondo.
          </div>
        </div>
      )}
    </div>
  );
}
