import { useState, useCallback, useRef, useEffect } from 'react';
import './ArduinoBlockBoard.css';

interface BlockDef {
  id: string;
  text: string;
  type: 'setup' | 'loop' | 'logic' | 'io';
}

const BLOCKS: BlockDef[] = [
  { id:'step-0', text:'Configurar Pin 13 (LED Rojo) como SALIDA', type:'io' },
  { id:'step-1', text:'Configurar Pin 12 (LED Verde) como SALIDA', type:'io' },
  { id:'step-2', text:'Iniciar Monitor Serial a 9600 bps', type:'io' },
  { id:'step-3', text:'Variable temperatura = leer pin analógico A0', type:'logic' },
  { id:'step-4', text:'Imprimir en Monitor Serial: temperatura', type:'io' },
  { id:'step-5', text:'Evaluar condición: temperatura > 30°C', type:'logic' },
  { id:'step-6', text:'SI: Encender Pin 13, Apagar Pin 12', type:'io' },
  { id:'step-7', text:'SINO: Apagar Pin 13, Encender Pin 12', type:'io' },
  { id:'step-8', text:'Esperar 2 segundos', type:'logic' },
];

const CORRECT_ORDER = ['step-0','step-1','step-2','step-3','step-4','step-5','step-6','step-7','step-8'];

const typeLabel: Record<string, string> = {
  setup: '#ff5722', loop: '#4caf50', logic: '#2196f3', io: '#9c27b0'
};

interface ArduinoBlockBoardProps {
  challengeId: string;
  onValidation: (success: boolean) => void;
}

export function ArduinoBlockBoard({ challengeId, onValidation }: ArduinoBlockBoardProps) {
  const [bank, setBank] = useState<BlockDef[]>(() => [...BLOCKS].sort(() => Math.random() - 0.5));
  const [workspace, setWorkspace] = useState<BlockDef[]>([]);
  const [attempted, setAttempted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [temp, setTemp] = useState(24);
  const [serialLog, setSerialLog] = useState<string[]>(['Arma el código y presiona Ejecutar.']);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const serialRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (serialRef.current) serialRef.current.scrollTop = serialRef.current.scrollHeight;
  }, [serialLog]);

  useEffect(() => {
    return () => { if (simRef.current) clearInterval(simRef.current); };
  }, []);

  const addToWorkspace = useCallback((block: BlockDef) => {
    if (attempted) return;
    setBank(prev => prev.filter(b => b.id !== block.id));
    setWorkspace(prev => [...prev, block]);
    setMessage(null);
  }, [attempted]);

  const removeFromWorkspace = useCallback((block: BlockDef) => {
    if (attempted) return;
    setWorkspace(prev => prev.filter(b => b.id !== block.id));
    setBank(prev => [...prev, block]);
    setMessage(null);
  }, [attempted]);

  const moveUp = useCallback((idx: number) => {
    if (attempted || idx === 0) return;
    setWorkspace(prev => {
      const next = [...prev];
      [next[idx-1], next[idx]] = [next[idx], next[idx-1]];
      return next;
    });
  }, [attempted]);

  const moveDown = useCallback((idx: number) => {
    if (attempted) return;
    setWorkspace(prev => {
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx+1]] = [next[idx+1], next[idx]];
      return next;
    });
  }, [attempted]);

  const handleEjecutar = useCallback(() => {
    if (attempted) return;
    const ids = workspace.map(b => b.id);
    const isValid = JSON.stringify(ids) === JSON.stringify(CORRECT_ORDER);
    setAttempted(true);

    if (isValid) {
      setSuccess(true);
      setMessage({ type: 'ok', text: '✓ ¡Código correcto! Simulación desbloqueada.' });
      onValidation(true);
      setSerialLog(['[Código validado. Inicia la simulación.]']);
    } else {
      setMessage({ type: 'err', text: '❌ Código incorrecto. Has agotado tus oportunidades.' });
      onValidation(false);
    }
  }, [attempted, workspace, onValidation]);

  const runArduinoLogic = useCallback(() => {
    const currentTemp = temp;
    const ts = new Date().toLocaleTimeString();
    let line = `[${ts}] Temp: ${currentTemp}°C`;
    if (currentTemp > 30) {
      line += ' ⚠️ ALERTA Pin 13 HIGH / Pin 12 LOW';
    } else {
      line += ' ✅ NORMAL Pin 13 LOW / Pin 12 HIGH';
    }
    setSerialLog(prev => [...prev, line]);
  }, [temp]);

  const toggleSimulation = useCallback(() => {
    if (!success) return;
    if (simulating) {
      if (simRef.current) clearInterval(simRef.current);
      simRef.current = null;
      setSimulating(false);
      setSerialLog(['[Simulación detenida]']);
    } else {
      setSimulating(true);
      setSerialLog(['[Iniciando transmisión...]']);
      runArduinoLogic();
      simRef.current = setInterval(runArduinoLogic, 2000);
    }
  }, [success, simulating, runArduinoLogic]);

  return (
    <div className="ard-root">
      <h1>🧩 Desafío Arduino</h1>
      <p className="description">
        <b>Misión:</b> Ordena todos los bloques en la secuencia correcta del programa Arduino.
        Haz clic para agregarlos, usa ↑↓ para ordenar y presiona <b>Ejecutar</b>.
      </p>

      {message && (
        <div className={`ard-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="ard-workspace">
        <div className="ard-panel" style={{ flex: 1 }}>
          <h2 className="ard-panel-title">🗂️ Bloques</h2>
          <div className="ard-banco">
            {bank.length === 0 ? (
              <div className="ard-empty-msg">✓ Todos los bloques colocados</div>
            ) : (
              bank.map(b => (
                <div
                  key={b.id}
                  className={`ard-block ${attempted ? 'ard-disabled' : 'ard-clickable'}`}
                  onClick={() => addToWorkspace(b)}
                >
                  <span className="ard-plus-sign">+</span> {b.text}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="ard-panel" style={{ flex: 1.5 }}>
          <h2 className="ard-panel-title">📝 Tu programa</h2>
          <div className="ard-workspace-zone">
            {workspace.length === 0 ? (
              <div className="ard-zone-hint">Haz clic en los bloques de la izquierda para armarlo</div>
            ) : (
              workspace.map((b, idx) => (
                <div key={b.id} className="ard-ws-row">
                  <span className="ard-idx">{idx + 1}</span>
                  <div className="ard-block ard-ws-block">
                    {b.text}
                  </div>
                  {!attempted && (
                    <div className="ard-ws-controls">
                      <button className="ard-arrow-btn" onClick={() => moveUp(idx)} disabled={idx === 0}>↑</button>
                      <button className="ard-arrow-btn" onClick={() => moveDown(idx)} disabled={idx === workspace.length - 1}>↓</button>
                      <button className="ard-remove-btn" onClick={() => removeFromWorkspace(b)}>✕</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {!attempted && (
            <button
              className={`ard-ejecutar-btn ${bank.length === 0 ? 'ready' : ''}`}
              onClick={handleEjecutar}
              disabled={bank.length !== 0}
            >
              <i className="ti ti-player-play" /> Ejecutar
            </button>
          )}
        </div>

        <div className="ard-panel ard-panel-circuito" style={{ flex: 1 }}>
          <h2 className="ard-panel-title">🔌 Simulador</h2>
          <div className="ard-hardware">
            <div className="ard-component ard-sensor">
              🌡️ Sensor TMP36
              <input
                type="range" className="ard-slider" min={15} max={45} value={temp}
                onChange={e => setTemp(parseInt(e.target.value))}
                disabled={!success}
              />
              <div><span style={{ color: temp > 30 ? '#ff4d4d' : '#4dff4d', fontWeight: 'bold' }}>{temp}°C</span></div>
            </div>
            <div className="ard-leds">
              <div className={`ard-led ard-led-red ${simulating && temp > 30 ? 'active' : ''}`}>🔴 LED R</div>
              <div className={`ard-led ard-led-green ${simulating && temp <= 30 ? 'active' : ''}`}>🟢 LED V</div>
            </div>
            <div className="ard-component ard-arduino">♾️ Arduino Uno</div>
          </div>
          <div>
            <div className="ard-title-section">🖥️ Monitor Serial</div>
            <div className="ard-serial" ref={serialRef}>
              {serialLog.map((line, i) => <div key={i}>{line}</div>)}
            </div>
            <button
              className={`ard-btn ${simulating ? 'stop' : success ? 'ready' : ''}`}
              onClick={toggleSimulation}
              disabled={!success}
            >
              {simulating ? '⏹️ Detener' : success ? '▶️ Iniciar' : '🔒 Bloqueado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
