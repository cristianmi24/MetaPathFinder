import { PlayCircle, StopCircle, Rocket, TrendingUp, Binary, Clock, Edit3, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const chartData = [
  { name: 'Lógica y Mate', control: 60, experimental: 85 },
  { name: 'Memoria de Hechos', control: 75, experimental: 80 },
  { name: 'Síntesis Creativa', control: 50, experimental: 90 },
  { name: 'Programación', control: 65, experimental: 70 },
];

const stats = [
  { label: 'Delta en Tasa de Éxito', value: '+14.2%', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary-fixed' },
  { label: 'Valor-P (Precisión)', value: '0.0012', icon: Binary, color: 'text-secondary', bg: 'bg-secondary-fixed' },
  { label: 'Impacto en Latencia', value: '+450ms', icon: Clock, color: 'text-tertiary', bg: 'bg-tertiary-fixed' },
];

export function Experiments() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full flex items-center gap-1">
              <PlayCircle className="w-3 h-3" /> Activo
            </span>
            <span className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Exp ID: #8492-SOC</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight">Estudio de Encuadre Cognitivo</h2>
          <p className="text-lg text-on-surface-variant mt-2 max-w-2xl font-medium">
            Evaluación en tiempo real de estructuras de prompts socráticos vs configuraciones base en tareas de razonamiento.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 glass rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-surface-container-high transition-colors">
            <StopCircle className="w-4 h-4" /> Detener Proceso
          </button>
          <button className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <Rocket className="w-4 h-4" /> Desplegar Campeón
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Configurations */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <GroupBox 
            title="Grupo Control (Baseline Socrático)" 
            n="1,420" 
            color="border-surface-variant"
            template='"Actúa como un tutor socrático enfocado únicamente en el contenido actual..."'
            temp="0.7"
            tokens="1024"
          />
          <GroupBox 
            title="Grupo Experimental (TAM Architecture)" 
            n="1,420" 
            color="border-primary-container"
            template='"Actúa como un tutor socrático con Módulo de Transferencia. Inyecta heurísticas transversales basadas en estrategias previas..."'
            temp="0.4"
            tokens="2048"
            showEdit
          />
        </div>

        {/* Results */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bento-card p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bento-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-semibold">Rendimiento por Categoría</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                  <span className="w-3 h-3 rounded-full bg-surface-variant"></span> Control
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                  <span className="w-3 h-3 rounded-full bg-primary-container"></span> Experimental
                </div>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" opacity={0.3} />
                  <XAxis dataKey="name" fontSize={11} fontWeight={600} tick={{ fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} />
                  <YAxis fontSize={11} fontWeight={600} tick={{ fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} />
                  <ReTooltip />
                  <Bar dataKey="control" fill="var(--color-surface-variant)" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="experimental" fill="var(--color-primary-container)" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bento-card overflow-hidden">
            <div className="p-6 border-b border-outline-variant/30 bg-surface-container-low">
              <h3 className="text-xl font-bold">Análisis de Significancia</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-on-surface-variant uppercase tracking-widest bg-surface-container-low">
                    <th className="p-4">Métrica / Variable</th>
                    <th className="p-4">Media Control</th>
                    <th className="p-4">Media Exp</th>
                    <th className="p-4">Estadístico t</th>
                    <th className="p-4">Valor-p</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <TableRow label="Precisión General" control="0.68" exp="0.82" t="4.21" p="0.001 ***" highlight active />
                  <TableRow label="Adherencia Paso a Paso" control="0.45" exp="0.89" t="8.75" p="< 0.001 ***" highlight active />
                  <TableRow label="Tasa de Alucinación" control="0.12" exp="0.11" t="0.85" p="0.395" />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupBox({ title, n, color, template, temp, tokens, showEdit }: any) {
  return (
    <div className={cn("bento-card p-6 border-t-8", color)}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">{title}</h3>
        <span className="text-xs font-bold bg-surface-container px-2 py-1 rounded">N={n}</span>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Plantilla de Prompt de Sistema</label>
          <div className="p-3 bg-surface rounded-lg border border-outline-variant/30 font-mono text-xs leading-relaxed text-on-surface-variant">
            {template}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Temperatura</label>
            <div className="p-2 bg-surface rounded-lg border border-outline-variant/30 text-center text-sm font-bold">{temp}</div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Tokens Máximos</label>
            <div className="p-2 bg-surface rounded-lg border border-outline-variant/30 text-center text-sm font-bold">{tokens}</div>
          </div>
        </div>
        {showEdit && (
          <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline pt-2">
            <Edit3 className="w-3 h-3" /> Editar Variables
          </button>
        )}
      </div>
    </div>
  );
}

function TableRow({ label, control, exp, t, p, highlight, active }: any) {
  return (
    <tr className="border-t border-outline-variant/30 hover:bg-surface-container/30 transition-colors">
      <td className="p-4 font-medium flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", active ? "bg-secondary" : "bg-outline-variant")}></div>
        {label}
      </td>
      <td className="p-4 font-mono text-on-surface-variant">{control}</td>
      <td className={cn("p-4 font-mono font-bold", highlight ? "text-primary" : "text-on-surface-variant")}>{exp}</td>
      <td className="p-4 font-mono text-on-surface-variant">{t}</td>
      <td className="p-4">
        <span className={cn("px-2 py-1 rounded text-[10px] font-bold", p.includes('***') ? "bg-secondary-container/50 text-secondary" : "text-on-surface-variant")}>
          {p}
        </span>
      </td>
    </tr>
  );
}
