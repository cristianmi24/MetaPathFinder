import React, { useEffect } from 'react';

export function SmartphoneAnatomyQuiz({ onValidation }: { onValidation?: (success: boolean) => void }) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'QUIZ_SUCCESS') {
        onValidation?.(true);
      } else if (event.data?.type === 'QUIZ_FAIL') {
        onValidation?.(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onValidation]);

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Partes del Celular — Evaluación</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #f5f3ee;
  --white: #ffffff;
  --ink: #111118;
  --muted: #888894;
  --border: #e2dfd8;
  --accent: #1a56db;
  --accent2: #0e3fa8;
  --green: #1a9e5c;
  --red: #d63b3b;
  --yellow: #f5a623;
  --radius: 20px;
  --shadow: 0 4px 32px rgba(0,0,0,0.09);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

/* Noise texture */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
}

.app {
  width: 100%;
  max-width: 540px;
  position: relative;
  z-index: 1;
}

/* ── TOP BAR ── */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  padding: 0 4px;
}

.topbar-label {
  font-family: 'Syne', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--muted);
}

.step-indicator {
  font-family: 'Syne', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 99px;
  padding: 5px 14px;
}

/* ── PROGRESS TRACK ── */
.track {
  display: flex;
  gap: 5px;
  margin-bottom: 28px;
}

.track-seg {
  flex: 1;
  height: 4px;
  border-radius: 99px;
  background: var(--border);
  overflow: hidden;
  transition: background 0.3s;
}

.track-seg .fill {
  height: 100%;
  width: 0%;
  background: var(--accent);
  border-radius: 99px;
  transition: width 0.5s cubic-bezier(.4,0,.2,1);
}

.track-seg.done .fill { width: 100%; }
.track-seg.active .fill { width: 60%; background: var(--accent); }

/* ── SCREEN (main card area) ── */
.screen {
  position: relative;
  min-height: 420px;
}

/* ── CARDS ── */
.card {
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 36px 32px;
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: translateY(30px) scale(0.97);
  pointer-events: none;
  transition: opacity 0.45s cubic-bezier(.4,0,.2,1), transform 0.45s cubic-bezier(.4,0,.2,1);
  border: 1px solid var(--border);
}

.card.active {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
  position: relative;
}

.card.exit {
  opacity: 0;
  transform: translateY(-20px) scale(0.97);
  pointer-events: none;
}

/* ── INTRO CARD ── */
.intro-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  color: var(--accent);
  border-radius: 99px;
  padding: 5px 14px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.intro-title {
  font-family: 'Syne', sans-serif;
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--ink);
  line-height: 1.1;
  margin-bottom: 18px;
}

.intro-title span { color: var(--accent); }

.intro-desc {
  font-size: 0.96rem;
  line-height: 1.75;
  color: #444;
  margin-bottom: 28px;
}

.intro-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.meta-chip {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.82rem;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-chip strong { color: var(--ink); font-weight: 600; }

.phone-svg {
  display: block;
  margin: 0 auto 24px;
  animation: float 3.5s ease-in-out infinite;
}

@keyframes float {
  0%,100% { transform: translateY(0) rotate(-1deg); }
  50%      { transform: translateY(-10px) rotate(1deg); }
}

/* ── PART CARD ── */
.part-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.part-icon-box {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  flex-shrink: 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.part-num {
  font-family: 'Syne', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.part-name {
  font-family: 'Syne', sans-serif;
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--ink);
  line-height: 1.2;
}

.part-divider {
  height: 1px;
  background: var(--border);
  margin: 20px 0;
}

.part-body {
  font-size: 0.95rem;
  line-height: 1.8;
  color: #333;
}

.part-body strong { color: var(--ink); }

.part-fun-fact {
  margin-top: 20px;
  padding: 14px 16px;
  background: #f0f4ff;
  border-left: 3px solid var(--accent);
  border-radius: 0 10px 10px 0;
  font-size: 0.85rem;
  color: #334;
  line-height: 1.6;
}

.part-fun-fact span { font-weight: 600; color: var(--accent); }

/* ── QUESTION CARD ── */
.q-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff7ed;
  border: 1px solid #fcd9a0;
  color: var(--yellow);
  border-radius: 99px;
  padding: 5px 14px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.q-text {
  font-family: 'Syne', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.45;
  margin-bottom: 24px;
}

.q-type {
  font-size: 11px;
  font-weight: 500;
  color: var(--muted);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.options { display: flex; flex-direction: column; gap: 10px; }

.opt {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
  font-size: 0.92rem;
  line-height: 1.45;
  background: var(--bg);
  user-select: none;
  color: var(--ink);
}

.opt:hover:not(.disabled) {
  border-color: var(--accent);
  background: #eef2ff;
  transform: translateX(4px);
}

.opt.selected { border-color: var(--accent); background: #eef2ff; }
.opt.correct  { border-color: var(--green);  background: #ecfdf5; color: #1a5c3a; }
.opt.wrong    { border-color: var(--red);    background: #fef2f2; color: #7f1d1d; }
.opt.disabled { cursor: default; }

.opt-letter {
  width: 28px; height: 28px;
  border-radius: 8px;
  background: var(--border);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif;
  font-size: 12px; font-weight: 700;
  color: var(--muted);
  flex-shrink: 0;
  transition: background 0.2s, color 0.2s;
}

.opt.selected .opt-letter { background: var(--accent); color: #fff; }
.opt.correct  .opt-letter { background: var(--green);  color: #fff; }
.opt.wrong    .opt-letter { background: var(--red);    color: #fff; }

/* feedback inline */
.inline-feedback {
  margin-top: 14px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  line-height: 1.6;
  display: none;
  animation: fadeUp 0.3s ease;
}

.inline-feedback.show { display: block; }
.inline-feedback.ok   { background: #ecfdf5; border-left: 3px solid var(--green); color: #1a5c3a; }
.inline-feedback.fail { background: #fef2f2; border-left: 3px solid var(--red);   color: #7f1d1d; }

@keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

/* ── RESULT CARD ── */
.result-top {
  text-align: center;
  padding: 12px 0 24px;
}

.result-emoji { font-size: 3.5rem; margin-bottom: 10px; display: block; }

.score-ring {
  width: 110px; height: 110px;
  border-radius: 50%;
  background: conic-gradient(var(--accent) calc(var(--pct) * 3.6deg), var(--border) 0deg);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 18px;
  position: relative;
}

.score-ring::before {
  content: '';
  position: absolute;
  inset: 12px;
  border-radius: 50%;
  background: var(--white);
}

.score-val {
  font-family: 'Syne', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ink);
  position: relative;
  z-index: 1;
}

.result-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 8px;
}

.result-msg {
  font-size: 0.92rem;
  color: #555;
  line-height: 1.7;
  margin-bottom: 24px;
}

.result-answers {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.ans-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: var(--ink);
}

.ans-icon { font-size: 1rem; }

/* ── BUTTONS ── */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-family: 'Syne', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
.btn:active { transform: translateY(0); }

.btn-primary {
  background: var(--ink);
  color: var(--white);
}

.btn-accent {
  background: var(--accent);
  color: var(--white);
}

.btn-outline {
  background: transparent;
  border: 1.5px solid var(--border);
  color: var(--muted);
}

.btn-outline:hover { border-color: var(--ink); color: var(--ink); box-shadow: none; }

.btn-next { margin-top: 20px; }

.nav-row {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

/* part colors */
.color-blue   { background: #dbeafe; }
.color-purple { background: #ede9fe; }
.color-green  { background: #dcfce7; }
.color-orange { background: #ffedd5; }
.color-pink   { background: #fce7f3; }
.color-cyan   { background: #cffafe; }
.color-red    { background: #fee2e2; }

.tc-blue   { color: #1d4ed8; }
.tc-purple { color: #7c3aed; }
.tc-green  { color: #15803d; }
.tc-orange { color: #c2410c; }
.tc-pink   { color: #be185d; }
.tc-cyan   { color: #0e7490; }
.tc-red    { color: #b91c1c; }
</style>
</head>
<body>
<div class="app">

  <!-- Progress track -->
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding:0 2px;">
    <div class="topbar-label">📱 Tecnología</div>
    <div class="step-indicator" id="stepLabel">1 / 11</div>
  </div>
  <div class="track" id="track"></div>

  <!-- Card screen -->
  <div class="screen" id="screen"></div>

</div>

<script>
// ── DATA ──────────────────────────────────────────────────────
const PARTS = [
  {
    icon: '🔋', color: 'color-blue', tc: 'tc-blue',
    name: 'Batería',
    desc: 'La <strong>batería</strong> es la fuente de energía del celular. Almacena electricidad en forma de energía química y la libera de forma controlada para alimentar todos los componentes. Los smartphones modernos usan baterías de <strong>litio-ion (Li-ion)</strong> o <strong>litio-polímero (Li-Po)</strong>, ligeras y de alta densidad energética.',
    fact: '💡 Las baterías Li-Po pueden fabricarse en formas irregulares, lo que permite diseños ultrafinos como los que vemos hoy.'
  },
  {
    icon: '📲', color: 'color-purple', tc: 'tc-purple',
    name: 'Pantalla (Display)',
    desc: 'La <strong>pantalla</strong> es la principal interfaz visual del dispositivo. Muestra imágenes, texto, video y permite la interacción táctil. Los tipos más comunes son <strong>OLED</strong>, <strong>AMOLED</strong> y <strong>LCD</strong>. Las OLED ofrecen negros perfectos porque cada píxel emite su propia luz.',
    fact: '💡 Algunos celulares tienen pantallas con frecuencias de refresco de 120 Hz o 144 Hz, lo que hace el desplazamiento visualmente más suave.'
  },
  {
    icon: '🧠', color: 'color-orange', tc: 'tc-orange',
    name: 'Procesador (SoC)',
    desc: 'El <strong>procesador</strong> o <strong>SoC (System on a Chip)</strong> es el cerebro del celular. Ejecuta todas las instrucciones, apps y procesos del sistema. Integra la CPU, GPU, modem y otros módulos en un solo chip. Ejemplos: <strong>Snapdragon</strong> (Qualcomm), <strong>Apple A-series</strong>, <strong>Dimensity</strong> (MediaTek).',
    fact: '💡 Los procesadores modernos tienen miles de millones de transistores en un espacio del tamaño de una uña.'
  },
  {
    icon: '💾', color: 'color-green', tc: 'tc-green',
    name: 'Memoria RAM',
    desc: 'La <strong>RAM</strong> (Memoria de Acceso Aleatorio) almacena de forma temporal los datos de las aplicaciones en uso. Más RAM permite tener más apps abiertas simultáneamente sin lentitud. Los smartphones actuales suelen incluir entre <strong>4 GB y 16 GB de RAM</strong>.',
    fact: '💡 Cuando reinicias el celular, la RAM se borra completamente. Por eso las apps "arrancan de cero" al reabrir.'
  },
  {
    icon: '📡', color: 'color-cyan', tc: 'tc-cyan',
    name: 'Antena y Modem',
    desc: 'Las <strong>antenas</strong> permiten la comunicación inalámbrica: llamadas, datos móviles (4G/5G), WiFi, Bluetooth y GPS. El <strong>modem</strong> convierte las señales digitales del dispositivo en señales de radiofrecuencia y viceversa, habilitando la conexión con redes externas.',
    fact: '💡 Un smartphone moderno puede tener hasta 10 antenas distintas integradas en su carcasa para cubrir todas las bandas de frecuencia.'
  },
  {
    icon: '📷', color: 'color-pink', tc: 'tc-pink',
    name: 'Cámara',
    desc: 'La <strong>cámara</strong> convierte la luz en imágenes digitales mediante un sensor fotosensible (CMOS). Incluye la <strong>cámara trasera</strong> (principal, ultra gran angular, teleobjetivo) y la <strong>cámara frontal</strong>. La calidad depende del sensor, la apertura y el procesamiento computacional de imagen.',
    fact: '💡 El procesamiento computacional (HDR, modo noche, IA) a veces impacta más la calidad de foto que los megapíxeles.'
  },
  {
    icon: '🔊', color: 'color-red', tc: 'tc-red',
    name: 'Altavoz y Micrófono',
    desc: 'El <strong>altavoz</strong> convierte señales eléctricas en sonido mediante una membrana vibratoria. El <strong>micrófono</strong> hace lo inverso: capta vibraciones de aire y las convierte en señal eléctrica. La mayoría de teléfonos tiene <strong>2 a 3 micrófonos</strong> para cancelación de ruido.',
    fact: '💡 Los altavoces estéreo en smartphones usan el auricular como segundo canal para crear mayor amplitud de sonido.'
  },
];

const QUESTIONS = [
  {
    type: 'Referencia al texto',
    q: '¿Qué tipo de batería usan la mayoría de smartphones modernos?',
    opts: ['Níquel-cadmio (Ni-Cd)', 'Plomo-ácido', 'Litio-ion (Li-ion) o Litio-polímero (Li-Po)', 'Carbono-zinc'],
    answer: 2,
    ok: '✓ Correcto. Los smartphones modernos usan baterías Li-ion o Li-Po, más ligeras y con mayor densidad energética que las tecnologías anteriores.',
    fail: '✗ Incorrecto. El texto indica que los smartphones usan baterías de litio-ion (Li-ion) o litio-polímero (Li-Po) por su ligereza y eficiencia.'
  },
  {
    type: 'Referencia al texto',
    q: '¿Cuál es la diferencia principal de las pantallas OLED frente a las LCD?',
    opts: ['Tienen mayor tamaño', 'Cada píxel emite su propia luz, logrando negros perfectos', 'Consumen más batería', 'Solo muestran colores en escala de grises'],
    answer: 1,
    ok: '✓ Correcto. En pantallas OLED cada píxel emite luz propia, por lo que los píxeles negros se apagan completamente.',
    fail: '✗ Incorrecto. Según el texto, las pantallas OLED ofrecen negros perfectos porque cada píxel emite su propia luz, a diferencia de las LCD.'
  },
  {
    type: 'Comprensión',
    q: 'Si abres 20 aplicaciones al mismo tiempo y tu celular se vuelve lento, ¿cuál componente es el más probable responsable de la lentitud?',
    opts: ['La batería, porque no tiene carga suficiente', 'La memoria RAM, porque no tiene capacidad para mantener tantas apps activas', 'El altavoz, porque no puede procesar audio múltiple', 'La antena, porque pierde señal con muchas apps abiertas'],
    answer: 1,
    ok: '✓ Excelente razonamiento. La RAM almacena temporalmente los datos de las apps activas. Si se llena, el sistema empieza a cerrar o pausar procesos, causando lentitud.',
    fail: '✗ Incorrecto. La RAM almacena los datos de las apps en uso; cuando se satura, el dispositivo no puede mantener todas las aplicaciones en ejecución simultánea.'
  },
];

// ── STATE ─────────────────────────────────────────────────────
const TOTAL = 1 + PARTS.length + QUESTIONS.length + 1; // intro + parts + questions + result
let step = 0;
let qAnswers = [];
let qIdx = 0;
let partIdx = 0;

// ── TRACK ─────────────────────────────────────────────────────
function buildTrack() {
  const track = document.getElementById('track');
  track.innerHTML = '';
  for (let i = 0; i < TOTAL; i++) {
    const seg = document.createElement('div');
    seg.className = 'track-seg';
    seg.innerHTML = '<div class="fill"></div>';
    track.appendChild(seg);
  }
}

function updateTrack() {
  document.querySelectorAll('.track-seg').forEach((seg, i) => {
    seg.classList.remove('done','active');
    if (i < step) { seg.classList.add('done'); seg.querySelector('.fill').style.width = '100%'; }
    else if (i === step) { seg.classList.add('active'); seg.querySelector('.fill').style.width = '60%'; }
    else seg.querySelector('.fill').style.width = '0%';
  });
  document.getElementById('stepLabel').textContent = \`\${step + 1} / \${TOTAL}\`;
}

// ── RENDER ────────────────────────────────────────────────────
function setCard(html) {
  const screen = document.getElementById('screen');
  // exit existing
  const existing = screen.querySelector('.active');
  if (existing) {
    existing.classList.remove('active');
    existing.classList.add('exit');
    setTimeout(() => existing.remove(), 450);
  }
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = html;
  screen.appendChild(card);
  requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('active')));
}

// ── INTRO ─────────────────────────────────────────────────────
function showIntro() {
  setCard(\`
    <svg class="phone-svg" width="100" height="160" viewBox="0 0 100 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="90" height="150" rx="16" fill="#111118"/>
      <rect x="10" y="18" width="80" height="118" rx="8" fill="#1a56db" opacity=".15"/>
      <rect x="10" y="18" width="80" height="118" rx="8" fill="none" stroke="#1a56db" stroke-width="1"/>
      <circle cx="50" cy="9" r="4" fill="#333"/>
      <circle cx="50" cy="145" r="6" fill="#333"/>
      <rect x="25" y="38" width="50" height="7" rx="3.5" fill="#1a56db" opacity=".5"/>
      <rect x="30" y="52" width="40" height="5" rx="2.5" fill="#e2dfd8" opacity=".4"/>
      <rect x="18" y="70" width="64" height="40" rx="8" fill="#1a56db" opacity=".1" stroke="#1a56db" stroke-width="1"/>
      <text x="50" y="95" font-family="monospace" font-size="20" fill="#1a56db" text-anchor="middle">📱</text>
    </svg>
    <div class="intro-badge">📚 Evaluación interactiva</div>
    <div class="intro-title">Partes del<br><span>Celular</span></div>
    <div class="intro-desc">Aprende sobre cada componente del smartphone y pon a prueba tu comprensión con preguntas al final.</div>
    <div class="intro-meta">
      <div class="meta-chip">📦 <strong>7</strong> partes</div>
      <div class="meta-chip">❓ <strong>3</strong> preguntas</div>
      <div class="meta-chip">⏱️ ~5 min</div>
    </div>
    <button class="btn btn-primary" onclick="nextStep()">Comenzar →</button>
  \`);
}

// ── PART CARD ─────────────────────────────────────────────────
function showPart(i) {
  const p = PARTS[i];
  const isLast = i === PARTS.length - 1;
  setCard(\`
    <div class="part-header">
      <div class="part-icon-box \${p.color}">
        <span>\${p.icon}</span>
      </div>
      <div>
        <div class="part-num \${p.tc}">Parte \${String(i+1).padStart(2,'0')} de \${PARTS.length}</div>
        <div class="part-name">\${p.name}</div>
      </div>
    </div>
    <div class="part-divider"></div>
    <div class="part-body">\${p.desc}</div>
    <div class="part-fun-fact"><span>Dato curioso —</span> \${p.fact}</div>
    <button class="btn btn-primary btn-next" onclick="nextStep()">
      \${isLast ? 'Ir a las preguntas →' : 'Siguiente parte →'}
    </button>
  \`);
}

// ── QUESTION CARD ─────────────────────────────────────────────
function showQuestion(i) {
  const q = QUESTIONS[i];
  const letters = ['A','B','C','D'];
  const optsHTML = q.opts.map((o, idx) =>
    \`<div class="opt" data-idx="\${idx}" onclick="selectOpt(this, \${i}, \${idx})">
      <div class="opt-letter">\${letters[idx]}</div>\${o}
    </div>\`
  ).join('');

  setCard(\`
    <div class="q-badge">❓ Pregunta \${i+1} de \${QUESTIONS.length}</div>
    <div class="q-type">\${q.type}</div>
    <div class="q-text">\${q.q}</div>
    <div class="options" id="opts-\${i}">\${optsHTML}</div>
    <div class="inline-feedback" id="fb-\${i}"></div>
    <button class="btn btn-accent btn-next" id="qbtn-\${i}" style="display:none" onclick="nextStep()">
      \${i === QUESTIONS.length - 1 ? 'Ver resultados →' : 'Siguiente pregunta →'}
    </button>
  \`);
}

window.selectOpt = function(el, qI, optIdx) {
  const q = QUESTIONS[qI];
  const opts = document.querySelectorAll(\`#opts-\${qI} .opt\`);
  opts.forEach(o => o.classList.add('disabled'));
  opts.forEach(o => {
    if (parseInt(o.dataset.idx) === q.answer) o.classList.add('correct');
  });
  const isCorrect = optIdx === q.answer;
  if (!isCorrect) el.classList.add('wrong');
  qAnswers.push(isCorrect);

  const fb = document.getElementById(\`fb-\${qI}\`);
  fb.className = \`inline-feedback show \${isCorrect ? 'ok' : 'fail'}\`;
  fb.textContent = isCorrect ? q.ok : q.fail;

  document.getElementById(\`qbtn-\${qI}\`).style.display = 'flex';
};

// ── RESULT ────────────────────────────────────────────────────
function showResult() {
  const score = qAnswers.filter(Boolean).length;
  const pct = Math.round(score / QUESTIONS.length * 100);
  const msgs = [
    { title: 'Sigue practicando', msg: 'Revisa las partes del celular con calma. Cada componente tiene su rol único. ¡Inténtalo de nuevo!', e: '📖' },
    { title: '¡Buen avance!', msg: 'Vas por buen camino. Un pequeño repaso te llevará al dominio total del tema.', e: '👍' },
    { title: '¡Casi perfecto!', msg: 'Excelente comprensión. Revisa el detalle donde fallaste y serás experto.', e: '🌟' },
    { title: '¡Perfecto!', msg: 'Dominas por completo las partes del celular. Conocimiento sólido y bien estructurado.', e: '🏆' },
  ];
  const lvl = score === 0 ? 0 : score === 1 ? 1 : score === 2 ? 2 : 3;
  const m = msgs[lvl];

  const ansRows = QUESTIONS.map((q, i) =>
    \`<div class="ans-row"><span class="ans-icon">\${qAnswers[i] ? '✅' : '❌'}</span> <span>\${q.q.length > 55 ? q.q.slice(0,55)+'…' : q.q}</span></div>\`
  ).join('');

  setCard(\`
    <div class="result-top">
      <span class="result-emoji">\${m.e}</span>
      <div class="score-ring" style="--pct:\${pct}">
        <div class="score-val">\${score}/\${QUESTIONS.length}</div>
      </div>
      <div class="result-title">\${m.title}</div>
      <div class="result-msg">\${m.msg}</div>
    </div>
    <div class="result-answers">\${ansRows}</div>
    <div class="nav-row">
      <button class="btn btn-outline" onclick="restartAll()">↩ Reiniciar</button>
      <button class="btn btn-primary" onclick="restartQuestions()">Repetir preguntas</button>
    </div>
  \`);

  // Notificar al entorno de React
  if (score === QUESTIONS.length) {
    window.parent.postMessage({ type: 'QUIZ_SUCCESS' }, '*');
  } else {
    window.parent.postMessage({ type: 'QUIZ_FAIL' }, '*');
  }
}

// ── NAVIGATION ────────────────────────────────────────────────
window.nextStep = function() {
  step++;
  updateTrack();

  if (step === 0) { showIntro(); return; }

  // parts: steps 1 … PARTS.length
  if (step >= 1 && step <= PARTS.length) {
    showPart(step - 1);
    return;
  }

  // questions: steps PARTS.length+1 … PARTS.length+QUESTIONS.length
  const qStart = PARTS.length + 1;
  const qEnd   = PARTS.length + QUESTIONS.length;
  if (step >= qStart && step <= qEnd) {
    showQuestion(step - qStart);
    return;
  }

  // result
  showResult();
};

window.restartAll = function() {
  step = 0;
  qAnswers = [];
  updateTrack();
  showIntro();
};

window.restartQuestions = function() {
  step = PARTS.length;
  qAnswers = [];
  updateTrack();
  showQuestion(0);
  // adjust step display
  step = PARTS.length + 1;
  updateTrack();
  showQuestion(0);
};

// ── INIT ──────────────────────────────────────────────────────
buildTrack();
updateTrack();
showIntro();
</script>
</body>
</html>
  `;

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '620px', borderRadius: '0 0 2rem 2rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <iframe 
        srcDoc={htmlContent} 
        style={{ width: '100%', height: '100%', flex: 1, border: 'none' }} 
        title="Partes del Celular"
      />
    </div>
  );
}
