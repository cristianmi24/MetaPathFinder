import { useEffect, useRef, useState, type ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import './tutor.css';

/** Botón «¿Por qué veo esto?» con explicación emergente (IA explicable). */
export function WhyThis({ label = '¿Por qué veo esto?', title = 'Cómo decidió el tutor', children }: { label?: string; title?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div className="tut-why" ref={ref}>
      <button type="button" className="tut-why-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <HelpCircle size={12} /> {label}
      </button>
      {open && (
        <div className="tut-why-pop" role="dialog" aria-label={title}>
          <h5>{title}</h5>
          {children}
        </div>
      )}
    </div>
  );
}
