import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import './Tour.css';

interface ActivitySetupTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ActivitySetupTour({ isOpen, onClose }: ActivitySetupTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      targetId: 'tour-activity-area',
      badge: 'Guía · paso 1 de 3',
      title: 'Zona de trabajo',
      description: 'Aquí resuelves el reto: arrastrar tarjetas, mover bloques, escribir o elegir respuestas.',
      icon: 'ti-tool',
    },
    {
      targetId: 'tour-strategy-panel',
      badge: 'Guía · paso 2 de 3',
      title: 'Tus herramientas',
      description: 'Panel flotante con las herramientas de tu estrategia (listas, notas y guías). Puedes moverlo o minimizarlo.',
      icon: 'ti-bulb',
    },
    {
      targetId: 'tour-activity-criteria',
      badge: 'Guía · paso 3 de 3',
      title: 'Criterios y verificación',
      description: 'A la izquierda ves los pasos y los criterios de la actividad. Al terminar, pulsa «Verificar» y luego «Enviar».',
      icon: 'ti-checkup-list',
    },
  ];

  const step = steps[currentStep];

  useEffect(() => {
    if (!isOpen) return;
    document.querySelectorAll('.mp-tour-highlight').forEach(el => el.classList.remove('mp-tour-highlight'));
    const timer = setTimeout(() => {
      const el = document.getElementById(step.targetId);
      if (el) {
        el.classList.add('mp-tour-highlight');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
    return () => {
      clearTimeout(timer);
      document.querySelectorAll('.mp-tour-highlight').forEach(e => e.classList.remove('mp-tour-highlight'));
    };
  }, [isOpen, currentStep, step.targetId]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
    else onClose();
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="activity-tour-dialog"
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="mp-tour-panel mp-tour-panel--bottom"
      >
        <div style={{ marginBottom: '10px' }}>
          <span className="mp-tour-badge">{step.badge}</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div className="mp-tour-icon">
            <i className={`ti ${step.icon}`} style={{ fontSize: 18, color: 'var(--tour-hl)' }} />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', lineHeight: 1.3 }}>{step.title}</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>{step.description}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '5px', marginBottom: '14px', justifyContent: 'center' }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                height: '5px',
                width: i === currentStep ? '24px' : '6px',
                borderRadius: '3px',
                background: i === currentStep ? 'var(--tour-hl)' : 'var(--border)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
          <button onClick={handlePrev} disabled={currentStep === 0} className="mp-tour-btn-ghost">Anterior</button>
          <button onClick={handleNext} className="mp-tour-btn">
            {currentStep === steps.length - 1 ? 'Entendido, empezar' : 'Siguiente'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
