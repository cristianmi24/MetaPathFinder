export interface JolGeneral {
  id: string;
  nivel: string;
  codigo: string;
  pregunta: string;
  escala: string;
  dimension: string;
}

export const jolGenerales: JolGeneral[] = [
  {
    "id": "JG-B1",
    "nivel": "Básico",
    "codigo": "B-G1",
    "pregunta": "Antes de comenzar este reto, ¿qué tan seguro/a estás de poder completarlo sin necesitar ayuda externa? (1 = muy inseguro · 10 = totalmente seguro)",
    "escala": "1 – 10",
    "dimension": "Confianza general ante el reto"
  },
  {
    "id": "JG-B2",
    "nivel": "Básico",
    "codigo": "B-G2",
    "pregunta": "Piensa en el tiempo que crees que necesitarás para resolver este reto. ¿Cuántos minutos estimas que tardarás?",
    "escala": "Numérico (min)",
    "dimension": "Estimación temporal · planificación"
  },
  {
    "id": "JG-B3",
    "nivel": "Básico",
    "codigo": "B-G3",
    "pregunta": "¿En qué momento de tu aprendizaje te encuentras respecto a este tipo de actividades? Marca dónde te ves.",
    "escala": "Nunca lo he hecho · He leído sobre ello · Lo he practicado poco · Lo domino",
    "dimension": "Conocimiento declarativo vs. procedimental"
  },
  {
    "id": "JG-M1",
    "nivel": "Medio",
    "codigo": "M-G1",
    "pregunta": "Antes de iniciar, ¿qué tan seguro/a estás de poder diseñar una solución ÓPTIMA (no solo funcional) para este reto? (1 = muy inseguro · 10 = experto/a total)",
    "escala": "1 – 10",
    "dimension": "Confianza en calidad de la solución"
  },
  {
    "id": "JG-M2",
    "nivel": "Medio",
    "codigo": "M-G2",
    "pregunta": "¿Cuántos intentos o revisiones crees que necesitarás antes de tener una solución que cumpla todos los criterios? Escribe un número.",
    "escala": "Numérico (intentos)",
    "dimension": "Estimación de esfuerzo · densidad de edición"
  },
  {
    "id": "JG-M3",
    "nivel": "Medio",
    "codigo": "M-G3",
    "pregunta": "¿Qué parte del reto te parece más difícil ANTES de comenzar?",
    "escala": "Entender qué me piden · Encontrar la información necesaria · Organizar mis ideas · Redactar o presentar el resultado",
    "dimension": "Identificación de lagunas de conocimiento"
  },
  {
    "id": "JG-A1",
    "nivel": "Avanzado",
    "codigo": "A-G1",
    "pregunta": "Considerando todos los criterios de evaluación de este reto, ¿en qué porcentaje estás seguro/a de cumplirlos todos? (0 % = ninguno · 100 % = todos con certeza)",
    "escala": "0 % – 100 %",
    "dimension": "Calibración metacognitiva de criterios"
  },
  {
    "id": "JG-A2",
    "nivel": "Avanzado",
    "codigo": "A-G2",
    "pregunta": "Si tuvieras que enseñarle a un compañero cómo resolver este reto ahora mismo, ¿qué tan capaz te sentirías de explicarlo sin errores? (1 = incapaz · 10 = puedo enseñarlo sin dudar)",
    "escala": "1 – 10",
    "dimension": "Autoeficacia de transferencia · efecto de enseñanza"
  },
  {
    "id": "JG-A3",
    "nivel": "Avanzado",
    "codigo": "A-G3",
    "pregunta": "Compara este reto con los anteriores que has resuelto. ¿Qué tan bien crees que tu experiencia previa te ayudará aquí?",
    "escala": "No tengo experiencia previa relevante · Tengo algo de experiencia pero no estoy seguro/a de aplicarla · Mi experiencia previa me da buena base · Mi experiencia previa me prepara completamente",
    "dimension": "Transferencia y metacognición acumulada"
  }
];
