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
    "descripcion": "Usa la línea de tiempo interactiva del juego para ordenar cronológicamente los 8 grandes hitos tecnológicos de la humanidad: desde la invención de la rueda y la construcción de las pirámides, pasando por la brújula, la imprenta, el telescopio, el teléfono, la televisión, hasta llegar al teléfono inteligente moderno. Comprueba tu ordenamiento en el simulador.",
    "criterios": [
      "1. Ordena cronológicamente los 8 hitos históricos de la humanidad.",
      "2. Comprende el orden secuencial del desarrollo tecnológico de cada invento.",
      "3. Valida y corrige su ordenamiento en la simulación interactiva.",
      "4. Completa la actividad interactiva sin errores conceptuales."
    ],
    "recursos": "Línea de tiempo interactiva incorporada<br>Lecciones breves de historia y desarrollo tecnológico",
    "tiempo_estimado": "20",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto sabes sobre el orden histórico de las principales invenciones de la humanidad? Marca tu nivel.",
      "escala": "1=Nada · 2=Algo · 3=Bastante · 4=Mucho"
    },
    "jol_esp_2": {
      "pregunta": "¿Podrías explicarle a un compañero el orden cronológico y evolución de tecnologías desde la antigüedad hasta la era moderna? (1=no podría · 5=lo explico con ejemplos propios)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RB-C1-N2",
    "nivel": "Básico",
    "sub_nivel": "N2",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "Sistemas tecnológicos cotidianos en mi barrio",
    "descripcion": "Utiliza el módulo interactivo de clasificación para arrastrar y agrupar diferentes infraestructuras cotidianas de tu barrio en sus categorías correctas: Infraestructura Eléctrica (transformadores, postes de luz), de Transporte (buses, vías, paraderos), y de Construcción. Completa la clasificación de todos los elementos cotidianos sin fallos.",
    "criterios": [
      "1. Clasifica correctamente todos los elementos del entorno comunitario.",
      "2. Agrupa los servicios urbanos en las categorías Eléctrica, Transporte y Construcción.",
      "3. Comprende el papel de las infraestructuras en el desarrollo del barrio.",
      "4. Valida y completa el juego interactivo sin errores de emparejamiento."
    ],
    "recursos": "Juego interactivo de emparejamiento de sistemas tecnológicos comunitarios",
    "tiempo_estimado": "20",
    "jol_esp_1": {
      "pregunta": "¿Qué tan capaz eres de identificar y clasificar sistemas tecnológicos cotidianos como transporte y electricidad? (1=no sé cómo · 5=lo hago con facilidad)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Cuánto sabes sobre el tipo de infraestructura que requiere la distribución eléctrica y el transporte de tu barrio?",
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
    "descripcion": "El pensamiento algorítmico comienza con actividades cotidianas. Escribe un algoritmo detallado paso a paso para preparar un sándwich de jamón y queso, como si se lo explicaras a un robot que no sabe nada de cocina. Usa estructura de pasos numerados, incluye condiciones (si no hay pan, entonces…) y considera al menos un ciclo repetitivo (repite hasta que…). Luego dibuja el diagrama de flujo correspondiente.",
    "criterios": [
      "1. Algoritmo secuencial y completo.",
      "2. Al menos 1 condición (if/else).",
      "3. Al menos 1 ciclo (while/for).",
      "4. Diagrama de flujo con símbolos correctos.",
      "5. No hay ambigüedad en los pasos."
    ],
    "recursos": "Papel cuadriculado para diagrama de flujo<br>Símbolos de diagrama de flujo (referencia proporcionada)",
    "tiempo_estimado": "25",
    "jol_esp_1": {
      "pregunta": "¿Sabes qué es un algoritmo y puedes escribir uno paso a paso para una tarea cotidiana? (1=no sé qué es · 5=sí, puedo escribirlo sin ayuda)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Conoces los símbolos básicos de un diagrama de flujo (inicio, proceso, decisión, fin)? (1=no los conozco · 4=los uso correctamente)",
      "escala": "1 – 4"
    }
  },
  {
    "id": "RB-C3-N2",
    "nivel": "Básico",
    "sub_nivel": "N2",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Simulador lógico de lista de asistencia escolar",
    "descripcion": "Ordena los bloques de código y parámetros del simulador para diseñar un programa automatizado de control de asistencia. El programa lee la lista de estudiantes, evalúa la presencia, calcula el porcentaje total de asistencia y muestra advertencias si la asistencia es inferior al 80%. Arrastra los bloques lógicos a su posición secuencial correcta y ejecuta el flujo.",
    "criterios": [
      "1. Ordena los bloques de asignación inicial, bucle de lectura y cálculo de porcentaje.",
      "2. Estructura el condicional de alerta de inasistencia (asistencia < 80%).",
      "3. Ejecuta de forma exitosa el programa en el simulador dinámico.",
      "4. Resuelve el reto obteniendo el reporte correcto de inasistencia."
    ],
    "recursos": "Simulador de control de asistencia escolar por bloques integrado",
    "tiempo_estimado": "30",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro/a estás de ordenar bloques de código lógico como bucles y condicionales para resolver un problema de clase? (1=no sé ordenarlos · 5=los ordeno sin dificultad)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes comprender la utilidad de una condicional simple para alertar si el porcentaje de asistencia escolar es muy bajo? (1=no lo comprendo · 5=lo entiendo claramente)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RB-C3-N3",
    "nivel": "Básico",
    "sub_nivel": "N3",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Diseña el sistema de préstamo de libros de la biblioteca",
    "descripcion": "La biblioteca de tu colegio quiere digitalizar su sistema de préstamo. Diseña (sin código, usando diagrama de flujo y pseudocódigo) un sistema que: registre estudiantes y libros, permita prestar un libro (verifica disponibilidad), registre la devolución (calcula días de retraso si los hay) y genere un reporte de los libros más prestados. Considera qué datos necesitas guardar y cómo los organizarías.",
    "criterios": [
      "1. Diagrama de flujo completo del proceso.",
      "2. Identificación de datos necesarios (entidades).",
      "3. Lógica de préstamo y devolución correcta.",
      "4. Cálculo de días de retraso.",
      "5. Propuesta de reporte de uso."
    ],
    "recursos": "Papel o herramienta de diagramas (draw.io)<br>Referencia de símbolos de flujo",
    "tiempo_estimado": "45",
    "jol_esp_1": {
      "pregunta": "¿Qué tan capaz eres de descomponer un sistema complejo (como una biblioteca) en sus partes, datos y procesos, antes de escribir código? (1=no sé por dónde empezar · 5=lo hago sistemáticamente)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes identificar qué datos necesita guardar un sistema digital para funcionar correctamente (entidades, campos, relaciones)? (1=no lo entiendo · 5=lo diseño con facilidad)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RB-C4-N1",
    "nivel": "Básico",
    "sub_nivel": "N1",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Análisis digital: conectividad y acceso en el hogar",
    "descripcion": "Lee atentamente los dos artículos breves sobre la realidad de la conectividad en el hogar y las consecuencias de la exclusión digital. Luego, responde la trivia de 3 preguntas de comprensión directa para evaluar tu nivel de análisis crítico sobre la brecha digital.",
    "criterios": [
      "1. Lee de forma comprensiva la información estadística sobre conectividad urbana y rural.",
      "2. Identifica correctamente la causa principal de la desconexión.",
      "3. Responde de forma acertada todas las preguntas de la trivia."
    ],
    "recursos": "Lecturas integradas y cuestionario interactivo sobre brecha digital en Colombia",
    "tiempo_estimado": "20",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto sabes sobre la brecha digital en Colombia y la diferencia de acceso a internet entre zonas urbanas y rurales? (1=nada · 5=bastante)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes analizar datos estadísticos simples sobre conectividad en el hogar a partir de textos cortos? (1=no puedo · 5=lo hago con facilidad)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RB-C4-N2",
    "nivel": "Básico",
    "sub_nivel": "N2",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Las redes sociales y mi bienestar: trivia de análisis",
    "descripcion": "Lee con atención las investigaciones sobre el impacto del tiempo en pantalla en la salud mental de los jóvenes y las recomendaciones para un uso saludable. Responde de forma correcta el test de 3 preguntas de opción múltiple para validar tu nivel de análisis crítico.",
    "criterios": [
      "1. Analiza con criterio los efectos del tiempo prolongado en redes sociales.",
      "2. Identifica recomendaciones y hábitos de uso saludables en base a los artículos provistos.",
      "3. Completa la trivia sin errores de comprensión."
    ],
    "recursos": "Lecturas integradas y cuestionario interactivo sobre bienestar emocional y redes sociales",
    "tiempo_estimado": "20",
    "jol_esp_1": {
      "pregunta": "¿Qué tan bien puedes analizar el impacto de las redes sociales en el bienestar emocional a partir de lecturas recomendadas? (1=no lo comprendo · 5=lo analizo críticamente)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Conoces recomendaciones científicas o hábitos para un uso saludable de pantallas en jóvenes? (1=no conozco ninguno · 5=conozco varias pautas)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RB-C4-N3",
    "nivel": "Básico",
    "sub_nivel": "N3",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Propuesta de solución tecnológica para un problema de tu comunidad",
    "descripcion": "Identifica un problema real de tu comunidad (ej. manejo de residuos, agua, movilidad, seguridad) y diseña una propuesta de solución tecnológica viable considerando: (a) descripción del problema con evidencia, (b) tecnología propuesta y por qué es pertinente, (c) recursos necesarios, (d) posibles impactos positivos y negativos en la comunidad, y (e) consideraciones éticas. Presenta en un documento de 2 páginas con imágenes o diagramas.",
    "criterios": [
      "1. Problema real documentado con evidencia.",
      "2. Tecnología propuesta pertinente y justificada.",
      "3. Análisis de impactos positivos y negativos.",
      "4. Consideraciones éticas explícitas.",
      "5. Documento de 2 págs. con imágenes/diagramas."
    ],
    "recursos": "Procesador de texto · fuentes de información local<br>Formato de propuesta (proporcionado)",
    "tiempo_estimado": "50",
    "jol_esp_1": {
      "pregunta": "¿Qué tan capaz eres de diseñar una propuesta tecnológica que considere tanto impactos positivos como negativos y factores éticos? (1=no sé cómo · 5=lo hago con argumentos sólidos)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes identificar dilemas éticos relacionados con el uso de tecnología en contextos sociales colombianos? (1=no los identifico · 5=los analizo profundamente)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RM-C1-N1",
    "nivel": "Medio",
    "sub_nivel": "N1",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "Anatomía de un smartphone: disección virtual e interactiva",
    "descripcion": "Explora la anatomía interna de un teléfono inteligente. Aprende sobre el funcionamiento y características de la batería de iones de litio, pantallas OLED frente a LCD, y la importancia de la memoria RAM. Al finalizar, responde de forma correcta las 3 preguntas de la trivia técnica para validar tu reto.",
    "criterios": [
      "1. Identifica correctamente la tecnología detrás de las baterías de smartphones modernos.",
      "2. Comprende la diferencia fundamental entre pantallas OLED y LCD.",
      "3. Reconoce el papel de la memoria RAM en la multitarea y rendimiento.",
      "4. Completa la trivia interactiva de forma exitosa."
    ],
    "recursos": "Módulo de anatomía y cuestionario interactivo sobre hardware móvil",
    "tiempo_estimado": "25",
    "jol_esp_1": {
      "pregunta": "¿Qué tan profundamente conoces los componentes internos de un smartphone y la importancia de la RAM o pantalla? (1=solo sé que existe · 5=explico su funcionamiento técnico)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes comprender la diferencia entre diferentes tecnologías de pantalla y baterías de litio? (1=nunca lo he hecho · 5=lo hago eficientemente)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RM-C1-N2",
    "nivel": "Medio",
    "sub_nivel": "N2",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "De la calculadora mecánica al procesador cuántico",
    "descripcion": "Explora de forma interactiva la evolución del cómputo desde la calculadora mecánica de Pascal (1642) y el motor analítico de Babbage hasta la Ley de Moore y el procesador cuántico actual Sycamore. Lee las lecciones detalladas y completa la evaluación exhaustiva de 6 preguntas conceptuales sobre hitos históricos y patrones de la evolución tecnológica.",
    "criterios": [
      "1. Comprende el funcionamiento y fallas de computadores tempranos como el ENIAC.",
      "2. Identifica el contexto histórico de la invención del circuito integrado.",
      "3. Analiza la relación de Ada Lovelace y la computación teórica.",
      "4. Identifica patrones de evolución tecnológica (mecánica a electrónica).",
      "5. Evalúa críticamente la Ley de Moore y el rendimiento de procesadores cuánticos.",
      "6. Responde correctamente todas las preguntas de la evaluación interactiva."
    ],
    "recursos": "Línea de tiempo histórica y test interactivo de evolución de la computación",
    "tiempo_estimado": "45",
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
    "descripcion": "Basándote en tendencias tecnológicas actuales (IA generativa, realidad aumentada, computación en la nube, biometría, blockchain educativo), elabora un escenario prospectivo de cómo podría ser una clase de tecnología e informática en el año 2040 en Colombia. Argumenta cada tecnología incluida: ¿por qué crees que estará disponible en Colombia para ese año?, ¿qué problemas resolverá?, ¿qué nuevas inequidades podría generar? Presenta en formato ensayo (600 palabras) o video de 3 minutos.",
    "criterios": [
      "1. Mínimo 4 tecnologías prospectadas con fundamento.",
      "2. Argumentación de disponibilidad en Colombia.",
      "3. Análisis de impactos positivos y de inequidad.",
      "4. Coherencia interna del escenario.",
      "5. Formato ensayo o video completo."
    ],
    "recursos": "Fuentes prospectivas: WEF Future of Jobs · UNESCO 2040 · CEPAL Colombia digital<br>Herramienta de video (opcional)",
    "tiempo_estimado": "60",
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
    "titulo": "Automatiza una tarea repetitiva con macros",
    "descripcion": "Usa el simulador interactivo de hoja de cálculo para automatizar el cálculo del promedio, máximo, mínimo y formato condicional (resaltar notas < 3.0 en rojo) utilizando un editor de bloques lógicos tipo Scratch o escribiendo la macro Apps Script. Ejecuta el flujo y comprueba la corrección de tus fórmulas y código.",
    "criterios": [
      "1. Utiliza el editor lógico para calcular el promedio, máx. y mín.",
      "2. Resalta automáticamente notas < 3.0 mediante bloques condicionales.",
      "3. Comenta los bloques lógicos para describir su funcionamiento.",
      "4. Funciona y se ejecuta de manera correcta en el simulador."
    ],
    "recursos": "Simulador interactivo de hoja de cálculo MiniExcel con soporte de bloques",
    "tiempo_estimado": "35",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro/a estás de programar bloques lógicos tipo Scratch para automatizar tareas en hojas de cálculo? (1=nunca he programado macros · 5=lo hago sin tutoriales)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes identificar tareas repetitivas en un flujo de trabajo y diseñar la lógica de automatización antes de escribir el código? (1=no lo relaciono · 5=lo hago sistemáticamente)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RM-C2-N2",
    "nivel": "Medio",
    "sub_nivel": "N2",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Diseño de identidad digital y logos en SVG",
    "descripcion": "Aprende las bases de la creación de logos vectoriales escalables utilizando SVG. Explora la estructura de contenedores, formas primitivas y paletas de colores interactivas. Completa el módulo interactivo y la evaluación de 2 etapas (ordenar los pasos de construcción de un logo y la aplicación correcta de colores) para validar tu reto.",
    "criterios": [
      "1. Comprende la estructura jerárquica de un SVG (viewBox, shapes y defs).",
      "2. Domina el uso de fill, stroke, opacidad y gradientes en SVG.",
      "3. Ordena correctamente las etapas del proceso de construcción de un logo.",
      "4. Resuelve sin errores el flujo de aplicación de colores en la evaluación interactiva."
    ],
    "recursos": "Módulo interactivo de diseño y construcción de logos vectoriales en SVG incorporado",
    "tiempo_estimado": "40",
    "jol_esp_1": {
      "pregunta": "¿Qué tan bien dominas la estructura de un archivo SVG y las etiquetas de formas básicas? (1=no las conozco · 5=las aplico conscientemente)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes crear materiales digitales coherentes (logo, paleta, tipografía, plantilla) siguiendo una identidad visual unificada? (1=nunca lo he hecho · 5=lo hago con criterio)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RM-C2-N3",
    "nivel": "Medio",
    "sub_nivel": "N3",
    "componente": "Apropiación y uso",
    "codigo_men": "C2",
    "titulo": "Base de datos de la tienda escolar (SQL básico)",
    "descripcion": "Usa el simulador interactivo de SQL por bloques para digitalizar y consultar el inventario de la tienda escolar. El reto consta de 3 fases interactivas: (1) Crear las tablas Proveedores, Productos y Ventas, (2) Insertar los 10 registros de muestra en cada tabla, y (3) Resolver la consulta para calcular el total de ventas del día 2025-05-17 usando sumas y conteos agrupados con WHERE.",
    "criterios": [
      "1. Ejecuta con éxito la creación de las tablas Proveedores, Productos y Ventas en la base de datos simulada.",
      "2. Inserta la base de registros requerida sin errores de ejecución.",
      "3. Estructura y ejecuta correctamente con bloques la consulta SELECT SUM(total), COUNT(*), SUM(cantidad) FROM Ventas WHERE fecha = '2025-05-17' para obtener el reporte de ventas del día.",
      "4. Completa las 3 fases lógicas del reto SQL."
    ],
    "recursos": "Simulador interactivo de SQL por bloques y base de datos relacional integrada",
    "tiempo_estimado": "35",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro/a estás de diseñar un esquema de base de datos relacional con tablas, campos, tipos de datos y relaciones (llaves foráneas)? (1=nunca he creado una BD · 5=lo diseño sin ayuda)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes escribir consultas SQL básicas (SELECT, WHERE, GROUP BY, ORDER BY, JOIN) para obtener información específica de una base de datos? (1=no conozco SQL · 5=las escribo con confianza)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RM-C3-N1",
    "nivel": "Medio",
    "sub_nivel": "N1",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Sensor de temperatura con Arduino (simulación)",
    "descripcion": "Usa el simulador interactivo de Arduino para ordenar los bloques lógicos de configuración y ejecución. El código debe: configurar los Pines 13 (LED Rojo) y 12 (LED Verde) como SALIDA, iniciar el Monitor Serial, leer la temperatura de un sensor TMP36 (A0) cada 2 segundos y encender el LED Rojo si la temperatura supera los 30°C (normal: LED Verde encendido). Ejecuta tu código en el simulador incorporado y manipula la temperatura con el slider para probar la respuesta.",
    "criterios": [
      "1. Ordena correctamente todos los bloques lógicos del programa Arduino.",
      "2. Inicia la simulación de hardware y visualiza los reportes en el Monitor Serial.",
      "3. El simulador responde de manera correcta a los cambios de temperatura (>30°C: LED Rojo, <=30°C: LED Verde).",
      "4. Completa la ejecución sin errores de código."
    ],
    "recursos": "Tablero y simulador interactivo de Arduino Uno y hardware integrado",
    "tiempo_estimado": "35",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro/a estás de conectar un sensor a un Arduino y programar la lectura de datos en un simulador por bloques? (1=nunca lo he intentado · 5=lo hago con confianza)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes escribir código Arduino que incluya condicionales para controlar actuadores (LEDs) según el valor leído por un sensor? (1=no conozco el lenguaje · 5=lo escribo sin problemas)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RM-C3-N2",
    "nivel": "Medio",
    "sub_nivel": "N2",
    "componente": "Solución de problemas",
    "codigo_men": "C3",
    "titulo": "Lógica de votación estudiantil en JavaScript",
    "descripcion": "Usa el tablero interactivo de código por bloques para completar la función de registro de votos (`voting.html`) utilizando persistencia local con `localStorage`. Arrastra y suelta los bloques en los espacios en blanco para realizar la lectura de la lista (`localStorage.getItem`), la conversión a texto plano (`JSON.stringify`), y el ciclo de pintado dinámico (`forEach`). Ejecuta tu código para verificar el registro y visualización de votos sin duplicados.",
    "criterios": [
      "1. Utiliza de forma correcta `localStorage.getItem` para recuperar los votos guardados.",
      "2. Implementa la conversión de objetos a texto plano mediante `JSON.stringify` para la persistencia.",
      "3. Utiliza la estructura iterativa `forEach` para actualizar de forma dinámica la interfaz de usuario con los resultados.",
      "4. Ejecuta exitosamente la simulación de votación."
    ],
    "recursos": "Editor interactivo de código por bloques para JavaScript y simulación web",
    "tiempo_estimado": "30",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro/a estás de estructurar código de persistencia local en Javascript usando bloques? (1=nunca lo he hecho · 5=lo hago sin tutoriales)",
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
    "titulo": "Clasificador de residuos con Python",
    "descripcion": "Usa el tablero interactivo de código por bloques para completar el script en Python (`classifier.py`) de la clase `WasteClassifier`. Arrastra y suelta los bloques de código correctos en los espacios en blanco para completar la inicialización de atributos (`self.peso`), la comparación de cadenas y el manejo de excepciones de valor (`ValueError`). Ejecuta tu script para verificar la clasificación correcta del residuo.",
    "criterios": [
      "1. Completa la asignación correcta del atributo `self.peso` en el constructor de la clase.",
      "2. Implementa la lógica de condicionales con el material del residuo.",
      "3. Maneja correctamente la excepción `ValueError` en la lógica de errores del programa.",
      "4. Ejecuta exitosamente el script de clasificación en Python sin errores de sintaxis o ejecución."
    ],
    "recursos": "Tablero interactivo de código por bloques para Python con consola de ejecución",
    "tiempo_estimado": "30",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro/a estás de implementar clases y objetos en Python para modelar un sistema del mundo real con múltiples atributos? (1=no he aprendido POO · 5=lo implemento con confianza)",
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
    "descripcion": "Explora virtualmente la estructura de un smartphone desmantelando sus 9 componentes principales. Luego, responde a las preguntas críticas sobre la función, geopolítica, sostenibilidad y ética de la cadena de suministro.",
    "criterios": [
      "1. Desmontaje exitoso de los 9 componentes virtuales (Pantalla, Digitalizador, Batería, Placa Madre, Cámara, Parlante, Micrófono, Chasis y Tapa Trasera).",
      "2. Comprende el funcionamiento y función técnica de cada parte.",
      "3. Resuelve sin errores el cuestionario sobre obsolescencia programada y geopolítica de materiales raros al finalizar."
    ],
    "recursos": "Simulador interactivo en 3D de desmontaje de celular incorporado",
    "tiempo_estimado": "40",
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
    "titulo": "Análisis comparativo de paradigmas de programación en Python",
    "descripcion": "Usa el editor de código integrado para analizar e implementar una misma solución algorítmica (sumar los números pares de una lista) utilizando tres enfoques o paradigmas diferentes en Python: Imperativo, Orientado a Objetos (POO) y Funcional. Completa las sentencias clave en cada ejercicio y ejecuta la consola para verificar su correcta ejecución.",
    "criterios": [
      "1. Completa la inicialización del acumulador y la condición de paridad en el paradigma Imperativo.",
      "2. Implementa la asignación del constructor e invocación del acumulado en el paradigma Orientado a Objetos.",
      "3. Utiliza la función integrada filter y la expresión lambda en el paradigma Funcional.",
      "4. Ejecuta exitosamente los tres scripts sin errores de sintaxis en la consola de simulación."
    ],
    "recursos": "Editor interactivo de código IDE para Python y terminal de salida",
    "tiempo_estimado": "35",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro/a estás de poder identificar y completar código en Python implementando la misma lógica (suma de pares) bajo los paradigmas imperativo, orientado a objetos y funcional? (1=muy inseguro/a · 5=muy seguro/a)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Qué tan clara tienes la diferencia en el flujo de datos y el estado al programar con funciones puras y expresiones lambda en comparación con la POO? (1=nada claro · 5=perfectamente claro)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RA-C1-N3",
    "nivel": "Avanzado",
    "sub_nivel": "N3",
    "componente": "Naturaleza y evolución",
    "codigo_men": "C1",
    "titulo": "Ensayo crítico sobre patentes de tecnología emergente",
    "descripcion": "Realiza un análisis sintético estructurado en el editor de texto integrado sobre una patente de tecnología emergente, enfocándote en el impacto de dichas patentes en el contexto social y económico colombiano.",
    "criterios": [
      "Patente identificada y vinculada.",
      "Análisis técnico de la invención.",
      "Relación con conocimientos previos.",
      "Impacto en Colombia argumentado."
    ],
    "recursos": "USPTO.gov, WIPO.int, SIC Colombia (patentes nacionales).\n\n---",
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
    "titulo": "API REST para el sistema de notas del colegio",
    "descripcion": "Completa el código Flask en el entorno de desarrollo simulado, rellenando los métodos GET y POST, y asegurando la lógica correcta de manejo de errores 404 en las búsquedas por ID.",
    "criterios": [
      "5 endpoints funcionales (CRUD).",
      "Respuestas JSON correctas.",
      "Manejo de errores (404, 400).",
      "Pruebas documentadas."
    ],
    "recursos": "Python 3.x, FastAPI o Flask, Postman (gratuito) / Insomnia / cURL.\n\n---",
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
    "titulo": "Dashboard interactivo de matrícula escolar",
    "descripcion": "Completa el script interactivo de Pandas y Plotly Express rellenando la carga del archivo CSV, programando estadísticas descriptivas, configurando los ejes del gráfico y aplicando filtros booleanos por año.",
    "criterios": [
      "Datos reales de datos.gov.co usados.",
      "Mínimo 3 tipos de gráficos interactivos.",
      "Filtros dinámicos funcionales.",
      "KPI destacado con lógica propia."
    ],
    "recursos": "datos.gov.co, Python (Pandas, Plotly, Dash) / Power BI Desktop / Tableau. Tutorial Dash básico (proporcionado).\n\n---",
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
    "titulo": "Chatbot de orientación vocacional para el colegio",
    "descripcion": "Completa el flujo de decisiones estructurado del chatbot vocacional, asegurando guardar la sesión en formato JSON y capturando adecuadamente las entradas interactivas del usuario en la consola simulada.",
    "criterios": [
      "Flujo de conversación completo y lógico.",
      "Mínimo 8 preguntas con variables.",
      "Lógica de recomendación de 3 carreras.",
      "Registro de sesión en archivo JSON."
    ],
    "recursos": "Python 3.x, JSON, SNIES (datos de universidades colombianas), Diagrama de flujo del chatbot (creado por el joven antes de código).\n\n---",
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
    "titulo": "Sistema IoT de monitoreo de la huerta escolar",
    "descripcion": "Simula o programa tu circuito Arduino de monitoreo de la huerta externamente de forma libre. Luego, sube la captura de pantalla o el archivo fuente de tu código a través del panel de entregas para su validación en la plataforma.",
    "criterios": [
      "Lectura correcta de humedad y temperatura.",
      "Lógica de activación de actuadores (LED).",
      "Empleo de estado en pantalla/serial.",
      "Registro CSV de datos."
    ],
    "recursos": "Tinkercad Circuits / Arduino (físico) + sensores, Wokwi, Librerías: DHT.h, LiquidCrystal (LCD).\n\n---",
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
    "titulo": "Modelo de Machine Learning para predecir deserción escolar",
    "descripcion": "Completa el pipeline de Machine Learning en Python implementando el preprocesamiento con Pandas, la división train_test_split, el entrenamiento de un clasificador de árbol de decisión y la obtención de métricas de precisión con scikit-learn.",
    "criterios": [
      "EDA completo con visualizaciones.",
      "Preprocesamiento correcto de variables.",
      "Dos modelos entrenados y comparados.",
      "Métricas reportadas y acciones sugeridas."
    ],
    "recursos": "Python (Pandas, Scikit-learn, Matplotlib, Seaborn), Dataset (proporcionado), Jupyter Notebook o Colab.\n\n---",
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
    "titulo": "Lógica de App de primeros auxilios",
    "descripcion": "Completa la lógica de programación por bloques estructurada en formato de texto (app_inventor.txt) en la consola simulada, configurando la navegación entre pantallas, el sensor GPS y el disparador de llamadas de emergencia.",
    "criterios": [
      "Mínimo 4 protocolos de primeros auxilios.",
      "Botón de llamada de emergencia (llamada real).",
      "Integración de geolocalización.",
      "Funcionamiento offline para protocolos e interfaz amigable."
    ],
    "recursos": "MIT App Inventor 2 / Thunkable / Kodular, Google Maps API (gratuita con límites), 123 Colombia.\n\n---",
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
    "descripcion": "Redacta un escrito analítico y reflexivo sobre los sesgos en las redes sociales e IAs que usas cotidianamente (ej. TikTok, Instagram, ChatGPT) y formula recomendaciones éticas usando el editor de texto integrado.",
    "criterios": [
      "Definición fundamentada de sesgo algorítmico.",
      "Dos herramientas analizadas con rigor.",
      "Evidencia real citada de artículos confiables."
    ],
    "recursos": "Fuentes: Algorithmic Justice League, AI Now Institute, El País Tecnología.\n\n---",
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
    "titulo": "Startup tecnológica con impacto social: pitch deck",
    "descripcion": "Estructura y soporta la idea de tu startup de impacto social en un documento gráfico (como diapositivas de Canva o un PDF) y súbelo a través del panel de entregas de la plataforma.",
    "criterios": [
      "Problema colombiano real y relevante.",
      "Propuesta técnica viable y argumentada.",
      "Modelo de negocio social coherente.",
      "Calidad del pitch deck."
    ],
    "recursos": "Canva / Google Slides / Plantilla Airbnb pitch deck / Impulsa Colombia / Apps.co.\n\n---",
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
    "titulo": "Impacto tecnológico en la comunidad",
    "descripcion": "Registra los hallazgos de tu investigación de campo sobre el impacto de la tecnología en tu comunidad en un informe simplificado y cárgalo en formato PDF o imagen a través del panel de entregas.",
    "criterios": [
      "Pregunta de investigación clara.",
      "Muestra de población y entrevista válida (5 preguntas).",
      "Entrevistas realizadas y documentadas.",
      "Análisis de patrones y triangulación."
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
