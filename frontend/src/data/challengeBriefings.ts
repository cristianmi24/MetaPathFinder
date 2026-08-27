import type { ChallengeProfile } from './challengeProfiles';
import { getChallengeProfile } from './challengeProfiles';
import { getChallengeInstructions } from './challengeInstructions';

export interface ChallengeBriefing {
  saludo: string;
  contexto: string;
  puente: string;
  queVasAprender: string;
  queVasHacer: string;
  tareaConcreta: string;
  pasosDetallados: string[];
  recuerda: string[];
  tiempoSugerido?: string;
  /** Texto suave para sidebar / vista resumida */
  resumenSuave: string;
}

function softenPaso(paso: string, profile: ChallengeProfile, index: number, total: number): string {
  return paso.replace(/^[📌▸✅]\s*/, '').trim();
}

function buildSaludo(profile: ChallengeProfile): string {
  return `¡Hola! Hoy trabajarás en «${profile.tituloCorto}».`;
}

function buildContexto(profile: ChallengeProfile): string {
  switch (profile.tipo) {
    case 'escribir':
      return `Organizarás tus ideas por escrito sobre ${profile.tema} de forma reflexiva y sincera.`;
    case 'lectura':
      return `Leerás atentamente sobre ${profile.tema} para analizar evidencias y responder con criterio.`;
    case 'icfes':
      return `Ejercitarás la lectura crítica sobre ${profile.tema} evaluando argumentos y opciones.`;
    case 'ordenar':
      return `Organizarás la secuencia lógica sobre ${profile.tema} relacionando cada paso en su orden correcto.`;
    case 'clasificar':
      return `Clasificarás elementos clave de ${profile.tema} según su función o categoría.`;
    case 'emparejar':
      return `Conectarás conceptos y herramientas tecnológicas en ${profile.tema}.`;
    case 'codigo':
      return `Construirás o completarás la lógica de programación paso a paso para ${profile.tema}.`;
    case 'hardware':
      return `Simularás el comportamiento de sensores y circuitos para ${profile.tema}.`;
    case 'multifase':
      return `Desarrollarás un proyecto por etapas interconectadas sobre ${profile.tema}.`;
    default:
      return `Explorarás ${profile.tema} enfocándote en el proceso de resolución.`;
  }
}

function buildPuente(profile: ChallengeProfile): string {
  switch (profile.tipo) {
    case 'escribir':
      return `Escribirás tu respuesta directamente en el editor interactivo.`;
    case 'lectura':
    case 'icfes':
      return `Revisarás la información y responderás las preguntas conceptuales.`;
    case 'ordenar':
    case 'clasificar':
    case 'emparejar':
      return `Arrastrarás y organizarás las tarjetas en el área de trabajo.`;
    case 'codigo':
    case 'hardware':
      return `Completarás los bloques o código y ejecutarás la verificación.`;
    case 'multifase':
      return `Completarás cada etapa para desbloquear la siguiente.`;
    default:
      return `Interactuarás con los elementos en pantalla para resolver el reto.`;
  }
}

function buildQueVasAprender(profile: ChallengeProfile): string {
  const porTipo: Partial<Record<ChallengeProfile['tipo'], string>> = {
    escribir: `Reflexión estructurada sobre ${profile.tema}.`,
    lectura: `Comprensión lectora basada en evidencia sobre ${profile.tema}.`,
    icfes: `Inferencia y razonamiento crítico sobre ${profile.tema}.`,
    ordenar: `Pensamiento secuencial y orden lógico en ${profile.tema}.`,
    clasificar: `Categorización y criterio de selección en ${profile.tema}.`,
    emparejar: `Asociación conceptual de soluciones tecnológicas en ${profile.tema}.`,
    codigo: `Lógica algorítmica y control de flujo en ${profile.tema}.`,
    hardware: `Simulación de sensores y actuadores en ${profile.tema}.`,
    multifase: `Integración paso a paso de proyecto en ${profile.tema}.`,
  };
  return porTipo[profile.tipo] ?? `Dominio práctico de ${profile.tema}.`;
}

function buildQueVasHacer(profile: ChallengeProfile): string {
  switch (profile.tipo) {
    case 'escribir':
      return `Redactarás tu análisis en el editor de texto.`;
    case 'lectura':
    case 'icfes':
      return `Leerás las fuentes y seleccionarás la respuesta fundamentada.`;
    case 'ordenar':
    case 'clasificar':
    case 'emparejar':
      return `Arrastrarás las tarjetas desordenadas hacia su lugar correspondiente.`;
    case 'codigo':
    case 'hardware':
      return `Ajustarás el código/bloques y pulsarás ejecutar para validar.`;
    case 'multifase':
      return `Avanzarás fase por fase completando cada objetivo específico.`;
    default:
      return `Completarás la secuencia o interacción requerida.`;
  }
}

function buildTareaConcreta(profile: ChallengeProfile): string {
  return `${profile.metaConcreta}. Al finalizar, usa «${profile.verificarCon}» para comprobar.`;
}

function buildBriefing(profile: ChallengeProfile, challengeId: string, tiempoEstimado?: string): ChallengeBriefing {
  const pasosBase = getChallengeInstructions(challengeId);
  const pasosDetallados = pasosBase.map((paso, i) => softenPaso(paso, profile, i, pasosBase.length));

  const contexto = buildContexto(profile);
  const puente = buildPuente(profile);

  return {
    saludo: buildSaludo(profile),
    contexto,
    puente,
    queVasAprender: buildQueVasAprender(profile),
    queVasHacer: buildQueVasHacer(profile),
    tareaConcreta: buildTareaConcreta(profile),
    pasosDetallados,
    recuerda: [
      profile.consejoProfesor,
      `Atención a posibles errores comunes: ${profile.erroresComunes}.`,
      'Utiliza las herramientas metacognitivas como apoyo para guiar tu trabajo.',
    ],
    tiempoSugerido: tiempoEstimado ? `${tiempoEstimado} min` : undefined,
    resumenSuave: `${contexto} ${puente}`,
  };
}

const cache = new Map<string, ChallengeBriefing>();

export function getChallengeBriefing(challengeId: string, tiempoEstimado?: string): ChallengeBriefing {
  const cacheKey = `${challengeId}:${tiempoEstimado ?? ''}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  const profile = getChallengeProfile(challengeId);
  if (!profile) {
    const pasos = getChallengeInstructions(challengeId);
    const fallback: ChallengeBriefing = {
      saludo: 'Hola. Antes de empezar, tómate un momento para leer con calma lo que sigue.',
      contexto: 'Este reto forma parte de tu análisis metacognitivo. No es una prueba sorpresa: aquí te explicamos qué viene y por qué.',
      puente: 'Cuando te sientas listo/a, podrás pasar a la actividad en pantalla.',
      queVasAprender: 'Practicarás una competencia del nivel actual.',
      queVasHacer: 'Seguirás las instrucciones que aparecen a continuación, paso a paso.',
      tareaConcreta: pasos[pasos.length - 1] ?? 'Completa la actividad según los criterios del reto.',
      pasosDetallados: pasos,
      recuerda: ['Tómate tu tiempo. El análisis observa cómo piensas.'],
      tiempoSugerido: tiempoEstimado ? `${tiempoEstimado} minutos` : undefined,
      resumenSuave: 'Lee con calma las instrucciones antes de empezar el reto.',
    };
    return fallback;
  }
  const briefing = buildBriefing(profile, challengeId, tiempoEstimado);
  cache.set(cacheKey, briefing);
  return briefing;
}