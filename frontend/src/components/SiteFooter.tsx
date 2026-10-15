import { Link } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import { cn } from '../lib/utils';
import { LEGAL, LEGAL_ROUTES } from '../data/legalConfig';
import type { InfoDialogId } from './InfoDialogs';

interface SiteFooterProps {
  theme: 'light' | 'dark';
  /** En el inicio abre las ventanas directamente; en otras páginas se enlaza al inicio. */
  onOpenInfo?: (id: InfoDialogId) => void;
}

export function SiteFooter({ theme, onOpenInfo }: SiteFooterProps) {
  const light = theme === 'light';
  const heading = cn('text-[11px] font-semibold uppercase tracking-[0.16em] mb-3', light ? 'text-slate-500' : 'text-white/50');
  const link = cn('text-sm transition-colors', light ? 'text-slate-700 hover:text-primary' : 'text-white/80 hover:text-white');

  const infoLink = (id: InfoDialogId, label: string) =>
    onOpenInfo ? (
      <button type="button" onClick={() => onOpenInfo(id)} className={cn(link, 'text-left')}>
        {label}
      </button>
    ) : (
      <Link to={`/?info=${id}`} className={link}>
        {label}
      </Link>
    );

  return (
    <footer
      className={cn(
        'ui-sans w-full mt-auto backdrop-blur-xl border-t',
        light ? 'bg-white/60 border-white/60 text-slate-600' : 'bg-slate-950/60 border-white/10 text-white/70'
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 py-8 grid gap-8 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="w-8 h-8 object-contain" />
            <span className={cn('font-serif text-lg font-semibold', light ? 'text-slate-900' : 'text-white')}>
              {LEGAL.platform}
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            Aprende a conocer cómo aprendes: planifica, resuelve y reflexiona sobre tu propio proceso.
          </p>
        </div>

        <nav aria-label="Navegación">
          <div className={heading}>Explorar</div>
          <ul className="space-y-2">
            <li><Link to="/" className={link}>Inicio</Link></li>
            <li>{infoLink('about', '¿De qué trata?')}</li>
            <li>{infoLink('credits', 'Créditos')}</li>
          </ul>
        </nav>

        <nav aria-label="Información legal">
          <div className={heading}>Legal</div>
          <ul className="space-y-2">
            <li><Link to={LEGAL_ROUTES.terms} className={link}>Términos y Condiciones</Link></li>
            <li><Link to={LEGAL_ROUTES.privacy} className={link}>Privacidad y Datos Personales</Link></li>
          </ul>
        </nav>
      </div>

      <div className={cn('border-t', light ? 'border-slate-900/10' : 'border-white/10')}>
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 py-4 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 shrink-0" />
            Proyecto de la {LEGAL.institution} · {LEGAL.institutionLocation}
          </span>
          <span>© {new Date().getFullYear()} {LEGAL.platform}. Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
