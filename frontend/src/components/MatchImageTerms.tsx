import React, { useMemo, useState } from 'react';

interface MatchItem {
  id: string;
  cat: string;
  catBg: string;
  catTxt: string;
  imgLabel: string;
  termName: string;
  benefit: string;
  img: string;
}

const ITEMS: MatchItem[] = [
  {
    id: 'elec1',
    cat: 'Eléctrica',
    catBg: '#FAEEDA',
    catTxt: '#633806',
    imgLabel: 'Torres de transmisión',
    termName: 'Red eléctrica',
    benefit: 'Lleva luz a hogares, hospitales y escuelas',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Electrical_Transmission_Lines.jpg/320px-Electrical_Transmission_Lines.jpg',
  },
  {
    id: 'elec2',
    cat: 'Eléctrica',
    catBg: '#FAEEDA',
    catTxt: '#633806',
    imgLabel: 'Paneles solares',
    termName: 'Energía solar',
    benefit: 'Genera electricidad limpia y reduce la contaminación',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Solar_panels_on_a_roof.jpg/320px-Solar_panels_on_a_roof.jpg',
  },
  {
    id: 'trans1',
    cat: 'Transporte',
    catBg: '#E6F1FB',
    catTxt: '#0C447C',
    imgLabel: 'Metro urbano',
    termName: 'Metro / tren urbano',
    benefit: 'Mueve miles de personas rápido y sin contaminar',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Metro_de_Medellin.jpg/320px-Metro_de_Medellin.jpg',
  },
  {
    id: 'trans2',
    cat: 'Transporte',
    catBg: '#E6F1FB',
    catTxt: '#0C447C',
    imgLabel: 'Puente vial',
    termName: 'Puente y viaducto',
    benefit: 'Conecta comunidades y acorta tiempos de viaje',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/GoldenGateBridge-001.jpg/320px-GoldenGateBridge-001.jpg',
  },
  {
    id: 'const1',
    cat: 'Construcción',
    catBg: '#EEEDFE',
    catTxt: '#3C3489',
    imgLabel: 'Hospital público',
    termName: 'Edificio de salud',
    benefit: 'Brinda atención médica a toda la comunidad',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Hospital_Nacional_de_Ni%C3%B1os_%28Costa_Rica%29.jpg/320px-Hospital_Nacional_de_Ni%C3%B1os_%28Costa_Rica%29.jpg',
  },
  {
    id: 'const2',
    cat: 'Construcción',
    catBg: '#EEEDFE',
    catTxt: '#3C3489',
    imgLabel: 'Escuela pública',
    termName: 'Infraestructura educativa',
    benefit: 'Garantiza educación de calidad para niños y jóvenes',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Escuela_publica.jpg/320px-Escuela_publica.jpg',
  },
  {
    id: 'agua1',
    cat: 'Agua',
    catBg: '#E1F5EE',
    catTxt: '#085041',
    imgLabel: 'Planta potabilizadora',
    termName: 'Acueducto',
    benefit: 'Provee agua potable limpia y segura a los hogares',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Water_treatment_plant.jpg/320px-Water_treatment_plant.jpg',
  },
  {
    id: 'agua2',
    cat: 'Agua',
    catBg: '#E1F5EE',
    catTxt: '#085041',
    imgLabel: 'Red de alcantarillado',
    termName: 'Alcantarillado',
    benefit: 'Evita inundaciones y enfermedades al drenar aguas residuales',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Sewer_drain.jpg/320px-Sewer_drain.jpg',
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

export default function MatchImageTerms() {
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
      return;
    }
    if (nextTries >= maxTries) {
      setBanner({ text: `Se acabaron los intentos. Lograste ${nextMatchedIds.size} de ${ITEMS.length}.`, type: 'lose' });
      setHint('Juego terminado. Presiona Jugar de nuevo para volver a intentar.');
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
.match-image-scoped .page{padding:1.2rem 1rem 2.5rem;background:var(--color-surface);color:var(--color-on-surface)}
.match-image-scoped .hero{text-align:center;margin-bottom:1.4rem}
.match-image-scoped .hero h1{font-size:21px;font-weight:500;margin:0}
.match-image-scoped .hero p{font-size:13px;color:var(--color-on-surface-variant);margin-top:4px;line-height:1.5}
.match-image-scoped .score-row{display:flex;gap:10px;justify-content:center;margin-bottom:1.4rem;flex-wrap:wrap}
.match-image-scoped .score-pill{background:var(--color-surface-container);border:1px solid var(--color-outline-variant);border-radius:12px;padding:6px 14px;font-size:13px;font-weight:500;color:var(--color-on-surface-variant)}
.match-image-scoped .score-pill b{color:var(--color-on-surface)}
.match-image-scoped .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:1.4rem}
.match-image-scoped .col{background:var(--color-surface-container-low);border:2px dashed var(--color-outline-variant);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px}
.match-image-scoped .col-title{font-size:11px;font-weight:500;color:var(--color-on-surface-variant);letter-spacing:.05em;text-transform:uppercase;margin-bottom:4px;text-align:center}
.match-image-scoped .card{background:var(--color-surface);border:1.5px solid var(--color-outline-variant);border-radius:10px;padding:12px;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80px;text-align:center;user-select:none;margin:0}
.match-image-scoped .card:hover{border-color:var(--color-primary);transform:translateY(-2px);box-shadow:0 8px 16px rgba(0,0,0,.05)}
.match-image-scoped .card.selected{border-color:var(--color-primary);background:var(--color-secondary-container);color:var(--color-on-secondary-container);transform:scale(1.02);box-shadow:0 0 0 3px rgba(122,215,198,.3)}
.match-image-scoped .card.matched{border-color:var(--color-secondary);background:var(--color-secondary-container);opacity:.6;cursor:default;transform:none;box-shadow:none}
.match-image-scoped .card img{width:60px;height:60px;object-fit:cover;border-radius:6px;margin-bottom:8px}
.match-image-scoped .card-text{font-size:13px;font-weight:500;line-height:1.4}
.match-image-scoped .actions{display:flex;justify-content:center;margin-bottom:1rem}
.match-image-scoped .btn{padding:9px 18px;border:1px solid var(--color-outline-variant);background:transparent;color:var(--color-on-surface-variant);border-radius:8px;font-size:13px;cursor:pointer;transition:all .2s}
.match-image-scoped .btn:hover{background:var(--color-surface-container);color:var(--color-on-surface)}
.match-image-scoped .feedback{text-align:center;font-size:14px;font-weight:500;padding:12px 16px;border-radius:8px;display:none;margin-bottom:1rem}
.match-image-scoped .feedback.show{display:block}
.match-image-scoped .feedback.win{background:var(--color-secondary-container);color:var(--color-secondary)}
.match-image-scoped .feedback.lose{background:var(--color-error-container);color:var(--color-error)}
      `}</style>

      <div className="page">
        <div className="hero">
          <h1>🏙️ Une la infraestructura</h1>
          <p>Toca una imagen y luego el término que le corresponde.<br />¿Sabes cómo mejora la vida de las personas?</p>
        </div>

        <div className="score-row">
          <div className="score-box"><div className="lbl">Aciertos</div><div className="val">{hits}</div></div>
          <div className="score-box"><div className="lbl">Intentos</div><div className="val">{tries}</div></div>
          <div className="score-box"><div className="lbl">Intentos restantes</div><div className="val">{remainingAttempts}</div></div>
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
                  style={{ borderColor: isMatched(item.id) ? '#1D9E75' : selectedImgId === item.id ? '#185FA5' : undefined }}
                  onClick={() => selectImg(item.id)}
                >
                  <img src={item.img} alt={item.imgLabel} />
                  <div className="cat-tag" style={{ background: item.catBg, color: item.catTxt }}>{item.cat}</div>
                  {isMatched(item.id) && <div className="matched-badge">✓</div>}
                  <div className="img-label">{item.imgLabel}</div>
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
                  style={{ borderColor: isMatched(item.id) ? '#1D9E75' : undefined }}
                  onClick={() => selectTerm(item.id)}
                >
                  <div className="term-name">{item.termName}</div>
                  <div className="term-benefit">{item.benefit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="btn-row">
          <button className="btn-main" onClick={resetGame}>Jugar de nuevo</button>
        </div>
      </div>
    </div>
  );
}
