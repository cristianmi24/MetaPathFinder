import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../ThemeContext';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { EvaluationTracker } from '../components/EvaluationTracker';
import { perfilesData, Estrategia } from '../data/metacognitiveStrategies';
import './MetacognitiveStrategies.css';

export function MetacognitiveStrategies() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { currentLevel, setCurrentLevel, setCurrentChallengeId, addEvent } = useCognitiveStore();

  // Detectar perfil automáticamente si viene de la calibración
  const incomingProfile = location.state?.cognitiveProfile || 'cal';
  const profileMap: Record<string, string> = {
    'overclaimer': 'over', 'underclaimer': 'sub', 'calibrated': 'cal',
    'over': 'over', 'sub': 'sub', 'cal': 'cal'
  };
  const defaultPerfil = profileMap[incomingProfile] || 'cal';

  const [perfilActual, setPerfilActual] = useState(defaultPerfil);
  const [adoptadas, setAdoptadas] = useState<Record<string, boolean>>({});
  const [commitSel, setCommitSel] = useState<Record<string, boolean>>({});
  const [tooltipId, setTooltipId] = useState<string | null>(null);
  const [committed, setCommitted] = useState(false);

  const pData = perfilesData[perfilActual];
  const adoptCount = Object.values(adoptadas).filter(Boolean).length;
  const commitCount = Object.values(commitSel).filter(Boolean).length;

  const handleSetPerfil = (p: string) => {
    setPerfilActual(p);
    setAdoptadas({});
    setCommitSel({});
    setTooltipId(null);
  };

  const toggleAdoptar = (id: string) => {
    setAdoptadas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCommit = (id: string) => {
    setCommitSel(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTooltip = (id: string) => {
    setTooltipId(prev => prev === id ? null : id);
  };

  const handleCommit = () => {
    if (commitCount < 2) return;
    const sel = Object.keys(commitSel).filter(k => commitSel[k]);
    const nombres = sel.map(id => pData.estrategias.find(e => e.id === id)?.nombre).filter(Boolean);
    addEvent('METACOGNITIVE_STRATEGIES_COMMITTED', {
      perfil: pData.label,
      estrategias_adoptadas: Object.keys(adoptadas).filter(k => adoptadas[k]),
      compromisos: nombres,
    });
    setCommitted(true);

    // Navegar al siguiente nivel o al dashboard del estudiante
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

  const activeTooltipData = tooltipId
    ? pData.estrategias.find(e => e.id === tooltipId)
    : null;

  return (
    <div className={`mp-root ${theme}`}>
      <EvaluationTracker currentPhase="Estrategias" />

      <div className={`em-root`} style={{ paddingTop: '56px' }}>
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
          <div className="em-perfil-chip" style={pData.chipStyle}>
            <i className={`ti ${pData.chipIcon}`} style={{ fontSize: '13px' }}></i>
            <span>{pData.label}</span>
          </div>
        </div>

        <div className="em-body">

          {/* Selector de perfil */}
          <div className="em-section-header" style={{ marginBottom: '16px' }}>
            <div className="em-section-title">
              <i className="ti ti-filter" style={{ fontSize: '13px' }}></i>
              Perfil detectado — comparar con otros
            </div>
            <div className="em-perfil-selector">
              <button className={`em-perfil-btn ${perfilActual === 'over' ? 'active-over' : ''}`} onClick={() => handleSetPerfil('over')}>Sobreconfianza</button>
              <button className={`em-perfil-btn ${perfilActual === 'sub' ? 'active-sub' : ''}`} onClick={() => handleSetPerfil('sub')}>Subestimación</button>
              <button className={`em-perfil-btn ${perfilActual === 'cal' ? 'active-cal' : ''}`} onClick={() => handleSetPerfil('cal')}>Calibrado</button>
            </div>
          </div>

          {/* Dimensiones metacognitivas */}
          <div className="em-dim-grid">
            <div className="em-dim-block">
              <div className="em-dim-label"><i className="ti ti-book" style={{ fontSize: '12px' }}></i>Dimensión 1</div>
              <div className="em-dim-name">Conocimiento metacognitivo</div>
              <div className="em-dim-desc">Qué tanto sabe el estudiante sobre sus propios procesos cognitivos, fortalezas y limitaciones.</div>
              <div className="em-dim-bar-wrap">
                <div className="em-dim-bar" style={{ width: pData.dim1.w, background: pData.dim1.color }}></div>
              </div>
              <div className="em-dim-score" style={{ color: pData.dim1.color }}>{pData.dim1.score}</div>
            </div>
            <div className="em-dim-block">
              <div className="em-dim-label"><i className="ti ti-settings" style={{ fontSize: '12px' }}></i>Dimensión 2</div>
              <div className="em-dim-name">Regulación metacognitiva</div>
              <div className="em-dim-desc">Capacidad para planificar, monitorear y evaluar el propio proceso de resolución en tiempo real.</div>
              <div className="em-dim-bar-wrap">
                <div className="em-dim-bar" style={{ width: pData.dim2.w, background: pData.dim2.color }}></div>
              </div>
              <div className="em-dim-score" style={{ color: pData.dim2.color }}>{pData.dim2.score}</div>
            </div>
          </div>

          {/* Tooltip de teoría */}
          <AnimatePresence>
            {activeTooltipData && (
              <motion.div
                key={activeTooltipData.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="em-tooltip-overlay show"
                style={{ marginBottom: '12px' }}
              >
                <div className="em-tooltip-title">Base teórica · {activeTooltipData.nombre}</div>
                <div className="em-tooltip-body">{activeTooltipData.teoriaDetail}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header estrategias */}
          <div className="em-section-header" style={{ marginBottom: '12px' }}>
            <div className="em-section-title">
              <i className="ti ti-sparkles" style={{ fontSize: '13px' }}></i>
              Estrategias prescritas para tu perfil
            </div>
            <div style={{ fontSize: '10px', fontFamily: 'IBM Plex Mono, monospace', color: '#6e7681' }}>
              {adoptCount} de 6 adoptadas
            </div>
          </div>

          {/* Grid de estrategias */}
          <div className="em-estrategias-grid">
            {pData.estrategias.map((e: Estrategia) => {
              const isAdop = !!adoptadas[e.id];
              return (
                <div key={e.id} className={`em-estrat-card ${isAdop ? 'adoptada' : ''}`}>
                  <div className="em-estrat-top">
                    <div className="em-estrat-icon" style={{ background: e.iconBg }}>
                      <i className={`ti ${e.icon}`} style={{ color: e.color }}></i>
                    </div>
                    <span className="em-estrat-badge" style={{ background: e.badgeBg, color: e.badgeColor }}>{e.badge}</span>
                  </div>
                  <div className="em-estrat-name">{e.nombre}</div>
                  <div className="em-estrat-teoria">{e.teoria}</div>
                  <div className="em-estrat-desc">{e.desc}</div>
                  <div className="em-estrat-pasos">
                    {e.pasos.map((p, i) => (
                      <div key={i} className="em-estrat-paso">
                        <span className="em-paso-num" style={{ background: e.pasoBg, color: e.pasoColor }}>{i + 1}</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                  <div className="em-estrat-actions">
                    <button className="em-btn-adoptar" onClick={() => toggleAdoptar(e.id)}
                      style={{
                        background: isAdop ? 'rgba(35,134,54,0.12)' : 'transparent',
                        color: isAdop ? '#7ee787' : e.color,
                        borderColor: isAdop ? 'rgba(35,134,54,0.3)' : e.color + '55'
                      }}>
                      <i className={`ti ${isAdop ? 'ti-check' : 'ti-plus'}`} style={{ fontSize: '12px' }}></i>
                      {isAdop ? 'Adoptada' : 'Adoptar estrategia'}
                    </button>
                    <button className="em-btn-info" onClick={() => toggleTooltip(e.id)} title="Ver base teórica">
                      <i className="ti ti-book"></i>
                    </button>
                  </div>
                  {isAdop && (
                    <div className="em-adopted-banner show">Registrada en tu perfil de sesión</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Barra de progreso */}
          <div className="em-progreso-card">
            <div className="em-prog-header">
              <span className="em-prog-title"><i className="ti ti-list-check" style={{ fontSize: '12px', marginRight: '5px' }}></i>Compromiso de sesión</span>
              <span className="em-prog-count">{adoptCount} / 6 estrategias</span>
            </div>
            <div className="em-prog-items">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className={`em-prog-dot ${i < adoptCount ? 'done' : ''}`}></div>
              ))}
            </div>
          </div>

          {/* Zona de compromiso */}
          {!committed ? (
            <div className="em-commit-zone">
              <div className="em-commit-label">
                <i className="ti ti-pencil" style={{ fontSize: '12px' }}></i>
                Compromiso metacognitivo · cierre de ciclo
              </div>
              <div className="em-commit-q">"¿Cuál de estas estrategias te comprometes a usar conscientemente en el próximo reto?"</div>
              <div className="em-commit-options">
                {pData.estrategias.map((e: Estrategia) => (
                  <button
                    key={e.id}
                    className={`em-commit-opt ${commitSel[e.id] ? 'sel' : ''}`}
                    onClick={() => toggleCommit(e.id)}
                  >
                    {e.nombre.split(':')[0]}
                  </button>
                ))}
              </div>
              <div className="em-commit-next">
                <button
                  className={`em-btn-commit ${commitCount >= 2 ? 'ready' : ''}`}
                  onClick={handleCommit}
                >
                  <i className="ti ti-check" style={{ fontSize: '14px' }}></i>
                  Registrar compromiso y cerrar ciclo
                </button>
                <span className="em-commit-hint">
                  {commitCount >= 2 ? `${commitCount} estrategias seleccionadas` : 'Selecciona al menos 2 estrategias'}
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
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#5dcaa5', marginBottom: '8px' }}>¡Compromiso registrado!</p>
              <p style={{ fontSize: '13px', color: '#6e7681', marginBottom: '20px' }}>Las estrategias metacognitivas han sido guardadas en tu perfil.</p>
              <button
                onClick={() => navigate('/student')}
                className="em-btn-commit ready"
                style={{ background: '#5dcaa5', color: '#04342c', border: 'none', borderRadius: '7px', padding: '12px 24px', fontSize: '14px', fontFamily: 'Sora, sans-serif', fontWeight: 500, cursor: 'pointer' }}
              >
                <i className="ti ti-check" style={{ fontSize: '16px', marginRight: '6px' }}></i>
                Finalizar y volver al dashboard
              </button>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
