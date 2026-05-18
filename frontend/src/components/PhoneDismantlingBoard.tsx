import { useState, useCallback } from 'react';
import './PhoneDismantlingBoard.css';

interface Component {
  id: string;
  name: string;
  emoji: string;
  iconColor: string;
  layerClass: string;
  layerZ: number;
  layerTop: number;
  description: string;
  makers: string;
  materials: string;
  toxicity: 'toxic' | 'partial' | 'safe';
  toxicDetail: string;
  recyclable: 'safe' | 'partial';
  recycleSteps: { icon: string; label: string }[];
  recycleNote: string;
  badges: { type: string; text: string }[];
}

interface QuizQuestion {
  question: string;
  difficulty: string;
  options: string[];
  correct: number;
  feedback: string;
}

const components: Component[] = [
  {
    id: 'screen', name: 'Pantalla OLED/LCD', emoji: '📺', iconColor: '#1e3a5f',
    layerClass: 'l-screen', layerZ: 8, layerTop: 8,
    description: 'Matriz de pixeles organicos o cristal liquido que genera la imagen',
    makers: 'Samsung Display (Corea), LG Display (Corea), BOE Technology (China), Sharp (Japon)',
    materials: 'Indio (ITO), plastico PET, vidrio de aluminosilicato (Gorilla Glass), tierras raras (europio, terbio)',
    toxicity: 'toxic',
    toxicDetail: 'El indio es un metal raro altamente toxico. Las pantallas OLED contienen compuestos organicos volatiles. El vidrio fragmentado genera polvo de silice peligroso.',
    recyclable: 'partial',
    recycleSteps: [
      { icon: '🔧', label: 'Desmontaje manual' },
      { icon: '🧪', label: 'Separacion quimica del indio' },
      { icon: '🔥', label: 'Pirolisis del plastico' },
      { icon: '✨', label: 'Recuperacion del ITO' },
      { icon: '⚠️', label: 'Residuo toxico final' }
    ],
    recycleNote: 'Solo el 40-60% es recuperable. El proceso de extraccion de indio es costoso y contaminante.',
    badges: [
      { type: 'toxic', text: '☠️ Indio toxico' },
      { type: 'toxic', text: '⚠️ VOCs' },
      { type: 'partial', text: '⟳ Reciclaje parcial' },
      { type: 'maker', text: '🏭 Samsung / BOE' }
    ]
  },
  {
    id: 'digitizer', name: 'Panel Tactil (Digitalizador)', emoji: '👆', iconColor: '#0d2a3a',
    layerClass: 'l-digitizer', layerZ: 7, layerTop: 8,
    description: 'Capa transparente que detecta el toque mediante sensores capacitivos',
    makers: 'TPK Holding (Taiwan), Wintek (Taiwan), Nissha (Japon), GIS (Taiwan)',
    materials: 'Oxido de indio y estano (ITO), polipropileno, cobre nanoestructurado, adhesivo optico (OCA)',
    toxicity: 'partial',
    toxicDetail: 'El adhesivo optico contiene acrilatos irritantes. El ITO es de extraccion contaminante. En condiciones normales de uso es seguro para el usuario.',
    recyclable: 'partial',
    recycleSteps: [
      { icon: '🔬', label: 'Separacion del vidrio' },
      { icon: '♨️', label: 'Disolvente del OCA' },
      { icon: '⚡', label: 'Recuperacion ITO' },
      { icon: '♻️', label: 'Reciclaje del vidrio' }
    ],
    recycleNote: 'El vidrio puede reciclarse. El ITO es dificil de separar y requiere procesos especializados.',
    badges: [
      { type: 'partial', text: '⚠️ ITO problematico' },
      { type: 'partial', text: '⟳ Parcialmente reciclable' },
      { type: 'maker', text: '🏭 TPK / Nissha' }
    ]
  },
  {
    id: 'battery', name: 'Bateria de Litio (Li-Ion)', emoji: '🔋', iconColor: '#1a3010',
    layerClass: 'l-battery', layerZ: 5, layerTop: 55,
    description: 'Acumulador electroquimico de iones de litio que alimenta todos los sistemas',
    makers: 'CATL (China), Samsung SDI (Corea), LG Energy Solution (Corea), Panasonic (Japon), BYD (China)',
    materials: 'Litio, cobalto, manganeso, niquel, grafito, electrolito de LiPF6, cobre, aluminio, plastico',
    toxicity: 'toxic',
    toxicDetail: 'ALTAMENTE PELIGROSO: El cobalto es cancerigeno y su mineria en el Congo involucra trabajo infantil. El LiPF6 es corrosivo y genera HF (acido fluorhidrico) al arder. El litio reacciona violentamente con el agua.',
    recyclable: 'partial',
    recycleSteps: [
      { icon: '🏭', label: 'Centro especializado' },
      { icon: '💧', label: 'Hidrometalurgia' },
      { icon: '🔥', label: 'Pirometalurgia' },
      { icon: '⚗️', label: 'Extraccion Li/Co/Ni' },
      { icon: '♻️', label: 'Nuevo material activo' }
    ],
    recycleNote: 'NUNCA en basura domestica. El 95% del litio es recuperable con tecnologia adecuada.',
    badges: [
      { type: 'toxic', text: '☠️ Cobalto cancerigeno' },
      { type: 'toxic', text: '🔥 Inflamable' },
      { type: 'partial', text: '⟳ Reciclaje especializado' },
      { type: 'maker', text: '🏭 CATL / Samsung SDI' }
    ]
  },
  {
    id: 'mainboard', name: 'Tarjeta Principal (PCB)', emoji: '🖥️', iconColor: '#0d0d1e',
    layerClass: 'l-mainboard', layerZ: 4, layerTop: 22,
    description: 'Circuito impreso multicapa que aloja el procesador, RAM, almacenamiento y todos los controladores',
    makers: 'TSMC (Taiwan), Foxconn (China), Qualcomm/Apple, ASUS/Compal',
    materials: 'Epoxi FR4, cobre, estano, plomo, oro, plata, paladio, arsenico (semiconductores), cadmio, berilio',
    toxicity: 'toxic',
    toxicDetail: 'MUY TOXICO: Contiene plomo en soldaduras antiguas, cadmio en capacitores, berilio (cancerigeno extremo), arsenico en semiconductores GaAs. El FR4 al quemarse libera dioxinas.',
    recyclable: 'partial',
    recycleSteps: [
      { icon: '🔩', label: 'Desmontaje de chips' },
      { icon: '🧪', label: 'Lixiviacion acida' },
      { icon: '⚡', label: 'Electrodeposicion' },
      { icon: '🥇', label: 'Recuperacion Au/Ag/Pd' },
      { icon: '⚠️', label: 'Escoria toxica' }
    ],
    recycleNote: 'Una tonelada de PCBs contiene ~250g de oro (vs 5g en mineral). Es rentable recuperar metales preciosos.',
    badges: [
      { type: 'toxic', text: '☠️ Plomo / Cadmio' },
      { type: 'toxic', text: '☠️ Berilio cancerigeno' },
      { type: 'partial', text: '♻️ Metales preciosos recuperables' },
      { type: 'maker', text: '🏭 TSMC / Foxconn' }
    ]
  },
  {
    id: 'camera', name: 'Modulo de Camara', emoji: '📷', iconColor: '#111',
    layerClass: 'l-camera', layerZ: 6, layerTop: 32,
    description: 'Sistema optico con sensor CMOS, lentes de vidrio/plastico y motor de enfoque',
    makers: 'Sony Semiconductor (Japon), LG Innotek (Corea), Largan Precision (Taiwan)',
    materials: 'Silicio dopado, vidrio lantano (lentes), polimero optico, neodimio (motor AF), cobre, oro',
    toxicity: 'partial',
    toxicDetail: 'El silicio es relativamente seguro. El neodimio del motor de enfoque es una tierra rara de extraccion contaminante. Las lentes especiales contienen oxidos de lantano y torio.',
    recyclable: 'partial',
    recycleSteps: [
      { icon: '🔧', label: 'Separacion mecanica' },
      { icon: '🔬', label: 'Recuperacion del sensor' },
      { icon: '🧲', label: 'Extraccion de neodimio' },
      { icon: '♻️', label: 'Reciclaje del vidrio' }
    ],
    recycleNote: 'El sensor CMOS puede reusarse. Las tierras raras son dificiles de recuperar pero muy valiosas.',
    badges: [
      { type: 'partial', text: '⚠️ Tierras raras' },
      { type: 'safe', text: '✓ Relativamente seguro' },
      { type: 'partial', text: '⟳ Parcialmente reciclable' },
      { type: 'maker', text: '🏭 Sony / Largan' }
    ]
  },
  {
    id: 'speaker', name: 'Altavoz y Auricular', emoji: '🔊', iconColor: '#1a0e06',
    layerClass: 'l-speaker', layerZ: 3, layerTop: 208,
    description: 'Transductor electromagnetico que convierte senales electricas en sonido',
    makers: 'AAC Technologies (China), Goertek (China), Knowles Corporation (EE.UU.)',
    materials: 'Neodimio (iman permanente), cobre (bobina de voz), polimero (membrana), acero inoxidable',
    toxicity: 'partial',
    toxicDetail: 'El neodimio es una tierra rara cuya mineria genera residuos radiactivos (torio, uranio como subproductos). En uso domestico el altavoz es seguro.',
    recyclable: 'safe',
    recycleSteps: [
      { icon: '🧲', label: 'Extraccion del iman' },
      { icon: '🔁', label: 'Desmagnetizacion' },
      { icon: '⚗️', label: 'Separacion del neodimio' },
      { icon: '♻️', label: 'Reciclaje del cobre' }
    ],
    recycleNote: 'Uno de los componentes mas recuperables. El iman de neodimio puede reutilizarse o reciclarse.',
    badges: [
      { type: 'partial', text: '⚠️ Mineria de neodimio' },
      { type: 'safe', text: '✓ Seguro en uso' },
      { type: 'safe', text: '♻️ Reciclable' },
      { type: 'maker', text: '🏭 AAC / Goertek' }
    ]
  },
  {
    id: 'back', name: 'Carcasa Trasera', emoji: '🔲', iconColor: '#0d0d1a',
    layerClass: 'l-back', layerZ: 2, layerTop: 4,
    description: 'Panel posterior de vidrio, aluminio o plastico que protege los componentes internos',
    makers: 'Foxconn (China), Pegatron (Taiwan), BYD (China), Corning (EE.UU.)',
    materials: 'Aluminio 6000/7000 (anodizado), vidrio ceramico, o policarbonato, recubrimientos de TiO2',
    toxicity: 'safe',
    toxicDetail: 'El aluminio anodizado y el policarbonato son relativamente seguros. El vidrio es inerte.',
    recyclable: 'safe',
    recycleSteps: [
      { icon: '🔧', label: 'Separacion de componentes' },
      { icon: '🔥', label: 'Fusion del aluminio' },
      { icon: '♻️', label: 'Aleacion secundaria' },
      { icon: '✅', label: 'Material reutilizable' }
    ],
    recycleNote: 'El aluminio es 100% reciclable sin perdida de calidad y con solo el 5% de la energia original.',
    badges: [
      { type: 'safe', text: '✓ Baja toxicidad' },
      { type: 'safe', text: '♻️ Altamente reciclable' },
      { type: 'maker', text: '🏭 Foxconn / Corning' }
    ]
  },
  {
    id: 'frame', name: 'Marco / Chasis Estructural', emoji: '⬜', iconColor: '#1a1a2e',
    layerClass: 'l-frame', layerZ: 1, layerTop: 4,
    description: 'Estructura de soporte interno que mantiene ensamblados todos los componentes',
    makers: 'Foxconn (China), Jabil (EE.UU./China), fabricantes de acero inox en Corea',
    materials: 'Aluminio 7075 aeronautico, acero inoxidable 316L, titanio (modelos premium), plastico ABS+PC',
    toxicity: 'safe',
    toxicDetail: 'Los metales estructurales son inertes en condiciones normales. El mecanizado CNC genera virutas metalicas.',
    recyclable: 'safe',
    recycleSteps: [
      { icon: '🔩', label: 'Desmontaje de tornillos' },
      { icon: '🔄', label: 'Separacion metales' },
      { icon: '🔥', label: 'Fundicion' },
      { icon: '✅', label: 'Metal reciclado' }
    ],
    recycleNote: 'El aluminio y acero inox son altamente reciclables. El titanio recuperado tiene gran valor economico.',
    badges: [
      { type: 'safe', text: '✓ Material seguro' },
      { type: 'safe', text: '♻️ Metales reciclables' },
      { type: 'maker', text: '🏭 Foxconn / Jabil' }
    ]
  },
  {
    id: 'mic', name: 'Microfono MEMS', emoji: '🎙️', iconColor: '#111',
    layerClass: 'l-mic', layerZ: 3, layerTop: 192,
    description: 'Transductor microelectromecanico fabricado en silicio que convierte sonido en senal electrica',
    makers: 'Knowles Corporation (EE.UU.), InvenSense (EE.UU./TDK), AAC Technologies (China), ST Microelectronics (Francia/Italia)',
    materials: 'Silicio monocristalino (MEMS), polisilicio, dioxido de silicio, aluminio, oro (contactos)',
    toxicity: 'safe',
    toxicDetail: 'El silicio es el material mas abundante y seguro en la electronica. Los MEMS son extremadamente pequenos y usan cantidades minimas de materiales.',
    recyclable: 'partial',
    recycleSteps: [
      { icon: '🔬', label: 'Analisis de contenido' },
      { icon: '⚗️', label: 'Recuperacion del oro' },
      { icon: '♻️', label: 'Reciclaje del silicio' },
      { icon: '✅', label: 'Minimo residuo' }
    ],
    recycleNote: 'Por su tamano, la recuperacion individual no es economica. Se procesa en conjunto con la PCB.',
    badges: [
      { type: 'safe', text: '✓ Componente seguro' },
      { type: 'safe', text: '✓ Silicio inerte' },
      { type: 'partial', text: '⟳ Reciclaje con PCB' },
      { type: 'maker', text: '🏭 Knowles / TDK' }
    ]
  }
];

const quizData: QuizQuestion[] = [
  {
    question: 'Samsung SDI fabrica baterias de litio para smartphones. El cobalto requerido se extrae en la Republica Democratica del Congo bajo condiciones laborales cuestionables. Considerando esta cadena de valor completa, cual de las siguientes afirmaciones representa el analisis mas riguroso desde una perspectiva de sostenibilidad sistemica?',
    difficulty: 'PENSAMIENTO SISTEMICO',
    options: [
      'Las baterias de litio son insostenibles y deben prohibirse inmediatamente ya que el dano ambiental y social supera cualquier beneficio tecnologico',
      'La electrificacion del transporte justifica plenamente el impacto de la mineria de cobalto porque reduce las emisiones globales de CO2 a largo plazo',
      'El verdadero problema no es la tecnologia de litio sino la ausencia de regulacion de la cadena de suministro: sin trazabilidad certificada del cobalto y mecanismos de responsabilidad extendida al productor, la transicion energetica replica patrones extractivistas',
      'La solucion es que los consumidores compren menos telefonos, ya que la demanda individual es la causa raiz de todos los problemas ambientales'
    ],
    correct: 2,
    feedback: 'El analisis sistemico reconoce que el problema no es la tecnologia en si sino el marco regulatorio ausente. La transicion energetica puede ser justa o replicar extractivismo; eso depende de politicas de trazabilidad y Responsabilidad Extendida al Productor (REP).'
  },
  {
    question: 'Una tonelada de tarjetas de circuito impreso (PCBs) contiene aproximadamente 250 gramos de oro, mientras que una tonelada de mineral de oro de alta calidad contiene apenas 5 gramos. Sin embargo, solo el 20% de los residuos electronicos globales se recicla formalmente. Cual es la explicacion mas completa de esta paradoja economica y ambiental?',
    difficulty: 'ANALISIS CRITICO',
    options: [
      'La gente no recicla porque le da pereza; la solucion es una campana educativa masiva en redes sociales',
      'Los fabricantes deliberadamente disenan productos irreciclables para forzar la compra de nuevos equipos',
      'La brecha entre el valor teorico de los materiales y el reciclaje real se explica por: diseno no modular que encarece el desmontaje, externalizacion del costo ambiental, infraestructura concentrada en paises desarrollados, y mercados informales en el Sur Global que procesan e-waste sin proteccion laboral',
      'El reciclaje electronico no es rentable en ningun caso porque los metales preciosos son demasiado dificiles de extraer'
    ],
    correct: 2,
    feedback: 'La paradoja refleja un fallo sistemico de mercado: los precios no internalizan costos ambientales, el diseno privilegia manufactura barata sobre reciclabilidad, y la infraestructura formal de reciclaje es geograficamente inequitativa.'
  },
  {
    question: 'La pantalla OLED de un smartphone usa Indio en forma de ITO. El indio no tiene sustituto conocido para esta aplicacion y las reservas mundiales son escasas. TSMC fabrica los chips del procesador con procesos que requieren arseniuro de galio. Desde una perspectiva de seguridad de suministro y geopolitica, que escenario describe mejor el riesgo estructural mas grave?',
    difficulty: 'GEOPOLITICA Y RECURSOS',
    options: [
      'El mayor riesgo es el agotamiento del petroleo, que afectaria el transporte de componentes',
      'La concentracion geografica de fabricacion de semiconductores (mas del 90% en Asia Oriental) y la dependencia de elementos criticos crea una vulnerabilidad de infraestructura critica comparable a la dependencia energetica',
      'El riesgo es manejable porque los precios de mercado garantizan que siempre habra suficiente oferta de cualquier material necesario',
      'La solucion es simple: cada pais debe fabricar sus propios semiconductores de forma autosuficiente e inmediata'
    ],
    correct: 1,
    feedback: 'La geografia de la cadena de suministro de semiconductores es extremadamente concentrada. Esto crea una dependencia comparable a la energetica. Construir una fabrica de chips de vanguardia requiere 5-10 anos y decenas de miles de millones de dolares.'
  },
  {
    question: 'Foxconn emplea a mas de 1 millon de trabajadores en China para ensamblar iPhones. En 2010-2011 hubo una serie de suicidios en sus instalaciones. Apple respondio auditando proveedores. Un estudiante argumenta: Apple mejoro las condiciones laborales porque el mercado y la presion de consumidores funcionaron; la regulacion gubernamental es innecesaria. Cual es la critica mas solida a este argumento?',
    difficulty: 'ETICA Y SISTEMAS',
    options: [
      'El estudiante tiene completamente la razon; las empresas siempre actuan bien cuando los consumidores los presionan suficientemente',
      'Las auditorias voluntarias de Apple han sido documentadas como insuficientes: los auditores son pagados por la empresa auditada, los trabajadores temen represalias, y las mejoras cosmeticas son posibles sin cambios estructurales. Los consumidores del Norte Global raramente tienen informacion completa ni capacidad real de boicot efectivo',
      'El problema es simplemente cultural: los trabajadores chinos tienen expectativas diferentes sobre condiciones laborales',
      'La solucion es que todos los consumidores dejen de comprar telefonos hasta que mejoren todas las condiciones laborales globalmente'
    ],
    correct: 1,
    feedback: 'Las auditorias voluntarias tienen conflicto de interes estructural (el auditado paga al auditor). Los estandares vinculantes como la Ley de Diligencia Debida alemana o la CSDDD de la UE existen precisamente porque la autorregulacion voluntaria ha demostrado ser insuficiente.'
  }
];

interface Props {
  challengeId: string;
  onValidation: (success: boolean) => void;
}

export function PhoneDismantlingBoard({ challengeId, onValidation }: Props) {
  const [phase, setPhase] = useState<'explore' | 'quiz'>('explore');
  const [currentComp, setCurrentComp] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [answered, setAnswered] = useState<Record<number, boolean>>({});

  const nextComponent = useCallback(() => {
    if (currentComp < components.length - 1) {
      setCurrentComp(c => c + 1);
    } else {
      setPhase('quiz');
      setCurrentQ(0);
    }
  }, [currentComp]);

  const prevComponent = useCallback(() => {
    if (currentComp > 0) setCurrentComp(c => c - 1);
  }, [currentComp]);

  const goToComponent = useCallback((idx: number) => {
    setCurrentComp(idx);
  }, []);

  const selectOption = useCallback((qIdx: number, optIdx: number) => {
    if (answered[qIdx]) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    setAnswered(prev => ({ ...prev, [qIdx]: true }));
  }, [answered]);

  const nextQuestion = useCallback(() => {
    if (currentQ < quizData.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      const correctCount = quizData.filter((q, i) => answers[i] === q.correct).length;
      onValidation(correctCount >= 3);
    }
  }, [currentQ, answers, onValidation]);

  const totalQuiz = quizData.length;
  const doneCount = Object.keys(answered).length;
  const correctCount = quizData.filter((q, i) => answers[i] === q.correct).length;
  const isLastQ = currentQ === quizData.length - 1;
  const allDone = doneCount === totalQuiz;

  if (phase === 'quiz' && allDone) {
    const feedbacks = [
      { min: 0, max: 1, text: 'Sigue explorando. Revisa los componentes y reflexiona sobre las cadenas de valor globales.' },
      { min: 2, max: 2, text: 'Buen intento. Revisa las respuestas incorrectas para profundizar tu analisis.' },
      { min: 3, max: 3, text: 'Muy bien. Demuestras capacidad de analisis sistemico y etico.' },
      { min: 4, max: 4, text: 'Excelente! Dominas el pensamiento critico aplicado a sostenibilidad y etica de cadenas de suministro.' }
    ];
    const fb = feedbacks.find(f => correctCount >= f.min && correctCount <= f.max);

    return (
      <div className="pdb-root">
        <div className="pdb-header"><h1>Resultado de Evaluacion</h1></div>
        <div className="pdb-score">
          <div className="pdb-score-num">{correctCount}/{totalQuiz}</div>
          <div className="pdb-score-label">respuestas correctas</div>
          <div className="pdb-score-fb">{fb!.text}</div>
        </div>
      </div>
    );
  }

  if (phase === 'quiz') {
    const q = quizData[currentQ];
    const letters = ['A', 'B', 'C', 'D'];
    const selOpt = answers[currentQ];
    const hasAnswered = answered[currentQ];
    const isCorrect = hasAnswered && selOpt === q.correct;

    return (
      <div className="pdb-root">
        <div className="pdb-header"><h1>Evaluacion de Pensamiento Critico</h1></div>
        <div className="pdb-progress">
          <div className="pdb-progress-label">
            <span>Pregunta {currentQ + 1} de {totalQuiz}</span>
            <span>{doneCount}/{totalQuiz} respondidas</span>
          </div>
          <div className="pdb-progress-bar">
            <div className="pdb-progress-fill" style={{ width: `${((currentQ) / totalQuiz) * 100}%` }}></div>
          </div>
        </div>
        <div className="pdb-quiz">
          <div className={`pdb-quiz-card ${hasAnswered ? (isCorrect ? 'answered-correct' : 'answered-wrong') : ''}`}>
            <div className="pdb-qnum">Pregunta {currentQ + 1}</div>
            <div className="pdb-qdiff">⚡ {q.difficulty}</div>
            <div className="pdb-qtext">{q.question}</div>
            <div className="pdb-options">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  className={`pdb-opt-btn ${hasAnswered && oi === q.correct ? 'correct' : ''} ${hasAnswered && oi === selOpt && oi !== q.correct ? 'wrong' : ''}`}
                  onClick={() => selectOption(currentQ, oi)}
                  disabled={hasAnswered}
                >
                  <span className="pdb-opt-letter">{letters[oi]}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
            {hasAnswered && (
              <div className={`pdb-feedback show ${isCorrect ? 'correct' : 'wrong'}`}>
                {isCorrect ? q.feedback : `Respuesta incorrecta. La correcta era ${letters[q.correct]}.<br>${q.feedback}`}
              </div>
            )}
          </div>
          {hasAnswered && (
            <div className="pdb-quiz-nav">
              <button className="pdb-nav-btn primary" onClick={nextQuestion}>
                {isLastQ ? 'Ver resultado →' : 'Siguiente pregunta →'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Explore phase
  const comp = components[currentComp];
  const pct = Math.round(((currentComp + 1) / components.length) * 100);
  const toxColor = comp.toxicity === 'toxic' ? 'var(--red)' : comp.toxicity === 'safe' ? 'var(--green)' : 'var(--yellow)';
  const toxLabel = comp.toxicity === 'toxic' ? 'TOXICO' : comp.toxicity === 'safe' ? 'BAJO RIESGO' : 'RIESGO MODERADO';

  return (
    <div className="pdb-root">
      <div className="pdb-header">
        <h1>Desmantelacion del Celular</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: 4 }}>
          Componente {currentComp + 1} de {components.length}: {comp.name}
        </p>
      </div>

      <div className="pdb-progress">
        <div className="pdb-progress-label">
          <span>Progreso</span>
          <span>{pct}%</span>
        </div>
        <div className="pdb-progress-bar">
          <div className="pdb-progress-fill" style={{ width: `${pct}%` }}></div>
        </div>
      </div>

      <div className="pdb-stage">
        <div className="pdb-phone-scene">
          <div className="pdb-phone-base">
            {[...components].sort((a, b) => a.layerZ - b.layerZ).map(c => (
              <div
                key={c.id}
                className={`pdb-layer ${c.layerClass} ${c.id === comp.id ? 'selected active-part' : 'exploded'}`}
                style={{ top: c.layerTop, zIndex: c.layerZ }}
                onClick={() => goToComponent(components.indexOf(c))}
              />
            ))}
          </div>
        </div>

        <div className="pdb-dots">
          {components.map((_, i) => (
            <div
              key={i}
              className={`pdb-dot ${i === currentComp ? 'active' : ''} ${i < currentComp ? 'done' : ''}`}
              onClick={() => goToComponent(i)}
            />
          ))}
        </div>

        <div className="pdb-panel">
          <div className="pdb-panel-header">
            <div className="pdb-panel-icon" style={{ background: `${comp.iconColor}18`, border: `1px solid ${comp.iconColor}35` }}>
              <span style={{ fontSize: '1.3rem' }}>{comp.emoji}</span>
            </div>
            <div className="pdb-panel-title">
              <h3>{comp.name}</h3>
              <p>{comp.description}</p>
            </div>
          </div>

          <div className="pdb-badges">
            {comp.badges.map((b, i) => (
              <span key={i} className={`pdb-badge pdb-badge-${b.type}`}>{b.text}</span>
            ))}
          </div>

          <div className="pdb-info-grid">
            <div className="pdb-info-cell">
              <h4>Fabricantes principales</h4>
              <p>{comp.makers}</p>
            </div>
            <div className="pdb-info-cell">
              <h4>Materiales clave</h4>
              <p>{comp.materials}</p>
            </div>
            <div className="pdb-info-cell">
              <h4>Nivel de toxicidad</h4>
              <p style={{ color: toxColor, fontWeight: 600 }}>{toxLabel}</p>
              <p style={{ marginTop: 4 }}>{comp.toxicDetail}</p>
            </div>
            <div className="pdb-info-cell">
              <h4>Nota de reciclaje</h4>
              <p>{comp.recycleNote}</p>
            </div>
          </div>

          <div className="pdb-recycle">
            <h4>Proceso de reciclaje</h4>
            <div className="pdb-recycle-steps">
              {comp.recycleSteps.map((s, i) => (
                <div key={i} className="pdb-recycle-step">
                  <span>{s.icon}</span>{s.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pdb-nav">
          <button className="pdb-nav-btn" onClick={prevComponent} disabled={currentComp === 0}>
            ← Anterior
          </button>
          <button className="pdb-nav-btn primary" onClick={nextComponent}>
            {currentComp === components.length - 1 ? 'Evaluacion →' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  );
}
