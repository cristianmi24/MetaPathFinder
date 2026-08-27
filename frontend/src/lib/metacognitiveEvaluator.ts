// metacognitiveEvaluator.ts - Motor analítico de autorregulación e intervenciones dinámicas
// Basado en marcos de Pintrich (2002), Flavell (1979) y Nelson & Narens (1990)

export interface ReflectionAnalysis {
  wordCount: number;
  uniqueWordRatio: number;
  metacognitiveKeywordsFound: string[];
  score: number; // 0 - 100
  level: 'insuficiente' | 'basica' | 'buena' | 'profunda';
  feedback: string;
  isValid: boolean;
}

export interface PrescribedIntervention {
  id: string;
  iconType: 'warn' | 'info' | 'act' | 'success';
  icon: string;
  titulo: string;
  descripcion: string;
  tiempoEstimado: string;
  tipoAccion: string;
}

// Diccionario de categorías metacognitivas (Atribución interna, Planificación, Monitoreo y Evaluación)
const METACOGNITIVE_LEXICON = [
  'tiempo', 'tiempo estimado', 'confianza', 'seguridad', 'creí', 'pensé', 'asumí', 'supuse',
  'error', 'errores', 'fallé', 'confusión', 'dificultad', 'complejo', 'bloqueo',
  'estrategia', 'plan', 'planificación', 'paso a paso', 'orden', 'método',
  'código', 'lógica', 'concepto', 'sintaxis', 'variable', 'función', 'algoritmo',
  'revisar', 'corregir', 'verificar', 'aprender', 'entender', 'comprender', 'atención',
  'pistas', 'andamiaje', 'ayuda', 'práctica', 'conocimiento', 'experiencia'
];

/**
 * Evalúa semánticamente la calidad de la reflexión de autorregulación del estudiante.
 */
export function evaluateMetacognitiveReflection(text: string): ReflectionAnalysis {
  const words = text.trim().toLowerCase().split(/\s+/).filter(w => w.length > 1);
  const wordCount = words.length;

  if (wordCount === 0) {
    return {
      wordCount: 0,
      uniqueWordRatio: 0,
      metacognitiveKeywordsFound: [],
      score: 0,
      level: 'insuficiente',
      feedback: 'Escribe al menos 20 palabras explicando la causa de la diferencia entre tu confianza y tu desempeño.',
      isValid: false
    };
  }

  // Medir diversidad léxica (evitar "hola hola hola" o spam de letras)
  const uniqueWords = new Set(words);
  const uniqueWordRatio = uniqueWords.size / wordCount;

  // Buscar términos de vocabulario metacognitivo
  const lowerText = text.toLowerCase();
  const keywordsFound = METACOGNITIVE_LEXICON.filter(kw => lowerText.includes(kw));

  // Detectar repeticiones sospechosas
  const isSpammy = uniqueWordRatio < 0.55 && wordCount >= 10;

  let score = 0;
  // Componente 1: Longitud (hasta 40 pts)
  score += Math.min(40, (wordCount / 20) * 40);

  // Componente 2: Diversidad léxica (hasta 30 pts)
  score += Math.min(30, uniqueWordRatio * 30);

  // Componente 3: Vocabulario metacognitivo y causal (hasta 30 pts)
  score += Math.min(30, keywordsFound.length * 10);

  if (isSpammy) {
    score = Math.min(score, 30);
  }

  score = Math.round(Math.max(0, Math.min(100, score)));

  let level: 'insuficiente' | 'basica' | 'buena' | 'profunda' = 'insuficiente';
  let feedback = '';

  if (wordCount < 20) {
    level = 'insuficiente';
    feedback = `Faltan ${20 - wordCount} palabras para alcanzar el umbral mínimo de reflexión.`;
  } else if (isSpammy) {
    level = 'insuficiente';
    feedback = 'Detectamos muchas palabras repetidas. Elabora tu respuesta con más detalle explicativo.';
  } else if (keywordsFound.length === 0) {
    level = 'basica';
    feedback = 'Buen intento, pero intenta mencionar qué factores técnicos, de tiempo o de confianza influyeron.';
  } else if (keywordsFound.length <= 2 || wordCount < 35) {
    level = 'buena';
    feedback = '¡Buena reflexión! Has identificado factores concretos en tu proceso de aprendizaje.';
  } else {
    level = 'profunda';
    feedback = 'Excelente autorregulación. Tu análisis demuestra un alto nivel de autoconocimiento cognitivo.';
  }

  const isValid = wordCount >= 20 && !isSpammy && (keywordsFound.length >= 1 || uniqueWordRatio >= 0.7);

  return {
    wordCount,
    uniqueWordRatio,
    metacognitiveKeywordsFound: keywordsFound,
    score,
    level,
    feedback,
    isValid
  };
}

/**
 * Prescribe dinámicamente intervenciones pedagógicas adaptadas al perfil y métricas reales.
 */
export function getPrescribedInterventions(
  profileType: string,
  componente: string = 'General',
  metrics: any = {}
): PrescribedIntervention[] {
  const interventions: PrescribedIntervention[] = [];
  const runs = metrics.metricas_tecnicas?.runs || 0;
  const hints = metrics.metricas_tecnicas?.hints || 0;
  const totalTime = metrics.biometricas?.total_time || 0;

  // Intervención 1: Basada en el perfil de calibración metacognitiva
  if (profileType === 'overconf') {
    interventions.push({
      id: 'interv-overconf',
      iconType: 'warn',
      icon: 'ti-scale',
      titulo: 'Protocolo de Calibración: Descomposición de Supuestos',
      descripcion: 'Detectamos sobrestimación inicial. Antes de tu próximo intento, escribe 3 hipótesis de prueba y verifica los criterios de aceptación antes de ejecutar.',
      tiempoEstimado: '5 min',
      tipoAccion: 'Autorregulación preventiva'
    });
  } else if (profileType === 'underconf') {
    interventions.push({
      id: 'interv-underconf',
      iconType: 'act',
      icon: 'ti-bolt',
      titulo: 'Refuerzo de Autoeficacia y Decisión Ágil',
      descripcion: 'Tu capacidad real superó tu expectativa. Puedes confiar en tus conocimientos previos y reducir el tiempo de verificación preliminar.',
      tiempoEstimado: '3 min',
      tipoAccion: 'Confianza y fluidez'
    });
  } else if (profileType === 'zero_attempt') {
    interventions.push({
      id: 'interv-zero',
      iconType: 'info',
      icon: 'ti-book-2',
      titulo: 'Andamiaje Conceptual Inicial (ZDP)',
      descripcion: `Te asignamos la lección introductoria de "${componente}" para afianzar los conceptos base antes de reintentar el reto práctico.`,
      tiempoEstimado: '8 min',
      tipoAccion: 'Nivelación conceptual'
    });
  } else {
    interventions.push({
      id: 'interv-calibrated',
      iconType: 'success',
      icon: 'ti-target-arrow',
      titulo: 'Reto de Optimización y Transferencia',
      descripcion: 'Tu calibración es óptima. En el siguiente nivel, intenta resolver la actividad optimizando el uso de pistas y la velocidad de entrega.',
      tiempoEstimado: '4 min',
      tipoAccion: 'Consolidación'
    });
  }

  // Intervención 2: Basada en métricas de proceso (errores / latencia / pistas)
  if (runs >= 3) {
    interventions.push({
      id: 'interv-debug',
      iconType: 'warn',
      icon: 'ti-bug',
      titulo: 'Estrategia de Debugging Sistemático',
      descripcion: `Registraste ${runs} intentos. Te recomendamos leer los mensajes de error línea por línea en vez de reintentar por ensayo y error.`,
      tiempoEstimado: '6 min',
      tipoAccion: 'Diagnóstico técnico'
    });
  } else if (hints >= 2) {
    interventions.push({
      id: 'interv-hints',
      iconType: 'info',
      icon: 'ti-bulb',
      titulo: 'Guía de Síntesis y Organización Mental',
      descripcion: 'Hiciste buen uso de las pistas. Anota en un cuaderno digital los pasos clave descubiertos para no depender de andamiajes externos.',
      tiempoEstimado: '5 min',
      tipoAccion: 'Independencia'
    });
  } else if (totalTime > 300) {
    interventions.push({
      id: 'interv-time',
      iconType: 'info',
      icon: 'ti-clock-pause',
      titulo: 'Técnica de Fragmentación Temporal',
      descripcion: 'Identificamos tiempos de resolución extensos. Divide el problema en bloques de 2 minutos para mantener la concentración activa.',
      tiempoEstimado: '4 min',
      tipoAccion: 'Gestión del tiempo'
    });
  } else {
    interventions.push({
      id: 'interv-general',
      iconType: 'act',
      icon: 'ti-sparkles',
      titulo: 'Monitoreo de Estrategia Activa',
      descripcion: 'Aplica la estrategia seleccionada prestando atención a tus momentos de duda antes de solicitar verificación.',
      tiempoEstimado: '3 min',
      tipoAccion: 'Metacognición continua'
    });
  }

  return interventions;
}
