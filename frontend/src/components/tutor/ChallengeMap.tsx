import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutGrid, Lock, Rows3, Trophy, Unlock } from 'lucide-react';
import { dynamicChallengeBank } from '../../data/dynamicChallengeBank';
import { useTutorStore } from '../../stores/useTutorStore';
import { useCognitiveStore } from '../../stores/useCognitiveStore';
import { api, type TechOverlay } from '../../services/api';
import { WhyThis } from './WhyThis';
import './tutor.css';

const COMPONENTS: Record<string, string> = {
  C1: 'Naturaleza y evolución', C2: 'Apropiación y uso', C3: 'Solución de problemas', C4: 'Tecnología y sociedad',
};
const LADDER = ['RB-N1', 'RB-N2', 'RB-N3', 'RM-N1', 'RM-N2', 'RM-N3', 'RA-N1', 'RA-N2', 'RA-N3'];
const LEVEL_OF: Record<string, number> = { RB: 1, RM: 2, RA: 3 };

function challengeOf(comp: string, step: string) {
  const [lvl, sub] = step.split('-');
  return dynamicChallengeBank.find((c) => c.id === `${lvl}-${comp}-${sub}`) ?? null;
}

/**
 * «Mi mapa de retos»: visualización ontológica del dominio (4 componentes MEN × 9 escalones)
 * con modelo overlay (dominado / en proceso / pendiente), candados explicados y navegación
 * adaptativa: pestañas libres (estilo global) o «Siguiente reto» (estilo secuencial),
 * con desbloqueo de la navegación libre al demostrar dominio.
 */
export function ChallengeMap({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const { state, navigationMode, setNavigationMode, freeNavigationUnlocked, unlockFreeNavigation, learningStyle } = useTutorStore();
  const dbUserId = useCognitiveStore((s) => s.dbUserId);
  const currentSessionId = useCognitiveStore((s) => s.currentSessionId);
  const [tab, setTab] = useState('C1');
  const overlay: TechOverlay | null = state?.overlay ?? null;

  const mode = navigationMode ?? (learningStyle ? (learningStyle.global_sequential >= 0 ? 'global' : 'secuencial') : 'secuencial');

  // Dominio demostrado: ≥ 90 % de los escalones practicados del nivel actual dominados → navegación libre.
  const mastery = useMemo(() => {
    if (!overlay) return { practiced: 0, mastered: 0, ratio: 0 };
    let practiced = 0, mastered = 0;
    for (const comp of Object.values(overlay)) for (const s of Object.values(comp.steps)) { if (s.n > 0) { practiced++; if (s.status === 'dominado') mastered++; } }
    return { practiced, mastered, ratio: practiced ? mastered / practiced : 0 };
  }, [overlay]);
  useEffect(() => {
    if (!freeNavigationUnlocked && mastery.practiced >= 3 && mastery.ratio >= 0.9) unlockFreeNavigation();
  }, [mastery, freeNavigationUnlocked, unlockFreeNavigation]);

  const canUseGlobal = mode === 'global' || freeNavigationUnlocked;

  const cellStatus = (comp: string, step: string) => overlay?.[comp]?.steps?.[step]?.status ?? 'pendiente';
  const isLocked = (comp: string, step: string): string | null => {
    const i = LADDER.indexOf(step);
    if (i === 0) return null;
    const prev = LADDER[i - 1];
    const prevN = overlay?.[comp]?.steps?.[prev]?.n ?? 0;
    if (prevN >= 1) return null;
    if (canUseGlobal && freeNavigationUnlocked) return null;
    return `Completa ${prev.replace('-', ' · ')} de este componente para desbloquearlo`;
  };

  const go = (comp: string, step: string) => {
    const ch = challengeOf(comp, step);
    if (!ch) return;
    const store = useCognitiveStore.getState();
    store.setCurrentLevel(LEVEL_OF[step.slice(0, 2)] ?? 1);
    store.setCurrentChallengeId(ch.id);
    if (dbUserId) api.tutorOverride({ user_id: dbUserId, session_id: currentSessionId, kind: 'challenge', chosen: ch.id, reason: 'elegido en el mapa' }).catch(() => {});
    navigate('/evaluation-prep', { state: { forcedChallengeId: ch.id, fromMap: true } });
  };

  // Siguiente reto secuencial: primer escalón no dominado de la ZDP técnica más baja entre componentes.
  const nextSeq = useMemo(() => {
    if (!overlay) return { comp: 'C1', step: 'RB-N1', idx: 0 };
    let best: { comp: string; step: string; idx: number } | null = null;
    for (const [comp, data] of Object.entries(overlay)) {
      const idx = LADDER.indexOf(data.zdp_step);
      if (!best || idx < best.idx) best = { comp, step: data.zdp_step, idx };
    }
    return best ?? { comp: 'C1', step: 'RB-N1', idx: 0 };
  }, [overlay]);

  const comps = Object.keys(COMPONENTS);
  const shownComps = canUseGlobal ? [tab] : [nextSeq.comp];

  return (
    <div className="tut-map">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="tut-legend">
          <span><i className="tut-dot dominado" /> Dominado</span>
          <span><i className="tut-dot en_proceso" /> En proceso</span>
          <span><i className="tut-dot" /> Pendiente</span>
          <span><Lock size={11} /> Bloqueado por prerrequisito</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="tut-toggle" role="group" aria-label="Modo de navegación">
            <button type="button" className={mode === 'secuencial' ? 'on' : ''} onClick={() => setNavigationMode('secuencial')}><Rows3 size={12} /> Secuencial</button>
            <button type="button" className={mode === 'global' ? 'on' : ''} disabled={!freeNavigationUnlocked && mode !== 'global' && !(learningStyle && learningStyle.global_sequential >= 0)} onClick={() => setNavigationMode('global')} title={!freeNavigationUnlocked && !(learningStyle && learningStyle.global_sequential >= 0) ? 'Se desbloquea al dominar el 90 % de los retos practicados' : undefined}>
              {freeNavigationUnlocked ? <Unlock size={12} /> : <LayoutGrid size={12} />} Global
            </button>
          </div>
          <WhyThis title="Cómo se organiza tu mapa">
            <p style={{ margin: 0 }}>
              Cada componente del área de Tecnología e Informática tiene 9 escalones (Básico, Medio y Avanzado × N1–N3).
              El color muestra tu modelo de conocimiento: verde si la probabilidad de dominio (Beta-Bernoulli) supera el 70 %,
              amarillo si ya lo practicaste y gris si aún no. El borde morado marca tu zona de desarrollo próximo.
            </p>
            <p style={{ margin: '6px 0 0' }}>
              {mode === 'global' ? 'Tu estilo es global: puedes saltar entre componentes con las pestañas.' : 'Tu estilo es secuencial: el tutor te guía con «Siguiente reto».'}{' '}
              {freeNavigationUnlocked ? 'Ya desbloqueaste la navegación libre al demostrar dominio.' : `Navegación libre al dominar el 90 % de lo practicado (vas ${Math.round(mastery.ratio * 100)} %).`}
            </p>
          </WhyThis>
        </div>
      </div>

      {freeNavigationUnlocked && (
        <div className="tut-bubble ok" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Trophy size={16} /> ¡Logro! Dominaste el {Math.round(mastery.ratio * 100)} % de los retos practicados: la navegación libre quedó habilitada.
        </div>
      )}

      {canUseGlobal ? (
        <div className="tut-map-tabs" role="tablist">
          {comps.map((c) => (
            <button key={c} role="tab" aria-selected={tab === c} className={`tut-map-tab ${tab === c ? 'on' : ''}`} onClick={() => setTab(c)}>{COMPONENTS[c]}</button>
          ))}
        </div>
      ) : (
        <div className="tut-seq">
          <div>
            <div className="tut-sub">Siguiente reto · paso {nextSeq.idx + 1} de 9 · {COMPONENTS[nextSeq.comp]}</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{challengeOf(nextSeq.comp, nextSeq.step)?.titulo ?? nextSeq.step}</div>
          </div>
          <button type="button" className="tut-btn" onClick={() => go(nextSeq.comp, nextSeq.step)}>Ir <ArrowRight size={14} /></button>
        </div>
      )}

      {shownComps.map((comp) => (
        <div key={comp}>
          {!canUseGlobal && <div className="tut-sub" style={{ marginBottom: 6 }}>Ruta de «{COMPONENTS[comp]}» · los demás componentes aparecen al avanzar</div>}
          <div className="tut-map-grid">
            {(compact ? LADDER.slice(0, 6) : LADDER).map((step) => {
              const ch = challengeOf(comp, step);
              const status = cellStatus(comp, step);
              const lock = isLocked(comp, step);
              const isZdp = overlay?.[comp]?.zdp_step === step;
              const p = overlay?.[comp]?.steps?.[step]?.p ?? 0.5;
              return (
                <button
                  key={step}
                  type="button"
                  className={`tut-cell ${status} ${lock ? 'locked' : ''} ${isZdp ? 'zdp' : ''}`}
                  disabled={Boolean(lock)}
                  title={lock ?? undefined}
                  onClick={() => !lock && go(comp, step)}
                >
                  <div className="tut-cell-step"><span>{step.replace('-', ' · ')}</span>{isZdp && <span style={{ color: 'var(--accent)', fontWeight: 700 }}>ZDP</span>}</div>
                  <div className="tut-cell-title">{ch?.titulo ?? '—'}</div>
                  <div className="tut-cell-status">
                    {lock ? <><Lock size={11} /> {lock}</> : <><i className={`tut-dot ${status}`} /> {status === 'dominado' ? 'Dominado' : status === 'en_proceso' ? 'En proceso' : 'Pendiente'} · {Math.round(p * 100)} %</>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
