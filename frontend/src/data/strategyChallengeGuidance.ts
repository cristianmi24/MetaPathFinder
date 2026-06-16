import type { ChallengeProfile } from './challengeProfiles';
import { getChallengeProfile } from './challengeProfiles';
import { nuevasEstrategias } from './metacognitiveStrategies';

function partesClave(p: ChallengeProfile): string[] {
  return [p.elementoTrabajo, p.metaConcreta, `Verificar con ${p.verificarCon}`];
}

export interface StrategyChallengeGuidance {
  mensajeProfesor: string;
  pasosEnEsteReto: string[];
  ejemploConcreto?: string;
  placeholderMonitor?: string;
}

function est1Guidance(p: ChallengeProfile): StrategyChallengeGuidance {
  const partes = partesClave(p);
  const partesTexto = partes.join(' → ');
  return {
    mensajeProfesor: `Antes de tocar la pantalla, imagina el reto completo como un mapa. Tu meta es: ${p.accionPrincipal}. Piensa en las partes (${partesTexto}) y decide en qué orden las atacarías.`,
    pasosEnEsteReto: [
      `Lee el briefing del reto y subraya mentalmente: «${p.tema}».`,
      `Divide en 3–5 bloques usando: ${partes.slice(0, 3).join(', ')}.`,
      `Ordena los bloques: ¿qué necesitas primero para que lo demás tenga sentido?`,
      `Escribe cada bloque en «Subtareas» y marca ✓ solo cuando ese bloque esté cerrado en la actividad.`,
      `Si te atascas en un bloque, no saltes al azar: vuelve al briefing o al consejo del profesor.`,
    ],
    ejemploConcreto: `Ejemplo de subtareas para este reto: 1) ${partes[0]}  2) ${partes[1]}  3) ${partes[2]}`,
    placeholderMonitor: `Bloque 1: ${partes[0]}`,
  };
}

function est2Guidance(p: ChallengeProfile): StrategyChallengeGuidance {
  return {
    mensajeProfesor: `Este reto pide que ${p.accionPrincipal}. Antes de empezar, predice: ¿cuántas piezas, intentos o minutos crees que necesitarás? Luego compara con lo real — eso entrena tu calibración.`,
    pasosEnEsteReto: [
      `Mira la actividad: ${p.interaccionUI}.`,
      `Predice cuánto tardarás (minutos) y qué tan seguro/a estás de acertar (0–100%).`,
      `Trabaja con normalidad; cada ~3 min el sistema te pedirá un checkpoint JOL.`,
      `Al terminar, compara predicción vs tiempo real y vs resultado (éxito o fallo).`,
      `Anota: «Pensé que… pero en realidad…» — una frase basta.`,
    ],
    ejemploConcreto: `Si el reto tiene varias fases (${partesClave(p).slice(0, 2).join(' y ')}), predice por fase, no solo el total.`,
    placeholderMonitor: 'Pensé que tardaría ___ min y acertaría al ___%',
  };
}

function est3Guidance(p: ChallengeProfile): StrategyChallengeGuidance {
  return {
    mensajeProfesor: `Aquí conviene un plan B. Si ${p.interaccionUI} no te funciona a la primera, ¿qué harías? Tener un camino alternativo te evita quedarte bloqueado/a en ${p.tema}.`,
    pasosEnEsteReto: [
      `Plan A: describe en una línea cómo resolverás el reto (${p.accionPrincipal}).`,
      `Plan B: si el Plan A falla, ¿revisarías instrucciones, pedirías una pista, o probarías otro orden?`,
      `Plan C: si sigues atascado/a, ¿qué parte mínima puedes completar igual? (${partesClave(p)[0]})`,
      `Registra cada intento en «Predicciones / planes» con etiqueta A, B o C.`,
      `Cuando algo funcione, anota por qué funcionó — es evidencia para el siguiente reto.`,
    ],
    ejemploConcreto: `Plan B para este reto: volver a ${partesClave(p)[0]} y contrastar con ${p.metaConcreta}.`,
    placeholderMonitor: 'Plan A: … | Si falla, Plan B: …',
  };
}

function est4Guidance(p: ChallengeProfile): StrategyChallengeGuidance {
  return {
    mensajeProfesor: `Tu cerebro necesita pausas para asimilar ${p.tema}. No es perder tiempo: es cuando consolidas lo que ${p.interaccionUI} te está enseñando.`,
    pasosEnEsteReto: [
      `Trabaja 5 minutos con foco en: ${p.accionPrincipal}.`,
      `Pausa 1 minuto: sin pantalla, repite en voz baja qué llevas hecho.`,
      `Vuelve y comprueba si tu última acción tuvo sentido (${partesClave(p)[0]}).`,
      `Cada pausa, escribe una línea en el bloc: «Hasta ahora entiendo que…».`,
      `Al cerrar el reto, lee tus notas: ¿ves progreso entre la primera y la última pausa?`,
    ],
    ejemploConcreto: `En la pausa, pregúntate: «¿${p.consejoProfesor}?»`,
    placeholderMonitor: 'Hasta ahora entiendo que…',
  };
}

function est5Guidance(p: ChallengeProfile): StrategyChallengeGuidance {
  const items = partesClave(p);
  return {
    mensajeProfesor: `Vamos a separar lo que YA sabes de lo que CREES y de lo que NO sabes sobre ${p.tema}. Eso te dice dónde poner la energía en esta actividad.`,
    pasosEnEsteReto: [
      `SÉ: lista hechos o pasos que dominas (ej. ${items[0]}).`,
      `CREO: lista ideas que tienes pero no has comprobado en pantalla.`,
      `NO SÉ: lista lo que te genera duda antes de empezar.`,
      `Resuelve primero un ítem de NO SÉ — solo uno — usando ${p.interaccionUI}.`,
      `Al final, mueve al menos un ítem de NO SÉ o CREO hacia SÉ.`,
    ],
    ejemploConcreto: `CREO: «${items[1] || p.accionPrincipal}» → compruébalo en la actividad y pásalo a SÉ si se confirma.`,
    placeholderMonitor: 'NO SÉ: …',
  };
}

function est6Guidance(p: ChallengeProfile): StrategyChallengeGuidance {
  return {
    mensajeProfesor: `Imagina que le explicas este reto a un compañero que no lo ha visto. Si puedes narrar ${p.tema} con claridad, tú también lo entiendes mejor.`,
    pasosEnEsteReto: [
      `En el bloc, escribe: «Este reto trata de…» (usa tus palabras, tema: ${p.tema}).`,
      `Añade: «Tengo que…» refiriéndote a: ${p.accionPrincipal}.`,
      `Describe: «En pantalla voy a…» → ${p.interaccionUI}.`,
      `Cuando termines un hito, añade «Lo que aprendí aquí es…».`,
      `Antes de enviar/finalizar, lee tu texto en voz alta (susurro vale). ¿Suena claro?`,
    ],
    ejemploConcreto: p.consejoProfesor,
    placeholderMonitor: 'Este reto trata de… Tengo que…',
  };
}

function est7Guidance(p: ChallengeProfile): StrategyChallengeGuidance {
  const hitos = [p.elementoTrabajo, p.interaccionUI, p.metaConcreta, `Verificar con ${p.verificarCon}`];
  return {
    mensajeProfesor: `Este reto tiene hitos claros. No marques el checklist por impulso: cada ✓ debe significar que completaste esa parte en la actividad real.`,
    pasosEnEsteReto: hitos.map((h, i) => `${i + 1}) Marca ✓ solo cuando hayas completado: ${h}.`),
    ejemploConcreto: `El último hito suele ser: comprobar el criterio de éxito del reto (${p.accionPrincipal}).`,
    placeholderMonitor: hitos[0],
  };
}

function est8Guidance(p: ChallengeProfile): StrategyChallengeGuidance {
  return {
    mensajeProfesor: `Los errores aquí son datos, no fracaso. Cada vez que algo falle al ${p.interaccionUI}, anótalo: qué hiciste, qué pasó, qué harás distinto.`,
    pasosEnEsteReto: [
      `Intenta resolver con calma: ${p.accionPrincipal}.`,
      `Si fallas, abre «Diario de errores» y describe el intento en una frase.`,
      `Escribe «Próximo intento:» con un cambio concreto (no repetir lo mismo).`,
      `Tras 2–3 entradas, busca patrones: ¿fallas siempre en la misma parte?`,
      `Aplica ${p.consejoProfesor}`,
    ],
    ejemploConcreto: `Error típico en este reto: ${p.erroresComunes}. Anótalo si te pasa.`,
    placeholderMonitor: 'Intenté… pero pasó… Próximo intento:…',
  };
}

const BUILDERS: Record<string, (p: ChallengeProfile) => StrategyChallengeGuidance> = {
  est1: est1Guidance,
  est2: est2Guidance,
  est3: est3Guidance,
  est4: est4Guidance,
  est5: est5Guidance,
  est6: est6Guidance,
  est7: est7Guidance,
  est8: est8Guidance,
};

export function getStrategyChallengeGuidance(
  challengeId: string,
  strategyId: string,
): StrategyChallengeGuidance {
  const profile = getChallengeProfile(challengeId);
  const strategy = nuevasEstrategias.find(e => e.id === strategyId);
  if (!profile) {
    return {
      mensajeProfesor: `Usa ${strategy?.nombre ?? 'tu estrategia'} mientras trabajas en este reto.`,
      pasosEnEsteReto: ['Lee las instrucciones del reto antes de empezar.', 'Usa las herramientas de la estrategia mientras avanzas.'],
    };
  }
  const builder = BUILDERS[strategyId];
  if (!builder) {
    return {
      mensajeProfesor: `Usa la estrategia ${strategy?.nombre ?? strategyId} mientras trabajas en: ${profile.accionPrincipal}.`,
      pasosEnEsteReto: partesClave(profile).map((part, i) => `${i + 1}) ${part}`),
    };
  }
  const guidance = builder(profile);
  return {
    ...guidance,
    mensajeProfesor: `${strategy?.nombre ?? 'Estrategia'} en este reto: ${guidance.mensajeProfesor}`,
  };
}