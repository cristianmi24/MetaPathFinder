import { useEffect } from 'react';
import { useCognitiveStore, CognitiveState } from '../stores/useCognitiveStore';

/**
 * Orquestador inteligente que simula la inferencia del motor ML
 * (Inspiration for SVM/Isolation Forest integration)
 */
export function CognitiveBrain() {
  const { role, cognitiveLoad, calibration, addEvent, setCognitiveState, updateCognitiveMetrics } = useCognitiveStore();

  useEffect(() => {
    if (!role) return;

    // Simulación de "Heartbeat" de inferencia cada 10 segundos
    const interval = setInterval(() => {
      const randomShift = (Math.random() - 0.5) * 0.1;
      const newLoad = Math.max(0.1, Math.min(0.9, cognitiveLoad + randomShift));
      const newCalibration = Math.max(0.1, Math.min(0.9, calibration + (Math.random() - 0.5) * 0.05));
      
      updateCognitiveMetrics(newLoad, newCalibration);

      // Lógica de Clasificación de Estado
      let newState: CognitiveState = 'Flow';
      if (newLoad > 0.8) newState = 'Frustration';
      else if (newLoad < 0.2) newState = 'Boredom';
      else if (newCalibration < 0.4) newState = 'Confusion';
      
      setCognitiveState(newState);
      
      if (newState !== 'Flow') {
        addEvent('COGNITIVE_STATE_SHIFT', { state: newState });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [cognitiveLoad, calibration, updateCognitiveMetrics, setCognitiveState, addEvent]);

  return null; // Silent component
}
