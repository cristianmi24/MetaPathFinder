import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Brain, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { useCognitiveStore } from '../stores/useCognitiveStore';

export function MetacognitiveBrakeModal() {
  const { isReflexiveBrakeActive, brakeMessage, dismissReflexiveBrake } = useCognitiveStore();
  const [countdown, setCountdown] = useState(3);
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    if (isReflexiveBrakeActive) {
      setCountdown(3);
      setCanDismiss(false);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanDismiss(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isReflexiveBrakeActive]);

  if (!isReflexiveBrakeActive) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="max-w-md w-full bg-surface border-2 border-warning/40 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-warning/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-16 h-16 bg-warning/15 text-warning rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-warning/20">
            <Brain className="w-9 h-9 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-warning/10 text-warning rounded-full text-xs font-bold uppercase tracking-widest mb-3">
            <ShieldAlert className="w-3.5 h-3.5" /> Freno Metacognitivo Activo
          </div>

          <h3 className="text-2xl font-bold tracking-tight text-on-surface mb-3">
            Pausa de Reflexión
          </h3>

          <p className="text-sm text-on-surface-variant leading-relaxed mb-6 font-medium">
            {brakeMessage || 'Detectamos una respuesta impulsiva en tiempo récord (< 5s). El aprendizaje profundo requiere verificar supuestos antes de confirmar.'}
          </p>

          <div className="bg-surface-container-high rounded-2xl p-4 mb-6 border border-outline-variant/20 flex items-center justify-center gap-3">
            <Clock className="w-5 h-5 text-warning" />
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {canDismiss ? 'Reflexión completada' : `Tiempo de pausa activa: ${countdown}s`}
            </span>
          </div>

          <button
            disabled={!canDismiss}
            onClick={dismissReflexiveBrake}
            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
              canDismiss
                ? 'bg-warning text-on-warning shadow-warning/20 hover:scale-[1.02] active:scale-95 cursor-pointer'
                : 'bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed border border-outline-variant/10'
            }`}
          >
            {canDismiss ? (
              <>
                Confirmar y Continuar <CheckCircle2 className="w-5 h-5" />
              </>
            ) : (
              <>
                Reflexionando ({countdown}s)... <Sparkles className="w-4 h-4 animate-spin" />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
