import { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Eye, BookOpenText } from 'lucide-react';
import { STYLE_ITEMS, scoreLearningStyle } from '../../lib/tutorEngine';
import { useTutorStore } from '../../stores/useTutorStore';
import { api } from '../../services/api';
import './tutor.css';

interface Props {
  open: boolean;
  userId: string | null;
  onClose: () => void;
}

/** Cuestionario abreviado del Índice de Estilos de Aprendizaje (Felder-Soloman): 8 ítems, 2 dimensiones. */
export function LearningStyleQuiz({ open, userId, onClose }: Props) {
  const [answers, setAnswers] = useState<Record<string, 'a' | 'b'>>({});
  const [saving, setSaving] = useState(false);
  const { setLearningStyle, setDismissedStyleQuiz } = useTutorStore();
  if (!open) return null;
  const complete = STYLE_ITEMS.every((i) => answers[i.id]);
  const idx = STYLE_ITEMS.findIndex((i) => !answers[i.id]);
  const current = idx === -1 ? null : STYLE_ITEMS[idx];
  const answered = STYLE_ITEMS.length - (idx === -1 ? 0 : STYLE_ITEMS.length - idx);

  const finish = async () => {
    const result = scoreLearningStyle(answers);
    const ls = { ...result, answers };
    setLearningStyle(ls);
    setSaving(true);
    try {
      if (userId) await api.saveLearningStyle({ user_id: userId, visual_verbal: result.visual_verbal, global_sequential: result.global_sequential, answers });
    } catch (err) {
      console.warn('No se pudo guardar el estilo de aprendizaje', err);
    } finally {
      setSaving(false);
      onClose();
    }
  };

  return (
    <div className="tut-dim" role="dialog" aria-modal="true" aria-label="Cómo aprendes mejor">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="tut-modal" style={{ maxWidth: 560 }}>
        <span className="tut-chip accent"><Compass size={11} /> Mi perfil de aprendizaje · {Math.min(answered, STYLE_ITEMS.length)}/{STYLE_ITEMS.length}</span>
        {!complete && current ? (
          <>
            <h3>{current.question}</h3>
            <p>No hay respuestas correctas: el tutor usará esto para presentarte los retos de la forma que mejor te sirva.</p>
            <div className="tut-options">
              <button type="button" className="tut-option" onClick={() => setAnswers((a) => ({ ...a, [current.id]: 'a' }))}>
                {current.dimension === 'vv' ? <Eye size={18} style={{ color: 'var(--accent)' }} /> : <Compass size={18} style={{ color: 'var(--accent)' }} />}
                <span><b>{current.a}</b></span>
              </button>
              <button type="button" className="tut-option" onClick={() => setAnswers((a) => ({ ...a, [current.id]: 'b' }))}>
                <BookOpenText size={18} style={{ color: 'var(--ok)' }} />
                <span><b>{current.b}</b></span>
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
              <button type="button" className="tut-btn ghost" onClick={() => { setDismissedStyleQuiz(true); onClose(); }}>Omitir por ahora</button>
              {idx > 0 && <button type="button" className="tut-btn ghost" onClick={() => setAnswers((a) => { const n = { ...a }; delete n[STYLE_ITEMS[idx - 1].id]; return n; })}>Atrás</button>}
            </div>
          </>
        ) : (
          <>
            <h3>Tu estilo: {scoreLearningStyle(answers).label}</h3>
            <p>
              {scoreLearningStyle(answers).visual_verbal >= 0
                ? 'Verás los retos primero como diagrama de flujo (puedes cambiar a texto cuando quieras).'
                : 'Verás los retos primero como explicación paso a paso (puedes cambiar a diagrama cuando quieras).'}{' '}
              {scoreLearningStyle(answers).global_sequential >= 0
                ? 'Tu mapa de retos se abre con pestañas para saltar entre componentes.'
                : 'Tu mapa de retos te guía con «Siguiente reto»; la navegación libre se desbloquea cuando domines un nivel.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="button" className="tut-btn" disabled={saving} onClick={finish}>{saving ? 'Guardando…' : 'Guardar mi perfil'}</button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
