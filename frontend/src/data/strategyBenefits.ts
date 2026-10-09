/**
 * Explicaciones en lenguaje de estudiante: para qué sirve cada estrategia y cada herramienta.
 * Las claves coinciden con los ids de metacognitiveStrategies.ts (est1…est8, h1/h2).
 */
export interface StrategyBenefit {
  /** Para qué te ayuda la estrategia (1-2 frases). */
  paraQue: string;
  /** Cuándo conviene usarla dentro de la actividad. */
  cuando: string;
  /** Para qué sirve cada herramienta, por id. */
  herramientas: Record<string, string>;
}

export const strategyBenefits: Record<string, StrategyBenefit> = {
  est1: {
    paraQue: 'Te ayuda a empezar con un plan. Dividir el reto en pasos pequeños evita que te sientas bloqueado/a.',
    cuando: 'Úsala al principio, antes de tocar la actividad.',
    herramientas: {
      h1: 'Escribes los pasos que vas a seguir para saber siempre por dónde continuar.',
      h2: 'Mide cuánto piensas antes de actuar: planificar un momento suele ahorrar errores.',
    },
  },
  est2: {
    paraQue: 'Te ayuda a darte cuenta de si te sientes más o menos seguro/a que al empezar, para ajustar cómo trabajas.',
    cuando: 'Úsala cada pocos minutos; te avisará cuando toque.',
    herramientas: {
      h1: 'Te recuerda cada 3 minutos revisar qué tan seguro/a te sientes (1 a 10).',
      h2: 'Compara tu confianza del inicio con la de ahora para ver si cambió.',
    },
  },
  est3: {
    paraQue: 'Te ayuda a pensar antes de comprobar. Si anticipas qué va a pasar, aprendes más de cada resultado.',
    cuando: 'Úsala justo antes de verificar o ejecutar.',
    herramientas: {
      h1: 'Anotas qué esperas que ocurra antes de comprobar tu respuesta.',
      h2: 'Después marcas si coincidió o no; las diferencias te enseñan qué ajustar.',
    },
  },
  est4: {
    paraQue: 'Te ayuda a manejar tu tiempo. Ver cuánto llevas frente a lo que calculaste te permite decidir con calma.',
    cuando: 'Mírala de vez en cuando mientras trabajas.',
    herramientas: {
      h1: 'Una barra compara el tiempo real con los minutos que estimaste.',
      h2: 'Te avisa si ya pasaste el tiempo planeado, para que reorganices tus pasos.',
    },
  },
  est5: {
    paraQue: 'Te ayuda a saber qué sabes y qué no. Nombrar tus dudas es el primer paso para resolverlas.',
    cuando: 'Úsala cuando te atasques o algo no te quede claro.',
    herramientas: {
      h1: 'Anotas con claridad lo que todavía no sabes («No sé cómo…»).',
      h2: 'Ordenas tus ideas en tres niveles: lo que sé, lo que creo y lo que no sé.',
    },
  },
  est6: {
    paraQue: 'Te ayuda a ver todo lo que sí has logrado, para mantener la motivación aunque el reto sea difícil.',
    cuando: 'Úsala cada vez que algo te salga bien, por pequeño que sea.',
    herramientas: {
      h1: 'Registras tus avances («Logré que…», «Ya entiendo…»).',
      h2: 'Cuenta cuántas victorias llevas; verlas crecer anima a seguir.',
    },
  },
  est7: {
    paraQue: 'Te ayuda a avanzar paso a paso. Ver el reto en metas pequeñas lo hace más fácil de completar.',
    cuando: 'Úsala durante toda la actividad, marcando cada meta lograda.',
    herramientas: {
      h1: 'Una lista con los criterios del reto; marcas cada uno al cumplirlo.',
      h2: 'Una barra muestra qué porcentaje del reto ya llevas.',
    },
  },
  est8: {
    paraQue: 'Te ayuda a ver los errores como información útil, no como fracasos: cada error te dice qué revisar.',
    cuando: 'Úsala justo después de equivocarte.',
    herramientas: {
      h1: 'Después de cada fallo escribes qué te indica ese error.',
      h2: 'Una plantilla te guía: «Este error me dice que ___ necesita revisión».',
    },
  },
};

export function getStrategyBenefit(strategyId: string): StrategyBenefit | null {
  return strategyBenefits[strategyId] ?? null;
}
