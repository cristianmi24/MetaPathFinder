export interface HerramientaEstrategia {
  id: string;
  nombre: string;
  descripcion: string;
  icon: string;
}

export interface Estrategia {
  id: string; color: string; iconBg: string; icon: string;
  badge: string; badgeBg: string; badgeColor: string;
  nombre: string; teoria: string; desc: string;
  pasos: string[]; pasoColor: string; pasoBg: string;
  teoriaDetail: string;
  herramientas: HerramientaEstrategia[];
}

export interface PerfilData {
  label: string; chipStyle: React.CSSProperties; chipIcon: string;
  dim1: { w: string; color: string; score: string };
  dim2: { w: string; color: string; score: string };
  estrategias: Estrategia[];
}

/**
 * Estrategias metacognitivas activas. Se eligieron 4 que cubren el ciclo de
 * autorregulación (Zimmerman): planear metas → monitorear la confianza →
 * regular el tiempo → evaluar los errores. Todas se usan tocando o
 * seleccionando, sin escribir. Se conservan los ids para no romper los datos guardados.
 */
export const nuevasEstrategias: Estrategia[] = [
  {
    id: 'est7', color: '#a371f7', iconBg: 'rgba(163,113,247,0.1)', icon: 'ti-stairs',
    badge: 'Planificación', badgeBg: 'rgba(163,113,247,0.1)', badgeColor: '#a371f7',
    nombre: 'Metas paso a paso',
    teoria: 'Planear y ver el avance en metas pequeñas',
    desc: 'Divide el reto en metas cortas, elige por cuál empezar y márcalas al cumplirlas.',
    pasos: ['Mira las metas del reto', 'Elige por cuál empiezas', 'Márcala cuando la cumplas'],
    pasoColor: '#a371f7', pasoBg: 'rgba(163,113,247,0.08)',
    teoriaDetail: 'Ver el reto en metas pequeñas reduce la carga y mantiene la motivación. El sistema registra cuántas metas cumples y en qué orden.',
    herramientas: [
      { id: 'h1', nombre: 'Mis metas', descripcion: 'Toca una meta para elegirla como la siguiente y márcala al cumplirla.', icon: 'ti-checkbox' },
      { id: 'h2', nombre: 'Barra de avance', descripcion: 'Muestra qué parte del reto ya lograste.', icon: 'ti-progress' },
    ],
  },
  {
    id: 'est2', color: '#388bfd', iconBg: 'rgba(56,139,253,0.1)', icon: 'ti-temperature',
    badge: 'Monitoreo', badgeBg: 'rgba(56,139,253,0.1)', badgeColor: '#388bfd',
    nombre: 'Termómetro de confianza',
    teoria: 'Revisar qué tan seguro/a te sientes mientras trabajas',
    desc: 'Cada pocos minutos marcas del 1 al 10 qué tan seguro/a te sientes y lo comparas con el inicio.',
    pasos: ['Cuando te avise, marca tu confianza', 'Compárala con la del inicio', 'Si baja, pide una pista'],
    pasoColor: '#388bfd', pasoBg: 'rgba(56,139,253,0.08)',
    teoriaDetail: 'Revisar la propia confianza durante la tarea mejora la calibración: aprendes cuándo confiar en lo que sabes. El sistema registra cada marca.',
    herramientas: [
      { id: 'h1', nombre: 'Marcar mi confianza', descripcion: 'Cada 3 minutos te avisa; tocas un número del 1 al 10.', icon: 'ti-hand-click' },
      { id: 'h2', nombre: 'Mi termómetro', descripcion: 'Muestra cómo cambió tu confianza desde el inicio.', icon: 'ti-chart-line' },
    ],
  },
  {
    id: 'est4', color: '#2da77a', iconBg: 'rgba(45,167,122,0.1)', icon: 'ti-clock',
    badge: 'Regulación del tiempo', badgeBg: 'rgba(45,167,122,0.1)', badgeColor: '#2da77a',
    nombre: 'Reloj del reto',
    teoria: 'Comparar el tiempo real con el que calculaste',
    desc: 'Ves tu tiempo frente a los minutos que estimaste y, a mitad de camino, eliges cómo vas.',
    pasos: ['Mira el reloj de vez en cuando', 'A mitad del tiempo, elige cómo vas', 'Si te atascas, pide ayuda'],
    pasoColor: '#2da77a', pasoBg: 'rgba(45,167,122,0.08)',
    teoriaDetail: 'Contrastar el tiempo estimado con el real entrena la planificación. El sistema compara tu estimación con lo que realmente tardas.',
    herramientas: [
      { id: 'h1', nombre: 'Reloj vs. mi cálculo', descripcion: 'Una barra compara el tiempo real con los minutos que estimaste.', icon: 'ti-hourglass' },
      { id: 'h2', nombre: '¿Cómo voy?', descripcion: 'A mitad de tiempo eliges: voy bien, necesito más tiempo o estoy atascado/a.', icon: 'ti-traffic-lights' },
    ],
  },
  {
    id: 'est8', color: '#e8833a', iconBg: 'rgba(232,131,58,0.1)', icon: 'ti-bulb',
    badge: 'Evaluación', badgeBg: 'rgba(232,131,58,0.1)', badgeColor: '#e8833a',
    nombre: '¿Qué me dice el error?',
    teoria: 'Usar cada error como una pista',
    desc: 'Después de un intento fallido eliges por qué pasó y qué harás ahora.',
    pasos: ['Si fallas, elige por qué pasó', 'Elige qué harás distinto', 'Vuelve a intentarlo'],
    pasoColor: '#e8833a', pasoBg: 'rgba(232,131,58,0.08)',
    teoriaDetail: 'Atribuir el error a algo que puedes cambiar (no a "soy malo/a") sostiene la motivación y orienta el siguiente intento. El sistema registra tus elecciones.',
    herramientas: [
      { id: 'h1', nombre: '¿Por qué pasó?', descripcion: 'Eliges la causa del error entre opciones sencillas.', icon: 'ti-help-circle' },
      { id: 'h2', nombre: 'Mi siguiente paso', descripcion: 'Eliges qué harás distinto en el próximo intento.', icon: 'ti-arrow-forward-up' },
    ],
  },
];

/** Estrategias retiradas → estrategia activa equivalente (para sesiones guardadas antes del cambio). */
const ALIAS_ESTRATEGIAS: Record<string, string> = { est1: 'est7', est3: 'est8', est5: 'est2', est6: 'est7' };

/** Nombres de las estrategias retiradas, para mostrar el historial en el panel de administración. */
export const NOMBRES_ESTRATEGIAS_RETIRADAS: Record<string, string> = {
  est1: 'Descomposición previa del problema',
  est3: 'Verificación de supuestos',
  est5: 'Mapeo de lo que no sé',
  est6: 'Registro de evidencias de competencia',
};

/** Busca una estrategia por id; las retiradas se resuelven a su equivalente activa. */
export function getEstrategia(id: string | null | undefined): Estrategia | null {
  if (!id) return null;
  const resolved = ALIAS_ESTRATEGIAS[id] ?? id;
  return nuevasEstrategias.find((e) => e.id === resolved) ?? null;
}

export const perfilesData: Record<string, PerfilData> = {
  over: {
    label: 'Sobreconfianza crítica',
    chipStyle: { background:'rgba(255,123,114,0.1)', border:'0.5px solid rgba(255,123,114,0.35)', color:'#ff7b72' },
    chipIcon: 'ti-alert-triangle',
    dim1: { w: '30%', color: '#ff7b72', score: 'Nivel bajo · principal área de intervención' },
    dim2: { w: '25%', color: '#f2cc60', score: 'Nivel muy bajo · ensayo-error sin monitoreo' },
    estrategias: nuevasEstrategias
  },
  sub: {
    label: 'Subestimación · baja autoeficacia',
    chipStyle: { background:'rgba(56,139,253,0.1)', border:'0.5px solid rgba(56,139,253,0.35)', color:'#388bfd' },
    chipIcon: 'ti-trending-down',
    dim1: { w: '65%', color: '#388bfd', score: 'Nivel medio · conoce pero no se reconoce' },
    dim2: { w: '45%', color: '#f2cc60', score: 'Nivel medio-bajo · monitoreo ansioso, no regulado' },
    estrategias: nuevasEstrategias
  },
  cal: {
    label: 'Perfil calibrado · alta metacognición',
    chipStyle: { background:'rgba(93,202,165,0.1)', border:'0.5px solid rgba(93,202,165,0.35)', color:'#5dcaa5' },
    chipIcon: 'ti-circle-check',
    dim1: { w: '82%', color: '#5dcaa5', score: 'Nivel alto · conciencia metacognitiva sólida' },
    dim2: { w: '85%', color: '#5dcaa5', score: 'Nivel alto · monitoreo y regulación activos' },
    estrategias: nuevasEstrategias
  }
};
