import React, { useState } from 'react';
import {
  DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor,
  useDraggable, useDroppable, useSensor, useSensors, closestCenter,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import { motion, LayoutGroup } from 'motion/react';
import { Check, X, RotateCcw, Sparkles, Hourglass, Hand, Gauge } from 'lucide-react';
import { useTutorStore } from '../stores/useTutorStore';
import { LEVEL_SHORT, PROFILE_LABEL } from '../lib/tutorEngine';
import { type OnValidation, attempt } from '../lib/boardValidation';

type Item = { id: number; name: string; year: string; order: number; img: string; credit: string };

// Imágenes locales (public/timeline) de Wikimedia Commons; ver public/timeline/CREDITOS.md.
const ITEMS: Item[] = [
  { id: 1, name: 'Rueda', year: '3300 a.C.', order: 1, img: '/timeline/rueda.jpg', credit: 'Rueda de los pantanos de Liubliana · Wikimedia Commons, CC BY-SA 4.0' },
  { id: 2, name: 'Pirámides', year: '2560 a.C.', order: 2, img: '/timeline/piramides.jpg', credit: 'Pirámide de Keops · Wikimedia Commons, CC BY 2.5' },
  { id: 3, name: 'Brújula', year: '200 a.C.', order: 3, img: '/timeline/brujula.jpg', credit: 'Brújula china, National Maritime Museum · Wikimedia Commons, CC BY-SA 4.0' },
  { id: 4, name: 'Imprenta', year: '1440', order: 4, img: '/timeline/imprenta.jpg', credit: 'Prensa de imprenta · Wikimedia Commons, dominio público' },
  { id: 5, name: 'Telescopio', year: '1608', order: 5, img: '/timeline/telescopio.jpg', credit: 'Telescopio de Galileo, Museo Galileo · Wikimedia Commons, CC BY-SA 4.0' },
  { id: 6, name: 'Teléfono', year: '1876', order: 6, img: '/timeline/telefono.jpg', credit: 'Teléfono de candelero · Wikimedia Commons, dominio público' },
  { id: 7, name: 'Televisión', year: '1926', order: 7, img: '/timeline/television.jpg', credit: 'RCA Victor TRK-12 (1939), Wolfsonian-FIU · Wikimedia Commons, CC0' },
  { id: 8, name: 'Smartphone', year: '2007', order: 8, img: '/timeline/smartphone.jpg', credit: 'Pantalla de smartphone · Wikimedia Commons, CC0' },
];
const N = ITEMS.length;
const byId = (id: number) => ITEMS.find(i => i.id === id)!;

function shuffled(): number[] {
  const a = ITEMS.map(i => i.id);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/**
 * Inserta `id` en la posición `at` de la línea. Si está ocupada, las tarjetas se corren
 * hacia el hueco libre más cercano (primero a la derecha). Devuelve la tarjeta desplazada
 * fuera de la línea si no había hueco.
 */
function insertAt(line: (number | null)[], at: number, id: number): { line: (number | null)[]; bumped: number | null } {
  const next = [...line];
  if (next[at] === null) { next[at] = id; return { line: next, bumped: null }; }
  let gap = next.indexOf(null, at);
  if (gap !== -1) {
    for (let k = gap; k > at; k--) next[k] = next[k - 1];
    next[at] = id;
    return { line: next, bumped: null };
  }
  gap = next.lastIndexOf(null, at);
  if (gap !== -1) {
    for (let k = gap; k < at; k++) next[k] = next[k + 1];
    next[at] = id;
    return { line: next, bumped: null };
  }
  const bumped = next[at];
  next[at] = id;
  return { line: next, bumped };
}

type Verdict = Record<number, boolean>;

// ---------- Tarjeta ----------
function CardFace({ item, verdict, lifted }: { item: Item; verdict?: boolean; lifted?: boolean }) {
  const ring = verdict === true ? 'ring-2 ring-secondary' : verdict === false ? 'ring-2 ring-error' : '';
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest text-left
        ${lifted ? 'shadow-2xl rotate-2 scale-105' : 'shadow-sm'} ${ring}`}
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-surface-container-high">
        <img src={item.img} alt={item.name} title={item.credit} draggable={false} className="h-full w-full object-cover" />
      </div>
      <div className="px-2.5 py-2">
        <div className="text-[13px] font-semibold leading-tight text-on-surface">{item.name}</div>
        <div className="mt-0.5 text-[12px] font-medium tabular-nums text-primary">
          {item.year}
        </div>
      </div>
      {verdict !== undefined && (
        <motion.span
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          className={`absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full shadow
            ${verdict ? 'bg-secondary text-on-secondary' : 'bg-error text-on-error'}`}
        >
          {verdict ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
        </motion.span>
      )}
    </div>
  );
}

function DraggableCard({ id, onTap, verdict, hint }: { id: number; onTap: () => void; verdict?: boolean; hint: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `card-${id}`, data: { id } });
  const item = byId(id);
  return (
    <motion.button
      layoutId={`tl-card-${id}`}
      layout
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      ref={setNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      onClick={onTap}
      aria-label={`${item.name}. ${hint}`}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      animate={verdict === false ? { x: [0, -5, 5, -3, 3, 0] } : undefined}
      className={`block w-full cursor-grab touch-manipulation select-none rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:cursor-grabbing
        ${isDragging ? 'opacity-30' : ''}`}
    >
      <CardFace item={item} verdict={verdict} />
    </motion.button>
  );
}

// ---------- Espacio de la línea ----------
function Slot({ index, children, isNext }: { index: number; children?: React.ReactNode; isNext: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${index}`, data: { index } });
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={setNodeRef}
        className={`relative flex min-h-[148px] w-full items-center justify-center rounded-xl transition-colors duration-150
          ${children ? '' : 'border-2 border-dashed'}
          ${isOver ? 'border-primary bg-primary-container/40' : isNext && !children ? 'border-primary/50 bg-primary-container/15' : 'border-outline-variant bg-surface-container-low/60'}`}
      >
        {children ?? (
          <span className={`text-2xl font-semibold ${isNext ? 'text-primary' : 'text-outline'}`}>{index + 1}</span>
        )}
      </div>
      {/* Estación sobre el eje */}
      <span className={`relative z-10 h-3.5 w-3.5 rounded-full border-2 border-surface ${children ? 'bg-primary' : 'bg-outline'}`} />
    </div>
  );
}

function Tray({ children, empty }: { children: React.ReactNode; empty: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'tray' });
  return (
    <div
      ref={setNodeRef}
      className={`grid min-h-[176px] grid-cols-[repeat(auto-fill,minmax(118px,1fr))] gap-3 rounded-2xl border-2 border-dashed p-3 transition-colors
        ${isOver ? 'border-primary bg-primary-container/30' : 'border-outline-variant bg-surface-container-low'}`}
    >
      {empty ? (
        <div className="col-span-full flex items-center justify-center gap-2 text-sm text-on-surface-variant">
          <Sparkles size={16} /> Todas las tarjetas están en la línea. ¡Revisa el orden y verifica!
        </div>
      ) : children}
    </div>
  );
}

// ---------- Nivel asignado ----------
const PROFILE_HINT: Record<string, string> = {
  over: 'Tiendes a confiar más de lo que aciertas: verifica antes de dar por terminado.',
  sub: 'Aciertas más de lo que crees: confía un poco más en tu razonamiento.',
  cal: 'Tu confianza coincide con tus resultados. ¡Sigue así!',
};

/** Nivel en que el tutor ubica al estudiante (ZDP) y su último perfil de calibración. */
function LevelBanner() {
  const tutor = useTutorStore(s => s.state);
  const zdp = tutor?.zdp?.zdp;
  const profile = tutor?.last_profile ?? null;
  const bias = tutor?.last_bias ?? null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-primary/20 bg-primary-container/40 px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary"><Gauge size={18} /></span>
      {/* basis: en el celular «Este reto» baja de línea en vez de aplastar el texto en una columna */}
      <div className="min-w-0 flex-1 basis-[14rem]">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-on-primary-container/70">Tu nivel según tu calibración</div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-on-primary-container">
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-on-primary">
            {zdp ? (LEVEL_SHORT[zdp] ?? zdp) : 'Básico'}
          </span>
          {profile ? (
            <span>
              Calibración: <b>{PROFILE_LABEL[profile] ?? profile}</b>
              {bias !== null && <span className="text-on-primary-container/70"> (sesgo {bias > 0 ? '+' : ''}{bias.toFixed(2)})</span>}
            </span>
          ) : (
            <span className="text-on-primary-container/80">Aún sin calibración: empiezas en el nivel Básico.</span>
          )}
        </div>
        {profile && PROFILE_HINT[profile] && <div className="mt-0.5 text-xs text-on-primary-container/80">{PROFILE_HINT[profile]}</div>}
      </div>
      <div className="text-xs text-on-primary-container/80">Este reto: <b>Básico · N1</b></div>
    </div>
  );
}

// ---------- Juego ----------
export default function TimelineGame({ onValidation }: { onValidation?: OnValidation } = {}) {
  const [tray, setTray] = useState<number[]>(shuffled);
  const [line, setLine] = useState<(number | null)[]>(() => new Array(N).fill(null));
  const [activeId, setActiveId] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [attempts, setAttempts] = useState(0);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const placed = line.filter(v => v !== null).length;
  const nextFree = line.indexOf(null);
  const correctCount = verdict ? Object.values(verdict).filter(Boolean).length : 0;
  const won = verdict !== null && correctCount === N;

  const commit = (nextLine: (number | null)[], nextTray: number[]) => {
    setLine(nextLine);
    setTray(nextTray);
    setVerdict(null);
  };

  const placeFromTray = (id: number, at: number) => {
    const { line: l, bumped } = insertAt(line, at, id);
    commit(l, [...tray.filter(x => x !== id), ...(bumped !== null ? [bumped] : [])]);
  };

  const tapTrayCard = (id: number) => { if (nextFree !== -1) placeFromTray(id, nextFree); };
  const tapLineCard = (id: number) => commit(line.map(v => (v === id ? null : v)), [...tray, id]);

  const onDragStart = (e: DragStartEvent) => setActiveId((e.active.data.current as { id: number }).id);
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const id = (e.active.data.current as { id: number }).id;
    const over = e.over?.id;
    if (!over) return;
    const from = line.indexOf(id);
    if (over === 'tray') {
      if (from !== -1) tapLineCard(id);
      return;
    }
    const to = (e.over!.data.current as { index: number }).index;
    if (from === -1) { placeFromTray(id, to); return; }
    if (from === to) return;
    // Reordenar dentro de la línea: se saca y se inserta corriendo a las demás.
    const without = line.map(v => (v === id ? null : v));
    const { line: l, bumped } = insertAt(without, to, id);
    commit(l, bumped !== null ? [...tray, bumped] : tray);
  };

  const verify = () => {
    const v: Verdict = {};
    line.forEach((id, i) => { if (id !== null) v[id] = byId(id).order === i + 1; });
    setVerdict(v);
    setAttempts(a => a + 1);
    onValidation?.(Object.values(v).every(Boolean), attempt(line));
  };

  const reset = () => {
    setTray(shuffled());
    setLine(new Array(N).fill(null));
    setVerdict(null);
  };

  return (
    <div className="h-full w-full overflow-auto p-4 font-sans text-on-surface md:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        {/* Encabezado */}
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Hourglass size={14} /> Línea del tiempo
            </div>
            <h2 className="text-xl font-semibold text-on-surface md:text-2xl">Ordena la historia</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-on-surface-variant">
              <Hand size={14} /> Toca una tarjeta para ponerla en la línea, o arrástrala al lugar exacto. Fíjate en el año: del más antiguo al más reciente.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-on-surface-variant">Colocadas</div>
              <div className="text-lg font-semibold tabular-nums">{placed}<span className="text-on-surface-variant">/{N}</span></div>
            </div>
            <div className="h-10 w-10">
              <svg viewBox="0 0 36 36" className="-rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-outline-variant)" strokeWidth="4" />
                <motion.circle
                  cx="18" cy="18" r="15" fill="none" stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 15}
                  animate={{ strokeDashoffset: 2 * Math.PI * 15 * (1 - placed / N) }}
                  transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                />
              </svg>
            </div>
          </div>
        </header>

        <LevelBanner />

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
          <LayoutGroup>
            {/* Línea */}
            <section aria-label="Mi línea del tiempo" className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
              <div className="mb-3 flex justify-between text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                <span>← Más antiguo</span><span>Más reciente →</span>
              </div>
              <div className="overflow-x-auto pb-1">
                <div className="relative grid min-w-[760px] grid-cols-8 gap-3">
                  {/* Eje */}
                  <div className="pointer-events-none absolute bottom-[6px] left-2 right-2 h-[3px] rounded-full bg-gradient-to-r from-tertiary/60 via-primary/60 to-secondary/70" />
                  {line.map((id, i) => (
                    <Slot key={i} index={i} isNext={i === nextFree && activeId === null}>
                      {id !== null && (
                        <DraggableCard id={id} onTap={() => tapLineCard(id)} verdict={verdict?.[id]} hint={`Posición ${i + 1}. Toca para devolverla a la bandeja.`} />
                      )}
                    </Slot>
                  ))}
                </div>
              </div>
            </section>

            {/* Bandeja */}
            <section aria-label="Tarjetas para ordenar">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Tarjetas para ordenar</div>
              <Tray empty={tray.length === 0}>
                {tray.map(id => (
                  <DraggableCard key={id} id={id} onTap={() => tapTrayCard(id)} hint="Toca para colocarla en el siguiente espacio libre." />
                ))}
              </Tray>
            </section>
          </LayoutGroup>

          <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)' }}>
            {activeId !== null && <div className="w-[130px]"><CardFace item={byId(activeId)} lifted /></div>}
          </DragOverlay>
        </DndContext>

        {/* Acciones */}
        <div className="flex flex-wrap items-center gap-3">
          <motion.button
            type="button"
            onClick={verify}
            disabled={placed < N}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check size={16} /> Verificar
          </motion.button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <RotateCcw size={15} /> Reiniciar
          </button>
          {placed < N && <span className="text-sm text-on-surface-variant">Coloca las {N} tarjetas para verificar.</span>}
          {attempts > 0 && <span className="ml-auto text-xs text-on-surface-variant">Intentos: {attempts}</span>}
        </div>

        {verdict && (
            <motion.div
              key={won ? 'win' : `partial-${attempts}`}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              role="status"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium
                ${won ? 'bg-secondary-container text-on-secondary-container' : 'bg-warning-container text-on-warning-container'}`}
            >
              {won ? <Sparkles size={18} /> : <Hourglass size={18} />}
              {won
                ? '¡Perfecto! Ordenaste los 8 inventos de la humanidad.'
                : `Tienes ${correctCount} de ${N} en su lugar. Mueve las marcadas en rojo y vuelve a verificar.`}
            </motion.div>
        )}
      </div>
    </div>
  );
}
