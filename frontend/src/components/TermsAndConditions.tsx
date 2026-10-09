import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { LEGAL, LEGAL_ROUTES } from '../data/legalConfig';
import { TermsOfUse, PrivacyPolicy } from './legal/LegalDocuments';

type Doc = 'terms' | 'privacy';

interface TermsCheckboxProps {
  /** true solo cuando AMBAS declaraciones están aceptadas */
  checked: boolean;
  onChange: (checked: boolean) => void;
  dark?: boolean;
}

export function TermsCheckbox({ checked, onChange, dark }: TermsCheckboxProps) {
  const [terms, setTerms] = useState(checked);
  const [guardian, setGuardian] = useState(checked);
  const [openDoc, setOpenDoc] = useState<Doc | null>(null);

  // Si el formulario padre se reinicia (checked pasa a false con ambas marcadas), se limpian las casillas.
  useEffect(() => {
    if (!checked && terms && guardian) {
      setTerms(false);
      setGuardian(false);
    }
  }, [checked]);

  const update = (t: boolean, g: boolean) => {
    setTerms(t);
    setGuardian(g);
    onChange(t && g);
  };

  const textClass = dark ? 'text-white/80' : 'text-slate-700';
  const linkClass = 'font-bold text-primary underline underline-offset-2 hover:opacity-80';
  const openLink = (doc: Doc, label: string) => (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); setOpenDoc(doc); }}
      className={linkClass}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className="space-y-3 text-xs leading-relaxed">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => update(e.target.checked, guardian)}
            required
            className="mt-0.5 w-4 h-4 shrink-0 accent-primary cursor-pointer"
          />
          <span className={textClass}>
            He leído y acepto los {openLink('terms', 'Términos y Condiciones')} y la{' '}
            {openLink('privacy', 'Política de Privacidad y Tratamiento de Datos Personales')}, y autorizo el tratamiento
            de mis datos personales, incluida su transmisión y transferencia internacional.
          </span>
        </label>

        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={guardian}
            onChange={(e) => update(terms, e.target.checked)}
            required
            className="mt-0.5 w-4 h-4 shrink-0 accent-primary cursor-pointer"
          />
          <span className={textClass}>
            Declaro que soy mayor de edad o que mi padre, madre o representante legal conoce y autoriza el uso de la
            Plataforma y el tratamiento de mis datos personales.
          </span>
        </label>
      </div>

      {/* Portal: el padre usa backdrop-filter, que atraparía un modal position:fixed dentro de la tarjeta */}
      {openDoc && createPortal(
        <LegalModal
          initialDoc={openDoc}
          onClose={() => setOpenDoc(null)}
          onAccept={() => { update(true, guardian); setOpenDoc(null); }}
        />,
        document.body
      )}
    </>
  );
}

function LegalModal({ initialDoc, onClose, onAccept }: { initialDoc: Doc; onClose: () => void; onAccept: () => void }) {
  const [doc, setDoc] = useState<Doc>(initialDoc);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const tabs: { id: Doc; label: string }[] = [
    { id: 'terms', label: 'Términos y Condiciones' },
    { id: 'privacy', label: 'Política de Privacidad' },
  ];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Documentos legales"
        className="w-full max-w-2xl max-h-[88vh] flex flex-col bg-surface-container-lowest text-on-surface rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-outline-variant/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0">
              <h2 className="ui-sans text-sm font-semibold truncate">Documentos legales · {LEGAL.platform}</h2>
              <p className="ui-sans text-[11px] text-on-surface-variant">Versión {LEGAL.version} · {LEGAL.updatedAt}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="ui-sans flex gap-1 px-4 pt-3 border-b border-outline-variant/60">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setDoc(t.id)}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-t-md border-b-2 -mb-px transition-colors',
                doc === t.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto px-5 py-5">
          {doc === 'terms' ? <TermsOfUse /> : <PrivacyPolicy />}
        </div>

        <div className="ui-sans flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-outline-variant/60">
          <a
            href={doc === 'terms' ? LEGAL_ROUTES.terms : LEGAL_ROUTES.privacy}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-primary hover:underline underline-offset-4"
          >
            Abrir en una pestaña nueva
          </a>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={onAccept}
              className="px-5 py-2 rounded-xl text-sm font-bold text-on-primary bg-primary hover:opacity-90 transition-opacity"
            >
              Acepto los términos y la política
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
