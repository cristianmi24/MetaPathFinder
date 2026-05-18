import React, { useMemo, useState } from 'react';

interface SituationCard {
  id: string;
  title: string;
  description: string;
  oldTech: string;
  modernTech: string;
}

interface MatchCard {
  id: string;
  label: string;
  type: 'old' | 'modern';
  target: string;
}

const SITUATIONS: SituationCard[] = [
  {
    id: 's1',
    title: 'Comunicar noticias a alguien lejano',
    description: 'Una familia quería contar algo importante a un pariente que vive en otra ciudad.',
    oldTech: 'Carta escrita y correo postal',
    modernTech: 'Aplicación de mensajería instantánea',
  },
  {
    id: 's2',
    title: 'Conservar alimentos por varios días',
    description: 'Un puesto de comida necesitaba mantener los alimentos sin echarse a perder.',
    oldTech: 'Salazón y ahumado de alimentos',
    modernTech: 'Refrigerador eléctrico',
  },
  {
    id: 's3',
    title: 'Trasladar productos a otra ciudad',
    description: 'Una tienda debía enviar su mercancía a un mercado distante de forma segura.',
    oldTech: 'Carro tirado por caballos',
    modernTech: 'Camión de carga con GPS',
  },
  {
    id: 's4',
    title: 'Acceder a luz durante la noche',
    description: 'Un hogar necesitaba iluminar su casa cuando oscurecía.',
    oldTech: 'Lámpara de aceite',
    modernTech: 'Red eléctrica y bombillas LED',
  },
];

const CARDS: MatchCard[] = SITUATIONS.flatMap(s => [
  { id: `${s.id}-old`, label: s.oldTech, type: 'old', target: s.id },
  { id: `${s.id}-modern`, label: s.modernTech, type: 'modern', target: s.id },
]);

function shuffle<T>(array: T[]) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function MatchTechSituations() {
  const [cardOrder, setCardOrder] = useState<MatchCard[]>(() => shuffle(CARDS));
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ situationId: string; type: 'old' | 'modern' } | null>(null);
  const [placements, setPlacements] = useState<Record<string, { old: string | null; modern: string | null }>>(
    () => Object.fromEntries(SITUATIONS.map(s => [s.id, { old: null, modern: null }])),
  );
  const [tries, setTries] = useState(0);
  const [message, setMessage] = useState('Selecciona o arrastra una tarjeta y suéltala en la situación correcta.');
  const [completed, setCompleted] = useState(false);
  const maxTries = 8;
  const remainingAttempts = Math.max(0, maxTries - tries);
  const gameOver = completed || tries >= maxTries;

  const availableCards = useMemo(
    () => cardOrder.filter(card => !Object.values(placements).some(slot => slot[card.type] === card.id)),
    [cardOrder, placements],
  );

  const selectedCard = availableCards.find(card => card.id === selectedCardId);

  const selectCard = (id: string) => {
    if (gameOver) {
      setMessage('Juego terminado. Presiona Reiniciar para volver a jugar.');
      return;
    }
    setSelectedCardId(id);
    setMessage('Arrastra esta tarjeta a la situación correcta.');
  };

  const placeCard = (situationId: string, slotType: 'old' | 'modern', cardToPlace?: MatchCard) => {
    if (gameOver) {
      setMessage('Juego terminado. Presiona Reiniciar para volver a jugar.');
      return;
    }
    const placedCard = cardToPlace ?? selectedCard;
    if (!placedCard) {
      setMessage('Primero selecciona una tecnología en el panel derecho o arrastra una tarjeta.');
      return;
    }
    const nextTries = tries + 1;
    setTries(nextTries);

    if (nextTries >= maxTries && !completed) {
      setMessage('Ya no quedan más intentos. Presiona Reiniciar para volver a jugar.');
      setCompleted(true);
    }

    const targetSlot = placements[situationId];
    if (targetSlot[slotType]) {
      setMessage(`La situación ya tiene una tecnología ${slotType} asignada.`);
      return;
    }

    if (selectedCard.type !== slotType) {
      setMessage(`Esta tarjeta no es del tipo correcto (${slotType}). Usa la ranura adecuada.`);
      return;
    }

    if (selectedCard.target !== situationId) {
      if (nextTries >= maxTries) {
        setMessage('Intento fallido y no quedan más intentos. Presiona Reiniciar para volver a intentarlo.');
        setCompleted(true);
      } else {
        setMessage('Esta tecnología no corresponde a esa situación. Prueba otra combinación.');
      }
      setSelectedCardId(null);
      return;
    }

    setPlacements(prev => ({
      ...prev,
      [situationId]: { ...prev[situationId], [slotType]: selectedCard.id },
    }));
    setSelectedCardId(null);
    if (nextTries >= maxTries) {
      setCompleted(true);
      setMessage('Has usado los 8 intentos. Revisa tus respuestas o reinicia para volver a intentarlo.');
    } else {
      setMessage('¡Bien! Ahora selecciona otra tecnología para continuar.');
    }
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.setData('text/plain', id);
    setSelectedCardId(id);
    setMessage('Suelta la tarjeta en la ranura antigua o moderna correcta.');
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, situationId: string, slotType: 'old' | 'modern') => {
    event.preventDefault();
    const cardId = event.dataTransfer.getData('text/plain') || selectedCardId;
    const card = CARDS.find(item => item.id === cardId);
    if (!card) {
      setMessage('No se encontró la tarjeta. Selecciona o arrastra una tarjeta válida.');
      return;
    }

    placeCard(situationId, slotType, card);
    setSelectedCardId(null);
    setDragOverSlot(null);
  };

  const handleDragEnter = (situationId: string, slotType: 'old' | 'modern') => {
    setDragOverSlot({ situationId, type: slotType });
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const resetGame = () => {
    setCardOrder(shuffle(CARDS));
    setSelectedCardId(null);
    setPlacements(Object.fromEntries(SITUATIONS.map(s => [s.id, { old: null, modern: null }])));
    setTries(0);
    setMessage('Selecciona una tarjeta y luego elige la situación correcta.');
    setCompleted(false);
  };

  const checkAnswers = () => {
    const correctCount = SITUATIONS.reduce((count, situation) => {
      const placement = placements[situation.id];
      return count + ((placement.old === `${situation.id}-old` && placement.modern === `${situation.id}-modern`) ? 1 : 0);
    }, 0);

    if (correctCount === SITUATIONS.length) {
      setCompleted(true);
      setMessage('¡Perfecto! Asociaraste correctamente las 4 situaciones con tecnologías antiguas y modernas.');
    } else {
      setMessage(`Tienes ${correctCount} de 4 situaciones completas. Revisa las tecnologías que quedan.`);
    }
  };

  const clearSelection = () => {
    setSelectedCardId(null);
    setMessage('Selecciona una tarjeta nuevamente.');
  };

  return (
    <div className="match-tech-scoped">
      <style>{`
        .match-tech-scoped .page{padding:1.2rem 1rem 2.5rem;background:var(--color-surface);color:var(--color-on-surface)}
        .match-tech-scoped .hero{text-align:center;margin-bottom:1.4rem}
        .match-tech-scoped .hero h1{font-size:21px;font-weight:500;margin:0}
        .match-tech-scoped .hero p{font-size:13px;color:var(--color-on-surface-variant);margin-top:4px;line-height:1.5}
        .match-tech-scoped .layout{display:grid;grid-template-columns:1.3fr 1fr;gap:20px;margin-bottom:1.4rem}
        .match-tech-scoped .situation-grid{display:grid;gap:16px}
        .match-tech-scoped .situation-card{border:1px solid var(--color-outline-variant);border-radius:16px;background:var(--color-surface-container);padding:16px;min-height:160px;display:flex;flex-direction:column;justify-content:space-between;margin:0}
        .match-tech-scoped .situation-card h3{font-size:14px;color:var(--color-on-surface);margin-bottom:8px}
        .match-tech-scoped .situation-card p{font-size:12px;color:var(--color-on-surface-variant);line-height:1.4;margin-bottom:12px}
        .match-tech-scoped .slot-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .match-tech-scoped .slot{padding:10px;border-radius:12px;border:1px dashed var(--color-outline-variant);min-height:48px;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--color-on-surface-variant);background:var(--color-surface);transition:border-color .2s,background .2s}
        .match-tech-scoped .slot.filled{border-style:solid;background:var(--color-surface-container-high)}
        .match-tech-scoped .slot.drag-over{border-color:var(--color-primary);background:var(--color-surface-container)}
        .match-tech-scoped .slot span{font-size:12px;line-height:1.3}
        .match-tech-scoped .cards-panel{display:flex;flex-direction:column;gap:12px}
        .match-tech-scoped .cards-title{font-size:11px;font-weight:700;text-transform:uppercase;color:var(--color-on-surface-variant);letter-spacing:.08em}
        .match-tech-scoped .card-list{display:grid;grid-template-columns:1fr;gap:10px}
        .match-tech-scoped .tech-card{border-radius:16px;border:2px solid var(--color-outline-variant);background:var(--color-surface-container);padding:12px;cursor:pointer;transition:border-color .2s,transform .15s;margin:0}
        .match-tech-scoped .tech-card:hover{transform:translateY(-1px)}
        .match-tech-scoped .tech-card.selected{border-color:var(--color-primary)}
        .match-tech-scoped .tech-card.filled{opacity:.45;cursor:not-allowed}
        .match-tech-scoped .tech-card .type-label{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px;color:var(--color-on-surface-variant)}
        .match-tech-scoped .tech-card .text{font-size:13px;color:var(--color-on-surface)}
        .match-tech-scoped .status-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:1rem}
        .match-tech-scoped .status-banner{flex:1;padding:12px 14px;border-radius:14px;background:var(--color-surface-container);color:var(--color-on-surface);font-size:13px}
        .match-tech-scoped .actions{display:flex;gap:10px;flex-wrap:wrap}
        .match-tech-scoped .btn{padding:10px 18px;border-radius:14px;border:1px solid var(--color-outline-variant);background:transparent;color:var(--color-on-surface);cursor:pointer}
        .match-tech-scoped .btn.primary{background:var(--color-primary-container);border-color:var(--color-primary-container);color:var(--color-on-primary-container)}
        .match-tech-scoped .btn.secondary{background:transparent}
      `}</style>
      <div className="page">
        <div className="hero">
          <h1>🔗 Relaciona tecnologías antiguas y modernas</h1>
          <p>Asocia cada situación con la tecnología antigua y la moderna que la resolvió.</p>
        </div>

        <div className="status-row">
          <div className="status-banner">{message}</div>
          <div className="status-banner">Intentos restantes: {remainingAttempts}</div>
          <div className="actions">
            <button className="btn primary" onClick={checkAnswers} disabled={gameOver}>Verificar</button>
            <button className="btn secondary" onClick={resetGame}>Reiniciar</button>
            <button className="btn secondary" onClick={clearSelection}>Limpiar selección</button>
          </div>
        </div>

        <div className="layout">
          <div className="situation-grid">
            {SITUATIONS.map(situation => {
              const placement = placements[situation.id];
              return (
                <div key={situation.id} className="situation-card">
                  <div>
                    <h3>{situation.title}</h3>
                    <p>{situation.description}</p>
                  </div>
                  <div className="slot-row">
                    <div
                      className={`slot ${placement.old ? 'filled' : ''} ${dragOverSlot?.situationId === situation.id && dragOverSlot?.type === 'old' ? 'drag-over' : ''}`}
                      onClick={() => placeCard(situation.id, 'old')}
                      onDragOver={handleDragOver}
                      onDragEnter={() => handleDragEnter(situation.id, 'old')}
                      onDragLeave={handleDragLeave}
                      onDrop={(event) => handleDrop(event, situation.id, 'old')}
                    >
                      <span>{placement.old ? CARDS.find(card => card.id === placement.old)?.label : 'Tecnología antigua'}</span>
                    </div>
                    <div
                      className={`slot ${placement.modern ? 'filled' : ''} ${dragOverSlot?.situationId === situation.id && dragOverSlot?.type === 'modern' ? 'drag-over' : ''}`}
                      onClick={() => placeCard(situation.id, 'modern')}
                      onDragOver={handleDragOver}
                      onDragEnter={() => handleDragEnter(situation.id, 'modern')}
                      onDragLeave={handleDragLeave}
                      onDrop={(event) => handleDrop(event, situation.id, 'modern')}
                    >
                      <span>{placement.modern ? CARDS.find(card => card.id === placement.modern)?.label : 'Tecnología moderna'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cards-panel">
            <div className="cards-title">Tecnologías disponibles</div>
            <div className="card-list">
              {availableCards.map(card => (
                <div
                  key={card.id}
                  className={`tech-card ${selectedCardId === card.id ? 'selected' : ''}`}
                  draggable={!completed}
                  onDragStart={(event) => handleDragStart(event, card.id)}
                  onDragEnd={handleDragLeave}
                  onClick={() => selectCard(card.id)}
                >
                  <div className="text">{card.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
