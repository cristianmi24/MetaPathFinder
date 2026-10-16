import { CheckCircle2, Clock3, History } from 'lucide-react';
import { dynamicChallengeBank } from '../../data/dynamicChallengeBank';
import { LEVEL_SHORT } from '../../lib/tutorEngine';
import { useTutorStore } from '../../stores/useTutorStore';

/**
 * «Cómo me fue en cada reto»: historial guardado en el servidor (estado del tutor), no en el
 * navegador, así el estudiante lo ve en cualquier dispositivo. Últimos 20 retos cerrados.
 */
export function ChallengeHistory() {
  const history = useTutorStore((s) => s.state?.history ?? []);
  const rows = [...history].reverse();

  const calibration = (bias: number | null) => {
    if (bias === null || bias === undefined) return null;
    if (Math.abs(bias) <= 1.5) return { text: 'Tu confianza coincidió con tu resultado', tone: 'text-secondary' };
    return bias > 0
      ? { text: 'Confiabas más de lo que salió', tone: 'text-warning' }
      : { text: 'Te salió mejor de lo que creías', tone: 'text-primary' };
  };

  return (
    <section className="bento-card p-5" aria-labelledby="historial-titulo">
      <h2 id="historial-titulo" className="mb-1 flex items-center gap-2 text-lg font-semibold text-on-surface">
        <History className="h-5 w-5 text-primary" aria-hidden="true" /> Cómo me fue en cada reto
      </h2>
      <p className="mb-4 text-sm text-on-surface-variant">Se guarda en tu perfil cada vez que terminas un reto y escribes tu reflexión.</p>
      {rows.length === 0 ? (
        <p className="rounded-xl bg-surface-container p-4 text-sm text-on-surface-variant">Aún no has terminado ningún reto. Cuando cierres el primero, aparecerá aquí.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((h, i) => {
            const bank = dynamicChallengeBank.find((c) => c.id === h.challenge_id);
            const cal = calibration(h.bias);
            return (
              <li key={`${h.session_id}-${i}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${h.passed ? 'bg-secondary-container text-on-secondary-container' : 'bg-warning-container text-on-warning-container'}`}>
                  {h.passed ? <CheckCircle2 className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-on-surface">{bank?.titulo ?? h.challenge_id}</div>
                  <div className="text-xs text-on-surface-variant">
                    {h.challenge_id}{h.at ? ` · ${new Date(h.at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}` : ''}
                    {typeof h.attempts === 'number' ? ` · ${h.attempts} intento${h.attempts === 1 ? '' : 's'}` : ''}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-semibold text-on-surface">{h.passed ? 'Logrado' : 'En proceso'}{typeof h.score === 'number' ? ` · ${Math.round(h.score)}/100` : ''}</div>
                  {cal && <div className={`text-xs ${cal.tone}`}>{cal.text}</div>}
                  <div className="text-xs text-on-surface-variant">Autorregulación: {LEVEL_SHORT[h.level] ?? h.level}</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
