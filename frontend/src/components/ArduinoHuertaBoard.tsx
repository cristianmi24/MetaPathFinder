import React, { useEffect } from 'react';

interface ArduinoHuertaBoardProps {
  challengeId?: string;
  onValidation?: (success: boolean) => void;
}

export function ArduinoHuertaBoard({ challengeId, onValidation }: ArduinoHuertaBoardProps) {
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
<title>Huerta Escolar con Arduino</title>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.36.0/tabler-icons.min.css">
<style>
:root {
  --font-sans: 'Sora', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
  --color-background-primary: #ffffff;
  --color-background-secondary: #f9f9fb;
  --color-border-secondary: #e5e7eb;
  --color-border-tertiary: #f3f4f6;
  --color-text-primary: #111827;
  --color-text-secondary: #4b5563;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
}

.dark {
  --color-background-primary: #161b22;
  --color-background-secondary: #0d1117;
  --color-border-secondary: #30363d;
  --color-border-tertiary: #21262d;
  --color-text-primary: #c9d1d9;
  --color-text-secondary: #8b949e;
}

*{box-sizing:border-box;margin:0;padding:0}
.sr-only{position:absolute;left:-9999px}

body {
  font-family: var(--font-sans);
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  padding: 1.5rem;
}

.w{max-width:860px;margin:auto}

.step-nav{display:flex;align-items:center;gap:0;margin-bottom:1.5rem;overflow-x:auto;padding-bottom:4px}
.snav-item{display:flex;align-items:center;gap:0;flex-shrink:0}
.snav-btn{display:flex;align-items:center;gap:8px;padding:8px 14px;background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);cursor:pointer;font-size:12px;color:var(--color-text-secondary);transition:all .2s;white-space:nowrap; border-radius: 4px;}
.snav-btn.active{background:#EAF3DE;color:#27500A;border-color:#97C459;font-weight:500;z-index:1}
.snav-btn.done{background:#E6F1FB;color:#0C447C;border-color:#85B7EB}
.snav-btn.locked{opacity:0.45;cursor:not-allowed}
.snav-sep{width:1px;background:var(--color-border-tertiary);height:36px;flex-shrink:0}
.step-num{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:500;background:var(--color-background-secondary);color:var(--color-text-secondary);flex-shrink:0}
.snav-btn.active .step-num{background:#639922;color:#fff}
.snav-btn.done .step-num{background:#378ADD;color:#fff}

.page{display:none}
.page.active{display:block}

.guide-box{background:#EAF3DE;border:0.5px solid #97C459;border-radius:var(--border-radius-lg);padding:1rem 1.25rem;margin-bottom:1.25rem;display:flex;gap:12px;align-items:flex-start}
.guide-icon{font-size:22px;flex-shrink:0;margin-top:2px}
.guide-title{font-size:13px;font-weight:500;color:#27500A;margin-bottom:4px}
.guide-text{font-size:13px;color:#3B6D11;line-height:1.6}
.guide-text b{font-weight:500}

.warn-box{background:#FAEEDA;border:0.5px solid #FAC775;border-radius:var(--border-radius-lg);padding:1rem 1.25rem;margin-bottom:1.25rem;display:flex;gap:12px;align-items:flex-start}
.warn-title{font-size:13px;font-weight:500;color:#633806;margin-bottom:4px}
.warn-text{font-size:13px;color:#854F0B;line-height:1.6}

.card{background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-lg);padding:1.25rem;margin-bottom:1rem}
.card-title{font-size:14px;font-weight:500;color:var(--color-text-primary);margin-bottom:12px;display:flex;align-items:center;gap:8px}

.concept-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:1rem}
.concept-card{border-radius:var(--border-radius-md);padding:12px;border:0.5px solid var(--color-border-tertiary)}
.concept-card .cc-icon{font-size:20px;margin-bottom:6px}
.concept-card .cc-name{font-size:12px;font-weight:500;color:var(--color-text-primary);margin-bottom:4px}
.concept-card .cc-desc{font-size:11px;color:var(--color-text-secondary);line-height:1.5}

.step-list{list-style:none;padding:0}
.step-list li{display:flex;gap:12px;padding:10px 0;border-bottom:0.5px solid var(--color-border-tertiary);font-size:13px;color:var(--color-text-primary);line-height:1.5;align-items:flex-start}
.step-list li:last-child{border-bottom:none}
.step-list .sn{min-width:24px;height:24px;border-radius:50%;background:#E6F1FB;color:#185FA5;font-size:11px;font-weight:500;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}

.circuit-svg{width:100%;max-width:720px;display:block;margin:0 auto 1rem}

.editor-wrap{margin-bottom:1rem}
.editor-header{background:#1e1e2e;border-radius:var(--border-radius-lg) var(--border-radius-lg) 0 0;padding:9px 14px;display:flex;align-items:center;justify-content:space-between}
.e-dots{display:flex;gap:5px}
.e-dot{width:11px;height:11px;border-radius:50%}
.e-fname{font-size:11px;color:#89b4fa;font-family:var(--font-mono)}
.e-lang{font-size:10px;color:#6c7086}
.editor-body{background:#1e1e2e;border-radius:0 0 var(--border-radius-lg) var(--border-radius-lg)}
#code-ed{width:100%;min-height:360px;background:transparent;border:none;outline:none;font-family:var(--font-mono);font-size:12.5px;color:#cdd6f4;padding:14px;resize:vertical;line-height:1.75;tab-size:2}

.hint-section{margin-bottom:14px}
.hint-section-title{font-size:12px;font-weight:500;color:var(--color-text-secondary);margin-bottom:8px}
.hints-row{display:flex;flex-wrap:wrap;gap:6px}
.hpill{font-size:11px;padding:5px 12px;border-radius:20px;cursor:pointer;border:0.5px solid var(--color-border-secondary);background:var(--color-background-primary);color:var(--color-text-secondary);transition:all .2s;display:flex;align-items:center;gap:5px}
.hpill:hover{background:var(--color-background-secondary)}
.hpill.used{background:#EAF3DE;color:#3B6D11;border-color:#97C459}
#hint-reveal{display:none;background:var(--color-background-secondary);border-radius:var(--border-radius-md);padding:10px 14px;font-size:12px;font-family:var(--font-mono);color:var(--color-text-primary);border:0.5px solid var(--color-border-tertiary);margin-top:8px;line-height:1.7}

.btn-main{background:#639922;color:#fff;border:none;padding:10px 22px;border-radius:var(--border-radius-md);font-size:13px;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:all .2s}
.btn-main:hover{background:#3B6D11}
.btn-main:disabled{opacity:0.4;cursor:not-allowed}
.btn-sec{background:var(--color-background-primary);color:var(--color-text-primary);border:0.5px solid var(--color-border-secondary);padding:10px 18px;border-radius:var(--border-radius-md);font-size:13px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px}
.btn-sec:hover{background:var(--color-background-secondary)}
.btn-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}

.terminal{background:#11111b;border-radius:var(--border-radius-lg);padding:14px;font-family:var(--font-mono);font-size:12px;min-height:100px;max-height:200px;overflow-y:auto;border:0.5px solid #313244;margin-top:10px;display:none}
.tl{margin-bottom:3px;display:flex;gap:8px}
.ttime{color:#89b4fa}.tok{color:#a6e3a1}.twarn{color:#f38ba8}.tinfo{color:#fab387}

.score-wrap{display:none;margin-top:1rem}
.score-card{background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-lg);padding:1.5rem;text-align:center}
.score-ring{width:86px;height:86px;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:500}
.ring-pass{background:#EAF3DE;color:#27500A;border:3px solid #639922}
.ring-warn{background:#FAEEDA;color:#633806;border:3px solid #EF9F27}
.ring-fail{background:#FCEBEB;color:#791F1F;border:3px solid #E24B4A}
.crit-row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:0.5px solid var(--color-border-tertiary);font-size:13px;text-align:left}
.crit-row:last-child{border-bottom:none}

.sim-card{background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-lg);padding:1.25rem;margin-bottom:1rem}
.sensor-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.sv-card{background:var(--color-background-secondary);border-radius:var(--border-radius-md);padding:12px;border:0.5px solid var(--color-border-tertiary)}
.sv-label{font-size:11px;color:var(--color-text-secondary);margin-bottom:5px;display:flex;align-items:center;gap:5px}
.sv-val{font-size:22px;font-weight:500;color:var(--color-text-primary)}
.sv-unit{font-size:12px;color:var(--color-text-secondary);font-weight:400}
.pbar{height:5px;background:var(--color-background-secondary);border-radius:3px;overflow:hidden;margin-top:6px;border:0.5px solid var(--color-border-tertiary)}
.pfill{height:100%;border-radius:3px;transition:width .4s}
.pump-row{display:flex;align-items:center;gap:10px;background:var(--color-background-secondary);border-radius:var(--border-radius-md);padding:10px 14px;border:0.5px solid var(--color-border-tertiary)}
.pdot{width:12px;height:12px;border-radius:50%;background:#E24B4A;transition:all .4s;flex-shrink:0}
.pdot.on{background:#639922}
.csv-log{background:#11111b;border-radius:var(--border-radius-md);padding:10px;font-family:var(--font-mono);font-size:11px;max-height:110px;overflow-y:auto;margin-top:8px}
.csv-hdr{color:#a6e3a1;margin-bottom:5px;padding-bottom:5px;border-bottom:0.5px solid #313244}
.csv-r{color:#cdd6f4;margin-bottom:2px}
.sl-row{display:flex;align-items:center;gap:12px;margin-bottom:8px}
.sl-label{font-size:12px;color:var(--color-text-secondary);min-width:100px}
.sl-val{font-size:12px;font-weight:500;color:var(--color-text-primary);min-width:36px;font-family:var(--font-mono)}
input[type=range]{flex:1;accent-color:#639922}

.lcd-screen{font-family:var(--font-mono);font-size:13px;color:#a6e3a1;background:#1a1a1a;padding:8px 12px;border-radius:4px;letter-spacing:0.5px;margin-top:8px}

.rubric-tbl{width:100%;border-collapse:collapse;font-size:13px}
.rubric-tbl th{text-align:left;padding:8px 10px;font-size:11px;font-weight:500;color:var(--color-text-secondary);border-bottom:0.5px solid var(--color-border-tertiary)}
.rubric-tbl td{padding:8px 10px;border-bottom:0.5px solid var(--color-border-tertiary);color:var(--color-text-primary);vertical-align:top}
.rubric-tbl tr:last-child td{border-bottom:none}
.pts-pill{font-size:11px;background:#E6F1FB;color:#185FA5;padding:2px 8px;border-radius:20px;white-space:nowrap}

.progress-overall{height:6px;background:var(--color-background-secondary);border-radius:4px;overflow:hidden;margin-bottom:1.5rem;border:0.5px solid var(--color-border-tertiary)}
.progress-fill-overall{height:100%;background:#639922;border-radius:4px;transition:width .5s}
.progress-label{font-size:11px;color:var(--color-text-secondary);margin-bottom:6px;display:flex;justify-content:space-between}

.next-hint{background:#E6F1FB;border:0.5px solid #85B7EB;border-radius:var(--border-radius-md);padding:8px 14px;font-size:12px;color:#185FA5;margin-top:12px;display:flex;align-items:center;gap:8px}
</style>
</head>
<body>
<div class="w">
<h2 class="sr-only">Módulo de evaluación paso a paso: Sistema de monitoreo para huerta escolar con Arduino</h2>

<div style="margin-bottom:1rem">
  <div class="progress-label">
    <span>Tu progreso en este módulo</span>
    <span id="prog-pct">0 de 4 pasos completados</span>
  </div>
  <div class="progress-overall"><div class="progress-fill-overall" id="prog-bar" style="width:0%"></div></div>
</div>

<div class="step-nav" id="step-nav">
  <div class="snav-item">
    <button class="snav-btn active" onclick="goStep(0)" id="nav0">
      <span class="step-num">1</span> ¿Qué vamos a hacer?
    </button>
  </div>
  <div class="snav-sep"></div>
  <div class="snav-item">
    <button class="snav-btn locked" onclick="goStep(1)" id="nav1">
      <span class="step-num">2</span> El circuito
    </button>
  </div>
  <div class="snav-sep"></div>
  <div class="snav-item">
    <button class="snav-btn locked" onclick="goStep(2)" id="nav2">
      <span class="step-num">3</span> Escribe el código
    </button>
  </div>
  <div class="snav-sep"></div>
  <div class="snav-item">
    <button class="snav-btn locked" onclick="goStep(3)" id="nav3">
      <span class="step-num">4</span> Prueba y calificación
    </button>
  </div>
</div>

<div id="page0" class="page active">
  <div class="guide-box">
    <div class="guide-icon">👋</div>
    <div>
      <div class="guide-title">¡Bienvenido! Lee esto antes de comenzar</div>
      <div class="guide-text">Este módulo te guía <b>paso a paso</b> para construir un sistema de riego automático para la huerta escolar. No necesitas saber todo de antemano — cada sección te explica lo que necesitas saber justo antes de hacerlo.<br><br>Sigue el orden: <b>Paso 1 → 2 → 3 → 4.</b> No puedes saltar pasos hasta completar el anterior.</div>
    </div>
  </div>

  <div class="card">
    <div class="card-title"><i class="ti ti-device-tv" aria-hidden="true"></i> ¿Qué va a hacer nuestro sistema?</div>
    <ul class="step-list">
      <li><span class="sn">1</span> Medir la <b>humedad del suelo</b> con un sensor — si la tierra está muy seca, activa el riego.</li>
      <li><span class="sn">2</span> Medir la <b>temperatura del ambiente</b> para registrarla.</li>
      <li><span class="sn">3</span> <b>Encender una bomba de agua</b> automáticamente cuando la humedad baje del 40%.</li>
      <li><span class="sn">4</span> Mostrar el estado en una <b>pantalla LCD</b> o en el monitor serial.</li>
      <li><span class="sn">5</span> Guardar las lecturas cada 5 minutos en <b>formato CSV</b> (como una hoja de cálculo).</li>
    </ul>
  </div>

  <div class="card">
    <div class="card-title"><i class="ti ti-book" aria-hidden="true"></i> Conceptos clave — léelos antes de continuar</div>
    <div class="concept-grid">
      <div class="concept-card" style="background:#EAF3DE;border-color:#97C459">
        <div class="cc-icon">💧</div>
        <div class="cc-name" style="color:#27500A">Sensor de humedad</div>
        <div class="cc-desc" style="color:#3B6D11">Mide qué tan húmeda está la tierra. Devuelve un número entre 0 y 1023. Nosotros lo convertimos a porcentaje (0%–100%).</div>
      </div>
      <div class="concept-card" style="background:#FAEEDA;border-color:#FAC775">
        <div class="cc-icon">🌡️</div>
        <div class="cc-name" style="color:#633806">Sensor de temperatura</div>
        <div class="cc-desc" style="color:#854F0B">Mide el calor del ambiente. El LM35 devuelve voltaje: 10mV por cada grado centígrado.</div>
      </div>
      <div class="concept-card" style="background:#FAECE7;border-color:#F0997B">
        <div class="cc-icon">⚡</div>
        <div class="cc-name" style="color:#4A1B0C">Relay (interruptor)</div>
        <div class="cc-desc" style="color:#712B13">Es como un interruptor eléctrico controlado por Arduino. HIGH = encender bomba, LOW = apagar bomba.</div>
      </div>
      <div class="concept-card" style="background:#EEEDFE;border-color:#AFA9EC">
        <div class="cc-icon">📺</div>
        <div class="cc-name" style="color:#26215C">LCD 16x2</div>
        <div class="cc-desc" style="color:#3C3489">Pantalla que muestra 2 filas de 16 caracteres. Usa I2C: solo 2 cables de datos (SDA y SCL).</div>
      </div>
      <div class="concept-card" style="background:#E6F1FB;border-color:#85B7EB">
        <div class="cc-icon">📊</div>
        <div class="cc-name" style="color:#042C53">Formato CSV</div>
        <div class="cc-desc" style="color:#0C447C">Datos separados por comas. Ejemplo: 300000,55,24.3,0 — así los puede abrir Excel o Google Sheets.</div>
      </div>
      <div class="concept-card" style="background:#F1EFE8;border-color:#B4B2A9">
        <div class="cc-icon">⏱️</div>
        <div class="cc-name" style="color:#2C2C2A">millis()</div>
        <div class="cc-desc" style="color:#5F5E5A">Función de Arduino que cuenta milisegundos desde que encendió. Úsala para medir tiempo sin pausar el programa.</div>
      </div>
    </div>
  </div>

  <div class="warn-box">
    <div class="guide-icon" style="font-size:18px">⚠️</div>
    <div>
      <div class="warn-title">Antes de continuar, confirma que entendiste</div>
      <div class="warn-text">¿Sabes qué hace el sensor de humedad? ¿Entiendes para qué sirve el relay? Si algo no quedó claro, vuelve a leer los conceptos arriba. Cuando te sientas listo, haz clic en el botón.</div>
    </div>
  </div>

  <div class="btn-row">
    <button class="btn-main" onclick="completeStep(0)"><i class="ti ti-check" aria-hidden="true"></i> Entendido, ir al circuito →</button>
  </div>
</div>

<div id="page1" class="page">
  <div class="guide-box">
    <div class="guide-icon">🔌</div>
    <div>
      <div class="guide-title">Paso 2 de 4 — El circuito</div>
      <div class="guide-text">Aquí verás cómo conectar todos los componentes al Arduino. <b>Estudia el diagrama</b>, luego revisa la tabla de pines. Cuando termines, confirma que entendiste para desbloquear el editor de código.</div>
    </div>
  </div>

  <div class="card">
    <div class="card-title"><i class="ti ti-topology-ring" aria-hidden="true"></i> Diagrama de conexiones</div>
    <svg class="circuit-svg" viewBox="0 0 720 290" xmlns="http://www.w3.org/2000/svg">
      <rect x="270" y="95" width="180" height="100" rx="6" fill="#EAF3DE" stroke="#639922" stroke-width="1.5"/>
      <text x="360" y="116" text-anchor="middle" font-size="11" font-weight="500" fill="#27500A">ARDUINO UNO</text>
      <text x="285" y="142" font-size="9" fill="#3B6D11" font-family="monospace">A0 ← humedad</text>
      <text x="285" y="156" font-size="9" fill="#3B6D11" font-family="monospace">A1 ← temperatura</text>
      <text x="285" y="170" font-size="9" fill="#3B6D11" font-family="monospace">D7 → relay</text>
      <text x="415" y="142" font-size="9" fill="#3B6D11" font-family="monospace">A4 SDA →</text>
      <text x="415" y="156" font-size="9" fill="#3B6D11" font-family="monospace">A5 SCL →</text>
      <text x="415" y="170" font-size="9" fill="#3B6D11" font-family="monospace">TX → CSV</text>

      <rect x="30" y="80" width="130" height="50" rx="4" fill="#E6F1FB" stroke="#378ADD" stroke-width="1"/>
      <text x="95" y="100" text-anchor="middle" font-size="10" font-weight="500" fill="#0C447C">Sensor humedad</text>
      <text x="95" y="114" text-anchor="middle" font-size="9" fill="#185FA5">OUT → pin A0</text>
      <text x="95" y="126" text-anchor="middle" font-size="9" fill="#185FA5">VCC=5V  GND=GND</text>
      <line x1="160" y1="105" x2="270" y2="140" stroke="#378ADD" stroke-width="1.2" stroke-dasharray="4,2"/>
      <circle cx="160" cy="105" r="3" fill="#378ADD"/>

      <rect x="30" y="162" width="130" height="50" rx="4" fill="#FAEEDA" stroke="#EF9F27" stroke-width="1"/>
      <text x="95" y="182" text-anchor="middle" font-size="10" font-weight="500" fill="#633806">Sensor temp LM35</text>
      <text x="95" y="196" text-anchor="middle" font-size="9" fill="#854F0B">OUT → pin A1</text>
      <text x="95" y="208" text-anchor="middle" font-size="9" fill="#854F0B">VCC=5V  GND=GND</text>
      <line x1="160" y1="187" x2="270" y2="160" stroke="#EF9F27" stroke-width="1.2" stroke-dasharray="4,2"/>
      <circle cx="160" cy="187" r="3" fill="#EF9F27"/>

      <rect x="560" y="80" width="130" height="50" rx="4" fill="#FAECE7" stroke="#D85A30" stroke-width="1"/>
      <text x="625" y="100" text-anchor="middle" font-size="10" font-weight="500" fill="#4A1B0C">Relay + Bomba</text>
      <text x="625" y="114" text-anchor="middle" font-size="9" fill="#993C1D">IN ← pin D7</text>
      <text x="625" y="126" text-anchor="middle" font-size="9" fill="#993C1D">VCC=5V  GND=GND</text>
      <line x1="450" y1="155" x2="560" y2="105" stroke="#D85A30" stroke-width="1.2" stroke-dasharray="4,2"/>
      <circle cx="560" cy="105" r="3" fill="#D85A30"/>

      <rect x="560" y="162" width="130" height="50" rx="4" fill="#EEEDFE" stroke="#7F77DD" stroke-width="1"/>
      <text x="625" y="182" text-anchor="middle" font-size="10" font-weight="500" fill="#26215C">LCD 16x2 I2C</text>
      <text x="625" y="196" text-anchor="middle" font-size="9" fill="#534AB7">SDA ← A4, SCL ← A5</text>
      <text x="625" y="208" text-anchor="middle" font-size="9" fill="#534AB7">VCC=5V  GND=GND</text>
      <line x1="450" y1="160" x2="560" y2="187" stroke="#7F77DD" stroke-width="1.2" stroke-dasharray="4,2"/>
      <circle cx="560" cy="187" r="3" fill="#7F77DD"/>

      <rect x="270" y="225" width="180" height="34" rx="4" fill="#F1EFE8" stroke="#888780" stroke-width="0.8"/>
      <text x="360" y="241" text-anchor="middle" font-size="9" fill="#444441">Monitor serial — puerto TX</text>
      <text x="360" y="253" text-anchor="middle" font-size="9" fill="#5F5E5A">9600 baud — registro CSV</text>
      <line x1="360" y1="195" x2="360" y2="225" stroke="#888780" stroke-width="0.8" stroke-dasharray="3,2"/>
    </svg>
  </div>

  <div class="card">
    <div class="card-title"><i class="ti ti-table" aria-hidden="true"></i> Tabla de pines — memoriza esto</div>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="border-bottom:0.5px solid var(--color-border-tertiary)">
        <th style="padding:7px 10px;text-align:left;font-weight:500;font-size:11px;color:var(--color-text-secondary)">Componente</th>
        <th style="padding:7px 10px;text-align:left;font-weight:500;font-size:11px;color:var(--color-text-secondary)">Pin Arduino</th>
        <th style="padding:7px 10px;text-align:left;font-weight:500;font-size:11px;color:var(--color-text-secondary)">Tipo</th>
        <th style="padding:7px 10px;text-align:left;font-weight:500;font-size:11px;color:var(--color-text-secondary)">¿Para qué?</th>
      </tr></thead>
      <tbody>
        <tr style="border-bottom:0.5px solid var(--color-border-tertiary)"><td style="padding:7px 10px">Sensor humedad</td><td style="padding:7px 10px;font-family:var(--font-mono);font-size:12px;color:#185FA5">A0</td><td style="padding:7px 10px">Entrada analógica</td><td style="padding:7px 10px;font-size:12px;color:var(--color-text-secondary)">Lee valor 0–1023</td></tr>
        <tr style="border-bottom:0.5px solid var(--color-border-tertiary)"><td style="padding:7px 10px">Sensor temperatura LM35</td><td style="padding:7px 10px;font-family:var(--font-mono);font-size:12px;color:#185FA5">A1</td><td style="padding:7px 10px">Entrada analógica</td><td style="padding:7px 10px;font-size:12px;color:var(--color-text-secondary)">Voltaje → grados °C</td></tr>
        <tr style="border-bottom:0.5px solid var(--color-border-tertiary)"><td style="padding:7px 10px">Relay / Bomba</td><td style="padding:7px 10px;font-family:var(--font-mono);font-size:12px;color:#185FA5">D7</td><td style="padding:7px 10px">Salida digital</td><td style="padding:7px 10px;font-size:12px;color:var(--color-text-secondary)">HIGH=bomba ON</td></tr>
        <tr style="border-bottom:0.5px solid var(--color-border-tertiary)"><td style="padding:7px 10px">LCD I2C — datos</td><td style="padding:7px 10px;font-family:var(--font-mono);font-size:12px;color:#185FA5">A4 (SDA)</td><td style="padding:7px 10px">I2C datos</td><td style="padding:7px 10px;font-size:12px;color:var(--color-text-secondary)">Envía texto a pantalla</td></tr>
        <tr><td style="padding:7px 10px">LCD I2C — reloj</td><td style="padding:7px 10px;font-family:var(--font-mono);font-size:12px;color:#185FA5">A5 (SCL)</td><td style="padding:7px 10px">I2C reloj</td><td style="padding:7px 10px;font-size:12px;color:var(--color-text-secondary)">Sincroniza comunicación</td></tr>
      </tbody>
    </table>
  </div>

  <div class="guide-box" style="background:#E6F1FB;border-color:#85B7EB">
    <div class="guide-icon">💡</div>
    <div>
      <div class="guide-title" style="color:#0C447C">Tip importante sobre los sensores</div>
      <div class="guide-text" style="color:#185FA5">El sensor de humedad devuelve <b>1023 cuando está seco</b> y cerca de 0 cuando está mojado. Por eso en el código usamos <code style="background:#B5D4F4;padding:1px 4px;border-radius:3px">map(valor, 1023, 0, 0, 100)</code> para invertir y convertir a porcentaje.</div>
    </div>
  </div>

  <div class="btn-row">
    <button class="btn-main" onclick="completeStep(1)"><i class="ti ti-check" aria-hidden="true"></i> Entendí el circuito, ir al código →</button>
  </div>
</div>

<div id="page2" class="page">
  <div class="guide-box">
    <div class="guide-icon">⌨️</div>
    <div>
      <div class="guide-title">Paso 3 de 4 — Completa el código</div>
      <div class="guide-text">El código ya está casi listo. Tu trabajo es <b>encontrar y corregir 5 problemas</b>: algunos son espacios en blanco <code style="background:#C0DD97;padding:1px 4px;border-radius:3px">_____</code> que debes completar, y otros son <b>errores de indentación</b> (líneas mal alineadas). Usa las pistas si te atascas, pero intenta primero solo.</div>
    </div>
  </div>

  <div class="warn-box">
    <div class="guide-icon" style="font-size:18px">🎯</div>
    <div>
      <div class="warn-title">Los 5 problemas que debes resolver</div>
      <div class="warn-text">
        <b>1.</b> ¿Cuántos milisegundos son 5 minutos? Completa <code style="background:#FAC775;padding:1px 4px;border-radius:3px">INTERVALO_CSV = _____</code><br>
        <b>2.</b> El sensor seco devuelve 1023. Completa el rango en <code style="background:#FAC775;padding:1px 4px;border-radius:3px">map(lecturaHumedad, _____, 0, 0, 100)</code><br>
        <b>3.</b> Para encender la bomba escribe: <code style="background:#FAC775;padding:1px 4px;border-radius:3px">digitalWrite(PIN_BOMBA, _____)</code><br>
        <b>4.</b> Guarda el tiempo actual: <code style="background:#FAC775;padding:1px 4px;border-radius:3px">ultimoRegistro = _____</code><br>
        <b>5.</b> Hay 2 líneas con <b>indentación incorrecta</b> — búscalas y corrígelas con espacios.
      </div>
    </div>
  </div>

  <div class="hint-section">
    <div class="hint-section-title"><i class="ti ti-bulb" aria-hidden="true"></i> Pistas disponibles — cada pista que uses te resta 2 puntos</div>
    <div class="hints-row">
      <button class="hpill" id="h1" onclick="showHint(1,'5 minutos = 5 × 60 × 1000 = 300000 milisegundos')">🕐 ¿Cuánto es 5 min en ms?</button>
      <button class="hpill" id="h2" onclick="showHint(2,'El sensor seco devuelve 1023 → map(lecturaHumedad, 1023, 0, 0, 100)')">💧 Rango del sensor seco</button>
      <button class="hpill" id="h3" onclick="showHint(3,'HIGH enciende, LOW apaga → digitalWrite(PIN_BOMBA, HIGH)')">⚡ ¿HIGH o LOW para encender?</button>
      <button class="hpill" id="h4" onclick="showHint(4,'ultimoRegistro = ahora;  (guarda el tiempo actual)')">⏱️ Actualizar el tiempo</button>
      <button class="hpill" id="h5" onclick="showHint(5,'Busca líneas que empiecen sin los 2 espacios de su bloque → pinMode y el digitalWrite del else')">↹ ¿Dónde está la indentación mal?</button>
    </div>
    <div id="hint-reveal"></div>
  </div>

  <div class="editor-wrap">
    <div class="editor-header">
      <div class="e-dots">
        <div class="e-dot" style="background:#ff5f57"></div>
        <div class="e-dot" style="background:#febc2e"></div>
        <div class="e-dot" style="background:#28c840"></div>
      </div>
      <span class="e-fname">huerta_monitor.ino</span>
      <span class="e-lang">Arduino C++</span>
    </div>
    <div class="editor-body">
<textarea id="code-ed" spellcheck="false">#include &lt;LiquidCrystal_I2C.h&gt;

// === PINES ===
const int PIN_HUMEDAD    = A0;
const int PIN_TEMPERATURA = A1;
const int PIN_BOMBA      = 7;

// === PARAMETROS ===
const int  UMBRAL_HUMEDAD = 40;
const long INTERVALO_CSV  = _____;  // TODO 1: 5 minutos en ms

LiquidCrystal_I2C lcd(0x27, 16, 2);

unsigned long ultimoRegistro = 0;
bool bombaActiva = false;

void setup() {
  Serial.begin(9600);
pinMode(PIN_BOMBA, OUTPUT);     // BUG: indentacion incorrecta (agregar 2 espacios)
  digitalWrite(PIN_BOMBA, LOW);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Huerta Monitor");
  delay(2000);
  lcd.clear();

  Serial.println("tiempo_ms,humedad_%,temperatura_C,bomba");
}

void loop() {
  int lecturaHumedad = analogRead(PIN_HUMEDAD);
  int lecturaTemp    = analogRead(PIN_TEMPERATURA);

  // TODO 2: el sensor seco = 1023, completa el segundo argumento
  int humedad = map(lecturaHumedad, _____, 0, 0, 100);

  // Temperatura: LM35 devuelve 10mV/°C
  float temperatura = (lecturaTemp * 5.0 / 1023.0) * 100.0;

  // === LOGICA DE RIEGO ===
  if (humedad &lt; UMBRAL_HUMEDAD) {
    digitalWrite(PIN_BOMBA, _____);  // TODO 3: HIGH o LOW?
    bombaActiva = true;
  } else {
  digitalWrite(PIN_BOMBA, LOW);   // BUG: indentacion incorrecta (agregar 2 espacios)
    bombaActiva = false;
  }

  // === LCD ===
  lcd.setCursor(0, 0);
  lcd.print("H:");
  lcd.print(humedad);
  lcd.print("% T:");
  lcd.print((int)temperatura);
  lcd.print("C");
  lcd.setCursor(0, 1);
  lcd.print(bombaActiva ? "BOMBA: ACTIVA   " : "BOMBA: OFF      ");

  // === REGISTRO CSV cada 5 min ===
  unsigned long ahora = millis();
  if (ahora - ultimoRegistro >= INTERVALO_CSV) {
    ultimoRegistro = _____;    // TODO 4: guardar tiempo actual
    Serial.print(ahora);  Serial.print(",");
    Serial.print(humedad); Serial.print(",");
    Serial.print(temperatura, 1); Serial.print(",");
    Serial.println(bombaActiva ? "1" : "0");
  }

  delay(1000);
}</textarea>
    </div>
  </div>

  <div class="btn-row">
    <button class="btn-main" onclick="verificar()"><i class="ti ti-player-play" aria-hidden="true"></i> Verificar mi código →</button>
    <button class="btn-sec" onclick="resetCod()"><i class="ti ti-refresh" aria-hidden="true"></i> Restablecer código</button>
  </div>

  <div class="terminal" id="terminal"></div>

  <div class="score-wrap" id="score-wrap">
    <div class="score-card">
      <div id="score-ring" class="score-ring"></div>
      <div id="score-msg" style="font-size:14px;font-weight:500;color:var(--color-text-primary);margin-bottom:6px"></div>
      <div id="score-sub" style="font-size:12px;color:var(--color-text-secondary);margin-bottom:1rem"></div>
      <div id="crit-list" style="text-align:left"></div>
      <div id="next-action" class="next-hint" style="display:none"></div>
    </div>
  </div>
</div>

<div id="page3" class="page">
  <div class="guide-box">
    <div class="guide-icon">🧪</div>
    <div>
      <div class="guide-title">Paso 4 de 4 — Prueba y calificación final</div>
      <div class="guide-text">¡Llegaste al último paso! Aquí puedes <b>simular el sistema funcionando</b> moviendo los sensores con los controles. Observa cómo reacciona la bomba y el LCD. Al final revisa tu calificación según la rúbrica completa y finaliza.</div>
    </div>
  </div>

  <div class="sim-card">
    <div class="card-title"><i class="ti ti-adjustments" aria-hidden="true"></i> Simula el entorno — mueve los controles</div>
    <div class="sl-row"><label>Humedad del suelo</label><input type="range" min="0" max="100" value="62" step="1" id="sl-h" oninput="simUpdate()"/><span class="sl-val" id="vl-h">62%</span></div>
    <div class="sl-row"><label>Temperatura (°C)</label><input type="range" min="10" max="50" value="23" step="1" id="sl-t" oninput="simUpdate()"/><span class="sl-val" id="vl-t">23°C</span></div>
    <div class="guide-box" style="margin:8px 0 0;padding:8px 12px;background:#E6F1FB;border-color:#85B7EB">
      <div class="guide-icon" style="font-size:15px">💡</div>
      <div class="guide-text" style="color:#185FA5;font-size:12px">Baja la humedad <b>por debajo de 40%</b> y observa cómo se activa la bomba automáticamente.</div>
    </div>
  </div>

  <div class="sim-card">
    <div class="card-title"><i class="ti ti-device-analytics" aria-hidden="true"></i> Estado del sistema en tiempo real</div>
    <div class="sensor-grid">
      <div class="sv-card">
        <div class="sv-label"><i class="ti ti-droplet" aria-hidden="true"></i> Humedad</div>
        <div class="sv-val" id="dh">62<span class="sv-unit">%</span></div>
        <div class="pbar"><div class="pfill" id="bh" style="width:62%;background:#639922"></div></div>
      </div>
      <div class="sv-card">
        <div class="sv-label"><i class="ti ti-temperature" aria-hidden="true"></i> Temperatura</div>
        <div class="sv-val" id="dt">23<span class="sv-unit">°C</span></div>
        <div class="pbar"><div class="pfill" id="bt" style="width:33%;background:#EF9F27"></div></div>
      </div>
    </div>
    <div class="pump-row">
      <div class="pdot" id="pdot"></div>
      <span style="font-size:13px;font-weight:500;color:var(--color-text-primary)">Bomba de agua</span>
      <span style="margin-left:auto;font-size:12px;font-family:var(--font-mono);color:var(--color-text-secondary)" id="pstate">APAGADA</span>
    </div>
    <div style="margin-top:10px">
      <div style="font-size:11px;font-weight:500;color:var(--color-text-secondary);margin-bottom:5px">📺 Pantalla LCD</div>
      <div class="lcd-screen">
        <div id="lcd1">H:62% T:23C       </div>
        <div id="lcd2">BOMBA: OFF      </div>
      </div>
    </div>
  </div>

  <div class="sim-card">
    <div class="card-title"><i class="ti ti-file-spreadsheet" aria-hidden="true"></i> Registro CSV — así se guardan los datos</div>
    <div class="csv-log">
      <div class="csv-hdr">tiempo_ms,humedad_%,temperatura_C,bomba</div>
      <div id="csvlog"></div>
    </div>
    <button class="btn-sec" style="margin-top:10px;font-size:12px" onclick="csvAdd()"><i class="ti ti-plus" aria-hidden="true"></i> Simular una lectura nueva</button>
  </div>

  <div class="card">
    <div class="card-title"><i class="ti ti-award" aria-hidden="true"></i> Rúbrica de calificación — 100 puntos</div>
    <table class="rubric-tbl">
      <thead><tr><th>Criterio</th><th>¿Qué se evalúa?</th><th>Puntos</th></tr></thead>
      <tbody>
        <tr><td>Esquema del circuito</td><td style="font-size:12px;color:var(--color-text-secondary)">Pines correctos, todos los componentes conectados</td><td><span class="pts-pill">20 pts</span></td></tr>
        <tr><td>Sensor humedad</td><td style="font-size:12px;color:var(--color-text-secondary)">map() correcto, conversión a porcentaje</td><td><span class="pts-pill">15 pts</span></td></tr>
        <tr><td>Sensor temperatura</td><td style="font-size:12px;color:var(--color-text-secondary)">Fórmula LM35 correcta</td><td><span class="pts-pill">15 pts</span></td></tr>
        <tr><td>Lógica de riego</td><td style="font-size:12px;color:var(--color-text-secondary)">Bomba ON bajo 40%, OFF sobre 40%</td><td><span class="pts-pill">20 pts</span></td></tr>
        <tr><td>Pantalla LCD / Serial</td><td style="font-size:12px;color:var(--color-text-secondary)">Muestra humedad, temperatura y estado bomba</td><td><span class="pts-pill">15 pts</span></td></tr>
        <tr><td>Registro CSV</td><td style="font-size:12px;color:var(--color-text-secondary)">Formato correcto, cada 5 min con millis()</td><td><span class="pts-pill">15 pts</span></td></tr>
      </tbody>
    </table>
    <div style="margin-top:1rem;display:flex;gap:8px;flex-wrap:wrap">
      <span style="font-size:11px;padding:3px 10px;border-radius:20px;font-weight:500;background:#EAF3DE;color:#27500A">90–100 Excelente 🌟</span>
      <span style="font-size:11px;padding:3px 10px;border-radius:20px;font-weight:500;background:#E6F1FB;color:#0C447C">70–89 Aprobado ✅</span>
      <span style="font-size:11px;padding:3px 10px;border-radius:20px;font-weight:500;background:#FAEEDA;color:#633806">50–69 En proceso ⚠️</span>
      <span style="font-size:11px;padding:3px 10px;border-radius:20px;font-weight:500;background:#FCEBEB;color:#791F1F">0–49 Revisar ❌</span>
    </div>
  </div>

  <div class="btn-row">
    <button class="btn-main" onclick="window.parent.postMessage({ type: 'EVAL_SUCCESS' }, '*')">
      <i class="ti ti-check" aria-hidden="true"></i> Finalizar y Guardar en MetaPathFinder →
    </button>
    <button class="btn-sec" onclick="goStep(2)"><i class="ti ti-arrow-left" aria-hidden="true"></i> Volver al código</button>
  </div>
</div>

</div>

<script>
let stepsUnlocked=1, stepsCompleted=0, hintsUsed=[], codeVerified=false;
const ORIG=document.getElementById('code-ed').value;

// Apply dark mode theme if configured in parent page body class
if (window.parent.document.body.classList.contains('dark') || window.parent.document.documentElement.classList.contains('dark')) {
  document.body.classList.add('dark');
}

function goStep(i){
  if(i>=stepsUnlocked)return;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page'+i).classList.add('active');
  document.querySelectorAll('.snav-btn').forEach((b,j)=>{
    b.classList.remove('active','done','locked');
    if(j===i)b.classList.add('active');
    else if(j<stepsUnlocked)b.classList.add('done');
    else b.classList.add('locked');
  });
}

function completeStep(i){
  if(i+1>stepsUnlocked)stepsUnlocked=i+1;
  stepsCompleted=Math.max(stepsCompleted,i+1);
  updateProgress();
  goStep(i+1);
}

function updateProgress(){
  const pct=Math.round(stepsCompleted/4*100);
  document.getElementById('prog-bar').style.width=pct+'%';
  document.getElementById('prog-pct').textContent=stepsCompleted+' de 4 pasos completados';
}

function showHint(n,txt){
  const box=document.getElementById('hint-reveal');
  box.style.display='block';
  box.innerHTML='<span style="color:#854F0B;font-weight:500">Pista '+n+':</span> '+txt;
  const pill=document.getElementById('h'+n);
  if(!hintsUsed.includes(n)){hintsUsed.push(n);pill.classList.add('used');}
}

function resetCod(){
  document.getElementById('code-ed').value=ORIG;
  document.getElementById('terminal').style.display='none';
  document.getElementById('score-wrap').style.display='none';
}

function addTerm(type,msg){
  const t=document.getElementById('terminal');
  t.style.display='block';
  const d=document.createElement('div');d.className='tl';
  const ts=new Date().toLocaleTimeString();
  d.innerHTML='<span class="ttime">[' + ts + ']</span><span class="t' + type + '">' + msg + '</span>';
  t.appendChild(d);t.scrollTop=t.scrollHeight;
}

function verificar(){
  const code=document.getElementById('code-ed').value;
  const term=document.getElementById('terminal');
  term.innerHTML='';term.style.display='block';
  const sw=document.getElementById('score-wrap');
  sw.style.display='block';

  addTerm('info','Analizando tu código...');

  const checks=[
    {key:'300000',label:'Intervalo CSV = 300000 ms (5 min)',pts:20},
    {key:'map(lecturaHumedad, 1023',label:'map() con 1023 como valor seco',pts:20},
    {key:'digitalWrite(PIN_BOMBA, HIGH)',label:'Bomba se enciende con HIGH',pts:20},
    {key:'ultimoRegistro = ahora',label:'Tiempo actualizado correctamente',pts:20},
  ];
  const indents=[
    {re:/^ {2}pinMode/m,label:'Indentación de pinMode()',pts:10},
    {re:/^ {4}digitalWrite\(PIN_BOMBA, LOW\)/m,label:'Indentación del else → digitalWrite',pts:10},
  ];

  let total=0,maxPts=0;
  const items=[];
  setTimeout(function(){
    checks.forEach(function(c){
      maxPts+=c.pts;
      const ok=code.includes(c.key);
      if(ok)total+=c.pts;
      setTimeout(function(){ addTerm(ok?'ok':'warn',(ok?'✓ ':'✗ ')+c.label); },100);
      items.push({label:c.label,ok});
    });
    indents.forEach(function(c){
      maxPts+=c.pts;
      const ok=c.re.test(code);
      if(ok)total+=c.pts;
      setTimeout(function(){ addTerm(ok?'ok':'warn',(ok?'✓ ':'✗ ')+'Indentación: '+c.label); },100);
      items.push({label:'Indentación: '+c.label,ok});
    });
    const penalty=hintsUsed.length*2;
    const raw=Math.round(total/maxPts*100);
    const final=Math.max(0,raw-penalty);
    setTimeout(function(){
      addTerm('info','─────────────────────────────────');
      addTerm(final>=70?'ok':'warn','Puntuación base: ' + raw + '/100 | Pistas usadas: ' + hintsUsed.length + ' (−' + penalty + ' pts) | Final: ' + final + '/100');
    },200);
    setTimeout(function(){ renderScore(final,items,penalty); },400);
  },200);
}

function renderScore(pct,items,pen){
  const ring=document.getElementById('score-ring');
  const msg=document.getElementById('score-msg');
  const sub=document.getElementById('score-sub');
  const cl=document.getElementById('crit-list');
  const na=document.getElementById('next-action');
  ring.textContent=pct;
  ring.className='score-ring '+(pct>=70?'ring-pass':pct>=50?'ring-warn':'ring-fail');
  msg.textContent=pct>=90?'¡Excelente! Todo correcto 🌟':pct>=70?'¡Aprobado! Buen trabajo ✅':pct>=50?'Vas por buen camino, sigue intentando ⚠️':'Revisa los errores e inténtalo de nuevo ❌';
  sub.textContent=pen>0?('Resolviste ' + items.filter(function(i){return i.ok;}).length + '/' + items.length + ' problemas. Usaste ' + (pen/2) + ' pista(s) (−' + pen + ' pts).') : ('Resolviste ' + items.filter(function(i){return i.ok;}).length + '/' + items.length + ' problemas sin usar pistas.');
  cl.innerHTML=items.map(function(i){ return '<div class="crit-row"><span style="font-size:15px">' + (i.ok?'✅':'❌') + '</span><span style="font-size:13px">' + i.label + '</span></div>'; }).join('');
  if(pct>=70){
    na.style.display='flex';
    na.innerHTML='<i class="ti ti-arrow-right" style="font-size:16px" aria-hidden="true"></i> ¡Buen trabajo! Ahora ve al <b style="margin:0 4px">Paso 4</b> para probar la simulación en tiempo real. <button class="btn-main" style="margin-left:auto;padding:6px 14px;font-size:12px" onclick="completeStep(2)">Ir a prueba →</button>';
    if(stepsUnlocked<3)stepsUnlocked=3;
    updateProgress();
    
    // Automatically report success to MetaPathFinder
    window.parent.postMessage({ type: 'EVAL_SUCCESS' }, '*');
  } else {
    na.style.display='flex';
    na.innerHTML='<i class="ti ti-bulb" style="font-size:16px" aria-hidden="true"></i> Revisa los errores marcados con ❌ arriba y vuelve a intentarlo para superar la puntuación mínima de 70.';
  }
}

let csvTime=0,csvRows=[];
function simUpdate(){
  const h=parseInt(document.getElementById('sl-h').value);
  const t=parseInt(document.getElementById('sl-t').value);
  document.getElementById('vl-h').textContent=h+'%';
  document.getElementById('vl-t').textContent=t+'°C';
  document.getElementById('dh').innerHTML=h+'<span class="sv-unit">%</span>';
  document.getElementById('dt').innerHTML=t+'<span class="sv-unit">°C</span>';
  const bh=document.getElementById('bh');
  bh.style.width=h+'%';
  bh.style.background=h<40?'#E24B4A':h<60?'#EF9F27':'#639922';
  document.getElementById('bt').style.width=Math.round((t-10)/40*100)+'%';
  const on=h<40;
  const dot=document.getElementById('pdot');
  if(on){dot.classList.add('on');document.getElementById('pstate').textContent='ACTIVA 💧';}
  else{dot.classList.remove('on');document.getElementById('pstate').textContent='APAGADA';}
  document.getElementById('lcd1').textContent=('H:'+h+'% T:'+t+'C          ').substring(0,16);
  document.getElementById('lcd2').textContent=(on?'BOMBA: ACTIVA   ':'BOMBA: OFF      ').substring(0,16);
}

function csvAdd(){
  const h=parseInt(document.getElementById('sl-h').value);
  const t=parseInt(document.getElementById('sl-t').value);
  csvTime+=300000;
  const on=h<40?1:0;
  csvRows.push(csvTime + ',' + h + ',' + t + '.0,' + on);
  if(csvRows.length>6)csvRows.shift();
  document.getElementById('csvlog').innerHTML=csvRows.map(function(r){ return '<div class="csv-r">' + r + '</div>'; }).join('');
}

csvAdd();simUpdate();
</script>
</body>
</html>
  `;

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '620px', borderRadius: '0 0 2rem 2rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <iframe 
        srcDoc={htmlContent} 
        style={{ width: '100%', height: '100%', flex: 1, border: 'none' }} 
        title="Evaluación Huerta Escolar Arduino"
      />
    </div>
  );
}
