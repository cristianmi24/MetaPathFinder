import { AlertTriangle, UserCheck, Settings2, CheckCircle2, Brain, History, Timer, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useCognitiveStore, stateTranslations } from '../stores/useCognitiveStore';

export function Dashboard() {
  const { cognitiveLoad, calibration, state } = useCognitiveStore();

  const studentsAtRisk = [
    { 
      id: 1, 
      name: 'Mateo R.', 
      reason: state === 'Metacognitive_Mismatch' ? 'Desajuste Metacognitivo' : (state === 'Frustration' ? 'Frustración Detectada' : 'Frustración Alta'), 
      detail: state === 'Metacognitive_Mismatch' ? 'Puntaje alto con baja calibración consciente. Riesgo de error latente.' : (state === 'Frustration' ? 'Comportamiento actual indica bloqueo cognitivo.' : 'Atascado en Módulo 4 (Física Cuántica) por 45 mins. Patrón de clics errático.'), 
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop'
    },
    { 
      id: 2, 
      name: 'Lucía C.', 
      reason: 'Desorientación', 
      detail: 'Navegación circular detectada entre recursos de introducción y evaluación.', 
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop'
    }
  ];

  const stateData = [
    { name: 'Flow Óptimo', value: state === 'Flow' ? 25 : 20, color: 'var(--color-secondary-container)' },
    { name: 'Zona Neutra', value: 8, color: 'var(--color-surface-container-highest)' },
    { name: 'Fatiga/Estrés', value: state === 'Frustration' || state === 'Confusion' ? 7 : 3, color: 'var(--color-tertiary-fixed-dim)' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold text-on-surface tracking-tight">Buenos días, Dra. Silva</h2>
        <p className="text-lg text-on-surface-variant mt-2 font-medium">
          Aquí está el pulso cognitivo de tus aulas hoy. {state !== 'Flow' ? '4' : '3'} estudiantes requieren atención.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alerts Section */}
        <div className="lg:col-span-8 bento-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold flex items-center gap-2">
              <AlertTriangle className="text-error w-6 h-6" />
              Alertas Cognitivas
            </h3>
            <button className="text-sm font-bold text-primary hover:underline">Ver todos</button>
          </div>
          <div className="space-y-4">
            {studentsAtRisk.map((student) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={student.id} 
                className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 flex gap-4 hover:bg-surface-container-high transition-colors"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-surface shadow-sm">
                  <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-on-surface">{student.name}</h4>
                    <span className={student.reason.includes('Frustración') ? "bg-error-container text-on-error-container text-xs px-3 py-1 rounded-full font-bold" : "bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs px-3 py-1 rounded-full font-bold"}>
                      {student.reason}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">{student.detail}</p>
                  <button className="mt-3 text-primary text-sm font-bold flex items-center gap-1 group">
                    Intervenir <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Group State Chart */}
        <div className="lg:col-span-4 bento-card p-6 flex flex-col">
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <UserCheck className="text-secondary w-6 h-6" />
            Estado del Grupo
          </h3>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stateData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold">{Math.round(calibration * 100)}%</span>
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider text-center px-4 leading-tight">{stateTranslations[state]}</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {stateData.map((item) => (
              <div key={item.name} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-on-surface-variant font-medium">{item.name}</span>
                </div>
                <span className="text-sm font-bold">{item.value} alumnos</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calibration Section */}
        <div className="lg:col-span-12 bento-card p-6 border-t-4 border-primary">
          <h3 className="text-2xl font-semibold mb-8 flex items-center gap-2">
            <Settings2 className="text-primary w-6 h-6" />
            Calibración del Aula
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MetricCard 
              label="Precisión Meta-cognitiva" 
              value={`${Math.round(calibration * 100)}%`} 
              progress={calibration * 100} 
              color="bg-secondary-fixed-dim" 
              desc="Nivel de coherencia entre desempeño y confianza." 
              icon={CheckCircle2}
            />
            <MetricCard 
              label="Retención Estimada" 
              value="65%" 
              progress={65} 
              color="bg-primary-container" 
              desc="Basada en patrones de recuperación espaciada." 
              icon={Brain}
            />
            <MetricCard 
              label="Carga Cognitiva Actual" 
              value={cognitiveLoad > 0.7 ? "Alta" : cognitiveLoad < 0.3 ? "Baja" : "Óptima"} 
              progress={cognitiveLoad * 100} 
              color={cognitiveLoad > 0.7 ? "bg-error" : "bg-tertiary-fixed-dim"}
              desc="Índice de esfuerzo procesal detectado." 
              icon={History}
              isTriVariant={cognitiveLoad > 0.6}
            />
          </div>
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
        <Icon className={cn("w-5 h-5", color.replace('bg-', 'text-'))} />
      </div>
      <div className="text-4xl font-bold tracking-tighter">{value}</div>
      {isTriVariant ? (
        <div className="flex gap-1 h-2 w-full">
          <div className="flex-1 bg-secondary-container rounded-full"></div>
          <div className="flex-1 bg-tertiary-fixed-dim rounded-full"></div>
          <div className="flex-1 bg-error-container rounded-full opacity-20"></div>
        </div>
      ) : (
        <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={cn("h-full rounded-full", color)} 
          />
        </div>
      )}
      <p className="text-sm text-on-surface-variant font-medium leading-tight">{desc}</p>
    </div>
  );
}
