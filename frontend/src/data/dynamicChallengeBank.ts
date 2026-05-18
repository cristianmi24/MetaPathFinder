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
    "titulo": "La línea del tiempo tecnológica de mi colegio",
    "descripcion": "Tu colegio quiere crear una exhibición sobre cómo la tecnología ha cambiado la vida escolar. Debes identificar al menos 5 artefactos o sistemas tecnológicos que han transformado la educación en los últimos 50 años (ej. tablero, retroproyector, computador, tablet) y construir una línea del tiempo ordenada cronológicamente, explicando para cada uno qué problema resolvía y qué lo reemplazó.",
    "criterios": [
      "1. Identifica 5+ artefactos con fecha aproximada.",
      "2. Explica qué problema resolvía cada uno.",
      "3. Señala la evolución (qué reemplazó a qué).",
      "4. Presenta la línea ordenada correctamente."
    ],
    "recursos": "Línea de tiempo en papel / herramienta digital (Canva, Google Slides)<br>Fuentes: internet, entrevistas a docentes",
    "tiempo_estimado": "20",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto sabes sobre la historia de la tecnología en la educación colombiana? Marca tu nivel.",
      "escala": "1=Nada · 2=Algo · 3=Bastante · 4=Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Podrías explicarle a un compañero por qué los artefactos tecnológicos evolucionan con el tiempo? (1=no podría · 5=lo explico con ejemplos propios)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RB-C1-N2",
    "nivel": "Básico",
    "sub_nivel": "N2",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "¿Qué tiene de tecnológico mi barrio?",
    "descripcion": "Camina por tu barrio o comunidad y registra (con fotos o dibujos) al menos 6 sistemas tecnológicos que encuentres: infraestructura de agua, electricidad, telecomunicaciones, transporte, construcción. Para cada uno, describe: (a) cuál es su función, (b) qué materiales o conocimientos técnicos requirió y (c) cómo ha mejorado la calidad de vida. Presenta tus hallazgos en un informe de una página con imágenes.",
    "criterios": [
      "1. Identifica 6+ sistemas tecnológicos reales.",
      "2. Describe función, materiales y conocimientos para cada uno.",
      "3. Argumenta el impacto en la calidad de vida.",
      "4. Informe coherente con imágenes o dibujos."
    ],
    "recursos": "Cámara o celular, libreta de campo<br>Formato de informe sencillo",
    "tiempo_estimado": "30",
    "jol_esp_1": {
      "pregunta": "¿Qué tan capaz eres de identificar y clasificar sistemas tecnológicos en entornos cotidianos? (1=no sé cómo · 5=lo hago con facilidad)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Cuánto sabes sobre los materiales y procesos que requiere la construcción de infraestructura tecnológica (agua, luz, red)?",
      "escala": "1=Muy poco · 5=Mucho"
    }
  },
  {
    "id": "RB-C1-N3",
    "nivel": "Básico",
    "sub_nivel": "N3",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "Relaciona situaciones con tecnologías antiguas y modernas",
    "descripcion": "Lee 4 situaciones cotidianas y asocia para cada una la tecnología antigua y la moderna que resolvió ese problema. Coloca cada par de tecnologías en la situación correcta y reflexiona sobre cómo cambió la solución con el tiempo.",
    "criterios": [
      "1. Reconoce 4 situaciones tecnológicas reales.",
      "2. Empareja correctamente la tecnología antigua para cada situación.",
      "3. Empareja correctamente la tecnología moderna para cada situación.",
      "4. Identifica el problema que cada tecnología resolvió.",
      "5. Presenta conexiones claras entre situación y tecnología."
    ],
    "recursos": "Tarjetas de situaciones y tecnologías (físicas o digitales)<br>Espacio para escribir breves explicaciones",
    "tiempo_estimado": "25",
    "jol_esp_1": {
      "pregunta": "¿Qué tan bien identificas qué problemas resolvieron las tecnologías antiguas y modernas? (1=Muy difícil · 5=Muy fácil)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan claro tienes el contraste entre una tecnología antigua y una moderna en términos de la solución ofrecida?",
      "escala": "1=Muy poco claro · 5=Muy claro"
    }
  },
  {
    "id": "RB-C2-N1",
    "nivel": "Básico",
    "sub_nivel": "N1",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Ordena archivos en Drive por fecha con arrastrar y soltar",
    "descripcion": "Tienes una vista simulada de Google Drive con 10 archivos desordenados. Tu misión es ordenar los archivos desde el más antiguo hasta el más reciente usando arrastrar y soltar. Después, revisa tu orden y comprueba si todos los archivos están en la secuencia correcta.",
    "criterios": [
      "1. Ordena los archivos correctamente por fecha, del más antiguo al más reciente.",
      "2. Usa arrastrar y soltar para reordenar cada fila sin errores.",
      "3. Identifica con precisión el archivo más antiguo y el más reciente.",
      "4. Revisa el resultado y corrige antes de entregar."
    ],
    "recursos": "Simulación de Google Drive en la pantalla<br>Archivos digitales desordenados para ordenar",
    "tiempo_estimado": "12",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro te sientes usando arrastrar y soltar archivos digitales en una carpeta compartida? (1=Muy inseguro · 5=Muy seguro)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Con qué facilidad puedes reconocer cuál archivo es más antiguo cuando miras solo la fecha y lo ordenas?",
      "escala": "Difícil · Regular · Fácil"
    }
  },
  {
    "id": "RB-C2-N2",
    "nivel": "Básico",
    "sub_nivel": "N2",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Ordena el plan de acción para una presentación de videollamada",
    "descripcion": "Arrastra los pasos del plan de acción para preparar una presentación que explique a un adulto mayor cómo usar una app de videollamadas. Ordena la secuencia desde elegir la aplicación hasta revisar el lenguaje sencillo.",
    "criterios": [
      "1. Secuencia lógica del plan de acción.",
      "2. Incluye selección de la app, preparación de material, configuración y cierre de la llamada.",
      "3. El orden facilita explicar el proceso a una persona sin experiencia tecnológica.",
      "4. Revisión final para asegurar que el lenguaje sea claro y sencillo."
    ],
    "recursos": "Lista de pasos posibles para preparar la presentación<br>Ejemplos de instrucciones claras y accesibles",
    "tiempo_estimado": "15",
    "jol_esp_1": {
      "pregunta": "¿Qué tan claro puedes planear una secuencia de trabajo para explicar tecnología a alguien mayor? (1=Muy confuso · 5=Muy claro)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan seguro te sientes organizando los pasos antes de crear contenido digital?",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RB-C2-N3",
    "nivel": "Básico",
    "sub_nivel": "N3",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Ordena las fórmulas del presupuesto escolar",
    "descripcion": "Arrastra las fórmulas y operaciones necesarias para resolver el presupuesto de un evento escolar. Debes ordenar desde la suma de gastos hasta la validación final del saldo frente al tope de $150.000 COP.",
    "criterios": [
      "1. Ordena correctamente las operaciones necesarias para el presupuesto.",
      "2. Incluye la suma de gastos, la suma de ingresos, el cálculo de saldo y la comparación con el presupuesto máximo.",
      "3. El orden refleja el uso lógico de fórmulas en una hoja de cálculo.",
      "4. Revisa el resultado antes de entregar."
    ],
    "recursos": "Lista de operaciones y fórmulas usadas en presupuestos<br>Ejemplos de cálculos con hojas de cálculo",
    "tiempo_estimado": "18",
    "jol_esp_1": {
      "pregunta": "¿Qué tan claro entiendes qué operaciones necesitas para resolver un presupuesto en una hoja de cálculo? (1=Muy confuso · 5=Muy claro)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes identificar cuándo usar suma, resta y comparación para validar un presupuesto?",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RB-C3-N1",
    "nivel": "Básico",
    "sub_nivel": "N1",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Instrucciones para hacer un sándwich (algoritmo cotidiano)",
    "descripcion": "El pensamiento algorítmico comienza con actividades cotidianas. Ordena los pasos lógicos arrastrando los bloques para preparar un sándwich de jamón y queso, como si se lo explicaras a un robot que no sabe nada de cocina. Revisa bien la secuencia para que tenga sentido.",
    "criterios": [
      "1. Ordena los pasos correctamente en la secuencia lógica.",
      "2. Usa arrastrar y soltar para posicionar los bloques.",
      "3. Verifica que el orden sea funcional y no tenga errores.",
      "4. Reflexiona sobre la importancia del orden en un algoritmo."
    ],
    "recursos": "Tablero interactivo de arrastrar y soltar",
    "tiempo_estimado": "10",
    "jol_esp_1": {
      "pregunta": "¿Qué tan fácil te resulta identificar el orden lógico de una tarea cotidiana para enseñársela a un robot? (1=Muy difícil · 5=Muy fácil)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Comprendes la importancia de que un algoritmo tenga pasos ordenados de principio a fin sin saltarse nada?",
      "escala": "1=Muy poco · 5=Mucho"
    }
  },
  {
    "id": "RB-C3-N2",
    "nivel": "Básico",
    "sub_nivel": "N2",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Simulador de asistencia: ordena los bloques",
    "descripcion": "En este simulador tipo Scratch, tienes los bloques desordenados de un programa que pasa lista de asistencia automáticamente. Tu objetivo es arrastrarlos al orden correcto de principio a fin y luego ejecutar el programa. ¡Cuidado! Solo tienes 1 intento para hacerlo funcionar correctamente.",
    "criterios": [
      "1. Ordena todos los bloques en una secuencia lógica (de Inicio a Fin).",
      "2. Identifica correctamente la inicialización, el ciclo y la validación.",
      "3. Ejecuta el programa y verifica que se haya pasado lista correctamente.",
      "4. Completa el reto en el primer y único intento disponible."
    ],
    "recursos": "Simulador de bloques interactivo",
    "tiempo_estimado": "15",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro/a estás de poder ordenar visualmente la lógica de un bucle (repetir) usando bloques? (1=muy inseguro · 5=muy seguro)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Comprendes la importancia de inicializar datos (como cargar una lista) antes de ejecutar un ciclo repetitivo?",
      "escala": "1=No lo entiendo · 5=Lo entiendo perfectamente"
    }
  },
  {
    "id": "RB-C3-N3",
    "nivel": "Básico",
    "sub_nivel": "N3",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Ordena el flujo del sistema de préstamo de libros",
    "descripcion": "La biblioteca de tu colegio quiere digitalizar su sistema de préstamo. Ordena los pasos del diagrama de flujo de este sistema utilizando arrastrar y soltar. Asegúrate de colocar en secuencia lógica desde el registro del estudiante y el libro hasta la generación del reporte final.",
    "criterios": [
      "1. Identifica el orden lógico del proceso de la biblioteca.",
      "2. Ordena los pasos secuencialmente desde el inicio hasta el fin.",
      "3. Usa la herramienta de arrastrar y soltar correctamente.",
      "4. Valida que el flujo permita prestar y devolver libros."
    ],
    "recursos": "Tablero interactivo de arrastrar y soltar",
    "tiempo_estimado": "15",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro te sientes ordenando los pasos de un sistema complejo (como una biblioteca) usando bloques lógicos? (1=Muy inseguro · 5=Muy seguro)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Entiendes por qué verificar la disponibilidad del libro debe ir antes de registrar el préstamo?",
      "escala": "1=No lo entiendo · 5=Lo entiendo perfectamente"
    }
  },
  {
    "id": "RB-C4-N1",
    "nivel": "Básico",
    "sub_nivel": "N1",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Análisis Digital: Conectividad en el Hogar",
    "descripcion": "Lee atentamente los dos artículos sobre la realidad de la conexión a internet en el país y el concepto de 'exclusión digital'. Luego, responde a la trivia de comprensión directa para evaluar tu entendimiento de la brecha digital y sus posibles soluciones.",
    "criterios": [
      "1. Lee y comprende los artículos presentados.",
      "2. Responde correctamente a las preguntas de la trivia.",
      "3. Identifica datos clave y soluciones viables.",
      "4. Reflexiona sobre el concepto de exclusión digital."
    ],
    "recursos": "Cuestionario de lectura interactivo",
    "tiempo_estimado": "10",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro/a te sientes de poder identificar los datos más importantes en un artículo sobre tecnología y sociedad? (1=muy inseguro · 5=muy seguro)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Comprendes claramente el concepto de 'exclusión digital' y cómo afecta a las oportunidades educativas y laborales?",
      "escala": "1=No lo entiendo · 5=Lo entiendo perfectamente"
    }
  },
  {
    "id": "RB-C4-N2",
    "nivel": "Básico",
    "sub_nivel": "N2",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Análisis Digital: Redes Sociales y Bienestar",
    "descripcion": "Lee atentamente los artículos sobre las consecuencias del uso prolongado de las redes sociales y su impacto emocional. Luego, responde a la trivia de comprensión directa para analizar críticamente la relación entre el tiempo en pantalla y tu bienestar, identificando estrategias para un uso saludable.",
    "criterios": [
      "1. Lee y comprende los artículos presentados.",
      "2. Responde correctamente a las preguntas de la trivia.",
      "3. Identifica los efectos de la exclusión o sobreexposición digital.",
      "4. Reconoce estrategias para un uso más saludable."
    ],
    "recursos": "Cuestionario de lectura interactivo",
    "tiempo_estimado": "10",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro/a te sientes analizando críticamente el impacto emocional que tiene la tecnología en tu vida diaria? (1=muy inseguro · 5=muy seguro)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Comprendes la importancia de establecer límites de tiempo y uso consciente en las redes sociales?",
      "escala": "1=No lo entiendo · 5=Lo entiendo perfectamente"
    }
  },
  {
    "id": "RB-C4-N3",
    "nivel": "Básico",
    "sub_nivel": "N3",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Plan de acción: Alfabetización Digital en la Comunidad",
    "descripcion": "En tu barrio hay un problema crítico de alfabetización digital: muchos adultos mayores no saben usar un teléfono inteligente para comunicarse o pedir citas médicas. Tu reto es organizar un plan de acción para solucionar este problema. Ordena los pasos arrastrando los bloques en una secuencia lógica de inicio a fin.",
    "criterios": [
      "1. Comprende la situación problema de alfabetización digital.",
      "2. Ordena lógicamente los pasos desde el censo hasta la evaluación.",
      "3. Demuestra capacidad para estructurar un plan de acción comunitario.",
      "4. Completa el reto usando la interfaz de arrastrar y soltar."
    ],
    "recursos": "Tablero interactivo de arrastrar y soltar",
    "tiempo_estimado": "10",
    "jol_esp_1": {
      "pregunta": "¿Qué tan fácil te resulta estructurar un plan paso a paso para enseñar habilidades digitales a otras personas? (1=Muy difícil · 5=Muy fácil)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Entiendes por qué es necesario conocer primero a tu población (censo) antes de organizar los talleres?",
      "escala": "1=No lo entiendo · 5=Lo entiendo perfectamente"
    }
  },
  {
    "id": "RM-C1-N1",
    "nivel": "Medio",
    "sub_nivel": "N1",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "Anatomía de un smartphone: Partes del Celular",
    "descripcion": "En este módulo interactivo, aprenderás sobre cada componente interno de un smartphone moderno (Batería, Pantalla, Procesador, RAM, Antena, Cámara, Altavoz). Repasa sus funciones principales y datos curiosos, y luego pon a prueba tu comprensión con una breve evaluación para completar el reto.",
    "criterios": [
      "1. Explora y comprende los 7 componentes del smartphone.",
      "2. Identifica la función de la batería, pantalla y procesador.",
      "3. Relaciona el rol de la RAM y las antenas.",
      "4. Responde correctamente la evaluación final."
    ],
    "recursos": "Módulo de evaluación interactiva",
    "tiempo_estimado": "5",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro/a te sientes de identificar la función de cada componente interno de un celular? (1=muy inseguro · 5=muy seguro)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Comprendes la diferencia de funciones entre la memoria RAM y el procesador de un dispositivo móvil?",
      "escala": "1=No lo entiendo · 5=Lo entiendo perfectamente"
    }
  },
  {
    "id": "RM-C1-N2",
    "nivel": "Medio",
    "sub_nivel": "N2",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "De la calculadora mecánica al procesador cuántico",
    "descripcion": "Investiga la evolución del cómputo desde la calculadora mecánica de Pascal (1642) hasta los procesadores cuánticos actuales. Identifica al menos 6 hitos tecnológicos, explica para cada uno: (a) el avance técnico que representó, (b) quién lo desarrolló y en qué contexto social/histórico, (c) qué limitación superó y cuál nueva impuso. Concluye con una reflexión: ¿qué patrón ves en la evolución tecnológica? ¿Aplica la Ley de Moore?",
    "criterios": [
      "1. 6+ hitos ordenados cronológicamente.",
      "2. Análisis técnico, histórico y social de cada uno.",
      "3. Discusión sobre limitaciones.",
      "4. Reflexión sobre la Ley de Moore fundamentada.",
      "5. Fuentes académicas o técnicas."
    ],
    "recursos": "Línea de tiempo digital (Timeline JS o similar)<br>Fuente base: Computer History Museum · ACM Digital Library",
    "tiempo_estimado": "55",
    "jol_esp_1": {
      "pregunta": "¿Qué tan bien conoces la historia de la computación desde sus inicios mecánicos hasta los procesadores actuales? (1=casi nada · 5=la manejo con profundidad)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes aplicar conceptos como la Ley de Moore a un análisis histórico real y discutir sus limitaciones actuales? (1=no la conozco · 5=la aplico y critico con argumentos)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RM-C1-N3",
    "nivel": "Medio",
    "sub_nivel": "N3",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "Prospectiva tecnológica: ¿cómo será la educación en 2040?",
    "descripcion": "Basándote en tendencias tecnológicas actuales (IA generativa, realidad aumentada, computación en la nube, biometría, blockchain educativo), escribe un artículo corto con estructura de introducción, desarrollo y conclusión sobre cómo podría ser una clase de tecnología e informática en el año 2040 en Colombia. Debes mencionar al menos 4 tecnologías, argumentar por qué estarán disponibles en Colombia, qué problemas resolverán y qué nuevas inequidades podrían generar. El artículo debe tener mínimo 50 palabras, usar conectores de desarrollo e incluir una conclusión.",
    "criterios": [
      "1. Artículo con introducción, desarrollo y conclusión.",
      "2. Mínimo 4 tecnologías prospectadas con fundamento.",
      "3. Uso de conectores (además, porque, sin embargo, etc.).",
      "4. Argumentación de disponibilidad en Colombia.",
      "5. Análisis de impactos positivos y de inequidad."
    ],
    "recursos": "Fuentes prospectivas: WEF Future of Jobs · UNESCO 2040 · CEPAL Colombia digital",
    "tiempo_estimado": "30",
    "jol_esp_1": {
      "pregunta": "¿Qué tan preparado/a estás para analizar tendencias tecnológicas actuales y proyectarlas a futuro con argumentos? (1=no sé cómo hacerlo · 5=lo hago con rigor)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes argumentar por qué una tecnología emergente global podría o no estar disponible en el contexto colombiano en el mediano plazo? (1=nunca lo he pensado · 5=tengo argumentos sólidos)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RM-C2-N1",
    "nivel": "Medio",
    "sub_nivel": "N1",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Ordena la macro de calificaciones",
    "descripcion": "Tienes una hoja de cálculo con 20 estudiantes de 5 grupos y sus notas. Tu tarea es ordenar correctamente los bloques de una macro de VBA/Apps Script que calcula promedios, resalta notas reprobadas y genera estadísticas. Arrastra los bloques en la secuencia lógica correcta — ¡cuidado con los distractores! Si aciertas el orden, la macro se ejecutará automáticamente y verás los resultados.",
    "criterios": [
      "1. Identifica la secuencia lógica correcta de una macro de automatización.",
      "2. Ordena correctamente los 11 pasos de la macro.",
      "3. Reconoce y descarta bloques distractores.",
      "4. Comprende la estructura: declaración, bucle, condicional, finalización.",
      "5. Relaciona cada bloque con su función dentro del flujo de automatización."
    ],
    "recursos": "MiniExcel interactivo con datos de ejemplo<br>Macro blocks para ordenar (drag & drop)",
    "tiempo_estimado": "30",
    "jol_esp_1": {
      "pregunta": "¿Qué tan capaz eres de reconocer la estructura lógica de una macro (declarar, bucle, condicional, finalizar)? (1=No reconozco la estructura · 5=Identifico cada parte con claridad)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Podrías distinguir instrucciones que pertenecen a una macro de calificaciones de aquellas que no? (1=Me confunden fácilmente · 5=Distingo sin problemas)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RM-C2-N2",
    "nivel": "Medio",
    "sub_nivel": "N2",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Diseño de logos con SVG",
    "descripcion": "Aprende los fundamentos del diseño vectorial SVG mientras construyes un logo profesional. El módulo interactivo incluye: (1) anatomía del SVG — contenedor, formas primitivas, agrupaciones y transformaciones; (2) paleta de colores — fill, stroke, opacidad, gradientes con editor en vivo; (3) diseño de logo — capas, texto, ajustes interactivos de color y radio; y (4) evaluación — ordena correctamente los pasos para construir un logo SVG y los pasos para aplicar colores. ¡Completa ambos ejercicios para aprobar!",
    "criterios": [
      "1. Comprende la estructura básica de un SVG: viewBox, formas, <g>.",
      "2. Maneja correctamente fill, stroke, opacidad y gradientes.",
      "3. Construye un logo estructurado en capas (símbolo + texto).",
      "4. Ordena correctamente los 6 pasos de construcción de un logo SVG.",
      "5. Ordena correctamente los 5 pasos para aplicar colores en SVG."
    ],
    "recursos": "Módulo interactivo de diseño SVG embebido<br>Editor de código en vivo con vista previa",
    "tiempo_estimado": "45",
    "jol_esp_1": {
      "pregunta": "¿Qué tan familiarizado estás con SVG (Scalable Vector Graphics) y sus elementos básicos como rect, circle, polygon y path? (1=nunca lo he usado · 5=lo uso con confianza)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Podrías estructurar un logo en capas (fondo, símbolo, texto) y elegir colores con criterio de contraste y armonía? (1=no sabría por dónde empezar · 5=lo hago con fundamentos de diseño)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RM-C2-N3",
    "nivel": "Medio",
    "sub_nivel": "N3",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "SQL por bloques — Total ventas del día",
    "descripcion": "Usa el simulador SQL por bloques para consultar la base de datos de la Tienda Escolar. El flujo es progresivo: (1) Crea las tablas Proveedores, Productos y Ventas; (2) Inserta los datos de ejemplo; (3) Resuelve el reto final: calcula el total de ventas del día 2025-05-17 usando SUM(total), COUNT(*) y SUM(cantidad) con WHERE fecha. Arma los bloques SELECT, FROM y WHERE para obtener los resultados reales.",
    "criterios": [
      "1. Comprende la estructura de CREATE TABLE.",
      "2. Reconoce sentencias INSERT INTO.",
      "3. Arma una consulta SELECT con funciones de agregación (SUM, COUNT).",
      "4. Aplica filtro WHERE con condición de fecha.",
      "5. Obtiene el resultado correcto: 39.200 COP total, 5 ventas, 21 unidades."
    ],
    "recursos": "Simulador SQL por bloques embebido<br>Base de datos simulada: Proveedores (10), Productos (10), Ventas (10)",
    "tiempo_estimado": "30",
    "jol_esp_1": {
      "pregunta": "¿Qué tan claro tienes el proceso de crear tablas, insertar datos y luego consultar en SQL? (1=no distingo las fases · 5=entiendo el flujo completo)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes armar una consulta SELECT con SUM, COUNT y WHERE para obtener un total específico desde una tabla? (1=no sabría cómo · 5=lo hago con confianza)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RM-C3-N1",
    "nivel": "Medio",
    "sub_nivel": "N1",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Desafío Arduino — Ordena los bloques",
    "descripcion": "Arma el programa de Arduino ordenando los bloques de código en las zonas correctas: Setup (configurar pines e iniciar monitor serial) y Loop (leer temperatura, mostrar en serial, decidir LED rojo/verde, esperar 2s). Cuando el código esté correcto, podrás simular el sensor TMP36 con un deslizador y ver los LEDs y el monitor serial funcionando en tiempo real.",
    "criterios": [
      "1. Coloca los 3 bloques de configuración en Setup (pines 12, 13 y serial).",
      "2. Ordena correctamente los 6 bloques del Loop.",
      "3. Comprende la lógica: leer sensor → mostrar → evaluar → actuar → esperar.",
      "4. Verifica el funcionamiento con la simulación (LEDs y serial).",
      "5. Identifica la estructura de un programa Arduino: setup() y loop()."
    ],
    "recursos": "Simulador Arduino interactivo embebido con bloques drag & drop.<br>Sensor TMP36 simulado con control deslizante.",
    "tiempo_estimado": "30",
    "jol_esp_1": {
      "pregunta": "¿Qué tan claro tienes el flujo de un programa Arduino: primero configuración en setup() y luego el ciclo repetitivo en loop()? (1=no lo entiendo · 5=lo explico sin problema)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes identificar la secuencia lógica correcta para leer un sensor, evaluar una condición y actuar sobre actuadores? (1=me cuesta · 5=lo ordeno con facilidad)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RM-C3-N2",
    "nivel": "Medio",
    "sub_nivel": "N2",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Aplicación web de votación estudiantil",
    "descripcion": "Diseña e implementa una aplicación web sencilla para la votación del personero estudiantil. Debe tener: una página de inicio con los candidatos (nombre + foto + propuesta breve), un botón de votar por candidato, un mecanismo para evitar votos dobles (al menos por sesión del navegador), y una página de resultados que muestre el conteo en tiempo real. Usa HTML, CSS y JavaScript básico.",
    "criterios": [
      "1. Interfaz con mínimo 3 candidatos.",
      "2. Botón de votación funcional.",
      "3. Prevención de voto doble (localStorage o similar).",
      "4. Página de resultados con conteo correcto.",
      "5. Diseño responsive (funciona en celular)."
    ],
    "recursos": "Editor de código: VS Code / CodePen / Replit<br>Referencia: MDN Web Docs · W3Schools",
    "tiempo_estimado": "65",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro/a estás de construir una aplicación web interactiva con HTML, CSS y JavaScript que incluya lógica (condicionales, eventos)? (1=nunca he programado web · 5=lo hago con confianza)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes diseñar la lógica para prevenir acciones duplicadas en una aplicación web (como votos dobles) usando almacenamiento del navegador? (1=no lo conozco · 5=lo implemento sin ayuda)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RM-C3-N3",
    "nivel": "Medio",
    "sub_nivel": "N3",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Sistema de clasificación de residuos con lógica de sensores",
    "descripcion": "Diseña en Python un sistema que simule la clasificación automática de residuos en una planta de reciclaje. El sistema recibe como entrada: el peso del objeto (gramos), su material (string: “plástico”, “vidrio”, “papel”, “orgánico”, “metal”) y su tamaño (pequeño/mediano/grande). Con base en estos datos, debe: clasificarlo en la banda correcta (4 bandas), calcular el porcentaje de ocupación de cada banda, manejar errores de entrada inválida, y generar un reporte al final.",
    "criterios": [
      "1. Clases definidas para Objeto y Clasificador.",
      "2. Lógica de clasificación correcta para los 5 materiales.",
      "3. Cálculo de porcentaje de ocupación.",
      "4. Manejo de excepciones para entradas inválidas.",
      "5. Reporte final generado.",
      "6. Código con docstrings."
    ],
    "recursos": "Python 3.x (IDLE / Replit / VS Code)<br>Especificaciones de bandas (proporcionadas)",
    "tiempo_estimado": "65",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro/a estás de implementar clases y objetos en Python para modelar un sistema del mundo real con múltiples entidades? (1=no he aprendido POO · 5=lo implemento con confianza)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes diseñar el manejo de excepciones (try/except) en Python para que tu programa responda correctamente a entradas inválidas sin crashear? (1=no lo conozco · 5=lo implemento siempre)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RM-C4-N1",
    "nivel": "Medio",
    "sub_nivel": "N1",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Auditoría de huella digital personal",
    "descripcion": "Realiza una auditoría completa de tu presencia digital: (1) lista todos los servicios y redes donde tienes cuenta, (2) revisa los permisos que has concedido a apps (cámara, micrófono, ubicación, contactos), (3) analiza qué datos podrían estar siendo recopilados sobre ti y con qué fin, (4) aplica al menos 5 medidas de seguridad (contraseña fuerte, 2FA, configuración de privacidad) y documenta el antes y después. Entrega un informe de 1.5 páginas.",
    "criterios": [
      "1. Inventario completo de cuentas y permisos.",
      "2. Análisis de datos recopilados por categoría.",
      "3. Mínimo 5 medidas de seguridad aplicadas.",
      "4. Documentación del antes y después.",
      "5. Informe coherente con recomendaciones."
    ],
    "recursos": "Herramienta: Google My Activity · privacy.google.com<br>Guía de seguridad digital (proporcionada)",
    "tiempo_estimado": "50",
    "jol_esp_1": {
      "pregunta": "¿Qué tan consciente eres de tu huella digital (qué datos generas, dónde están y quién los usa)? (1=nunca lo he pensado · 5=lo monitoreo activamente)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes identificar y aplicar medidas de seguridad digital (contraseñas seguras, 2FA, permisos de apps) de forma autónoma? (1=no sé cómo · 5=lo hago sistemáticamente)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RM-C4-N2",
    "nivel": "Medio",
    "sub_nivel": "N2",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Debate: ¿debe el Estado colombiano regular la IA?",
    "descripcion": "Prepara una postura argumentada (a favor o en contra de la regulación estatal de la IA en Colombia) con mínimo 4 argumentos respaldados por evidencia. Debe incluir: definición de qué tipo de regulación propones o rechazas, ejemplos de regulación en otros países (UE AI Act, EEUU, China), análisis del contexto colombiano (MinTIC, Conpes digital), y consideración del contraargumento más fuerte. Presenta en debate grupal o ensayo de 700 palabras.",
    "criterios": [
      "1. Postura clara y definida.",
      "2. Mínimo 4 argumentos con evidencia.",
      "3. Referencia a regulaciones reales (EU, EEUU o China).",
      "4. Análisis del contexto colombiano.",
      "5. Contraargumento abordado honestamente."
    ],
    "recursos": "EU AI Act summary · OCDE AI Policy · MinTIC Colombia<br>Formato de debate (proporcionado)",
    "tiempo_estimado": "55",
    "jol_esp_1": {
      "pregunta": "¿Qué tan bien conoces el debate actual sobre regulación de la Inteligencia Artificial en el mundo y en Colombia? (1=no lo conozco · 5=puedo argumentar con evidencia)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes construir una postura argumentada sobre política tecnológica, anticipando y respondiendo contraargumentos? (1=no sé debatir con evidencia · 5=lo hago con rigor)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RM-C4-N3",
    "nivel": "Medio",
    "sub_nivel": "N3",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Diseña una política de uso de IA en tu institución",
    "descripcion": "Tu colegio quiere adoptar herramientas de IA (ChatGPT, Copilot, Gemini) en el aula pero no tiene una política clara. Diseña una política institucional de 2 páginas que incluya: propósito y alcance, usos permitidos y prohibidos (con justificación ética), derechos de los estudiantes (privacidad, autoría), responsabilidades del docente, consecuencias del incumplimiento y un mecanismo de revisión anual. Inspírate en políticas reales de universidades o colegios.",
    "criterios": [
      "1. Política completa con 6 secciones mínimas.",
      "2. Justificación ética de prohibiciones.",
      "3. Derechos y responsabilidades diferenciados.",
      "4. Mecanismo de revisión incluido.",
      "5. Lenguaje institucional apropiado.",
      "6. Referencias a políticas reales existentes."
    ],
    "recursos": "Políticas de referencia: UNESCO AI in Education · Stanford HAI · U. Nacional Colombia<br>Formato institucional (proporcionado)",
    "tiempo_estimado": "65",
    "jol_esp_1": {
      "pregunta": "¿Qué tan capaz eres de diseñar un documento de política institucional sobre uso de IA que sea ético, claro y aplicable en un colegio colombiano? (1=nunca he redactado documentos de política · 5=lo hago con criterio)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes identificar y balancear los derechos de los estudiantes (privacidad, autoría) con las responsabilidades institucionales en el uso de herramientas de IA? (1=no los distingo · 5=los argumento con profundidad)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RA-C1-N1",
    "nivel": "Avanzado",
    "sub_nivel": "N1",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "Desmantelamiento virtual de un Smartphone",
    "descripcion": "Ingresa a la estación de desmantelamiento virtual del smartphone. Explora cada uno de los 9 componentes estructurales y electroquímicos del teléfono móvil (como la pantalla, batería, micro, etc.) para analizar detalladamente sus materiales de origen, fabricantes, nivel de toxicidad y pasos de reciclaje. Posteriormente, pon a prueba tus capacidades críticas y de pensamiento sistémico resolviendo una evaluación interactiva sobre sostenibilidad y cadena de suministro tecnológica global.",
    "criterios": [
      "1. Explora interactivamente los 9 componentes de la estructura y hardware del smartphone en la escena 3D explotada.",
      "2. Identifica los materiales clave de los componentes (Indio, Cobalto, Neodimio, etc.) y su nivel de toxicidad.",
      "3. Analiza las implicaciones geopolíticas, éticas y socioambientales del suministro tecnológico global.",
      "4. Responde correctamente las preguntas del cuestionario de pensamiento crítico para aprobar la actividad."
    ],
    "recursos": "Simulador de desmantelamiento de celular y panel interactivo. Cuestionario de pensamiento crítico integrado.",
    "tiempo_estimado": "70",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro te sientes de resolver este reto avanzado?",
      "escala": "1-5"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué conocimientos previos aplicarás aquí?",
      "escala": "Texto libre"
    }
  },
  {
    "id": "RA-C1-N2",
    "nivel": "Avanzado",
    "sub_nivel": "N2",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "Análisis comparativo de paradigmas de programación",
    "descripcion": "Escribe un ensayo o análisis comparativo en el editor de texto integrado donde analices y contrastes tres paradigmas de programación: imperativo (Python), funcional (Haskell/JS) y orientado a objetos (Java/Python). En tu texto debes describir la filosofía central de cada paradigma, explicar con pseudocódigo o lógica cómo resolverías el mismo problema (como filtrar números pares) en cada uno de ellos, y discutir sus ventajas, limitaciones y casos de uso ideales.",
    "criterios": [
      "1. Describe la filosofía central de los paradigmas imperativo, funcional y orientado a objetos.",
      "2. Explica la lógica o pseudocódigo para resolver el mismo problema en los tres paradigmas.",
      "3. Analiza las ventajas y limitaciones de cada enfoque.",
      "4. Concluye identificando los casos de uso idóneos para cada paradigma."
    ],
    "recursos": "Editor de texto integrado en la plataforma. Guías conceptuales sobre paradigmas de programación.",
    "tiempo_estimado": "75",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro te sientes de resolver este reto avanzado?",
      "escala": "1-5"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué conocimientos previos aplicarás aquí?",
      "escala": "Texto libre"
    }
  },
  {
    "id": "RA-C1-N3",
    "nivel": "Avanzado",
    "sub_nivel": "N3",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "Ensayo crítico sobre patentes de tecnología emergente",
    "descripcion": "Escribe un ensayo crítico de mínimo 100 palabras en el editor de texto integrado sobre una patente tecnológica real de los últimos años (relacionada con IA, biotecnología o energías renovables). En tu ensayo, analiza: (a) qué problema resuelve y su innovación; (b) qué conocimientos previos se requirieron; (c) el impacto potencial para la sociedad colombiana; y (d) una reflexión ética sobre si este tipo de tecnologías deben ser de dominio público o estar patentadas.",
    "criterios": [
      "1. Identifica una patente tecnológica real y describe su innovación principal.",
      "2. Analiza los conocimientos previos necesarios para su desarrollo.",
      "3. Argumenta el impacto ético y socioeconómico de la patente en el contexto colombiano.",
      "4. Estructura el escrito con introducción, desarrollo y conclusiones."
    ],
    "recursos": "Editor de texto integrado en la plataforma. Repositorios de patentes sugeridos (WIPO, USPTO).",
    "tiempo_estimado": "80",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro te sientes de resolver este reto avanzado?",
      "escala": "1-5"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué conocimientos previos aplicarás aquí?",
      "escala": "Texto libre"
    }
  },
  {
    "id": "RA-C2-N1",
    "nivel": "Avanzado",
    "sub_nivel": "N1",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Completar API REST para el sistema de notas del colegio",
    "descripcion": "Usa el simulador IDE para completar el código de una API REST básica en Python usando Flask que gestiona las notas escolares. Deberás completar tres partes fundamentales del servidor: el método GET para listar todos los estudiantes en JSON, el método POST para registrar un nuevo estudiante procesando la petición, y la búsqueda de un estudiante específico por ID, incluyendo el control de errores con código HTTP 404 para casos inexistentes.",
    "criterios": [
      "1. Completa la ruta GET /estudiantes usando el método HTTP correcto y la función de respuesta JSON.",
      "2. Completa la ruta POST para crear estudiantes procesando el body y retornando el código HTTP 201.",
      "3. Configura el parámetro dinámico y el código de error 404 en la búsqueda por ID.",
      "4. Ejecuta y valida el código en el entorno simulado sin errores."
    ],
    "recursos": "Simulador de IDE interactivo integrado. Plantilla de código `api_notas.py` con Flask.",
    "tiempo_estimado": "80",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro te sientes de resolver este reto avanzado?",
      "escala": "1-5"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué conocimientos previos aplicarás aquí?",
      "escala": "Texto libre"
    }
  },
  {
    "id": "RA-C2-N2",
    "nivel": "Avanzado",
    "sub_nivel": "N2",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Completar Dashboard interactivo de matrícula escolar",
    "descripcion": "Usa el simulador IDE para estructurar y completar un script en Python (`dashboard.py`) que genera visualizaciones de matrícula escolar. Debes: (1) Cargar los datos desde un archivo CSV con Pandas y generar estadísticas descriptivas; (2) Configurar un gráfico de barras interactivo con Plotly Express definiendo los ejes correctos; y (3) Implementar un filtro dinámico que extraiga datos por año y calcule una métrica clave (KPI) de matrícula total.",
    "criterios": [
      "1. Completa la carga del archivo CSV y el método de estadísticas descriptivas con Pandas.",
      "2. Define correctamente el tipo de gráfico (px.bar) y los ejes X y Y para la visualización con Plotly.",
      "3. Implementa la lógica de filtrado booleano en Pandas por año y la suma de la columna correspondiente.",
      "4. Ejecuta y comprueba los resultados en la terminal del simulador."
    ],
    "recursos": "Simulador de IDE interactivo integrado. Plantilla de código `dashboard.py` con Pandas y Plotly.",
    "tiempo_estimado": "90",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro te sientes de resolver este reto avanzado?",
      "escala": "1-5"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué conocimientos previos aplicarás aquí?",
      "escala": "Texto libre"
    }
  },
  {
    "id": "RA-C2-N3",
    "nivel": "Avanzado",
    "sub_nivel": "N3",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Completar Chatbot de orientación vocacional",
    "descripcion": "Usa el simulador IDE para completar el código en Python (`chatbot.py`) de un asistente virtual de orientación vocacional. Debes: (1) Completar el árbol de decisión usando condicionales compuestos para recomendar carreras según intereses y conocimientos; (2) Implementar el guardado de la sesión del estudiante en un archivo JSON con los parámetros de formato correctos; y (3) Desarrollar el bucle de captura de datos interactivos usando funciones de entrada de texto.",
    "criterios": [
      "1. Completa la estructura if/elif/else con las condiciones y retornos de carrera correspondientes.",
      "2. Implementa la escritura del archivo en formato JSON y el modo de apertura 'w' apropiado.",
      "3. Configura la captura de respuestas de usuario (input) y el método append en el bucle principal.",
      "4. Ejecuta el chatbot simulado sin errores de sintaxis o lógica."
    ],
    "recursos": "Simulador de IDE interactivo integrado. Plantilla de código `chatbot.py` en Python.",
    "tiempo_estimado": "100",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro te sientes de resolver este reto avanzado?",
      "escala": "1-5"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué conocimientos previos aplicarás aquí?",
      "escala": "Texto libre"
    }
  },
  {
    "id": "RA-C3-N1",
    "nivel": "Avanzado",
    "sub_nivel": "N1",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Carga de proyecto IoT: Monitoreo de la huerta escolar",
    "descripcion": "Diseña en Tinkercad Circuits (o con hardware real) un sistema de monitoreo automatizado para la huerta escolar que mida la humedad del suelo, temperatura y humedad ambiental. Debe activar un LED de advertencia si la humedad baja del 40%, mostrar datos en LCD/monitor serial y simular un registro en CSV. Una vez terminado tu diseño, toma una captura de pantalla del circuito simulado o descarga tu código Arduino, y súbelo en esta sección.",
    "criterios": [
      "1. Captura del circuito simulado que muestra la lectura correcta de humedad y temperatura.",
      "2. Lógica visible para activación de actuadores (LED de alerta).",
      "3. Empleo de monitor serial o pantalla LCD para visualización de lecturas.",
      "4. Archivo subido en formato válido (PDF, PNG, JPG, ZIP o INO)."
    ],
    "recursos": "Plataforma Tinkercad Circuits / Wokwi / simulador Arduino. Panel de carga de archivos de Meta-Pathfinder.",
    "tiempo_estimado": "80",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro te sientes de resolver este reto avanzado?",
      "escala": "1-5"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué conocimientos previos aplicarás aquí?",
      "escala": "Texto libre"
    }
  },
  {
    "id": "RA-C3-N2",
    "nivel": "Avanzado",
    "sub_nivel": "N2",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Completar Modelo de Machine Learning para deserción escolar",
    "descripcion": "Usa el simulador IDE para completar un flujo de aprendizaje automático en Python (`modelo_ml.py`) diseñado para identificar el riesgo de deserción estudiantil. Deberás: (1) Cargar el archivo de datos y contar la frecuencia de cada categoría de riesgo con Pandas; (2) Dividir los datos en conjuntos de entrenamiento/prueba y entrenar un clasificador de Árbol de Decisión usando scikit-learn; y (3) Generar predicciones y calcular la precisión (accuracy score) final del modelo.",
    "criterios": [
      "1. Completa la lectura de datos y el conteo de frecuencias por categoría de riesgo usando Pandas.",
      "2. Configura la división train_test_split, inicializa el clasificador y entrena el modelo con el método .fit().",
      "3. Completa las funciones de predicción y cálculo de exactitud de scikit-learn.",
      "4. Ejecuta el pipeline del modelo en el simulador y obtén las métricas correctas."
    ],
    "recursos": "Simulador de IDE interactivo integrado. Plantilla de código `modelo_ml.py` en Python.",
    "tiempo_estimado": "90",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro te sientes de resolver este reto avanzado?",
      "escala": "1-5"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué conocimientos previos aplicarás aquí?",
      "escala": "Texto libre"
    }
  },
  {
    "id": "RA-C3-N3",
    "nivel": "Avanzado",
    "sub_nivel": "N3",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Completar Lógica de App de primeros auxilios",
    "descripcion": "Usa el simulador IDE para completar la lógica de bloques estructurada en texto (`app_inventor.txt`) para una aplicación móvil de primeros auxilios y emergencias. Deberás completar tres funcionalidades críticas: (1) El bloque de control para abrir la pantalla de protocolos de ayuda; (2) La captura de latitud desde el sensor de ubicación para abrir mapas de Google; y (3) El disparo de la llamada de emergencia al número 123 y el envío de un SMS de auxilio.",
    "criterios": [
      "1. Configura el bloque de navegación con el nombre de la pantalla y el comando de control correctos.",
      "2. Asigna la propiedad de latitud del sensor y la URL base de geolocalización para mapas.",
      "3. Completa la acción de llamada de emergencia vinculando el número de auxilio 123.",
      "4. Valida y ejecuta la simulación de bloques sin fallos de compilación."
    ],
    "recursos": "Simulador de IDE interactivo integrado. Representación textual de bloques de MIT App Inventor.",
    "tiempo_estimado": "100",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro te sientes de resolver este reto avanzado?",
      "escala": "1-5"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué conocimientos previos aplicarás aquí?",
      "escala": "Texto libre"
    }
  },
  {
    "id": "RA-C4-N1",
    "nivel": "Avanzado",
    "sub_nivel": "N1",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Ensayo de análisis de sesgo algorítmico",
    "descripcion": "Escribe un ensayo analítico en el editor de texto sobre el sesgo algorítmico. Selecciona dos herramientas que uses a diario (ej. TikTok, Instagram, ChatGPT, etc.) y explica cómo funcionan sus algoritmos de recomendación o generación, qué sesgos potenciales podrían manifestar (de género, raza, geografía, etc.) y qué medidas propondrías a las empresas desarrolladoras para mitigar o corregir estos sesgos.",
    "criterios": [
      "1. Define con claridad el concepto de sesgo algorítmico y sus implicaciones sociales.",
      "2. Analiza de manera crítica el comportamiento de dos herramientas digitales cotidianas.",
      "3. Identifica sesgos potenciales específicos y sus posibles causas técnicas o de datos.",
      "4. Propone recomendaciones concretas y viables para la mitigación del sesgo."
    ],
    "recursos": "Editor de texto integrado en la plataforma. Recursos sobre ética en IA y sesgos algorítmicos.",
    "tiempo_estimado": "70",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro te sientes de resolver este reto avanzado?",
      "escala": "1-5"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué conocimientos previos aplicarás aquí?",
      "escala": "Texto libre"
    }
  },
  {
    "id": "RA-C4-N2",
    "nivel": "Avanzado",
    "sub_nivel": "N2",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Carga de Pitch Deck: Startup tecnológica de impacto social",
    "descripcion": "Diseña una propuesta de startup tecnológica viable para resolver un problema social en Colombia (telemedicina, residuos, educación rural, inclusión financiera, etc.). Estructura un pitch deck de 10 diapositivas que incluya el problema, solución, modelo de negocio, mercado e impacto social. Crea tu presentación usando herramientas como Canva o PowerPoint, y sube el archivo (formato PDF o imagen) en este panel para registrar tu solución.",
    "criterios": [
      "1. Propuesta de negocio social enfocada en resolver un problema real del contexto colombiano.",
      "2. Estructura de diapositivas clara que cubra problema, solución, modelo y tecnología.",
      "3. Presentación visualmente cuidada y profesional.",
      "4. Archivo subido en formato válido (PDF, PNG, JPG, PPTX o similar)."
    ],
    "recursos": "Canva / Google Slides / plantillas de pitch deck. Panel de carga de archivos en Meta-Pathfinder.",
    "tiempo_estimado": "80",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro te sientes de resolver este reto avanzado?",
      "escala": "1-5"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué conocimientos previos aplicarás aquí?",
      "escala": "Texto libre"
    }
  },
  {
    "id": "RA-C4-N3",
    "nivel": "Avanzado",
    "sub_nivel": "N3",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Carga de Reporte: Impacto tecnológico en la comunidad",
    "descripcion": "Lleva a cabo una mini-investigación de campo sobre el impacto real de una tecnología en tu comunidad local (ej. WhatsApp, redes sociales, IA, etc.) entrevistando a 5 personas con perfiles diversos. Transcribe y analiza sus respuestas para encontrar patrones. Redacta tu reporte final de hallazgos y súbelo en esta sección en formato PDF o imagen.",
    "criterios": [
      "1. Pregunta de investigación y perfiles de entrevistados bien documentados.",
      "2. Análisis de patrones y conclusiones extraídas de las entrevistas.",
      "3. Reporte redactado con coherencia y estructura formal.",
      "4. Archivo subido en formato válido (PDF, DOCX, PNG o JPG)."
    ],
    "recursos": "Grabadora de voz / Notas escritas, Google Scholar, Redalyc, Scielo, Mendeley.",
    "tiempo_estimado": "100",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro te sientes de resolver este reto avanzado?",
      "escala": "1-5"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué conocimientos previos aplicarás aquí?",
      "escala": "Texto libre"
    }
  }
];
