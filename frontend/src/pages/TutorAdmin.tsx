import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity, ArrowDownUp, ArrowLeft, Bot, CheckCircle2, ChevronDown, ChevronRight, Clock, Gauge, Hand,
  LifeBuoy, Lightbulb, RefreshCw, Route, Search, ShieldAlert, Sparkles, Target, Users, XCircle,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList, CartesianGrid } from 'recharts';
import {
  api, type InterventionKind, type TutorAdminActivity, type TutorAdminOverview, type TutorAdminStudent,
  type TutorAdminStudentRow, type TutorIntervention,
} from '../services/api';
import { useTheme } from '../ThemeContext';
import { cn } from '../lib/utils';
import { dynamicChallengeBank } from '../data/dynamicChallengeBank';
import { getEstrategia } from '../data/metacognitiveStrategies';
import { LEVEL_SHORT, PROFILE_LABEL } from '../lib/tutorEngine';
import '../components/tutor/tutor.css';

/* ── Tipos de intervención: orden fijo y colores validados (claro / oscuro) ─────────── */
const KIND_META: Record<InterventionKind, { label: string; short: string; letter: string; light: string; dark: string; icon: typeof Lightbulb; desc: string }> = {
  pista: { label: 'Pista pedida', short: 'Pistas', letter: 'P', light: '#2a78d6', dark: '#3987e5', icon: Lightbulb, desc: 'El estudiante abrió una pista (1/3, 2/3, 3/3) o el tutor le recomendó una por pares.' },
  pista_auto: { label: 'Pista automática', short: 'Auto', letter: 'A', light: '#eb6834', dark: '#d95926', icon: Sparkles, desc: 'El tutor mostró la pista 1 solo, tras dos intentos fallidos.' },
  andamiaje: { label: 'Andamiaje N0–N3', short: 'Andamiaje', letter: 'N', light: '#1baf7a', dark: '#199e70', icon: Bot, desc: 'Mensaje contingente según la probabilidad de bloqueo (pregunta, orientación, estrategia, paso parcial).' },
  punto_control: { label: 'Punto de control', short: 'Control', letter: 'C', light: '#eda100', dark: '#c98500', icon: Gauge, desc: 'El tutor pidió la confianza durante el reto o el juicio de certeza antes de verificar.' },
  replanificacion: { label: 'Replanificación', short: 'Replan.', letter: 'R', light: '#e87ba4', dark: '#d55181', icon: Route, desc: 'Tres errores seguidos: pantalla atenuada y cambio de táctica (guiado, simplificado o seguir).' },
  freno: { label: 'Freno metacognitivo', short: 'Freno', letter: 'F', light: '#6250d6', dark: '#9085e9', icon: ShieldAlert, desc: 'Respuesta mucho más rápida que el propio ritmo: pausa reflexiva obligatoria.' },
};
const KINDS = Object.keys(KIND_META) as InterventionKind[];
const LADDER_META = [
  { key: 'N0', label: 'N0 · Pregunta metacognitiva', step: 1 },
  { key: 'N1', label: 'N1 · Orientación', step: 2 },
  { key: 'N2', label: 'N2 · Recordatorio de estrategia', step: 3 },
  { key: 'N3', label: 'N3 · Paso parcial', step: 4 },
  { key: 'P1', label: 'Pista 1 · Pregunta reflexiva', step: 1 },
  { key: 'P2', label: 'Pista 2 · Señalamiento del error', step: 2 },
  { key: 'P3', label: 'Pista 3 · Solución análoga', step: 4 },
];
const REFRESH_MS = 20000;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const challengeTitle = (id: string) => dynamicChallengeBank.find((c) => c.id === id)?.titulo ?? id;
const pct = (v: number | null | undefined) => (v === null || v === undefined ? '—' : `${Math.round(v * 100)} %`);
const mmss = (s: number | null | undefined) => (s === null || s === undefined ? '—' : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`);
function ago(iso: string | null | undefined): string {
  if (!iso) return '—';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'hace segundos';
  if (s < 3600) return `hace ${Math.round(s / 60)} min`;
  if (s < 86400) return `hace ${Math.round(s / 3600)} h`;
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}
const dateTime = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
const levelLabel = (it: TutorIntervention) => {
  if (it.level === null || it.level === undefined) return '—';
  if (it.kind === 'pista' || it.kind === 'pista_auto') return it.level === 'pares' ? 'Por pares' : `${it.level}/3`;
  if (it.kind === 'punto_control') return it.level === 'certeza' ? 'Certeza' : 'Confianza';
  if (it.kind === 'replanificacion') return `${it.level} errores`;
  return String(it.level);
};

/* ── Piezas ───────────────────────────────────────────────────────────────── */
function Card({ title, subtitle, right, children, className }: { title?: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-sm', className)}>
      {title && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-on-surface">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-on-surface-variant">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

function Kpi({ icon: Icon, label, value, hint, tone }: { icon: typeof Users; label: string; value: string | number; hint?: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
        <span className={cn('flex h-7 w-7 items-center justify-center rounded-full', tone)}><Icon className="h-3.5 w-3.5" /></span>
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-on-surface">{value}</div>
      {hint && <div className="mt-1 text-xs text-on-surface-variant">{hint}</div>}
    </div>
  );
}

function KindLegend({ counts }: { counts?: Partial<Record<InterventionKind, number>> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {KINDS.map((k) => (
        <span key={k} className="ta-pill" title={KIND_META[k].desc}>
          <i className="ta-kind-dot" style={{ background: `var(--k-${k})` }} />
          {KIND_META[k].label}{counts ? <b className="font-mono">{counts[k] ?? 0}</b> : null}
        </span>
      ))}
      <span className="ta-pill" title="Forma de la marca en la línea de tiempo">■ inicia el tutor · ● inicia el estudiante</span>
    </div>
  );
}

function KindStack({ byKind, total }: { byKind: Record<InterventionKind, number>; total: number }) {
  if (!total) return <span className="text-xs text-on-surface-variant">Sin intervenciones</span>;
  return (
    <div className="ta-stack" title={KINDS.filter((k) => byKind[k]).map((k) => `${KIND_META[k].label}: ${byKind[k]}`).join(' · ')}>
      {KINDS.filter((k) => byKind[k]).map((k) => (
        <span key={k} style={{ width: `${(byKind[k] / total) * 100}%`, background: `var(--k-${k})` }} />
      ))}
    </div>
  );
}

function Ladder({ ladder }: { ladder: Record<string, number> }) {
  const max = Math.max(1, ...LADDER_META.map((l) => ladder[l.key] ?? 0));
  return (
    <div className="space-y-2">
      {LADDER_META.map((l, i) => (
        <div key={l.key} className={cn(i === 4 && 'mt-3 border-t border-outline-variant/40 pt-3')}>
          <div className="flex items-baseline justify-between text-xs text-on-surface-variant">
            <span>{l.label}</span><span className="font-mono text-on-surface">{ladder[l.key] ?? 0}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-surface-container">
            <div className="h-2 rounded-full" style={{ width: `${((ladder[l.key] ?? 0) / max) * 100}%`, background: `var(--ladder-${l.step})` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ZdpPill({ zdp }: { zdp: string | null }) {
  if (!zdp) return <span className="text-xs text-on-surface-variant">—</span>;
  return <span className="ta-pill"><Target className="h-3 w-3" /> {LEVEL_SHORT[zdp]}</span>;
}

function ResultPill({ result }: { result: TutorAdminActivity['result'] }) {
  if (!result) return <span className="ta-pill"><Clock className="h-3 w-3" /> En curso / sin entregar</span>;
  return result.passed
    ? <span className="ta-pill" style={{ color: 'var(--ok)' }}><CheckCircle2 className="h-3 w-3" /> Superado · {Math.round(result.score ?? 0)}/100</span>
    : <span className="ta-pill" style={{ color: 'var(--danger)' }}><XCircle className="h-3 w-3" /> No superado · {Math.round(result.score ?? 0)}/100</span>;
}

/* ── Línea de tiempo de una actividad ─────────────────────────────────────── */
function Timeline({ activity }: { activity: TutorAdminActivity }) {
  const [hover, setHover] = useState<string | null>(null);
  const items = activity.interventions;
  const lastT = Math.max(0, ...items.map((i) => i.t_seconds ?? 0));
  const duration = Math.max(activity.result?.time_spent_seconds ?? 0, lastT + 20, 60);
  if (items.length === 0) {
    return <p className="rounded-xl bg-surface-container px-4 py-3 text-sm text-on-surface-variant">El tutor no intervino en esta actividad: el estudiante avanzó sin señales de bloqueo.</p>;
  }
  return (
    <div>
      <div className="ta-track" role="list" aria-label="Momentos en que intervino el tutor">
        {items.map((it) => {
          const left = Math.min(97, Math.max(3, ((it.t_seconds ?? 0) / duration) * 100));
          const meta = KIND_META[it.kind];
          return (
            <button
              key={it.id} type="button" role="listitem"
              className={cn('ta-mark', it.initiator === 'estudiante' && 'estudiante')}
              style={{ left: `${left}%`, background: `var(--k-${it.kind})` }}
              onMouseEnter={() => setHover(it.id)} onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(it.id)} onBlur={() => setHover(null)}
              aria-label={`${mmss(it.t_seconds)} ${meta.label} ${levelLabel(it)}`}
            >
              {meta.letter}
              {hover === it.id && (
                <span className="ta-tip">
                  <b>{mmss(it.t_seconds)} · {meta.label}</b> ({levelLabel(it)})<br />
                  {it.tactic && <>Táctica: {it.tactic}<br /></>}
                  {it.detail && <>{it.detail}<br /></>}
                  {it.p_block !== null && it.p_block !== undefined && <>P(bloqueo): {Math.round(it.p_block * 100)} %<br /></>}
                  Inicia: {it.initiator === 'tutor' ? 'el tutor' : 'el estudiante'}
                  {it.response && <><br />Respuesta: <b>{it.response}</b></>}
                </span>
              )}
            </button>
          );
        })}
        <div className="ta-track-axis"><span>0:00</span><span>{mmss(duration / 2)}</span><span>{mmss(duration)}</span></div>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="ta-table">
          <thead>
            <tr><th>Minuto</th><th>Tipo</th><th>Nivel</th><th>Táctica</th><th>Inicia</th><th className="ta-num">P(bloqueo)</th><th>Detalle</th><th>Respuesta del estudiante</th></tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td className="font-mono ta-nowrap">{mmss(it.t_seconds)}</td>
                <td className="ta-nowrap"><span className="inline-flex items-center gap-1.5"><i className="ta-kind-dot" style={{ background: `var(--k-${it.kind})` }} />{KIND_META[it.kind].label}</span></td>
                <td>{levelLabel(it)}</td>
                <td>{it.tactic ?? '—'}</td>
                <td>{it.initiator === 'tutor' ? <span className="ta-pill"><Bot className="h-3 w-3" /> Tutor</span> : <span className="ta-pill"><Hand className="h-3 w-3" /> Estudiante</span>}</td>
                <td className="ta-num">{it.p_block !== null && it.p_block !== undefined ? `${Math.round(it.p_block * 100)} %` : '—'}</td>
                <td className="text-on-surface-variant">{it.detail ?? '—'}</td>
                <td>{it.response ?? <span className="text-on-surface-variant">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityCard({ a, defaultOpen }: { a: TutorAdminActivity; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const strategy = getEstrategia(a.plan?.strategy?.strategy_id ?? a.strategy_id);
  const gap = a.calibration?.gap;
  return (
    <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest shadow-sm">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-left">
        {open ? <ChevronDown className="h-4 w-4 text-on-surface-variant" /> : <ChevronRight className="h-4 w-4 text-on-surface-variant" />}
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-on-surface">{challengeTitle(a.challenge_id)}</div>
          <div className="text-xs text-on-surface-variant">{a.challenge_id} · {dateTime(a.completed_at ?? a.started_at)}{a.result ? ` · ${mmss(a.result.time_spent_seconds)} min · ${a.result.attempts} intentos` : ''}</div>
        </div>
        <ResultPill result={a.result} />
        <span className="ta-pill"><Bot className="h-3 w-3" /> {plural(a.total_interventions, 'intervención', 'intervenciones')}</span>
        <KindStack byKind={a.counts} total={a.total_interventions} />
        {gap !== null && gap !== undefined && <span className="ta-pill" title="Confianza − desempeño">Desfase {gap > 0 ? '+' : ''}{gap}</span>}
      </button>
      {open && (
        <div className="space-y-5 border-t border-outline-variant/40 px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {KINDS.filter((k) => a.counts[k]).map((k) => (
              <span key={k} className="ta-pill"><i className="ta-kind-dot" style={{ background: `var(--k-${k})` }} />{KIND_META[k].label} × {a.counts[k]}</span>
            ))}
          </div>
          <Timeline activity={a} />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-surface-container p-4 text-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Plan del tutor (Fase A)</div>
              <p><b>Estrategia:</b> {strategy?.nombre ?? '—'} {a.plan?.strategy?.method && <span className="text-on-surface-variant">({a.plan.strategy.method === 'thompson' ? 'muestreo de Thompson' : 'al azar · grupo control'})</span>}</p>
              {a.plan?.strategy?.reason && <p className="mt-1 text-on-surface-variant">{a.plan.strategy.reason}</p>}
              {a.plan?.challenge_reason && <p className="mt-2 text-on-surface-variant"><b className="text-on-surface">Por qué este reto:</b> {a.plan.challenge_reason}</p>}
              {a.overrides.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-on-surface-variant">
                  {a.overrides.map((o, i) => <li key={i}>Decisión propia ({o.kind}): eligió <b className="text-on-surface">{o.chosen ?? '—'}</b>{o.suggested ? ` en lugar de ${o.suggested}` : ''}{o.reason ? ` · ${o.reason}` : ''}</li>)}
                </ul>
              )}
            </div>
            <div className="rounded-xl bg-surface-container p-4 text-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Cierre (Fase C)</div>
              {a.calibration ? (
                <p>Confianza {a.calibration.jol?.toFixed(1)} · desempeño {a.calibration.performance?.toFixed(1)} · perfil <b>{PROFILE_LABEL[a.calibration.cluster] ?? a.calibration.cluster}</b>{a.calibration.banda ? ` · desfase ${a.calibration.banda}` : ''}</p>
              ) : <p className="text-on-surface-variant">Sin calibración registrada.</p>}
              {a.reading && (
                <p className="mt-1">Lectura del tutor: <b>{LEVEL_SHORT[a.reading.level]}</b> ({Math.round((a.reading.posterior[a.reading.level] ?? 0) * 100)} %)</p>
              )}
              {a.feedback && <p className="mt-2 rounded-lg bg-surface-container-lowest p-2">{a.feedback.message}</p>}
              {a.reflection_text && <p className="mt-2 italic text-on-surface-variant">«{a.reflection_text}»</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Detalle de un estudiante ─────────────────────────────────────────────── */
function StudentDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const [data, setData] = useState<TutorAdminStudent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    api.getTutorAdminStudent(id).then((d) => { setData(d); setError(null); }).catch((e) => setError((e as Error).message));
  }, [id]);
  useEffect(() => { load(); const t = setInterval(load, REFRESH_MS); return () => clearInterval(t); }, [load]);

  if (error && !data) return <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm">{error}</p>;
  if (!data) return <p className="text-sm text-on-surface-variant">Cargando…</p>;
  const { student, tutor, summary } = data;
  const strategy = getEstrategia(tutor.last_strategy);

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"><ArrowLeft className="h-4 w-4" /> Todos los estudiantes</button>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">{student.name}</h1>
          <p className="mt-1 text-sm text-on-surface-variant">{student.email} · registro {dateTime(student.created_at)}</p>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/50 bg-surface-container-lowest px-3 py-1.5 text-xs font-medium"><RefreshCw className="h-3.5 w-3.5" /> Actualizar</button>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi icon={Activity} label="Actividades" value={summary.activities} hint={plural(summary.completed, 'entregada', 'entregadas')} tone="bg-primary/15 text-primary" />
        <Kpi icon={CheckCircle2} label="Superadas" value={summary.passed} hint={summary.completed ? `${Math.round((summary.passed / summary.completed) * 100)} % de las entregadas` : '—'} tone="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" />
        <Kpi icon={Bot} label="Intervenciones" value={summary.interventions} hint={`${summary.by_initiator.tutor ?? 0} del tutor · ${summary.by_initiator.estudiante ?? 0} pedidas`} tone="bg-sky-500/15 text-sky-700 dark:text-sky-300" />
        <Kpi icon={Gauge} label="Por actividad" value={summary.per_activity ?? '—'} hint="Promedio de intervenciones" tone="bg-amber-500/15 text-amber-700 dark:text-amber-300" />
        <Kpi icon={Route} label="Replanificaciones" value={summary.by_kind.replanificacion} hint={plural(summary.by_kind.freno, 'freno metacognitivo', 'frenos metacognitivos')} tone="bg-pink-500/15 text-pink-700 dark:text-pink-300" />
        <Kpi icon={Hand} label="Decisiones propias" value={summary.overrides} hint="Rechazó una sugerencia del tutor" tone="bg-violet-500/15 text-violet-700 dark:text-violet-300" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Modelo del estudiante" subtitle="Lo que el tutor sabe hoy">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-on-surface-variant">ZDP metacognitiva</dt><dd><ZdpPill zdp={tutor.zdp.zdp} /></dd></div>
            <div className="flex justify-between gap-3"><dt className="text-on-surface-variant">Nivel consolidado</dt><dd>{tutor.zdp.consolidated ? LEVEL_SHORT[tutor.zdp.consolidated] : 'Ninguno aún'}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-on-surface-variant">Estilo</dt><dd>{tutor.learning_style?.label ?? 'Sin cuestionario'}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-on-surface-variant">Última calibración</dt><dd>{tutor.last_profile ? PROFILE_LABEL[tutor.last_profile] : '—'}{tutor.last_bias !== null ? ` (${tutor.last_bias > 0 ? '+' : ''}${tutor.last_bias})` : ''}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-on-surface-variant">Estrategia actual</dt><dd>{strategy?.nombre ?? '—'}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-on-surface-variant">Escalón técnico</dt><dd className="text-right font-mono text-xs">{Object.entries(tutor.overlay).map(([c, s]) => `${c} ${s.replace('-', '·')}`).join(' · ')}</dd></div>
          </dl>
        </Card>
        <Card title="Progresión metacognitiva" subtitle="Probabilidad de dominio por criterio (≥ 70 % y 3 obs. = logrado)">
          <div className="grid grid-cols-4 gap-2">
            {data.criteria_order.map((cid) => {
              const c = tutor.criteria[cid];
              return (
                <div key={cid} title={`${c.text} · ${c.n} observaciones`} className={cn('rounded-lg border p-2 text-center', c.mastered ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-outline-variant/50 bg-surface-container')}>
                  <div className="font-mono text-xs font-semibold">{cid}</div>
                  <div className="font-mono text-sm">{Math.round(c.p * 100)}%</div>
                  <div className="text-[10px] text-on-surface-variant">{c.mastered ? 'logrado' : `${c.n} obs.`}</div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card title="Escalera de ayuda" subtitle="Cuántas veces llegó a cada nivel">
          <Ladder ladder={summary.ladder} />
        </Card>
      </div>

      <Card title="Actividades" subtitle="Pasa el cursor por cada marca para ver cuándo y cómo intervino el tutor">
        <div className="mb-4"><KindLegend counts={summary.by_kind} /></div>
        <div className="space-y-3">
          {data.activities.length === 0 && <p className="text-sm text-on-surface-variant">Aún no hay actividades.</p>}
          {data.activities.map((a, i) => <ActivityCard key={`${a.session_id}-${a.challenge_id}`} a={a} defaultOpen={i === 0} />)}
        </div>
      </Card>
    </div>
  );
}

/* ── Vista general de la clase ────────────────────────────────────────────── */
type SortKey = 'name' | 'interventions' | 'per_activity' | 'activities' | 'passed' | 'last_intervention' | 'replan';

function Overview({ onOpen }: { onOpen: (id: string) => void }) {
  const { theme } = useTheme();
  const [data, setData] = useState<TutorAdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');
  const [onlyActive, setOnlyActive] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'interventions', dir: -1 });
  const [page, setPage] = useState(0);
  const PAGE = 15;
  useEffect(() => { setPage(0); }, [q, onlyActive, sort]);

  const load = useCallback(async () => {
    setRefreshing(true);
    try { setData(await api.getTutorAdminOverview()); setError(null); } catch (e) { setError((e as Error).message); } finally { setRefreshing(false); }
  }, []);
  useEffect(() => { load(); const t = setInterval(load, REFRESH_MS); return () => clearInterval(t); }, [load]);

  const rows = useMemo(() => {
    if (!data) return [];
    const val = (r: TutorAdminStudentRow): string | number => {
      switch (sort.key) {
        case 'name': return r.name.toLowerCase();
        case 'replan': return r.by_kind.replanificacion;
        case 'last_intervention': return r.last_intervention ? new Date(r.last_intervention).getTime() : 0;
        default: return (r[sort.key] as number | null) ?? -1;
      }
    };
    return data.students
      .filter((r) => (!onlyActive || r.active_now) && (`${r.name} ${r.email}`.toLowerCase().includes(q.toLowerCase())))
      .sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * sort.dir);
  }, [data, q, onlyActive, sort]);

  if (error && !data) return <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm">{error}</p>;
  if (!data) return <p className="text-sm text-on-surface-variant">Cargando…</p>;
  const s = data.summary;
  const chartData = KINDS.map((k) => ({ kind: k, name: KIND_META[k].label, value: data.by_kind[k] ?? 0 }));
  const color = (k: InterventionKind) => (theme === 'dark' ? KIND_META[k].dark : KIND_META[k].light);
  const ink = theme === 'dark' ? '#c3c2b7' : '#52514e';
  const SortTh = ({ k, children, num }: { k: SortKey; children: React.ReactNode; num?: boolean }) => (
    <th className={num ? 'ta-num' : undefined} aria-sort={sort.key === k ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
      <button type="button" onClick={() => setSort((p) => ({ key: k, dir: p.key === k ? (p.dir === 1 ? -1 : 1) : -1 }))}>
        {children} <ArrowDownUp className="h-3 w-3 opacity-60" />
      </button>
    </th>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">Intervenciones del tutor</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Cuándo, cómo y cuántas veces interviene el tutor con cada estudiante y en cada actividad.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant/50 bg-surface-container-lowest px-3 py-1.5">
            <span className="ta-live" /> En vivo · {s.active_now} trabajando ahora
          </span>
          <button type="button" onClick={load} className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/50 bg-surface-container-lowest px-3 py-1.5 font-medium text-on-surface">
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} /> Actualizar
          </button>
        </div>
      </header>
      {error && <p className="rounded-xl bg-amber-500/10 px-4 py-2 text-xs">Sin conexión: se muestran los últimos datos. {error}</p>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi icon={Bot} label="Intervenciones" value={s.interventions} hint={`${s.last_hour} en la última hora`} tone="bg-primary/15 text-primary" />
        <Kpi icon={Gauge} label="Por actividad" value={s.per_activity ?? '—'} hint={plural(s.activities, 'actividad', 'actividades')} tone="bg-sky-500/15 text-sky-700 dark:text-sky-300" />
        <Kpi icon={LifeBuoy} label="Actividades con ayuda" value={s.activities ? `${Math.round((s.activities_with_help / s.activities) * 100)} %` : '—'} hint={`${s.activities_with_help} de ${s.activities}`} tone="bg-amber-500/15 text-amber-700 dark:text-amber-300" />
        <Kpi icon={CheckCircle2} label="Superan con ayuda" value={pct(s.pass_rate_helped)} hint={`sin ayuda: ${pct(s.pass_rate_unhelped)}`} tone="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" />
        <Kpi icon={Hand} label="Pedidas por estudiantes" value={s.by_initiator.estudiante ?? 0} hint={`${s.by_initiator.tutor ?? 0} iniciadas por el tutor`} tone="bg-violet-500/15 text-violet-700 dark:text-violet-300" />
        <Kpi icon={Users} label="Decisiones propias" value={s.overrides} hint="Sugerencias rechazadas" tone="bg-pink-500/15 text-pink-700 dark:text-pink-300" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Intervenciones por tipo" subtitle="Toda la clase" className="lg:col-span-2">
          {s.interventions === 0 ? (
            <p className="py-10 text-center text-sm text-on-surface-variant">Aún no hay intervenciones registradas.</p>
          ) : (
            <div style={{ height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 40, top: 4, bottom: 4 }} barCategoryGap={6}>
                  <CartesianGrid horizontal={false} stroke={theme === 'dark' ? '#33322f' : '#ecebe7'} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: ink, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fill: ink, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, color: 'var(--text)' }}
                    formatter={(v: number, _n: string, p: { payload?: { kind?: InterventionKind } }) => [`${v} (${s.interventions ? Math.round((v / s.interventions) * 100) : 0} %)`, p.payload?.kind ? KIND_META[p.payload.kind].desc : '']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
                    {chartData.map((d) => <Cell key={d.kind} fill={color(d.kind)} />)}
                    <LabelList dataKey="value" position="right" style={{ fill: ink, fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card title="Escalera de ayuda" subtitle="Hasta qué nivel tuvo que llegar el tutor">
          <Ladder ladder={data.ladder} />
        </Card>
      </div>

      <Card
        title="Estudiantes"
        subtitle="Haz clic en un estudiante para ver la línea de tiempo de cada actividad"
        right={(
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} /> Solo trabajando ahora
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-on-surface-variant" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar estudiante" className="rounded-full border border-outline-variant/60 bg-surface-container-lowest py-1.5 pl-8 pr-3 text-xs outline-none focus:border-primary" />
            </div>
          </div>
        )}
      >
        <div className="mb-3"><KindLegend /></div>
        <div className="overflow-x-auto">
          <table className="ta-table">
            <thead>
              <tr>
                <SortTh k="name">Estudiante</SortTh>
                <th>ZDP</th>
                <SortTh k="activities" num>Actividades</SortTh>
                <SortTh k="passed" num>Superadas</SortTh>
                <SortTh k="interventions" num>Intervenciones</SortTh>
                <SortTh k="per_activity" num>Por actividad</SortTh>
                <th>Composición</th>
                {KINDS.map((k) => <th key={k} className="ta-num" title={KIND_META[k].label}><span className="inline-flex items-center gap-1"><i className="ta-kind-dot" style={{ background: `var(--k-${k})` }} />{KIND_META[k].short}</span></th>)}
                <SortTh k="last_intervention">Última</SortTh>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={15} className="py-8 text-center text-on-surface-variant">Sin estudiantes que coincidan.</td></tr>}
              {rows.slice(page * PAGE, page * PAGE + PAGE).map((r) => (
                <tr key={r.id} className="cursor-pointer" onClick={() => onOpen(r.id)}>
                  <td className="ta-name">
                    <div className="flex items-center gap-2">
                      {r.active_now && <span className="ta-live" title="Trabajando ahora" />}
                      <div className="min-w-0">
                        <div className="font-medium text-on-surface">{r.name || r.email}</div>
                        <div className="text-[11px] text-on-surface-variant">{r.learning_style ?? 'sin estilo'}{r.last_profile ? ` · ${PROFILE_LABEL[r.last_profile]}` : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="ta-nowrap"><ZdpPill zdp={r.zdp} /></td>
                  <td className="ta-num">{r.activities}</td>
                  <td className="ta-num">{r.passed}/{r.completed}</td>
                  <td className="ta-num font-semibold">{r.interventions}</td>
                  <td className="ta-num">{r.per_activity ?? '—'}</td>
                  <td><KindStack byKind={r.by_kind} total={r.interventions} /></td>
                  {KINDS.map((k) => <td key={k} className="ta-num">{r.by_kind[k] || <span className="text-on-surface-variant">·</span>}</td>)}
                  <td className="whitespace-nowrap text-xs text-on-surface-variant">{ago(r.last_intervention)}</td>
                  <td><ChevronRight className="h-4 w-4 text-on-surface-variant" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > PAGE && (
          <div className="ta-pager">
            <span>{page * PAGE + 1}–{Math.min(rows.length, (page + 1) * PAGE)} de {rows.length} estudiantes</span>
            <div className="flex gap-2">
              <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</button>
              <button type="button" disabled={(page + 1) * PAGE >= rows.length} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
            </div>
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="Por actividad (reto)" subtitle="Dónde interviene más el tutor y si la ayuda se traduce en superar el reto" className="lg:col-span-3">
          <div className="overflow-x-auto">
            <table className="ta-table">
              <thead>
                <tr><th>Reto</th><th className="ta-num">Intentos</th><th className="ta-num">Interv./intento</th><th className="ta-num">Pistas/intento</th><th className="ta-num">Replan.</th><th className="ta-num">Superan con ayuda</th><th className="ta-num">Sin ayuda</th></tr>
              </thead>
              <tbody>
                {data.challenges.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-on-surface-variant">Sin actividades todavía.</td></tr>}
                {data.challenges.map((c) => (
                  <tr key={c.challenge_id}>
                    <td className="ta-name"><div className="font-medium">{challengeTitle(c.challenge_id)}</div><div className="font-mono text-[11px] text-on-surface-variant">{c.challenge_id}</div></td>
                    <td className="ta-num">{c.attempts}</td>
                    <td className="ta-num font-semibold">{c.interventions_per_attempt}</td>
                    <td className="ta-num">{c.hints_per_attempt}</td>
                    <td className="ta-num">{c.replans}</td>
                    <td className="ta-num">{pct(c.pass_rate_helped)}</td>
                    <td className="ta-num">{pct(c.pass_rate_unhelped)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="En vivo" subtitle="Últimas intervenciones de la clase" className="lg:col-span-2">
          <ul className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
            {data.feed.length === 0 && <li className="text-sm text-on-surface-variant">Todavía no hay intervenciones.</li>}
            {data.feed.map((f) => {
              const M = KIND_META[f.kind];
              return (
                <li key={f.id}>
                  <button type="button" onClick={() => onOpen(f.student_id)} className="flex w-full items-start gap-3 rounded-xl border border-outline-variant/40 p-2.5 text-left hover:bg-surface-container">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: `var(--k-${f.kind})` }}><M.icon className="h-3.5 w-3.5" /></span>
                    <span className="min-w-0 flex-1 text-xs">
                      <span className="flex justify-between gap-2"><b className="truncate text-on-surface">{f.student}</b><span className="shrink-0 text-on-surface-variant">{ago(f.timestamp)}</span></span>
                      <span className="block text-on-surface">{M.label} · {levelLabel(f)}{f.initiator === 'estudiante' ? ' · pedida' : ''}</span>
                      <span className="block truncate text-on-surface-variant">{challengeTitle(f.challenge_id)} · min {mmss(f.t_seconds)}{f.response ? ` · respondió: ${f.response}` : ''}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/** Panel del administrador: intervenciones del tutor por estudiante y por actividad. */
export function TutorAdmin() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const studentId = params.get('student');
  useEffect(() => { window.scrollTo({ top: 0 }); }, [studentId]);
  return (
    <div className="mx-auto max-w-7xl">
      {studentId
        ? <StudentDetail id={studentId} onBack={() => navigate('/tutor-admin')} />
        : <Overview onOpen={(id) => setParams({ student: id })} />}
    </div>
  );
}
