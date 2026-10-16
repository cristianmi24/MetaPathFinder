import React, { useMemo, useState } from 'react';
import { type OnValidation, partialAttempt } from '../lib/boardValidation';

interface MatchItem {
  id: string;
  cat: string;
  catBg: string;
  catTxt: string;
  imgLabel: string;
  termName: string;
  benefit: string;
  icon: string;
  benefitIcon: string;
}

const ITEMS: MatchItem[] = [
  {
    id: 'elec1',
    icon: 'ti-bolt',
    benefitIcon: 'ti-bulb',
    cat: 'Eléctrica',
    catBg: 'color-mix(in srgb, #c27a1a 16%, var(--color-surface-container-lowest))',
    catTxt: 'color-mix(in srgb, #c27a1a 70%, var(--color-on-surface))',
    imgLabel: 'Torres de transmisión',
    termName: 'Red eléctrica',
    benefit: 'Lleva luz a hogares, hospitales y escuelas',
  },
  {
    id: 'elec2',
    icon: 'ti-sun',
    benefitIcon: 'ti-leaf',
    cat: 'Eléctrica',
    catBg: 'color-mix(in srgb, #c27a1a 16%, var(--color-surface-container-lowest))',
    catTxt: 'color-mix(in srgb, #c27a1a 70%, var(--color-on-surface))',
    imgLabel: 'Paneles solares',
    termName: 'Energía solar',
    benefit: 'Genera electricidad limpia y reduce la contaminación',
  },
  {
    id: 'trans1',
    icon: 'ti-train',
    benefitIcon: 'ti-users',
    cat: 'Transporte',
    catBg: 'color-mix(in srgb, #3b6fd8 16%, var(--color-surface-container-lowest))',
    catTxt: 'color-mix(in srgb, #3b6fd8 70%, var(--color-on-surface))',
    imgLabel: 'Metro urbano',
    termName: 'Metro / tren urbano',
    benefit: 'Mueve miles de personas rápido y sin contaminar',
  },
  {
    id: 'trans2',
    icon: 'ti-bridge',
    benefitIcon: 'ti-route',
    cat: 'Transporte',
    catBg: 'color-mix(in srgb, #3b6fd8 16%, var(--color-surface-container-lowest))',
    catTxt: 'color-mix(in srgb, #3b6fd8 70%, var(--color-on-surface))',
    imgLabel: 'Puente vial',
    termName: 'Puente y viaducto',
    benefit: 'Conecta comunidades y acorta tiempos de viaje',
  },
  {
    id: 'const1',
    icon: 'ti-building-hospital',
    benefitIcon: 'ti-heartbeat',
    cat: 'Construcción',
    catBg: 'color-mix(in srgb, #6f5fc7 16%, var(--color-surface-container-lowest))',
    catTxt: 'color-mix(in srgb, #6f5fc7 70%, var(--color-on-surface))',
    imgLabel: 'Hospital público',
    termName: 'Edificio de salud',
    benefit: 'Brinda atención médica a toda la comunidad',
  },
  {
    id: 'const2',
    icon: 'ti-school',
    benefitIcon: 'ti-book',
    cat: 'Construcción',
    catBg: 'color-mix(in srgb, #6f5fc7 16%, var(--color-surface-container-lowest))',
    catTxt: 'color-mix(in srgb, #6f5fc7 70%, var(--color-on-surface))',
    imgLabel: 'Escuela pública',
    termName: 'Infraestructura educativa',
    benefit: 'Garantiza educación de calidad para niños y jóvenes',
  },
  {
    id: 'agua1',
    icon: 'ti-droplet',
    benefitIcon: 'ti-glass',
    cat: 'Agua',
    catBg: 'color-mix(in srgb, #2f8a6a 16%, var(--color-surface-container-lowest))',
    catTxt: 'color-mix(in srgb, #2f8a6a 70%, var(--color-on-surface))',
    imgLabel: 'Planta potabilizadora',
    termName: 'Acueducto',
    benefit: 'Provee agua potable limpia y segura a los hogares',
  },
  {
    id: 'agua2',
    icon: 'ti-pipe',
    benefitIcon: 'ti-shield-check',
    cat: 'Agua',
    catBg: 'color-mix(in srgb, #2f8a6a 16%, var(--color-surface-container-lowest))',
    catTxt: 'color-mix(in srgb, #2f8a6a 70%, var(--color-on-surface))',
    imgLabel: 'Red de alcantarillado',
    termName: 'Alcantarillado',
    benefit: 'Evita inundaciones y enfermedades al drenar aguas residuales',
  },
];

function shuffle<T>(array: T[]) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function MatchImageTerms({ onValidation }: { onValidation?: OnValidation } = {}) {
  const [imgOrder, setImgOrder] = useState<MatchItem[]>(() => shuffle(ITEMS));
  const [termOrder, setTermOrder] = useState<MatchItem[]>(() => shuffle(ITEMS));
  const [selectedImgId, setSelectedImgId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [hits, setHits] = useState(0);
  const [tries, setTries] = useState(0);
  const [hint, setHint] = useState('Selecciona una imagen para comenzar');
  const [banner, setBanner] = useState<{ text: string; type: 'win' | 'partial' | 'lose' | '' }>({ text: '', type: '' });

  const maxTries = ITEMS.length;
  const remainingAttempts = Math.max(0, maxTries - tries);
  const left = ITEMS.length - matchedIds.size;
  const gameOver = matchedIds.size === ITEMS.length || tries >= maxTries;

  const resetGame = () => {
    setImgOrder(shuffle(ITEMS));
    setTermOrder(shuffle(ITEMS));
    setSelectedImgId(null);
    setMatchedIds(new Set());
    setHits(0);
    setTries(0);
    setHint('Selecciona una imagen para comenzar');
    setBanner({ text: '', type: '' });
  };

  const selectImg = (id: string) => {
    if (gameOver) {
      setHint('Juego terminado. Presiona Jugar de nuevo para reiniciar');
      return;
    }
    if (matchedIds.has(id)) return;
    setSelectedImgId(id);
    setHint('Ahora toca el término que corresponde');
  };

  const selectTerm = (id: string) => {
    if (gameOver) {
      setHint('Juego terminado. Presiona Jugar de nuevo para reiniciar');
      return;
    }
    if (!selectedImgId || matchedIds.has(id)) {
      if (!selectedImgId) setHint('Primero toca una imagen');
      return;
    }

    const nextTries = tries + 1;
    setTries(nextTries);
    onValidation?.(selectedImgId === id, partialAttempt(id, selectedImgId));

    if (selectedImgId === id) {
      setMatchedIds(prev => {
        const nextMatched = new Set(prev).add(id);
        showResult(nextMatched, nextTries);
        return nextMatched;
      });
      setHits(prev => prev + 1);
      setHint(`¡Correcto! ${ITEMS.find(item => item.id === id)?.termName} anotado`);
      setSelectedImgId(null);
    } else {
      setHint('Eso no es correcto, intenta de nuevo');
      if (nextTries >= maxTries) {
        showResult(matchedIds, nextTries);
      }
    }
  };

  const isMatched = (id: string) => matchedIds.has(id);

  const showResult = (nextMatchedIds: Set<string>, nextTries: number) => {
    if (nextMatchedIds.size === ITEMS.length) {
      setBanner({ text: '¡Perfecto! Conectaste todo sin errores. Eres un experto en infraestructura ciudadana!', type: 'win' });
      if (onValidation) onValidation(true);
      return;
    }
    if (nextTries >= maxTries) {
      setBanner({ text: `Se acabaron los intentos. Lograste ${nextMatchedIds.size} de ${ITEMS.length}.`, type: 'lose' });
      setHint('Juego terminado. Presiona Jugar de nuevo para volver a intentar.');
      if (onValidation) onValidation(false);
    }
  };

  React.useEffect(() => {
    if (matchedIds.size === ITEMS.length) {
      showResult(matchedIds, tries);
    }
  }, [matchedIds, tries]);

  return (
    <div className="match-image-scoped">
      <style>{`
.match-image-scoped{font-family:var(--font-sans);color:var(--color-on-surface)}
.match-image-scoped .page{padding:1rem 1rem 1.5rem}
.match-image-scoped .hero{text-align:center;margin-bottom:.9rem}
.match-image-scoped .hero h1{font-family:var(--font-serif);font-size:22px;font-weight:600;margin:0}
.match-image-scoped .hero p{font-size:13px;color:var(--color-on-surface-variant);margin:4px 0 0;line-height:1.5}
.match-image-scoped .score-row{display:flex;gap:8px;justify-content:center;margin-bottom:.8rem;flex-wrap:wrap}
.match-image-scoped .score-box{display:flex;align-items:baseline;gap:8px;background:var(--color-surface-container);border:1px solid var(--color-outline-variant);border-radius:999px;padding:5px 14px}
.match-image-scoped .score-box .lbl{font-size:11px;color:var(--color-on-surface-variant)}
.match-image-scoped .score-box .val{font-size:15px;font-weight:700}
.match-image-scoped .result-banner{display:none;text-align:center;font-size:13px;font-weight:600;padding:10px 14px;border-radius:12px;margin-bottom:.8rem}
.match-image-scoped .result-banner.show{display:block}
.match-image-scoped .result-banner.win{background:var(--color-secondary-container);color:var(--color-on-secondary-container)}
.match-image-scoped .result-banner.lose{background:var(--color-error-container);color:var(--color-on-error-container)}
.match-image-scoped .hint{text-align:center;font-size:13px;font-weight:600;color:var(--color-primary);margin:0 0 .9rem;min-height:20px}
.match-image-scoped .game-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.match-image-scoped .col-title{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--color-on-surface-variant);margin:0 0 8px 4px}
.match-image-scoped .img-col,.match-image-scoped .term-col{display:flex;flex-direction:column;gap:8px}
.match-image-scoped .img-card,.match-image-scoped .term-card{position:relative;display:flex;align-items:center;gap:12px;min-height:58px;padding:8px 12px;border-radius:14px;background:var(--color-surface);border:1.5px solid var(--color-outline-variant);cursor:pointer;user-select:none;transition:transform .15s,border-color .15s,box-shadow .15s,background .15s}
.match-image-scoped .img-card:hover,.match-image-scoped .term-card:hover{border-color:var(--color-primary);transform:translateY(-1px)}
.match-image-scoped .img-card.selected{border-color:var(--color-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-primary) 22%,transparent);background:color-mix(in srgb,var(--color-primary) 8%,var(--color-surface))}
.match-image-scoped .img-card.matched,.match-image-scoped .term-card.matched{opacity:.55;cursor:default;transform:none;background:color-mix(in srgb,var(--color-secondary) 8%,transparent)}
.match-image-scoped .ico{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px}
.match-image-scoped .img-info{min-width:0;flex:1;display:flex;flex-direction:column;gap:3px}
.match-image-scoped .img-label{font-size:13px;font-weight:600;line-height:1.25}
.match-image-scoped .cat-tag{align-self:flex-start;font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:1px 8px;border-radius:999px}
.match-image-scoped .matched-badge{width:22px;height:22px;border-radius:50%;background:var(--color-secondary);color:var(--color-on-secondary);font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.match-image-scoped .term-name{font-size:13px;font-weight:700}
.match-image-scoped .term-benefit{font-size:11.5px;color:var(--color-on-surface-variant);line-height:1.35;margin-top:2px}
.match-image-scoped .actions{display:flex;justify-content:center;margin-top:1rem}
.match-image-scoped .btn{padding:8px 18px;border:1px solid var(--color-outline-variant);background:transparent;color:var(--color-on-surface-variant);border-radius:999px;font-size:13px;font-weight:600;cursor:pointer}
.match-image-scoped .btn:hover{background:var(--color-surface-container);color:var(--color-on-surface)}
@media (max-width:640px){.match-image-scoped .game-grid{gap:8px}.match-image-scoped .img-card,.match-image-scoped .term-card{padding:8px}.match-image-scoped .ico{width:32px;height:32px;font-size:16px}.match-image-scoped .term-benefit{display:none}}
      `}</style>

      <div className="page">
        <div className="hero">
          <h1>Une la infraestructura</h1>
          <p>Toca un ícono y luego el término que le corresponde. ¿Sabes cómo mejora la vida de las personas?</p>
        </div>

        <div className="score-row">
          <div className="score-box"><div className="lbl">Aciertos</div><div className="val">{hits}</div></div>
          <div className="score-box"><div className="lbl">Intentos</div><div className="val">{tries}</div></div>
          <div className="score-box"><div className="lbl">Restantes</div><div className="val">{remainingAttempts}</div></div>
        </div>

        <div className={`result-banner ${banner.type ? `show ${banner.type}` : ''}`}>
          {banner.text}
        </div>
        <p className="hint">{hint}</p>

        <div className="game-grid">
          <div>
            <div className="col-title">Infraestructura</div>
            <div className="img-col">
              {imgOrder.map(item => (
                <div
                  key={item.id}
                  className={`img-card ${isMatched(item.id) ? 'matched' : ''} ${selectedImgId === item.id ? 'selected' : ''}`}
                  onClick={() => selectImg(item.id)}
                >
                  <span className="ico" style={{ background: item.catBg, color: item.catTxt }}>
                    <i className={`ti ${item.icon}`} aria-hidden="true" />
                  </span>
                  <div className="img-info">
                    <div className="img-label">{item.imgLabel}</div>
                    <div className="cat-tag" style={{ background: item.catBg, color: item.catTxt }}>{item.cat}</div>
                  </div>
                  {isMatched(item.id) && <div className="matched-badge">✓</div>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="col-title">Nombre y beneficio</div>
            <div className="term-col">
              {termOrder.map(item => (
                <div
                  key={item.id}
                  className={`term-card ${isMatched(item.id) ? 'matched' : ''}`}
                  onClick={() => selectTerm(item.id)}
                >
                  <span className="ico" style={{ background: 'var(--color-surface-container)', color: 'var(--color-primary)' }}>
                    <i className={`ti ${item.benefitIcon}`} aria-hidden="true" />
                  </span>
                  <div>
                    <div className="term-name">{item.termName}</div>
                    <div className="term-benefit">{item.benefit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {gameOver && (
          <div className="actions">
            <button type="button" className="btn" onClick={resetGame}>Jugar de nuevo</button>
          </div>
        )}
      </div>
    </div>
  );
}
