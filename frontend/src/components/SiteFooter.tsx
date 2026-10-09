import { Link } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import { cn } from '../lib/utils';
import { LEGAL, LEGAL_ROUTES } from '../data/legalConfig';

export function SiteFooter({ theme }: { theme: 'light' | 'dark' }) {
  const light = theme === 'light';
  const linkClass = cn(
    'font-semibold underline-offset-4 hover:underline transition-colors',
    light ? 'text-slate-800 hover:text-primary' : 'text-white hover:text-white/80'
  );

  return (
    <footer
      className={cn(
        'w-full mt-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-5 backdrop-blur-md border-t',
        light ? 'bg-white/40 border-white/40 text-slate-600' : 'bg-slate-950/40 border-white/10 text-white/70'
      )}
    >
      <div className="mx-auto w-full max-w-6xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-center md:justify-start gap-2 text-xs sm:text-sm font-bold">
          <img src="/logo.png" alt="" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
          {LEGAL.platform} — Investigación en metacognición
        </div>
        <nav aria-label="Información legal" className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 gap-y-1 text-xs sm:text-sm">
          <Link to={LEGAL_ROUTES.terms} className={linkClass}>Términos y Condiciones</Link>
          <Link to={LEGAL_ROUTES.privacy} className={linkClass}>Privacidad y Datos Personales</Link>
        </nav>
      </div>

      <div
        className={cn(
          'mx-auto w-full max-w-6xl mt-3 pt-3 border-t flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-center sm:text-left text-[11px] sm:text-xs',
          light ? 'border-slate-400/30' : 'border-white/10'
        )}
      >
        <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 font-semibold">
          <Landmark className="w-3.5 h-3.5 shrink-0" />
          Proyecto de la {LEGAL.institution} · {LEGAL.institutionLocation}
        </span>
        <span>© {new Date().getFullYear()} {LEGAL.platform}. Todos los derechos reservados.</span>
      </div>
    </footer>
  );
}
