import { useEffect, useState } from 'react';
import { RefreshCw, Users } from 'lucide-react';
import { api, type ClassMap } from '../../services/api';
import { LEVEL_SHORT, PROFILE_LABEL } from '../../lib/tutorEngine';
import './tutor.css';

const CRIT_ORDER = ['B1', 'B2', 'B3', 'B4', 'M1', 'M2', 'M3', 'M4', 'A1', 'A2', 'A3', 'A4'];

/** Mapa de progresión para el docente: la clase agrupada por zona de desarrollo próximo. */
export function ProgressionMap() {
  const [data, setData] = useState<ClassMap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setData(await api.getClassMap()); } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const levels: ('basico' | 'medio' | 'avanzado')[] = ['basico', 'medio', 'avanzado'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Cada estudiante aparece en el nivel donde está listo para aprender (logra algunos criterios, no todos). Los cuadros muestran los 12 criterios B1–A4: verde logrado, amarillo en progreso.
        </div>
        <button type="button" className="tut-btn ghost" onClick={load} disabled={loading}><RefreshCw size={13} /> {loading ? 'Cargando…' : 'Actualizar'}</button>
      </div>
      {error && <div className="tut-bubble warn">{error}</div>}
      <div className="tut-prog">
        {levels.map((lvl) => (
          <div key={lvl} className="tut-prog-col">
            <h4><span>ZDP · {LEVEL_SHORT[lvl]}</span><span className="tut-chip"><Users size={11} /> {data?.by_zdp?.[lvl] ?? 0}</span></h4>
            {(data?.students ?? []).filter((s) => s.zdp === lvl).map((s) => (
              <div key={s.user_id} className="tut-student" title={`Pendientes: ${s.pending.join(', ') || '—'}`}>
                <b>{s.name || s.email}</b>
                <div className="tut-mini" aria-label="Criterios">
                  {CRIT_ORDER.map((c) => { const p = s.criteria[c] ?? 0.5; return <i key={c} className={p >= 0.7 ? 'on' : p > 0.5 ? 'mid' : ''} title={`${c}: ${Math.round(p * 100)} %`} />; })}
                </div>
                <small>
                  {s.last_profile ? PROFILE_LABEL[s.last_profile] : 'sin calibración'}{s.last_bias !== null ? ` (${s.last_bias > 0 ? '+' : ''}${s.last_bias})` : ''} · {s.challenges_done} retos · {s.learning_style ?? 'estilo ?'}
                </small>
                <small>Técnico: {Object.entries(s.tech).map(([c, st]) => `${c} ${st.replace('-', '·')}`).join(' · ')}</small>
              </div>
            ))}
            {data && (data.students ?? []).filter((s) => s.zdp === lvl).length === 0 && <small style={{ color: 'var(--text-muted)' }}>Sin estudiantes en este nivel.</small>}
          </div>
        ))}
      </div>
    </div>
  );
}
