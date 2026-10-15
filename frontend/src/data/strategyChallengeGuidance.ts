import type { ChallengeProfile } from './challengeProfiles';
import { getChallengeProfile } from './challengeProfiles';
import { getEstrategia } from './metacognitiveStrategies';

function partesClave(p: ChallengeProfile): string[] {
  return [p.elementoTrabajo, p.metaConcreta, `Verificar con ${p.verificarCon}`];
}

export interface StrategyChallengeGuidance {
  mensajeProfesor: string;
  pasosEnEsteReto: string[];
  ejemploConcreto?: string;
  placeholderMonitor?: string;
}

function est7Guidance(p: ChallengeProfile): StrategyChallengeGuidance {
  return {
    mensajeProfesor: `Este reto se cumple por partes. Elige tu primera meta y marca cada una solo cuando la hayas logrado de verdad en la actividad.`,
    pasosEnEsteReto: [
      `Mira las metas del reto en «Herramientas de apoyo».`,
      `Toca la meta por la que vas a empezar.`,
      `Márcala cuando la cumplas y sigue con la próxima.`,
    ],
    ejemploConcreto: `Una buena primera meta: ${p.elementoTrabajo}.`,
  };
}

function est2Guidance(p: ChallengeProfile): StrategyChallengeGuidance {
  return {
    mensajeProfesor: `Cada 3 minutos te preguntaremos qué tan seguro/a te sientes. Si tu confianza baja, es buen momento para pedir una pista sobre ${p.tema}.`,
    pasosEnEsteReto: [
      `Trabaja con normalidad: ${p.accionPrincipal}.`,
      `Cuando te avise, toca un número del 1 al 10.`,
      `Compara con tu confianza del inicio y decide si pides ayuda.`,
    ],
  };
}

function est4Guidance(p: ChallengeProfile): StrategyChallengeGuidance {
  return {
    mensajeProfesor: `Mira el reloj de vez en cuando. A mitad del tiempo que calculaste te preguntaremos cómo vas: elige con sinceridad y ajusta tu plan.`,
    pasosEnEsteReto: [
      `Empieza por: ${p.elementoTrabajo}.`,
      `A mitad de tiempo, elige «Voy bien», «Necesito más tiempo» o «Estoy atascado/a».`,
      `Si te atascas, pide una pista en lugar de seguir probando al azar.`,
    ],
  };
}

function est8Guidance(p: ChallengeProfile): StrategyChallengeGuidance {
  return {
    mensajeProfesor: `Los errores aquí son pistas, no fracasos. Si algo no sale, elige por qué crees que pasó y qué harás distinto.`,
    pasosEnEsteReto: [
      `Intenta resolver con calma: ${p.accionPrincipal}.`,
      `Si fallas, abre «Herramientas de apoyo» y elige la causa.`,
      `Elige tu siguiente paso y vuelve a intentarlo.`,
    ],
    ejemploConcreto: `Error frecuente en este reto: ${p.erroresComunes}.`,
  };
}

const BUILDERS: Record<string, (p: ChallengeProfile) => StrategyChallengeGuidance> = {
  est2: est2Guidance,
  est4: est4Guidance,
  est7: est7Guidance,
  est8: est8Guidance,
};

export function getStrategyChallengeGuidance(
  challengeId: string,
  strategyId: string,
): StrategyChallengeGuidance {
  const profile = getChallengeProfile(challengeId);
  const strategy = getEstrategia(strategyId);
  if (strategy) strategyId = strategy.id;
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