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
  Code2,
  Video
} from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { EvaluationTracker } from '../components/EvaluationTracker';
import { usePhaseSync } from '../hooks/usePhaseSync';
import { normalizeJolAverage, clamp010 } from '../lib/jolNormalization';
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
  const wordCount = reflection.trim().split(/\s+/).filter(w => w.length > 0).length;

  // Cálculos de Calibración — cada JOL se normaliza según su propia escala (1-10, minutos,
  // intentos, porcentaje, opciones) antes de promediar, y el resultado siempre queda en [0, 10].
  const jolAvg = normalizeJolAverage(metrics.jolAnswers || {}, metrics.estimatedTime);
  const performance = clamp010((metrics.metricas_tecnicas?.score || 0) / 10);
  const gap = Number((jolAvg - performance).toFixed(1));
  
  const profile = useMemo(() => {
    if (gap > 2) return { type: 'overconf', label: 'Sobreconfianza crítica', icon: AlertTriangle, desc: 'Efecto Dunning-Kruger detectado. Alta autopercepción con bajo rendimiento real.' };
    if (gap < -2) return { type: 'underconf', label: 'Subestimación cognitiva', icon: Zap, desc: 'Síndrome del impostor detectado. El desempeño superó por mucho la expectativa inicial.' };
    return { type: 'calibrated', label: 'Perfil Calibrado', icon: CheckCircle2, desc: 'Excelente autoconocimiento. Tu percepción coincide con tus capacidades técnicas.' };
  }, [gap]);

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
        label: 'JOL Declarado',
        data: [jolAvg, jolAvg, jolAvg, jolAvg, jolAvg],
        borderColor: '#f2cc60',
        backgroundColor: 'rgba(242,204,96,0.1)',
        pointBackgroundColor: '#f2cc60',
        borderWidth: 2,
      },
      {
        label: 'Desempeño Real',
        data: [performance, eficiencia, independencia, interaccion, velocidad],
        borderColor: '#ff7b72',
        backgroundColor: 'rgba(255,123,114,0.1)',
        pointBackgroundColor: '#ff7b72',
        borderWidth: 2,
      },
      {
        label: 'Zona Calibrada',
        data: [6, 6, 6, 6, 6],
        borderColor: '#388bfd',
        backgroundColor: 'rgba(56,139,253,0.05)',
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
    console.log('📝 Click en Registrar Reflexión. Palabras:', wordCount);
    if (wordCount < 20) {
      console.warn('⚠️ Reflexión muy corta.');
      return;
    }
    setIsReflected(true);
    addEvent('METACOGNITIVE_REFLECTION', { 
      text: reflection, 
      gap, 
      profile: profile.label 
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
              <h2 className="fc-mirror-title">Tu espejo de aprendizaje</h2>
              <p className="fc-mirror-sub">Sesión {user?.name || 'Invitado'} · Comparación Metacognitiva Completada</p>
            </div>
          </header>

          <div className="fc-desfase-grid">
            <div className="fc-stat-card">
              <div className="fc-stat-label">Confianza (JOL)</div>
              <div className="fc-stat-val text-yellow-400">{jolAvg.toFixed(1)} <span className="fc-stat-unit">/ 10</span></div>
              <div className="fc-stat-delta text-gray-500">Fase A · Percepción</div>
            </div>
            <div className="fc-stat-card">
              <div className="fc-stat-label">Desempeño Real</div>
              <div className="fc-stat-val text-red-400">{performance} <span className="fc-stat-unit">/ 10</span></div>
              <div className="fc-stat-delta text-red-400">{gap > 0 ? `-${gap}` : `+${Math.abs(gap)}`} pts vs predicción</div>
            </div>
            <div className="fc-stat-card">
              <div className="fc-stat-label">Tiempo Real</div>
              <div className="fc-stat-val text-gray-200">{Math.round(metrics.biometricas.total_time / 60)} <span className="fc-stat-unit">min</span></div>
              <div className="fc-stat-delta text-red-400">+{Math.max(0, Math.round(metrics.biometricas.total_time / 60) - metrics.estimatedTime)} min sobre estimado</div>
            </div>
            <div className="fc-stat-card">
              <div className="fc-stat-label">Runs / Errores</div>
              <div className="fc-stat-val text-red-400">{metrics.metricas_tecnicas.runs} <span className="fc-stat-unit">intentos</span></div>
              <div className="fc-stat-delta text-gray-500">{metrics.metricas_tecnicas.hints} pistas usadas</div>
            </div>
          </div>

          <div className="fc-chart-card">
            <div className="fc-chart-header">
              <span className="fc-chart-title">Desfase Cognitivo · Confianza vs Desempeño</span>
              <div className="fc-legend">
                <span className="fc-leg-item"><span className="fc-leg-dot bg-yellow-400"></span>JOL</span>
                <span className="fc-leg-item"><span className="fc-leg-dot bg-red-400"></span>Real</span>
                <span className="fc-leg-item"><span className="fc-leg-dot bg-blue-400"></span>Meta</span>
              </div>
            </div>
            <div style={{ height: '240px' }}>
              <Radar data={radarData} options={chartOptions} />
            </div>
          </div>

          <div className="fc-reflexion-card">
            <div className="fc-reflexion-label">
              <Brain className="w-4 h-4" />
              Pregunta de Regulación · Pintrich (2002)
            </div>
            <p className="fc-reflexion-q">
              "Tu confianza inicial fue {jolAvg.toFixed(1)}/10 pero tu desempeño real fue {performance}/10. 
              ¿A qué crees que se debió esa diferencia? ¿Qué factores técnicos o cognitivos no habías considerado?"
            </p>
            <textarea 
              className="fc-reflexion-input"
              placeholder="Escribe tu reflexión aquí... (mínimo 20 palabras para habilitar el reintento)"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              disabled={isReflected}
            />
            <div className="flex justify-between items-center mt-4">
              <span className={`text-[11px] font-mono ${wordCount >= 20 ? 'text-green-400' : 'text-gray-500'}`}>
                {wordCount} palabras {wordCount < 20 && `(faltan ${20 - wordCount})`}
              </span>
              <button 
                className="fc-btn-siguiente !w-auto !py-2 !px-6"
                disabled={wordCount < 20 || isReflected}
                onClick={handleFinishReflection}
                style={{ opacity: wordCount < 20 || isReflected ? 0.5 : 1 }}
              >
                {isReflected ? 'Reflexión Guardada' : 'Registrar Reflexión'}
              </button>
            </div>
          </div>

          <div className="fc-interv-card">
            <div className="fc-interv-label">
              <Sparkles className="w-4 h-4" />
              Intervenciones Prescritas
            </div>
            <div className="fc-interv-item">
              <div className="fc-interv-icon warn"><Video className="w-5 h-5" /></div>
              <div className="fc-interv-body">
                <h4 className="fc-interv-title">Video: Descomposición de problemas (12 min)</h4>
                <p className="fc-interv-desc">Aprenderás a dividir retos complejos en sub-tareas antes de escribir código.</p>
              </div>
            </div>
            <div className="fc-interv-item">
              <div className="fc-interv-icon info"><Info className="w-5 h-5" /></div>
              <div className="fc-interv-body">
                <h4 className="fc-interv-title">Autodiagnóstico guiado</h4>
                <p className="fc-interv-desc">Identifica 3 supuestos erróneos que tenías al inicio del reto.</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="fc-sidebar">
          <div className="fc-side-title"><Brain className="w-4 h-4" /> Clasificación del Modelo</div>
          
          <div className={`fc-profile-card ${profile.type}`}>
            <div className="fc-profile-card-name">{profile.label}</div>
            <p className="fc-profile-card-desc">{profile.desc}</p>
          </div>

          <div className="fc-vector-card">
            <div className="fc-vector-title"><Code2 className="w-4 h-4" /> Vector de Entrada</div>
            <div className="fc-vector-row">
              <span className="fc-vector-key">jol_score</span>
              <span className="fc-vector-val text-yellow-400">{jolAvg.toFixed(1)}</span>
            </div>
            <div className="fc-vector-row">
              <span className="fc-vector-key">nota_real</span>
              <span className="fc-vector-val text-red-400">{performance}</span>
            </div>
            <div className="fc-vector-row">
              <span className="fc-vector-key">clicks</span>
              <span className="fc-vector-val">{metrics.biometricas.clicks}</span>
            </div>
            <div className="fc-vector-row">
              <span className="fc-vector-key">ediciones</span>
              <span className="fc-vector-val">{metrics.metricas_tecnicas.edits}</span>
            </div>
          </div>

          <button 
            className="fc-btn-reintentar" 
            disabled={!isReflected}
            onClick={handleRetrySimplified}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reto Simplificado (Soporte)
          </button>

          <button 
            className="fc-btn-siguiente mt-4"
            onClick={handleNextLevel}
          >
            Siguiente Nivel <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </aside>
      </div>
    </div>
  );
}
