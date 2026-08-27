import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import './Tour.css';

interface JolQuestionInfo {
  id: string;
  pregunta: string;
  escala: string;
}

interface ChallengeSetupTourProps {
  isOpen: boolean;
  onClose: () => void;
  showJolPhase: boolean;
  activeJolStep: number;
  totalJols: number;
  allJolsDone: boolean;
  challengeTitle?: string;
  challengeLevel?: string;
  challengeSubLevel?: string;
  challengeComponent?: string;
  estimatedTime?: string;
  queVasAprender?: string;
  tareaConcreta?: string;
  currentJolQuestion?: JolQuestionInfo;
  isJolAnswered?: boolean;
}

const detectScaleType = (escalaStr?: string): 'slider' | 'percent' | 'number' | 'options' => {
  if (!escalaStr) return 'slider';
  const lower = escalaStr.toLowerCase();
  if (lower.includes('options:') || lower.includes('|') || lower.includes('·')) return 'options';
  if (lower.includes('percent') || lower.includes('%')) return 'percent';
  if (lower.includes('number') || lower.includes('min') || lower.includes('intentos') || lower.includes('numérico')) return 'number';
  return 'slider';
};

export function ChallengeSetupTour({
  isOpen,
  onClose,
  showJolPhase,
  activeJolStep,
  totalJols,
  allJolsDone,
  challengeTitle = 'Reto',
  challengeLevel = 'Básico',
  challengeSubLevel = 'N1',
  challengeComponent = '',
  estimatedTime = '15',
  queVasAprender,
  tareaConcreta,
  currentJolQuestion,
  isJolAnswered = false,
}: ChallengeSetupTourProps) {
  let targetId = 'tour-briefing';
  let badgeText = '';
  let titleText = '';
  let iconName = 'ti-school';
  let actionText = '';
  let buttonActionLabel = 'Siguiente';

  if (!showJolPhase) {
    targetId = 'tour-begin-jol';
    badgeText = 'Guía · el reto';
    titleText = `«${challengeTitle}»`;
    iconName = 'ti-dice-5';
    actionText = 'Lee la información del reto y pulsa «Comenzar preguntas».';
    buttonActionLabel = 'Ir a las preguntas';
  } else if (!allJolsDone) {
    targetId = 'tour-jol-card';
    const currentNum = activeJolStep + 1;
    const maxNum = totalJols || 5;
    badgeText = `Pregunta ${currentNum} de ${maxNum}`;
    const scaleType = detectScaleType(currentJolQuestion?.escala);
    titleText = `Pregunta ${currentNum} de ${maxNum}`;
    iconName = 'ti-brain';

    if (scaleType === 'slider' || scaleType === 'percent') {
      actionText = 'Elige el número (o el porcentaje) que refleje tu confianza y pulsa «Continuar».';
    } else if (scaleType === 'number') {
      actionText = 'Escribe la cantidad estimada, o pulsa un valor sugerido, y luego «Continuar».';
    } else {
      actionText = 'Haz clic en la opción que mejor te describa y pulsa «Continuar».';
    }
    buttonActionLabel = currentNum < maxNum ? 'Siguiente pregunta' : 'Terminar preguntas';
  } else {
    targetId = 'tour-start-challenge';
    badgeText = 'Preguntas completadas';
    titleText = 'Estrategia y reto';
    iconName = 'ti-arrow-right';
    actionText = 'Revisa tu estrategia de apoyo y pulsa «Empezar el reto».';
    buttonActionLabel = 'Empezar el reto';
  }

  useEffect(() => {
    if (!isOpen) return;
    document.querySelectorAll('.mp-tour-highlight').forEach(el => el.classList.remove('mp-tour-highlight'));
    const timer = setTimeout(() => {
      const el = document.getElementById(targetId) || document.getElementById('tour-briefing');
      if (el) {
        el.classList.add('mp-tour-highlight');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
    return () => {
      clearTimeout(timer);
      document.querySelectorAll('.mp-tour-highlight').forEach(e => e.classList.remove('mp-tour-highlight'));
    };
  }, [isOpen, targetId, showJolPhase, activeJolStep, allJolsDone]);

  if (!isOpen) return null;

  const handlePrimaryButtonClick = () => {
    if (!showJolPhase) {
      const btn = document.getElementById('tour-begin-jol')?.querySelector('button') as HTMLButtonElement | null;
      if (btn) btn.click();
      else document.getElementById('tour-begin-jol')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (!allJolsDone) {
      const continueBtn = document.getElementById('tour-jol-continue') as HTMLButtonElement | null;
      if (continueBtn && !continueBtn.disabled) continueBtn.click();
      else document.getElementById('tour-jol-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      const btn = document.getElementById('tour-start-challenge') as HTMLButtonElement | null;
      if (btn) btn.click();
      onClose();
    }
  };

  const waitingForAnswer = showJolPhase && !allJolsDone && !isJolAnswered;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`tour-dialog-${showJolPhase}-${activeJolStep}-${allJolsDone}-${currentJolQuestion?.id || ''}`}
        initial={{ opacity: 0, y: -12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="mp-tour-panel"
      >
        <div style={{ marginBottom: '12px' }}>
          <span className="mp-tour-badge">{badgeText}</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div className="mp-tour-icon">
            <i className={`ti ${iconName}`} style={{ fontSize: 18, color: 'var(--tour-hl)' }} />
          </div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{titleText}</h4>
        </div>

        {!showJolPhase && (
          <div className="mp-tour-note" style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Nivel {challengeLevel} ({challengeSubLevel})</span>
              {challengeComponent && <span>· {challengeComponent}</span>}
              <span>· ~{estimatedTime} min</span>
            </div>
            {queVasAprender && <div><strong>Aprenderás:</strong> {queVasAprender}</div>}
            {tareaConcreta && <div><strong>Meta:</strong> {tareaConcreta}</div>}
          </div>
        )}

        <div className={`mp-tour-note ${waitingForAnswer ? 'mp-tour-note--warn' : ''}`} style={{ marginBottom: '14px' }}>
          {waitingForAnswer
            ? 'Marca una opción o un número en la tarjeta. El botón «Continuar» se activará solo.'
            : actionText}
        </div>

        <button
          onClick={handlePrimaryButtonClick}
          disabled={waitingForAnswer}
          className="mp-tour-btn"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {buttonActionLabel}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
