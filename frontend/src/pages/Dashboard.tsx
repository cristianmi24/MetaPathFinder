import { AlertTriangle, UserCheck, Settings2, CheckCircle2, Brain, History, TrendingUp, Clock, MousePointer2, Target, Sparkles, ChartPie, ChartLine, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, ScatterChart, Scatter, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useState, useMemo } from 'react';
import { useTheme } from '../ThemeContext';

const clusterColors = { over: '#ff7b72', sub: '#388bfd', cal: '#5dcaa5' };
const clusterBg = { over: 'rgba(255,123,114,.15)', sub: 'rgba(56,139,253,.15)', cal: 'rgba(93,202,165,.15)' };
const clusterLabel = { over: 'Sobreconfianza', sub: 'Subestimación', cal: 'Calibrado' };

const students = [
  { id: 'MR', name: 'Mario R.', cluster: 'over', jol: 9, nota: 2, desfase: -7, err: 80, tiempo: 38, urgent: true },
  { id: 'LP', name: 'Laura P.', cluster: 'over', jol: 8, nota: 4, desfase: -4, err: 67, tiempo: 34, urgent: true },
  { id: 'AS', name: 'Ana S.', cluster: 'over', jol: 8, nota: 5, desfase: -3, err: 50, tiempo: 28 },
  { id: 'CR', name: 'Carlos R.', cluster: 'over', jol: 7, nota: 4, desfase: -3, err: 55, tiempo: 31 },
  { id: 'MP', name: 'María P.', cluster: 'over', jol: 9, nota: 6, desfase: -3, err: 40, tiempo: 26 },
  { id: 'DL', name: 'Diego L.', cluster: 'over', jol: 7, nota: 5, desfase: -2, err: 44, tiempo: 24 },
  { id: 'VR', name: 'Valentina R.', cluster: 'over', jol: 8, nota: 6, desfase: -2, err: 38, tiempo: 22 },
  { id: 'ES', name: 'Emilio S.', cluster: 'over', jol: 6, nota: 4, desfase: -2, err: 60, tiempo: 29 },
  { id: 'NM', name: 'Natalia M.', cluster: 'over', jol: 7, nota: 5, desfase: -2, err: 45, tiempo: 25 },
  { id: 'FG', name: 'Felipe G.', cluster: 'over', jol: 8, nota: 6, desfase: -2, err: 35, tiempo: 21 },
  { id: 'AT', name: 'Andrea T.', cluster: 'over', jol: 6, nota: 5, desfase: -1, err: 30, tiempo: 20 },
  { id: 'JC', name: 'Juan C.', cluster: 'sub', jol: 3, nota: 8, desfase: 5, err: 12, tiempo: 18, urgent: true },
  { id: 'SR', name: 'Sofia R.', cluster: 'sub', jol: 4, nota: 7, desfase: 3, err: 20, tiempo: 22 },
  { id: 'PM', name: 'Pedro M.', cluster: 'sub', jol: 3, nota: 6, desfase: 3, err: 25, tiempo: 24 },
  { id: 'IL', name: 'Isabella L.', cluster: 'sub', jol: 4, nota: 7, desfase: 3, err: 18, tiempo: 20 },
  { id: 'TG', name: 'Tomás G.', cluster: 'sub', jol: 5, nota: 7, desfase: 2, err: 22, tiempo: 23 },
  { id: 'LH', name: 'Lucía H.', cluster: 'sub', jol: 4, nota: 6, desfase: 2, err: 28, tiempo: 26 },
  { id: 'OM', name: 'Óscar M.', cluster: 'sub', jol: 5, nota: 7, desfase: 2, err: 15, tiempo: 19 },
  { id: 'CV', name: 'Camila V.', cluster: 'cal', jol: 7, nota: 7, desfase: 0, err: 20, tiempo: 20 },
  { id: 'JM', name: 'Juliana M.', cluster: 'cal', jol: 8, nota: 8, desfase: 0, err: 15, tiempo: 18 },
  { id: 'SL', name: 'Samuel L.', cluster: 'cal', jol: 6, nota: 7, desfase: 1, err: 18, tiempo: 17 },
  { id: 'PG', name: 'Paula G.', cluster: 'cal', jol: 7, nota: 8, desfase: 1, err: 12, tiempo: 16 },
  { id: 'RV', name: 'Rafael V.', cluster: 'cal', jol: 8, nota: 8, desfase: 0, err: 10, tiempo: 15 },
  { id: 'MN', name: 'Mariana N.', cluster: 'cal', jol: 7, nota: 7, desfase: 0, err: 22, tiempo: 21 },
  { id: 'DA', name: 'Daniel A.', cluster: 'cal', jol: 6, nota: 6, desfase: 0, err: 25, tiempo: 22 },
  { id: 'VA', name: 'Valeria A.', cluster: 'cal', jol: 9, nota: 9, desfase: 0, err: 8, tiempo: 14 },
];

type Student = (typeof students)[number];

const interventionItems = [
  {
    title: 'Clúster: sobreconfianza · 11 estudiantes',
    desc: 'Pausa de reflexión colectiva de 10 min para revisar discrepancias entre JOL y nota real.',
    buttonText: 'Generar guion ↗',
    color: 'text-error',
  },
  {
    title: 'Clúster: subestimación · 7 estudiantes',
    desc: 'Sesión de reconocimiento de logros para reforzar autoeficacia con evidencia propia.',
    buttonText: 'Generar actividad ↗',
    color: 'text-primary',
  },
  {
    title: 'Clúster: calibrado · 8 estudiantes',
    desc: 'Rol de par cognitivo experto para mentoría y andamiaje entre compañeros.',
    buttonText: 'Diseñar protocolo ↗',
    color: 'text-secondary',
  },
];

export function Dashboard() {
  const { cognitiveLoad, calibration } = useCognitiveStore();
  const { theme } = useTheme();
  const [selectedCluster, setSelectedCluster] = useState<'over' | 'sub' | 'cal'>('over');
  const [filterMode, setFilterMode] = useState<'all' | 'over' | 'sub' | 'cal' | 'alert'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(students[0]);

  const filteredStudents = useMemo(() => {
    let list = [...students];
    if (filterMode !== 'all') {
      if (filterMode === 'alert') list = list.filter((s) => s.urgent);
      else list = list.filter((s) => s.cluster === filterMode);
    }
    return list;
  }, [filterMode]);

  const clusterCounts = useMemo(
    () => ({
      over: students.filter((s) => s.cluster === 'over').length,
      sub: students.filter((s) => s.cluster === 'sub').length,
      cal: students.filter((s) => s.cluster === 'cal').length,
    }),
    []
  );

  const donutData = [
    { name: 'Sobreconfianza', value: clusterCounts.over, color: clusterColors.over },
    { name: 'Subestimación', value: clusterCounts.sub, color: clusterColors.sub },
    { name: 'Calibrado', value: clusterCounts.cal, color: clusterColors.cal },
  ];

  const selectedClusterStudents = students.filter((s) => s.cluster === selectedCluster);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold text-on-surface tracking-tight">Panel de Administración</h2>
        <p className="text-lg text-on-surface-variant mt-2 font-medium">Visión ejecutiva del aula con métricas, clusters y controles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryCard title="Completaron Fase A" value="26 / 28" tone="success" icon={UserCheck} badge="93%" />
          <SummaryCard title="JOL promedio" value="6.4 / 10" tone="warning" icon={TrendingUp} badge="Moderada" />
          <SummaryCard title="Desfase promedio" value="−2.1 pts" tone="danger" icon={AlertTriangle} badge="Sobreestima" />
          <SummaryCard title="Perfiles calibrados" value="8 / 26" tone="success" icon={CheckCircle2} badge="Meta 60%" />
        </div>

        <div className="lg:col-span-8 bento-card p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.28em] text-on-surface-variant font-semibold mb-2">
                <ChartPie className="w-4 h-4" /> Clústeres cognitivos · clase completa
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant">
                {Object.entries(clusterCounts).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: clusterColors[key as keyof typeof clusterColors] }} />
                    {clusterLabel[key as keyof typeof clusterLabel]} {value}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['over', 'sub', 'cal'] as const).map((cluster) => (
                <button
                  key={cluster}
                  onClick={() => setSelectedCluster(cluster)}
                  className={cn(
                    'rounded-full px-3 py-2 text-xs font-semibold transition-all',
                    selectedCluster === cluster ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
                  )}
                >
                  {clusterLabel[cluster]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 mt-4">
            {selectedClusterStudents.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition-all',
                  selectedStudent?.id === student.id ? 'border-primary bg-surface-container-high' : 'border-outline-variant/20 bg-surface-container-low hover:border-primary/40 hover:bg-surface-container'
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-semibold" style={{ background: clusterBg[student.cluster], color: clusterColors[student.cluster] }}>
                      {student.id}
                    </div>
                    <div>
                      <div className="font-semibold text-on-surface">{student.name}</div>
                      <div className="text-xs text-on-surface-variant">{clusterLabel[student.cluster]} · {student.tiempo} min · {student.err}% err</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="text-on-surface-variant text-[10px] uppercase">JOL</div>
                      <div className="font-black text-on-surface">{student.jol}</div>
                    </div>
                    <div>
                      <div className="text-on-surface-variant text-[10px] uppercase">Nota</div>
                      <div className="font-black text-on-surface">{student.nota}</div>
                    </div>
                    <div>
                      <div className="text-on-surface-variant text-[10px] uppercase">Desfase</div>
                      <div className={cn('font-black', Math.abs(student.desfase) <= 1 ? 'text-secondary' : Math.abs(student.desfase) <= 3 ? 'text-warning' : 'text-error')}>
                        {student.desfase >= 0 ? '+' : ''}{student.desfase}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bento-card p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-on-surface-variant font-semibold">
                <ChartPie className="w-4 h-4" /> Distribución de clase
              </div>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} innerRadius={48} outerRadius={70} dataKey="value" stroke="none">
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {donutData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="w-3 h-3 rounded-full" style={{ background: entry.color }} />
                  {entry.name} {entry.value}%
                </div>
              ))}
            </div>
          </div>

          <div className="bento-card p-6 bg-error-container/10 border-error/20">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-error font-semibold mb-4">
              <Bell className="w-4 h-4" /> Alertas urgentes
            </div>
            <div className="space-y-3">
              {students.filter((s) => s.urgent).slice(0, 3).map((student) => (
                <div key={student.id} className="rounded-xl bg-surface-container-low border border-outline-variant/10 p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold" style={{ background: clusterBg[student.cluster], color: clusterColors[student.cluster] }}>
                      {student.id}
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold text-on-surface">{student.name}</div>
                      <div className="text-[11px] text-on-surface-variant">JOL={student.jol}, nota={student.nota}, desfase {student.desfase}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bento-card p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-on-surface-variant font-semibold">
              <ChartLine className="w-4 h-4" /> Mapa JOL vs desempeño real
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="w-3 h-3 rounded-full" style={{ background: clusterColors.over }} /> Sobreconfianza
              <span className="w-3 h-3 rounded-full" style={{ background: clusterColors.sub }} /> Subestimación
              <span className="w-3 h-3 rounded-full" style={{ background: clusterColors.cal }} /> Calibrado
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e2e8f0' : '#334155'} />
                <XAxis type="number" dataKey="x" domain={[0, 10]} tick={{ fill: theme === 'light' ? '#475569' : '#cbd5e1', fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: 'JOL declarado', position: 'insideBottomRight', offset: -5, fill: theme === 'light' ? '#475569' : '#cbd5e1', fontSize: 11 }} />
                <YAxis type="number" dataKey="y" domain={[0, 10]} tick={{ fill: theme === 'light' ? '#475569' : '#cbd5e1', fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: 'Desempeño real', angle: -90, position: 'insideLeft', fill: theme === 'light' ? '#475569' : '#cbd5e1', fontSize: 11 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: 12, borderColor: theme === 'light' ? '#cbd5e1' : '#475569', backgroundColor: theme === 'light' ? '#fff' : '#0f172a', color: theme === 'light' ? '#0f172a' : '#e2e8f0' }} />
                {(['over', 'sub', 'cal'] as const).map((cluster) => (
                  <Scatter key={cluster} name={clusterLabel[cluster]} data={students.filter((s) => s.cluster === cluster).map((s) => ({ x: s.jol, y: s.nota }))} fill={clusterColors[cluster]} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bento-card p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-on-surface-variant font-semibold">
              <Sparkles className="w-4 h-4" /> Evolución del desfase
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="w-3 h-3 rounded-full" style={{ background: clusterColors.over }} /> Sobreconf.
              <span className="w-3 h-3 rounded-full" style={{ background: clusterColors.cal }} /> Calibrados
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { session: 'S1', over: -4.2, cal: 0.8 },
                { session: 'S2', over: -3.5, cal: 0.5 },
                { session: 'S3', over: -2.8, cal: 0.3 },
                { session: 'S4', over: -2.1, cal: 0.2 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e2e8f0' : '#334155'} />
                <XAxis dataKey="session" tick={{ fill: theme === 'light' ? '#475569' : '#cbd5e1', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: theme === 'light' ? '#475569' : '#cbd5e1', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, borderColor: theme === 'light' ? '#cbd5e1' : '#475569', backgroundColor: theme === 'light' ? '#fff' : '#0f172a', color: theme === 'light' ? '#0f172a' : '#e2e8f0' }} />
                <Line type="monotone" dataKey="over" stroke={clusterColors.over} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="cal" stroke={clusterColors.cal} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bento-card p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-on-surface-variant font-semibold mb-4">
            <Sparkles className="w-4 h-4" /> Intervenciones grupales recomendadas
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {interventionItems.map((item) => (
              <div key={item.title} className="rounded-2xl border border-outline-variant/20 p-4 bg-surface-container-low">
                <div className={cn('text-sm font-semibold mb-2', item.color)}>{item.title}</div>
                <p className="text-sm text-on-surface-variant mb-4">{item.desc}</p>
                <button className="text-sm font-semibold text-primary hover:text-primary/80">{item.buttonText}</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bento-card p-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {(['all', 'over', 'sub', 'cal', 'alert'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterMode(filter)}
                className={cn(
                  'rounded-full border px-3 py-2 text-xs font-semibold transition-all',
                  filterMode === filter ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/30 bg-transparent text-on-surface-variant hover:bg-surface-container'
                )}
              >
                {filter === 'all' ? 'Todos' : filter === 'alert' ? 'Alertas urgentes' : clusterLabel[filter]}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[920px]">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_120px] gap-4 px-4 py-3 border-b border-outline-variant/20 text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                <span>Estudiante</span>
                <span>JOL</span>
                <span>Nota</span>
                <span>Desfase</span>
                <span>Errores</span>
                <span>Tiempo</span>
                <span>Perfil</span>
              </div>
              <div className="divide-y divide-outline-variant/20">
                {filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_120px] gap-4 px-4 py-4 w-full text-left hover:bg-surface-container/80 transition-colors"
                  >
                    <span className="flex items-center gap-3 text-on-surface">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center font-semibold" style={{ background: clusterBg[student.cluster], color: clusterColors[student.cluster] }}>{student.id}</span>
                      <span>{student.name}</span>
                    </span>
                    <span className="font-semibold text-on-surface">{student.jol}</span>
                    <span className="font-semibold text-on-surface">{student.nota}</span>
                    <span className={cn('font-semibold', Math.abs(student.desfase) <= 1 ? 'text-secondary' : Math.abs(student.desfase) <= 3 ? 'text-warning' : 'text-error')}>
                      {student.desfase >= 0 ? '+' : ''}{student.desfase}
                    </span>
                    <span className={cn('font-semibold', student.err <= 25 ? 'text-secondary' : student.err <= 50 ? 'text-warning' : 'text-error')}>{student.err}%</span>
                    <span className="text-on-surface">{student.tiempo} min</span>
                    <span className="text-sm font-semibold" style={{ color: clusterColors[student.cluster] }}>{clusterLabel[student.cluster]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, tone, icon: Icon, badge }: any) {
  const toneStyles = {
    success: 'bg-secondary/10 text-secondary',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-error/10 text-error',
  };

  return (
    <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-low p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant font-semibold">{title}</span>
        <span className={cn('rounded-full px-2 py-1 text-[11px] font-semibold', toneStyles[tone])}>{badge}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-3xl bg-surface-container p-3 text-on-surface shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-3xl font-bold text-on-surface tracking-tight">{value}</div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, progress, color, desc, icon: Icon, isTriVariant }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-on-surface-variant font-medium">{label}</span>
        <Icon className={cn('w-5 h-5', color.replace('bg-', 'text-'))} />
      </div>
      <div className="text-4xl font-bold tracking-tighter">{value}</div>
      {isTriVariant ? (
        <div className="flex gap-1 h-2 w-full">
          <div className="flex-1 bg-secondary-container rounded-full" />
          <div className="flex-1 bg-tertiary-fixed-dim rounded-full" />
          <div className="flex-1 bg-error-container rounded-full opacity-20" />
        </div>
      ) : (
        <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={cn('h-full rounded-full', color)} />
        </div>
      )}
      <p className="text-sm text-on-surface-variant font-medium leading-tight">{desc}</p>
    </div>
  );
}
