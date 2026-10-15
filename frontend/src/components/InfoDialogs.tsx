import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X, Target, Puzzle, LineChart, Landmark } from 'lucide-react';
import { LEGAL } from '../data/legalConfig';
import { CREDITS } from '../data/credits';

export type InfoDialogId = 'about' | 'credits';

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-sm p-0 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl border border-slate-200/70 dark:border-white/10"
      >
        <div className="sticky top-0 flex items-center justify-between gap-4 px-6 pt-5 pb-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
          <h2 className="font-serif text-2xl font-semibold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="ui-sans rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

const PHASES = [
  { icon: Target, title: 'Antes', text: 'Estimas qué tan preparado/a te sientes y cuánto tiempo necesitarás.' },
  { icon: Puzzle, title: 'Durante', text: 'Resuelves un reto con herramientas de una estrategia que te ayudan a organizarte.' },
  { icon: LineChart, title: 'Después', text: 'Comparas lo que creías con lo que lograste y reflexionas sobre ello.' },
];

function AboutContent() {
  return (
    <div className="ui-sans space-y-5">
      <p className="font-serif text-[17px] leading-relaxed text-slate-700 dark:text-slate-200">
        {LEGAL.platform} es una plataforma para aprender a conocer cómo aprendes. No es una prueba: es un
        análisis de tu proceso, para que sepas cuándo confiar en lo que sabes y cuándo pedir apoyo.
      </p>
      <ol className="space-y-3">
        {PHASES.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="flex gap-4 rounded-2xl bg-slate-50 dark:bg-white/5 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {i + 1}. {title}
              </div>
              <p className="mt-0.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Los retos siguen las orientaciones de Tecnología e Informática del MEN y se agrupan en niveles básico,
        medio y avanzado.
      </p>
    </div>
  );
}

function CreditsContent() {
  const section = (label: string, people: { name: string; role: string }[]) => (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{label}</h3>
      <ul className="divide-y divide-slate-200/70 dark:divide-white/10 rounded-2xl border border-slate-200/70 dark:border-white/10">
        {people.map((p) => (
          <li key={p.name} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-4 py-3">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{p.name}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">{p.role}</span>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <div className="ui-sans space-y-5">
      <div className="flex items-center gap-4 rounded-2xl bg-primary/5 dark:bg-primary/10 p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Landmark className="h-5 w-5" />
        </span>
        <div>
          <div className="font-serif text-lg font-semibold">{LEGAL.institution}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{LEGAL.institutionLocation}</div>
        </div>
      </div>
      {CREDITS.team.length > 0 && section('Equipo', CREDITS.team)}
      {section('Construido con', CREDITS.tools)}
      <p className="text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {LEGAL.platform}
      </p>
    </div>
  );
}

/** Ventanas «De qué trata» y «Créditos» del inicio. */
export function InfoDialogs({ open, onClose }: { open: InfoDialogId | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open === 'about' && (
        <Dialog key="about" title="¿De qué trata?" onClose={onClose}>
          <AboutContent />
        </Dialog>
      )}
      {open === 'credits' && (
        <Dialog key="credits" title="Créditos" onClose={onClose}>
          <CreditsContent />
        </Dialog>
      )}
    </AnimatePresence>
  );
}
