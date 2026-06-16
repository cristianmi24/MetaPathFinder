import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../ThemeContext';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { EvaluationTracker } from '../components/EvaluationTracker';
import { nuevasEstrategias, Estrategia } from '../data/metacognitiveStrategies';
import './MetacognitiveStrategies.css';

const nivelLabel: Record<number, string> = { 1: 'Básico', 2: 'Medio', 3: 'Avanzado' };
const nivelNext: Record<number, string> = { 1: 'Medio', 2: 'Avanzado', 3: '' };

export function MetacognitiveStrategies() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const {
    currentLevel,
    setCurrentLevel,
    setCurrentChallengeId,
    addEvent,
    assignedStrategyId,
    strategyAssignedRandomly,
    setAssignedStrategyId,
    events,
  } = useCognitiveStore();

  // Estrategia que estuvo activa durante el nivel recién completado
  const currentStrategy: Estrategia | null = assignedStrategyId
    ? (nuevasEstrategias.find(e => e.id === assignedStrategyId) || null)
    : null;

  // Estrategia que el estudiante selecciona para el próximo nivel
  const [selectedId, setSelectedId] = useState<string>(assignedStrategyId || '');
  const [confirmed, setConfirmed] = useState(false);
  const [tooltipId, setTooltipId] = useState<string | null>(null);

  const selectedStrategy = nuevasEstrategias.find(e => e.id === selectedId) || null;
  const isSameStrategy = selectedId === assignedStrategyId;

  // Resumen de monitoreo de Fase B (métricas capturadas)
  const lastChallenge = [...events].reverse().find(e => e.type === 'CHALLENGE_COMPLETED');
  const biometricas = lastChallenge?.metadata?.biometricas || {};
  const tecnicas = lastChallenge?.metadata?.технические_метрики || {};
  const totalTime = biometricas.total_time || 0;
  const clicks = biometricas.clicks || 0;
  const errores = tecnicas.runs || 0;
  const ediciones = tecnicas.edits || 0;

  const handleConfirm = () => {
    if (!selectedId) return;
    setAssignedStrategyId(selectedId, false);
    addEvent('STRATEGY_SELECTED_FOR_NEXT_LEVEL', {
      nivel_completado: nivelLabel[currentLevel],
      estrategia_anterior: assignedStrategyId,
      estrategia_elegida: selectedId,
      misma_estrategia: isSameStrategy,
    });
    setConfirmed(true);

    setTimeout(() => {
      if (currentLevel < 3) {
        setCurrentLevel(currentLevel + 1);
        setCurrentChallengeId(null);
        navigate('/evaluation-prep');
      } else {
        navigate('/student');
      }
    }, 1800);
  };

  const activeTooltip = tooltipId ? nuevasEstrategias.find(e => e.id === tooltipId) : null;

  const renderStrategyEvidences = () => {
    const ev = lastChallenge?.metadata?.evidencias_estrategia || {};
    if (!ev || Object.keys(ev).length === 0) {
      return null;
    }

    const items: { label: string; value: string; icon: string }[] = [];

    if (currentStrategy?.id === 'est1') {
      if (ev.timeBeforeFirstEdit !== undefined) {
        items.push({ label: 'Pausa de planificación inicial', value: `${ev.timeBeforeFirstEdit}s`, icon: 'ti-clock' });
      }
      if (ev.subtasksCreated !== undefined) {
        items.push({ label: 'Subtareas definidas', value: `${ev.subtasksCreated}`, icon: 'ti-list-check' });
      }
    } else if (currentStrategy?.id === 'est2') {
      if (ev.jolInicial !== undefined) {
        items.push({ label: 'Confianza inicial', value: `${ev.jolInicial.toFixed(1)}/10`, icon: 'ti-star' });
      }
      if (ev.jolMedioActividad !== undefined) {
        items.push({ label: 'Confianza en checkpoint', value: `${ev.jolMedioActividad}/10`, icon: 'ti-star-half' });
      }
    } else if (currentStrategy?.id === 'est3') {
      if (ev.prediccionEscrita) {
        items.push({ label: 'Predicción registrada', value: `"${ev.prediccionEscrita}"`, icon: 'ti-message-question' });
      }
      if (ev.comparacionRealizada !== undefined) {
        items.push({ label: 'Predicción contrastada', value: ev.comparacionRealizada ? 'Sí' : 'No', icon: 'ti-arrows-left-right' });
      }
    } else if (currentStrategy?.id === 'est4') {
      if (ev.tiempoEstimado !== undefined) {
        items.push({ label: 'Tiempo planificado', value: `${ev.tiempoEstimado} min`, icon: 'ti-hourglass' });
      }
      if (ev.tiempoReal !== undefined) {
        items.push({ label: 'Tiempo real utilizado', value: `${Math.round(ev.tiempoReal / 60)} min`, icon: 'ti-clock' });
      }
    } else if (currentStrategy?.id === 'est5') {
      if (ev.dudasListadas && ev.dudasListadas.length > 0) {
        items.push({ label: 'Dudas explícitas mapeadas', value: `${ev.dudasListadas.length}`, icon: 'ti-help' });
      }
      if (ev.ayudasSolicitadas !== undefined) {
        items.push({ label: 'Pistas de andamiaje consultadas', value: `${ev.ayudasSolicitadas}`, icon: 'ti-bulb' });
      }
    } else if (currentStrategy?.id === 'est6') {
      if (ev.erroresCorregidos !== undefined) {
        items.push({ label: 'Errores resueltos', value: `${ev.erroresCorregidos}`, icon: 'ti-bug-off' });
      }
      if (ev.tareasCompletadas !== undefined) {
        items.push({ label: 'Hitos alcanzados', value: `${ev.tareasCompletadas}`, icon: 'ti-checkbox' });
      }
    } else if (currentStrategy?.id === 'est7') {
      if (ev.porcentajeCompletado !== undefined) {
        items.push({ label: 'Hitos del reto completados', value: `${ev.porcentajeCompletado}%`, icon: 'ti-stairs' });
      }
      if (ev.continuidadTrabajo !== undefined) {
        items.push({ label: 'Continuidad de trabajo', value: ev.continuidadTrabajo ? 'Estable' : 'Fragmentada', icon: 'ti-activity' });
      }
    } else if (currentStrategy?.id === 'est8') {
      if (ev.reflexionesError && ev.reflexionesError.length > 0) {
        items.push({ label: 'Errores reencuadrados', value: `${ev.reflexionesError.length} reflexiones`, icon: 'ti-message-share' });
      }
    }

    if (items.length === 0) {
      return null;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', borderTop: `1px solid ${currentStrategy?.color}33`, paddingTop: '10px' }}>
        <div style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: currentStrategy?.color, marginBottom: '2px', textAlign: 'left' }}>
          Mapeo de Autorregulación
        </div>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--on-surface-variant)', textAlign: 'left' }}>
              <i className={`ti ${item.icon}`} style={{ fontSize: '11px', color: currentStrategy?.color }}></i>
              {item.label}
            </span>
            <span style={{ fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'IBM Plex Mono, monospace', textAlign: 'right', marginLeft: '10px', maxWidth: '60%', wordBreak: 'break-word' }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`mp-root ${theme}`}>
      <EvaluationTracker currentPhase="Estrategias" />

      <div className="em-root" style={{ paddingTop: '56px' }}>
        <div className="em-topbar">
          <div className="em-logo">
            <img src="/logo.png" alt="Meta-Pathfinder Logo" className="em-logo-mark" />
            <span className="em-logo-text">Meta-Pathfinder</span>
          </div>
          <div className="em-phase-track">
            <div className="em-phase-item done"><span className="em-pd"></span>Fase A</div>
            <div className="em-phase-item done"><span className="em-pd"></span>Fase B</div>
            <div className="em-phase-item done"><span className="em-pd"></span>Fase C</div>
            <div className="em-phase-item active"><span className="em-pd"></span>Estrategias metacognitivas</div>
          </div>
          <div className="em-perfil-chip" style={{ background: 'rgba(93,202,165,0.1)', border: '0.5px solid rgba(93,202,165,0.35)', color: '#5dcaa5' }}>
            <i className="ti ti-circle-check" style={{ fontSize: '13px' }}></i>
            <span>Nivel {nivelLabel[currentLevel]} completado</span>
          </div>
        </div>

        <div className="em-body">

          {/* Resumen de monitoreo del nivel completado */}
          {currentStrategy && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                padding: '14px 16px',
                background: strategyAssignedRandomly ? 'rgba(56, 139, 253, 0.08)' : 'rgba(93, 202, 165, 0.08)',
                borderRadius: '14px',
                border: `1px solid ${strategyAssignedRandomly ? 'rgba(56, 139, 253, 0.28)' : 'rgba(93, 202, 165, 0.3)'}`,
                marginBottom: '16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}>
                <i className={`ti ${strategyAssignedRandomly ? 'ti-dice-5' : 'ti-hand-click'}`} style={{ color: strategyAssignedRandomly ? '#388bfd' : '#5dcaa5', fontSize: 18, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.7px', color: strategyAssignedRandomly ? '#388bfd' : '#5dcaa5', marginBottom: '6px' }}>
                    {strategyAssignedRandomly ? 'Estrategia que te tocó al azar' : 'Estrategia que tú elegiste'}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--on-surface)', lineHeight: 1.6, margin: 0 }}>
                    {strategyAssignedRandomly ? (
                      <>
                        En el Nivel {nivelLabel[currentLevel]}, el sistema te asignó <strong>{currentStrategy.nombre}</strong> al azar
                        entre las 8 estrategias disponibles. No la seleccionaste — fue sorteo, como el reto.
                        Abajo ves cómo la usaste durante la actividad.
                      </>
                    ) : (
                      <>
                        Para el Nivel {nivelLabel[currentLevel]} usaste <strong>{currentStrategy.nombre}</strong> porque
                        <strong> tú la elegiste</strong> al terminar el nivel anterior. Abajo está el resumen de cómo la aplicaste.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="em-section-header" style={{ marginBottom: '12px' }}>
                <div className="em-section-title">
                  <i className="ti ti-activity" style={{ fontSize: '13px' }}></i>
                  Monitoreo de la estrategia en Nivel {nivelLabel[currentLevel]}
                </div>
              </div>

              <div style={{
                background: currentStrategy.iconBg,
                border: `1.5px solid ${currentStrategy.color}55`,
                borderRadius: '16px',
                padding: '18px 20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                alignItems: 'start',
              }}>
                {/* Estrategia activa */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ background: currentStrategy.iconBg, border: `1px solid ${currentStrategy.color}44`, borderRadius: '8px', padding: '6px', display: 'flex' }}>
                      <i className={`ti ${currentStrategy.icon}`} style={{ color: currentStrategy.color, fontSize: '16px' }}></i>
                    </div>
                    <div>
                      <div style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: currentStrategy.color }}>Estrategia monitoreada</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--on-surface)' }}>{currentStrategy.nombre}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
                    {currentStrategy.teoriaDetail}
                  </p>
                </div>

                {/* Evidencias capturadas */}
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--on-surface-variant)', marginBottom: '10px' }}>
                    Evidencias capturadas en Fase B
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { label: 'Tiempo total activo', value: `${Math.round(totalTime / 60)} min`, icon: 'ti-clock' },
                      { label: 'Interacciones (clics)', value: `${clicks}`, icon: 'ti-hand-click' },
                      { label: 'Intentos de ejecución', value: `${errores}`, icon: 'ti-player-play' },
                      { label: 'Ediciones de código', value: `${ediciones}`, icon: 'ti-pencil' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--on-surface-variant)' }}>
                          <i className={`ti ${item.icon}`} style={{ fontSize: '11px', color: currentStrategy.color }}></i>
                          {item.label}
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'IBM Plex Mono, monospace' }}>{item.value}</span>
                      </div>
                    ))}
                    {renderStrategyEvidences()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sección de selección para el próximo nivel */}
          {currentLevel < 3 && (
            <>
              <div style={{
                padding: '14px 16px',
                background: 'var(--surface-container-low, rgba(0,0,0,0.03))',
                borderRadius: '14px',
                border: '1px solid var(--outline-variant, #e0e0e0)44',
                marginBottom: '14px',
              }}>
                <div className="em-section-header" style={{ marginBottom: '8px' }}>
                  <div className="em-section-title">
                    <i className="ti ti-sparkles" style={{ fontSize: '13px' }}></i>
                    Ahora tú eliges — Nivel {nivelNext[currentLevel]}
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--on-surface)', lineHeight: 1.6, margin: '0 0 8px 0' }}>
                  {strategyAssignedRandomly ? (
                    <>
                      En el Nivel {nivelLabel[currentLevel]} la estrategia te la asignó el sistema al azar.
                      Para el Nivel {nivelNext[currentLevel]}, <strong>decides tú</strong>: puedes quedarte con la misma o probar otra de las 8 estrategias.
                    </>
                  ) : (
                    <>
                      Elige la estrategia con la que quieres trabajar en el Nivel {nivelNext[currentLevel]}.
                      Puedes mantener <strong>{currentStrategy?.nombre}</strong> o cambiar a otra.
                    </>
                  )}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', margin: 0, fontStyle: 'italic' }}>
                  Cada estrategia tiene herramientas distintas que verás durante el siguiente reto.
                </p>
              </div>

              {/* Tooltip de teoría */}
              <AnimatePresence>
                {activeTooltip && (
                  <motion.div
                    key={activeTooltip.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="em-tooltip-overlay show"
                    style={{ marginBottom: '12px' }}
                  >
                    <div className="em-tooltip-title">Qué monitoreará el sistema · {activeTooltip.nombre}</div>
                    <div className="em-tooltip-body">{activeTooltip.teoriaDetail}</div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grid de las 8 estrategias */}
              <div className="em-estrategias-grid" style={{ marginBottom: '20px' }}>
                {nuevasEstrategias.map((e: Estrategia) => {
                  const isSelected = selectedId === e.id;
                  const isCurrent = assignedStrategyId === e.id;
                  return (
                    <div
                      key={e.id}
                      className={`em-estrat-card ${isSelected ? 'adoptada' : ''}`}
                      onClick={() => setSelectedId(e.id)}
                      style={{ cursor: 'pointer', outline: isSelected ? `2px solid ${e.color}` : 'none', outlineOffset: '2px' }}
                    >
                      <div className="em-estrat-top">
                        <div className="em-estrat-icon" style={{ background: e.iconBg }}>
                          <i className={`ti ${e.icon}`} style={{ color: e.color }}></i>
                        </div>
                        <span className="em-estrat-badge" style={{ background: e.badgeBg, color: e.badgeColor }}>{e.badge}</span>
                        {isCurrent && (
                          <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 700, color: e.color, background: `${e.color}18`, borderRadius: '6px', padding: '2px 6px' }}>
                            Actual
                          </span>
                        )}
                      </div>
                      <div className="em-estrat-name">{e.nombre}</div>
                      <div className="em-estrat-teoria" style={{ color: 'var(--on-surface-variant)', fontSize: '10px', marginBottom: '6px' }}>{e.teoria}</div>
                      <div className="em-estrat-desc">{e.desc}</div>
                      <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {e.herramientas.map(h => (
                          <span key={h.id} title={h.descripcion} style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '6px', background: `${e.color}12`, color: e.color, border: `1px solid ${e.color}33`, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <i className={`ti ${h.icon}`} style={{ fontSize: '9px' }} />{h.nombre}
                          </span>
                        ))}
                      </div>
                      <div className="em-estrat-actions">
                        <button
                          className="em-btn-adoptar"
                          onClick={(ev) => { ev.stopPropagation(); setSelectedId(e.id); }}
                          style={{
                            background: isSelected ? 'rgba(35,134,54,0.12)' : 'transparent',
                            color: isSelected ? '#7ee787' : e.color,
                            borderColor: isSelected ? 'rgba(35,134,54,0.3)' : e.color + '55'
                          }}
                        >
                          <i className={`ti ${isSelected ? 'ti-check' : 'ti-plus'}`} style={{ fontSize: '12px' }}></i>
                          {isSelected ? 'Seleccionada' : 'Seleccionar'}
                        </button>
                        <button
                          className="em-btn-info"
                          onClick={(ev) => { ev.stopPropagation(); setTooltipId(prev => prev === e.id ? null : e.id); }}
                          title="Ver qué monitorea el sistema"
                        >
                          <i className="ti ti-eye"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Zona de confirmación */}
          {!confirmed ? (
            <div className="em-commit-zone">
              <div className="em-commit-label">
                <i className="ti ti-pencil" style={{ fontSize: '12px' }}></i>
                {currentLevel < 3
                  ? `Confirmación de estrategia para Nivel ${nivelNext[currentLevel]}`
                  : 'Diagnóstico completado · Resumen final'}
              </div>

              {selectedStrategy && currentLevel < 3 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: selectedStrategy.iconBg,
                  border: `1px solid ${selectedStrategy.color}44`,
                  borderRadius: '12px', padding: '12px 16px', marginBottom: '16px'
                }}>
                  <i className={`ti ${selectedStrategy.icon}`} style={{ color: selectedStrategy.color, fontSize: '20px' }}></i>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: selectedStrategy.color }}>
                      {isSameStrategy ? '🔁 Mantienes la misma estrategia' : '✨ Nueva estrategia elegida'}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--on-surface)' }}>{selectedStrategy.nombre}</div>
                  </div>
                </div>
              )}

              <div className="em-commit-next">
                <button
                  className={`em-btn-commit ${selectedId || currentLevel >= 3 ? 'ready' : ''}`}
                  onClick={handleConfirm}
                  disabled={!selectedId && currentLevel < 3}
                >
                  <i className="ti ti-check" style={{ fontSize: '14px' }}></i>
                  {currentLevel < 3 ? `Confirmar y pasar a Nivel ${nivelNext[currentLevel]}` : 'Finalizar diagnóstico'}
                </button>
                <span className="em-commit-hint">
                  {currentLevel < 3
                    ? (!selectedId ? 'Selecciona una estrategia para continuar' : `Nivel ${nivelNext[currentLevel]} comenzará con esta estrategia`)
                    : 'Has completado todos los niveles'}
                </span>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="em-commit-zone"
              style={{ textAlign: 'center', paddingTop: '32px', paddingBottom: '32px' }}
            >
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎯</div>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#5dcaa5', marginBottom: '8px' }}>
                {currentLevel < 3 ? `¡Iniciando Nivel ${nivelNext[currentLevel]}!` : '¡Diagnóstico completado!'}
              </p>
              <p style={{ fontSize: '13px', color: '#6e7681' }}>
                {isSameStrategy
                  ? 'Continuarás con la misma estrategia metacognitiva.'
                  : 'Tu nueva estrategia ha sido registrada.'}
              </p>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
