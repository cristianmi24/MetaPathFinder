import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Brain, AlertTriangle, CheckCircle2, 
  Network, ChartPie, Bell, User, Sparkles, 
  FileText, Search, TrendingUp, ChevronRight,
  Clock, MousePointer2, Target, Code2, Trash2
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  ScatterChart, Scatter, CartesianGrid, XAxis, YAxis, 
  ZAxis, Tooltip, LineChart, Line, Legend,
  AreaChart, Area, ReferenceLine
} from 'recharts';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useTheme } from '../ThemeContext';
import { cn } from '../lib/utils';
import './Dashboard.css';

const clusterColors = { over: '#ffa657', sub: '#58a6ff', cal: '#3fb950' };
const clusterBg = { over: 'rgba(255,166,87,.1)', sub: 'rgba(88,166,255,.1)', cal: 'rgba(63,185,80,.1)' };
const clusterLabel = { over: 'Sobreconfianza', sub: 'Subestimación', cal: 'Calibrado' };

// Componente de Mapa de Calor Interno
const StudentHeatmap = ({ points }: { points: { x: number, y: number }[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !points.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar y preparar
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Normalización: Encontrar los límites para escalar los puntos al tamaño del canvas
    const maxX = Math.max(...points.map(p => p.x), 1);
    const maxY = Math.max(...points.map(p => p.y), 1);
    const minX = Math.min(...points.map(p => p.x), 0);
    const minY = Math.min(...points.map(p => p.y), 0);
    
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    points.forEach(p => {
      // Escalar coordenadas al tamaño del canvas (600x256)
      const scaledX = ((p.x - minX) / rangeX) * canvas.width;
      const scaledY = ((p.y - minY) / rangeY) * canvas.height;

      const grad = ctx.createRadialGradient(scaledX, scaledY, 0, scaledX, scaledY, 15);
      grad.addColorStop(0, 'rgba(255, 166, 87, 0.4)');
      grad.addColorStop(1, 'rgba(255, 166, 87, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(scaledX, scaledY, 15, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [points]);

  return (
    <div className="relative bg-[#0d1117] rounded-2xl overflow-hidden border border-white/10 h-64 shadow-inner group">
      <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest z-10 bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm border border-white/5">
        <MousePointer2 className="w-3 h-3 text-warning" /> Rastro Biométrico Normalizado
      </div>
      <canvas ref={canvasRef} width={600} height={256} className="w-full h-full opacity-70" />
      <div className="absolute bottom-3 right-3 text-[9px] font-mono text-gray-600 bg-black/40 px-2 py-1 rounded border border-white/5">
        Escalado automático activo
      </div>
      {points.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] text-gray-600 italic gap-2">
          <Target className="w-6 h-6 opacity-20" />
          Sin trayectoria detectada
        </div>
      )}
    </div>
  );
};

export function Dashboard() {
  const { students: storeStudents } = useCognitiveStore();
  const { theme } = useTheme();
  const [isHydrated, setIsHydrated] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'over' | 'sub' | 'cal' | 'alert'>('all');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedCluster, setSelectedCluster] = useState<'over' | 'sub' | 'cal'>('over');

  useEffect(() => {
    const check = () => {
      if (useCognitiveStore.persist.hasHydrated()) setIsHydrated(true);
      else setTimeout(check, 100);
    };
    check();
  }, []);

  const realStudents = useMemo(() => {
    if (!storeStudents) return [];
    return storeStudents.map(s => ({
      id: s.id,
      initials: s.id.split('-')[0],
      name: s.name,
      cluster: (s as any).metadata?.cluster || 'cal',
      jol: (s as any).metadata?.jol || 0,
      nota: (s as any).metadata?.nota || 0,
      desfase: (s as any).metadata?.desfase || 0,
      err: (s as any).metadata?.err || 0,
      tiempo: (s as any).metadata?.tiempo || 0,
      urgent: (s as any).metadata?.urgent || false,
      mouseHistory: (s as any).metadata?.mouseHistory || [],
      phaseTimes: (s as any).metadata?.phaseTimes || [],
      testDate: s.testDate,
      events: (s as any).events || []
    }));
  }, [storeStudents]);

  const filteredStudents = useMemo(() => {
    let list = [...realStudents];
    if (filterMode !== 'all') {
      if (filterMode === 'alert') list = list.filter(s => s.urgent);
      else list = list.filter(s => s.cluster === filterMode);
    }
    return list;
  }, [filterMode, realStudents]);

  // Refresco automático en tiempo real cuando hay cambios en otras pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'meta-pathfinder-storage') {
        console.log('📡 Datos nuevos detectados. Sincronizando dashboard...');
        // Forzamos la re-hidratación manual del store si es necesario o dejamos que Zustand reaccione
        window.location.reload(); // Forma más segura de asegurar que todos los selectores se refresquen
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const stats = useMemo(() => {
    const total = realStudents.length || 1;
    const avgJol = realStudents.reduce((acc, s) => acc + s.jol, 0) / total;
    const avgGap = realStudents.reduce((acc, s) => acc + s.desfase, 0) / total;
    const overCount = realStudents.filter(s => s.cluster === 'over').length;
    const subCount = realStudents.filter(s => s.cluster === 'sub').length;
    const calCount = realStudents.filter(s => s.cluster === 'cal').length;

    return { avgJol, avgGap, overCount, subCount, calCount, completeCount: realStudents.length };
  }, [realStudents]);

  const trendData = useMemo(() => {
    if (realStudents.length === 0) return [];

    // Ordenar estudiantes por fecha (antiguo a reciente)
    const sorted = [...realStudents].sort((a, b) => a.testDate - b.testDate);
    
    // Dividir en hasta 4 grupos para mostrar evolución (4 Sesiones)
    const chunkSize = Math.max(1, Math.ceil(sorted.length / 4));
    const sessions = [];

    for (let i = 0; i < 4; i++) {
      const start = i * chunkSize;
      if (start >= sorted.length && i > 0) break;
      
      const chunk = sorted.slice(start, start + chunkSize);
      if (chunk.length === 0) break;

      const overGroup = chunk.filter(s => s.cluster === 'over');
      const calGroup = chunk.filter(s => s.cluster === 'cal');

      sessions.push({
        name: i === 3 ? 'Hoy' : `Sesión ${i + 1}`,
        over: overGroup.length > 0 ? (overGroup.reduce((acc, s) => acc + s.desfase, 0) / overGroup.length) * -1 : null,
        cal: calGroup.length > 0 ? (calGroup.reduce((acc, s) => acc + s.desfase, 0) / calGroup.length) : null
      });
    }

    return sessions;
  }, [realStudents]);

  if (!isHydrated) {
    return <div className="flex items-center justify-center h-screen bg-[#0d1117] text-on-surface-variant font-mono">Hidratando Métricas Reales...</div>;
  }

  return (
    <div className={cn("dd-root-react", theme)}>
      <div className="dd-content-body">
        <div className="dd-kpi-grid">
          <div className="dd-kpi">
            <div className="dd-kpi-label"><Users className="w-3 h-3" /> Completaron</div>
            <div className="dd-kpi-val text-green-400">{stats.completeCount}</div>
            <div className="text-[10px] text-gray-500 font-mono mt-1">Total acumulado</div>
          </div>
          <div className="dd-kpi">
            <div className="dd-kpi-label"><Brain className="w-3 h-3" /> JOL Promedio</div>
            <div className="dd-kpi-val text-yellow-500">{stats.avgJol.toFixed(1)}</div>
            <div className="text-[10px] text-yellow-600 font-mono mt-1">Percepción de clase</div>
          </div>
          <div className="dd-kpi">
            <div className="dd-kpi-label"><AlertTriangle className="w-3 h-3" /> Desfase Promedio</div>
            <div className="dd-kpi-val text-red-400">{stats.avgGap.toFixed(1)}</div>
            <div className="text-[10px] text-red-500 font-mono mt-1">Brecha Metacognitiva</div>
          </div>
          <div className="dd-kpi">
            <div className="dd-kpi-label"><CheckCircle2 className="w-3 h-3" /> Calibrados</div>
            <div className="dd-kpi-val text-green-400">{stats.calCount}</div>
            <div className="text-[10px] text-gray-500 font-mono mt-1">Eficiencia cognitiva</div>
          </div>
        </div>

        <div className="dd-main-grid">
          <div className="dd-card">
            <div className="dd-card-title">
              <div className="flex items-center gap-2"><Network className="w-4 h-4" /> Distribución de Clústeres Reales</div>
            </div>
            <div className="space-y-4">
              {(['over', 'sub', 'cal'] as const).map(cl => {
                const group = realStudents.filter(s => s.cluster === cl);
                const percent = (group.length / (realStudents.length || 1) * 100);
                return (
                  <div key={cl} className={cn("dd-cluster-row", selectedCluster === cl && "selected")} onClick={() => setSelectedCluster(cl)}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold" style={{ color: clusterColors[cl] }}>{clusterLabel[cl]}</span>
                      <span className="text-[10px] font-mono text-gray-500">{group.length} Est. · {percent.toFixed(0)}%</span>
                    </div>
                    <div className="dd-cluster-bar-wrap">
                      <div className="dd-cluster-bar" style={{ width: `${percent}%`, backgroundColor: clusterColors[cl] }} />
                    </div>
                    <div className="dd-avatar-stack">
                      {group.map(s => (
                        <div key={s.id} className="dd-avatar" style={{ backgroundColor: clusterBg[cl], color: clusterColors[cl] }} onClick={(e) => { e.stopPropagation(); setSelectedStudent(s); }}>
                          {s.initials}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="dd-card !p-5">
              <div className="dd-card-title"><div className="flex items-center gap-2"><ChartPie className="w-3 h-3" /> Proporción</div></div>
              <div className="flex items-center gap-4 h-56">
                <div className="flex-1 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={[
                          { name: 'Sobreconfianza', value: stats.overCount, color: '#ffa657' },
                          { name: 'Subestimación', value: stats.subCount, color: '#58a6ff' },
                          { name: 'Calibrado', value: stats.calCount, color: '#3fb950' }
                        ].filter(d => d.value > 0)} 
                        innerRadius={45} 
                        outerRadius={65} 
                        paddingAngle={5} 
                        dataKey="value" 
                        stroke="none"
                      >
                        {[
                          { name: 'Sobreconfianza', color: '#ffa657' },
                          { name: 'Subestimación', color: '#58a6ff' },
                          { name: 'Calibrado', color: '#3fb950' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#161b22', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Leyenda Manual Fija */}
                <div className="flex flex-col gap-3 pr-4">
                  {[
                    { name: 'Sobreconfianza', count: stats.overCount, color: '#ffa657' },
                    { name: 'Subestimación', count: stats.subCount, color: '#58a6ff' },
                    { name: 'Calibrado', count: stats.calCount, color: '#3fb950' }
                  ].map((item) => {
                    const total = realStudents.length || 1;
                    const pct = realStudents.length > 0 ? ((item.count / total) * 100).toFixed(0) : '0';
                    return (
                      <div key={item.name} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter mb-0.5">{item.name}</span>
                          <div className="bg-gray-200 px-1.5 py-0.5 rounded-sm w-fit">
                            <span className="text-[10px] font-bold text-black leading-none">{pct}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="dd-card !bg-red-500/5 !border-red-500/20 !p-5">
              <div className="dd-card-title !text-red-400"><div className="flex items-center gap-2"><Bell className="w-3 h-3" /> Alertas Críticas</div></div>
              <div className="space-y-3">
                {realStudents.filter(s => s.urgent).slice(0, 3).map(s => (
                  <div key={s.id} className="dd-alert-item">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ background: clusterBg[s.cluster as keyof typeof clusterBg], color: clusterColors[s.cluster as keyof typeof clusterColors] }}>{s.initials}</div>
                    <div className="text-[10px] text-gray-300 truncate font-mono">
                      {s.name} · Δ {s.desfase.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="dd-bottom-grid">
          <div className="dd-card">
            <div className="flex flex-col gap-1 mb-8">
              <h3 className="text-[10px] font-mono text-gray-500 tracking-[0.2em] uppercase">Mapa JOL vs. Desempeño Real · Todos los Estudiantes</h3>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffa657]" />
                  <span className="text-[10px] font-mono text-gray-400">Sobreconfianza</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 transform rotate-45 bg-[#58a6ff]" />
                  <span className="text-[10px] font-mono text-gray-400">Subestimación</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[#3fb950]" />
                  <span className="text-[10px] font-mono text-gray-400">Calibrado</span>
                </div>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={true} />
                  <XAxis type="number" dataKey="x" name="JOL" unit="" domain={[0, 10]} stroke="#484f58" fontSize={9} label={{ value: 'JOL declarado', position: 'bottom', fill: '#484f58', fontSize: 9 }} />
                  <YAxis type="number" dataKey="y" name="Nota" unit="" domain={[0, 10]} stroke="#484f58" fontSize={9} label={{ value: 'Desempeño real', angle: -90, position: 'insideLeft', fill: '#484f58', fontSize: 9 }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '12px', fontSize: '10px' }} />
                  
                  {/* Línea de Calibración Ideal (Diagonal) */}
                  <Scatter name="Ideal" data={[{ x: 0, y: 0 }, { x: 10, y: 10 }]} line={{ stroke: 'rgba(255,255,255,0.1)', strokeDasharray: '5 5' }} shape={() => null} />
                  
                  {/* Sobreconfianza - Círculos */}
                  <Scatter name="Sobreconfianza" data={realStudents.filter(s => s.cluster === 'over').map(s => ({ x: s.jol, y: s.nota }))} fill="#ffa657" shape="circle" />
                  
                  {/* Subestimación - Rombos (Diamantes) */}
                  <Scatter name="Subestimación" data={realStudents.filter(s => s.cluster === 'sub').map(s => ({ x: s.jol, y: s.nota }))} fill="#58a6ff" shape="diamond" />
                  
                  {/* Calibrado - Triángulos */}
                  <Scatter name="Calibrado" data={realStudents.filter(s => s.cluster === 'cal').map(s => ({ x: s.jol, y: s.nota }))} fill="#3fb950" shape="triangle" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dd-card overflow-hidden relative">
            <div className="absolute top-4 right-4 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[8px] font-mono text-green-400 uppercase tracking-tighter">
              Tendencia: Mejora continua
            </div>
            
            <div className="dd-card-title mb-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Evolución Metacognitiva del Grupo</span>
              </div>
            </div>
            
            <div className="flex gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff7b72] shadow-[0_0_10px_rgba(255,123,114,0.4)]" />
                <span className="text-[10px] font-mono text-gray-400">Sobreconf.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#5dcaa5] shadow-[0_0_10px_rgba(93,202,165,0.4)]" />
                <span className="text-[10px] font-mono text-gray-400">Calibrados</span>
              </div>
            </div>

            <div className="h-56 -ml-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOver" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff7b72" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ff7b72" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5dcaa5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#5dcaa5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={true} horizontal={true} />
                  
                  {/* Línea de Referencia Cero (Calibración Ideal) */}
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="5 5" label={{ position: 'right', value: 'IDEAL', fill: 'rgba(255,255,255,0.2)', fontSize: 7, fontWeight: 'bold' }} />
                  
                  <XAxis dataKey="name" stroke="#484f58" fontSize={9} tickLine={false} axisLine={false} dy={10} fontStyle="italic" />
                  <YAxis stroke="#484f58" fontSize={9} tickLine={false} axisLine={false} domain={[-5, 1]} ticks={[-5, -4, -3, -2, -1, 0, 1]} tickFormatter={(v) => Math.abs(v).toFixed(1)} />
                  
                  <Tooltip 
                    contentStyle={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '12px', fontSize: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                    itemStyle={{ padding: '2px 0' }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey="over" 
                    stroke="#ff7b72" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorOver)" 
                    dot={{ r: 5, fill: '#ff7b72', strokeWidth: 2, stroke: '#161b22' }}
                    activeDot={{ r: 7, strokeWidth: 0, fill: '#ff7b72' }}
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey="cal" 
                    stroke="#5dcaa5" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorCal)" 
                    dot={{ r: 5, fill: '#5dcaa5', strokeWidth: 2, stroke: '#161b22' }}
                    activeDot={{ r: 7, strokeWidth: 0, fill: '#5dcaa5' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="dd-table-container">
          <div className="dd-table-scroll">
            <div className="dd-table-header">
              <span>Estudiante</span><span>JOL</span><span>Nota</span><span>Desfase</span><span>Errores</span><span>Tiempo</span><span>Perfil</span><span></span>
            </div>
            <div className="divide-y divide-gray-800">
              {filteredStudents.map(s => (
                <div key={s.id} className="dd-table-row" onClick={() => setSelectedStudent(s)}>
                  <span className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: clusterBg[s.cluster as keyof typeof clusterBg], color: clusterColors[s.cluster as keyof typeof clusterColors] }}>{s.initials}</div>
                    <span className="font-bold text-gray-200">{s.name}</span>
                    {s.urgent && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
                  </span>
                  <span className="font-mono text-yellow-500">{s.jol.toFixed(1)}</span>
                  <span className="font-mono text-primary">{s.nota.toFixed(1)}</span>
                  <span className={cn("font-mono", s.desfase < 0 ? "text-red-400" : "text-green-400")}>{s.desfase > 0 ? '+' : ''}{s.desfase.toFixed(1)}</span>
                  <span className="font-mono text-gray-400">{s.err}%</span>
                  <span className="font-mono text-gray-400">{s.tiempo} min</span>
                  <span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: clusterBg[s.cluster as keyof typeof clusterBg], color: clusterColors[s.cluster as keyof typeof clusterColors] }}>
                      {clusterLabel[s.cluster as keyof typeof clusterLabel].toUpperCase()}
                    </span>
                  </span>
                  <span className="flex justify-end pr-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`¿Seguro que deseas eliminar el registro de ${s.name}?`)) {
                          useCognitiveStore.getState().removeStudent(s.id);
                        }
                      }}
                      className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedStudent && (
          <>
            {/* Overlay de fondo */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999998]"
            />
            
            {/* Modal de Detalle */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[90vh] bg-surface-container-lowest border border-outline-variant rounded-3xl shadow-2xl overflow-hidden z-[999999] flex flex-col"
            >
              {/* Header del Modal */}
              <div className="p-8 border-b border-outline-variant relative overflow-hidden bg-surface-container">
                <div className="absolute top-0 right-0 p-4">
                  <button onClick={() => setSelectedStudent(null)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                    <Clock className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg" style={{ background: clusterBg[selectedStudent.cluster as keyof typeof clusterBg], color: clusterColors[selectedStudent.cluster as keyof typeof clusterColors] }}>
                    {selectedStudent.initials}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-on-surface mb-1">{selectedStudent.name}</h2>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider" style={{ background: clusterBg[selectedStudent.cluster as keyof typeof clusterBg], color: clusterColors[selectedStudent.cluster as keyof typeof clusterColors] }}>
                        {clusterLabel[selectedStudent.cluster as keyof typeof clusterLabel].toUpperCase()}
                      </span>
                      <span className="text-xs text-on-surface-variant flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(selectedStudent.testDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cuerpo del Modal */}
              <div className="p-8 overflow-y-auto space-y-8">
                {/* Métricas Principales */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant">
                    <div className="text-[9px] font-mono text-on-surface-variant uppercase mb-2">JOL Declarado</div>
                    <div className="text-2xl font-mono font-bold text-yellow-500">{selectedStudent.jol.toFixed(1)}</div>
                  </div>
                  <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant">
                    <div className="text-[9px] font-mono text-on-surface-variant uppercase mb-2">Nota Real</div>
                    <div className="text-2xl font-mono font-bold text-primary">{selectedStudent.nota.toFixed(1)}</div>
                  </div>
                  <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant">
                    <div className="text-[9px] font-mono text-on-surface-variant uppercase mb-2">Desfase</div>
                    <div className={cn("text-2xl font-mono font-bold", selectedStudent.desfase < 0 ? "text-red-400" : "text-green-400")}>
                      {selectedStudent.desfase > 0 ? '+' : ''}{selectedStudent.desfase.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant">
                    <div className="text-[9px] font-mono text-on-surface-variant uppercase mb-2">Tiempo</div>
                    <div className="text-2xl font-mono font-bold text-gray-400">{selectedStudent.tiempo}m</div>
                  </div>
                </div>

                {/* Análisis Biométrico y Tiempos */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold flex items-center gap-2"><MousePointer2 className="w-4 h-4 text-warning" /> Trayectoria Biométrica</h3>
                      <div className="flex gap-2">
                        {selectedStudent.phaseTimes.map((pt: any, idx: number) => (
                          <div key={idx} className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold text-primary uppercase">F{idx + 1}</span>
                            <span className="text-[10px] font-bold text-gray-200">{Math.floor(pt.seconds / 60)}m {pt.seconds % 60}s</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <StudentHeatmap points={selectedStudent.mouseHistory} />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
