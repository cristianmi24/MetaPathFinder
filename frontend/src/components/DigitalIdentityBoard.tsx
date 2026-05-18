import React, { useEffect } from 'react';

interface DigitalIdentityBoardProps {
  challengeId?: string;
  onValidation?: (success: boolean) => void;
}

export function DigitalIdentityBoard({ challengeId, onValidation }: DigitalIdentityBoardProps) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'EVAL_SUCCESS' && onValidation) {
        onValidation(true);
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
<title>Diseño de logos SVG</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.36.0/tabler-icons.min.css">
<style>
:root {
  --font-sans: 'Space Grotesk', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --color-background-primary: #ffffff;
  --color-background-secondary: #f9f9fb;
  --color-background-info: #eef6ff;
  --color-background-success: #edfcf5;
  --color-background-danger: #fef2f2;
  --color-border-secondary: #e5e7eb;
  --color-border-tertiary: #f3f4f6;
  --color-border-success: #a7f3d0;
  --color-text-primary: #111827;
  --color-text-secondary: #4b5563;
  --color-text-tertiary: #9ca3af;
  --color-text-info: #0369a1;
  --color-text-success: #047857;
  --color-text-danger: #b91c1c;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font-sans)}
.module{max-width:680px;padding:1.5rem 0;margin:0 auto;}
.phase{display:none}
.phase.active{display:block}
.step-intro{background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-lg);padding:1.25rem;margin-bottom:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.05)}
.step-intro h3{font-size:15px;font-weight:500;color:var(--color-text-primary);margin-bottom:.5rem;display:flex;align-items:center;gap:6px;}
.step-intro p{font-size:13px;color:var(--color-text-secondary);line-height:1.6}
.code-block{background:#1e1e2e;border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-md);padding:1rem;font-family:var(--font-mono);font-size:12px;color:#cdd6f4;margin:.75rem 0;overflow-x:auto;white-space:pre}
.svg-demo{display:flex;justify-content:center;align-items:center;padding:1.25rem;background:var(--color-background-secondary);border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-md);margin:.75rem 0}
.color-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin:.75rem 0}
.color-swatch{height:36px;border-radius:6px;cursor:pointer;border:2px solid transparent;transition:transform .15s}
.color-swatch:hover,.color-swatch.selected{transform:scale(1.1);border-color:var(--color-text-primary)}
.tip{background:var(--color-background-info);border-left:3px solid #378ADD;border-radius:0 var(--border-radius-md) var(--border-radius-md) 0;padding:.75rem 1rem;font-size:13px;color:var(--color-text-info);margin:.75rem 0}
.section-title{font-size:18px;font-weight:500;color:var(--color-text-primary);margin-bottom:.25rem}
.section-sub{font-size:13px;color:var(--color-text-secondary);margin-bottom:1.25rem}
.progress-bar{height:4px;background:var(--color-background-secondary);border-radius:2px;margin-bottom:1.5rem;overflow:hidden}
.progress-fill{height:100%;background:#7F77DD;border-radius:2px;transition:width .4s ease}
.phase-tabs{display:flex;gap:6px;margin-bottom:1.5rem;flex-wrap:wrap}
.phase-tab{padding:6px 14px;border-radius:var(--border-radius-md);border:0.5px solid var(--color-border-secondary);font-size:12px;cursor:pointer;background:var(--color-background-secondary);color:var(--color-text-secondary);transition:all .15s}
.phase-tab.active{background:#EEEDFE;color:#533AB7;border-color:#7F77DD;font-weight:600}
.phase-tab.done{background:var(--color-background-success);color:var(--color-text-success);border-color:var(--color-border-success)}
.eval-section{margin-top:1.5rem}
.eval-title{font-size:16px;font-weight:500;margin-bottom:1rem;color:var(--color-text-primary);display:flex;align-items:center;gap:6px;}
.blocks-container{min-height:100px;border:1.5px dashed var(--color-border-secondary);border-radius:var(--border-radius-lg);padding:1rem;display:flex;flex-direction:column;gap:8px;background:var(--color-background-secondary)}
.block{background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-md);padding:.75rem 1rem;font-size:13px;color:var(--color-text-primary);cursor:grab;display:flex;align-items:center;gap:10px;user-select:none;transition:box-shadow .15s;box-shadow:0 1px 2px rgba(0,0,0,0.05)}
.block:active{cursor:grabbing;box-shadow:0 4px 12px rgba(0,0,0,.12)}
.block.dragging{opacity:.4}
.block .drag-handle{color:var(--color-text-tertiary);font-size:16px}
.block .block-num{width:24px;height:24px;border-radius:50%;background:#EEEDFE;color:#534AB7;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.block.correct .block-num{background:var(--color-background-success);color:var(--color-text-success)}
.block.incorrect .block-num{background:var(--color-background-danger);color:var(--color-text-danger)}
.check-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 20px;border-radius:var(--border-radius-md);border:0.5px solid var(--color-border-secondary);background:var(--color-background-primary);color:var(--color-text-primary);font-size:13px;cursor:pointer;margin-top:1rem;font-weight:500}
.check-btn:hover{background:var(--color-background-secondary)}
.result-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--border-radius-md);font-size:13px;margin-top:1rem;font-weight:500}
.result-ok{background:var(--color-background-success);color:var(--color-text-success);border:1px solid var(--color-border-success)}
.result-fail{background:var(--color-background-danger);color:var(--color-text-danger);border:1px solid #fecaca}
.nav-btns{display:flex;gap:10px;margin-top:1.5rem}
.btn-next{padding:8px 20px;border-radius:var(--border-radius-md);border:0.5px solid #7F77DD;background:#EEEDFE;color:#534AB7;font-size:13px;cursor:pointer;font-weight:600}
.btn-next:hover{background:#CECBF6}
.btn-back{padding:8px 20px;border-radius:var(--border-radius-md);border:0.5px solid var(--color-border-secondary);background:var(--color-background-primary);color:var(--color-text-secondary);font-size:13px;cursor:pointer}
.live-svg-area{border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-md);overflow:hidden;margin:.75rem 0}
.live-editor{display:grid;grid-template-columns:1fr 1fr;gap:0}
.editor-pane{padding:.75rem;background:var(--color-background-secondary);border-right:0.5px solid var(--color-border-tertiary)}
.editor-pane textarea{width:100%;height:160px;font-family:var(--font-mono);font-size:12px;border:0.5px solid var(--color-border-tertiary);border-radius:6px;padding:.5rem;background:#1e1e2e;color:#cdd6f4;resize:none;outline:none}
.preview-pane{display:flex;align-items:center;justify-content:center;background:white;padding:1rem;min-height:160px}
.color-interactive{margin:.75rem 0}
.color-row{display:flex;align-items:center;gap:10px;margin-bottom:.5rem}
.color-row label{font-size:12px;color:var(--color-text-secondary);width:90px;font-weight:500}
.color-row input[type=color]{width:36px;height:28px;border:0.5px solid var(--color-border-tertiary);border-radius:4px;padding:2px;cursor:pointer;background:none}
.color-row input[type=range]{flex:1;accent-color:#7F77DD}
.color-row .val{font-size:11px;font-family:var(--font-mono);color:var(--color-text-secondary);width:48px}
.score-display{background:var(--color-background-secondary);border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-lg);padding:1.25rem;text-align:center;margin-top:1rem}
.score-num{font-size:36px;font-weight:600;color:#534AB7}
.medal{font-size:48px;margin-bottom:.5rem}
.drag-source{min-height:60px;border:1.5px dashed var(--color-border-tertiary);border-radius:var(--border-radius-lg);padding:.75rem;display:flex;flex-wrap:wrap;gap:8px;margin-bottom:1rem;background:var(--color-background-primary)}
</style>
</head>
<body>
<h2 class="sr-only" style="display:none">Módulo interactivo: diseño de logos y estructuras en SVG</h2>
<div class="module">
  <div class="progress-bar"><div class="progress-fill" id="pbar" style="width:20%"></div></div>
  <div class="phase-tabs">
    <div class="phase-tab active" id="tab0" onclick="goPhase(0)">1. Estructura SVG</div>
    <div class="phase-tab" id="tab1" onclick="goPhase(1)">2. Paleta de colores</div>
    <div class="phase-tab" id="tab2" onclick="goPhase(2)">3. Diseño de logo</div>
    <div class="phase-tab" id="tab3" onclick="goPhase(3)">4. Evaluación</div>
    <div class="phase-tab" id="tab4" onclick="goPhase(4)">5. Resultado</div>
  </div>

  <!-- PHASE 0: Estructura SVG -->
  <div class="phase active" id="phase0">
    <div class="section-title">Anatomía de un SVG</div>
    <div class="section-sub">Aprende las etiquetas y atributos fundamentales antes de diseñar.</div>
    <div class="step-intro">
      <h3><i class="ti ti-code" aria-hidden="true"></i> Contenedor SVG</h3>
      <p>Todo logo SVG comienza con la etiqueta <strong>svg</strong>. El atributo <strong>viewBox</strong> define el sistema de coordenadas interno — es lo que permite que el SVG sea escalable sin perder calidad.</p>
    </div>
    <div class="code-block">&lt;svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"&gt;
  &lt;!-- tus formas aquí --&gt;
&lt;/svg&gt;</div>
    <div class="step-intro">
      <h3><i class="ti ti-shapes" aria-hidden="true"></i> Formas primitivas</h3>
      <p>SVG ofrece formas base que se combinan para crear logos complejos. Cada forma tiene sus propios atributos de posición y tamaño.</p>
    </div>
    <div class="svg-demo">
      <svg viewBox="0 0 220 60" width="320" height="88" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="10" width="40" height="40" rx="4" fill="#EEEDFE" stroke="#7F77DD" stroke-width="1.5"/>
        <circle cx="75" cy="30" r="20" fill="#E1F5EE" stroke="#1D9E75" stroke-width="1.5"/>
        <polygon points="125,10 145,50 105,50" fill="#FAECE7" stroke="#D85A30" stroke-width="1.5"/>
        <ellipse cx="185" cy="30" rx="28" ry="16" fill="#E6F1FB" stroke="#378ADD" stroke-width="1.5"/>
        <text x="25" y="62" font-size="8" fill="#534AB7" text-anchor="middle" font-family="sans-serif">rect</text>
        <text x="75" y="62" font-size="8" fill="#0F6E56" text-anchor="middle" font-family="sans-serif">circle</text>
        <text x="125" y="62" font-size="8" fill="#993C1D" text-anchor="middle" font-family="sans-serif">polygon</text>
        <text x="185" y="62" font-size="8" fill="#185FA5" text-anchor="middle" font-family="sans-serif">ellipse</text>
      </svg>
    </div>
    <div class="code-block">&lt;rect x="10" y="10" width="80" height="80" rx="8"/&gt;
&lt;circle cx="50" cy="50" r="30"/&gt;
&lt;polygon points="50,10 90,90 10,90"/&gt;
&lt;ellipse cx="50" cy="50" rx="40" ry="20"/&gt;</div>
    <div class="step-intro">
      <h3><i class="ti ti-stack-2" aria-hidden="true"></i> Agrupaciones y transformaciones</h3>
      <p>Usa <strong>&lt;g&gt;</strong> para agrupar formas y aplicarles transformaciones juntas. Es fundamental para logos compuestos.</p>
    </div>
    <div class="code-block">&lt;g transform="translate(50,50) rotate(45)"&gt;
  &lt;rect x="-20" y="-20" width="40" height="40" rx="4"/&gt;
  &lt;text x="0" y="6" text-anchor="middle" font-size="12"&gt;A&lt;/text&gt;
&lt;/g&gt;</div>
    <div class="tip"><i class="ti ti-bulb" aria-hidden="true"></i> <strong>Tip:</strong> el atributo <strong>rx</strong> en un &lt;rect&gt; redondea las esquinas — perfecto para íconos de apps.</div>
    <div class="nav-btns">
      <button class="btn-next" onclick="goPhase(1)">Siguiente: Paleta de colores <i class="ti ti-arrow-right" aria-hidden="true"></i></button>
    </div>
  </div>

  <!-- PHASE 1: Paleta de colores -->
  <div class="phase" id="phase1">
    <div class="section-title">La paleta de colores en SVG</div>
    <div class="section-sub">Domina fill, stroke, opacity y gradientes básicos.</div>
    <div class="step-intro">
      <h3><i class="ti ti-palette" aria-hidden="true"></i> Fill y Stroke</h3>
      <p><strong>fill</strong> es el color de relleno de una forma. <strong>stroke</strong> es el color del borde. <strong>stroke-width</strong> controla el grosor. Puedes usar nombres, hexadecimal, rgb() o hsl().</p>
    </div>
    <div class="live-editor live-svg-area">
      <div class="editor-pane">
        <p style="font-size:11px;color:var(--color-text-secondary);margin-bottom:6px">Edita el código:</p>
        <textarea id="colorEditor" oninput="updatePreview()">&lt;circle cx="60" cy="60" r="45"
  fill="#7F77DD"
  stroke="#3C3489"
  stroke-width="3"
  opacity="0.9"/&gt;</textarea>
      </div>
      <div class="preview-pane"><svg id="colorPreview" viewBox="0 0 120 120" width="120" height="120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="45" fill="#7F77DD" stroke="#3C3489" stroke-width="3" opacity="0.9"/></svg></div>
    </div>
    <div class="step-intro">
      <h3><i class="ti ti-adjustments-horizontal" aria-hidden="true"></i> Control interactivo de color</h3>
      <p>Experimenta con los controles para ver cómo cambian los atributos de color en tiempo real.</p>
    </div>
    <div class="color-interactive">
      <div class="color-row">
        <label>Fill</label>
        <input type="color" id="cFill" value="#7F77DD" oninput="applyColor()">
        <span class="val" id="vFill">#7F77DD</span>
      </div>
      <div class="color-row">
        <label>Stroke</label>
        <input type="color" id="cStroke" value="#3C3489" oninput="applyColor()">
        <span class="val" id="vStroke">#3C3489</span>
      </div>
      <div class="color-row">
        <label>Opacidad</label>
        <input type="range" id="cOpacity" min="0" max="1" step="0.05" value="0.9" oninput="applyColor()">
        <span class="val" id="vOpacity">0.9</span>
      </div>
      <div class="color-row">
        <label>Stroke width</label>
        <input type="range" id="cStrokeW" min="0" max="10" step="0.5" value="3" oninput="applyColor()">
        <span class="val" id="vStrokeW">3</span>
      </div>
      <div style="display:flex;justify-content:center;margin-top:1rem">
        <svg id="liveCircle" viewBox="0 0 120 120" width="140" height="140" xmlns="http://www.w3.org/2000/svg">
          <circle id="demoShape" cx="60" cy="60" r="45" fill="#7F77DD" stroke="#3C3489" stroke-width="3" opacity="0.9"/>
        </svg>
      </div>
    </div>
    <div class="step-intro">
      <h3><i class="ti ti-layers-difference" aria-hidden="true"></i> Gradientes en SVG</h3>
      <p>Los gradientes se definen en <strong>&lt;defs&gt;</strong> y se referencian con <strong>url(#id)</strong>. Son esenciales para logos modernos.</p>
    </div>
    <div class="code-block">&lt;defs&gt;
  &lt;linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"&gt;
    &lt;stop offset="0%" stop-color="#7F77DD"/&gt;
    &lt;stop offset="100%" stop-color="#1D9E75"/&gt;
  &lt;/linearGradient&gt;
&lt;/defs&gt;
&lt;rect width="100" height="100" fill="url(#grad1)" rx="12"/&gt;</div>
    <div class="svg-demo">
      <svg viewBox="0 0 100 100" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7F77DD"/><stop offset="100%" stop-color="#1D9E75"/></linearGradient></defs>
        <rect width="100" height="100" fill="url(#g1)" rx="12"/>
        <text x="50" y="55" text-anchor="middle" font-size="14" fill="white" font-family="sans-serif" font-weight="bold">AB</text>
      </svg>
    </div>
    <div class="tip"><i class="ti ti-bulb" aria-hidden="true"></i> <strong>Tip:</strong> usa <strong>radialGradient</strong> para efectos de profundidad y brillo, ideal para logos con efecto 3D sutil.</div>
    <div class="nav-btns">
      <button class="btn-back" onclick="goPhase(0)"><i class="ti ti-arrow-left" aria-hidden="true"></i> Atrás</button>
      <button class="btn-next" onclick="goPhase(2)">Siguiente: Diseño de logo <i class="ti ti-arrow-right" aria-hidden="true"></i></button>
    </div>
  </div>

  <!-- PHASE 2: Diseño de logo -->
  <div class="phase" id="phase2">
    <div class="section-title">Construyendo un logo SVG</div>
    <div class="section-sub">Combina todo lo aprendido: formas, colores, texto y agrupaciones.</div>
    <div class="step-intro">
      <h3><i class="ti ti-grid-dots" aria-hidden="true"></i> Estructura de un logo profesional</h3>
      <p>Un logo bien construido en SVG sigue una estructura en capas: fondo → ícono/símbolo → texto → detalles. Esto facilita animaciones y variantes de color.</p>
    </div>
    <div class="code-block">&lt;svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"&gt;
  &lt;!-- Capa 1: Símbolo --&gt;
  &lt;g id="simbolo"&gt;
    &lt;rect x="5" y="10" width="60" height="60" rx="12"
      fill="#7F77DD"/&gt;
    &lt;polygon points="35,22 52,52 18,52"
      fill="white" opacity="0.9"/&gt;
  &lt;/g&gt;
  &lt;!-- Capa 2: Texto --&gt;
  &lt;g id="texto"&gt;
    &lt;text x="78" y="38" font-size="22"
      font-weight="bold" fill="#534AB7"
      font-family="sans-serif"&gt;MiMarca&lt;/text&gt;
    &lt;text x="78" y="56" font-size="11"
      fill="#888780" font-family="sans-serif"&gt;soluciones digitales&lt;/text&gt;
  &lt;/g&gt;
&lt;/svg&gt;</div>
    <div class="svg-demo">
      <svg viewBox="0 0 200 80" width="280" height="112" xmlns="http://www.w3.org/2000/svg">
        <g id="simbolo">
          <rect x="5" y="10" width="60" height="60" rx="12" fill="#7F77DD"/>
          <polygon points="35,22 52,52 18,52" fill="white" opacity="0.9"/>
        </g>
        <g id="texto">
          <text x="78" y="38" font-size="22" font-weight="bold" fill="#534AB7" font-family="sans-serif">MiMarca</text>
          <text x="78" y="56" font-size="11" fill="#888780" font-family="sans-serif">soluciones digitales</text>
        </g>
      </svg>
    </div>
    <div class="step-intro">
      <h3><i class="ti ti-adjustments" aria-hidden="true"></i> Ajusta tu logo</h3>
      <p>Modifica los colores del logo de ejemplo usando los controles.</p>
    </div>
    <div class="color-interactive">
      <div class="color-row"><label>Color principal</label><input type="color" id="lFill" value="#7F77DD" oninput="applyLogo()"><span class="val" id="lvFill">#7F77DD</span></div>
      <div class="color-row"><label>Color texto</label><input type="color" id="lText" value="#534AB7" oninput="applyLogo()"><span class="val" id="lvText">#534AB7</span></div>
      <div class="color-row"><label>Radio esquinas</label><input type="range" id="lRadius" min="0" max="30" step="1" value="12" oninput="applyLogo()"><span class="val" id="lvRadius">12</span></div>
    </div>
    <div style="display:flex;justify-content:center;padding:.5rem;border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-md);background:white;margin:.5rem 0">
      <svg id="logoDemo" viewBox="0 0 200 80" width="280" height="112" xmlns="http://www.w3.org/2000/svg">
        <rect id="logoRect" x="5" y="10" width="60" height="60" rx="12" fill="#7F77DD"/>
        <polygon points="35,22 52,52 18,52" fill="white" opacity="0.9"/>
        <text id="logoText1" x="78" y="38" font-size="22" font-weight="bold" fill="#534AB7" font-family="sans-serif">MiMarca</text>
        <text x="78" y="56" font-size="11" fill="#888780" font-family="sans-serif">soluciones digitales</text>
      </svg>
    </div>
    <div class="tip"><i class="ti ti-bulb" aria-hidden="true"></i> <strong>Tip:</strong> siempre define el <strong>viewBox</strong> con coordenadas desde 0,0. Evita usar <strong>width/height</strong> fijos en el SVG raíz — deja que CSS controle el tamaño real.</div>
    <div class="nav-btns">
      <button class="btn-back" onclick="goPhase(1)"><i class="ti ti-arrow-left" aria-hidden="true"></i> Atrás</button>
      <button class="btn-next" onclick="goPhase(3)">Ir a la evaluación <i class="ti ti-arrow-right" aria-hidden="true"></i></button>
    </div>
  </div>

  <!-- PHASE 3: Evaluación -->
  <div class="phase" id="phase3">
    <div class="section-title">Evaluación: Ordena los pasos</div>
    <div class="section-sub">Arrastra los bloques al orden correcto para crear un logo SVG profesional.</div>

    <div class="eval-section" id="evalA">
      <div class="eval-title"><i class="ti ti-drag-drop" aria-hidden="true"></i> Pregunta 1 — Orden de construcción</div>
      <p style="font-size:13px;color:var(--color-text-secondary);margin-bottom:1rem">Arrastra los bloques al área de respuesta en el orden correcto:</p>
      <div class="drag-source" id="sourceA"></div>
      <p style="font-size:12px;color:var(--color-text-tertiary);margin-bottom:.5rem">Tu respuesta (arrastra aquí):</p>
      <div class="blocks-container" id="dropA"></div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="check-btn" onclick="checkA()"><i class="ti ti-check" aria-hidden="true"></i> Verificar orden</button>
        <button class="check-btn" onclick="resetA()" style="color:var(--color-text-secondary)"><i class="ti ti-refresh" aria-hidden="true"></i> Reiniciar</button>
      </div>
      <div id="resultA"></div>
    </div>

    <div class="eval-section" style="margin-top:2rem" id="evalB">
      <div class="eval-title"><i class="ti ti-drag-drop" aria-hidden="true"></i> Pregunta 2 — Orden para aplicar colores</div>
      <p style="font-size:13px;color:var(--color-text-secondary);margin-bottom:1rem">¿Cuál es el flujo correcto al trabajar con colores en un SVG?</p>
      <div class="drag-source" id="sourceB"></div>
      <p style="font-size:12px;color:var(--color-text-tertiary);margin-bottom:.5rem">Tu respuesta:</p>
      <div class="blocks-container" id="dropB"></div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="check-btn" onclick="checkB()"><i class="ti ti-check" aria-hidden="true"></i> Verificar orden</button>
        <button class="check-btn" onclick="resetB()" style="color:var(--color-text-secondary)"><i class="ti ti-refresh" aria-hidden="true"></i> Reiniciar</button>
      </div>
      <div id="resultB"></div>
    </div>

    <div class="nav-btns">
      <button class="btn-back" onclick="goPhase(2)"><i class="ti ti-arrow-left" aria-hidden="true"></i> Atrás</button>
      <button class="btn-next" onclick="goPhase(4)">Ver resultado final <i class="ti ti-award" aria-hidden="true"></i></button>
    </div>
  </div>

  <!-- PHASE 4: Resultado -->
  <div class="phase" id="phase4">
    <div class="section-title">Resultado del módulo</div>
    <div class="section-sub">Tu desempeño en la evaluación de SVG y diseño de logos.</div>
    <div class="score-display" id="scoreDisplay">
      <div class="medal" id="medal">🏅</div>
      <div class="score-num" id="scoreNum">0 / 2</div>
      <p style="font-size:14px;color:var(--color-text-secondary);margin-top:.5rem" id="scoreMsg">Completa la evaluación para ver tu puntaje.</p>
    </div>
    <div style="margin-top:1.5rem" id="reviewArea"></div>
    <div class="nav-btns">
      <button class="btn-back" onclick="goPhase(3)"><i class="ti ti-arrow-left" aria-hidden="true"></i> Revisar evaluación</button>
      <button class="btn-next" onclick="window.parent.postMessage({ type: 'EVAL_SUCCESS' }, '*')">Finalizar y enviar <i class="ti ti-check"></i></button>
    </div>
  </div>
</div>

<script>
const stepsA = [
  {id:'a1', text:'Definir el viewBox y namespace del contenedor SVG'},
  {id:'a2', text:'Declarar gradientes y símbolos reutilizables en <defs>'},
  {id:'a3', text:'Dibujar la forma base del símbolo (rect, circle, polygon)'},
  {id:'a4', text:'Agregar formas interiores y detalles del ícono'},
  {id:'a5', text:'Incorporar el texto del nombre y eslogan'},
  {id:'a6', text:'Ajustar colores, opacidad y stroke finales'},
];
const correctA = ['a1','a2','a3','a4','a5','a6'];

const stepsB = [
  {id:'b1', text:'Definir la paleta de colores (hex o variables CSS)'},
  {id:'b2', text:'Crear gradientes en <defs> si se necesitan'},
  {id:'b3', text:'Aplicar fill y stroke a las formas principales'},
  {id:'b4', text:'Ajustar opacidad y stroke-width para jerarquía visual'},
  {id:'b5', text:'Verificar contraste y legibilidad en distintos fondos'},
];
const correctB = ['b1','b2','b3','b4','b5'];

let scoreA = false, scoreB = false;
let dragSrc = null;

function makeBlock(step, container) {
  const d = document.createElement('div');
  d.className = 'block';
  d.draggable = true;
  d.dataset.id = step.id;
  d.innerHTML = \`<i class="ti ti-grip-vertical drag-handle" aria-hidden="true"></i><span class="block-num">?</span><span>\${step.text}</span>\`;
  d.addEventListener('dragstart', e => {
    dragSrc = d;
    setTimeout(() => d.classList.add('dragging'), 0);
  });
  d.addEventListener('dragend', () => d.classList.remove('dragging'));
  container.appendChild(d);
}

function setupDrop(zone) {
  zone.addEventListener('dragover', e => { e.preventDefault(); });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    if (!dragSrc) return;
    const target = e.target.closest('.block');
    if (target && target !== dragSrc) {
      const kids = [...zone.children];
      const srcIdx = kids.indexOf(dragSrc);
      const tgtIdx = kids.indexOf(target);
      if (srcIdx > tgtIdx) zone.insertBefore(dragSrc, target);
      else zone.insertBefore(dragSrc, target.nextSibling);
    } else if (!target) {
      zone.appendChild(dragSrc);
    }
    dragSrc = null;
  });
}

function initEval() {
  const srcA = document.getElementById('sourceA');
  const dropA = document.getElementById('dropA');
  const srcB = document.getElementById('sourceB');
  const dropB = document.getElementById('dropB');
  const shuffledA = [...stepsA].sort(() => Math.random() - 0.5);
  const shuffledB = [...stepsB].sort(() => Math.random() - 0.5);
  shuffledA.forEach(s => makeBlock(s, srcA));
  shuffledB.forEach(s => makeBlock(s, srcB));
  [srcA, dropA, srcB, dropB].forEach(setupDrop);
}

function checkOrder(dropId, correct, resultId, isA) {
  const drop = document.getElementById(dropId);
  const blocks = [...drop.querySelectorAll('.block')];
  if (blocks.length === 0) {
    document.getElementById(resultId).innerHTML = \`<div class="result-badge result-fail"><i class="ti ti-x"></i> Arrastra los bloques al área de respuesta primero.</div>\`;
    return false;
  }
  const placed = blocks.map(b => b.dataset.id);
  let allCorrect = placed.length === correct.length;
  blocks.forEach((b, i) => {
    const num = b.querySelector('.block-num');
    b.classList.remove('correct','incorrect');
    if (placed[i] === correct[i]) { b.classList.add('correct'); num.textContent = '✓'; }
    else { b.classList.add('incorrect'); num.textContent = '✗'; allCorrect = false; }
  });
  const res = document.getElementById(resultId);
  if (allCorrect) {
    res.innerHTML = \`<div class="result-badge result-ok"><i class="ti ti-check"></i> ¡Orden correcto! Excelente comprensión del flujo SVG.</div>\`;
    if (isA) scoreA = true; else scoreB = true;
    updateScore();
    return true;
  } else {
    res.innerHTML = \`<div class="result-badge result-fail"><i class="ti ti-x"></i> Hay pasos fuera de lugar. Revisa el orden e intenta de nuevo.</div>\`;
    return false;
  }
}

window.checkA = function() { checkOrder('dropA', correctA, 'resultA', true); }
window.checkB = function() { checkOrder('dropB', correctB, 'resultB', false); }

function resetBlocks(srcId, dropId, steps) {
  const src = document.getElementById(srcId);
  const drop = document.getElementById(dropId);
  src.innerHTML = ''; drop.innerHTML = '';
  const shuffled = [...steps].sort(() => Math.random() - 0.5);
  shuffled.forEach(s => makeBlock(s, src));
}
window.resetA = function() { scoreA = false; resetBlocks('sourceA','dropA',stepsA); document.getElementById('resultA').innerHTML=''; updateScore(); }
window.resetB = function() { scoreB = false; resetBlocks('sourceB','dropB',stepsB); document.getElementById('resultB').innerHTML=''; updateScore(); }

function updateScore() {
  const total = (scoreA?1:0)+(scoreB?1:0);
  document.getElementById('scoreNum').textContent = total + ' / 2';
  const medals = ['😐','🏅','🏆'];
  const msgs = ['Sigue practicando. Revisa las lecciones y vuelve a intentarlo.','¡Bien! Dominaste un ejercicio. Completa el segundo para perfeccionar.','¡Excelente! Dominas el flujo de construcción SVG y el manejo de colores.'];
  document.getElementById('medal').textContent = medals[total];
  document.getElementById('scoreMsg').textContent = msgs[total];
  
  if (total === 2) {
    window.parent.postMessage({ type: 'EVAL_SUCCESS' }, '*');
  }

  const rev = document.getElementById('reviewArea');
  rev.innerHTML = \`
    <div class="step-intro"><h3>Repaso de respuestas correctas</h3>
    <p style="font-size:13px;color:var(--color-text-secondary);margin-bottom:.75rem">Orden correcto para construir un logo SVG:</p>
    \${correctA.map((id,i) => {
      const s = stepsA.find(x=>x.id===id);
      return \`<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px">
        <span style="min-width:20px;height:20px;border-radius:50%;background:#EEEDFE;color:#534AB7;font-size:11px;display:flex;align-items:center;justify-content:center;font-weight:500">\${i+1}</span>
        <span style="font-size:13px;color:var(--color-text-primary)">\${s.text}</span></div>\`;
    }).join('')}
    <p style="font-size:13px;color:var(--color-text-secondary);margin:1rem 0 .75rem">Orden correcto para aplicar colores:</p>
    \${correctB.map((id,i) => {
      const s = stepsB.find(x=>x.id===id);
      return \`<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px">
        <span style="min-width:20px;height:20px;border-radius:50%;background:#E1F5EE;color:#0F6E56;font-size:11px;display:flex;align-items:center;justify-content:center;font-weight:500">\${i+1}</span>
        <span style="font-size:13px;color:var(--color-text-primary)">\${s.text}</span></div>\`;
    }).join('')}
    </div>\`;
}

let currentPhase = 0;
const totalPhases = 5;
window.goPhase = function(n) {
  document.querySelectorAll('.phase').forEach((p,i) => p.classList.toggle('active', i===n));
  document.querySelectorAll('.phase-tab').forEach((t,i) => {
    t.classList.remove('active','done');
    if (i===n) t.classList.add('active');
    else if (i<n) t.classList.add('done');
  });
  currentPhase = n;
  document.getElementById('pbar').style.width = (((n+1)/totalPhases)*100)+'%';
  if (n===4) updateScore();
}

window.updatePreview = function() {
  const code = document.getElementById('colorEditor').value;
  const p = document.getElementById('colorPreview');
  try { p.innerHTML = code; } catch(e) {}
}

window.applyColor = function() {
  const fill = document.getElementById('cFill').value;
  const stroke = document.getElementById('cStroke').value;
  const op = document.getElementById('cOpacity').value;
  const sw = document.getElementById('cStrokeW').value;
  document.getElementById('demoShape').setAttribute('fill', fill);
  document.getElementById('demoShape').setAttribute('stroke', stroke);
  document.getElementById('demoShape').setAttribute('opacity', op);
  document.getElementById('demoShape').setAttribute('stroke-width', sw);
  document.getElementById('vFill').textContent = fill;
  document.getElementById('vStroke').textContent = stroke;
  document.getElementById('vOpacity').textContent = parseFloat(op).toFixed(2);
  document.getElementById('vStrokeW').textContent = parseFloat(sw).toFixed(1);
  const ed = document.getElementById('colorEditor');
  ed.value = \`<circle cx="60" cy="60" r="45"\\n  fill="\${fill}"\\n  stroke="\${stroke}"\\n  stroke-width="\${sw}"\\n  opacity="\${op}"/>\`;
}

window.applyLogo = function() {
  const fill = document.getElementById('lFill').value;
  const text = document.getElementById('lText').value;
  const rx = document.getElementById('lRadius').value;
  document.getElementById('logoRect').setAttribute('fill', fill);
  document.getElementById('logoRect').setAttribute('rx', rx);
  document.getElementById('logoText1').setAttribute('fill', text);
  document.getElementById('lvFill').textContent = fill;
  document.getElementById('lvText').textContent = text;
  document.getElementById('lvRadius').textContent = rx;
}

initEval();
updateScore();
</script>
</body>
</html>
  `;

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '620px', borderRadius: '0 0 2rem 2rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <iframe 
        srcDoc={htmlContent} 
        style={{ width: '100%', height: '100%', flex: 1, border: 'none' }} 
        title="Diseño de Identidad Digital SVG"
      />
    </div>
  );
}
