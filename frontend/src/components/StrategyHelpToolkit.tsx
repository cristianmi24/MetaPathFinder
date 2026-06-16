import { useState } from 'react';
import { Estrategia } from '../data/metacognitiveStrategies';
import { getStrategyChallengeGuidance } from '../data/strategyChallengeGuidance';
import { StrategyMonitor, StrategyEvidence } from './StrategyMonitor';

interface StrategyHelpToolkitProps {
  challengeId: string;
  strategy: Estrategia;
  seconds: number;
  editCount: number;
  errCount: number;
  totalRuns: number;
  hintCount: number;
  clickCount: number;
  isChallengeDone: boolean;
  criteriaCount: number;
  criteriaLabels: string[];
  jolInicial?: number;
  estimatedMinutes?: number;
  isCodeChallenge?: boolean;
  onEvidence: (evidence: Partial<StrategyEvidence>) => void;
  variant?: 'banner' | 'sidebar';
}

export function StrategyHelpToolkit({
  challengeId,
  strategy,
  variant = 'banner',
  criteriaLabels,
  ...monitorProps
}: StrategyHelpToolkitProps) {
  const [expanded, setExpanded] = useState(variant === 'banner');
  const [activeTool, setActiveTool] = useState(0);
  const guidance = getStrategyChallengeGuidance(challengeId, strategy.id);

  const isBanner = variant === 'banner';

  return (
    <div
      style={{
        background: strategy.iconBg,
        border: `1.5px solid ${strategy.color}44`,
        borderRadius: isBanner ? '14px' : '12px',
        marginBottom: isBanner ? '12px' : '14px',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Cabecera de estrategia */}
      <button
        type="button"
        onClick={() => isBanner && setExpanded(e => !e)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: isBanner ? '12px 16px' : '10px 12px',
          background: 'transparent',
          border: 'none',
          cursor: isBanner ? 'pointer' : 'default',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: `${strategy.color}22`,
            border: `1px solid ${strategy.color}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <i className={`ti ${strategy.icon}`} style={{ color: strategy.color, fontSize: 16 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: strategy.color }}>
            Herramientas de ayuda · {strategy.badge}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fb-text, var(--on-surface))', lineHeight: 1.3 }}>
            {strategy.nombre}
          </div>
        </div>
        {isBanner && (
          <i
            className={`ti ${expanded ? 'ti-chevron-up' : 'ti-chevron-down'}`}
            style={{ color: strategy.color, fontSize: 16 }}
          />
        )}
      </button>

      {(expanded || !isBanner) && (
        <div style={{ padding: isBanner ? '0 16px 14px' : '0 0 0' }}>
          {/* Pestañas de herramientas */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {strategy.herramientas.map((h, i) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setActiveTool(i)}
                title={h.descripcion}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: `1px solid ${activeTool === i ? strategy.color : `${strategy.color}33`}`,
                  background: activeTool === i ? `${strategy.color}18` : 'transparent',
                  color: activeTool === i ? strategy.color : 'var(--fb-text-muted, var(--on-surface-variant))',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <i className={`ti ${h.icon}`} style={{ fontSize: 11 }} />
                {h.nombre}
              </button>
            ))}
          </div>

          {/* Guía del profesor para este reto + herramienta */}
          <div
            style={{
              fontSize: 11,
              color: 'var(--fb-text-muted, var(--on-surface-variant))',
              lineHeight: 1.55,
              padding: '10px 12px',
              background: `${strategy.color}0a`,
              borderRadius: 8,
              marginBottom: 10,
              borderLeft: `3px solid ${strategy.color}`,
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: strategy.color, marginBottom: 6 }}>
              <i className="ti ti-school" style={{ marginRight: 4 }} />
              Tu profesor en este reto
            </div>
            <p style={{ margin: '0 0 8px 0' }}>{guidance.mensajeProfesor}</p>
            {strategy.herramientas[activeTool] && (
              <p style={{ margin: 0 }}>
                <strong style={{ color: strategy.color }}>{strategy.herramientas[activeTool].nombre}: </strong>
                {strategy.herramientas[activeTool].descripcion}
              </p>
            )}
          </div>

          {guidance.pasosEnEsteReto.length > 0 && (
            <ol style={{ margin: '0 0 10px 0', paddingLeft: 18, fontSize: 10, lineHeight: 1.5, color: 'var(--fb-text-muted, var(--on-surface-variant))' }}>
              {guidance.pasosEnEsteReto.map((paso, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{paso}</li>
              ))}
            </ol>
          )}

          {guidance.ejemploConcreto && (
            <div style={{ fontSize: 10, fontStyle: 'italic', color: strategy.color, marginBottom: 10, padding: '6px 8px', background: `${strategy.color}08`, borderRadius: 6 }}>
              💡 {guidance.ejemploConcreto}
            </div>
          )}

          {/* Panel interactivo de la estrategia */}
          <StrategyMonitor
            strategy={strategy}
            criteriaLabels={criteriaLabels}
            placeholderHint={guidance.placeholderMonitor}
            {...monitorProps}
          />
        </div>
      )}
    </div>
  );
}