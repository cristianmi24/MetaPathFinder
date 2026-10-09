import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../ThemeContext';
import { LEGAL, LEGAL_ROUTES } from '../data/legalConfig';
import { TermsOfUse, PrivacyPolicy } from '../components/legal/LegalDocuments';
import { SiteFooter } from '../components/SiteFooter';

const DOCS = {
  terms: { title: 'Términos y Condiciones de Uso', Icon: FileText, to: LEGAL_ROUTES.terms, Content: TermsOfUse },
  privacy: { title: 'Política de Privacidad y Tratamiento de Datos Personales', Icon: ShieldCheck, to: LEGAL_ROUTES.privacy, Content: PrivacyPolicy },
} as const;

export function LegalPage({ doc }: { doc: keyof typeof DOCS }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const current = DOCS[doc];

  useEffect(() => {
    document.title = `${current.title} · ${LEGAL.platform}`;
    window.scrollTo(0, 0);
  }, [current.title]);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      <header className="w-full border-b border-outline-variant/50 bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
            className="ui-sans inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <nav aria-label="Documentos legales" className="ui-sans flex items-center gap-1 text-sm">
            {(Object.keys(DOCS) as (keyof typeof DOCS)[]).map((key) => (
              <Link
                key={key}
                to={DOCS[key].to}
                className={cn(
                  'px-3 py-1.5 rounded-md font-medium transition-colors',
                  key === doc
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                )}
              >
                {key === 'terms' ? 'Términos' : 'Privacidad'}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-start gap-3 mb-2">
          <current.Icon className="w-6 h-6 text-primary shrink-0 mt-1" />
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-on-surface">{current.title}</h1>
        </div>
        <p className="ui-sans text-xs text-on-surface-variant mb-8">
          Versión {LEGAL.version} · Última actualización: {LEGAL.updatedAt}
        </p>
        <current.Content />
      </main>

      <SiteFooter theme={theme} />
    </div>
  );
}
