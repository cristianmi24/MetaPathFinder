import React, { useState, useEffect } from 'react';
import './LibraryPseudocode.css';

interface Block {
  id: string;
  label: string;
  icon: string;
  cls: string;
  correct: boolean;
}

const CORRECT_ORDER: Block[] = [
  { id: "p1", label: "Inicio", icon: "🚀", cls: "block-start", correct: true },
  { id: "p2", label: "Leer ID de Estudiante y código de Libro", icon: "📝", cls: "block-read", correct: true },
  { id: "p3", label: "SI Libro está disponible ENTONCES", icon: "🔍", cls: "block-if", correct: true },
  { id: "p4", label: "Registrar Préstamo y marcar como No Disponible", icon: "💾", cls: "block-save", correct: true },
  { id: "p5", label: "Fin", icon: "🏁", cls: "block-end", correct: true },
];

const WRONG_BLOCKS: Block[] = [
  { id: "w1", label: "Comprar pizza para el bibliotecario", icon: "🍕", cls: "block-wrong", correct: false },
  { id: "w2", label: "Formatear base de datos del servidor", icon: "⚠️", cls: "block-wrong", correct: false },
];

const ALL_BLOCKS = [...CORRECT_ORDER, ...WRONG_BLOCKS];

export default function LibraryPseudocode({ onValidation }: { onValidation?: (success: boolean) => void }) {
  const [poolOrder, setPoolOrder] = useState<Block[]>([]);
  const [slotContents, setSlotContents] = useState<(Block | null)[]>(Array(5).fill(null));
  const [dragItem, setDragItem] = useState<{ block: Block, from: { type: 'pool' } | { type: 'slot', index: number } } | null>(null);
  const [feedback, setFeedback] = useState<{ show: boolean, type: 'success'|'partial'|'fail', text: React.ReactNode }>({ show: false, type: 'fail', text: '' });
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [slotStates, setSlotStates] = useState<string[]>(Array(5).fill(''));

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
    setSlotContents(Array(5).fill(null));
    setFeedback({ show: false, type: 'fail', text: '' });
    setSlotStates(Array(5).fill(''));
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
    evalSlots(newSlots);
  };

  const handleRemoveFromSlot = (index: number) => {
    const newSlots = [...slotContents];
    newSlots[index] = null;
    setSlotContents(newSlots);
    evalSlots(newSlots);
  };

  const evalSlots = (slots: (Block | null)[]) => {
    let correct = 0;
    let filled = 0;
    const newStates = Array(5).fill('');

    slots.forEach((b, i) => {
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

    if (filled < 5) {
      setFeedback({
        show: true,
        type: 'fail',
        text: <>Colocados: {filled} de 5 bloques. ¡Completa los 5 pasos del pseudocódigo!</>
      });
      if (onValidation) onValidation(false);
    } else if (correct === 5) {
      setFeedback({
        show: true,
        type: 'success',
        text: <>¡Excelente! Has ordenado el pseudocódigo del préstamo de libros de forma correcta.</>
      });
      throwConfetti();
      if (onValidation) onValidation(true);
    } else {
      setFeedback({
        show: true,
        type: 'partial',
        text: <>Tienes {correct} de 5 correctos.</>
      });
      if (onValidation) onValidation(false);
    }
  };

  const throwConfetti = () => {
    const colors = ["#81c784","#64b5f6","#ffd54f","#f06292","#ba68c8","#4db6ac"];
    for (let i = 0; i < 40; i++) {
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

  return (
    <div className="library-pseudocode-app w-full h-full p-4 overflow-auto relative bg-white dark:bg-[#1a1b1e] rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="top-bar">
        <h1>Pseudocódigo de Biblioteca</h1>
        <div className="score-badge">{getCorrectCount()} / 5 correctos</div>
      </div>

      <div className="instructions">
        <span>Arrastra y ordena los bloques para estructurar el pseudocódigo lógico del préstamo de libros. Descarta los pasos incorrectos.</span>
      </div>

      <div className="columns">
        <div className="panel">
          <div className="panel-title">
            <span>Bloques de Pseudocódigo</span>
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
                  <span className="drag-icon">⋮⋮</span>
                  <span className="block-icon">{b.icon}</span>
                  <span className="block-text font-mono">{b.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="panel-title" style={{marginBottom:'8px'}}>
            <span>Algoritmo Ordenado</span>
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
                      <span className="drag-icon">⋮⋮</span>
                      <span className="block-icon">{b.icon}</span>
                      <span className="block-text font-mono">{b.label}</span>
                    </div>
                    <button className="remove-btn" title="Quitar" onClick={() => handleRemoveFromSlot(i)}>
                      ✕
                    </button>
                  </>
                ) : (
                  <span className="slot-label font-mono">Suelta el bloque {i + 1} aquí</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`feedback-bar ${feedback.show ? 'show' : ''} ${feedback.type}`}>
        {feedback.text}
      </div>
    </div>
  );
}
