import React, { useEffect } from 'react';

export function ComputingEvolutionQuiz({ challengeId, onValidation }: { challengeId?: string; onValidation?: (success: boolean) => void }) {
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
<title>Evolución del Cómputo — Evaluación</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #080b10;
  --surface: #0e1320;
  --card: #111827;
  --border: #1e2a3a;
  --text: #c8d4e8;
  --muted: #4a5878;
  --bright: #e8f0ff;
  --accent: #38bdf8;
  --accent2: #0ea5e9;
  --green: #34d399;
  --red: #f87171;
  --yellow: #fbbf24;
  --purple: #a78bfa;
  --r: 16px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 16px 64px;
}

/* star field */
body::before {
  content:'';
  position:fixed;
  inset:0;
  background:
    radial-gradient(1px 1px at 15% 22%, rgba(200,212,232,.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 72% 8%,  rgba(200,212,232,.3) 0%, transparent 100%),
    radial-gradient(1px 1px at 40% 55%, rgba(200,212,232,.3) 0%, transparent 100%),
    radial-gradient(1px 1px at 88% 44%, rgba(200,212,232,.2) 0%, transparent 100%),
    radial-gradient(1px 1px at 5%  80%, rgba(200,212,232,.2) 0%, transparent 100%),
    radial-gradient(1px 1px at 60% 90%, rgba(200,212,232,.3) 0%, transparent 100%),
    radial-gradient(1px 1px at 30% 70%, rgba(200,212,232,.2) 0%, transparent 100%),
    radial-gradient(200px 200px at 80% 10%, rgba(56,189,248,.04) 0%, transparent 100%),
    radial-gradient(300px 300px at 20% 90%, rgba(167,139,250,.04) 0%, transparent 100%);
  pointer-events:none;
  z-index:0;
}

.wrap {
  width:100%;
  max-width:600px;
  position:relative;
  z-index:1;
}

/* ── TOP ── */
.topbar {
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom:16px;
}

.site-tag {
  font-family:'DM Mono', monospace;
  font-size:10px;
  letter-spacing:3px;
  text-transform:uppercase;
  color:var(--muted);
}

.step-pill {
  font-family:'DM Mono', monospace;
  font-size:11px;
  color:var(--accent);
  background:rgba(56,189,248,.1);
  border:1px solid rgba(56,189,248,.2);
  border-radius:99px;
  padding:4px 14px;
}

/* ── PROGRESS ── */
.progress-wrap {margin-bottom:28px;}
.progress-bar {
  height:3px;
  background:var(--border);
  border-radius:99px;
  overflow:hidden;
}
.progress-fill {
  height:100%;
  background:linear-gradient(90deg, var(--accent), var(--purple));
  border-radius:99px;
  width:0%;
  transition:width .6s cubic-bezier(.4,0,.2,1);
}
.progress-label {
  font-family:'DM Mono', monospace;
  font-size:10px;
  color:var(--muted);
  text-align:right;
  margin-top:6px;
}

/* ── SCREEN ── */
.screen { position:relative; min-height:520px; }

/* ── CARD ── */
.card {
  background:var(--card);
  border:1px solid var(--border);
  border-radius:var(--r);
  padding:36px 32px;
  position:absolute;
  inset:0;
  opacity:0;
  transform:translateY(28px) scale(.98);
  pointer-events:none;
  transition:opacity .4s cubic-bezier(.4,0,.2,1), transform .4s cubic-bezier(.4,0,.2,1);
  overflow:hidden;
}
.card::before {
  content:'';
  position:absolute;
  top:0;left:0;right:0;
  height:1px;
  background:linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity:0;
  transition:opacity .4s;
}
.card.active {
  opacity:1;
  transform:translateY(0) scale(1);
  pointer-events:auto;
  position:relative;
}
.card.active::before { opacity:.6; }
.card.exit {
  opacity:0;
  transform:translateY(-18px) scale(.98);
  pointer-events:none;
}

/* ── INTRO ── */
.intro-eyebrow {
  font-family:'DM Mono', monospace;
  font-size:10px;
  letter-spacing:3px;
  text-transform:uppercase;
  color:var(--accent);
  margin-bottom:16px;
  display:flex;
  align-items:center;
  gap:8px;
}
.intro-eyebrow::before {
  content:'';
  display:inline-block;
  width:20px;height:1px;
  background:var(--accent);
}

.intro-title {
  font-family:'Bebas Neue', sans-serif;
  font-size:clamp(2.8rem,8vw,4.5rem);
  line-height:.95;
  color:var(--bright);
  margin-bottom:6px;
  letter-spacing:1px;
}
.intro-title .hl { color:var(--accent); }

.intro-year {
  font-family:'Bebas Neue', sans-serif;
  font-size:clamp(1.2rem,4vw,1.8rem);
  color:var(--muted);
  letter-spacing:4px;
  margin-bottom:24px;
}

.intro-body {
  font-size:.95rem;
  line-height:1.8;
  color:var(--text);
  margin-bottom:24px;
}

.chips {
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin-bottom:32px;
}
.chip {
  background:rgba(255,255,255,.04);
  border:1px solid var(--border);
  border-radius:8px;
  padding:6px 14px;
  font-size:.8rem;
  color:var(--muted);
}
.chip strong { color:var(--bright); }

/* ── HITO CARD ── */
.hito-top {
  display:flex;
  align-items:flex-start;
  gap:18px;
  margin-bottom:24px;
}
.hito-year-box {
  flex-shrink:0;
  background:rgba(56,189,248,.08);
  border:1px solid rgba(56,189,248,.2);
  border-radius:12px;
  padding:10px 16px;
  text-align:center;
}
.hito-year-num {
  font-family:'Bebas Neue', sans-serif;
  font-size:1.8rem;
  color:var(--accent);
  line-height:1;
}
.hito-year-label {
  font-family:'DM Mono', monospace;
  font-size:8px;
  letter-spacing:2px;
  text-transform:uppercase;
  color:var(--muted);
}
.hito-meta { flex:1; }
.hito-num {
  font-family:'DM Mono', monospace;
  font-size:9px;
  letter-spacing:2px;
  text-transform:uppercase;
  color:var(--muted);
  margin-bottom:4px;
}
.hito-title {
  font-family:'Bebas Neue', sans-serif;
  font-size:1.9rem;
  color:var(--bright);
  letter-spacing:.5px;
  line-height:1.05;
}

.hito-icon {
  font-size:2.2rem;
  margin-bottom:4px;
}

/* three columns */
.triple {
  display:grid;
  grid-template-columns:1fr 1fr 1fr;
  gap:10px;
  margin-bottom:20px;
}
@media(max-width:480px){.triple{grid-template-columns:1fr;}}

.col-box {
  background:rgba(255,255,255,.03);
  border:1px solid var(--border);
  border-radius:10px;
  padding:14px;
}
.col-label {
  font-family:'DM Mono', monospace;
  font-size:8px;
  letter-spacing:2px;
  text-transform:uppercase;
  margin-bottom:8px;
}
.col-text {
  font-size:.8rem;
  line-height:1.65;
  color:var(--text);
}

.tag-advance { color:var(--accent); }
.tag-context { color:var(--yellow); }
.tag-limit   { color:var(--purple); }

.hito-divider {
  height:1px;
  background:var(--border);
  margin:18px 0;
}

.hito-superado {
  display:flex;
  gap:10px;
  align-items:flex-start;
  font-size:.84rem;
  line-height:1.65;
  color:var(--text);
  background:rgba(52,211,153,.05);
  border:1px solid rgba(52,211,153,.15);
  border-radius:10px;
  padding:12px 14px;
  margin-bottom:10px;
}
.hito-superado .icon { font-size:1rem; flex-shrink:0; }

.hito-impuso {
  display:flex;
  gap:10px;
  align-items:flex-start;
  font-size:.84rem;
  line-height:1.65;
  color:var(--text);
  background:rgba(248,113,113,.05);
  border:1px solid rgba(248,113,113,.15);
  border-radius:10px;
  padding:12px 14px;
}
.hito-impuso .icon { font-size:1rem; flex-shrink:0; }

/* ── REFLEXION ── */
.reflexion-title {
  font-family:'Bebas Neue', sans-serif;
  font-size:2rem;
  color:var(--bright);
  margin-bottom:8px;
  letter-spacing:.5px;
}
.reflexion-body {
  font-size:.92rem;
  line-height:1.85;
  color:var(--text);
  margin-bottom:16px;
}
.quote-box {
  border-left:3px solid var(--accent);
  padding:14px 18px;
  background:rgba(56,189,248,.06);
  border-radius:0 10px 10px 0;
  font-style:italic;
  font-size:.9rem;
  color:var(--accent);
  margin-bottom:20px;
  line-height:1.7;
}

/* ── QUESTION CARD ── */
.q-eyebrow {
  font-family:'DM Mono', monospace;
  font-size:9px;
  letter-spacing:3px;
  text-transform:uppercase;
  color:var(--yellow);
  margin-bottom:12px;
  display:flex;
  align-items:center;
  gap:8px;
}
.q-eyebrow::before {
  content:'';
  display:inline-block;
  width:16px;height:1px;
  background:var(--yellow);
}

.q-title {
  font-family:'Bebas Neue', sans-serif;
  font-size:1.6rem;
  color:var(--bright);
  line-height:1.2;
  margin-bottom:8px;
  letter-spacing:.5px;
}

.q-type {
  font-size:.78rem;
  color:var(--muted);
  font-family:'DM Mono', monospace;
  letter-spacing:1px;
  text-transform:uppercase;
  margin-bottom:20px;
}

.options { display:flex; flex-direction:column; gap:9px; }

.opt {
  display:flex;
  align-items:flex-start;
  gap:12px;
  padding:13px 16px;
  border:1.5px solid var(--border);
  border-radius:10px;
  cursor:pointer;
  font-size:.88rem;
  line-height:1.5;
  background:rgba(255,255,255,.02);
  transition:border-color .2s, background .2s, transform .15s;
  user-select:none;
  color:var(--text);
}
.opt:hover:not(.disabled) {
  border-color:var(--accent);
  background:rgba(56,189,248,.07);
  transform:translateX(4px);
}
.opt.sel  { border-color:var(--accent); background:rgba(56,189,248,.1); }
.opt.ok   { border-color:var(--green);  background:rgba(52,211,153,.08); color:#a7f3d0; }
.opt.bad  { border-color:var(--red);    background:rgba(248,113,113,.08); color:#fca5a5; }
.opt.disabled { cursor:default; }

.opt-key {
  width:24px; height:24px; flex-shrink:0;
  border-radius:6px;
  background:var(--border);
  display:flex;align-items:center;justify-content:center;
  font-family:'DM Mono', monospace;
  font-size:10px; font-weight:500;
  color:var(--muted);
  transition:background .2s, color .2s;
}
.opt.sel .opt-key  { background:var(--accent);  color:#000; }
.opt.ok  .opt-key  { background:var(--green);   color:#000; }
.opt.bad .opt-key  { background:var(--red);     color:#000; }

.fb {
  margin-top:12px;
  padding:12px 14px;
  border-radius:9px;
  font-size:.83rem;
  line-height:1.65;
  display:none;
  animation:upFade .3s ease;
}
.fb.show { display:block; }
.fb.ok   { background:rgba(52,211,153,.08); border-left:3px solid var(--green); color:#a7f3d0; }
.fb.bad  { background:rgba(248,113,113,.08); border-left:3px solid var(--red);  color:#fca5a5; }

/* ── RESULT ── */
.result-hero {
  text-align:center;
  margin-bottom:28px;
}
.result-badge {
  font-size:3.5rem;
  display:block;
  margin-bottom:14px;
}
.result-ring {
  width:120px; height:120px;
  border-radius:50%;
  background:conic-gradient(var(--accent) calc(var(--pct)*3.6deg), var(--border) 0deg);
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 18px;
  position:relative;
}
.result-ring::before {
  content:'';
  position:absolute;
  inset:14px;
  border-radius:50%;
  background:var(--card);
}
.result-score {
  font-family:'Bebas Neue', sans-serif;
  font-size:2rem;
  color:var(--bright);
  position:relative;
  z-index:1;
  letter-spacing:1px;
}
.result-title {
  font-family:'Bebas Neue', sans-serif;
  font-size:2rem;
  color:var(--bright);
  letter-spacing:.5px;
  margin-bottom:8px;
}
.result-msg {
  font-size:.9rem;
  color:var(--text);
  line-height:1.75;
  margin-bottom:24px;
}
.result-list {
  background:rgba(255,255,255,.02);
  border:1px solid var(--border);
  border-radius:10px;
  padding:14px;
  display:flex;
  flex-direction:column;
  gap:8px;
  margin-bottom:24px;
}
.rl-row {
  display:flex;
  align-items:center;
  gap:10px;
  font-size:.82rem;
  color:var(--text);
}

/* ── BUTTONS ── */
.btn {
  display:flex;align-items:center;justify-content:center;gap:8px;
  width:100%;padding:15px;border:none;border-radius:10px;
  font-family:'DM Sans', sans-serif;font-size:.9rem;font-weight:600;
  cursor:pointer;transition:transform .15s, box-shadow .15s;
}
.btn:hover { transform:translateY(-2px); box-shadow:0 6px 24px rgba(0,0,0,.3); }
.btn:active { transform:translateY(0); }
.btn-main { background:var(--accent); color:#000; }
.btn-dim  { background:rgba(255,255,255,.06); color:var(--text); border:1px solid var(--border); }
.btn-dim:hover { border-color:var(--accent); color:var(--bright); box-shadow:none; }
.btn-row  { display:flex; gap:10px; }
.mt20 { margin-top:20px; }
.mt14 { margin-top:14px; }
.mt10 { margin-top:10px; }

/* ── ANIM ── */
@keyframes upFade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
</style>
</head>
<body>
<div class="wrap">

  <div class="topbar">
    <div class="site-tag">⚙️ Informática · Historia</div>
    <div class="step-pill" id="stepPill">1 / 12</div>
  </div>

  <div class="progress-wrap">
    <div class="progress-bar"><div class="progress-fill" id="pFill"></div></div>
    <div class="progress-label" id="pLabel">Introducción</div>
  </div>

  <div class="screen" id="screen"></div>
</div>

<script>
// ═══════════════════════════ DATA ═══════════════════════════
const HITOS = [
  {
    year:'1642', icon:'⚙️',
    title:'Pascalina',
    advance:'Primera calculadora mecánica funcional: engranajes que representaban dígitos y propagaban el acarreo automáticamente para sumar y restar.',
    context:'Blaise Pascal, matemático francés de 19 años, la construyó para ayudar a su padre recaudador de impuestos. Era la era del absolutismo francés y del racionalismo cartesiano.',
    superado:'Eliminó la necesidad de cálculo mental tedioso y propenso a errores.',
    impuso:'Solo sumaba y restaba; multiplicar era un proceso manual repetido. Producirla era artesanal y muy costosa.',
  },
  {
    year:'1837', icon:'🔩',
    title:'Motor Analítico de Babbage',
    advance:'Primer diseño de una máquina programable de propósito general: unidad aritmética, memoria (el "almacén"), unidad de control y entrada/salida mediante tarjetas perforadas.',
    context:'Charles Babbage, matemático inglés, lo concibió en plena Revolución Industrial. Ada Lovelace escribió el primer algoritmo para la máquina, convirtiéndose en la primera programadora de la historia.',
    superado:'Teóricamente, cualquier cálculo posible —no solo aritméticos básicos.',
    impuso:'Nunca se completó por limitaciones mecánicas y falta de financiamiento. Dependía de piezas metálicas con tolerancias imposibles para la manufactura de la época.',
  },
  {
    year:'1945', icon:'🔌',
    title:'ENIAC — Primera computadora electrónica',
    advance:'Primer computador electrónico de propósito general. Usaba 18,000 tubos de vacío para realizar cálculos a velocidades mil veces superiores a los relés electromecánicos.',
    context:'J. Presper Eckert y John Mauchly lo desarrollaron en la Universidad de Pennsylvania durante la Segunda Guerra Mundial, para calcular tablas de tiro de artillería.',
    superado:'Velocidad: completaba en segundos cálculos que a humanos les tomaba días.',
    impuso:'Consumía 150 kW de potencia, llenaba 167 m². Los tubos fallaban diariamente, lo dejaban inoperativo ~50% del tiempo. Era imposible de miniaturizar.',
  },
  {
    year:'1947', icon:'⚡',
    title:'Transistor — Bell Labs',
    advance:'Dispositivo semiconductor sólido (sin partes móviles ni vacío) que amplifica y conmuta señales eléctricas. Mucho más pequeño, rápido, fiable y eficiente que el tubo de vacío.',
    context:'William Shockley, John Bardeen y Walter Brattain en Bell Labs (AT&T), financiados parcialmente por investigación militar postguerra. Ganaron el Premio Nobel de Física en 1956.',
    superado:'La fragilidad, el calor y el tamaño de los tubos de vacío.',
    impuso:'Difícil de fabricar individualmente con consistencia. Integrar miles de ellos en un circuito requería unirlos manualmente, un proceso lento y con alta tasa de fallo.',
  },
  {
    year:'1958', icon:'💻',
    title:'Circuito Integrado (Chip)',
    advance:'Jack Kilby (Texas Instruments) y Robert Noyce (Fairchild) —de forma independiente— grabaron múltiples transistores, resistencias y condensadores en una sola pastilla de silicio.',
    context:'Guerra Fría y carrera espacial: el ejército de EE.UU. y la NASA necesitaban electrónica miniaturizada para misiles y satélites. El contexto militar fue el principal motor de inversión.',
    superado:'El problema de la "tiranía de los números": conectar manualmente miles de componentes discretos era prohibitivo en costo, tamaño y fiabilidad.',
    impuso:'Nuevos desafíos de fabricación en sala limpia, fotolitografía y control de impurezas a escala nanométrica. La complejidad del diseño creció exponencialmente.',
  },
  {
    year:'1971', icon:'🧠',
    title:'Microprocesador Intel 4004',
    advance:'Primera CPU completa en un solo chip: 2,300 transistores en 10 µm. Integraba unidad aritmética, registros y control en 12 mm². Gordon Moore ya había formulado en 1965 que los transistores por chip se duplicarían cada ~2 años.',
    context:'Intel (Robert Noyce y Gordon Moore) lo desarrolló originalmente para la calculadora Busicom japonesa. Coincidió con el inicio de la democratización de la computación personal.',
    superado:'La necesidad de CPUs hechas con múltiples chips. Un solo chip = menor costo, menor consumo, más velocidad.',
    impuso:'Los programas ahora debían caber en memoria muy limitada. Surgió la urgencia de sistemas operativos y lenguajes de programación eficientes.',
  },
  {
    year:'2019', icon:'⚛️',
    title:'Supremacía Cuántica — Google Sycamore',
    advance:'El procesador Sycamore de 53 cúbits completó una tarea específica de muestreo en 200 segundos, una operación que Google estimó tomaría 10,000 años en la supercomputadora más rápida. Los cúbits explotan superposición y entrelazamiento cuántico.',
    context:'Google AI, en plena era de la IA y la computación en la nube. IBM disputó los tiempos clásicos, y en 2022 investigadores chinos demostraron que GPUs aceleradas podían resolver la misma tarea en horas.',
    superado:'Ciertos problemas computacionales específicos antes intratables para computación clásica.',
    impuso:'Los cúbits son extremadamente frágiles (se "descoherentan" con cualquier interferencia térmica o electromagnética). Se requieren temperaturas cercanas al cero absoluto. Las tasas de error siguen siendo altas en la era NISQ.',
  },
];

const QUESTIONS = [
  {
    type:'Referencia al texto',
    q:'¿Por qué el ENIAC dejaba de funcionar aproximadamente la mitad del tiempo?',
    opts:[
      'Su programación era muy compleja y necesitaba reiniciarse',
      'Los tubos de vacío fallaban constantemente por su fragilidad',
      'Consumía demasiada electricidad y el sistema se sobrecargaba',
      'Babbage nunca terminó de diseñar su arquitectura'
    ],
    ans:1,
    ok:'✓ Correcto. Los 18,000 tubos de vacío del ENIAC fallaban diariamente; el sistema estaba inoperativo ~50% del tiempo, como se describe en el texto.',
    fail:'✗ Incorrecto. Según el texto, los tubos de vacío del ENIAC fallaban con frecuencia diaria, dejando la máquina inoperativa cerca del 50% del tiempo.'
  },
  {
    type:'Referencia al texto',
    q:'¿Qué contexto histórico impulsó principalmente el desarrollo del circuito integrado (chip) en 1958?',
    opts:[
      'La necesidad de calculadoras comerciales baratas para oficinas',
      'La investigación académica pura en universidades europeas',
      'La Guerra Fría y la carrera espacial, que exigían electrónica miniaturizada',
      'La demanda de la industria automotriz por controles electrónicos'
    ],
    ans:2,
    ok:'✓ Excelente. El texto señala que el ejército de EE.UU. y la NASA, en plena Guerra Fría, necesitaban electrónica miniaturizada para misiles y satélites.',
    fail:'✗ Incorrecto. El texto indica que la Guerra Fría y la carrera espacial —con sus exigencias militares y de la NASA— fueron el principal motor de inversión para el chip.'
  },
  {
    type:'Comprensión profunda',
    q:'Ada Lovelace escribió el primer algoritmo para el Motor Analítico de Babbage, una máquina que nunca se construyó completamente. ¿Qué implica esto sobre la relación entre teoría y práctica en la tecnología?',
    opts:[
      'Que los algoritmos solo tienen valor si se pueden ejecutar en hardware real',
      'Que el pensamiento teórico puede anticiparse décadas al hardware disponible y sentar bases fundamentales',
      'Que Babbage no supo comunicar correctamente su diseño a los ingenieros de la época',
      'Que los avances teóricos sin aplicación práctica son irrelevantes para la historia'
    ],
    ans:1,
    ok:'✓ Muy bien razonado. El concepto de algoritmo de Lovelace precedió en más de un siglo a las computadoras que lo ejecutarían. La teoría puede ir mucho más adelante que el hardware disponible.',
    fail:'✗ Incorrecto. El caso demuestra precisamente lo contrario: los conceptos teóricos de Babbage y Lovelace —algoritmo, memoria, control— son los fundamentos de toda la computación moderna, décadas antes del hardware capaz de realizarlos.'
  },
  {
    type:'Análisis de patrón histórico',
    q:'La Pascalina (1642) y el Motor Analítico (1837) usaban engranajes mecánicos. El ENIAC (1945) usó tubos de vacío. ¿Qué patrón de la evolución tecnológica ejemplifica mejor esta secuencia?',
    opts:[
      'Cada tecnología desaparece por completo cuando surge la siguiente',
      'Cada salto tecnológico resuelve limitaciones físicas del anterior pero introduce nuevas restricciones',
      'La tecnología siempre se vuelve más cara y compleja con el tiempo',
      'Los inventos mecánicos son más fiables que los electrónicos'
    ],
    ans:1,
    ok:'✓ Correcto. Como muestra el texto, Pascal resolvió el cálculo manual con engranajes → Babbage quiso generalizar → el ENIAC lo hizo electrónico pero frágil. Cada solución resuelve limitaciones previas e impone nuevas.',
    fail:'✗ Incorrecto. El patrón histórico muestra que cada paradigma tecnológico (mecánico → tubos → transistores → chips) supera las limitaciones del anterior —fragilidad, tamaño, costo— pero introduce sus propios desafíos.'
  },
  {
    type:'Aplicación de conceptos',
    q:'Gordon Moore predijo en 1965 que los transistores por chip se duplicarían cada ~2 años. Según el texto, ¿cuál es el estado actual de esta "Ley de Moore"?',
    opts:[
      'Sigue vigente y se mantendrá por los próximos 50 años sin cambios',
      'Se está desacelerando porque los transistores alcanzan límites físicos cuánticos a escalas de 2-3 nm',
      'Ya no es relevante porque la computación cuántica la ha reemplazado por completo',
      'Solo aplica a procesadores Intel, no a otras arquitecturas'
    ],
    ans:1,
    ok:'✓ Exacto. El texto explica que la Ley de Moore se está desacelerando al alcanzar límites físicos cuánticos, y que la computación cuántica usa métricas diferentes (calidad del cúbit), no solo cantidad de transistores.',
    fail:'✗ Incorrecto. Según la reflexión final, la Ley de Moore describió bien la evolución de 1965 a ~2015, pero hoy se desacelera por barreras físicas a escala de 2-3 nm. La computación cuántica representa un paradigma diferente.'
  },
  {
    type:'Comprensión de frontera tecnológica',
    q:'El procesador cuántico Sycamore (2019) resolvió una tarea en 200 segundos que tomaría 10,000 años en una supercomputadora clásica. Sin embargo, el texto menciona una limitación importante. ¿Cuál es?',
    opts:[
      'Los cúbits son extremadamente frágiles y requieren temperaturas cercanas al cero absoluto, con tasas de error aún altas',
      'Google abandonó la investigación cuántica porque no es viable comercialmente',
      'El procesador cuántico es más lento que un celular moderno en tareas cotidianas',
      'La supremacía cuántica se logró solo en teoría, nunca en la práctica'
    ],
    ans:0,
    ok:'✓ Correcto. El texto señala que los cúbits son frágiles (se "descoherentan" fácilmente), requieren temperaturas cercanas al cero absoluto y las tasas de error siguen siendo altas —un claro ejemplo de que cada nueva solución impone nuevas limitaciones.',
    fail:'✗ Incorrecto. El texto indica que los cúbits son extremadamente sensibles a interferencias térmicas y electromagnéticas, requieren temperaturas criogénicas, y las tasas de error en la era NISQ siguen siendo altas.'
  },
];

const TOTAL = 1 + HITOS.length + 1 + QUESTIONS.length + 1;
let step = 0;
const userAns = [];

// ══ utils ══
function pct() { return Math.round(step / (TOTAL-1) * 100); }

function updateProgress() {
  document.getElementById('pFill').style.width = pct() + '%';
  document.getElementById('stepPill').textContent = \`\${step+1} / \${TOTAL}\`;
  const labels = ['Introducción', ...HITOS.map((_,i)=>\`Hito \${i+1}/\${HITOS.length}\`), 'Reflexión', ...QUESTIONS.map((_,i)=>\`Pregunta \${i+1}/\${QUESTIONS.length}\`), 'Resultado'];
  document.getElementById('pLabel').textContent = labels[step] || '';
}

function setCard(html) {
  const scr = document.getElementById('screen');
  const old = scr.querySelector('.active');
  if (old) { old.classList.remove('active'); old.classList.add('exit'); setTimeout(()=>old.remove(),420); }
  const c = document.createElement('div');
  c.className = 'card';
  c.innerHTML = html;
  scr.appendChild(c);
  requestAnimationFrame(()=>requestAnimationFrame(()=>c.classList.add('active')));
}

window.next = function() { step++; updateProgress(); render(); }

// ══ RENDER ══
function render() {
  if (step === 0) return renderIntro();
  if (step >= 1 && step <= HITOS.length) return renderHito(step-1);
  if (step === HITOS.length+1) return renderReflexion();
  const qStart = HITOS.length+2;
  const qEnd   = qStart + QUESTIONS.length - 1;
  if (step >= qStart && step <= qEnd) return renderQuestion(step-qStart);
  return renderResult();
}

// ── INTRO ──
function renderIntro() {
  setCard(\`
    <div class="intro-eyebrow">Reto de Investigación</div>
    <div class="intro-title">EVOLUCIÓN DEL<br><span class="hl">CÓMPUTO</span></div>
    <div class="intro-year">1642 — 2019</div>
    <div class="intro-body">
      Desde los engranajes de Pascal hasta los procesadores cuánticos de Google, la historia de la computación es una cadena de revoluciones donde cada solución abre nuevos problemas. Explorarás <strong>6 hitos tecnológicos</strong> fundamentales, su contexto histórico y sus contradicciones internas.
    </div>
    <div class="chips">
      <div class="chip">📦 <strong>7</strong> hitos</div>
      <div class="chip">🧠 <strong>3</strong> preguntas</div>
      <div class="chip">💡 Reflexión final</div>
      <div class="chip">⏱️ ~8 min</div>
    </div>
    <button class="btn btn-main" onclick="next()">Comenzar recorrido →</button>
  \`);
}

// ── HITO ──
function renderHito(i) {
  const h = HITOS[i];
  const isLast = i === HITOS.length - 1;
  setCard(\`
    <div class="hito-top">
      <div class="hito-year-box">
        <div class="hito-icon">\${h.icon}</div>
        <div class="hito-year-num">\${h.year}</div>
        <div class="hito-year-label">año</div>
      </div>
      <div class="hito-meta">
        <div class="hito-num">Hito \${String(i+1).padStart(2,'0')} de \${HITOS.length}</div>
        <div class="hito-title">\${h.title}</div>
      </div>
    </div>

    <div class="triple">
      <div class="col-box">
        <div class="col-label tag-advance">⚡ Avance técnico</div>
        <div class="col-text">\${h.advance}</div>
      </div>
      <div class="col-box">
        <div class="col-label tag-context">🌐 Quién · Contexto</div>
        <div class="col-text">\${h.context}</div>
      </div>
      <div class="col-box">
        <div class="col-label tag-limit">🔁 Límites</div>
        <div class="col-text"><strong style="color:var(--green)">Superó:</strong> \${h.superado}<br><br><strong style="color:var(--red)">Impuso:</strong> \${h.impuso}</div>
      </div>
    </div>

    <button class="btn btn-main mt10" onclick="next()">
      \${isLast ? 'Ver reflexión final →' : \`Siguiente hito →\`}
    </button>
  \`);
}

// ── REFLEXION ──
function renderReflexion() {
  setCard(\`
    <div class="intro-eyebrow">Reflexión Final</div>
    <div class="reflexion-title">¿QUÉ PATRÓN VES?</div>
    <div class="reflexion-body">
      A lo largo de los 7 hitos observamos un patrón consistente: <strong>cada solución tecnológica crea el problema que motiva la siguiente.</strong> Pascal resolvió el cálculo manual → Babbage quiso generalizar → el ENIAC lo realizó en electrónico pero con fragilidad → el transistor eliminó esa fragilidad → el chip integró miles de transistores → el microprocesador los puso en un solo chip → la computación cuántica intenta ir más allá de los bits clásicos.
    </div>
    <div class="quote-box">
      "Cada paradigma tecnológico lleva en sí mismo el germen de su propia obsolescencia."
    </div>
    <div class="reflexion-title" style="font-size:1.4rem;margin-bottom:8px;">¿APLICA LA LEY DE MOORE?</div>
    <div class="reflexion-body">
      La Ley de Moore —transistores por chip se duplican ~cada 2 años— describió con precisión la evolución de 1965 a ~2015. Sin embargo, <strong>hoy se está desacelerando</strong>: los transistores alcanzan límites físicos cuánticos a escalas de 2-3 nm. La computación cuántica no sigue la Ley de Moore clásica; su métrica es la calidad del cúbit y la corrección de errores, no solo la cantidad. El patrón real es más amplio: <em>cada era tecnológica es exponencial hasta chocar con una barrera física o de complejidad, y entonces nace un nuevo paradigma.</em>
    </div>
    <button class="btn btn-main" onclick="next()">Ir a la evaluación →</button>
  \`);
}

// ── QUESTION ──
function renderQuestion(i) {
  const q = QUESTIONS[i];
  const keys = ['A','B','C','D'];
  const opts = q.opts.map((o,idx)=>
    \`<div class="opt" data-i="\${idx}" onclick="pickOpt(this,\${i},\${idx})">
      <div class="opt-key">\${keys[idx]}</div>\${o}
    </div>\`
  ).join('');
  const isLast = i === QUESTIONS.length-1;
  setCard(\`
    <div class="q-eyebrow">Pregunta \${i+1} de \${QUESTIONS.length}</div>
    <div class="q-title">\${q.q}</div>
    <div class="q-type">\${q.type}</div>
    <div class="options" id="opts\${i}">\${opts}</div>
    <div class="fb" id="fb\${i}"></div>
    <button class="btn btn-main mt14" id="qbtn\${i}" style="display:none" onclick="next()">
      \${isLast ? 'Ver resultados →' : 'Siguiente pregunta →'}
    </button>
  \`);
}

window.pickOpt = function(el, qi, idx) {
  const q = QUESTIONS[qi];
  document.querySelectorAll(\`#opts\${qi} .opt\`).forEach(o=>o.classList.add('disabled'));
  document.querySelectorAll(\`#opts\${qi} .opt\`).forEach(o=>{
    if(parseInt(o.dataset.i)===q.ans) o.classList.add('ok');
  });
  const correct = idx === q.ans;
  if(!correct) el.classList.add('bad');
  userAns.push(correct);
  const fb = document.getElementById(\`fb\${qi}\`);
  fb.className = \`fb show \${correct?'ok':'bad'}\`;
  fb.textContent = correct ? q.ok : q.fail;
  document.getElementById(\`qbtn\${qi}\`).style.display = 'flex';
};

// ── RESULT ──
function renderResult() {
  const score = userAns.filter(Boolean).length;
  const p = Math.round(score/QUESTIONS.length*100);
  const lvls = [
    {e:'📖', t:'Sigue estudiando', m:'Revisa cada hito con cuidado. Los detalles del texto y el razonamiento por comprensión son clave. ¡Puedes intentarlo de nuevo!'},
    {e:'👍', t:'Buen avance', m:'Comprendiste una parte importante. Repasa los hitos donde vacilaste y vuelve a la evaluación.'},
    {e:'🌟', t:'¡Casi perfecto!', m:'Gran dominio del contenido. Revisa la pregunta donde fallaste y alcanzarás el 100%.'},
    {e:'🏆', t:'¡Dominio total!', m:'Excelente comprensión histórica y analítica de la evolución del cómputo. Razonamiento sobresaliente.'},
  ];
  const lvl = score===0?0:score===1?1:score===2?2:3;
  const lv = lvls[lvl];
  const rows = QUESTIONS.map((q,i)=>
    \`<div class="rl-row"><span>\${userAns[i]?'✅':'❌'}</span><span>\${q.q.length>60?q.q.slice(0,60)+'…':q.q}</span></div>\`
  ).join('');

  setCard(\`
    <div class="result-hero">
      <span class="result-badge">\${lv.e}</span>
      <div class="result-ring" style="--pct:\${p}">
        <div class="result-score">\${score}/\${QUESTIONS.length}</div>
      </div>
      <div class="result-title">\${lv.t}</div>
      <div class="result-msg">\${lv.m}</div>
    </div>
    <div class="result-list">\${rows}</div>
    <div class="btn-row">
      <button class="btn btn-dim" onclick="restart()">↩ Reiniciar todo</button>
      <button class="btn btn-main" onclick="retryQ()">Repetir preguntas</button>
    </div>
  \`);

  // Notificar al entorno de React
  if (score === QUESTIONS.length) {
    window.parent.postMessage({ type: 'QUIZ_SUCCESS' }, '*');
  } else {
    window.parent.postMessage({ type: 'QUIZ_FAIL' }, '*');
  }
}

window.restart = function() {
  step=0; userAns.length=0;
  updateProgress(); renderIntro();
};
window.retryQ = function() {
  userAns.length=0;
  step = HITOS.length+2;
  updateProgress(); render();
};

// ── INIT ──
updateProgress();
renderIntro();
</script>
</body>
</html>
  `;

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '620px', borderRadius: '0 0 2rem 2rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <iframe 
        srcDoc={htmlContent} 
        style={{ width: '100%', height: '100%', flex: 1, border: 'none' }} 
        title="Evolución del Cómputo"
      />
    </div>
  );
}
