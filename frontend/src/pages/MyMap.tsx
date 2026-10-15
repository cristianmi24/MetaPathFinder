import { useEffect, useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { ChallengeMap } from '../components/tutor/ChallengeMap';
import { LearnerProfileCard } from '../components/tutor/LearnerProfileCard';
import { LearningStyleQuiz } from '../components/tutor/LearningStyleQuiz';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useTutorStore } from '../stores/useTutorStore';
import { api } from '../services/api';

/** «Mi mapa de retos» + «Mi perfil de aprendizaje» (Módulo del dominio y Módulo del estudiante en la UI). */
export function MyMap() {
  const dbUserId = useCognitiveStore((s) => s.dbUserId);
  const { setState, setDomain, domain } = useTutorStore();
  const [quiz, setQuiz] = useState(false);

  useEffect(() => {
    if (dbUserId) api.getTutorState(dbUserId).then(setState).catch(() => {});
    if (!domain) api.getTutorDomain().then(setDomain).catch(() => {});
  }, [dbUserId]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-on-surface flex items-center gap-2"><MapIcon className="w-7 h-7 text-primary" /> Mi mapa de retos</h1>
        <p className="ui-sans text-on-surface-variant mt-1">Cuatro componentes de Tecnología e Informática, nueve escalones cada uno. El tutor te ubica en tu zona de desarrollo próximo y tú decides el camino.</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="bento-card p-5"><ChallengeMap /></div>
        <LearnerProfileCard onEditStyle={() => setQuiz(true)} />
      </div>
      <LearningStyleQuiz open={quiz} userId={dbUserId} onClose={() => setQuiz(false)} />
    </div>
  );
}
