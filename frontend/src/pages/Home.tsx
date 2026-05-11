import { GraduationCap, ShieldCheck, Compass, ArrowRight, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useCognitiveStore, UserRole } from '../stores/useCognitiveStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTheme } from '../ThemeContext';

export function Home() {
  const setRole = useCognitiveStore((s) => s.setRole);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSelectRole = (role: UserRole) => {
    setRole(role);
    navigate(role === 'student' ? '/student' : '/admin');
  };

  const roles = [
    { 
      id: 'student' as UserRole, 
      title: 'Estudiante', 
      desc: 'Accede a tus evaluaciones, visualiza tu progreso cognitivo y recibe recomendaciones.', 
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
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden relative">
      {/* Botón de cambio de tema flotante */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        onClick={toggleTheme}
        className={cn(
          "fixed top-6 right-6 z-20 p-3 rounded-full backdrop-blur-md border shadow-lg transition-all duration-300 hover:scale-110 active:scale-95",
          theme === 'light'
            ? "bg-white/20 border-white/30 text-slate-900 hover:bg-white/30"
            : "bg-white/10 border-white/20 text-white hover:bg-white/20"
        )}
        title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </motion.button>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 relative z-10"
      >
        <div className={cn(
          "inline-flex items-center gap-4 px-6 py-3 rounded-full backdrop-blur-md border font-bold text-sm uppercase tracking-widest mb-6",
          theme === 'light' 
            ? "bg-white/10 border-white/20 text-slate-900" 
            : "bg-white/10 border-white/20 text-white"
        )}>
          <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" /> Meta-Pathfinder v1.0
        </div>
        <h1 className={cn(
          "text-5xl lg:text-7xl font-bold tracking-tighter mb-6",
          theme === 'light' ? "text-slate-900" : "text-white"
        )}>
          Panel de Acceso <span className={cn(
            "italic drop-shadow-[0_0_15px_rgba(103,75,181,0.5)]",
            theme === 'light' ? "text-primary" : "text-primary"
          )}>Cognitivo</span>
        </h1>
        <p className={cn(
          "text-xl max-w-2xl mx-auto font-medium",
          theme === 'light' ? "text-slate-600" : "text-white/70"
        )}>
          Selecciona tu rol para entrar al ecosistema de descubrimiento y autorregulación.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-4xl relative z-10">
        {roles.map((role, idx) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => handleSelectRole(role.id)}
            className={cn(
              "p-10 group cursor-pointer border-t-[10px] h-full flex flex-col hover:scale-[1.02] active:scale-[0.98] rounded-3xl transition-all duration-500",
              theme === 'light'
                ? 'bg-white shadow-[0_25px_50px_-18px_rgba(103,75,181,0.12)] hover:shadow-[0_30px_70px_-28px_rgba(103,75,181,0.18)]'
                : 'bg-slate-950/95 border border-slate-700/70 shadow-[0_25px_60px_-25px_rgba(15,23,42,0.75)] hover:shadow-[0_30px_80px_-30px_rgba(56,189,248,0.2)]',
              role.id === 'student' ? 'border-primary' : 'border-sky-500/80'
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-3xl flex items-center justify-center mb-10 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110",
              role.iconClasses
            )}>
              <role.icon className="w-9 h-9" />
            </div>
            <h3 className={cn(
              "text-3xl font-black mb-4 tracking-tight",
              theme === 'light' ? "text-slate-900" : "text-white"
            )}>{role.title}</h3>
            <p className={cn(
              "text-lg mb-12 flex-1 leading-relaxed font-medium",
              theme === 'light' ? "text-slate-600" : "text-slate-200"
            )}>{role.desc}</p>
            <div className={cn(
              "flex items-center gap-3 font-black text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform",
              theme === 'light' ? "text-primary" : "text-cyan-300"
            )}>
              Comenzar ahora <ArrowRight className="w-5 h-5" />
            </div>
          </motion.div>
        ))}
      </div>

      <footer className={cn(
        "mt-20 text-sm font-bold relative z-10 tracking-widest uppercase",
        theme === 'light' ? "text-slate-600" : "text-white/60"
      )}>
        © 2026 Meta-Pathfinder Project. Investigación Q1 Protegida.
      </footer>
    </div>
  );
}
