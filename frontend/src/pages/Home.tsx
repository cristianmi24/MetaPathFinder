import { useEffect, useState } from 'react';
import { GraduationCap, ShieldCheck, ArrowRight, Sun, Moon, Home as HomeIcon, Info, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTheme } from '../ThemeContext';
import WalkingScene from '../components/WalkingScene/WalkingScene';
import { SiteFooter } from '../components/SiteFooter';
import { InfoDialogs, type InfoDialogId } from '../components/InfoDialogs';

const ROLES = [
  {
    id: 'student',
    path: '/profile',
    title: 'Estudiante',
    desc: 'Resuelve retos, revisa tu progreso y descubre cómo aprendes mejor.',
    cta: 'Entrar como estudiante',
    icon: GraduationCap,
    iconClasses: 'bg-gradient-to-br from-primary to-violet-400 text-white shadow-lg shadow-primary/30',
    accent: 'text-primary',
  },
  {
    id: 'admin',
    path: '/admin-login',
    title: 'Administrador',
    desc: 'Consulta los resultados del grupo, gestiona usuarios y revisa las actividades.',
    cta: 'Entrar al panel',
    icon: ShieldCheck,
    iconClasses: 'bg-gradient-to-br from-sky-500 to-teal-400 text-white shadow-lg shadow-sky-500/30',
    accent: 'text-sky-700 dark:text-sky-300',
  },
] as const;

export function Home() {
  const user = useCognitiveStore((s) => s.user);
  const token = useCognitiveStore((s) => s.token);
  const role = useCognitiveStore((s) => s.role);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const light = theme === 'light';
  const [params, setParams] = useSearchParams();
  const [info, setInfo] = useState<InfoDialogId | null>(null);

  // Permite abrir las ventanas desde otras páginas: /?info=about | /?info=credits
  useEffect(() => {
    const requested = params.get('info');
    if (requested === 'about' || requested === 'credits') {
      setInfo(requested);
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  if (user && token && role) {
    return <Navigate to={role === 'admin' ? '/admin' : '/student'} replace />;
  }

  const navItems: { id: 'home' | InfoDialogId; label: string; icon: typeof HomeIcon }[] = [
    { id: 'home', label: 'Inicio', icon: HomeIcon },
    { id: 'about', label: '¿De qué trata?', icon: Info },
    { id: 'credits', label: 'Créditos', icon: Award },
  ];

  return (
    <div className="relative w-full" style={{ height: '100vh' }}>
      <WalkingScene initialTheme={light ? 'day' : 'night'} showControls={false} boyLeft={84}>
        <div className="h-full w-full flex flex-col overflow-y-auto">
          {/* Menú superior */}
          <header className="sticky top-0 z-20 w-full px-3 sm:px-6 pt-3 sm:pt-4">
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              aria-label="Menú principal"
              className={cn(
                'ui-sans mx-auto flex w-full max-w-6xl items-center justify-between gap-2 rounded-full border px-2 py-2 sm:px-3 backdrop-blur-xl shadow-lg',
                light ? 'bg-white/70 border-white/70 shadow-slate-900/10' : 'bg-slate-950/60 border-white/10 shadow-black/30'
              )}
            >
              <button type="button" onClick={() => setInfo(null)} className="flex items-center gap-2 pl-1 pr-2">
                <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
                <span className={cn('hidden sm:inline font-serif text-lg font-semibold tracking-tight', light ? 'text-slate-900' : 'text-white')}>
                  MetaPathFinder
                </span>
              </button>

              <div className="flex items-center gap-0.5 sm:gap-1">
                {navItems.map(({ id, label, icon: Icon }) => {
                  const active = id === 'home' ? info === null : info === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setInfo(id === 'home' ? null : id)}
                      aria-current={id === 'home' && active ? 'page' : undefined}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? light ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                          : light ? 'text-slate-700 hover:bg-slate-900/5' : 'text-white/80 hover:bg-white/10'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden md:inline">{label}</span>
                    </button>
                  );
                })}
                <span className={cn('mx-1 h-6 w-px', light ? 'bg-slate-900/10' : 'bg-white/15')} />
                <button
                  type="button"
                  onClick={toggleTheme}
                  title={`Cambiar a tema ${light ? 'oscuro' : 'claro'}`}
                  aria-label={`Cambiar a tema ${light ? 'oscuro' : 'claro'}`}
                  className={cn(
                    'rounded-full p-2 transition-colors',
                    light ? 'text-slate-700 hover:bg-slate-900/5' : 'text-white/80 hover:bg-white/10'
                  )}
                >
                  {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </button>
              </div>
            </motion.nav>
          </header>

          {/* Contenido */}
          <main className="flex-1 w-full flex flex-col items-center px-4 sm:px-6 py-10 sm:py-14 lg:py-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 sm:mb-10 max-w-2xl"
            >
              <h1
                className={cn(
                  'font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]',
                  light ? 'text-slate-900' : 'text-white'
                )}
                style={{ textShadow: light ? '0 1px 12px rgba(255,255,255,0.6)' : '0 2px 16px rgba(0,0,0,0.45)' }}
              >
                Panel de acceso <span className="italic text-primary">cognitivo</span>
              </h1>
              <p
                className={cn('ui-sans mt-4 text-base sm:text-lg leading-relaxed', light ? 'text-slate-700' : 'text-white/80')}
                style={{ textShadow: light ? '0 1px 10px rgba(255,255,255,0.7)' : '0 1px 10px rgba(0,0,0,0.5)' }}
              >
                Elige cómo quieres entrar para comenzar.
              </p>
            </motion.div>

            <div className="grid w-full max-w-4xl grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {ROLES.map((r, idx) => (
                <motion.button
                  key={r.id}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + idx * 0.08 }}
                  onClick={() => navigate(r.path)}
                  className={cn(
                    'ui-sans group flex h-full flex-col rounded-3xl border p-6 sm:p-7 text-left backdrop-blur-xl transition-all duration-300',
                    'hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30',
                    light
                      ? 'bg-white/75 border-white/80 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.45)] hover:bg-white/90'
                      : 'bg-slate-900/70 border-white/10 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.7)] hover:bg-slate-900/85'
                  )}
                >
                  <span className={cn('mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105', r.iconClasses)}>
                    <r.icon className="h-6 w-6" />
                  </span>
                  <span className={cn('font-serif text-2xl sm:text-[26px] font-semibold tracking-tight', light ? 'text-slate-900' : 'text-white')}>
                    {r.title}
                  </span>
                  <span className={cn('mt-2 flex-1 text-[15px] leading-relaxed', light ? 'text-slate-600' : 'text-white/70')}>
                    {r.desc}
                  </span>
                  <span className={cn('mt-6 inline-flex items-center gap-2 text-sm font-semibold', r.accent)}>
                    {r.cta}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </motion.button>
              ))}
            </div>
          </main>

          <SiteFooter theme={theme} onOpenInfo={setInfo} />
        </div>
      </WalkingScene>
      <InfoDialogs open={info} onClose={() => setInfo(null)} />
    </div>
  );
}
