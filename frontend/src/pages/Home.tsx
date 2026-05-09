import { GraduationCap, ShieldCheck, Compass, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useCognitiveStore, UserRole } from '../stores/useCognitiveStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Home() {
  const setRole = useCognitiveStore((s) => s.setRole);
  const navigate = useNavigate();

  const handleSelectRole = (role: UserRole) => {
    setRole(role);
    navigate('/');
  };

  const roles = [
    { 
      id: 'student' as UserRole, 
      title: 'Estudiante', 
      desc: 'Accede a tus evaluaciones, visualiza tu progreso cognitivo y recibe recomendaciones.', 
      icon: GraduationCap,
      color: 'bg-primary-container text-on-primary-container',
      borderColor: 'border-primary'
    },
    { 
      id: 'admin' as UserRole, 
      title: 'Administrador', 
      desc: 'Gestiona la infraestructura, permisos y monitoreo general del sistema.', 
      icon: ShieldCheck,
      color: 'bg-surface-container-highest text-on-surface',
      borderColor: 'border-outline'
    }
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 relative z-10"
      >
        <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-sm uppercase tracking-widest mb-6">
          <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" /> Meta-Pathfinder v1.0
        </div>
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter text-white mb-6">
          Panel de Acceso <span className="text-primary italic drop-shadow-[0_0_15px_rgba(103,75,181,0.5)]">Cognitivo</span>
        </h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto font-medium">
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
              "p-10 group cursor-pointer border-t-[10px] h-full flex flex-col hover:scale-[1.02] active:scale-[0.98] bg-white rounded-3xl transition-all duration-500 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:shadow-primary/20",
              role.id === 'student' ? 'border-primary' : 'border-slate-300'
            )}
          >
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-10 shadow-lg transition-all duration-500 group-hover:rotate-6 group-hover:scale-110", 
              role.id === 'student' ? 'bg-primary text-white shadow-primary/30' : 'bg-slate-900 text-white shadow-slate-900/30')}>
              <role.icon className="w-9 h-9" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{role.title}</h3>
            <p className="text-lg text-slate-600 mb-12 flex-1 leading-relaxed font-medium">{role.desc}</p>
            <div className="flex items-center gap-3 text-primary font-black text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform">
              Comenzar ahora <ArrowRight className="w-5 h-5" />
            </div>
          </motion.div>
        ))}
      </div>

      <footer className="mt-20 text-white/60 text-sm font-bold relative z-10 tracking-widest uppercase">
        © 2026 Meta-Pathfinder Project. Investigación Q1 Protegida.
      </footer>
    </div>
  );
}
