import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "../ThemeContext";

const PALETTE_LIGHT = [
  "rgba(103,75,181,.95)", // Purple
  "rgba(0,107,94,.95)",   // Teal
  "rgba(180,160,255,.8)",  // Light Purple
  "rgba(0,180,160,.75)",  // Light Teal
  "rgba(248,250,252,.6)",  // Off White
];

const PALETTE_DARK = [
  "rgba(206,189,255,.95)", // Light Purple
  "rgba(122,215,198,.95)", // Light Teal
  "rgba(232,221,255,.8)",  // Very Light Purple
  "rgba(150,243,225,.75)", // Very Light Teal
  "rgba(226,243,255,.6)",  // Very Light Blue
];

const DEFAULT_CONFIG = { numNodes: 500, addEdge: 9, speed: 0.9, force: 4.2, type: 0.5 };

class Node {
  w: number;
  h: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;

  constructor(w: number, h: number, cfg: any, palette: string[]) {
    this.w = w;
    this.h = h;
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    const spd = cfg?.speed ?? 0.9;
    this.vx = (Math.random() - .5) * spd;
    this.vy = (Math.random() - .5) * spd;
    this.size = Math.random() * 2 + 1;
    this.color = palette[Math.floor(Math.random() * palette.length)];
  }

  update(cfg: any) {
    const spd = cfg.speed ?? 0.9;
    const mag = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (mag > 0) {
      this.vx = this.vx / mag * spd;
      this.vy = this.vy / mag * spd;
    }
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > this.w) this.vx *= -1;
    if (this.y < 0 || this.y > this.h) this.vy *= -1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

export function BackgroundNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef<number>(0);
  const configRef = useRef(DEFAULT_CONFIG);
  const { theme } = useTheme();

  const initNodes = useCallback((w: number, h: number, cfg: any) => {
    const palette = theme === 'light' ? PALETTE_LIGHT : PALETTE_DARK;
    const count = Math.min(1000, Math.max(1, cfg.numNodes));
    nodesRef.current = Array.from({ length: count }, () => new Node(w, h, cfg, palette));
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    initNodes(w, h, configRef.current);

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      nodesRef.current.forEach(n => { n.w = w; n.h = h; });
    };
    window.addEventListener("resize", onResize);

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      const cfg = configRef.current;
      const nodes = nodesRef.current;
      const threshold = 80 + cfg.force * 12;
      const t = parseFloat(cfg.type.toString());
      const r = Math.round(103 * (1 - t));
      const g = Math.round(75 * (1 - t) + 107 * t);
      const bl = Math.round(181 * (1 - t) + 94 * t);

      nodes.forEach(n => { n.update(cfg); n.draw(ctx); });

      for (let a = 0; a < nodes.length; a++) {
        let count = 0;
        for (let b = a + 1; b < nodes.length; b++) {
          if (count >= cfg.addEdge) break;
          const dx = nodes[a].x - nodes[b].x;
          const dy = nodes[a].y - nodes[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < threshold) {
            const alpha = (1 - dist / threshold) * 0.4;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(nodes[b].x, nodes[b].y);
            ctx.stroke();
            count++;
          }
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [initNodes]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      style={{
        background: theme === 'light' 
          ? "radial-gradient(ellipse at 25% 35%, #e8f6ff 0%, #d9ebf7 50%, #f4faff 100%)"
          : "radial-gradient(ellipse at 25% 35%, #1a0f2e 0%, #071510 50%, #0F172A 100%)",
      }}
    />
  );
}
