/**
 * Explicaciones en lenguaje de estudiante: para qué sirve cada estrategia y cada herramienta.
 * Las claves coinciden con los ids de metacognitiveStrategies.ts (est2, est4, est7, est8; h1/h2).
 */
import { getEstrategia } from './metacognitiveStrategies';

export interface StrategyBenefit {
  /** Para qué te ayuda la estrategia (1-2 frases). */
  paraQue: string;
  /** Cuándo conviene usarla dentro de la actividad. */
  cuando: string;
  /** Para qué sirve cada herramienta, por id. */
  herramientas: Record<string, string>;
}

export const strategyBenefits: Record<string, StrategyBenefit> = {
  est7: {
    paraQue: 'Te ayuda a no sentirte abrumado/a: el reto se convierte en metas pequeñas que puedes ir cumpliendo.',
    cuando: 'Al empezar, elige tu primera meta; márcala cuando la cumplas.',
    herramientas: {
      h1: 'Tocas una meta para elegirla como la siguiente y la marcas al cumplirla.',
      h2: 'Una barra te muestra cuánto del reto ya lograste.',
    },
  },
  est2: {
    paraQue: 'Te ayuda a darte cuenta de si te sientes más o menos seguro/a que al empezar, para pedir ayuda a tiempo.',
    cuando: 'Cada 3 minutos te avisa; solo tocas un número.',
    herramientas: {
      h1: 'Tocas un número del 1 al 10 para decir qué tan seguro/a te sientes ahora.',
      h2: 'Ves cómo cambió tu confianza desde el inicio.',
    },
  },
  est4: {
    paraQue: 'Te ayuda a manejar tu tiempo: ves cuánto llevas frente a lo que calculaste y decides con calma.',
    cuando: 'Mírala de vez en cuando; a mitad de tiempo te pregunta cómo vas.',
    herramientas: {
      h1: 'Una barra compara el tiempo real con los minutos que estimaste.',
      h2: 'Eliges «Voy bien», «Necesito más tiempo» o «Estoy atascado/a».',
    },
  },
  est8: {
    paraQue: 'Te ayuda a ver los errores como pistas: cada uno te dice qué revisar.',
    cuando: 'Úsala justo después de un intento que no salió.',
    herramientas: {
      h1: 'Eliges por qué crees que pasó el error.',
      h2: 'Eliges qué harás distinto en el siguiente intento.',
    },
  },
};

export function getStrategyBenefit(strategyId: string): StrategyBenefit | null {
  const resolved = getEstrategia(strategyId)?.id ?? strategyId;
  return strategyBenefits[resolved] ?? null;
}
