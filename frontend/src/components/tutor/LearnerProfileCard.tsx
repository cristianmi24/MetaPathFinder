import { useMemo } from 'react';
import { Activity, AlertTriangle, Brain, Compass, Pencil } from 'lucide-react';
import type { LearnerProfile } from '../../services/api';
import { useTutorStore } from '../../stores/useTutorStore';
import { useCognitiveStore } from '../../stores/useCognitiveStore';
import { challengeProfiles } from '../../data/challengeProfiles';
import { detectMisconception, LEVEL_SHORT, PROFILE_LABEL } from '../../lib/tutorEngine';
import { WhyThis } from './WhyThis';
import './tutor.css';

const DIM_LABEL: Record<string, string> = { D1: 'Planificación', D2: 'Monitoreo', D3: 'Búsqueda de ayuda', D4: 'Evaluación' };

const TRAIT_STATUS: Record<string, { label: string; color: string }> = {
  fortaleza: { label: 'Fortaleza', color: 'var(--ok)' },
  en_desarrollo: { label: 'En desarrollo', color: 'var(--warn)' },
  a_trabajar: { label: 'A trabajar', color: 'var(--danger)' },
  sin_datos: { label: 'Sin datos', color: 'var(--text-muted)' },
};

/** Perfil dinámico: calibración (Kalman), rasgos de autorregulación, propensión a bloquearse y ritmo. */
function DynamicProfile({ profile, personalized }: { profile: LearnerProfile; personalized: string[] }) {
  const cal = profile.calibration;
  const seg = [
    { k: 'sub', label: 'Subestimación', p: cal.probs.sub, color: 'var(--accent)' },
    { k: 'cal', label: 'Calibrado', p: cal.probs.cal, color: 'var(--ok)' },
    { k: 'over', label: 'Sobreconfianza', p: cal.probs.over, color: 'var(--danger)' },
  ];
  const pace = profile.pace_ratio;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="tut-bubble-tag"><Activity size={11} /> Perfil dinámico · {profile.challenges} {profile.challenges === 1 ? 'reto' : 'retos'} analizados</div>

      <div style={{ fontSize: 12 }}>
        <div style={{ marginBottom: 4 }}>
          Calibración estimada: <b>{PROFILE_LABEL[cal.class]}</b>
          <span style={{ color: 'var(--text-muted)' }}> · sesgo {cal.bias_mean > 0 ? '+' : ''}{cal.bias_mean.toFixed(1)} ± {cal.bias_sd.toFixed(1)}</span>
        </div>
        <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: 'var(--surface-2)' }} aria-label="Probabilidad de cada perfil de calibración">
          {seg.map((s) => <div key={s.k} title={`${s.label}: ${Math.round(s.p * 100)}%`} style={{ width: `${s.p * 100}%`, background: s.color, opacity: cal.class === s.k ? 1 : 0.45 }} />)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-muted)', marginTop: 3 }}>
          {seg.map((s) => <span key={s.k}>{s.label} {Math.round(s.p * 100)}%</span>)}
        </div>
      </div>

      <div className="tut-crit">
        {Object.entries(profile.traits).map(([id, t]) => (
          <div key={id} className="tut-crit-row" title={`Intervalo ${Math.round(t.ci[0] * 100)}–${Math.round(t.ci[1] * 100)} %`}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: TRAIT_STATUS[t.status].color, alignSelf: 'center' }} />
            <div>
              <div style={{ fontSize: 11, marginBottom: 2 }}>
                {t.label}{id === profile.weakest_trait && <b style={{ color: 'var(--danger)' }}> · foco actual</b>}
                <span style={{ color: 'var(--text-muted)' }}> · {TRAIT_STATUS[t.status].label}</span>
              </div>
              <div className="tut-crit-bar"><i className={t.status === 'fortaleza' ? 'ok' : ''} style={{ width: t.status === 'sin_datos' ? 0 : `${Math.round(t.p * 100)}%` }} /></div>
            </div>
            <span className="tut-crit-p">{t.status === 'sin_datos' ? '—' : `${Math.round(t.p * 100)}%`}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11.5 }}>
        <span className="tut-chip" title="Punto de partida del cálculo de bloqueo en vivo">Propensión a bloquearte: <b>{Math.round(profile.blocking_prior * 100)}%</b></span>
        {pace !== null && (
          <span className="tut-chip" title="Tiempo real / tiempo que estimaste">
            Ritmo: <b>{pace > 1.3 ? 'tardas más de lo que estimas' : pace < 0.7 ? 'terminas antes de lo que estimas' : 'estimas bien tu tiempo'}</b> ({pace.toFixed(1)}×)
          </span>
        )}
      </div>

      {personalized.length > 0 && (
        <div className="tut-bubble" style={{ fontSize: 12 }}>
          <div className="tut-bubble-tag">Cómo se adapta tu tutor</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>{personalized.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

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
              <li><b>Calibración</b>: filtro de Kalman sobre el sesgo (confianza − desempeño) de todos tus retos; lo reciente pesa más.</li>
              <li><b>Rasgos</b>: Beta-Bernoulli con olvido alimentada por tu conducta en cada reto (planificar, pedir ayuda, foco…).</li>
              <li><b>Propensión a bloquearte</b>: es el punto de partida del cálculo de bloqueo en vivo; si rara vez te atascas, el tutor te interrumpe menos.</li>
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

      {state?.profile && state.profile.challenges > 0 && <DynamicProfile profile={state.profile} personalized={state.scaffold?.personalized ?? []} />}

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
