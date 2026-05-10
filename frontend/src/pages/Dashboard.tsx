import { AlertTriangle, UserCheck, Settings2, CheckCircle2, Brain, History, Timer, TrendingUp, Clock, MousePointer2, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useCognitiveStore, stateTranslations } from '../stores/useCognitiveStore';
import { useState } from 'react';

export function Dashboard() {
  const { cognitiveLoad, calibration, state } = useCognitiveStore();
  const [selectedEval, setSelectedEval] = useState<string | null>(null);

  const evaluations = (() => {
    try {
      return JSON.parse(localStorage.getItem('metapathfinder_evaluations') || '[]') as any[];
    } catch { return []; }
  })();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold text-on-surface tracking-tight">Panel de Administración</h2>
        <p className="text-lg text-on-surface-variant mt-2 font-medium">
          {evaluations.length} evaluación{ evaluations.length !== 1 ? 'es' : '' } registrada{ evaluations.length !== 1 ? 's' : '' }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

        {/* Evaluations Section */}
        {evaluations.length > 0 && (
          <div className="lg:col-span-12 bento-card p-6 border-t-4 border-secondary">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Target className="text-secondary w-6 h-6" />
              Evaluaciones Completadas
            </h3>
            <div className="space-y-4">
              {evaluations.map((entry: any, i: number) => {
                const ev = entry.evaluation;
                const isSelected = selectedEval === entry.email;
                return (
                  <div key={i}>
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 hover:bg-surface-container-high transition-colors cursor-pointer"
                      onClick={() => setSelectedEval(isSelected ? null : entry.email)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-black">
                            {entry.name?.[0]}{entry.lastName?.[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-on-surface">{entry.name} {entry.lastName}</h4>
                            <p className="text-xs text-on-surface-variant">{new Date(ev.fecha).toLocaleDateString()} — {Math.round(ev.score)}% acierto</p>
                          </div>
                        </div>
                        <div className="flex gap-6 text-center">
                          <div>
                            <p className="text-[10px] font-bold uppercase text-on-surface-variant">Tiempo</p>
                            <p className="text-lg font-black text-primary">{ev.totalTime ? `${Math.round(ev.totalTime / 1000 / 60)}m` : '--'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase text-on-surface-variant">Clicks</p>
                            <p className="text-lg font-black text-secondary">{ev.totalClicks ?? '--'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase text-on-surface-variant">Brecha</p>
                            <p className={cn("text-lg font-black", ev.gap > 0 ? 'text-error' : 'text-secondary')}>{ev.gap != null ? `${Math.abs(Math.round(ev.gap * 100))}%` : '--'}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 m-4 rounded-2xl bg-surface-container-higher border border-outline-variant/20 space-y-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-white border border-outline-variant/10 text-center">
                              <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                              <p className="text-[10px] font-bold uppercase text-on-surface-variant">Tiempo Total</p>
                              <p className="text-2xl font-black">{ev.totalTime ? `${Math.round(ev.totalTime / 1000 / 60)}m ${Math.round((ev.totalTime / 1000) % 60)}s` : '--'}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white border border-outline-variant/10 text-center">
                              <MousePointer2 className="w-5 h-5 text-secondary mx-auto mb-2" />
                              <p className="text-[10px] font-bold uppercase text-on-surface-variant">Total Clicks</p>
                              <p className="text-2xl font-black">{ev.totalClicks ?? '--'}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white border border-outline-variant/10 text-center">
                              <Brain className="w-5 h-5 text-primary mx-auto mb-2" />
                              <p className="text-[10px] font-bold uppercase text-on-surface-variant">Estrategia</p>
                              <p className="text-lg font-black">{ev.strategy === 'STRUCTURAL_MAPPING' ? 'Mapeo Estructural' : 'Verificación Sistemática'}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white border border-outline-variant/10 text-center">
                              <Target className="w-5 h-5 text-secondary mx-auto mb-2" />
                              <p className="text-[10px] font-bold uppercase text-on-surface-variant">Categorías Bloqueadas</p>
                              <p className="text-lg font-black">{Object.values(ev.blockedCategories || {}).flat().length || 0}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-bold uppercase text-on-surface-variant mb-3 tracking-wider">Clicks por Pregunta</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {Object.entries(ev.clicksPerQuestion || {}).map(([qId, clicks]) => (
                                <div key={qId} className="p-3 rounded-xl bg-white border border-outline-variant/10 text-center">
                                  <p className="text-[10px] font-bold text-primary uppercase">{qId}</p>
                                  <p className="text-xl font-black">{String(clicks)}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-bold uppercase text-on-surface-variant mb-3 tracking-wider">Intentos por Pregunta</p>
                            <div className="space-y-2">
                              {ev.attempts?.map((att: any, ai: number) => (
                                <div key={ai} className="flex items-center justify-between p-3 rounded-xl bg-white border border-outline-variant/10">
                                  <div className="flex items-center gap-3">
                                    <div className={cn("w-3 h-3 rounded-full", att.correct ? 'bg-secondary' : 'bg-error')} />
                                    <span className="text-sm font-bold">{att.questionId}</span>
                                    <span className="text-xs text-on-surface-variant">Percepción: {att.perception}/10</span>
                                  </div>
                                  <span className="text-xs font-bold text-on-surface-variant">{att.correct ? 'Acierto' : 'Fallo'}{att.variationAttempts > 0 ? ` (Var. ${att.variationAttempts})` : ''}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
