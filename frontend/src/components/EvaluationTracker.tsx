import React from 'react';
import { motion } from 'motion/react';
import { Brain, AlertTriangle, Zap, CheckCircle2, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import './EvaluationTracker.css';

export type EvaluationPhase = 'A' | 'B' | 'C' | 'Estrategias';

interface EvaluationTrackerProps {
  currentPhase: EvaluationPhase;
  profileLabel?: string;
  profileType?: 'overconf' | 'underconf' | 'calibrated';
  showTimerAndJol?: boolean;
  seconds?: number;
  jolDisplay?: string;
}

export function EvaluationTracker({ 
  currentPhase, 
  profileLabel, 
  profileType,
  showTimerAndJol = false,
  seconds = 0,
  jolDisplay
}: EvaluationTrackerProps) {
  const phases = [
    { id: 'A', label: 'Fase A', description: 'Pre-test' },
    { id: 'B', label: 'Fase B', description: 'Ejecución' },
    { id: 'C', label: 'Fase C', description: 'Calibración' },
    { id: 'Estrategias', label: 'Estrategias metacognitivas', description: 'Transferencia' },
  ];

  const getPhaseStatus = (phaseId: string) => {
    const currentIndex = phases.findIndex(p => p.id === currentPhase);
    const phaseIndex = phases.findIndex(p => p.id === phaseId);
    
    if (phaseIndex < currentIndex) return 'done';
    if (phaseIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getProfileIcon = () => {
    if (profileType === 'overconf') return <AlertTriangle className="w-3.5 h-3.5" />;
    if (profileType === 'underconf') return <Zap className="w-3.5 h-3.5" />;
    if (profileType === 'calibrated') return <CheckCircle2 className="w-3.5 h-3.5" />;
    return <Brain className="w-3.5 h-3.5" />;
  };

  return (
    <div className="em-topbar">
      <div className="em-logo">
        <div className="em-logo-mark">
          <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <span className="em-logo-text">Meta-Pathfinder</span>
      </div>

      <div className="em-phase-track">
        {phases.map((phase) => (
          <div 
            key={phase.id} 
            className={cn("em-phase-item", getPhaseStatus(phase.id))}
          >
            <span className="em-pd"></span>
            {phase.label}
          </div>
        ))}
      </div>

      {profileLabel && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn("em-perfil-chip", profileType)}
        >
          {getProfileIcon()}
          <span id="topChipLabel">{profileLabel}</span>
        </motion.div>
      )}
      
      {!profileLabel && currentPhase === 'Estrategias' && (
        <div className="em-perfil-chip calibrated">
          <Trophy className="w-3.5 h-3.5" />
          <span>Evaluación Finalizada</span>
        </div>
      )}

      {showTimerAndJol && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {jolDisplay && (
            <div className="fb-jol-chip">
              <i className="ti ti-brain" aria-hidden="true" style={{ fontSize: '13px' }}></i>
              {jolDisplay}
            </div>
          )}
          <div className="fb-timer-chip">
            <span className="fb-timer-dot"></span>
            <span>
              {Math.floor(seconds / 60).toString().padStart(2, '0')}:{(seconds % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
