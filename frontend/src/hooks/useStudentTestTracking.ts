import { useEffect } from 'react';
import { useCognitiveStore } from '../stores/useCognitiveStore';

export function useStudentTestTracking() {
  const { addEvent, addStudentEvent, currentTestSession } = useCognitiveStore();

  // Rastrear clicks
  const trackClick = (target: string) => {
    addEvent('UI_CLICK', {
      target,
      clicks: 1,
      timestamp: Date.now()
    });

    // También agregar al estudiante actual si hay sesión activa
    if (currentTestSession) {
      addStudentEvent(currentTestSession.studentId, {
        id: `click-${Date.now()}`,
        type: 'UI_CLICK',
        timestamp: Date.now(),
        metadata: {
          target,
          clicks: 1
        }
      });
    }
  };

  // Rastrear respuesta a pregunta
  const trackQuestionAnswer = (questionId: string, isCorrect: boolean, timeSpent: number, clicks: number) => {
    addEvent('QUIZ_ANSWER', {
      questionId,
      correct: isCorrect,
      timeSpent,
      clicks,
      timestamp: Date.now()
    });

    // También agregar al estudiante actual si hay sesión activa
    if (currentTestSession) {
      addStudentEvent(currentTestSession.studentId, {
        id: `answer-${Date.now()}`,
        type: 'QUIZ_ANSWER',
        timestamp: Date.now(),
        metadata: {
          questionId,
          correct: isCorrect,
          timeSpent,
          clicks
        }
      });
    }
  };

  // Rastrear navegación entre páginas/fases
  const trackPageNavigation = (fromPage: string, toPage: string) => {
    addEvent('PAGE_NAVIGATION', {
      fromPage,
      toPage,
      pageNavigation: true,
      timestamp: Date.now()
    });

    // También agregar al estudiante actual si hay sesión activa
    if (currentTestSession) {
      addStudentEvent(currentTestSession.studentId, {
        id: `nav-${Date.now()}`,
        type: 'PAGE_NAVIGATION',
        timestamp: Date.now(),
        metadata: {
          fromPage,
          toPage,
          pageNavigation: true
        }
      });
    }
  };

  // Rastrear juicio de nivel
  const trackLevelJudgment = (level: string, confidence: number, attempt: number) => {
    addEvent('LEVEL_JUDGMENT', {
      level,
      confidence,
      attempt,
      timestamp: Date.now()
    });

    // También agregar al estudiante actual si hay sesión activa
    if (currentTestSession) {
      addStudentEvent(currentTestSession.studentId, {
        id: `judgment-${Date.now()}`,
        type: 'LEVEL_JUDGMENT',
        timestamp: Date.now(),
        metadata: {
          level,
          confidence,
          attempt
        }
      });
    }
  };

  // Rastrear calibración de nivel
  const trackLevelCalibration = (level: string, score: number, calibration: number, gap: number, passed: boolean, attempt: number) => {
    addEvent('LEVEL_CALIBRATION', {
      level,
      score,
      calibration,
      gap,
      passed,
      attempt,
      timestamp: Date.now()
    });

    // También agregar al estudiante actual si hay sesión activa
    if (currentTestSession) {
      addStudentEvent(currentTestSession.studentId, {
        id: `calibration-${Date.now()}`,
        type: 'LEVEL_CALIBRATION',
        timestamp: Date.now(),
        metadata: {
          level,
          score,
          calibration,
          gap,
          passed,
          attempt
        }
      });
    }
  };

  // Rastrear repetición de nivel
  const trackLevelRepeat = (level: string, reason: string, gap: number, attempt: number) => {
    addEvent('LEVEL_REPEAT', {
      level,
      reason,
      gap,
      attempt,
      timestamp: Date.now()
    });

    // También agregar al estudiante actual si hay sesión activa
    if (currentTestSession) {
      addStudentEvent(currentTestSession.studentId, {
        id: `repeat-${Date.now()}`,
        type: 'LEVEL_REPEAT',
        timestamp: Date.now(),
        metadata: {
          level,
          reason,
          gap,
          attempt
        }
      });
    }
  };

  // Rastrear si usuario se fue de la pestaña
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addEvent('PAGE_LEFT', {
          reason: 'visibility_change',
          pageNavigation: true,
          timestamp: Date.now()
        });

        // También agregar al estudiante actual si hay sesión activa
        if (currentTestSession) {
          addStudentEvent(currentTestSession.studentId, {
            id: `left-${Date.now()}`,
            type: 'PAGE_LEFT',
            timestamp: Date.now(),
            metadata: {
              reason: 'visibility_change',
              pageNavigation: true
            }
          });
        }
      } else {
        addEvent('PAGE_RETURNED', {
          reason: 'visibility_change',
          timestamp: Date.now()
        });

        // También agregar al estudiante actual si hay sesión activa
        if (currentTestSession) {
          addStudentEvent(currentTestSession.studentId, {
            id: `returned-${Date.now()}`,
            type: 'PAGE_RETURNED',
            timestamp: Date.now(),
            metadata: {
              reason: 'visibility_change'
            }
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [addEvent, addStudentEvent, currentTestSession]);

  return {
    trackClick,
    trackQuestionAnswer,
    trackPageNavigation,
    trackLevelJudgment,
    trackLevelCalibration,
    trackLevelRepeat
  };
}
