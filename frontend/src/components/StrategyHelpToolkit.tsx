import { ArrowLeft } from 'lucide-react';
import { Estrategia } from '../data/metacognitiveStrategies';
import { getStrategyBenefit } from '../data/strategyBenefits';
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
  /** Se llama cuando una herramienta necesita que el estudiante la abra (p. ej. el checkpoint de confianza). */
  onAttention?: () => void;
  /** Cierra el panel y vuelve a la actividad. */
  onClose: () => void;
  /** Abre la siguiente pista del reto. */
  onRequestHint?: () => void;
}

/**
 * Panel de herramientas de la estrategia activa. Ocupa el área de la actividad
 * mientras está abierto; se mantiene montado (oculto) para no perder lo que el estudiante anotó.
 */
export function StrategyHelpToolkit({
  challengeId,
  strategy,
  criteriaLabels,
  onClose,
  ...monitorProps
}: StrategyHelpToolkitProps) {
  const benefit = getStrategyBenefit(strategy.id);

  const card: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: 16,
  };
  const label: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    color: strategy.color,
    marginBottom: 8,
  };
  const body: React.CSSProperties = { fontSize: 13, lineHeight: 1.6, color: 'var(--text)', margin: 0 };

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
        <div
          style={{
            width: 46, height: 46, borderRadius: '50%', background: strategy.iconBg,
            border: `1.5px solid ${strategy.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <i className={`ti ${strategy.icon}`} style={{ color: strategy.color, fontSize: 22 }} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: strategy.color }}>
            Herramientas de apoyo · {strategy.badge}
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600, color: 'var(--text)', lineHeight: 1.25 }}>
            {strategy.nombre}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 999,
            border: `1.5px solid ${strategy.color}66`, background: strategy.iconBg, color: strategy.color,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Volver a la actividad
        </button>
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'start' }}>
        {/* Columna de explicación */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {benefit && (
            <div style={{ ...card, background: strategy.iconBg, borderColor: `${strategy.color}44` }}>
              <div style={label}>¿Para qué te ayuda?</div>
              <p style={{ ...body, fontSize: 14, fontWeight: 500 }}>{benefit.paraQue}</p>
              <p style={{ ...body, marginTop: 8, color: 'var(--text-muted)', fontSize: 12 }}>{benefit.cuando}</p>
            </div>
          )}

          {strategy.herramientas.map((h) => (
            <div key={h.id} style={{ ...card, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span
                style={{
                  width: 38, height: 38, borderRadius: '50%', background: `${strategy.color}1c`, color: strategy.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <i className={`ti ${h.icon}`} style={{ fontSize: 18 }} />
              </span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{h.nombre}</div>
                <p style={{ ...body, color: 'var(--text-muted)', marginTop: 2 }}>
                  {benefit?.herramientas[h.id] ?? h.descripcion}
                </p>
              </div>
            </div>
          ))}

        </div>

        {/* Columna interactiva */}
        <div style={card}>
          <div style={label}>Tu panel</div>
          <StrategyMonitor
            strategy={strategy}
            criteriaLabels={criteriaLabels}
            {...monitorProps}
          />
        </div>
      </div>
    </div>
  );
}
