import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users, Brain, AlertTriangle, CheckCircle2,
  Bell, Sparkles, FileText, Clock, User,
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../ThemeContext';
import { cn } from '../lib/utils';

const CLUSTER_COLORS: Record<string, string> = { over: '#ff7b72', sub: '#388bfd', cal: '#5dcaa5' };
const CLUSTER_BG: Record<string, string> = { over: 'rgba(255,123,114,.15)', sub: 'rgba(56,139,253,.15)', cal: 'rgba(93,202,165,.15)' };
const CLUSTER_LABEL: Record<string, string> = { over: 'Sobreconfianza', sub: 'Subestimación', cal: 'Calibrado' };

interface StudentEntry {
  id: string; name: string; initials: string; email: string;
  jol: number | null; performance: number | null; gap: number | null;
  calibration_index: number | null; cluster: string | null;
}

interface AlertEntry {
  id: string; name: string; initials: string; email: string;
  jol: number | null; performance: number | null; gap: number | null;
  calibration_index: number | null; cluster: string | null;
  reason: string; type: string;
}

interface ClassAnalytics {
  student_count: number;
  phase_a_completed: number;
  avg_jol: number;
  avg_gap: number;
  calibrated_count: number;
  cluster_distribution: Record<string, number>;
  cluster_students: Record<string, StudentEntry[]>;
  urgent_alerts: AlertEntry[];
}

export function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [data, setData] = useState<ClassAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'over' | 'sub' | 'cal' | 'alert'>('all');
  const [selectedCluster, setSelectedCluster] = useState<'over' | 'sub' | 'cal'>('over');
  const [selectedStudent, setSelectedStudent] = useState<StudentEntry | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getClassAnalytics() as unknown as ClassAnalytics;
        setData(res);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const fmtTimer = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

  const allStudents = useMemo(() => {
    if (!data) return [];
    return [...(data.cluster_students.over || []), ...(data.cluster_students.sub || []), ...(data.cluster_students.cal || []), ...(data.cluster_students.unknown || [])];
  }, [data]);

  const filteredStudents = useMemo(() => {
    if (filterMode === 'all') return allStudents;
    if (filterMode === 'alert') return data?.urgent_alerts || [];
    return data?.cluster_students[filterMode] || [];
  }, [filterMode, allStudents, data]);

  const recentStudents = useMemo(() => {
    if (filterMode === 'all') return allStudents.slice(0, 5);
    if (filterMode === 'alert') return (data?.urgent_alerts || []).slice(0, 5);
    return (data?.cluster_students[filterMode] || []).slice(0, 5);
  }, [filterMode, allStudents, data]);

  const clusterPct = useCallback((cl: string) => {
    if (!data || data.student_count === 0) return 0;
    return ((data.cluster_distribution[cl] || 0) / data.student_count) * 100;
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d1117] text-[#8b949e] font-mono text-sm">
        Cargando datos de clase...
      </div>
    );
  }

  const bg = isDark ? '#0d1117' : '#f0f4f8';
  const cardBg = isDark ? '#161b22' : '#ffffff';
  const cardBorder = isDark ? '#30363d' : '#d1d9e0';
  const textPrimary = isDark ? '#c9d1d9' : '#1f2328';
  const textSecondary = isDark ? '#6e7681' : '#656d76';
  const textMuted = isDark ? '#8b949e' : '#6e7681';
  const inputBg = isDark ? '#0d1117' : '#f6f8fa';
  const rowBorder = isDark ? '#21262d' : '#d1d9e0';
  const brandGreen = isDark ? '#238636' : '#1a7f37';
  const accentBlue = isDark ? '#388bfd' : '#0969da';

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: bg, color: textPrimary, minHeight: '100vh', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ background: cardBg, borderBottom: `0.5px solid ${cardBorder}`, padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: brandGreen, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: '#fff', letterSpacing: -1 }}>MP</div>
          <span style={{ fontSize: 12, fontWeight: 500, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Meta-Pathfinder</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${accentBlue}15`, border: `0.5px solid ${accentBlue}50`, borderRadius: 7, padding: '5px 12px', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: accentBlue }}>
            <User size={13} /> Vista docente
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: textSecondary, background: inputBg, border: `0.5px solid ${cardBorder}`, borderRadius: 7, padding: '5px 12px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: brandGreen, animation: 'blink 1.2s ease-in-out infinite' }} />
            {data?.phase_a_completed ?? 0} / {data?.student_count ?? 0} estudiantes
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: textSecondary, background: inputBg, border: `0.5px solid ${cardBorder}`, borderRadius: 7, padding: '5px 12px' }}>
            <Clock size={12} /> {fmtTimer}
          </div>
        </div>
      </div>

      <div style={{ padding: 20 }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10, marginBottom: 18 }}>
          {[
            { label: 'Completaron Fase A', val: `${data?.phase_a_completed ?? 0}`, sub: `${data?.student_count ? Math.round((data.phase_a_completed / data.student_count) * 100) : 0}% de la clase`, valColor: '#5dcaa5', subColor: '#5dcaa5' },
            { label: 'JOL promedio de clase', val: `${data?.avg_jol ?? 0}`, sub: 'Confianza ' + (data && data.avg_jol >= 7 ? 'alta' : data && data.avg_jol >= 5 ? 'moderada-alta' : 'baja'), valColor: '#f2cc60', subColor: '#f2cc60' },
            { label: 'Desfase promedio', val: `${data?.avg_gap ?? 0}`, sub: data && data.avg_gap > 0 ? 'Clase sobrestima su nivel' : data && data.avg_gap < 0 ? 'Clase subestima su nivel' : 'Clase calibrada', valColor: data && data.avg_gap && Math.abs(data.avg_gap) > 2 ? '#ff7b72' : '#5dcaa5', subColor: data && data.avg_gap && Math.abs(data.avg_gap) > 2 ? '#ff7b72' : textSecondary },
            { label: 'Perfiles calibrados', val: `${data?.calibrated_count ?? 0}`, sub: `${data?.student_count ? Math.round((data.calibrated_count / data.student_count) * 100) : 0}% · meta: 60% al final`, valColor: '#5dcaa5', subColor: textSecondary },
          ].map(kpi => (
            <div key={kpi.label} style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: 24, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, color: kpi.valColor, lineHeight: 1 }}>
                {kpi.val} <span style={{ fontSize: 14, color: textSecondary }}>{kpi.label === 'Completaron Fase A' ? `/ ${data?.student_count ?? 0}` : ''}</span>
              </div>
              <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginTop: 5, color: kpi.subColor }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14, marginBottom: 14 }}>
          <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                Clústeres cognitivos · clase completa
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {['Sobreconfianza', 'Subestimación', 'Calibrado'].map((label, i) => {
                  const colors = ['#ff7b72', '#388bfd', '#5dcaa5'];
                  return (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: textMuted }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: colors[i], flexShrink: 0 }} />
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['over', 'sub', 'cal'].map(cl => {
                const group = data?.cluster_students[cl] || [];
                const pct = clusterPct(cl);
                return (
                  <div
                    key={cl}
                    onClick={() => setSelectedCluster(cl as 'over' | 'sub' | 'cal')}
                    style={{
                      background: inputBg,
                      border: `0.5px solid ${selectedCluster === cl ? CLUSTER_COLORS[cl] : rowBorder}`,
                      borderRadius: 8, padding: 12, cursor: 'pointer',
                      transition: 'border-color .15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7, color: CLUSTER_COLORS[cl] }}>
                        {CLUSTER_LABEL[cl]}
                      </div>
                      <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: textSecondary }}>
                        {group.length} estudiantes · {Math.round(pct)}%
                      </span>
                    </div>
                    <div style={{ height: 4, background: rowBorder, borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: CLUSTER_COLORS[cl], transition: 'width .5s cubic-bezier(.4,0,.2,1)' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                      {group.slice(0, 10).map(s => (
                        <div
                          key={s.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedStudent(s); }}
                          style={{
                            width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500,
                            background: CLUSTER_BG[cl], color: CLUSTER_COLORS[cl],
                            border: `1.5px solid ${inputBg}`, cursor: 'pointer', transition: 'transform .1s',
                          }}
                          title={s.name}
                        >
                          {s.initials}
                        </div>
                      ))}
                      {group.length > 10 && (
                        <span style={{ fontSize: 9, color: textSecondary, fontFamily: "'IBM Plex Mono', monospace", marginLeft: 4 }}>+{group.length - 10}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 14 }}>
                Distribución de clase
              </div>
              <div style={{ position: 'relative', width: '100%', height: 140 }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  {(() => {
                    const total = data?.student_count || 1;
                    const over = ((data?.cluster_distribution.over || 0) / total) * 100;
                    const sub = ((data?.cluster_distribution.sub || 0) / total) * 100;
                    const cal = ((data?.cluster_distribution.cal || 0) / total) * 100;
                    const r = 35;
                    const cx = 50, cy = 50;
                    const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);
                    const arcPath = (startDeg: number, endDeg: number) => {
                      const s = toRad(startDeg), e = toRad(endDeg);
                      const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
                      const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
                      const large = endDeg - startDeg > 180 ? 1 : 0;
                      return `M ${cx + r * 0.55 * Math.cos(s)} ${cy + r * 0.55 * Math.sin(s)} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${cx + r * 0.55 * Math.cos(e)} ${cy + r * 0.55 * Math.sin(e)} Z`;
                    };
                    const segments: { pct: number; color: string }[] = [];
                    if (over > 0) segments.push({ pct: over, color: '#ff7b72' });
                    if (sub > 0) segments.push({ pct: sub, color: '#388bfd' });
                    if (cal > 0) segments.push({ pct: cal, color: '#5dcaa5' });
                    let curDeg = 0;
                    return segments.map(seg => {
                      const deg = (seg.pct / 100) * 360;
                      const path = arcPath(curDeg, curDeg + deg);
                      curDeg += deg;
                      return <path key={seg.color} d={path} fill={seg.color} />;
                    });
                  })()}
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 }}>
                {[
                  { label: 'Sobreconfianza', pct: clusterPct('over'), color: '#ff7b72' },
                  { label: 'Subestimación', pct: clusterPct('sub'), color: '#388bfd' },
                  { label: 'Calibrado', pct: clusterPct('cal'), color: '#5dcaa5' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: textMuted }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                    {item.label} {Math.round(item.pct)}%
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(255,123,114,.06)', border: '0.5px solid rgba(255,123,114,.25)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#ff7b72', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Bell size={13} /> Alertas urgentes
              </div>
              {(data?.urgent_alerts?.length ?? 0) === 0 && (
                <div style={{ fontSize: 11, color: textMuted }}>Sin alertas activas</div>
              )}
              {(data?.urgent_alerts || []).slice(0, 4).map(a => (
                <div
                  key={a.id}
                  onClick={() => setSelectedStudent(a)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: textPrimary, padding: '5px 0', borderBottom: `0.5px solid rgba(255,123,114,.1)`, cursor: 'pointer' }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500,
                    background: a.type === 'over' ? 'rgba(255,123,114,.15)' : 'rgba(56,139,253,.15)',
                    color: a.type === 'over' ? '#ff7b72' : '#388bfd',
                  }}>{a.initials}</div>
                  <span style={{ flex: 1 }}>
                    {a.name.split(' ')[0]} {a.initials}. · {a.type === 'over' ? `JOL=${a.jol}, nota=${a.performance}` : `JOL=${a.jol}, nota=${a.performance}`} · {a.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedStudent && (
          <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                <User size={13} /> Detalle de estudiante
              </div>
              <button onClick={() => setSelectedStudent(null)} style={{ background: 'transparent', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>cerrar</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500,
                background: CLUSTER_BG[selectedStudent.cluster || 'cal'], color: CLUSTER_COLORS[selectedStudent.cluster || 'cal'],
              }}>{selectedStudent.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: textPrimary }}>{selectedStudent.name}</div>
                <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: textSecondary }}>
                  {selectedStudent.cluster ? CLUSTER_LABEL[selectedStudent.cluster] : 'Sin datos'}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
              {[
                { label: 'JOL', val: selectedStudent.jol ?? '—', color: '#f2cc60' },
                { label: 'Nota real', val: selectedStudent.performance ?? '—', color: selectedStudent.performance && selectedStudent.performance >= 7 ? '#5dcaa5' : '#ff7b72' },
                { label: 'Desfase', val: selectedStudent.gap != null ? `${selectedStudent.gap >= 0 ? '+' : ''}${selectedStudent.gap}` : '—', color: selectedStudent.gap != null && Math.abs(selectedStudent.gap) <= 1 ? '#5dcaa5' : '#ff7b72' },
                { label: 'Calibración', val: selectedStudent.calibration_index ?? '—', color: selectedStudent.calibration_index && selectedStudent.calibration_index >= 7 ? '#5dcaa5' : '#f2cc60' },
              ].map(stat => (
                <div key={stat.label} style={{ background: inputBg, borderRadius: 7, padding: 10, border: `0.5px solid ${rowBorder}` }}>
                  <div style={{ fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{stat.label}</div>
                  <div style={{ fontSize: 18, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, color: stat.color }}>{stat.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 10, padding: 16, minHeight: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10 }}>
              Mapa JOL vs. desempeño real · todos los estudiantes
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              {[
                { label: 'Sobreconfianza', color: '#ff7b72', shape: 'circle' },
                { label: 'Subestimación', color: '#388bfd', shape: 'rect' },
                { label: 'Calibrado', color: '#5dcaa5', shape: 'triangle' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: textMuted }}>
                  <span style={{ width: 8, height: 8, borderRadius: l.shape === 'circle' ? '50%' : l.shape === 'rect' ? 2 : 0, background: l.color, borderLeft: l.shape === 'triangle' ? '4px solid transparent' : undefined, borderRight: l.shape === 'triangle' ? '4px solid transparent' : undefined, borderBottom: l.shape === 'triangle' ? '8px solid #5dcaa5' : undefined, flexShrink: 0 }} />
                  {l.label}
                </div>
              ))}
            </div>
            <svg viewBox="0 0 300 300" style={{ width: '100%', height: 260 }}>
              {(() => {
                const toX = (v: number) => 15 + (v / 10) * 270;
                const toY = (v: number) => 285 - (v / 10) * 270;
                const pts = allStudents.filter(s => s.jol != null && s.performance != null);
                return (
                  <>
                    <line x1={toX(0)} y1={toY(0)} x2={toX(10)} y2={toY(10)} stroke={isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)"} strokeWidth={1} strokeDasharray="4,4" />
                    {[0, 2, 4, 6, 8, 10].map(v => (
                      <g key={v}>
                        <text x={toX(v)} y={298} fontSize={8} fill={textSecondary} textAnchor="middle" fontFamily="'IBM Plex Mono',monospace">{v}</text>
                        <text x={8} y={toY(v) + 3} fontSize={8} fill={textSecondary} textAnchor="end" fontFamily="'IBM Plex Mono',monospace">{v}</text>
                        <line x1={toX(v)} y1={toY(0)} x2={toX(v)} y2={toY(10)} stroke={rowBorder} strokeWidth={0.5} />
                        <line x1={toX(0)} y1={toY(v)} x2={toX(10)} y2={toY(v)} stroke={rowBorder} strokeWidth={0.5} />
                      </g>
                    ))}
                    <text x={150} y={298} fontSize={9} fill={textSecondary} textAnchor="middle" fontFamily="'IBM Plex Mono',monospace">JOL declarado</text>
                    <text x={8} y={145} fontSize={9} fill={textSecondary} textAnchor="middle" transform="rotate(-90,8,145)" fontFamily="'IBM Plex Mono',monospace">Desempeño real</text>
                    {pts.map(s => {
                      const cx = toX(s.jol!), cy = toY(s.performance!);
                      const color = CLUSTER_COLORS[s.cluster || 'cal'];
                      const r = 5;
                      return <circle key={s.id} cx={cx} cy={cy} r={r} fill={color} opacity={0.7} />;
                    })}
                  </>
                );
              })()}
            </svg>
          </div>

          <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 10, padding: 16, minHeight: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10 }}>
              Evolución del desfase · últimas sesiones
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: textMuted }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#ff7b72', flexShrink: 0 }} />Sobreconf.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: textMuted }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#5dcaa5', flexShrink: 0 }} />Calibrados
              </div>
            </div>
            <svg viewBox="0 0 300 240" style={{ width: '100%', height: 240 }}>
              {(() => {
                const pts = allStudents.filter(s => s.jol != null && s.performance != null);
                const overPts = pts.filter(s => s.cluster === 'over').map(s => s.gap!).filter(g => g != null);
                const calPts = pts.filter(s => s.cluster === 'cal').map(s => s.gap!).filter(g => g != null);
                const overAvg = overPts.length ? overPts.reduce((a, b) => a + b, 0) / overPts.length : 0;
                const calAvg = calPts.length ? calPts.reduce((a, b) => a + b, 0) / calPts.length : 0;
                const toX = (i: number, n: number) => 20 + (i / (n - 1 || 1)) * 260;
                const toY = (v: number) => 120 - (Math.max(-8, Math.min(8, v)) / 8) * 100;

                const labels = ['Sesión 1', 'Sesión 2', 'Sesión 3', 'Hoy'];
                const overData = [
                  overAvg * 0.6, overAvg * 0.3, overAvg * 0.1, overAvg * 0.05
                ].map(v => Math.abs(v));
                const calData = [
                  calAvg * 0.2, calAvg * 0.1, calAvg * 0.05, calAvg * 0.02
                ].map(v => Math.abs(v));

                return (
                  <>
                    {[-8, -6, -4, -2, 0, 2, 4, 6, 8].map(v => (
                      <g key={v}>
                        <text x={16} y={toY(v) + 3} fontSize={8} fill={textSecondary} textAnchor="end" fontFamily="'IBM Plex Mono',monospace">{Math.abs(v)}</text>
                        <line x1={20} y1={toY(v)} x2={300} y2={toY(v)} stroke={rowBorder} strokeWidth={v === 0 ? 0.5 : 0.3} />
                      </g>
                    ))}
                    <line x1={20} y1={toY(0)} x2={300} y2={toY(0)} stroke={isDark ? "rgba(255,255,255,.15)" : "rgba(0,0,0,.12)"} strokeWidth={1} strokeDasharray="4,4" />
                    {labels.map((l, i) => (
                      <text key={l} x={toX(i, labels.length)} y={235} fontSize={8} fill={textSecondary} textAnchor="middle" fontFamily="'IBM Plex Mono',monospace">{l}</text>
                    ))}

                    {overData.map((v, i) => {
                      const cx = toX(i, overData.length);
                      const cy = toY(-v);
                      return (
                        <g key={`over-${i}`}>
                          {i > 0 && <line x1={toX(i - 1, overData.length)} y1={toY(-overData[i - 1])} x2={cx} y2={cy} stroke="#ff7b72" strokeWidth={1.5} />}
                          <circle cx={cx} cy={cy} r={4} fill="#ff7b72" />
                        </g>
                      );
                    })}

                    {calData.map((v, i) => {
                      const cx = toX(i, calData.length);
                      const cy = toY(v);
                      return (
                        <g key={`cal-${i}`}>
                          {i > 0 && <line x1={toX(i - 1, calData.length)} y1={toY(calData[i - 1])} x2={cx} y2={cy} stroke="#5dcaa5" strokeWidth={1.5} />}
                          <circle cx={cx} cy={cy} r={4} fill="#5dcaa5" />
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 12 }}>
            <Sparkles size={13} /> Intervenciones grupales recomendadas · basadas en clústeres detectados
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
            {[
              {
                cluster: 'Sobreconfianza',
                count: data?.cluster_distribution.over || 0,
                color: '#ff7b72',
                action: 'Pausa de reflexión colectiva (10 min)',
                desc: 'Actividad grupal donde cada estudiante compara su JOL con su resultado en voz alta. El docente facilita sin juzgar. Activa la regulación social del aprendizaje.',
              },
              {
                cluster: 'Subestimación',
                count: data?.cluster_distribution.sub || 0,
                color: '#388bfd',
                action: 'Sesión de reconocimiento de logros (8 min)',
                desc: 'El docente muestra a este subgrupo sus propias métricas de desempeño real vs. JOL. El dato propio es la evidencia más persuasiva de Bandura.',
              },
              {
                cluster: 'Calibrado',
                count: data?.cluster_distribution.cal || 0,
                color: '#5dcaa5',
                action: 'Rol de par cognitivo experto',
                desc: 'Asigna a este grupo como mentores dentro de la ZDP de sus compañeros. Consolidan conocimiento enseñando y el grupo receptor recibe andamiaje genuino.',
              },
            ].map(interv => (
              <div key={interv.cluster} style={{ background: inputBg, border: `0.5px solid ${rowBorder}`, borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: interv.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
                  Clúster: {interv.cluster} · {interv.count} estudiantes
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: textPrimary, marginBottom: 4, lineHeight: 1.4 }}>{interv.action}</div>
                <div style={{ fontSize: 11, color: textSecondary, lineHeight: 1.55, marginBottom: 8 }}>{interv.desc}</div>
                <button
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(interv.action + ' metacognición')}`, '_blank')}
                  style={{
                    width: '100%', background: 'transparent', border: `0.5px solid ${cardBorder}`, borderRadius: 6, padding: 6,
                    fontSize: 11, fontFamily: "'Sora', sans-serif", color: textMuted, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                >
                  <FileText size={12} /> Ver recursos
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          {([
            ['all', 'Todos'],
            ['over', 'Sobreconfianza'],
            ['sub', 'Subestimación'],
            ['cal', 'Calibrados'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterMode(key)}
              style={{
                padding: '5px 12px', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", borderRadius: 6, cursor: 'pointer',
                border: `0.5px solid ${filterMode === key ? (key === 'over' ? '#ff7b72' : key === 'sub' ? '#388bfd' : key === 'cal' ? '#5dcaa5' : cardBorder) : cardBorder}`,
                background: filterMode === key ? (key === 'over' ? 'rgba(255,123,114,.1)' : key === 'sub' ? 'rgba(56,139,253,.1)' : key === 'cal' ? 'rgba(93,202,165,.1)' : 'transparent') : 'transparent',
                color: filterMode === key ? (key === 'over' ? '#ff7b72' : key === 'sub' ? '#388bfd' : key === 'cal' ? '#5dcaa5' : textPrimary) : textSecondary,
              }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setFilterMode('alert')}
            style={{
              padding: '5px 12px', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", borderRadius: 6, cursor: 'pointer',
              border: `0.5px solid ${filterMode === 'alert' ? 'rgba(255,123,114,.3)' : cardBorder}`,
              background: filterMode === 'alert' ? 'rgba(255,123,114,.1)' : 'transparent', color: '#ff7b72',
              marginLeft: 'auto',
            }}
          >
            Alertas urgentes
          </button>
        </div>

        <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 10, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 120px', padding: '8px 14px', borderBottom: `0.5px solid ${rowBorder}`, fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <span>Estudiante</span><span>JOL</span><span>Nota</span><span>Desfase</span><span>Calib.</span><span>Perfil</span><span />
          </div>
          {recentStudents.map(s => {
            const cl = s.cluster || 'cal';
            const gapColor = s.gap != null && Math.abs(s.gap) <= 1 ? '#5dcaa5' : Math.abs(s.gap || 0) <= 3 ? '#f2cc60' : '#ff7b72';
            return (
              <div
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 120px',
                  padding: '9px 14px', borderBottom: `0.5px solid ${rowBorder}`,
                  fontSize: 12, alignItems: 'center', cursor: 'pointer',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500,
                    background: CLUSTER_BG[cl], color: CLUSTER_COLORS[cl],
                  }}>{s.initials}</span>
                  <span style={{ color: textPrimary }}>{s.name}</span>
                </span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#f2cc60' }}>{s.jol ?? '—'}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: s.performance != null && s.performance >= 7 ? '#5dcaa5' : s.performance != null && s.performance >= 5 ? '#f2cc60' : '#ff7b72' }}>{s.performance ?? '—'}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: gapColor }}>
                  {s.gap != null ? `${s.gap >= 0 ? '+' : ''}${s.gap}` : '—'}
                </span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: s.calibration_index != null && s.calibration_index >= 7 ? '#5dcaa5' : '#f2cc60' }}>{s.calibration_index ?? '—'}</span>
                <span>
                  <span style={{
                    background: CLUSTER_BG[cl], color: CLUSTER_COLORS[cl],
                    borderRadius: 5, padding: '2px 7px', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace",
                  }}>
                    {CLUSTER_LABEL[cl]}
                  </span>
                </span>
                <span />
              </div>
            );
          })}
          {recentStudents.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: textSecondary, fontSize: 12 }}>
              No hay estudiantes en este filtro
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
