import { useState, useEffect, useRef } from 'react';
import { Estrategia } from '../data/metacognitiveStrategies';

export interface StrategyEvidence {
  strategyId: string;
  // est1: Descomposición previa
  timeBeforeFirstEdit?: number;    // segundos antes del primer edit
  subtasksCreated?: number;        // subtareas definidas
  // est2: Control de confianza
  jolInicial?: number;             // del Fase A
  jolMedioActividad?: number;      // JOL capturado en checkpoint
  // est3: Verificación de supuestos
  prediccionEscrita?: string;      // texto antes de ejecutar
  comparacionRealizada?: boolean;  // marcó si coincidió
  // est4: Estimación de tiempo
  tiempoEstimado?: number;         // minutos estimados en JOL
  tiempoReal?: number;             // segundos reales
  // est5: Mapeo de lo que no sé
  dudasListadas?: string[];        // lista de dudas
  ayudasSolicitadas?: number;      // clics en pista
  // est6: Registro de evidencias
  erroresCorregidos?: number;
  tareasCompletadas?: number;
  // est7: Submetas
  porcentajeCompletado?: number;
  continuidadTrabajo?: boolean;
  // est8: Reencuadre de errores
  reflexionesError?: string[];     // texto después de cada error
}

interface Props {
  strategy: Estrategia;
  seconds: number;           // tiempo transcurrido en Fase B
  editCount: number;
  errCount: number;
  totalRuns: number;
  hintCount: number;
  clickCount?: number;       // total clics
  isChallengeDone: boolean;
  criteriaCount: number;     // total criterios
  jolInicial?: number;       // JOL promedio de Fase A
  estimatedMinutes?: number; // minutos estimados por el estudiante
  isCodeChallenge?: boolean; // si es reto de código
  onEvidence: (evidence: Partial<StrategyEvidence>) => void;
}

export function StrategyMonitor({
  strategy, seconds, editCount, errCount, totalRuns, hintCount, clickCount = 0,
  isChallengeDone, criteriaCount, jolInicial, estimatedMinutes, isCodeChallenge = true, onEvidence
}: Props) {

  // Estado interno por estrategia
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [jolCheckpoint, setJolCheckpoint] = useState<number | null>(null);
  const [showJolCapture, setShowJolCapture] = useState(false);
  const [prediccion, setPrediccion] = useState('');
  const [prediccionConfirmada, setPrediccionConfirmada] = useState(false);
  const [coincidio, setCoincidio] = useState<boolean | null>(null);
  const [dudas, setDudas] = useState<string[]>([]);
  const [nuevaDuda, setNuevaDuda] = useState('');
  const [reflexionesError, setReflexionesError] = useState<string[]>([]);
  const [reflexionActual, setReflexionActual] = useState('');
  const [prevErrCount, setPrevErrCount] = useState(errCount);
  const [timeBeforeEdit, setTimeBeforeEdit] = useState<number | null>(null);
  const startTime = useRef(Date.now());
  const firstEditRegistered = useRef(false);

  // Detectar primer edit o interacción para estrategia est1
  useEffect(() => {
    if (strategy.id === 'est1' && !firstEditRegistered.current) {
      const isInteracted = isCodeChallenge ? editCount > 0 : clickCount > 2;
      if (isInteracted) {
        firstEditRegistered.current = true;
        const secs = Math.round((Date.now() - startTime.current) / 1000);
        setTimeBeforeEdit(secs);
        onEvidence({ strategyId: strategy.id, timeBeforeFirstEdit: secs });
      }
    }
  }, [editCount, clickCount, strategy.id, isCodeChallenge]);

  // Detectar nuevo error para estrategia est8
  useEffect(() => {
    if (strategy.id === 'est8' && errCount > prevErrCount) {
      setPrevErrCount(errCount);
      setReflexionActual('');
    }
  }, [errCount, strategy.id]);

  const containerStyle: React.CSSProperties = {
    background: strategy.iconBg,
    border: `1px solid ${strategy.color}33`,
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '14px',
    fontSize: '11px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '9px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    color: strategy.color,
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    borderRadius: '8px',
    border: `1px solid ${strategy.color}44`,
    background: 'var(--fb-bg, #0d1117)',
    color: 'var(--fb-text)',
    fontSize: '11px',
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const btnStyle = (active = false): React.CSSProperties => ({
    padding: '5px 10px',
    borderRadius: '7px',
    border: `1px solid ${strategy.color}55`,
    background: active ? strategy.iconBg : 'transparent',
    color: active ? strategy.color : 'var(--fb-text-muted)',
    fontSize: '10px',
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
    marginTop: '6px',
  });

  const metricRow = (label: string, value: string | number, icon: string, highlight = false) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${strategy.color}22` }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--fb-text-muted)' }}>
        <i className={`ti ${icon}`} style={{ fontSize: '10px', color: strategy.color }}></i>
        {label}
      </span>
      <span style={{ fontWeight: 700, color: highlight ? strategy.color : 'var(--fb-text)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px' }}>{value}</span>
    </div>
  );

  // ─── EST1: Descomposición previa ──────────────────────────────────────
  if (strategy.id === 'est1') {
    const addSubtask = () => {
      if (!newSubtask.trim()) return;
      const updated = [...subtasks, newSubtask.trim()];
      setSubtasks(updated);
      setNewSubtask('');
      onEvidence({ strategyId: strategy.id, subtasksCreated: updated.length });
    };
    return (
      <div style={containerStyle}>
        <div style={labelStyle}><i className="ti ti-list"></i>Monitor · Planificación previa</div>
        {metricRow(isCodeChallenge ? 'Tiempo antes del primer edit' : 'Pausa de planificación inicial', timeBeforeEdit !== null ? `${timeBeforeEdit}s` : '—', 'ti-clock', timeBeforeEdit !== null && timeBeforeEdit > 30)}
        {metricRow('Subtareas definidas', subtasks.length, 'ti-checkbox', subtasks.length > 0)}
        <div style={{ marginTop: '8px' }}>
          <div style={{ fontSize: '10px', color: 'var(--fb-text-muted)', marginBottom: '4px' }}>
            {isCodeChallenge ? 'Agrega subtareas antes de codificar:' : 'Agrega subtareas antes de interactuar:'}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              style={{ ...inputStyle, flex: 1, padding: '4px 6px' }}
              value={newSubtask}
              onChange={e => setNewSubtask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSubtask()}
              placeholder={isCodeChallenge ? "ej. Leer enunciado..." : "ej. Entender la interfaz..."}
            />
            <button onClick={addSubtask} style={{ ...btnStyle(), width: 'auto', padding: '4px 8px', marginTop: 0 }}>+</button>
          </div>
          {subtasks.map((s, i) => (
            <div key={i} style={{ fontSize: '10px', color: 'var(--fb-text-muted)', padding: '3px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <i className="ti ti-check" style={{ color: strategy.color, fontSize: '9px' }}></i>{s}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── EST2: Control de confianza ───────────────────────────────────────
  if (strategy.id === 'est2') {
    const handleJolCheckpoint = (val: number) => {
      setJolCheckpoint(val);
      setShowJolCapture(false);
      onEvidence({ strategyId: strategy.id, jolMedioActividad: val, jolInicial });
    };
    return (
      <div style={containerStyle}>
        <div style={labelStyle}><i className="ti ti-adjustments-horizontal"></i>Monitor · Confianza en tiempo real</div>
        {metricRow('JOL inicial (Fase A)', jolInicial !== undefined ? `${jolInicial.toFixed(1)}/10` : '—', 'ti-star')}
        {metricRow('JOL checkpoint', jolCheckpoint !== null ? `${jolCheckpoint}/10` : '—', 'ti-star', jolCheckpoint !== null)}
        {jolCheckpoint !== null && jolInicial !== undefined && (
          <div style={{ fontSize: '10px', marginTop: '6px', padding: '4px 8px', borderRadius: '6px', background: Math.abs(jolCheckpoint - jolInicial * 2) > 2 ? 'rgba(255,123,114,0.1)' : 'rgba(93,202,165,0.1)', color: Math.abs(jolCheckpoint - jolInicial * 2) > 2 ? '#ff7b72' : '#5dcaa5' }}>
            {Math.abs(jolCheckpoint - jolInicial * 2) > 2 ? '⚠ Variación alta de confianza detectada' : '✓ Confianza estable'}
          </div>
        )}
        {!showJolCapture ? (
          <button style={btnStyle()} onClick={() => setShowJolCapture(true)}>
            <i className="ti ti-refresh" style={{ marginRight: '4px', fontSize: '9px' }}></i>
            Registrar confianza ahora
          </button>
        ) : (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '10px', color: 'var(--fb-text-muted)', marginBottom: '6px' }}>¿Qué tan seguro/a te sientes ahora? (1–10)</div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button key={n} onClick={() => handleJolCheckpoint(n)} style={{
                  padding: '4px 7px', borderRadius: '6px', border: `1px solid ${strategy.color}55`,
                  background: 'transparent', color: 'var(--fb-text)', fontSize: '11px', fontWeight: 700, cursor: 'pointer'
                }}>{n}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── EST3: Verificación de supuestos ─────────────────────────────────
  if (strategy.id === 'est3') {
    const handleConfirmPrediccion = () => {
      if (!prediccion.trim()) return;
      setPrediccionConfirmada(true);
      onEvidence({ strategyId: strategy.id, prediccionEscrita: prediccion });
    };
    const handleCoincidio = (val: boolean) => {
      setCoincidio(val);
      onEvidence({ strategyId: strategy.id, prediccionEscrita: prediccion, comparacionRealizada: val });
    };
    return (
      <div style={containerStyle}>
        <div style={labelStyle}><i className="ti ti-message-question"></i>Monitor · Supuestos antes de validar</div>
        {!prediccionConfirmada ? (
          <>
            <div style={{ fontSize: '10px', color: 'var(--fb-text-muted)', marginBottom: '4px' }}>
              {isCodeChallenge ? 'Antes de ejecutar, ¿qué esperas que ocurra?' : 'Antes de validar tu respuesta, ¿qué esperas que ocurra?'}
            </div>
            <textarea
              style={{ ...inputStyle, minHeight: '50px' }}
              value={prediccion}
              onChange={e => setPrediccion(e.target.value)}
              placeholder={isCodeChallenge ? "Espero que este código haga..." : "Espero que esta respuesta/acción haga..."}
            />
            <button style={btnStyle(prediccion.trim().length > 5)} onClick={handleConfirmPrediccion} disabled={prediccion.trim().length < 5}>
              Registrar predicción
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: '10px', color: strategy.color, marginBottom: '4px' }}>✓ Predicción registrada</div>
            <div style={{ fontSize: '10px', color: 'var(--fb-text-muted)', marginBottom: '6px', fontStyle: 'italic' }}>"{prediccion}"</div>
            {totalRuns > 0 && coincidio === null && (
              <>
                <div style={{ fontSize: '10px', color: 'var(--fb-text-muted)', marginBottom: '6px' }}>
                  {isCodeChallenge ? 'Después de ejecutar, ¿coincidió con lo esperado?' : 'Al validar, ¿coincidió con lo esperado?'}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleCoincidio(true)} style={{ ...btnStyle(), width: '50%', marginTop: 0, color: '#5dcaa5', borderColor: '#5dcaa533' }}>✓ Sí</button>
                  <button onClick={() => handleCoincidio(false)} style={{ ...btnStyle(), width: '50%', marginTop: 0, color: '#ff7b72', borderColor: '#ff7b7233' }}>✗ No</button>
                </div>
              </>
            )}
            {coincidio !== null && (
              <div style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '6px', background: coincidio ? 'rgba(93,202,165,0.1)' : 'rgba(255,123,114,0.1)', color: coincidio ? '#5dcaa5' : '#ff7b72', marginTop: '4px' }}>
                {coincidio ? '✓ Supuesto validado' : '⚠ Discrepancia detectada — ¡buena evidencia de aprendizaje!'}
              </div>
            )}
          </>
        )}
        {metricRow(isCodeChallenge ? 'Ejecuciones' : 'Intentos de validación', totalRuns, 'ti-player-play')}
      </div>
    );
  }

  // ─── EST4: Estimación de tiempo ───────────────────────────────────────
  if (strategy.id === 'est4') {
    const realMin = Math.round(seconds / 60);
    const estimMin = estimatedMinutes || 0;
    const desfase = realMin - estimMin;
    const desfasePct = estimMin > 0 ? Math.round((desfase / estimMin) * 100) : 0;
    useEffect(() => {
      onEvidence({ strategyId: strategy.id, tiempoEstimado: estimMin, tiempoReal: seconds });
    }, [seconds]);
    return (
      <div style={containerStyle}>
        <div style={labelStyle}><i className="ti ti-clock"></i>Monitor · Estimación vs realidad</div>
        {metricRow('Tiempo estimado (Fase A)', `${estimMin} min`, 'ti-target')}
        {metricRow('Tiempo transcurrido', `${realMin} min`, 'ti-clock', realMin > estimMin)}
        <div style={{ marginTop: '6px', padding: '4px 8px', borderRadius: '6px', background: Math.abs(desfasePct) < 20 ? 'rgba(93,202,165,0.1)' : 'rgba(255,123,114,0.1)', color: Math.abs(desfasePct) < 20 ? '#5dcaa5' : '#ff7b72', fontSize: '10px' }}>
          {desfase === 0 ? 'Estimación perfecta' : desfase > 0 ? `+${desfase} min sobre lo estimado (${desfasePct}%)` : `${Math.abs(desfase)} min menos de lo estimado`}
        </div>
        <div style={{ marginTop: '6px', background: `${strategy.color}22`, borderRadius: '8px', height: '6px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: strategy.color, width: estimMin > 0 ? `${Math.min((realMin / estimMin) * 100, 100)}%` : '0%', borderRadius: '8px', transition: 'width 1s' }} />
        </div>
      </div>
    );
  }

  // ─── EST5: Mapeo de lo que no sé ─────────────────────────────────────
  if (strategy.id === 'est5') {
    const addDuda = () => {
      if (!nuevaDuda.trim()) return;
      const updated = [...dudas, nuevaDuda.trim()];
      setDudas(updated);
      setNuevaDuda('');
      onEvidence({ strategyId: strategy.id, dudasListadas: updated, ayudasSolicitadas: hintCount });
    };
    useEffect(() => {
      onEvidence({ strategyId: strategy.id, ayudasSolicitadas: hintCount, dudasListadas: dudas });
    }, [hintCount]);
    return (
      <div style={containerStyle}>
        <div style={labelStyle}><i className="ti ti-zoom-question"></i>Monitor · Dudas reales</div>
        {metricRow('Pistas solicitadas', hintCount, 'ti-bulb', hintCount > 0)}
        {metricRow('Dudas registradas', dudas.length, 'ti-help', dudas.length > 0)}
        <div style={{ marginTop: '8px' }}>
          <div style={{ fontSize: '10px', color: 'var(--fb-text-muted)', marginBottom: '4px' }}>Registra lo que no sabes:</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              style={{ ...inputStyle, flex: 1, padding: '4px 6px' }}
              value={nuevaDuda}
              onChange={e => setNuevaDuda(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addDuda()}
              placeholder="No sé cómo..."
            />
            <button onClick={addDuda} style={{ ...btnStyle(), width: 'auto', padding: '4px 8px', marginTop: 0 }}>+</button>
          </div>
          {dudas.map((d, i) => (
            <div key={i} style={{ fontSize: '10px', color: 'var(--fb-text-muted)', padding: '3px 0', display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
              <i className="ti ti-question-mark" style={{ color: strategy.color, fontSize: '9px', marginTop: '1px' }}></i>{d}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── EST6: Registro de evidencias de competencia ─────────────────────
  if (strategy.id === 'est6') {
    useEffect(() => {
      onEvidence({ strategyId: strategy.id, erroresCorregidos: errCount, tareasCompletadas: isChallengeDone ? criteriaCount : 0 });
    }, [errCount, isChallengeDone]);
    return (
      <div style={containerStyle}>
        <div style={labelStyle}><i className="ti ti-trophy"></i>Monitor · Avances logrados</div>
        {metricRow('Intentos realizados', totalRuns, 'ti-player-play')}
        {metricRow(isCodeChallenge ? 'Errores detectados' : 'Intentos incorrectos', errCount, 'ti-bug', errCount > 0)}
        {metricRow('Criterios alcanzados', isChallengeDone ? `${criteriaCount}/${criteriaCount}` : `0/${criteriaCount}`, 'ti-check', isChallengeDone)}
        <div style={{ fontSize: '10px', color: 'var(--fb-text-muted)', marginTop: '6px' }}>
          {isChallengeDone
            ? <span style={{ color: '#5dcaa5', fontWeight: 700 }}>✓ Reto completado — evidencia registrada</span>
            : errCount > 0 && totalRuns > 0
            ? <span style={{ color: strategy.color }}>{isCodeChallenge ? 'Cada error corregido es un avance registrado' : 'Cada intento corregido es un avance registrado'}</span>
            : 'Continúa trabajando para generar evidencias'}
        </div>
      </div>
    );
  }

  // ─── EST7: Submetas visibles ──────────────────────────────────────────
  if (strategy.id === 'est7') {
    const pct = isChallengeDone ? 100 : Math.min(95, isCodeChallenge ? Math.round((Math.min(totalRuns, criteriaCount) / criteriaCount) * 100) : Math.round((Math.min(clickCount, criteriaCount * 3) / (criteriaCount * 3 || 1)) * 100));
    const continuidad = seconds > 60 && (isCodeChallenge ? editCount > 0 : clickCount > 3);
    useEffect(() => {
      onEvidence({ strategyId: strategy.id, porcentajeCompletado: pct, continuidadTrabajo: continuidad });
    }, [pct, continuidad]);
    return (
      <div style={containerStyle}>
        <div style={labelStyle}><i className="ti ti-stairs"></i>Monitor · Progreso gradual</div>
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--fb-text-muted)', marginBottom: '4px' }}>
            <span>Progreso estimado</span>
            <span style={{ color: strategy.color, fontWeight: 700 }}>{pct}%</span>
          </div>
          <div style={{ background: `${strategy.color}22`, borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: strategy.color, width: `${pct}%`, borderRadius: '6px', transition: 'width 1s' }} />
          </div>
        </div>
        {metricRow('Tiempo activo', `${Math.round(seconds / 60)} min`, 'ti-clock')}
        {metricRow('Continuidad', continuidad ? 'Activa' : 'Iniciando', 'ti-activity', continuidad)}
        {isCodeChallenge 
          ? metricRow('Ediciones realizadas', editCount, 'ti-pencil', editCount > 5)
          : metricRow('Clics en el tablero', clickCount, 'ti-hand-click', clickCount > 10)}
        <div style={{ fontSize: '10px', marginTop: '6px', color: isChallengeDone ? '#5dcaa5' : strategy.color }}>
          {isChallengeDone ? '🎉 ¡Todas las submetas completadas!' : `${criteriaCount} hitos por completar`}
        </div>
      </div>
    );
  }

  // ─── EST8: Reencuadre de errores ──────────────────────────────────────
  if (strategy.id === 'est8') {
    const handleReflexion = () => {
      if (!reflexionActual.trim()) return;
      const updated = [...reflexionesError, reflexionActual.trim()];
      setReflexionesError(updated);
      setReflexionActual('');
      onEvidence({ strategyId: strategy.id, reflexionesError: updated });
    };
    return (
      <div style={containerStyle}>
        <div style={labelStyle}><i className="ti ti-message-share"></i>Monitor · Reencuadre de errores</div>
        {metricRow(isCodeChallenge ? 'Errores ocurridos' : 'Intentos fallidos', errCount, 'ti-bug', errCount > 0)}
        {metricRow('Reflexiones registradas', reflexionesError.length, 'ti-writing', reflexionesError.length > 0)}
        {errCount > 0 && reflexionesError.length < errCount && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '10px', color: strategy.color, fontWeight: 700, marginBottom: '4px' }}>
              {isCodeChallenge ? '¿Qué te indica este error?' : '¿Qué te indica este fallo/intento incorrecto?'}
            </div>
            <textarea
              style={{ ...inputStyle, minHeight: '44px' }}
              value={reflexionActual}
              onChange={e => setReflexionActual(e.target.value)}
              placeholder={isCodeChallenge ? "Este error me dice que..." : "Este fallo me indica que..."}
            />
            <button style={btnStyle(reflexionActual.trim().length > 5)} onClick={handleReflexion} disabled={reflexionActual.trim().length < 5}>
              Registrar reflexión
            </button>
          </div>
        )}
        {reflexionesError.length > 0 && (
          <div style={{ marginTop: '6px' }}>
            {reflexionesError.map((r, i) => (
              <div key={i} style={{ fontSize: '10px', color: 'var(--fb-text-muted)', padding: '3px 0', display: 'flex', gap: '5px' }}>
                <i className="ti ti-messages" style={{ color: strategy.color, fontSize: '9px', flexShrink: 0, marginTop: '2px' }}></i>
                <span>{r}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
