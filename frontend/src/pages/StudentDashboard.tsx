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
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 lg:py-16 space-y-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="ui-sans inline-flex items-center gap-2 px-3 py-1 text-primary rounded-full text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Meta-Pathfinder
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-on-surface">
            Hola, {user?.name || 'Estudiante'}
          </h1>
          <p className="text-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed">
            Aquí explorarás <strong>cómo aprendes</strong> — sin nota y sin presión.
            Es un análisis para conocerte mejor y practicar estrategias de estudio.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="ui-sans inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-on-primary rounded-md font-semibold text-base hover:opacity-90 transition-opacity active:scale-[0.99]"
          >
            Ir a mi perfil <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>

        {/* 3 Cards Explicativas */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bento-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-on-surface">¿Qué es?</h3>
            <p className="ui-sans text-sm text-on-surface-variant leading-relaxed">
              <strong>No se califica.</strong> Un espacio tranquilo para practicar retos de tecnología
              mientras observas cómo piensas.
            </p>
          </div>

          <div className="bento-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-md bg-secondary/10 text-secondary flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-on-surface">¿Cómo funciona?</h3>
            <p className="ui-sans text-sm text-on-surface-variant leading-relaxed">
              Tres momentos: antes dices cómo te sientes, durante resuelves el reto, después ves tu calibración.
            </p>
          </div>

          <div className="bento-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-md bg-tertiary/10 text-tertiary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-on-surface">¿Por qué importa?</h3>
            <p className="ui-sans text-sm text-on-surface-variant leading-relaxed">
              Detectas dónde tu confianza no coincide con tu desempeño y ajustas cómo estudias.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="text-center pb-8">
        <p className="ui-sans text-[10px] text-on-surface-variant/50 font-medium uppercase tracking-widest">
          Meta-Pathfinder — Investigación en metacognición
        </p>
      </footer>
    </div>
  );
}
