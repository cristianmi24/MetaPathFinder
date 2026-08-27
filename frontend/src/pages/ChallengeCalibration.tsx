import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { 
  Brain, 
  AlertTriangle, 
  Zap, 
  RefreshCcw, 
  ChevronRight, 
  Target, 
  Search, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Info,
  HelpCircle,
  Code2,
  Video
} from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { EvaluationTracker } from '../components/EvaluationTracker';
import { usePhaseSync } from '../hooks/usePhaseSync';
import { normalizeJolAverage, clamp010 } from '../lib/jolNormalization';
import { evaluateMetacognitiveReflection, getPrescribedInterventions } from '../lib/metacognitiveEvaluator';
import { dynamicChallengeBank } from '../data/dynamicChallengeBank';
import './ChallengeCalibration.css';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export function ChallengeCalibration() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { currentLevel, setCurrentLevel, setCurrentChallengeId, addEvent, user, events, consolidateSession, currentSessionId } = useCognitiveStore();
  const { syncPhaseC, syncSessionComplete } = usePhaseSync();
  
  const metrics = useMemo(() => {
    if (location.state) return location.state;
    
    // Si no hay state (ej. refresh), buscamos el último evento de reto completado
    const lastChallengeEvent = [...events].reverse().find(e => e.type === 'CHALLENGE_COMPLETED');
    if (lastChallengeEvent) return lastChallengeEvent.metadata;

    return {
      challengeId: '0.0',
      level: 1,
      jolAnswers: {},
      jolTimes: {},
      estimatedTime: 5,
      metricas_tecnicas: { score: 0, runs: 0, hints: 0, edits: 0 },
      biometricas: { clicks: 0, mouse_distance: 0, total_time: 0 },
    };
  }, [location.state, events]);

  const [reflection, setReflection] = useState('');
  const [isReflected, setIsReflected] = useState(false);

  // Análisis semántico de la autorregulación
  const reflectionAnalysis = useMemo(() => {
    return evaluateMetacognitiveReflection(reflection);
  }, [reflection]);

  // Cálculos de Calibración
  const jolAvg = normalizeJolAverage(metrics.jolAnswers || {}, metrics.estimatedTime);
  const performance = clamp010((metrics.metricas_tecnicas?.score || 0) / 10);
  const gap = Number((jolAvg - performance).toFixed(1));
  
  const isZeroAttempt = jolAvg < 1.0 && performance < 1.0;

  const profile = useMemo(() => {
    if (isZeroAttempt) {
      return { type: 'zero_attempt', label: 'Reconocimiento de Falta de Dominio', icon: HelpCircle, desc: 'Reconociste tu falta de experiencia previa y obtuviste desempeño nulo (Conocimiento Ausente).' };
    }
    if (gap > 2) return { type: 'overconf', label: 'Sobreconfianza Crítica', icon: AlertTriangle, desc: 'Efecto Dunning-Kruger detectado. Alta autopercepción con bajo rendimiento real.' };
    if (gap < -2) return { type: 'underconf', label: 'Subestimación Cognitiva', icon: Zap, desc: 'El desempeño superó por mucho la expectativa inicial.' };
    return { type: 'calibrated', label: 'Perfil Calibrado Metacognitivo', icon: CheckCircle2, desc: 'Excelente autoconocimiento. Tu percepción coincide con tus capacidades técnicas.' };
  }, [gap, isZeroAttempt]);

  const currentChallengeObj = useMemo(() => {
    return dynamicChallengeBank.find(c => c.id === metrics.challengeId) || null;
  }, [metrics.challengeId]);

  const dynamicInterventions = useMemo(() => {
    return getPrescribedInterventions(
      profile.type,
      currentChallengeObj?.componente || 'Tecnología',
      metrics
    );
  }, [profile.type, currentChallengeObj, metrics]);

  // Real metrics for radar chart
  const tech = metrics.metricas_tecnicas || {};
  const bio = metrics.biometricas || {};
  const maxRuns = 10;
  const maxHints = 5;
  const eficiencia = Math.max(0, Math.min(10, 10 - (tech.runs || 0) / maxRuns * 10));
  const independencia = Math.max(0, Math.min(10, 10 - (tech.hints || 0) / maxHints * 10));
  const velocidad = bio.total_time ? Math.max(0, Math.min(10, 10 - (bio.total_time / 600) * 10)) : 5;
  const interaccion = bio.clicks ? Math.max(0, Math.min(10, 10 - (bio.clicks / 50) * 10)) : 5;

  const radarData = {
    labels: ['Precisión', 'Eficiencia', 'Independencia', 'Interacción', 'Velocidad'],
    datasets: [
      {
        label: 'Tu confianza',
        data: [jolAvg, jolAvg, jolAvg, jolAvg, jolAvg],
        borderColor: '#c99a2e',
        backgroundColor: 'rgba(201,154,46,0.10)',
        pointBackgroundColor: '#c99a2e',
        borderWidth: 2,
      },
      {
        label: 'Tu desempeño',
        data: [performance, eficiencia, independencia, interaccion, velocidad],
        borderColor: '#cf5a4e',
        backgroundColor: 'rgba(207,90,78,0.10)',
        pointBackgroundColor: '#cf5a4e',
        borderWidth: 2,
      },
      {
        label: 'Zona ideal',
        data: [6, 6, 6, 6, 6],
        borderColor: '#7b6fca',
        backgroundColor: 'rgba(123,111,202,0.05)',
        borderDash: [5, 5],
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: { 
          stepSize: 2, 
          color: theme === 'dark' ? '#8b949e' : '#6e7681', 
          backdropColor: 'transparent' 
        },
        grid: { color: theme === 'dark' ? '#30363d' : '#d0d7de' },
        angleLines: { color: theme === 'dark' ? '#30363d' : '#d0d7de' },
        pointLabels: { 
          color: theme === 'dark' ? '#c9d1d9' : '#1f2328', 
          font: { family: 'IBM Plex Mono', size: 10 } 
        }
      }
    },
    plugins: { legend: { display: false } },
    maintainAspectRatio: false
  };

  const handleFinishReflection = async () => {
    if (!reflectionAnalysis.isValid) {
      console.warn('⚠️ Reflexión no cumple con los criterios de validez.');
      return;
    }
    setIsReflected(true);
    addEvent('METACOGNITIVE_REFLECTION', { 
      text: reflection, 
      gap, 
      profile: profile.label,
      reflection_score: reflectionAnalysis.score,
      reflection_level: reflectionAnalysis.level,
      keywords_found: reflectionAnalysis.metacognitiveKeywordsFound
    });

    await syncPhaseC();
    await syncSessionComplete();
    console.log('✅ Llamando a consolidateSession() después del sync...');
    consolidateSession();
  };

  const handleNextLevel = () => {
    console.log('⏭️ Avanzando de nivel. Consolidando sesión por seguridad y yendo a selección de estrategias...');
    consolidateSession(); 
    navigate('/metacognitive-strategies');
  };

  const handleRetrySimplified = () => {
    // Si decide reintentar, le asignamos el reto "N1" (Fácil) del mismo componente
    navigate('/evaluation-prep', { state: { retryVariation: true, previousChallengeId: metrics.challengeId } });
  };

  return (
    <div className={`fc-root ${theme}`}>
      <EvaluationTracker 
        currentPhase="C" 
        profileLabel={profile.label} 
        profileType={profile.type as any} 
      />

      <div className="fc-body">
        <div className="fc-main">
          <header className="fc-mirror-header">
            <div className="fc-mirror-icon">
              <Search className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="fc-mirror-title">Tu análisis de calibración</h2>
              <p className="fc-mirror-sub">Sesión {user?.name || 'Invitado'} · lo que creías vs. lo que pasó</p>
            </div>
          </header>

          <div className="fc-desfase-grid">
            <div className="fc-stat-card">
              <div className="fc-stat-label">Tu confianza</div>
              <div className="fc-stat-val" style={{ color: '#c99a2e' }}>{jolAvg.toFixed(1)} <span className="fc-stat-unit">/ 10</span></div>
              <div className="fc-stat-delta" style={{ color: 'var(--text-muted)' }}>lo que esperabas</div>
            </div>
            <div className="fc-stat-card">
              <div className="fc-stat-label">Tu desempeño</div>
              <div className="fc-stat-val" style={{ color: '#cf5a4e' }}>{performance} <span className="fc-stat-unit">/ 10</span></div>
              <div className="fc-stat-delta" style={{ color: 'var(--text-muted)' }}>{gap > 0 ? `${gap} pts por debajo` : `${Math.abs(gap)} pts por encima`}</div>
            </div>
            <div className="fc-stat-card">
              <div className="fc-stat-label">Tiempo</div>
              <div className="fc-stat-val" style={{ color: 'var(--text)' }}>{Math.round(metrics.biometricas.total_time / 60)} <span className="fc-stat-unit">min</span></div>
              <div className="fc-stat-delta" style={{ color: 'var(--text-muted)' }}>+{Math.max(0, Math.round(metrics.biometricas.total_time / 60) - metrics.estimatedTime)} min sobre lo estimado</div>
            </div>
            <div className="fc-stat-card">
              <div className="fc-stat-label">Intentos</div>
              <div className="fc-stat-val" style={{ color: 'var(--text)' }}>{metrics.metricas_tecnicas.runs}</div>
              <div className="fc-stat-delta" style={{ color: 'var(--text-muted)' }}>{metrics.metricas_tecnicas.hints} pistas usadas</div>
            </div>
          </div>

          <div className="fc-chart-card">
            <div className="fc-chart-header">
              <span className="fc-chart-title">Confianza vs. desempeño</span>
              <div className="fc-legend">
                <span className="fc-leg-item"><span className="fc-leg-dot" style={{ background: '#c99a2e' }}></span>Confianza</span>
                <span className="fc-leg-item"><span className="fc-leg-dot" style={{ background: '#cf5a4e' }}></span>Desempeño</span>
                <span className="fc-leg-item"><span className="fc-leg-dot" style={{ background: '#7b6fca' }}></span>Ideal</span>
              </div>
            </div>
            <div style={{ height: '240px' }}>
              <Radar data={radarData} options={chartOptions} />
            </div>
          </div>

          <div className="fc-reflexion-card">
            <div className="fc-reflexion-label">
              <Brain className="w-4 h-4" />
              Para reflexionar
            </div>
            <p className="fc-reflexion-q">
              "Tu confianza inicial fue {jolAvg.toFixed(1)}/10 pero tu desempeño real fue {performance}/10. 
              ¿A qué crees que se debió esa diferencia? ¿Qué factores técnicos o cognitivos no habías considerado?"
            </p>
            <textarea 
              className="fc-reflexion-input"
              placeholder="Escribe tu reflexión aquí... (Explica las causas técnicas, de tiempo o de confianza que influyeron)"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              disabled={isReflected}
            />

            {/* Calidad de la reflexión en tiempo real */}
            <div className="mt-3 p-3 rounded-md text-xs ui-sans" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-semibold" style={{ color: 'var(--text)' }}>
                  Calidad: <span style={{
                    color: reflectionAnalysis.level === 'profunda' ? 'var(--ok)' :
                           reflectionAnalysis.level === 'buena' ? 'var(--accent)' :
                           reflectionAnalysis.level === 'basica' ? 'var(--warn)' : 'var(--danger)'
                  }}>
                    {reflectionAnalysis.level} ({reflectionAnalysis.score}/100)
                  </span>
                </span>
                <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {reflectionAnalysis.wordCount} palabras
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'var(--border)' }}>
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${reflectionAnalysis.score}%`,
                    backgroundColor: reflectionAnalysis.score > 70 ? 'var(--ok)' : reflectionAnalysis.score > 40 ? 'var(--warn)' : 'var(--danger)'
                  }}
                />
              </div>
              <p className="text-[11px] italic" style={{ color: 'var(--text-muted)' }}>
                {reflectionAnalysis.feedback}
              </p>
              {reflectionAnalysis.metacognitiveKeywordsFound.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[10px] mr-1" style={{ color: 'var(--text-muted)' }}>Términos usados:</span>
                  {reflectionAnalysis.metacognitiveKeywordsFound.map((kw, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}>
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 justify-between items-center mt-4">
              <span className="text-[11px] font-mono" style={{ color: reflectionAnalysis.isValid ? 'var(--ok)' : 'var(--text-muted)' }}>
                {reflectionAnalysis.isValid ? '✓ Lista para guardar' : 'Mínimo 20 palabras explicando causas'}
              </span>
              <button
                className="fc-btn-siguiente !w-auto !py-2 !px-6"
                disabled={!reflectionAnalysis.isValid || isReflected}
                onClick={handleFinishReflection}
                style={{ opacity: !reflectionAnalysis.isValid || isReflected ? 0.5 : 1 }}
              >
                {isReflected ? 'Guardada' : 'Guardar reflexión'}
              </button>
            </div>
          </div>

          <div className="fc-interv-card">
            <div className="fc-interv-label">
              <Sparkles className="w-4 h-4" />
              Qué te recomendamos ahora
            </div>
            {dynamicInterventions.map((interv) => (
              <div key={interv.id} className="fc-interv-item">
                <div className={`fc-interv-icon ${interv.iconType}`}>
                  <i className={`ti ${interv.icon}`} />
                </div>
                <div className="fc-interv-body">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="fc-interv-title">{interv.titulo}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
                      {interv.tiempoEstimado} · {interv.tipoAccion}
                    </span>
                  </div>
                  <p className="fc-interv-desc">{interv.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="fc-sidebar">
          <div className="fc-side-title"><Brain className="w-4 h-4" /> Cómo quedó tu calibración</div>
          
          <div className={`fc-profile-card ${profile.type}`}>
            <div className="fc-profile-card-name">{profile.label}</div>
            <p className="fc-profile-card-desc">{profile.desc}</p>
          </div>

          <details className="fc-vector-card">
            <summary className="fc-vector-title" style={{ cursor: 'pointer', listStyle: 'none' }}>
              <Code2 className="w-4 h-4" /> Datos de tu sesión
            </summary>
            <div className="fc-vector-row" style={{ marginTop: 10 }}>
              <span className="fc-vector-key">confianza</span>
              <span className="fc-vector-val">{jolAvg.toFixed(1)}</span>
            </div>
            <div className="fc-vector-row">
              <span className="fc-vector-key">desempeño</span>
              <span className="fc-vector-val">{performance}</span>
            </div>
            <div className="fc-vector-row">
              <span className="fc-vector-key">clics</span>
              <span className="fc-vector-val">{metrics.biometricas.clicks}</span>
            </div>
            <div className="fc-vector-row">
              <span className="fc-vector-key">ediciones</span>
              <span className="fc-vector-val">{metrics.metricas_tecnicas.edits}</span>
            </div>
          </details>

          <button
            className="fc-btn-reintentar"
            disabled={!isReflected}
            onClick={handleRetrySimplified}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reto de apoyo más sencillo
          </button>

          <button
            className="fc-btn-siguiente mt-4"
            onClick={handleNextLevel}
          >
            Siguiente nivel <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </aside>
      </div>
    </div>
  );
}
