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

export default function MatchImageTerms({ onValidation }: { onValidation?: (success: boolean) => void }) {
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
      onValidation?.(true);
      return;
    }
    if (nextTries >= maxTries) {
      setBanner({ text: `Se acabaron los intentos. Lograste ${nextMatchedIds.size} de ${ITEMS.length}.`, type: 'lose' });
      setHint('Juego terminado. Presiona Jugar de nuevo para volver a intentar.');
      onValidation?.(false);
    }
  };

  React.useEffect(() => {
    if (matchedIds.size === ITEMS.length) {
      showResult(matchedIds, tries);
    }
  }, [matchedIds, tries]);

  return (
    <div>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .page{padding:1.2rem 24px 2.5rem;background:transparent;color:var(--color-on-surface)}
        .hero{text-align:center;margin-bottom:1.4rem;padding: 0 12px;}
        .hero h1{font-size:21px;font-weight:500}
        .hero p{font-size:13px;color:var(--color-on-surface-variant);margin-top:4px;line-height:1.5}
        .score-row{display:flex;gap:10px;justify-content:center;margin-bottom:1.4rem;flex-wrap:wrap}
        .score-box{background:var(--color-surface-container-low);border-radius:16px;padding:8px 18px;text-align:center;border:1px solid var(--color-outline-variant)}
        .score-box .lbl{font-size:11px;color:var(--color-on-surface-variant)}
        .score-box .val{font-size:20px;font-weight:500;color:var(--color-on-surface)}
        .game-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:1.5rem}
        .col-title{font-size:11px;font-weight:500;letter-spacing:.06em;color:var(--color-on-surface-variant);text-transform:uppercase;margin-bottom:.6rem;text-align:center}
        .img-col,.term-col{display:flex;flex-direction:column;gap:10px}
        .img-card{border-radius:16px;border:2px solid var(--color-outline-variant);background:var(--color-surface-container);overflow:hidden;cursor:pointer;transition:border-color .18s,transform .15s,background .15s;position:relative;min-height:190px}
        .img-card:hover{transform:translateY(-2px);background:var(--color-surface-container-high)}
        .img-card.selected{border-color:var(--color-primary);border-width:2.5px}
        .img-card.matched{border-color:var(--color-secondary);border-width:2px;cursor:default;pointer-events:none}
        .img-card.wrong{border-color:var(--color-error);animation:shake .35s}
        .img-card img{width:100%;height:96px;object-fit:cover;display:block;background:var(--color-surface)}
        .img-card .cat-tag{position:absolute;top:6px;left:6px;font-size:10px;font-weight:500;padding:2px 7px;border-radius:20px}
        .img-card .img-label{font-size:12px;font-weight:500;color:var(--color-on-surface);padding:8px 10px;line-height:1.3}
        .term-card{border-radius:16px;border:2px solid var(--color-outline-variant);background:var(--color-surface-container);padding:12px;cursor:pointer;transition:border-color .18s,transform .15s,background .15s;min-height:190px;display:flex;flex-direction:column;justify-content:center}
        .term-card:hover{transform:translateY(-2px);background:var(--color-surface-container-high)}
        .term-card.selected{border-color:var(--color-primary);border-width:2.5px}
        .term-card.matched{border-color:var(--color-secondary);border-width:2px;cursor:default;pointer-events:none;background:var(--color-secondary-container)}
        .term-card.wrong{border-color:var(--color-error);animation:shake .35s}
        .term-card .term-name{font-size:13px;font-weight:500;color:var(--color-on-surface);margin-bottom:6px}
        .term-card .term-benefit{font-size:11px;color:var(--color-on-surface-variant);line-height:1.4}
        .term-card.matched .term-name{color:var(--color-secondary)}
        .term-card.matched .term-benefit{color:var(--color-secondary)}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
        .matched-badge{position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;background:var(--color-secondary-container);color:var(--color-secondary);font-size:13px;display:flex;align-items:center;justify-content:center}
        .btn-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
        .btn-main{padding:10px 22px;border:0.5px solid var(--color-outline-variant);border-radius:16px;background:transparent;color:var(--color-on-surface);font-size:14px;cursor:pointer;display:flex;align-items:center;gap:6px}
        .btn-main:hover{background:var(--color-surface-container-low)}
        .result-banner{margin-bottom:1.2rem;padding:12px 16px;border-radius:16px;font-size:14px;font-weight:500;text-align:center;display:none}
        .result-banner.show{display:block}
        .result-banner.win{background:var(--color-surface);color:var(--color-secondary)}
        .result-banner.partial{background:var(--color-warning-container);color:var(--color-warning)}
        .hint{text-align:center;font-size:12px;color:var(--color-on-surface-variant);margin-bottom:1rem}
      `}</style>

      <div className="page">
        <h2 className="sr-only">Juego: une cada imagen de infraestructura con el término correcto y su beneficio ciudadano</h2>

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
