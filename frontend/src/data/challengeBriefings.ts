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
  const pasoLimpio = paso.replace(/^[📌▸✅]\s*/, '').trim();
  if (index === 0) {
    return `Para empezar con calma: ${pasoLimpio.charAt(0).toLowerCase()}${pasoLimpio.slice(1)} Tómate un momento — estamos explorando ${profile.tema}.`;
  }
  if (index === total - 1) {
    return `Cuando creas que terminaste: ${pasoLimpio.charAt(0).toLowerCase()}${pasoLimpio.slice(1)} Comprueba que lograste ${profile.metaConcreta}.`;
  }
  return `Siguiente paso: ${pasoLimpio.charAt(0).toLowerCase()}${pasoLimpio.slice(1)}`;
}

function buildSaludo(profile: ChallengeProfile): string {
  return `¡Hola! Hoy vamos a trabajar «${profile.tituloCorto}». Antes de tocar la pantalla, léeme con calma: como en clase, primero entendemos de qué se trata y después pasamos a la acción. No hay prisa.`;
}

function buildContexto(profile: ChallengeProfile): string {
  switch (profile.tipo) {
    case 'escribir':
      return `Vamos a hablar de ${profile.tema}. No se trata de memorizar definiciones ni de escribir perfecto a la primera: es un espacio para que organices tus ideas con honestidad, como si conversaras con alguien de confianza.`;
    case 'lectura':
      return `Este reto nos invita a leer con atención sobre ${profile.tema}. La idea no es adivinar ni responder rápido: es entender lo que dicen los textos y luego decidir con criterio.`;
    case 'icfes':
      return `Practicaremos lectura crítica sobre ${profile.tema}, con el mismo espíritu del ICFES: leer, comprender y elegir la respuesta que el texto realmente respalda — no la que suena más bonita.`;
    case 'ordenar':
      return `A veces la tecnología parece un rompecabezas: piezas sueltas que solo tienen sentido en el orden correcto. Hoy trabajaremos ${profile.tema}, y verás que con paciencia el orden aparece.`;
    case 'clasificar':
      return `En la vida real clasificamos todo el tiempo sin darnos cuenta: ¿esto es urgente o puede esperar? ¿es eléctrico o de transporte? Hoy aplicaremos esa misma lógica a ${profile.tema}.`;
    case 'emparejar':
      return `La tecnología cambia, pero muchos problemas de la vida siguen siendo los mismos — solo que ahora los resolvemos de otra manera. Este reto te ayuda a ver esa conexión en ${profile.tema}.`;
    case 'codigo':
      return `Programar es aprender a dar instrucciones claras, paso a paso, sin saltos mágicos. Hoy trabajaremos ${profile.tema}; si algo falla, es una pista para corregir, no un fracaso.`;
    case 'hardware':
      return `Vamos a simular algo que pasa en el mundo físico: sensores, cables, señales. No necesitas tener un Arduino en casa; la pantalla es tu laboratorio para explorar ${profile.tema}.`;
    case 'multifase':
      return `Este reto tiene varias etapas, como un proyecto de clase que se construye poco a poco. Cada fase prepara la siguiente sobre ${profile.tema} — si te saltas una, la siguiente cuesta más.`;
    default:
      return `Hoy exploraremos ${profile.tema}. El objetivo es entender el proceso, no solo llegar al resultado.`;
  }
}

function buildPuente(profile: ChallengeProfile): string {
  switch (profile.tipo) {
    case 'escribir':
      return `Cuando te sientas listo/a, abrirás un editor de texto en la pantalla — como un cuaderno digital. Ahí ${profile.interaccionUI}. No hay respuestas correctas únicas: lo importante es que pienses en voz alta por escrito.`;
    case 'lectura':
    case 'icfes':
      return `Cuando quieras comenzar, encontrarás ${profile.elementoTrabajo}. Lee con calma, sin presión; puedes volver al texto las veces que necesites antes de elegir tu respuesta.`;
    case 'ordenar':
    case 'clasificar':
    case 'emparejar':
      return `En la actividad verás ${profile.elementoTrabajo}. Tu trabajo será ${profile.interaccionUI}. Si dudas, detente un momento antes de mover algo — eso también cuenta como pensar.`;
    case 'codigo':
    case 'hardware':
      return `En pantalla tendrás ${profile.elementoTrabajo}. Vas a ${profile.interaccionUI}. Puedes probar, fallar y volver a intentar: cada intento te enseña algo.`;
    case 'multifase':
      return `La actividad está dividida en fases con ${profile.elementoTrabajo}. Avanza una por una: ${profile.interaccionUI}. No saltes etapas; cada una te prepara para la siguiente.`;
    default:
      return `En la pantalla ${profile.interaccionUI}. Trabajarás con ${profile.elementoTrabajo}.`;
  }
}

function buildQueVasAprender(profile: ChallengeProfile): string {
  const porTipo: Partial<Record<ChallengeProfile['tipo'], string>> = {
    escribir: `Aprenderás a reflexionar con claridad sobre ${profile.tema}: qué sabes, qué te preocupa y qué podrías hacer al respecto.`,
    lectura: `Fortalecerás tu comprensión lectora sobre ${profile.tema} — leer con atención y sacar conclusiones basadas en evidencia.`,
    icfes: `Practicarás inferencia y argumentación sobre ${profile.tema}, habilidades clave para lectura crítica y el ICFES.`,
    ordenar: `Entrenarás el pensamiento secuencial: ver por qué el orden importa cuando hablamos de ${profile.tema}.`,
    clasificar: `Desarrollarás criterio para agrupar y distinguir elementos relacionados con ${profile.tema}.`,
    emparejar: `Comprenderás cómo evolucionan las soluciones tecnológicas en ${profile.tema} y qué problema resuelve cada una.`,
    codigo: `Aplicarás lógica de programación a ${profile.tema}: orden, condiciones y verificación de resultados.`,
    hardware: `Entenderás la relación entre sensores, código y actuadores en ${profile.tema}.`,
    multifase: `Integrarás varias habilidades en un mismo proyecto sobre ${profile.tema}, paso a paso.`,
  };
  return porTipo[profile.tipo] ?? `Profundizarás en ${profile.tema} y en cómo se conecta con la tecnología del día a día.`;
}

function buildQueVasHacer(profile: ChallengeProfile): string {
  switch (profile.tipo) {
    case 'escribir':
      return `Vas a ${profile.accionPrincipal}. Piensa en ello como un borrador personal: no tiene que sonar formal ni perfecto. Lo que importa es que incluyas tus ideas reales y las organices con sentido.`;
    case 'lectura':
    case 'icfes':
      return `Vas a ${profile.accionPrincipal}. Lee cada texto con tranquilidad; las preguntas esperan a que termines de entender, no a que respondas al azar.`;
    case 'ordenar':
    case 'clasificar':
    case 'emparejar':
      return `Vas a ${profile.accionPrincipal}. Usarás ${profile.elementoTrabajo} y, con paciencia, irás colocando cada pieza donde creas que corresponde.`;
    case 'codigo':
    case 'hardware':
      return `Vas a ${profile.accionPrincipal}. Armarás o completarás ${profile.elementoTrabajo} y comprobarás el resultado antes de dar por cerrado el reto.`;
    case 'multifase':
      return `Vas a ${profile.accionPrincipal}. Es un recorrido con varias paradas; en cada una harás algo distinto pero conectado con el mismo objetivo.`;
    default:
      return `Vas a ${profile.accionPrincipal}. En pantalla ${profile.interaccionUI}.`;
  }
}

function buildTareaConcreta(profile: ChallengeProfile): string {
  switch (profile.tipo) {
    case 'escribir':
      return `Cuando escribas, asegúrate de cumplir esto: ${profile.metaConcreta}. Al terminar, pulsa ${profile.verificarCon} para recibir retroalimentación.`;
    case 'lectura':
    case 'icfes':
      return `El reto se completa cuando logres ${profile.metaConcreta}. Basa cada respuesta en lo que leíste, no solo en lo que crees de memoria.`;
    case 'ordenar':
    case 'clasificar':
    case 'emparejar':
      return `Tu meta concreta: ${profile.metaConcreta}. Cuando creas que está listo, usa ${profile.verificarCon} para comprobar.`;
    case 'codigo':
    case 'hardware':
      return `Debes lograr que ${profile.metaConcreta}. Ejecuta y revisa el resultado con ${profile.verificarCon} antes de cerrar.`;
    case 'multifase':
      return `Al final del recorrido debes haber logrado: ${profile.metaConcreta}. Completa cada fase y avanza solo cuando estés seguro/a.`;
    default:
      return profile.metaConcreta;
  }
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
      `Un error muy común aquí: ${profile.erroresComunes}. Si te pasa, no pasa nada — anótalo y corrige con calma.`,
      'Este diagnóstico observa cómo piensas mientras trabajas, no solo si aciertas a la primera.',
      'Durante la actividad tendrás herramientas de tu estrategia metacognitiva — úsalas como apoyo, no como obligación.',
    ],
    tiempoSugerido: tiempoEstimado ? `${tiempoEstimado} minutos` : undefined,
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
      contexto: 'Este reto forma parte de tu diagnóstico metacognitivo. No es una prueba sorpresa: aquí te explicamos qué viene y por qué.',
      puente: 'Cuando te sientas listo/a, podrás pasar a la actividad en pantalla.',
      queVasAprender: 'Practicarás una competencia del nivel actual.',
      queVasHacer: 'Seguirás las instrucciones que aparecen a continuación, paso a paso.',
      tareaConcreta: pasos[pasos.length - 1] ?? 'Completa la actividad según los criterios del reto.',
      pasosDetallados: pasos,
      recuerda: ['Tómate tu tiempo. El diagnóstico observa cómo piensas.'],
      tiempoSugerido: tiempoEstimado ? `${tiempoEstimado} minutos` : undefined,
      resumenSuave: 'Lee con calma las instrucciones antes de empezar el reto.',
    };
    return fallback;
  }
  const briefing = buildBriefing(profile, challengeId, tiempoEstimado);
  cache.set(cacheKey, briefing);
  return briefing;
}