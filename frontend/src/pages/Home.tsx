import { GraduationCap, ShieldCheck, Compass, ArrowRight, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useCognitiveStore, UserRole } from '../stores/useCognitiveStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTheme } from '../ThemeContext';
import WalkingScene from '../components/WalkingScene/WalkingScene';
import { SiteFooter } from '../components/SiteFooter';

export function Home() {
  const user = useCognitiveStore((s) => s.user);
  const token = useCognitiveStore((s) => s.token);
  const role = useCognitiveStore((s) => s.role);
  const setRole = useCognitiveStore((s) => s.setRole);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  if (user && token && role) {
    navigate(role === 'admin' || role === 'teacher' ? '/admin' : '/student', { replace: true });
    return null;
  }

  const handleSelectRole = (selected: UserRole) => {
    navigate(selected === 'admin' ? '/admin-login' : '/profile');
  };

  const roles = [
    { 
      id: 'student' as UserRole, 
      title: 'Estudiante', 
      desc: 'Accede a tus análisis, visualiza tu progreso y recibe recomendaciones.',
      icon: GraduationCap,
      iconClasses: 'bg-gradient-to-br from-primary to-violet-400 shadow-[0_24px_70px_-35px_rgba(103,75,181,0.45)] text-white',
      borderColor: 'border-primary'
    },
    { 
      id: 'admin' as UserRole, 
      title: 'Administrador', 
      desc: 'Gestiona la infraestructura, permisos y monitoreo general del sistema.', 
      icon: ShieldCheck,
      iconClasses: 'bg-gradient-to-br from-sky-500 via-cyan-400 to-teal-400 shadow-[0_24px_70px_-35px_rgba(56,189,248,0.38)] text-white',
      borderColor: 'border-sky-500'
    }
  ];

  return (
    <div className="relative w-full" style={{ height: '100vh' }}>
    <WalkingScene initialTheme={theme === 'dark' ? 'night' : 'day'} showControls={false} boyLeft={84}>
    <div className="h-full w-full bg-transparent flex flex-col items-center justify-start overflow-y-auto relative">
      {/* Menú superior */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "w-full sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 sm:py-4 backdrop-blur-md border-b",
          theme === 'light'
            ? "bg-white/30 border-white/30"
            : "bg-slate-950/30 border-white/10"
        )}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <img src="/logo.png" alt="Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
          <span className={cn(
            "font-black text-sm sm:text-base tracking-tight",
            theme === 'light' ? "text-slate-900" : "text-white"
          )}>
            Meta-Pathfinder
          </span>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className={cn(
            "p-2.5 sm:p-3 rounded-full backdrop-blur-md border shadow-lg transition-all duration-300 hover:scale-110 active:scale-95",
            theme === 'light'
              ? "bg-white/20 border-white/30 text-slate-900 hover:bg-white/30"
              : "bg-white/10 border-white/20 text-white hover:bg-white/20"
          )}
          title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
      </motion.header>

      <div className="flex-1 w-full flex flex-col items-center p-4 sm:p-6 lg:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-12 relative z-10 mt-6 sm:mt-10 lg:mt-12"
      >
        <div className={cn(
          "inline-flex items-center gap-3 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full backdrop-blur-md border font-bold text-[11px] sm:text-sm uppercase tracking-widest mb-4 sm:mb-5",
          theme === 'light' 
            ? "bg-white/10 border-white/20 text-slate-900" 
            : "bg-white/10 border-white/20 text-white"
        )}>
          <img src="/logo.png" alt="Logo" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" /> Meta-Pathfinder v1.0
        </div>
        <h1 className={cn(
          "text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mb-3 sm:mb-4",
          theme === 'light' ? "text-slate-900" : "text-white"
        )}>
          Panel de Acceso <span className={cn(
            "italic drop-shadow-[0_0_15px_rgba(103,75,181,0.5)]",
            theme === 'light' ? "text-primary" : "text-primary"
          )}>Cognitivo</span>
        </h1>
        <p className={cn(
          "text-sm sm:text-base lg:text-lg max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto font-medium",
          theme === 'light' ? "text-slate-600" : "text-white/70"
        )}>
          Selecciona tu rol para entrar al ecosistema de descubrimiento y autorregulación.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 w-full max-w-lg sm:max-w-2xl lg:max-w-4xl relative z-10">
        {roles.map((role, idx) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => handleSelectRole(role.id)}
            className={cn(
              "p-5 sm:p-6 lg:p-8 group cursor-pointer border-t-[5px] sm:border-t-[6px] lg:border-t-[8px] h-full flex flex-col hover:scale-[1.02] active:scale-[0.98] rounded-2xl sm:rounded-3xl transition-all duration-500",
              "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_25px_60px_-20px_rgba(15,23,42,0.35)] hover:bg-white/80 hover:shadow-[0_30px_70px_-22px_rgba(15,23,42,0.4)]",
              role.id === 'student' ? 'border-t-primary' : 'border-t-sky-500/80'
            )}
          >
            <div className={cn(
              "w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-5 lg:mb-6 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110",
              role.iconClasses
            )}>
              <role.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black mb-2 sm:mb-3 tracking-tight text-slate-900">{role.title}</h3>
            <p className="text-[13px] sm:text-sm lg:text-base mb-4 sm:mb-5 lg:mb-6 flex-1 leading-relaxed sm:leading-relaxed font-medium text-slate-600">{role.desc}</p>
            <div className={cn(
              "flex items-center gap-2 sm:gap-3 font-black text-[11px] sm:text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform",
              role.id === 'student' ? 'text-indigo-700' : 'text-sky-700'
            )}>
              Comenzar ahora <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </motion.div>
        ))}
      </div>
      </div>

      <SiteFooter theme={theme} />
    </div>
    </WalkingScene>
    </div>
  );
}
