import { Layers } from 'lucide-react';
import { ProgressionMap } from '../components/tutor/ProgressionMap';

/** Mapa de progresión de la clase (docentes): cada estudiante ubicado en su ZDP metacognitiva y técnica. */
export function Progression() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl flex items-center gap-2"><Layers className="w-7 h-7 text-primary" /> Mapa de progresión</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Modelo de Griffin: la clase agrupada por zona de desarrollo próximo, con los criterios B1–A4 y el escalón técnico por componente. Las decisiones del tutor son bayesianas y explicables.</p>
      </header>
      <section className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-sm">
        <ProgressionMap />
      </section>
    </div>
  );
}
