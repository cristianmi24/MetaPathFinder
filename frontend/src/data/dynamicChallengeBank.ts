export interface JolEspecifico {
  pregunta: string;
  escala: string;
}

export interface DynamicChallenge {
  id: string;
  nivel: string;
  sub_nivel: string;
  componente: string;
  codigo_men: string;
  titulo: string;
  descripcion: string;
  criterios: string[];
  recursos: string;
  tiempo_estimado: string;
  jol_esp_1: JolEspecifico;
  jol_esp_2: JolEspecifico;
}

export const dynamicChallengeBank: DynamicChallenge[] = [
  {
    "id": "RB-C1-N1",
    "nivel": "Básico",
    "sub_nivel": "N1",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "Línea del tiempo del desarrollo tecnológico humano",
    "descripcion": "Organiza cronológicamente ocho hitos del desarrollo tecnológico, desde la rueda hasta el teléfono inteligente, mediante la línea de tiempo interactiva.",
    "criterios": [
      "1. Ordena correctamente los ocho hitos.",
      "2. Reconoce la secuencia del desarrollo tecnológico.",
      "3. Corrige el orden a partir de la verificación."
    ],
    "recursos": "Línea de tiempo interactiva incorporada<br>Lecciones breves de historia y desarrollo tecnológico",
    "tiempo_estimado": "20",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces el orden histórico de las principales invenciones?",
      "escala": "1 = Nada · 2 = Poco · 3 = Bastante · 4 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de explicar el orden y evolución de las tecnologías estudiadas?",
      "escala": "1 = Nada · 2 = Poco · 3 = Bastante · 4 = Mucho · 5 = Con ejemplos"
    }
  },
  {
    "id": "RB-C1-N2",
    "nivel": "Básico",
    "sub_nivel": "N2",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "Sistemas tecnológicos cotidianos en mi barrio",
    "descripcion": "Clasifica imágenes de infraestructuras del entorno en las categorías Eléctrica, Transporte y Construcción.",
    "criterios": [
      "1. Clasifica correctamente las infraestructuras.",
      "2. Diferencia las categorías tecnológicas.",
      "3. Reconoce su función en el entorno."
    ],
    "recursos": "Juego interactivo de emparejamiento de sistemas tecnológicos comunitarios",
    "tiempo_estimado": "20",
    "jol_esp_1": {
      "pregunta": "¿Qué tan capaz eres de identificar y clasificar infraestructuras tecnológicas de tu entorno?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tanto comprendes las infraestructuras necesarias para el funcionamiento de tu entorno?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RB-C1-N3",
    "nivel": "Básico",
    "sub_nivel": "N3",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "Relaciona situaciones con tecnologías antiguas y modernas",
    "descripcion": "Relaciona cuatro situaciones cotidianas con la tecnología antigua y moderna que les dieron solución.",
    "criterios": [
      "1. Relaciona correctamente cada situación con ambas tecnologías.",
      "2. Identifica el problema que resuelve cada tecnología.",
      "3. Reconoce la evolución de las soluciones tecnológicas."
    ],
    "recursos": "Tarjetas de situaciones y tecnologías (físicas o digitales)<br>Espacio para escribir breves explicaciones",
    "tiempo_estimado": "25",
    "jol_esp_1": {
      "pregunta": "¿Qué tan capaz eres de relacionar tecnologías antiguas y modernas con los problemas que resolvieron?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan claro tienes cómo han evolucionado las soluciones tecnológicas?",
      "escala": "1 = Nada claro · 2 = Poco claro · 3 = Regular · 4 = Claro · 5 = Muy claro"
    }
  },
  {
    "id": "RB-C2-N1",
    "nivel": "Básico",
    "sub_nivel": "N1",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Ordena archivos en Drive por fecha",
    "descripcion": "Ordena diez archivos de una unidad digital desde la fecha más antigua hasta la más reciente.",
    "criterios": [
      "1. Ordena correctamente los archivos por fecha.",
      "2. Identifica el archivo más antiguo y el más reciente.",
      "3. Revisa y corrige la secuencia antes de verificar."
    ],
    "recursos": "Simulación de Google Drive en la pantalla<br>Archivos digitales desordenados para ordenar",
    "tiempo_estimado": "12",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro te sientes al ordenar archivos según su fecha?",
      "escala": "1 = Nada seguro · 2 = Poco · 3 = Regular · 4 = Seguro · 5 = Muy seguro"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan fácil te resulta ordenar archivos por fecha?",
      "escala": "1 = Muy difícil · 2 = Difícil · 3 = Regular · 4 = Fácil · 5 = Muy fácil"
    }
  },
  {
    "id": "RB-C2-N2",
    "nivel": "Básico",
    "sub_nivel": "N2",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Ordena el plan de acción para una presentación de videollamada",
    "descripcion": "Organiza los pasos necesarios para preparar una presentación sobre el uso de una aplicación de videollamadas dirigida a un adulto mayor.",
    "criterios": [
      "1. Organiza correctamente la secuencia.",
      "2. Integra preparación, configuración y cierre.",
      "3. Considera un lenguaje claro y accesible."
    ],
    "recursos": "Lista de pasos posibles para preparar la presentación<br>Ejemplos de instrucciones claras y accesibles",
    "tiempo_estimado": "15",
    "jol_esp_1": {
      "pregunta": "¿Qué tan capaz eres de organizar una secuencia para explicar una tecnología?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan seguro te sientes al organizar los pasos de un proceso tecnológico?",
      "escala": "1 = Nada seguro · 2 = Poco · 3 = Regular · 4 = Seguro · 5 = Muy seguro"
    }
  },
  {
    "id": "RB-C2-N3",
    "nivel": "Básico",
    "sub_nivel": "N3",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Ordena las fórmulas del presupuesto escolar",
    "descripcion": "Organiza las operaciones necesarias para calcular y validar un presupuesto escolar de hasta $150.000 COP.",
    "criterios": [
      "1. Ordena correctamente las operaciones.",
      "2. Integra gastos, ingresos, saldo y límite presupuestal.",
      "3. Aplica una secuencia lógica de cálculo."
    ],
    "recursos": "Lista de operaciones y fórmulas usadas en presupuestos<br>Ejemplos de cálculos con hojas de cálculo",
    "tiempo_estimado": "18",
    "jol_esp_1": {
      "pregunta": "¿Qué tan claro tienes qué operaciones necesitas para elaborar un presupuesto?",
      "escala": "1 = Nada claro · 2 = Poco · 3 = Regular · 4 = Claro · 5 = Muy claro"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de seleccionar y ordenar operaciones para validar un presupuesto?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RB-C3-N1",
    "nivel": "Básico",
    "sub_nivel": "N1",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Instrucciones para hacer un sándwich",
    "descripcion": "Organiza los pasos necesarios para preparar un sándwich siguiendo una secuencia lógica.",
    "criterios": [
      "1. Ordena correctamente los pasos.",
      "2. Excluye los distractores.",
      "3. Mantiene una secuencia lógica y completa."
    ],
    "recursos": "Papel cuadriculado para diagrama de flujo<br>Símbolos de diagrama de flujo (referencia proporcionada)",
    "tiempo_estimado": "25",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces el concepto de algoritmo y su aplicación en tareas cotidianas?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de organizar una tarea cotidiana mediante una secuencia lógica?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RB-C3-N2",
    "nivel": "Básico",
    "sub_nivel": "N2",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Simulador lógico de lista de asistencia",
    "descripcion": "Organiza los bloques lógicos para automatizar el control de asistencia y generar una alerta cuando sea inferior al 80 %.",
    "criterios": [
      "1. Organiza correctamente los bloques.",
      "2. Aplica el condicional de asistencia menor al 80 %.",
      "3. Ejecuta el programa correctamente."
    ],
    "recursos": "Simulador de control de asistencia escolar por bloques integrado",
    "tiempo_estimado": "30",
    "jol_esp_1": {
      "pregunta": "¿Qué tan capaz eres de organizar bloques lógicos para resolver un problema?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan claro tienes el uso de una condición para generar una alerta?",
      "escala": "1 = Nada claro · 2 = Poco · 3 = Regular · 4 = Claro · 5 = Muy claro"
    }
  },
  {
    "id": "RB-C3-N3",
    "nivel": "Básico",
    "sub_nivel": "N3",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Diseña el sistema de préstamo de libros",
    "descripcion": "Organiza el pseudocódigo de un sistema de préstamo de libros según su secuencia lógica.",
    "criterios": [
      "1. Ordena correctamente el pseudocódigo.",
      "2. Incluye los datos necesarios para el préstamo.",
      "3. Ubica correctamente la condición de disponibilidad.",
      "4. Excluye los bloques que no corresponden."
    ],
    "recursos": "Papel o herramienta de diagramas (draw.io)<br>Referencia de símbolos de flujo",
    "tiempo_estimado": "45",
    "jol_esp_1": {
      "pregunta": "¿Qué tan capaz eres de identificar los datos y procesos necesarios para diseñar un sistema?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan claro tienes qué datos necesita un sistema para funcionar correctamente?",
      "escala": "1 = Nada claro · 2 = Poco · 3 = Regular · 4 = Claro · 5 = Muy claro"
    }
  },
  {
    "id": "RB-C4-N1",
    "nivel": "Básico",
    "sub_nivel": "N1",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Análisis digital: conectividad y acceso en el hogar",
    "descripcion": "Lee dos textos sobre conectividad y brecha digital. Luego responde tres preguntas según la información presentada.",
    "criterios": [
      "1. Comprende la información presentada.",
      "2. Identifica las causas de la brecha digital.",
      "3. Responde correctamente las preguntas."
    ],
    "recursos": "Lecturas integradas y cuestionario interactivo sobre brecha digital en Colombia",
    "tiempo_estimado": "20",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces sobre la brecha digital y el acceso a internet?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de interpretar información sobre conectividad a partir de textos breves?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RB-C4-N2",
    "nivel": "Básico",
    "sub_nivel": "N2",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Las redes sociales y mi bienestar",
    "descripcion": "Lee información sobre el uso de redes sociales y bienestar emocional. Luego responde tres preguntas de comprensión.",
    "criterios": [
      "1. Comprende los efectos del uso prolongado de redes sociales.",
      "2. Identifica prácticas de uso saludable.",
      "3. Responde correctamente las preguntas."
    ],
    "recursos": "Lecturas integradas y cuestionario interactivo sobre bienestar emocional y redes sociales",
    "tiempo_estimado": "20",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto comprendes la relación entre redes sociales y bienestar emocional?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tanto conoces prácticas para un uso saludable de las redes sociales?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RB-C4-N3",
    "nivel": "Básico",
    "sub_nivel": "N3",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Propuesta de solución tecnológica para un problema de tu comunidad",
    "descripcion": "Identifica un problema de tu comunidad y redacta una propuesta de solución tecnológica considerando su posible impacto.",
    "criterios": [
      "1. Identifica un problema real.",
      "2. Propone una solución pertinente.",
      "3. Considera su impacto y aspectos éticos.",
      "4. Presenta una propuesta clara y coherente."
    ],
    "recursos": "Procesador de texto · fuentes de información local<br>Formato de propuesta (proporcionado)",
    "tiempo_estimado": "50",
    "jol_esp_1": {
      "pregunta": "¿Qué tan capaz eres de proponer una solución tecnológica para un problema de tu comunidad?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de analizar los impactos sociales y éticos de una solución tecnológica?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RM-C1-N1",
    "nivel": "Medio",
    "sub_nivel": "N1",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "Anatomía de un smartphone",
    "descripcion": "Explora los componentes internos de un smartphone y responde tres preguntas sobre batería, pantalla y memoria RAM.",
    "criterios": [
      "1. Identifica los componentes principales.",
      "2. Diferencia las tecnologías OLED y LCD.",
      "3. Reconoce la función de la memoria RAM.",
      "4. Responde correctamente la trivia."
    ],
    "recursos": "Módulo de anatomía y cuestionario interactivo sobre hardware móvil",
    "tiempo_estimado": "25",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces los componentes y el funcionamiento de un smartphone?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tanto comprendes la función de la batería, la pantalla y la memoria RAM?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RM-C1-N2",
    "nivel": "Medio",
    "sub_nivel": "N2",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "De la calculadora mecánica al procesador cuántico",
    "descripcion": "Explora la evolución de la computación desde las primeras máquinas mecánicas hasta los procesadores cuánticos y responde seis preguntas.",
    "criterios": [
      "1. Reconoce los principales hitos de la evolución de la computación.",
      "2. Relaciona los avances tecnológicos con su contexto histórico.",
      "3. Comprende la evolución de la computación mecánica a la cuántica.",
      "4. Responde correctamente el cuestionario."
    ],
    "recursos": "Línea de tiempo histórica y test interactivo de evolución de la computación",
    "tiempo_estimado": "45",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces la evolución histórica de la computación?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tanto comprendes los principales avances de la computación y su evolución tecnológica?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RM-C1-N3",
    "nivel": "Medio",
    "sub_nivel": "N3",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "Prospectiva tecnológica: ¿cómo será la educación en 2040?",
    "descripcion": "Elabora un escenario sobre la educación en Colombia en 2040, considerando tecnologías emergentes, sus posibles usos e impactos.",
    "criterios": [
      "1. Fundamenta las tecnologías propuestas.",
      "2. Considera el contexto colombiano.",
      "3. Analiza posibles impactos y desigualdades.",
      "4. Presenta un escenario coherente."
    ],
    "recursos": "Fuentes prospectivas: WEF Future of Jobs · UNESCO 2040 · CEPAL Colombia digital<br>Herramienta de video (opcional)",
    "tiempo_estimado": "60",
    "jol_esp_1": {
      "pregunta": "¿Qué tan capaz eres de proyectar tendencias tecnológicas hacia el futuro?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de argumentar la posible implementación de tecnologías emergentes en la educación colombiana?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RM-C2-N1",
    "nivel": "Medio",
    "sub_nivel": "N1",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Automatiza una tarea repetitiva con macros",
    "descripcion": "Automatiza el cálculo de promedio, máximo y mínimo, y aplica formato condicional a notas inferiores a 3,0.",
    "criterios": [
      "1. Calcula correctamente promedio, máximo y mínimo.",
      "2. Aplica la condición a notas menores de 3,0.",
      "3. Ejecuta correctamente la automatización.",
      "4. Explica la función de la lógica utilizada."
    ],
    "recursos": "Simulador interactivo de hoja de cálculo MiniExcel con soporte de bloques",
    "tiempo_estimado": "35",
    "jol_esp_1": {
      "pregunta": "¿Qué tan capaz eres de automatizar tareas repetitivas en una hoja de cálculo?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de identificar y estructurar la lógica necesaria para automatizar una tarea?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RM-C2-N2",
    "nivel": "Medio",
    "sub_nivel": "N2",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Diseño de identidad digital y logos en SVG",
    "descripcion": "Explora la estructura de un logo en SVG, organiza su proceso de construcción y aplica colores y estilos.",
    "criterios": [
      "1. Reconoce la estructura básica de SVG.",
      "2. Ordena correctamente el proceso de diseño.",
      "3. Aplica colores y estilos de forma adecuada.",
      "4. Verifica el resultado final."
    ],
    "recursos": "Módulo interactivo de diseño y construcción de logos vectoriales en SVG incorporado",
    "tiempo_estimado": "40",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces la estructura y aplicación de SVG?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de aplicar criterios de diseño para crear una identidad visual coherente?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RM-C2-N3",
    "nivel": "Medio",
    "sub_nivel": "N3",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Base de datos de la tienda escolar",
    "descripcion": "Crea las tablas, registra los datos y consulta las ventas del 17 de mayo de 2025 mediante SQL.",
    "criterios": [
      "1. Crea correctamente las tablas.",
      "2. Registra los datos sin errores.",
      "3. Construye la consulta con SUM, COUNT y WHERE.",
      "4. Obtiene correctamente el reporte de ventas."
    ],
    "recursos": "Simulador interactivo de SQL por bloques y base de datos relacional integrada",
    "tiempo_estimado": "35",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces el diseño y las consultas básicas en bases de datos?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de construir consultas SQL para obtener información específica?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RM-C3-N1",
    "nivel": "Medio",
    "sub_nivel": "N1",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Sensor de temperatura con Arduino",
    "descripcion": "Configura un sensor de temperatura y controla dos LED mediante una condición de temperatura.",
    "criterios": [
      "1. Configura correctamente el sensor y los LED.",
      "2. Aplica la condición de temperatura.",
      "3. Verifica la respuesta del sistema.",
      "4. Ejecuta la simulación sin errores."
    ],
    "recursos": "Tablero y simulador interactivo de Arduino Uno y hardware integrado",
    "tiempo_estimado": "35",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces la programación de sensores y actuadores con Arduino?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de usar condicionales para controlar un actuador según datos de un sensor?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RM-C3-N2",
    "nivel": "Medio",
    "sub_nivel": "N2",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Lógica de votación estudiantil en JavaScript",
    "descripcion": "Completa la lógica de registro y visualización de votos mediante almacenamiento local en JavaScript.",
    "criterios": [
      "1. Recupera correctamente los datos almacenados.",
      "2. Utiliza estructuras adecuadas para procesar y mostrar los votos.",
      "3. Evita registros duplicados.",
      "4. Ejecuta el código correctamente."
    ],
    "recursos": "Editor interactivo de código por bloques para JavaScript y simulación web",
    "tiempo_estimado": "30",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces el almacenamiento local en JavaScript?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de implementar una lógica para evitar registros duplicados en una aplicación web?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RM-C3-N3",
    "nivel": "Medio",
    "sub_nivel": "N3",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Clasificador de residuos con Python",
    "descripcion": "Completa el programa para clasificar residuos según su material y manejar entradas no válidas.",
    "criterios": [
      "1. Completa correctamente los atributos.",
      "2. Aplica condiciones según el material.",
      "3. Maneja entradas no válidas.",
      "4. Ejecuta el programa sin errores."
    ],
    "recursos": "Tablero interactivo de código por bloques para Python con consola de ejecución",
    "tiempo_estimado": "30",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces la programación orientada a objetos y el manejo de errores en Python?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de manejar entradas no válidas mediante excepciones en Python?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RM-C4-N1",
    "nivel": "Medio",
    "sub_nivel": "N1",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Reflexión sobre tu huella digital personal",
    "descripcion": "Reflexiona sobre tu huella digital, los riesgos de privacidad y las medidas para proteger tus datos.",
    "criterios": [
      "1. Identifica su huella digital.",
      "2. Reconoce riesgos de privacidad.",
      "3. Propone tres medidas de protección.",
      "4. Presenta una reflexión clara y coherente."
    ],
    "recursos": "Herramienta: Google My Activity · privacy.google.com<br>Guía de seguridad digital (proporcionada)",
    "tiempo_estimado": "50",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces los datos que generas y compartes en internet?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de aplicar medidas para proteger tu información digital?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RM-C4-N2",
    "nivel": "Medio",
    "sub_nivel": "N2",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Debate: ¿debe el Estado colombiano regular la IA?",
    "descripcion": "Construye una postura argumentada sobre la regulación de la IA en Colombia, sustentada en evidencia y ejemplos internacionales.",
    "criterios": [
      "1. Presenta una postura clara.",
      "2. Sustenta los argumentos con evidencia.",
      "3. Reconoce referentes internacionales.",
      "4. Relaciona el análisis con el contexto colombiano.",
      "5. Redacta de forma coherente."
    ],
    "recursos": "EU AI Act summary · OCDE AI Policy · MinTIC Colombia<br>Formato de debate (proporcionado)",
    "tiempo_estimado": "55",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces el debate sobre la regulación de la IA?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de construir una postura argumentada sobre la regulación de la IA?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RM-C4-N3",
    "nivel": "Medio",
    "sub_nivel": "N3",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Diseña una política de uso de IA en tu institución",
    "descripcion": "Diseña una política institucional para regular el uso ético de la IA en el aula.",
    "criterios": [
      "1. Define un propósito claro.",
      "2. Establece normas justificadas.",
      "3. Considera derechos y responsabilidades.",
      "4. Define consecuencias coherentes.",
      "5. Presenta una política clara y aplicable."
    ],
    "recursos": "Políticas de referencia: UNESCO AI in Education · Stanford HAI · U. Nacional Colombia<br>Formato institucional (proporcionado)",
    "tiempo_estimado": "65",
    "jol_esp_1": {
      "pregunta": "¿Qué tan capaz eres de diseñar una política institucional para el uso de IA?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de equilibrar derechos, responsabilidades y normas para el uso de IA?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RA-C1-N1",
    "nivel": "Avanzado",
    "sub_nivel": "N1",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "Desmantelamiento virtual de un Smartphone",
    "descripcion": "Explora los componentes de un smartphone mediante un desmontaje virtual y analiza aspectos técnicos, ambientales y éticos.",
    "criterios": [
      "1. Identifica los componentes principales.",
      "2. Comprende su función.",
      "3. Analiza aspectos de sostenibilidad y cadena de suministro.",
      "4. Responde correctamente el cuestionario."
    ],
    "recursos": "Simulador interactivo en 3D de desmontaje de celular incorporado",
    "tiempo_estimado": "40",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces los componentes y el funcionamiento de un smartphone?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué conocimientos previos utilizaste para resolver la actividad?",
      "escala": "Texto libre"
    }
  },
  {
    "id": "RA-C1-N2",
    "nivel": "Avanzado",
    "sub_nivel": "N2",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "Análisis comparativo de paradigmas de programación en Python",
    "descripcion": "Implementa la misma solución en Python mediante los paradigmas imperativo, orientado a objetos y funcional.",
    "criterios": [
      "1. Completa correctamente cada implementación.",
      "2. Aplica los principios de cada paradigma.",
      "3. Obtiene el resultado esperado en los tres casos."
    ],
    "recursos": "Editor interactivo de código IDE para Python y terminal de salida",
    "tiempo_estimado": "35",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces los paradigmas de programación en Python?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de diferenciar y aplicar los paradigmas de programación trabajados?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RA-C1-N3",
    "nivel": "Avanzado",
    "sub_nivel": "N3",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "Ensayo crítico sobre patentes de tecnología emergente",
    "descripcion": "Analiza una patente o tecnología emergente y argumenta su posible impacto social y económico en Colombia.",
    "criterios": [
      "1. Identifica la tecnología o patente.",
      "2. Explica su funcionamiento.",
      "3. Relaciona la tecnología con Colombia.",
      "4. Argumenta su impacto social y económico.",
      "5. Presenta un análisis claro y coherente."
    ],
    "recursos": "USPTO.gov, WIPO.int, SIC Colombia (patentes nacionales).\n\n---",
    "tiempo_estimado": "80",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces sobre patentes y tecnologías emergentes?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de analizar el impacto de una tecnología en el contexto colombiano?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RA-C2-N1",
    "nivel": "Avanzado",
    "sub_nivel": "N1",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "API REST para el sistema de notas del colegio",
    "descripcion": "Completa una API REST para consultar y registrar notas mediante los métodos GET y POST.",
    "criterios": [
      "1. Implementa correctamente GET y POST.",
      "2. Genera respuestas JSON válidas.",
      "3. Maneja correctamente el error 404.",
      "4. Ejecuta la API sin errores."
    ],
    "recursos": "Python 3.x, FastAPI o Flask, Postman (gratuito) / Insomnia / cURL.\n\n---",
    "tiempo_estimado": "80",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces el desarrollo de APIs REST?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de implementar rutas y manejo de errores en una API REST?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RA-C2-N2",
    "nivel": "Avanzado",
    "sub_nivel": "N2",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Dashboard interactivo de matrícula escolar",
    "descripcion": "Completa un dashboard para analizar datos de matrícula mediante Pandas y gráficos interactivos.",
    "criterios": [
      "1. Carga correctamente los datos.",
      "2. Calcula estadísticas descriptivas.",
      "3. Configura gráficos interactivos.",
      "4. Aplica correctamente los filtros."
    ],
    "recursos": "datos.gov.co, Python (Pandas, Plotly, Dash) / Power BI Desktop / Tableau. Tutorial Dash básico (proporcionado).\n\n---",
    "tiempo_estimado": "90",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces el análisis y visualización de datos con Python?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de analizar y visualizar datos mediante herramientas de programación?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RA-C2-N3",
    "nivel": "Avanzado",
    "sub_nivel": "N3",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Chatbot de orientación vocacional para el colegio",
    "descripcion": "Completa el flujo de un chatbot que recopila respuestas, recomienda opciones académicas y guarda la sesión.",
    "criterios": [
      "1. Organiza correctamente el flujo.",
      "2. Captura las respuestas.",
      "3. Genera recomendaciones según los datos.",
      "4. Guarda la sesión en formato JSON."
    ],
    "recursos": "Python 3.x, JSON, SNIES (datos de universidades colombianas), Diagrama de flujo del chatbot (creado por el joven antes de código).\n\n---",
    "tiempo_estimado": "100",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces la programación de chatbots?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de estructurar un chatbot con entrada de datos, recomendaciones y almacenamiento?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RA-C3-N1",
    "nivel": "Avanzado",
    "sub_nivel": "N1",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Sistema de monitoreo para huerta escolar con Arduino",
    "descripcion": "Configura y simula un sistema de monitoreo para una huerta escolar mediante Arduino, sensores y actuadores.",
    "criterios": [
      "1. Verifica las conexiones del circuito.",
      "2. Utiliza correctamente las lecturas del sensor.",
      "3. Implementa la lógica de control de la bomba.",
      "4. Registra los datos en formato CSV.",
      "5. Ejecuta correctamente la simulación."
    ],
    "recursos": "Guía interactiva de Arduino C++, diagramas de circuitos de MetaPathFinder, simulación de sensores integrada.\n\n---",
    "tiempo_estimado": "80",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces Arduino, sensores y actuadores?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué conocimientos previos aplicaste para resolver la actividad?",
      "escala": "Texto libre"
    }
  },
  {
    "id": "RA-C3-N2",
    "nivel": "Avanzado",
    "sub_nivel": "N2",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Modelo de Machine Learning para predecir deserción escolar",
    "descripcion": "Completa un modelo de Machine Learning para analizar datos y predecir la deserción escolar.",
    "criterios": [
      "1. Preprocesa correctamente los datos.",
      "2. Divide adecuadamente el conjunto de datos.",
      "3. Entrena el árbol de decisión.",
      "4. Interpreta las métricas obtenidas."
    ],
    "recursos": "Python (Pandas, Scikit-learn, Matplotlib, Seaborn), Dataset (proporcionado), Jupyter Notebook o Colab.\n\n---",
    "tiempo_estimado": "90",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces el proceso básico de creación de un modelo de Machine Learning?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de construir y evaluar un modelo básico de Machine Learning?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RA-C3-N3",
    "nivel": "Avanzado",
    "sub_nivel": "N3",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Lógica de App de primeros auxilios",
    "descripcion": "Completa la lógica de una aplicación de primeros auxilios con navegación, GPS y botón de emergencia.",
    "criterios": [
      "1. Configura correctamente la navegación.",
      "2. Integra la ubicación mediante GPS.",
      "3. Implementa el botón de emergencia.",
      "4. Ejecuta el flujo sin errores."
    ],
    "recursos": "MIT App Inventor 2 / Thunkable / Kodular, Google Maps API (gratuita con límites), 123 Colombia.\n\n---",
    "tiempo_estimado": "100",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces el desarrollo de aplicaciones con GPS y funciones de emergencia?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de integrar diferentes funciones en una aplicación para resolver una necesidad?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RA-C4-N1",
    "nivel": "Avanzado",
    "sub_nivel": "N1",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Diagnóstico de lectura crítica: sesgo algorítmico y grupos vulnerables",
    "descripcion": "Analiza un texto sobre sesgo algorítmico y responde cuatro preguntas de lectura crítica.",
    "criterios": [
      "1. Comprende las causas del sesgo algorítmico.",
      "2. Identifica sus efectos en grupos vulnerables.",
      "3. Analiza las implicaciones éticas y sociales.",
      "4. Responde correctamente las preguntas."
    ],
    "recursos": "Fuentes de lectura crítica: Safiya Noble, Buolamwini & Gebru, ProPublica, The Markup, AI Now Institute.",
    "tiempo_estimado": "70",
    "jol_esp_1": {
      "pregunta": "¿Qué tan capaz eres de analizar textos sobre sesgo algorítmico?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tanto comprendes las implicaciones éticas y sociales de los sesgos algorítmicos?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RA-C4-N2",
    "nivel": "Avanzado",
    "sub_nivel": "N2",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Diagnóstico de lectura crítica: startups de impacto social en Colombia",
    "descripcion": "Analiza un texto sobre innovación social y responde cuatro preguntas de lectura crítica.",
    "criterios": [
      "1. Identifica propuestas de valor social.",
      "2. Comprende la relación entre impacto y sostenibilidad.",
      "3. Analiza estrategias de emprendimiento social.",
      "4. Interpreta el mercado objetivo."
    ],
    "recursos": "Fuentes de lectura crítica: CONPES 3975 de Colombia, Hubs de Innovación Social en Medellín, Guías de Sistema B.",
    "tiempo_estimado": "80",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces la innovación social y los negocios de impacto?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan capaz eres de analizar modelos de negocio con impacto social?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  },
  {
    "id": "RA-C4-N3",
    "nivel": "Avanzado",
    "sub_nivel": "N3",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Diagnóstico de lectura crítica: investigación cualitativa e impacto comunitario",
    "descripcion": "Analiza un texto sobre investigación cualitativa y responde cuatro preguntas de lectura crítica.",
    "criterios": [
      "1. Identifica preguntas inducidas.",
      "2. Comprende la saturación teórica.",
      "3. Analiza la triangulación de información.",
      "4. Reconoce principios éticos de investigación."
    ],
    "recursos": "Fuentes de lectura crítica: Metodología de la Investigación Social cualitativa, Principios de Consentimiento Informado.",
    "tiempo_estimado": "100",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto conoces la metodología cualitativa y la ética de investigación?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tanto comprendes los principios metodológicos y éticos de la investigación cualitativa?",
      "escala": "1 = Nada · 2 = Poco · 3 = Regular · 4 = Bastante · 5 = Mucho"
    }
  }
];
