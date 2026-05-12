import { Filter, TrendingUp, Brain, History, BookOpen, MessageSquare, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useCognitiveStore, stateTranslations } from '../stores/useCognitiveStore';
import { format } from 'date-fns';

export function Analytics() {
  const { events, calibration, cognitiveLoad, currentLevel } = useCognitiveStore();

  // Derive calibration data from evaluation events specifically if they exist
  const challengeEvents = events.filter(e => e.type === 'CHALLENGE_COMPLETED');
  
  const calibrationData = challengeEvents.length > 0 
    ? challengeEvents.slice(-6).map((e, i) => {
        const score = e.metadata.технические_метрики?.score || 0;
        const jolAnswers = e.metadata.jolAnswers || {};
        const jolValues = Object.values(jolAnswers) as number[];
        const jolAvg = jolValues.length > 0 ? (jolValues.reduce((a, b) => a + b, 0) / jolValues.length) * 10 : 50;

        return {
          name: `R${i+1}`,
          cal: score,
          load: jolAvg
        };
      })
    : events
        .filter(e => e.type === 'COGNITIVE_STATE_SHIFT')
        .slice(-6)
        .map((e, i) => ({
          name: `T${i+1}`,
          cal: Math.round((e.metadata?.calibration || 0.6) * 100),
          load: Math.round(cognitiveLoad * 100)
        }));

  // Fallback if no events yet
  const displayData = calibrationData.length > 0 ? calibrationData : [
    { name: 'Base', cal: 30, load: 40 },
  ];

  const reflections = events
    .filter(e => e.type === 'CHALLENGE_COMPLETED' || e.type === 'METACOGNITIVE_REFLECTION' || e.type === 'PHASE_START')
    .slice(-5)
    .reverse()
    .map((e, index) => {
      const isChallenge = e.type === 'CHALLENGE_COMPLETED';
      const isReflection = e.type === 'METACOGNITIVE_REFLECTION';
      
      let title = "Evento";
      let content = "Descripción del evento cognitivo.";
      let tag = "Sistema";
      let color = "bg-surface-variant";
      let light = "bg-surface-variant/20";

      if (isChallenge) {
        title = `Reto: ${e.metadata.challengeId}`;
        content = `Completaste el reto con un score de ${e.metadata.технические_метрики?.score}%. Latencia: ${e.metadata.biometricas?.total_time}s.`;
        tag = "Desempeño";
        color = "bg-primary";
        light = "bg-primary/20";
      } else if (isReflection) {
        title = "Reflexión Metacognitiva";
        content = e.metadata.text?.substring(0, 80) + "...";
        tag = "Regulación";
        color = "bg-secondary";
        light = "bg-secondary/20";
      } else {
        title = `Inicio de Fase: ${e.metadata.phase}`;
        content = `Comenzaste la evaluación del nivel ${currentLevel || 1}.`;
        tag = "Progreso";
        color = "bg-tertiary-container";
        light = "bg-tertiary-container/30";
      }

      return {
        id: index,
        tag,
        date: format(e.timestamp, 'HH:mm'),
        title,
        content,
        color,
        light
      };
    });

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-primary">Historial Metacognitivo</h2>
          <p className="text-lg text-on-surface-variant mt-2 max-w-2xl font-medium">
            Observa cómo ha evolucionado tu capacidad de autorregulación y manejo de la carga cognitiva a lo largo del tiempo.
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 glass rounded-full font-bold text-sm text-primary hover:bg-surface-container-high transition-all">
          <Filter className="w-4 h-4" /> Filtrar por Curso
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Main Chart Card */}
        <section className="md:col-span-8 bento-card p-8 border-t-8 border-primary relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary-container"></div>
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2 mb-1">
                <TrendingUp className="text-primary w-6 h-6" /> Evolución de Calibración
              </h3>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Índice de precisión predictiva vs Carga Cognitiva</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                <div className="w-3 h-3 rounded-full bg-primary"></div> Calibración
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                <div className="w-3 h-3 rounded-full bg-secondary-container"></div> Carga
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayData} margin={{ top: 0, right: 0, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fontWeight={700} tick={{ fill: 'var(--color-on-surface-variant)' }} dy={10} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="load" stackId="a" fill="var(--color-secondary-container)" opacity={0.4} radius={[0, 0, 0, 0]} barSize={40} />
                <Bar dataKey="cal" stackId="a" fill="var(--color-primary)" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Floating Stats */}
        <section className="md:col-span-4 flex flex-col gap-6">
          <StatBox 
            icon={Target} 
            label="Índice Promedio" 
            value={Math.round(calibration * 100).toString()} 
            unit="%" 
            trend="+5% desde el inicio" 
            color="secondary" 
          />
          <StatBox 
            icon={Brain} 
            label="Carga Dominante" 
            value={cognitiveLoad > 0.6 ? "Intrínseca" : "Germánica"} 
            trend="Análisis de procesos profundos." 
            color="primary" 
          />
        </section>

        {/* Timeline */}
        <section className="md:col-span-6 bento-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <History className="text-tertiary-container w-6 h-6" /> Pulso de Eventos
            </h3>
            <button className="text-xs font-bold text-primary tracking-widest uppercase hover:underline">Ver todas</button>
          </div>
          <div className="space-y-8 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-outline-variant/30">
            {reflections.length > 0 ? reflections.map((ref) => (
              <div key={ref.id} className="pl-8 relative group">
                <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-surface-container-lowest shadow-sm z-10 transition-transform group-hover:scale-125 ${ref.color}`}></div>
                <div className="bg-surface rounded-2xl p-5 border border-outline-variant/10 group-hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${ref.light} ${ref.color.replace('bg-', 'text-')}`}>{ref.tag}</span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{ref.date}</span>
                  </div>
                  <h4 className="font-bold text-on-surface mb-2">{ref.title}</h4>
                  <p className="text-sm text-on-surface-variant italic leading-relaxed">{ref.content}</p>
                </div>
              </div>
            )) : (
              <div className="pl-8 text-on-surface-variant text-sm italic">Esperando eventos cognitivos... Navega por el sistema para generar datos.</div>
            )}
          </div>
        </section>

        {/* Socratic Dialog */}
        <section className="md:col-span-6 bento-card p-8 flex flex-col">
          <h3 className="text-2xl font-bold flex items-center gap-2 mb-8">
            <MessageSquare className="text-primary w-6 h-6" /> Diálogo Socrático
          </h3>
          <div className="space-y-6 flex-1">
            <DialogCard 
              question="¿Qué evidencia tienes de que realmente comprendes este concepto y no solo lo has memorizado?"
              answer="Pude explicar el concepto usando una analogía completamente diferente a la del libro, relacionándolo con el tráfico de la ciudad."
            />
             <DialogCard 
              question="Si tuvieras que enseñar esto a un principiante, ¿qué paso omitirías para evitar confundirlo?"
              answer="Omitiría las excepciones a la regla principal hasta que el caso base esté 100% solidificado en su modelo mental."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, unit, trend, color }: any) {
  const isSecondary = color === 'secondary';
  return (
    <div className={cn(
      "bento-card p-6 flex-1 flex flex-col justify-center relative overflow-hidden group",
      isSecondary ? "shadow-[0_4px_20px_-8px_rgba(122,215,198,0.2)]" : "shadow-[0_4px_20px_-8px_rgba(103,75,181,0.1)]"
    )}>
      <div className={cn(
        "absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl opacity-20",
        isSecondary ? "bg-secondary" : "bg-primary"
      )}></div>
      <div className="flex items-center gap-3 mb-6">
        <div className={cn("p-2 rounded-xl", isSecondary ? "bg-secondary-container/20 text-secondary" : "bg-primary-container/20 text-primary")}>
          <Icon className="w-5 h-5" />
        </div>
        <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</h4>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn("font-bold tracking-tighter leading-none", value.length > 3 ? "text-3xl" : "text-6xl")}>{value}</span>
        {unit && <span className="text-2xl font-bold text-on-surface-variant">{unit}</span>}
      </div>
      <p className={cn("text-xs font-bold mt-4 flex items-center gap-1", isSecondary ? "text-secondary" : "text-on-surface-variant")}>
        {isSecondary && <TrendingUp className="w-3 h-3" />} {trend}
      </p>
    </div>
  );
}

function DialogCard({ question, answer }: any) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
          <MessageSquare className="text-primary w-5 h-5" />
        </div>
        <div>
          <p className="text-lg font-medium italic text-on-surface leading-tight mb-3">"{question}"</p>
          <div className="bg-surface rounded-2xl p-4 border border-outline-variant/20 shadow-sm relative">
            <div className="absolute -top-2 left-6 w-4 h-4 bg-surface border-l border-t border-outline-variant/20 rotate-45"></div>
            <p className="text-sm text-on-surface-variant font-medium leading-relaxed">{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
