import { Target, Compass, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function StudentDashboard() {
  const { user, role } = useCognitiveStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && role === 'student') navigate('/profile', { replace: true });
  }, [user, role, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 lg:py-20 space-y-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Meta-Pathfinder
          </div>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-on-surface">
            Hola, {user?.name || 'Estudiante'}
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto font-medium leading-relaxed">
            Vas a descubrir <strong>cómo aprendes realmente</strong>. Este sistema mide tu 
            precisión metacognitiva: qué tan bien coincide lo que crees saber con lo que realmente sabes.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-on-primary rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 hover:scale-105 transition-all active:scale-95"
          >
            Comencemos <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>

        {/* 3 Cards Explicativas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bento-card p-8 bg-white border border-primary/10 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-on-surface">¿Qué es?</h3>
            <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
              No es un examen tradicional. Es un entorno de <strong>calibración intensa</strong> 
              donde cada reto mide tu conciencia metacognitiva en tiempo real.
            </p>
          </div>

          <div className="bento-card p-8 bg-white border border-secondary/10 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-on-surface">¿Cómo funciona?</h3>
            <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
              Cada reto tiene <strong>3 pasos</strong>: contexto situacional → autopercepción (1-10) 
              → pregunta técnica. Si fallas, recibes un reto alternativo del mismo tema.
            </p>
          </div>

          <div className="bento-card p-8 bg-white border border-tertiary/10 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-on-surface">¿Por qué importa?</h3>
            <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
              Identificarás <strong>sesgos cognitivos</strong>, áreas débiles y desarrollarás 
              una conciencia más precisa de tu propio conocimiento.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="text-center pb-8">
        <p className="text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-widest">
          Meta-Pathfinder v1.0 — Investigación en Metacognición
        </p>
      </footer>
    </div>
  );
}
