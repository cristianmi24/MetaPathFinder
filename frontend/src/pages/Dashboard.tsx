import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Users, Activity, CheckCircle2, CircleDashed, Clock, Target, RefreshCw, Search,
  TrendingUp, TrendingDown, Minus, PauseCircle,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis, ReferenceLine, BarChart, Bar, Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useTheme } from '../ThemeContext';
import { cn } from '../lib/utils';
import { ProgressionMap } from '../components/tutor/ProgressionMap';
import { dynamicChallengeBank } from '../data/dynamicChallengeBank';
import { getEstrategia, NOMBRES_ESTRATEGIAS_RETIRADAS } from '../data/metacognitiveStrategies';

/* ── Tipos de /api/analytics/monitor ─────────────────────────────────────── */
type Status = 'activo' | 'terminado' | 'sin_empezar' | 'inactivo';
type Trend = 'subio' | 'bajo' | 'igual' | null;

interface StudentRow {
  id: string; name: string; email: string; status: Status; stage: string | null;
  current_challenge: string | null; started_at: string | null; elapsed_seconds: number | null;
  sessions: number; completed: number; avg_time_seconds: number | null;
  jol: number | null; performance: number | null; gap: number | null; cluster: string | null;
  trend: Trend; strategy: string | null;
}
interface Monitor {
  generated_at: string;
  summary: {
    students: number; activo: number; terminado: number; sin_empezar: number; inactivo: number;
    sessions: number; activities_completed: number; avg_time_seconds: number | null;
    pass_rate: number | null; avg_jol: number | null; avg_performance: number | null;
  };
  clusters: { over: number; sub: number; cal: number };
  trends: { subio: number; bajo: number; igual: number };
  students: StudentRow[];
  challenges: {
    challenge_id: string; attempts: number; avg_time_seconds: number | null; avg_score: number | null;
    pass_rate: number | null; avg_jol: number | null; avg_performance: number | null;
  }[];
  participation: { day: string; started: number; finished: number }[];
  strategies: { strategy: string; assigned: number; avg_abs_gap: number | null }[];
}

const REFRESH_MS = 15000;

const COLORS = {
  primary: '#6750a4',
  cal: '#16a34a',
  over: '#e5484d',
  sub: '#2f81f7',
  amber: '#d97706',
  muted: '#94a3b8',
};

const STATUS_META: Record<Status, { label: string; cls: string; icon: typeof Activity }> = {
  activo: { label: 'Trabajando', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', icon: Activity },
  terminado: { label: 'Terminó', cls: 'bg-primary/15 text-primary', icon: CheckCircle2 },
  inactivo: { label: 'Sin terminar', cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300', icon: PauseCircle },
  sin_empezar: { label: 'Sin empezar', cls: 'bg-slate-500/15 text-slate-600 dark:text-slate-300', icon: CircleDashed },
};

const CLUSTER_META: Record<string, { label: string; color: string }> = {
  cal: { label: 'Calibrado', color: COLORS.cal },
  over: { label: 'Sobreconfianza', color: COLORS.over },
  sub: { label: 'Subestimación', color: COLORS.sub },
};

const challengeTitle = (id: string | null) =>
  (id && dynamicChallengeBank.find((c) => c.id === id)?.titulo) || id || '—';
const strategyName = (id: string | null) =>
  (id && (NOMBRES_ESTRATEGIAS_RETIRADAS[id] ?? getEstrategia(id)?.nombre)) || id || '—';

function fmtDuration(sec: number | null | undefined) {
  if (sec == null) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m >= 60) return `${Math.floor(m / 60)} h ${m % 60} min`;
  return m > 0 ? `${m} min ${String(s).padStart(2, '0')} s` : `${s} s`;
}

/* ── Piezas de interfaz ──────────────────────────────────────────────────── */
function Card({ title, subtitle, children, className }: { title?: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-sm', className)}>
      {title && (
        <header className="mb-4">
          <h2 className="text-base font-semibold text-on-surface">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-on-surface-variant">{subtitle}</p>}
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
        <span className={cn('flex h-7 w-7 items-center justify-center rounded-full', tone)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-on-surface">{value}</div>
      {hint && <div className="mt-1 text-xs text-on-surface-variant">{hint}</div>}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full min-h-[180px] items-center justify-center text-center text-sm text-on-surface-variant">{children}</div>;
}

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === 'subio') return <span title="El sistema le subió la dificultad" className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><TrendingUp className="h-4 w-4" />Subió</span>;
  if (trend === 'bajo') return <span title="El sistema le bajó la dificultad" className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400"><TrendingDown className="h-4 w-4" />Bajó</span>;
  if (trend === 'igual') return <span title="Se mantuvo en el mismo nivel" className="inline-flex items-center gap-1 text-on-surface-variant"><Minus className="h-4 w-4" />Igual</span>;
  return <span className="text-on-surface-variant">—</span>;
}

/* ── Página ──────────────────────────────────────────────────────────────── */
export function Dashboard() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const axis = dark ? '#94a3b8' : '#64748b';
  const grid = dark ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.15)';
  const tooltipStyle = {
    background: dark ? '#0f172a' : '#ffffff',
    border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
    borderRadius: 12,
    fontSize: 12,
    color: dark ? '#e2e8f0' : '#0f172a',
  };

  const [data, setData] = useState<Monitor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [filter, setFilter] = useState<'todos' | Status>('todos');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setData((await api.getMonitor()) as unknown as Monitor);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'No se pudo conectar con el servidor');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  // Reloj para el "hace X s" y los cronómetros de quienes están trabajando
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const sinceUpdate = data ? Math.max(0, Math.round((now - new Date(data.generated_at).getTime()) / 1000)) : 0;

  const students = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const order: Record<Status, number> = { activo: 0, inactivo: 1, terminado: 2, sin_empezar: 3 };
    return data.students
      .filter((s) => (filter === 'todos' || s.status === filter) && (!q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)))
      .sort((a, b) => order[a.status] - order[b.status] || a.name.localeCompare(b.name));
  }, [data, filter, query]);

  if (!data && !error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-sm text-on-surface-variant">
        <RefreshCw className="h-4 w-4 animate-spin" /> Cargando el panel del grupo…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-6 text-center">
        <p className="text-sm font-medium text-on-surface">No se pudo cargar el panel del grupo.</p>
        <p className="mt-1 text-xs text-on-surface-variant">{error}</p>
        <button onClick={load} className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-on-primary">Reintentar</button>
      </div>
    );
  }

  const s = data.summary;
  const pct = (n: number) => (s.students ? Math.round((100 * n) / s.students) : 0);
  const clusterData = (['cal', 'over', 'sub'] as const)
    .map((k) => ({ key: k, name: CLUSTER_META[k].label, value: data.clusters[k], color: CLUSTER_META[k].color }))
    .filter((d) => d.value > 0);
  const scatter = data.students
    .filter((r) => r.jol != null && r.performance != null)
    .map((r) => ({ x: r.jol!, y: r.performance!, name: r.name, cluster: r.cluster ?? 'cal' }));
  const trendData = [
    { name: 'Subió', value: data.trends.subio, color: COLORS.cal },
    { name: 'Igual', value: data.trends.igual, color: COLORS.muted },
    { name: 'Bajó', value: data.trends.bajo, color: COLORS.over },
  ];
  const participation = data.participation.map((d) => ({
    ...d,
    label: new Date(d.day + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
  }));
  const challengeChart = data.challenges.map((c) => ({
    id: c.challenge_id,
    name: c.challenge_id,
    titulo: challengeTitle(c.challenge_id),
    jol: c.avg_jol,
    perf: c.avg_performance,
    minutos: c.avg_time_seconds != null ? Math.round(c.avg_time_seconds / 6) / 10 : null,
  }));

  const filters: { id: 'todos' | Status; label: string; count: number }[] = [
    { id: 'todos', label: 'Todos', count: s.students },
    { id: 'activo', label: 'Trabajando', count: s.activo },
    { id: 'inactivo', label: 'Sin terminar', count: s.inactivo },
    { id: 'terminado', label: 'Terminaron', count: s.terminado },
    { id: 'sin_empezar', label: 'Sin empezar', count: s.sin_empezar },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Encabezado */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">Panel del grupo</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Participación, tiempos y calibración de tus estudiantes.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant/50 bg-surface-container-lowest px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            En vivo · actualizado hace {sinceUpdate} s
          </span>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/50 bg-surface-container-lowest px-3 py-1.5 font-medium text-on-surface hover:bg-surface-container"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} /> Actualizar
          </button>
        </div>
      </header>
      {error && <p className="rounded-xl bg-amber-500/10 px-4 py-2 text-xs text-amber-700 dark:text-amber-300">Sin conexión: se muestran los últimos datos recibidos. {error}</p>}

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi icon={Users} label="Estudiantes" value={s.students} hint={`${s.sessions} sesiones registradas`} tone="bg-primary/15 text-primary" />
        <Kpi icon={Activity} label="Trabajando ahora" value={s.activo} hint={`${pct(s.activo)} % del grupo`} tone="bg-emerald-500/15 text-emerald-600" />
        <Kpi icon={CheckCircle2} label="Terminaron" value={s.terminado} hint={`${pct(s.terminado)} % del grupo`} tone="bg-primary/15 text-primary" />
        <Kpi icon={CircleDashed} label="Sin empezar" value={s.sin_empezar} hint={s.inactivo ? `${s.inactivo} empezaron y no terminaron` : 'Todos empezaron'} tone="bg-slate-500/15 text-slate-500" />
        <Kpi icon={Clock} label="Tiempo por actividad" value={fmtDuration(s.avg_time_seconds)} hint="Promedio del grupo" tone="bg-amber-500/15 text-amber-600" />
        <Kpi icon={Target} label="Aprobación" value={s.pass_rate != null ? `${s.pass_rate} %` : '—'} hint={`${s.activities_completed} actividades cerradas`} tone="bg-sky-500/15 text-sky-600" />
      </div>

      {/* Participación + calibración */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Participación" subtitle="Actividades iniciadas y terminadas en los últimos 14 días" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={participation} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="gStarted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.sub} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={COLORS.sub} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gFinished" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: axis, fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: axis, fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="started" name="Iniciadas" stroke={COLORS.sub} fill="url(#gStarted)" strokeWidth={2} />
                <Area type="monotone" dataKey="finished" name="Terminadas" stroke={COLORS.primary} fill="url(#gFinished)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Calibración del grupo" subtitle="¿Su confianza coincide con su resultado?">
          {clusterData.length === 0 ? (
            <Empty>Aún no hay actividades con reflexión final.</Empty>
          ) : (
            <>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={clusterData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3} stroke="none">
                      {clusterData.map((d) => <Cell key={d.key} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-1.5 text-sm">
                {(['cal', 'over', 'sub'] as const).map((k) => (
                  <li key={k} className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-on-surface-variant">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: CLUSTER_META[k].color }} />
                      {CLUSTER_META[k].label}
                    </span>
                    <span className="font-semibold text-on-surface">{data.clusters[k]}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      {/* Cómo se sintió vs cómo le fue + progresión */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Cómo se sintió vs. cómo le fue" subtitle="Cada punto es un estudiante. Sobre la diagonal: confianza = resultado." className="lg:col-span-2">
          {scatter.length === 0 ? (
            <Empty>Aparecerá cuando los estudiantes terminen su reflexión.</Empty>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ left: -10, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid stroke={grid} />
                  <XAxis type="number" dataKey="x" name="Confianza" domain={[0, 10]} tick={{ fill: axis, fontSize: 11 }} label={{ value: 'Confianza (antes)', position: 'insideBottom', offset: -4, fill: axis, fontSize: 11 }} />
                  <YAxis type="number" dataKey="y" name="Resultado" domain={[0, 10]} tick={{ fill: axis, fontSize: 11 }} label={{ value: 'Resultado', angle: -90, position: 'insideLeft', offset: 20, fill: axis, fontSize: 11 }} />
                  <ZAxis range={[110, 110]} />
                  <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 10, y: 10 }]} stroke={axis} strokeDasharray="4 4" />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    content={({ payload }) => {
                      const p = payload?.[0]?.payload as (typeof scatter)[number] | undefined;
                      return p ? (
                        <div style={tooltipStyle} className="px-3 py-2">
                          <div className="font-semibold">{p.name}</div>
                          <div>Confianza: {p.x} · Resultado: {p.y}</div>
                          <div>{CLUSTER_META[p.cluster]?.label}</div>
                        </div>
                      ) : null;
                    }}
                  />
                  {(['cal', 'over', 'sub'] as const).map((k) => (
                    <Scatter key={k} data={scatter.filter((p) => p.cluster === k)} fill={CLUSTER_META[k].color} />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Ajuste de dificultad" subtitle="Lo que hizo el sistema según el último resultado">
          {data.trends.subio + data.trends.bajo + data.trends.igual === 0 ? (
            <Empty>Se mostrará cuando un estudiante haga su segunda actividad.</Empty>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid stroke={grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: axis, fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: axis, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: grid }} />
                  <Bar dataKey="value" name="Estudiantes" radius={[8, 8, 0, 0]}>
                    {trendData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Estudiantes en vivo */}
      <Card title="Estudiantes" subtitle="Estado en vivo, tiempo en la actividad actual y último resultado">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  filter === f.id ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                )}
              >
                {f.label} <span className="opacity-70">{f.count}</span>
              </button>
            ))}
          </div>
          <label className="ml-auto flex min-w-[200px] items-center gap-2 rounded-full border border-outline-variant/50 px-3 py-1.5">
            <Search className="h-4 w-4 text-on-surface-variant" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar estudiante…" className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60" />
          </label>
        </div>

        {students.length === 0 ? (
          <Empty>No hay estudiantes en este filtro.</Empty>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-outline-variant/50 text-xs text-on-surface-variant">
                  <th className="px-5 py-2 font-medium">Estudiante</th>
                  <th className="px-3 py-2 font-medium">Estado</th>
                  <th className="px-3 py-2 font-medium">Actividad actual</th>
                  <th className="px-3 py-2 font-medium">Tiempo</th>
                  <th className="px-3 py-2 font-medium text-center">Hechas</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">Se sintió → Resultado</th>
                  <th className="px-3 py-2 font-medium">Calibración</th>
                  <th className="px-5 py-2 font-medium">Dificultad</th>
                </tr>
              </thead>
              <tbody>
                {students.map((r) => {
                  const meta = STATUS_META[r.status];
                  const live = r.status === 'activo' && r.started_at
                    ? Math.max(0, Math.round((now - new Date(r.started_at).getTime()) / 1000))
                    : null;
                  return (
                    <tr key={r.id} className="border-b border-outline-variant/30 last:border-0 hover:bg-surface-container/50">
                      <td className="px-5 py-3">
                        <Link to={`/tutor-admin?student=${r.id}`} className="font-medium text-on-surface hover:text-primary hover:underline" title="Ver intervenciones del tutor">{r.name}</Link>
                        <div className="text-xs text-on-surface-variant">{r.email}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', meta.cls)}>
                          <meta.icon className="h-3.5 w-3.5" /> {meta.label}
                        </span>
                        {r.status === 'activo' && r.stage === 'reflexion' && <div className="mt-1 text-[11px] text-on-surface-variant">En la reflexión final</div>}
                      </td>
                      <td className="px-3 py-3 max-w-[220px]">
                        <div className="truncate text-on-surface" title={challengeTitle(r.current_challenge)}>{challengeTitle(r.current_challenge)}</div>
                        {r.strategy && <div className="truncate text-xs text-on-surface-variant">{strategyName(r.strategy)}</div>}
                      </td>
                      <td className="px-3 py-3 tabular-nums whitespace-nowrap">
                        {live != null ? (
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">{fmtDuration(live)}</span>
                        ) : (
                          <span className="text-on-surface-variant">{r.avg_time_seconds != null ? `Prom. ${fmtDuration(r.avg_time_seconds)}` : '—'}</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center tabular-nums text-on-surface">{r.completed}</td>
                      <td className="px-3 py-3 tabular-nums whitespace-nowrap">
                        {r.jol != null && r.performance != null ? (
                          <span className="text-on-surface">
                            {r.jol} → <strong>{r.performance}</strong>
                            <span className={cn('ml-1.5 text-xs', (r.gap ?? 0) > 2 ? 'text-rose-600 dark:text-rose-400' : (r.gap ?? 0) < -2 ? 'text-sky-600 dark:text-sky-400' : 'text-on-surface-variant')}>
                              ({(r.gap ?? 0) > 0 ? '+' : ''}{r.gap})
                            </span>
                          </span>
                        ) : (
                          <span className="text-on-surface-variant">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {r.cluster ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: CLUSTER_META[r.cluster]?.color }}>
                            <span className="h-2 w-2 rounded-full" style={{ background: CLUSTER_META[r.cluster]?.color }} />
                            {CLUSTER_META[r.cluster]?.label}
                          </span>
                        ) : <span className="text-on-surface-variant">—</span>}
                      </td>
                      <td className="px-5 py-3 text-xs font-medium"><TrendIcon trend={r.trend} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Por actividad + estrategias */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Por actividad" subtitle="Confianza promedio frente al resultado promedio (escala 0–10)" className="lg:col-span-2">
          {challengeChart.length === 0 ? (
            <Empty>Aún no hay actividades realizadas.</Empty>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={challengeChart} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid stroke={grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: axis, fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: axis, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: grid }}
                    labelFormatter={(_, p) => (p?.[0]?.payload as any)?.titulo ?? ''}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="jol" name="Confianza" fill={COLORS.amber} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="perf" name="Resultado" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Tiempo y aprobación" subtitle="Por actividad">
          {data.challenges.length === 0 ? (
            <Empty>Sin datos todavía.</Empty>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {data.challenges.map((c) => (
                <li key={c.challenge_id} className="rounded-xl bg-surface-container/60 px-3 py-2">
                  <div className="truncate text-sm font-medium text-on-surface" title={challengeTitle(c.challenge_id)}>{challengeTitle(c.challenge_id)}</div>
                  <div className="mt-1 flex items-center justify-between text-xs text-on-surface-variant">
                    <span>{c.attempts} intento{c.attempts === 1 ? '' : 's'} · {fmtDuration(c.avg_time_seconds)}</span>
                    <span className="font-semibold text-on-surface">{c.pass_rate != null ? `${c.pass_rate} %` : '—'}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-outline-variant/30">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${c.pass_rate ?? 0}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {data.strategies.length > 0 && (
        <Card title="Estrategias asignadas" subtitle="Cuántas veces se asignó cada una y la distancia promedio entre confianza y resultado (menor es mejor)">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {data.strategies.map((st) => (
              <div key={st.strategy} className="rounded-xl bg-surface-container/60 px-3 py-2.5">
                <div className="truncate text-sm font-medium text-on-surface" title={strategyName(st.strategy)}>{strategyName(st.strategy)}</div>
                <div className="mt-1 text-xs text-on-surface-variant">
                  {st.assigned} asignación{st.assigned === 1 ? '' : 'es'} · desfase {st.avg_abs_gap ?? '—'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <Card title="Mapa de progresión (modelo de Griffin)" subtitle="Cada estudiante en su zona de desarrollo próximo, con los indicadores que pesaron en cada decisión.">
        <ProgressionMap />
      </Card>
    </div>
  );
}
