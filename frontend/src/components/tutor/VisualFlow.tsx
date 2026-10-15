import './tutor.css';

/**
 * Diagrama de flujo generado a partir de los pasos del reto (modalidad visual, UI-01).
 * Misma información que la versión verbal: inicio → pasos → decisión «¿cumple los criterios?» → fin.
 */
export function VisualFlow({ steps, meta }: { steps: string[]; meta?: string }) {
  const W = 560, boxW = 400, boxH = 54, gap = 26, x = (W - boxW) / 2;
  const clean = steps.map((s) => s.replace(/^\d+\.\s*/, '').replace(/^[📌▸✅]\s*/, ''));
  const items = clean.slice(0, 8);
  const top = 70;
  const diamondY = top + items.length * (boxH + gap);
  const H = diamondY + 150;

  const wrap = (t: string, max = 58): string[] => {
    const words = t.split(' '); const lines: string[] = []; let cur = '';
    for (const w of words) { if ((cur + ' ' + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur = (cur + ' ' + w).trim(); }
    if (cur) lines.push(cur); return lines.slice(0, 2);
  };

  return (
    <svg className="tut-flow" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Diagrama de flujo del reto">
      <defs>
        <marker id="tut-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--text-muted)" />
        </marker>
      </defs>
      <rect className="term" x={W / 2 - 70} y={10} width={140} height={36} rx={18} />
      <text x={W / 2} y={33} textAnchor="middle" fontSize="13" fontWeight="700">Inicio</text>
      <line className="arrow" x1={W / 2} y1={46} x2={W / 2} y2={top - 2} />
      {items.map((s, i) => {
        const y = top + i * (boxH + gap);
        const lines = wrap(s);
        return (
          <g key={i}>
            <rect className="box" x={x} y={y} width={boxW} height={boxH} rx={10} />
            <circle cx={x + 20} cy={y + boxH / 2} r={11} fill="var(--accent)" />
            <text x={x + 20} y={y + boxH / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{i + 1}</text>
            {lines.map((l, j) => (
              <text key={j} x={x + 42} y={y + (lines.length === 1 ? boxH / 2 + 4 : 22 + j * 16)} fontSize="12">{l}</text>
            ))}
            <line className="arrow" x1={W / 2} y1={y + boxH} x2={W / 2} y2={y + boxH + gap - 2} />
          </g>
        );
      })}
      <polygon className="diamond" points={`${W / 2},${diamondY} ${W / 2 + 150},${diamondY + 40} ${W / 2},${diamondY + 80} ${W / 2 - 150},${diamondY + 40}`} />
      <text x={W / 2} y={diamondY + 38} textAnchor="middle" fontSize="12" fontWeight="700">¿Cumple los criterios</text>
      <text x={W / 2} y={diamondY + 54} textAnchor="middle" fontSize="12" fontWeight="700">al verificar?</text>
      <path className="arrow" d={`M ${W / 2 - 150} ${diamondY + 40} H ${60} V ${top + boxH / 2} H ${x - 2}`} />
      <text className="lbl" x={70} y={diamondY + 32}>No · relee la meta y ajusta</text>
      <line className="arrow" x1={W / 2} y1={diamondY + 80} x2={W / 2} y2={diamondY + 108} />
      <text className="lbl" x={W / 2 + 8} y={diamondY + 98}>Sí</text>
      <rect className="term" x={W / 2 - 90} y={diamondY + 110} width={180} height={36} rx={18} />
      <text x={W / 2} y={diamondY + 133} textAnchor="middle" fontSize="13" fontWeight="700">{meta ? 'Meta lograda' : 'Fin'}</text>
    </svg>
  );
}
