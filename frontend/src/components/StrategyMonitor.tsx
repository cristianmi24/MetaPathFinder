import { useState, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { Estrategia } from '../data/metacognitiveStrategies';

export interface StrategyEvidence {
  strategyId: string;
  // est1 (retirada): Descomposición previa
  timeBeforeFirstEdit?: number;
  subtasksCreated?: number;
  // est2: Termómetro de confianza
  jolInicial?: number;
  jolMedioActividad?: number;
  checkpointsConfianza?: number[];
  // est3 (retirada): Verificación de supuestos
  prediccionEscrita?: string;
  comparacionRealizada?: boolean;
  // est4: Reloj del reto
  tiempoEstimado?: number;
  tiempoReal?: number;
  autoevaluacionTiempo?: string;
  // est5 (retirada): Mapeo de lo que no sé
  dudasListadas?: string[];
  ayudasSolicitadas?: number;
  // est6 (retirada): Registro de evidencias
  erroresCorregidos?: number;
  tareasCompletadas?: number;
  // est7: Metas paso a paso
  porcentajeCompletado?: number;
  continuidadTrabajo?: boolean;
  // est8: ¿Qué me dice el error?
  reflexionesError?: string[];
}

interface Props {
  strategy: Estrategia;
  seconds: number;
  editCount: number;
  errCount: number;
  totalRuns: number;
  hintCount: number;
  clickCount?: number;
  isChallengeDone: boolean;
  criteriaCount: number;
  criteriaLabels?: string[];
  jolInicial?: number;
  estimatedMinutes?: number;
  isCodeChallenge?: boolean;
  /** Ya no se usa (las herramientas no piden escribir); se mantiene por compatibilidad. */
  placeholderHint?: string;
  onEvidence: (evidence: Partial<StrategyEvidence>) => void;
  /** Avisa que la herramienta necesita al estudiante (p. ej. checkpoint de confianza). */
  onAttention?: () => void;
  /** Abre la siguiente pista del reto. */
  onRequestHint?: () => void;
}

const CHECKPOINT_SECONDS = 180;

const CAUSAS = [
  { id: 'lectura', label: 'No leí bien la instrucción', icon: 'ti-book' },
  { id: 'concepto', label: 'Confundí una idea', icon: 'ti-arrows-shuffle' },
  { id: 'descuido', label: 'Fue un descuido', icon: 'ti-mood-surprised' },
  { id: 'azar', label: 'Probé al azar', icon: 'ti-dice-3' },
];
const SIGUIENTES = [
  { id: 'releer', label: 'Releer las metas del reto', icon: 'ti-list-check' },
  { id: 'pista', label: 'Pedir una pista', icon: 'ti-bulb' },
  { id: 'otra', label: 'Probar de otra forma', icon: 'ti-route' },
];
const RITMO = [
  { id: 'bien', label: 'Voy bien', icon: 'ti-mood-happy', color: '#2da77a' },
  { id: 'tiempo', label: 'Necesito más tiempo', icon: 'ti-hourglass', color: '#d29922' },
  { id: 'atascado', label: 'Estoy atascado/a', icon: 'ti-mood-confuzed', color: '#e5534b' },
];

export function StrategyMonitor({
  strategy, seconds, editCount, errCount, hintCount, clickCount = 0,
  isChallengeDone, criteriaCount, criteriaLabels = [], jolInicial, estimatedMinutes,
  isCodeChallenge = true, onEvidence, onAttention, onRequestHint,
}: Props) {
  const onEvidenceRef = useRef(onEvidence);
  onEvidenceRef.current = onEvidence;
  const c = strategy.color;

  // ── Estado de cada herramienta ─────────────────────────────────────────
  const [hechas, setHechas] = useState<boolean[]>([]);
  const [metaActual, setMetaActual] = useState<number | null>(null);
  const [checkpoints, setCheckpoints] = useState<number[]>([]);
  const [pideConfianza, setPideConfianza] = useState(false);
  const [ritmo, setRitmo] = useState<string | null>(null);
  const [preguntaRitmo, setPreguntaRitmo] = useState(false);
  const [registros, setRegistros] = useState<{ causa: string; paso?: string }[]>([]);
  const [causaPendiente, setCausaPendiente] = useState<string | null>(null);
  const lastCheckpointAt = useRef(0);

  const metas = criteriaLabels.length > 0
    ? criteriaLabels.map((t) => t.replace(/^\d+\.\s*/, ''))
    : Array.from({ length: criteriaCount }, (_, i) => `Meta ${i + 1}`);

  // est2: aviso cada 3 minutos
  useEffect(() => {
    if (strategy.id !== 'est2' || seconds <= 0) return;
    if (seconds - lastCheckpointAt.current >= CHECKPOINT_SECONDS) {
      lastCheckpointAt.current = seconds;
      setPideConfianza(true);
      onAttention?.();
    }
  }, [seconds, strategy.id]);

  // est4: a mitad del tiempo estimado (o a los 5 min si no hay estimación) pregunta cómo va
  const estim = estimatedMinutes || 0;
  const mitad = estim > 0 ? (estim * 60) / 2 : 300;
  useEffect(() => {
    if (strategy.id !== 'est4' || ritmo || preguntaRitmo) return;
    if (seconds >= mitad) {
      setPreguntaRitmo(true);
      onAttention?.();
    }
  }, [seconds, strategy.id, ritmo, preguntaRitmo, mitad]);

  // est4: el tiempo se reporta como máximo una vez por minuto
  const lastMinute = useRef(-1);
  useEffect(() => {
    if (strategy.id !== 'est4') return;
    const m = Math.floor(seconds / 60);
    if (m === lastMinute.current) return;
    lastMinute.current = m;
    onEvidenceRef.current({ strategyId: strategy.id, tiempoEstimado: estim, tiempoReal: seconds });
  }, [strategy.id, seconds, estim]);

  // est8: un nuevo intento fallido pide atención
  const lastErr = useRef(errCount);
  useEffect(() => {
    if (strategy.id === 'est8' && errCount > lastErr.current) onAttention?.();
    lastErr.current = errCount;
  }, [errCount, strategy.id]);

  // est7: al completar el reto, 100 %
  const reported100 = useRef(false);
  useEffect(() => {
    if (strategy.id !== 'est7' || !isChallengeDone || reported100.current) return;
    reported100.current = true;
    onEvidenceRef.current({ strategyId: strategy.id, porcentajeCompletado: 100, continuidadTrabajo: seconds > 60 });
  }, [strategy.id, isChallengeDone, seconds]);

  // ── Piezas de interfaz ─────────────────────────────────────────────────
  const howTo = (text: string) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 12, background: strategy.iconBg, color: 'var(--text)', fontSize: 13, lineHeight: 1.45 }}>
      <i className="ti ti-hand-finger" style={{ color: c, fontSize: 16, marginTop: 1 }} />
      <span>{text}</span>
    </div>
  );
  const sectionTitle = (text: string, icon: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
      <i className={`ti ${icon}`} style={{ color: c, fontSize: 15 }} />{text}
    </div>
  );
  const chip = (key: string, label: string, icon: string, onClick: () => void, active = false, tone = c): ReactNode => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 12px', borderRadius: 999,
        border: `1.5px solid ${active ? tone : 'var(--border)'}`, background: active ? `${tone}1f` : 'var(--surface)',
        color: active ? tone : 'var(--text)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 15, color: tone }} />{label}
    </button>
  );
  const message = (text: string, tone: string, action?: ReactNode) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: `${tone}17`, border: `1px solid ${tone}40`, color: 'var(--text)', fontSize: 13 }}>
      <span style={{ flex: 1, minWidth: 160 }}>{text}</span>
      {action}
    </div>
  );
  const hintButton = onRequestHint && (
    <button type="button" onClick={onRequestHint} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, border: 'none', background: c, color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
      <i className="ti ti-bulb" /> Ver una pista
    </button>
  );
  const wrap: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 14 };

  // ── est7 · Metas paso a paso ───────────────────────────────────────────
  if (strategy.id === 'est7') {
    const done = (i: number) => isChallengeDone || !!hechas[i];
    const nDone = metas.filter((_, i) => done(i)).length;
    const pct = metas.length ? Math.round((nDone / metas.length) * 100) : 0;
    const report = (next: boolean[]) => {
      const n = metas.filter((_, i) => next[i]).length;
      onEvidence({ strategyId: strategy.id, porcentajeCompletado: Math.round((n / Math.max(metas.length, 1)) * 100), continuidadTrabajo: seconds > 60, subtasksCreated: n });
    };
    const cumplir = (i: number) => {
      const next = [...hechas];
      next[i] = !next[i];
      setHechas(next);
      report(next);
      if (next[i]) {
        const siguiente = metas.findIndex((_, j) => !next[j] && j !== i);
        setMetaActual(siguiente >= 0 ? siguiente : null);
      }
    };
    return (
      <div style={wrap}>
        {howTo(metaActual === null && nDone === 0
          ? 'Toca la meta por la que vas a empezar.'
          : 'Cuando cumplas tu meta en la actividad, pulsa «¡La cumplí!».')}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>Tu avance</span><strong style={{ color: c }}>{nDone} de {metas.length} metas</strong>
          </div>
          <div style={{ height: 10, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: 99, transition: 'width .4s' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {metas.map((m, i) => {
            const isDone = done(i);
            const isNow = metaActual === i && !isDone;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, border: `1.5px solid ${isNow ? c : 'var(--border)'}`, background: isDone ? `${c}12` : 'var(--surface)' }}>
                <button
                  type="button"
                  onClick={() => (isDone ? cumplir(i) : setMetaActual(i))}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', color: 'var(--text)' }}
                >
                  <i className={`ti ${isDone ? 'ti-circle-check-filled' : isNow ? 'ti-target-arrow' : 'ti-circle'}`} style={{ fontSize: 20, color: isDone || isNow ? c : 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, lineHeight: 1.4, textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.7 : 1 }}>
                    {isNow && <strong style={{ color: c }}>Ahora: </strong>}{m}
                  </span>
                </button>
                {isNow && (
                  <button type="button" onClick={() => cumplir(i)} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 999, border: 'none', background: c, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    ¡La cumplí!
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {nDone === metas.length && metas.length > 0 && message('¡Todas tus metas listas! Vuelve a la actividad y pulsa «Verificar».', '#2da77a')}
      </div>
    );
  }

  // ── est2 · Termómetro de confianza ─────────────────────────────────────
  if (strategy.id === 'est2') {
    const marcar = (v: number) => {
      const next = [...checkpoints, v];
      setCheckpoints(next);
      setPideConfianza(false);
      onEvidence({ strategyId: strategy.id, jolInicial, jolMedioActividad: v, checkpointsConfianza: next });
    };
    const ultima = checkpoints[checkpoints.length - 1];
    const serie = [...(jolInicial !== undefined ? [Math.round(jolInicial)] : []), ...checkpoints];
    const diff = ultima !== undefined && jolInicial !== undefined ? ultima - jolInicial : 0;
    const siguienteEn = Math.max(0, CHECKPOINT_SECONDS - (seconds - lastCheckpointAt.current));
    return (
      <div style={wrap}>
        {howTo('Cuando te avisemos, toca qué tan seguro/a te sientes ahora (1 = nada, 10 = totalmente).')}
        <div style={{ padding: 14, borderRadius: 14, border: `1.5px solid ${pideConfianza ? c : 'var(--border)'}`, background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sectionTitle(pideConfianza ? '¡Hora de revisar! ¿Qué tan seguro/a te sientes?' : '¿Qué tan seguro/a te sientes ahora?', 'ti-temperature')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => marcar(n)}
                aria-label={`Confianza ${n}`}
                style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${c}55`, background: ultima === n ? c : 'var(--surface)', color: ultima === n ? '#fff' : 'var(--text)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >{n}</button>
            ))}
          </div>
          {!pideConfianza && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Próximo aviso en {Math.floor(siguienteEn / 60)}:{String(siguienteEn % 60).padStart(2, '0')}</div>}
        </div>
        {serie.length > 0 && (
          <div>
            {sectionTitle('Mi termómetro', 'ti-chart-line')}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90, marginTop: 10, padding: '0 4px', borderBottom: '1px solid var(--border)' }}>
              {serie.map((v, i) => (
                <div key={i} style={{ flex: 1, maxWidth: 34, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{v}</span>
                  <div style={{ width: '100%', height: `${v * 6}px`, borderRadius: '6px 6px 0 0', background: i === 0 && jolInicial !== undefined ? 'var(--text-muted)' : c, opacity: i === 0 && jolInicial !== undefined ? 0.45 : 1 }} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{jolInicial !== undefined ? 'La primera barra (gris) es tu confianza al empezar.' : 'Cada barra es una de tus marcas.'}</div>
          </div>
        )}
        {ultima !== undefined && jolInicial !== undefined && (
          diff <= -2
            ? message('Tu confianza bajó desde el inicio. Es buen momento para pedir ayuda.', '#e5534b', hintButton)
            : diff >= 2
              ? message('¡Vas ganando seguridad! Asegúrate de verificarlo en la actividad.', '#2da77a')
              : message('Tu confianza se mantiene estable.', c)
        )}
      </div>
    );
  }

  // ── est4 · Reloj del reto ──────────────────────────────────────────────
  if (strategy.id === 'est4') {
    const mins = Math.floor(seconds / 60);
    const pct = estim > 0 ? Math.min(100, Math.round((seconds / (estim * 60)) * 100)) : 0;
    const pasado = estim > 0 && seconds > estim * 60;
    const elegir = (id: string) => {
      setRitmo(id);
      setPreguntaRitmo(false);
      onEvidence({ strategyId: strategy.id, tiempoEstimado: estim, tiempoReal: seconds, autoevaluacionTiempo: id });
    };
    return (
      <div style={wrap}>
        {howTo('Mira cuánto llevas frente a lo que calculaste. A mitad de tiempo te preguntaremos cómo vas.')}
        <div style={{ padding: 14, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sectionTitle('Reloj vs. mi cálculo', 'ti-hourglass')}
          <div style={{ fontSize: 26, fontWeight: 700, color: pasado ? '#e5534b' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
            {mins} min <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>{estim > 0 ? `de ${estim} min que calculaste` : 'transcurridos'}</span>
          </div>
          {estim > 0 && (
            <div style={{ height: 10, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pasado ? '#e5534b' : c, borderRadius: 99, transition: 'width 1s' }} />
            </div>
          )}
          {pasado && <div style={{ fontSize: 12, color: '#e5534b' }}>Ya pasaste el tiempo que calculaste: está bien, solo tenlo en cuenta para la próxima vez.</div>}
        </div>
        <div style={{ padding: 14, borderRadius: 14, border: `1.5px solid ${preguntaRitmo ? c : 'var(--border)'}`, background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sectionTitle(preguntaRitmo ? '¡Vas a mitad de camino! ¿Cómo vas?' : '¿Cómo voy?', 'ti-traffic-lights')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {RITMO.map((r) => chip(r.id, r.label, r.icon, () => elegir(r.id), ritmo === r.id, r.color))}
          </div>
          {ritmo === 'bien' && message('¡Bien! Sigue con el mismo ritmo.', '#2da77a')}
          {ritmo === 'tiempo' && message('Tranquilo/a: termina tu meta actual antes de empezar otra.', '#d29922')}
          {ritmo === 'atascado' && message('Pedir ayuda a tiempo es una buena estrategia.', '#e5534b', hintButton)}
        </div>
      </div>
    );
  }

  // ── est8 · ¿Qué me dice el error? ──────────────────────────────────────
  if (strategy.id === 'est8') {
    const pendiente = errCount > registros.length;
    const guardar = (causa: string, paso: string) => {
      const next = [...registros, { causa, paso }];
      setRegistros(next);
      setCausaPendiente(null);
      onEvidence({
        strategyId: strategy.id,
        reflexionesError: next.map((r) => `${CAUSAS.find((x) => x.id === r.causa)?.label} → ${SIGUIENTES.find((x) => x.id === r.paso)?.label}`),
      });
      if (paso === 'pista') onRequestHint?.();
    };
    const conteo = registros.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.causa]: (acc[r.causa] || 0) + 1 }), {});
    const frecuente = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0];
    return (
      <div style={wrap}>
        {howTo(isCodeChallenge
          ? 'Cuando un intento no funcione, elige por qué pasó y qué harás distinto.'
          : 'Cuando una verificación no salga, elige por qué pasó y qué harás distinto.')}
        {!pendiente && registros.length === 0 && message('Aún no hay intentos fallidos. Si alguno no sale, aquí lo convertimos en una pista.', c)}
        {pendiente && (
          <div style={{ padding: 14, borderRadius: 14, border: `1.5px solid ${c}`, background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!causaPendiente ? (
              <>
                {sectionTitle(`Intento ${registros.length + 1} no salió. ¿Por qué crees que pasó?`, 'ti-help-circle')}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CAUSAS.map((x) => chip(x.id, x.label, x.icon, () => setCausaPendiente(x.id)))}
                </div>
              </>
            ) : (
              <>
                {sectionTitle('¿Qué harás ahora?', 'ti-arrow-forward-up')}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {SIGUIENTES.map((x) => chip(x.id, x.label, x.icon, () => guardar(causaPendiente, x.id)))}
                </div>
                <button type="button" onClick={() => setCausaPendiente(null)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', padding: 0 }}>
                  ← Cambiar la causa
                </button>
              </>
            )}
          </div>
        )}
        {registros.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sectionTitle('Lo que aprendí de mis errores', 'ti-notebook')}
            {registros.map((r, i) => (
              <div key={i} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Intento {i + 1}:</span>
                <span>{CAUSAS.find((x) => x.id === r.causa)?.label}</span>
                <i className="ti ti-arrow-right" style={{ color: c }} />
                <strong>{SIGUIENTES.find((x) => x.id === r.paso)?.label}</strong>
              </div>
            ))}
          </div>
        )}
        {registros.length >= 2 && frecuente && frecuente[1] >= 2 && message(`Se repite «${CAUSAS.find((x) => x.id === frecuente[0])?.label}». Fíjate en eso en tu próximo intento.`, '#d29922')}
        {isChallengeDone && registros.length > 0 && message('¡Lo lograste! Tus errores te llevaron a la solución.', '#2da77a')}
      </div>
    );
  }

  // Estrategias retiradas: no deberían llegar aquí (se resuelven con getEstrategia)
  void editCount; void clickCount; void hintCount;
  return null;
}
