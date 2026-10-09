import { useMemo, useState } from 'react';
import { Search, Copy, Check } from 'lucide-react';
import { jolGenerales } from '../data/jolGenerales';
import { dynamicChallengeBank } from '../data/dynamicChallengeBank';
import { cn } from '../lib/utils';

const NIVELES = ['Todos', 'Básico', 'Medio', 'Avanzado'] as const;
type Nivel = (typeof NIVELES)[number];

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Banco de JOL: muestra solo el texto de los JOL generales y de los específicos de cada reto. */
export function JolBank() {
  const [nivel, setNivel] = useState<Nivel>('Todos');
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const q = normalize(query.trim());
  const matches = (...texts: string[]) => !q || texts.some((t) => normalize(t).includes(q));
  const byNivel = (n: string) => nivel === 'Todos' || n === nivel;

  const generales = useMemo(
    () => jolGenerales.filter((j) => byNivel(j.nivel) && matches(j.pregunta, j.codigo, j.dimension)),
    [nivel, q],
  );
  const retos = useMemo(
    () =>
      dynamicChallengeBank.filter(
        (c) => byNivel(c.nivel) && matches(c.titulo, c.id, c.jol_esp_1.pregunta, c.jol_esp_2.pregunta),
      ),
    [nivel, q],
  );

  const total = generales.length + retos.length * 2;

  const copyAll = async () => {
    const lines: string[] = ['JOL GENERALES', ''];
    generales.forEach((j) => lines.push(`${j.codigo} (${j.nivel}): ${j.pregunta}`, `   Escala: ${j.escala}`));
    lines.push('', 'JOL POR RETO', '');
    retos.forEach((c) => {
      lines.push(`${c.id} · ${c.titulo}`);
      lines.push(`   JOL inicial: ${c.jol_esp_1.pregunta}`, `      Escala: ${c.jol_esp_1.escala}`);
      lines.push(`   JOL final: ${c.jol_esp_2.pregunta}`, `      Escala: ${c.jol_esp_2.escala}`, '');
    });
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* el navegador no permitió copiar */
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-on-surface">Banco de JOL</h1>
          <p className="ui-sans mt-1 text-sm text-on-surface-variant">
            Juicios de aprendizaje que responde el estudiante antes de cada reto · {total} preguntas
          </p>
        </div>
        <button
          type="button"
          onClick={copyAll}
          className="ui-sans inline-flex items-center gap-2 rounded-full border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copiado' : 'Copiar texto'}
        </button>
      </header>

      <div className="ui-sans mb-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-full border border-outline-variant p-1">
          {NIVELES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNivel(n)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition',
                nivel === n ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface',
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full border border-outline-variant px-4 py-2">
          <Search className="h-4 w-4 shrink-0 text-on-surface-variant" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por reto, código o texto…"
            className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
          />
        </label>
      </div>

      {/* JOL generales */}
      <section className="mb-10">
        <h2 className="ui-sans mb-3 font-mono text-xs uppercase tracking-[0.12em] text-on-surface-variant">
          JOL generales · {generales.length}
        </h2>
        {generales.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Sin resultados.</p>
        ) : (
          <ol className="divide-y divide-outline-variant/40 rounded-2xl border border-outline-variant/60 bg-surface">
            {generales.map((j) => (
              <li key={j.id} className="flex gap-4 px-5 py-4">
                <span className="ui-sans w-20 shrink-0 pt-0.5 font-mono text-xs text-primary">{j.codigo}</span>
                <div className="min-w-0">
                  <p className="text-[15px] leading-relaxed text-on-surface">{j.pregunta}</p>
                  <p className="ui-sans mt-1 text-xs text-on-surface-variant">
                    {j.nivel} · Escala: {j.escala}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* JOL por reto */}
      <section>
        <h2 className="ui-sans mb-3 font-mono text-xs uppercase tracking-[0.12em] text-on-surface-variant">
          JOL por reto · {retos.length} retos
        </h2>
        {retos.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Sin resultados.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {retos.map((c) => (
              <article key={c.id} className="rounded-2xl border border-outline-variant/60 bg-surface px-5 py-4">
                <div className="ui-sans mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-xs text-primary">{c.id}</span>
                  <h3 className="text-[15px] font-semibold text-on-surface">{c.titulo}</h3>
                  <span className="text-xs text-on-surface-variant">
                    {c.nivel} · {c.sub_nivel}
                  </span>
                </div>
                <ol className="flex flex-col gap-3">
                  {[c.jol_esp_1, c.jol_esp_2].map((j, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="ui-sans w-20 shrink-0 pt-0.5 font-mono text-xs text-on-surface-variant">
                        {i === 0 ? 'JOL inicial' : 'JOL final'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[15px] leading-relaxed text-on-surface">{j.pregunta}</p>
                        <p className="ui-sans mt-1 text-xs text-on-surface-variant">Escala: {j.escala}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
