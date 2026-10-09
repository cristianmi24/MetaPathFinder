import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

/**
 * WalkingScene — fondo animado con TU ilustración.
 *
 *  • El joven (recortado de tu imagen y separado en torso + 2 piernas) camina en el lugar,
 *    mientras el paisaje corre en bucle infinito: nunca llega al final.
 *  • Día: sol con rayos y luz cálida.   Noche: luna que ilumina, estrellas, luciérnagas
 *    y el paisaje (y el joven) se oscurecen con una transición suave.
 *
 * Interacción
 *   – Mantén presionado en cualquier parte  → el joven corre
 *   – Toca al joven                         → salta
 *   – Toca el sol / la luna o el botón      → cambia el tema
 *   – Mueve el mouse                        → parallax del sol / luna
 *
 * Props: initialTheme ("day" | "night"), showControls (bool), children (contenido encima)
 * Los assets viven en ./assets (webp/png). Sin dependencias, solo React.
 */

const asset = (n) => new URL(`./assets/${n}`, import.meta.url).href;
const IMG = {
  day: asset("scene-day.webp"),
  night: asset("scene-night.webp"),
  body: asset("boy-body.png"),
  back: asset("boy-back.png"),
  front: asset("boy-front.png"),
};

const TILE_ASPECT = 4112 / 765; // la loseta es la ilustración + su espejo → empalme invisible
const HIP = "135 235"; // cadera del joven (coordenadas del sprite 260×390)
const RAD = Math.PI / 180;
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (seed) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

/* ───────────── Sol, luna y nubes ───────────── */

function Sun() {
  return (
    <svg viewBox="-100 -100 200 200" className="ws-body" aria-hidden="true">
      <defs>
        <radialGradient id="wsx-sun">
          <stop offset="0" stopColor="#fffbe3" />
          <stop offset=".55" stopColor="#ffd84d" />
          <stop offset="1" stopColor="#ffae00" />
        </radialGradient>
        <radialGradient id="wsx-sunhalo">
          <stop offset="0" stopColor="#fff2a8" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff2a8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="100" fill="url(#wsx-sunhalo)" className="ws-pulse" />
      <g className="ws-spin">
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x="-4" y="-78" width="8" height={i % 2 ? 22 : 32} rx="4" fill="#ffc933" transform={`rotate(${(i * 360) / 14})`} />
        ))}
      </g>
      <circle r="42" fill="url(#wsx-sun)" />
    </svg>
  );
}

function Moon() {
  return (
    <svg viewBox="-100 -100 200 200" className="ws-body" aria-hidden="true">
      <defs>
        <radialGradient id="wsx-moon" cx=".38" cy=".35">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".7" stopColor="#e9ecff" />
          <stop offset="1" stopColor="#b8c2f0" />
        </radialGradient>
        <radialGradient id="wsx-moonhalo">
          <stop offset="0" stopColor="#bcd0ff" stopOpacity=".85" />
          <stop offset="1" stopColor="#bcd0ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="100" fill="url(#wsx-moonhalo)" className="ws-pulse" />
      <circle r="42" fill="url(#wsx-moon)" />
      <circle cx="-14" cy="-10" r="9" fill="#9aa5d6" opacity=".35" />
      <circle cx="14" cy="14" r="12" fill="#9aa5d6" opacity=".3" />
      <circle cx="10" cy="-20" r="5" fill="#9aa5d6" opacity=".3" />
      <circle cx="-20" cy="18" r="5" fill="#9aa5d6" opacity=".3" />
    </svg>
  );
}

const Cel = ({ kind, z, onClick, children }) => (
  <div className={`ws-cel ws-${kind}`} style={{ zIndex: z }} onClick={onClick}>
    <div className="ws-par">
      <div className="ws-arc">{children}</div>
    </div>
  </div>
);

const Cloud = ({ top, w, dur, delay, o }) => (
  <svg className="ws-cloud" viewBox="0 0 200 80" style={{ top, width: w, animationDuration: dur, animationDelay: delay, opacity: o }} aria-hidden="true">
    <g style={{ fill: "var(--cloud)" }}>
      <ellipse cx="100" cy="58" rx="90" ry="18" />
      <circle cx="60" cy="46" r="26" />
      <circle cx="100" cy="34" r="32" />
      <circle cx="140" cy="46" r="24" />
    </g>
  </svg>
);

/* ───────────── El joven (3 piezas de tu imagen) ───────────── */

function Boy({ P, onJump }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gid = `wsboy${uid}`;
  const fid = `wsgrade${uid}`;
  const set = (k) => (el) => (P.current[k] = el);
  const hit = { onClick: onJump, onPointerDown: (e) => e.stopPropagation() };
  return (
    <svg className="ws-boy-svg" viewBox="0 0 260 390" aria-label="Joven caminando">
      <defs>
        {/* mismo "color grading" que la versión nocturna del paisaje */}
        <filter id={fid} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.30 0 0 0 0.01  0 0.43 0 0 0.02  0 0 0.82 0 0.07  0 0 0 1 0" />
        </filter>
      </defs>
      <g id={gid} ref={set("all")}>
        <g ref={set("back")}>
          <image href={IMG.back} width="260" height="390" style={{ filter: "brightness(.93)" }} />
        </g>
        <g ref={set("front")}>
          <image href={IMG.front} width="260" height="390" />
        </g>
        <g ref={set("body")}>
          <image href={IMG.body} width="260" height="390" />
        </g>
      </g>
      <use href={`#${gid}`} className="ws-boy-night" style={{ filter: `url(#${fid})` }} />
      <rect x="25" y="15" width="215" height="370" fill="transparent" className="ws-hit" {...hit} />
    </svg>
  );
}

/* ───────────── Componente principal ───────────── */

export default function WalkingScene({ initialTheme, showControls = true, boyLeft = 50, children }) {
  const [night, setNight] = useState(() => {
    if (initialTheme) return initialTheme === "night";
    try {
      const saved = localStorage.getItem("ws-theme");
      if (saved) return saved === "night";
    } catch {}
    return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  });

  // Si el padre controla initialTheme (p.ej. el tema claro/oscuro de la app),
  // la escena sigue sus cambios en vivo en vez de fijarse solo al montar.
  useEffect(() => {
    if (initialTheme) setNight(initialTheme === "night");
  }, [initialTheme]);

  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const shadowRef = useRef(null);
  const P = useRef({});
  const S = useRef({ speed: 1, target: 1, off: 0, phase: 0, jump: -1, H: 600 });

  const toggle = useCallback(() => {
    setNight((n) => {
      try {
        localStorage.setItem("ws-theme", n ? "day" : "night");
      } catch {}
      return !n;
    });
  }, []);
  const jump = useCallback(() => {
    if (S.current.jump < 0) S.current.jump = 0;
  }, []);

  // medir el escenario (la escena se escala por altura)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const upd = () => (S.current.H = el.getBoundingClientRect().height || 600);
    upd();
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Bucle: scroll infinito + ciclo de caminata
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf;
    let last = performance.now();
    const tick = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const s = S.current;
      s.speed += (s.target - s.speed) * Math.min(1, dt * 4);
      const sp = reduce ? s.speed * 0.3 : s.speed;

      // desplazamiento del paisaje (1 ciclo de paso ≈ 1 zancada de 190 u del sprite)
      const tileW = s.H * TILE_ASPECT;
      s.off = (s.off + 0.248 * s.H * sp * dt) % tileW;
      if (trackRef.current) trackRef.current.style.transform = `translate3d(${-s.off}px,0,0)`;

      s.phase += dt * Math.PI * 2 * 1.0 * sp;
      let air = 0;
      if (s.jump >= 0) {
        s.jump += dt / 0.75;
        if (s.jump >= 1) s.jump = -1;
        else air = Math.sin(s.jump * Math.PI);
      }

      const p = s.phase;
      const run = Math.min(1, Math.max(0, (s.speed - 1) / 1.6)); // 0 caminar → 1 correr
      const swing = (1 - Math.cos(p)) / 2; // 0 → 1 → 0 (medio ciclo = un paso)
      const D = 38 + run * 12; // amplitud (grados) respecto a la pose original
      const bob = -(11 + run * 4) * (1 - Math.abs(Math.cos(p))); // cuerpo sube a mitad de paso
      const lift = (9 + run * 7);
      const liftB = Math.max(0, Math.sin(p)) * lift; // pierna trasera avanza (0..π)
      const liftF = Math.max(0, -Math.sin(p)) * lift; // pierna delantera avanza (π..2π)

      const jy = -air * 70;
      const thF = lerp(swing * D, 30, air);
      const thB = lerp(-swing * D, -34, air);
      const lean = 1.2 * Math.sin(p) + run * 4 + air * -2;

      const q = P.current;
      q.all?.setAttribute("transform", `translate(0 ${(bob + jy).toFixed(2)}) rotate(${lean.toFixed(2)} 130 376)`);
      q.front?.setAttribute("transform", `translate(0 ${(-liftF - air * 18).toFixed(2)}) rotate(${thF.toFixed(2)} ${HIP})`);
      q.back?.setAttribute("transform", `translate(0 ${(-liftB - air * 6).toFixed(2)}) rotate(${thB.toFixed(2)} ${HIP})`);
      if (shadowRef.current) {
        shadowRef.current.style.transform = `translateX(-50%) scale(${(1 - air * 0.35).toFixed(3)})`;
        shadowRef.current.style.opacity = (0.3 * (1 - air * 0.5)).toFixed(3);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onMove = (e) => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    el.style.setProperty("--my", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  };
  const run = () => (S.current.target = 2.6);
  const walk = () => (S.current.target = 1);

  const stars = useMemo(() => {
    const r = rand(7);
    return Array.from({ length: 90 }, () => ({ x: r() * 100, y: r() * 60, s: 1 + r() * 2.2, d: 2 + r() * 4, dl: -r() * 6 }));
  }, []);
  const flies = useMemo(() => {
    const r = rand(99);
    return Array.from({ length: 22 }, () => ({
      x: 4 + r() * 92, y: 8 + r() * 36, d: 6 + r() * 7, dl: -r() * 10, dx: (r() - 0.5) * 90, dy: (r() - 0.5) * 70,
    }));
  }, []);

  return (
    <div
      ref={rootRef}
      className={`ws ${night ? "night" : ""}`}
      style={{ "--boy-left": `${boyLeft}%` }}
      onPointerMove={onMove}
      onPointerDown={run}
      onPointerUp={walk}
      onPointerLeave={walk}
      onPointerCancel={walk}
    >
      <style>{CSS}</style>

      <div className="ws-sky ws-sky-day" />
      <div className="ws-sky ws-sky-night" />

      <div className="ws-stars" aria-hidden="true">
        {stars.map((s, i) => (
          <span key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDuration: `${s.d}s`, animationDelay: `${s.dl}s` }} />
        ))}
        <i className="ws-shoot" />
      </div>

      <Cloud top="6%" w="18cqw" dur="120s" delay="-30s" o={0.9} />
      <Cloud top="20%" w="12cqw" dur="170s" delay="-110s" o={0.7} />

      <Cel kind="sun" z={1} onClick={toggle}><Sun /></Cel>
      <Cel kind="moon" z={1} onClick={toggle}><Moon /></Cel>

      {/* Escena: tu ilustración, en bucle infinito */}
      <div className="ws-stage" ref={stageRef}>
        <div className="ws-track" ref={trackRef}>
          <div className="ws-img ws-img-day" style={{ backgroundImage: `url(${IMG.day})` }} />
          <div className="ws-img ws-img-night" style={{ backgroundImage: `url(${IMG.night})` }} />
        </div>
        <div className="ws-shadow" ref={shadowRef} />
        <div className="ws-boy">
          <Boy P={P} onJump={jump} />
        </div>
      </div>

      {/* Luz que emiten el sol y la luna */}
      <Cel kind="sun" z={12}>
        <div className="ws-rays ws-rays-sun" />
        <div className="ws-bloom ws-bloom-sun" />
      </Cel>
      <Cel kind="moon" z={12}>
        <div className="ws-rays ws-rays-moon" />
        <div className="ws-bloom ws-bloom-moon" />
      </Cel>

      <div className="ws-flies" aria-hidden="true">
        {flies.map((m, i) => (
          <b key={i} style={{ left: `${m.x}%`, bottom: `${m.y}%`, "--dx": `${m.dx}px`, "--dy": `${m.dy}px`, animationDuration: `${m.d}s`, animationDelay: `${m.dl}s` }} />
        ))}
      </div>
      <div className="ws-vignette" />

      {showControls && (
        <>
          <button
            className="ws-toggle"
            aria-pressed={night}
            aria-label={night ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            onClick={toggle}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span className="ws-knob">
              {night ? (
                <svg viewBox="0 0 24 24" width="18" height="18"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="currentColor" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="4.5" fill="currentColor" />{Array.from({ length: 8 }, (_, i) => <rect key={i} x="11" y="1.5" width="2" height="4" rx="1" fill="currentColor" transform={`rotate(${i * 45} 12 12)`} />)}</svg>
              )}
            </span>
            <span>{night ? "Noche" : "Día"}</span>
          </button>
          <div className="ws-hint">Mantén presionado para correr · toca al joven para saltar</div>
        </>
      )}

      {children && <div className="ws-content">{children}</div>}
    </div>
  );
}

/* ───────────── Estilos ───────────── */

const CSS = `
.ws{
  --mx:0; --my:0; --cloud:#fff; 
  container-type:size; position:relative; width:100%; height:100%; min-height:360px;
  overflow:hidden; overflow:clip; background:#bfe9ff; user-select:none; -webkit-user-select:none; touch-action:pan-y;
  font-family:system-ui,-apple-system,"Segoe UI",sans-serif;
}
.ws.night{ --cloud:#6e7fc0; }

/* cielo */
.ws-sky{position:absolute;inset:0;transition:opacity 1.6s ease}
.ws-sky-day{background:linear-gradient(#58c0ff 0%,#a9e1ff 48%,#e9f6ff 100%)}
.ws-sky-night{background:linear-gradient(#040820 0%,#101d4d 50%,#2d3f86 100%);opacity:0}
.ws.night .ws-sky-night{opacity:1}

/* estrellas */
.ws-stars{position:absolute;inset:0;opacity:0;transition:opacity 1.8s ease}
.ws.night .ws-stars{opacity:1}
.ws-stars span{position:absolute;border-radius:50%;background:#fff;box-shadow:0 0 6px #fff;animation:ws-tw 3s ease-in-out infinite}
@keyframes ws-tw{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
.ws-shoot{position:absolute;top:8%;left:12%;width:130px;height:2px;border-radius:2px;
  background:linear-gradient(90deg,#fff,transparent);opacity:0;animation:ws-shoot 12s ease-in infinite 3s}
@keyframes ws-shoot{0%{opacity:0;transform:translate(0,0) rotate(25deg)}2%{opacity:1}9%{opacity:0;transform:translate(42cqw,20cqw) rotate(25deg)}100%{opacity:0;transform:translate(42cqw,20cqw) rotate(25deg)}}

/* nubes extra */
.ws-cloud{position:absolute;left:0;z-index:1;animation:ws-drift linear infinite;filter:drop-shadow(0 6px 10px rgba(120,160,220,.25));transition:opacity 1.4s}
.ws.night .ws-cloud{filter:none;opacity:.3 !important}
@keyframes ws-drift{from{transform:translateX(-30cqw)}to{transform:translateX(115cqw)}}

/* sol y luna */
.ws-cel{position:absolute;left:68%;top:6%;width:min(14cqw,24cqh);aspect-ratio:1;pointer-events:none}
.ws-par{position:absolute;inset:0;transform:translate(calc(var(--mx)*-14px),calc(var(--my)*-9px));transition:transform .4s ease-out}
.ws-arc{position:absolute;inset:0;transform-origin:50% 430%;transition:transform 1.9s cubic-bezier(.45,.05,.2,1),opacity 1.3s ease}
.ws-sun .ws-arc{transform:rotate(0);opacity:1}
.ws-moon .ws-arc{transform:rotate(-82deg);opacity:0}
.ws.night .ws-sun .ws-arc{transform:rotate(82deg);opacity:0}
.ws.night .ws-moon .ws-arc{transform:rotate(0);opacity:1}
.ws-body{width:100%;height:100%;overflow:visible;cursor:pointer;pointer-events:auto;transition:transform .3s}
.ws-body:hover{transform:scale(1.08)}
.ws.night .ws-sun .ws-body,.ws:not(.night) .ws-moon .ws-body{pointer-events:none}
.ws-spin{animation:ws-spin 40s linear infinite}
@keyframes ws-spin{to{transform:rotate(360deg)}}
.ws-pulse{animation:ws-pulse 4.5s ease-in-out infinite;transform-origin:0 0}
@keyframes ws-pulse{0%,100%{transform:scale(.92);opacity:.8}50%{transform:scale(1.08);opacity:1}}

/* luz */
.ws-bloom{position:absolute;inset:-380%;border-radius:50%}
.ws-bloom-sun{background:radial-gradient(circle,rgba(255,226,140,.5) 0,rgba(255,236,170,.18) 9%,rgba(255,240,200,.06) 22%,transparent 40%)}
.ws-bloom-moon{background:radial-gradient(circle,rgba(190,210,255,.5) 0,rgba(140,170,255,.2) 10%,rgba(120,150,255,.08) 24%,transparent 42%)}
.ws-rays{position:absolute;inset:-260%;border-radius:50%;animation:ws-spin 120s linear infinite;
  -webkit-mask-image:radial-gradient(circle,#000 0,transparent 62%);mask-image:radial-gradient(circle,#000 0,transparent 62%)}
.ws-rays-sun{background:repeating-conic-gradient(rgba(255,240,170,.18) 0 5deg,transparent 5deg 17deg)}
.ws-rays-moon{background:repeating-conic-gradient(rgba(190,210,255,.17) 0 4deg,transparent 4deg 19deg)}

/* escenario: la ilustración se escala por altura y se ancla abajo */
.ws-stage{
  --H:max(100cqh,37.2cqw); --u:calc(var(--H) / 765);
  position:absolute;left:0;right:0;bottom:0;height:var(--H);z-index:2;pointer-events:none;overflow:hidden;
  isolation:isolate; /* evita que el filtro/SVG del joven pinte por encima del contenido (z-index 20) */
}
.ws-track{position:absolute;left:0;top:0;height:100%;width:calc(var(--H) * 10.75);will-change:transform}
.ws-img{position:absolute;inset:0;background-repeat:repeat-x;background-size:calc(var(--H) * 5.375) 100%;background-position:0 100%}
.ws-img-night{opacity:0;transition:opacity 1.6s ease}
.ws.night .ws-img-night{opacity:1}

/* joven: su sprite mide 260×390 unidades de la ilustración */
.ws-boy{position:absolute;left:calc(var(--boy-left,50%) - 130 * var(--u));bottom:calc(45 * var(--u));width:calc(260 * var(--u));height:calc(390 * var(--u))}
.ws-boy-svg{width:100%;height:100%;overflow:visible;display:block;pointer-events:none}
.ws-hit{pointer-events:all;cursor:pointer}
.ws-boy-night{opacity:0;transition:opacity 1.6s ease;pointer-events:none}
.ws.night .ws-boy-night{opacity:1}
.ws-boy-svg{transition:filter 1.6s}
.ws.night .ws-boy-svg{filter:drop-shadow(0 0 calc(5 * var(--u)) rgba(170,200,255,.65))}
.ws-shadow{position:absolute;left:var(--boy-left,50%);bottom:calc(40 * var(--u));width:calc(190 * var(--u));height:calc(18 * var(--u));
  border-radius:50%;background:radial-gradient(ellipse,rgba(40,25,10,.55),transparent 70%);transform:translateX(-50%);opacity:.3}

/* luciérnagas */
.ws-flies{position:absolute;inset:0;z-index:9;pointer-events:none;opacity:0;transition:opacity 1.8s ease}
.ws.night .ws-flies{opacity:1}
.ws-flies b{position:absolute;width:5px;height:5px;border-radius:50%;background:#fff7a8;
  box-shadow:0 0 8px 3px rgba(255,240,130,.8);animation:ws-fly ease-in-out infinite}
@keyframes ws-fly{0%{transform:translate(0,0);opacity:0}20%{opacity:1}50%{transform:translate(var(--dx),var(--dy));opacity:.35}80%{opacity:1}100%{transform:translate(0,0);opacity:0}}

.ws-vignette{position:absolute;inset:0;z-index:13;pointer-events:none;
  background:radial-gradient(ellipse at center,transparent 62%,rgba(0,10,40,.12) 100%);transition:background 1.4s}
.ws.night .ws-vignette{background:radial-gradient(ellipse at center,transparent 45%,rgba(0,0,20,.42) 100%)}

/* UI */
.ws-toggle{position:absolute;top:16px;right:16px;z-index:30;display:flex;align-items:center;gap:10px;
  padding:6px 16px 6px 6px;border:1px solid rgba(255,255,255,.55);border-radius:999px;cursor:pointer;
  background:rgba(255,255,255,.35);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  color:#1f2d52;font:600 14px/1 inherit;box-shadow:0 6px 20px rgba(0,0,0,.15);transition:transform .2s,background .4s,color .4s}
.ws-toggle:hover{transform:scale(1.05)}
.ws-toggle:focus-visible{outline:3px solid #6b78d6;outline-offset:2px}
.ws.night .ws-toggle{background:rgba(20,30,80,.45);color:#e6ebff;border-color:rgba(190,210,255,.4)}
.ws-knob{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;
  background:linear-gradient(135deg,#ffe27a,#ffb300);color:#7a4a00;transition:background .5s,color .5s}
.ws.night .ws-knob{background:linear-gradient(135deg,#f4f6ff,#aebaf0);color:#27346b}
.ws-hint{position:absolute;top:20px;left:16px;z-index:30;padding:8px 14px;border-radius:999px;font-size:12.5px;
  background:rgba(255,255,255,.35);backdrop-filter:blur(8px);color:#1f2d52;pointer-events:none;transition:background .4s,color .4s}
.ws.night .ws-hint{background:rgba(20,30,80,.4);color:#dfe6ff}
.ws-content{position:absolute;inset:0;z-index:20;isolation:isolate}

@media (prefers-reduced-motion:reduce){
  .ws-cloud,.ws-spin,.ws-rays,.ws-pulse,.ws-shoot,.ws-flies b,.ws-stars span{animation:none}
}
`;
