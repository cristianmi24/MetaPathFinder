import { useCallback, useEffect, useRef, useState } from 'react';
import { Estrategia } from '../data/metacognitiveStrategies';
import { getStrategyChallengeGuidance } from '../data/strategyChallengeGuidance';
import { StrategyMonitor, StrategyEvidence } from './StrategyMonitor';
import './StrategyHelpToolkit.css';

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
  variant?: 'banner' | 'sidebar' | 'floating';
}

export function StrategyHelpToolkit({
  challengeId,
  strategy,
  variant = 'banner',
  criteriaLabels,
  ...monitorProps
}: StrategyHelpToolkitProps) {
  const isFloating = variant === 'floating';
  const isBanner = variant === 'banner';

  const [expanded, setExpanded] = useState(variant === 'banner');
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  const [activeTool, setActiveTool] = useState(0);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; baseLeft: number; baseTop: number } | null>(null);

  const guidance = getStrategyChallengeGuidance(challengeId, strategy.id);

  const onPointerMove = useCallback((e: PointerEvent) => {
    const d = dragRef.current;
    if (!d || !panelRef.current) return;
    const w = panelRef.current.offsetWidth;
    let left = d.baseLeft + (e.clientX - d.startX);
    let top = d.baseTop + (e.clientY - d.startY);
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - 56));
    setPos({ left, top });
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  }, [onPointerMove]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (window.innerWidth < 640 || !panelRef.current) return;
    if ((e.target as HTMLElement).closest('button')) return; // no arrastrar desde los botones
    const rect = panelRef.current.getBoundingClientRect();
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseLeft: rect.left, baseTop: rect.top };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }, [onPointerMove, onPointerUp]);

  useEffect(() => () => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  }, [onPointerMove, onPointerUp]);

  const showContent = isFloating ? !collapsed : (variant === 'sidebar' ? true : expanded);

  const innerContent = (
    <>
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
    </>
  );

  // ─── Variante flotante ──────────────────────────────────────────────
  if (isFloating) {
    return (
      <div
        ref={panelRef}
        className={`sht-float ${collapsed ? 'is-collapsed' : ''}`}
        style={pos ? { left: pos.left, top: pos.top, right: 'auto', bottom: 'auto' } : { right: 'auto', left: 16, bottom: 16 }}
      >
        <div
          id="tour-strategy-panel"
          className="sht-float__header"
          onPointerDown={onPointerDown}
        >
          <div
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: `${strategy.color}22`, border: `1px solid ${strategy.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <i className={`ti ${strategy.icon}`} style={{ color: strategy.color, fontSize: 15 }} />
          </div>
          <div className="sht-float__title">
            <div className="sht-float__kicker" style={{ color: strategy.color }}>
              Herramientas · {strategy.badge}
            </div>
            <div className="sht-float__name">{strategy.nombre}</div>
          </div>
          <button
            type="button"
            className="sht-float__btn"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Mostrar herramientas' : 'Minimizar'}
            aria-label={collapsed ? 'Mostrar herramientas' : 'Minimizar'}
          >
            <i className={`ti ${collapsed ? 'ti-chevron-up' : 'ti-chevron-down'}`} />
          </button>
        </div>
        <div className="sht-float__body">{innerContent}</div>
      </div>
    );
  }

  // ─── Variantes banner / sidebar (comportamiento original) ───────────
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

      {showContent && (
        <div style={{ padding: isBanner ? '0 16px 14px' : '0 0 0' }}>{innerContent}</div>
      )}
    </div>
  );
}
