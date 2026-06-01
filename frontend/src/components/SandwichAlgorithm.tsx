import React, { useState, useEffect } from 'react';
import './SandwichAlgorithm.css';

interface Block {
  id: string;
  label: string;
  icon: string;
  cls: string;
  correct: boolean;
}

const CORRECT_ORDER: Block[] = [
  { id: "b1", label: "Toma una rebanada de pan y ponla sobre la tabla", icon: "🍞", cls: "block-bread", correct: true },
  { id: "b2", label: "Unta mantequilla sobre el pan", icon: "🧈", cls: "block-butter", correct: true },
  { id: "b3", label: "Coloca hojas de lechuga y rodajas de tomate", icon: "🥬", cls: "block-veggie", correct: true },
  { id: "b4", label: "Añade el jamón encima de las verduras", icon: "🥩", cls: "block-protein", correct: true },
  { id: "b5", label: "Pon una rebanada de queso", icon: "🧀", cls: "block-cheese", correct: true },
  { id: "b6", label: "Agrega salsa al gusto", icon: "🫙", cls: "block-sauce", correct: true },
  { id: "b7", label: "Coloca la segunda rebanada de pan encima", icon: "🍞", cls: "block-bread", correct: true },
];

const WRONG_BLOCKS: Block[] = [
  { id: "w1", label: "Lava el plato antes de servir", icon: "🫧", cls: "block-wrong", correct: false },
  { id: "w2", label: "Calienta el sándwich en el horno", icon: "🔥", cls: "block-wrong", correct: false },
  { id: "w3", label: "Corta el pan con tijeras", icon: "✂️", cls: "block-tools", correct: false },
];

const ALL_BLOCKS = [...CORRECT_ORDER, ...WRONG_BLOCKS];

export function SandwichAlgorithm({ challengeId, onValidation }: { challengeId?: string, onValidation?: (success: boolean) => void }) {
  const [poolOrder, setPoolOrder] = useState<Block[]>([]);
  const [slotContents, setSlotContents] = useState<(Block | null)[]>(Array(7).fill(null));
  const [dragItem, setDragItem] = useState<{ block: Block, from: { type: 'pool' } | { type: 'slot', index: number } } | null>(null);
  const [feedback, setFeedback] = useState<{ show: boolean, type: 'success'|'partial'|'fail', text: React.ReactNode }>({ show: false, type: 'fail', text: '' });
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [slotStates, setSlotStates] = useState<string[]>(Array(7).fill(''));

  const shuffle = (arr: Block[]) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  useEffect(() => {
    buildPool();
  }, []);

  const buildPool = () => {
    setPoolOrder(shuffle(ALL_BLOCKS));
    setSlotContents(Array(7).fill(null));
    setFeedback({ show: false, type: 'fail', text: '' });
    setSlotStates(Array(7).fill(''));
  };

  const getCorrectCount = () => {
    let count = 0;
    slotContents.forEach((b, i) => {
      if (b && b.id === CORRECT_ORDER[i].id) count++;
    });
    return count;
  };

  const handleDragStart = (b: Block, from: { type: 'pool' } | { type: 'slot', index: number }, e: React.DragEvent) => {
    setDragItem({ block: b, from });
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.classList.add('dragging');
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove('dragging');
    }
    setDragItem(null);
    setHoveredSlot(null);
  };

  const handleDropOnSlot = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    setHoveredSlot(null);
    
    if (!dragItem) return;
    const { block, from } = dragItem;
    
    if (from.type === 'slot' && from.index === index) {
      setDragItem(null);
      return;
    }
    
    const newSlots = [...slotContents];
    
    if (from.type === 'slot') {
      newSlots[from.index] = null;
    }
    
    if (newSlots[index] !== null && from.type === 'slot') {
       newSlots[from.index] = newSlots[index];
    } else if (newSlots[index] !== null) {
       setDragItem(null);
       return;
    }
    
    newSlots[index] = block;
    setSlotContents(newSlots);
    setDragItem(null);
    setFeedback({ ...feedback, show: false });
    setSlotStates(Array(7).fill(''));
  };

  const handleRemoveFromSlot = (index: number) => {
    const newSlots = [...slotContents];
    newSlots[index] = null;
    setSlotContents(newSlots);
    setFeedback({ ...feedback, show: false });
    setSlotStates(Array(7).fill(''));
  };

  const throwConfetti = () => {
    const colors = ["#f48fb1","#81c784","#ffcc80","#90caf9","#ce93d8","#fff176","#80deea"];
    for (let i = 0; i < 50; i++) {
      const p = document.createElement("div");
      p.style.cssText = `
        position:fixed; pointer-events:none; z-index:9999;
        width:8px; height:8px;
        border-radius:${Math.random()>0.5?"50%":"2px"};
        background:${colors[Math.floor(Math.random()*colors.length)]};
        left:${Math.random()*100}vw;
        top:-10px;
        animation: fall ${1+Math.random()}s ease-in ${Math.random()*0.6}s forwards;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 2500);
    }
  };

  const checkAnswer = () => {
    let correct = 0;
    let filled = 0;
    const newStates = Array(7).fill('');

    slotContents.forEach((b, i) => {
      if (!b) return;
      filled++;
      if (b.id === CORRECT_ORDER[i].id) {
        newStates[i] = 'checking correct-mark';
        correct++;
      } else {
        newStates[i] = 'checking wrong';
      }
    });

    setSlotStates(newStates);

    if (filled < 7) {
      setFeedback({
        show: true,
        type: 'fail',
        text: <><i className="ti ti-alert-circle" style={{fontSize:'18px',flexShrink:0}}></i> Aún faltan pasos por colocar. ¡Completa los 7 bloques!</>
      });
      if (onValidation) onValidation(false);
    } else if (correct === 7) {
      setFeedback({
        show: true,
        type: 'success',
        text: <><i className="ti ti-trophy" style={{fontSize:'18px',flexShrink:0}}></i> ¡Perfecto! Armaste el sándwich en el orden correcto. ¡Excelente trabajo!</>
      });
      throwConfetti();
      if (onValidation) onValidation(true);
    } else {
      setFeedback({
        show: true,
        type: 'partial',
        text: <><i className="ti ti-star-half" style={{fontSize:'18px',flexShrink:0}}></i> Tienes {correct} de 7 correctos. Los bloques en rojo están en posición incorrecta. ¡Inténtalo de nuevo!</>
      });
      if (onValidation) onValidation(false);
    }
  };

  return (
    <div className="sandwich-app w-full h-full p-4 overflow-auto relative bg-white dark:bg-[#1a1b1e] rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="top-bar">
        <h1>Arma el sándwich</h1>
        <div className="score-badge">{getCorrectCount()} / 7 correctos</div>
      </div>

      <div className="instructions">
        <i className="ti ti-drag-drop" style={{fontSize:'18px',flexShrink:0}}></i>
        Arrastra cada bloque al orden correcto. Hay pasos trampa que no pertenecen al algoritmo.
      </div>

      <div className="columns">
        <div className="panel">
          <div className="panel-title">
            <i className="ti ti-stack-2" style={{fontSize:'15px'}}></i>
            Bloques disponibles
          </div>
          <div className="blocks-pool">
            {poolOrder.map((b) => {
              const inSlot = slotContents.some(s => s && s.id === b.id);
              return (
                <div 
                  key={b.id}
                  className={`block ${b.cls} ${inSlot ? 'used' : ''}`}
                  draggable={!inSlot}
                  onDragStart={(e) => !inSlot && handleDragStart(b, { type: 'pool' }, e)}
                  onDragEnd={handleDragEnd}
                >
                  <i className="ti ti-grip-vertical drag-handle"></i>
                  <span className="block-icon">{b.icon}</span>
                  <span className="block-text">{b.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="panel-title" style={{marginBottom:'8px'}}>
            <i className="ti ti-list-numbers" style={{fontSize:'15px'}}></i>
            Tu secuencia
          </div>
          <div className="drop-zone">
            {slotContents.map((b, i) => (
              <div 
                key={i} 
                className={`slot ${hoveredSlot === i ? 'over' : ''} ${slotStates[i]}`}
                onDragOver={(e) => { e.preventDefault(); setHoveredSlot(i); }}
                onDragLeave={() => setHoveredSlot(null)}
                onDrop={(e) => handleDropOnSlot(i, e)}
              >
                <span className="slot-number">{i + 1}</span>
                {b ? (
                  <>
                    <div 
                      className={`block ${b.cls}`}
                      style={{ paddingLeft: '28px' }}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(b, { type: 'slot', index: i }, e)}
                      onDragEnd={handleDragEnd}
                    >
                      <i className="ti ti-grip-vertical drag-handle"></i>
                      <span className="block-icon">{b.icon}</span>
                      <span className="block-text">{b.label}</span>
                    </div>
                    <button className="remove-btn" title="Quitar" onClick={() => handleRemoveFromSlot(i)}>
                      <i className="ti ti-x" style={{fontSize:'13px'}}></i>
                    </button>
                  </>
                ) : (
                  <span className="slot-label">Suelta aquí</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="check-row">
        <button className="btn-check" onClick={checkAnswer}>
          <i className="ti ti-check" style={{fontSize:'16px',verticalAlign:'-2px',marginRight:'4px'}}></i>
          Verificar orden
        </button>
        <button className="btn-reset" onClick={buildPool} title="Reiniciar todo">
          <i className="ti ti-refresh" style={{fontSize:'16px',verticalAlign:'-2px'}}></i>
        </button>
      </div>

      <div className={`feedback-bar ${feedback.show ? 'show' : ''} ${feedback.type}`}>
        {feedback.text}
      </div>
    </div>
  );
}
