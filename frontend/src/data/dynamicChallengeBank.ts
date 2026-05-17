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
    "titulo": "Automatiza la lista de asistencia con código básico",
    "descripcion": "Tu curso tiene 30 estudiantes. Diseña (en pseudocódigo o en Scratch/Python básico) un programa que: lea una lista de nombres, pregunte para cada nombre si asistió (sí/no), cuente el total de presentes y ausentes, y muestre el porcentaje de asistencia. El programa debe manejar el caso en que se ingrese una respuesta diferente a “sí” o “no” (validación de entrada).",
    "criterios": [
      "1. Programa lee lista de nombres.",
      "2. Bucle para recorrer todos los estudiantes.",
      "3. Contador de presentes y ausentes.",
      "4. Cálculo y muestra del porcentaje.",
      "5. Validación de entrada incorrecta."
    ],
    "recursos": "Scratch / Python (IDLE) / pseudocódigo en papel<br>Lista de 30 nombres (proporcionada)",
    "tiempo_estimado": "40",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro/a estás de implementar un bucle (for o while) en un lenguaje de programación o pseudocódigo para recorrer una lista? (1=no sé qué es un bucle · 5=lo implemento sin dificultad)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes diseñar la validación de entradas incorrectas en un programa (qué pasa si el usuario escribe algo que no se esperaba)? (1=nunca lo he pensado · 5=lo incluyo siempre)",
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
    "titulo": "¿Quién tiene acceso a la tecnología en Colombia?",
    "descripcion": "Investiga (con al menos 2 fuentes) el porcentaje de hogares colombianos con acceso a internet en zonas urbanas y rurales. Crea una infografía sencilla (1 página) que muestre: los datos encontrados, una comparación entre zonas, y tu reflexión personal sobre qué consecuencias tiene esta brecha digital para los estudiantes rurales. Usa datos del DANE o del Ministerio TIC.",
    "criterios": [
      "1. Datos reales y citados (mínimo 2 fuentes).",
      "2. Comparación urbana vs. rural visible.",
      "3. Infografía visualmente clara.",
      "4. Reflexión personal argumentada (mín. 3 oraciones)."
    ],
    "recursos": "Canva / Google Slides / papel<br>Datos: dane.gov.co · mintic.gov.co",
    "tiempo_estimado": "30",
    "jol_esp_1": {
      "pregunta": "¿Qué tanto sabes sobre la brecha digital en Colombia (diferencias de acceso a internet entre zonas y grupos sociales)? (1=nada · 5=bastante)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes analizar datos estadísticos simples (porcentajes, comparaciones) y convertirlos en una reflexión argumentada? (1=no puedo · 5=lo hago con facilidad)",
      "escala": "1 – 5"
    }
  },
  {
    "id": "RB-C4-N2",
    "nivel": "Básico",
    "sub_nivel": "N2",
    "componente": "Tecnología y sociedad",
    "codigo_men": "C4",
    "titulo": "Las redes sociales y mi bienestar: análisis crítico",
    "descripcion": "Registra durante 3 días el tiempo que pasas en redes sociales y cómo te sientes antes y después de usarlas (ansiedad, alegría, comparación social, etc.). Luego analiza: ¿existe relación entre el tiempo de uso y tu estado emocional? Presenta tus hallazgos en un informe de una página con datos propios + al menos 1 referencia científica sobre el impacto de redes sociales en adolescentes. Propón 2 recomendaciones para un uso saludable.",
    "criterios": [
      "1. Registro de datos propios de 3 días.",
      "2. Análisis de correlación tiempo–emoción.",
      "3. Al menos 1 fuente científica citada.",
      "4. 2 recomendaciones fundamentadas.",
      "5. Informe cohesivo de 1 página."
    ],
    "recursos": "Plantilla de registro (proporcionada)<br>Fuentes: artículos de salud digital (OMS, APA)",
    "tiempo_estimado": "35",
    "jol_esp_1": {
      "pregunta": "¿Qué tan bien puedes analizar el impacto de las redes sociales en tu bienestar emocional usando datos propios y fuentes externas? (1=nunca lo he pensado · 5=lo analizo críticamente)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Conoces investigaciones o estudios sobre el impacto psicológico de las redes sociales en adolescentes? (1=no conozco ninguno · 5=conozco varios y puedo citarlos)",
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
    "titulo": "Anatomía de un smartphone: disección tecnológica",
    "descripcion": "Sin desarmar físicamente un celular, investiga y documenta todos los sistemas tecnológicos que lo componen: procesador, memoria, sensores (acelerómetro, GPS, cámara), batería, pantalla táctil y módulos de comunicación. Para cada componente: explica su función, el principio científico que lo hace funcionar, cuándo fue inventado y cómo ha evolucionado. Presenta en un diagrama anotado + texto de apoyo.",
    "criterios": [
      "1. Mínimo 8 componentes identificados.",
      "2. Función y principio científico por componente.",
      "3. Línea de evolución para al menos 3 componentes.",
      "4. Diagrama anotado legible.",
      "5. Fuentes citadas correctamente."
    ],
    "recursos": "Diagrama en papel o digital (draw.io / Canva)<br>Fuentes: IEEE Spectrum · Wikipedia técnica · documentación oficial",
    "tiempo_estimado": "45",
    "jol_esp_1": {
      "pregunta": "¿Qué tan profundamente conoces los componentes internos de un smartphone y los principios científicos detrás de cada uno? (1=solo sé que existe · 5=explico su funcionamiento técnico)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes investigar y sintetizar información técnica de múltiples fuentes en un diagrama anotado coherente? (1=nunca lo he hecho · 5=lo hago eficientemente)",
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
    "descripcion": "Tienes una hoja de cálculo con 200 filas de datos de calificaciones de 5 grupos. Semanalmente debes calcular el promedio, máximo, mínimo y resaltar en rojo a los estudiantes con nota inferior a 3.0. Crea una macro (en Google Sheets con Apps Script o en Excel con VBA) que realice todo esto automáticamente con un clic. La macro debe ser comentada explicando qué hace cada sección.",
    "criterios": [
      "1. Macro funcional que calcula promedio, máx. y mín.",
      "2. Resalta automáticamente notas < 3.0 en rojo.",
      "3. Código comentado (explicación de cada sección).",
      "4. Funciona correctamente con datos nuevos.",
      "5. Sin errores de ejecución."
    ],
    "recursos": "Google Sheets + Apps Script / Excel + VBA<br>Hoja de datos de práctica (proporcionada)",
    "tiempo_estimado": "50",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro/a estás de escribir un script o macro básico en Google Apps Script o VBA para automatizar tareas en hojas de cálculo? (1=nunca he programado macros · 5=lo hago sin tutoriales)",
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
    "titulo": "Diseña la identidad digital del proyecto de grado",
    "descripcion": "Tu grupo de trabajo necesita una identidad digital coherente para presentar el proyecto de grado. Diseña: (1) un logo vectorial simple, (2) una paleta de colores (máx. 4) con justificación, (3) tipografía principal y secundaria, (4) una plantilla de diapositivas de 5 slides, y (5) un banner para redes sociales. Todo debe seguir principios de diseño: contraste, alineación, repetición y proximidad (CARP). Entrega todos los archivos editables.",
    "criterios": [
      "1. Logo vectorial coherente con el proyecto.",
      "2. Paleta justificada (contraste y armonía).",
      "3. Tipografía apropiada y justificada.",
      "4. Plantilla de 5 slides funcional.",
      "5. Banner de redes (1920×1080 px mínimo).",
      "6. Principios CARP aplicados y señalados."
    ],
    "recursos": "Canva Pro / Figma / Adobe Express<br>Guía de principios CARP (proporcionada)",
    "tiempo_estimado": "60",
    "jol_esp_1": {
      "pregunta": "¿Qué tan bien dominas los principios de diseño visual (contraste, alineación, repetición, proximidad) para aplicarlos en una identidad de marca? (1=no los conozco · 5=los aplico conscientemente)",
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
    "descripcion": "La tienda escolar quiere digitalizar su inventario. Diseña e implementa una base de datos relacional simple con al menos 3 tablas: Productos, Ventas y Proveedores. En SQLite (o un entorno online como SQLiteOnline.com): crea las tablas con sus campos y tipos de datos, inserta 10 registros por tabla, y ejecuta 5 consultas: total de ventas del día, producto más vendido, stock bajo mínimo, ventas por categoría, y reporte de proveedores activos.",
    "criterios": [
      "1. 3 tablas con relaciones correctas (FK).",
      "2. Tipos de datos apropiados.",
      "3. 10 registros por tabla sin errores.",
      "4. 5 consultas SQL funcionales.",
      "5. Consultas producen resultados correctos."
    ],
    "recursos": "SQLiteOnline.com / DB Browser for SQLite<br>Esquema de referencia (proporcionado)",
    "tiempo_estimado": "60",
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
    "descripcion": "Usando Tinkercad Circuits (simulador online gratuito), conecta un sensor de temperatura NTC o TMP36 a un Arduino Uno. Programa el Arduino para: leer la temperatura cada 2 segundos, mostrarla en el monitor serial, encender un LED rojo si la temperatura supera 30°C y un LED verde si es normal. Documenta el circuito con un esquema y el código con comentarios.",
    "criterios": [
      "1. Circuito correcto en simulador.",
      "2. Lectura de temperatura funcional.",
      "3. Lógica de LEDs correcta (>30°C rojo · resto verde).",
      "4. Código comentado.",
      "5. Esquema del circuito incluido."
    ],
    "recursos": "Tinkercad Circuits (tinkercad.com) — gratuito<br>Referencia de pinout del sensor y Arduino",
    "tiempo_estimado": "50",
    "jol_esp_1": {
      "pregunta": "¿Qué tan seguro/a estás de conectar un sensor a un Arduino y programar la lectura de datos en un simulador como Tinkercad? (1=nunca lo he intentado · 5=lo hago con confianza)",
      "escala": "1 – 5"
    },
    "jol_esp_2": {
      "pregunta": "¿Puedes escribir código Arduino (C++) que incluya condicionales para controlar actuadores (LEDs) según el valor leído por un sensor? (1=no conozco el lenguaje · 5=lo escribo sin problemas)",
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
    "titulo": "Arqueología tecnológica: desarme y documento",
    "descripcion": "Con un dispositivo electrónico en desuso (preferiblemente un celular o computador portátil viejo), desmóntalo con cuidado y documenta fotográficamente cada componente interno. Identifica el fabricante, función y fecha aproximada de cada pieza. Analiza de qué materiales (cobre, silicio, litio, plástico, etc.) están hechos y cuáles representan el mayor costo básico, lo que qué pasaría si no existiera cada componente en el mercado formal. Produce un informe técnico de 3 páginas con fotografías.",
    "criterios": [
      "Desmontaje documentado fotográficamente.",
      "Mínimo 8 componentes identificados con función.",
      "Análisis de materiales y ciclo de vida."
    ],
    "recursos": "Dispositivo en desuso, juego de destornilladores de precisión, iFixit.com, PNUMA (E-waste), Google Lens.\n\n---",
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
    "titulo": "Modelo comparativo de paradigmas de programación",
    "descripcion": "Investiga y compara tres paradigmas de programación: imperativo (Python), funcional (Haskell/JS) y orientado a objetos (Java/Python). Para cada uno, define el paradigma y su filosofía central, resuelve el mismo problema de lógica en cada paradigma (ej. filtrar una lista de números pares), analiza ventajas, limitaciones y casos de uso ideales. Concluye: ¿qué paradigma se adapta mejor para qué tipo de tareas?",
    "criterios": [
      "Proceso de resolución en 3 paradigmas con definición clara.",
      "Mismo problema implementado en los tres.",
      "Análisis comparativo de ventajas y limitaciones.",
      "Casos de uso reales identificados."
    ],
    "recursos": "Repl.it o IDEs para ejecutar los tres ejemplos, referencia (FreeCodeCamp, Real Python).\n\n---",
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
    "titulo": "Análisis crítico de una patente tecnológica",
    "descripcion": "Selecciona una patente tecnológica reciente (2018-2024) relacionada con IA, biotecnología o energías renovables del repositorio USPTO o WIPO. Analiza: (a) qué problema resuelve y cuál es la innovación central, (b) qué conocimientos previos se construyeron para el desarrollo de la invención, (c) qué implicaciones tiene para la sociedad colombiana, (d) si crees que debería ser de dominio público o seguir patentada (argumento ético-económico), y (e) qué barreras tecnológicas impiden su aplicación en Colombia hoy. Ensayo de 800 palabras.",
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
    "descripcion": "Implementa en Python (Flask o FastAPI) una API REST básica para gestionar un sistema de notas escolares. La API debe permitir: crear un estudiante (POST), consultar todos los estudiantes (GET), obtener las notas de un estudiante por ID (GET), agregar una nota a un estudiante (POST) y calcular el promedio (GET). Usa una estructura de datos en memoria (listas o diccionarios). Prueba con Postman o CURL y entrega la documentación de la API.",
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
    "titulo": "Dashboard interactivo de datos abiertos colombianos",
    "descripcion": "Usa estos abiertos del gobierno colombiano (datos.gov.co) sobre educación, salud o transporte. Con Python (Pandas + Plotly Dash o Power BI), crea un dashboard interactivo que incluya al menos 3 visualizaciones diferentes (mapa, gráfico de barras, línea de tiempo). Filtros dinámicos por departamento o año, y una métrica calculada (ej. % crecimiento). El dashboard debe contar una historia con los datos.",
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
    "descripcion": "Diseña e implementa un chatbot de orientación vocacional para estudiantes de grado 10° usando Python. El bot debe tener un flujo de conversación estructurado (árbol de decisiones), hacer al menos 8 preguntas al usuario sobre sus intereses y habilidades, y finalmente generar una recomendación de 3 carreras con justificación, proporcionar información de universidades colombianas relevantes y guardar la sesión en un archivo JSON. Interfaz mínima: consola de Python.",
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
    "descripcion": "La huerta escolar necesita monitoreo automatizado. En Tinkercad o con hardware real (Arduino + sensores), diseña un sistema que mida: humedad del suelo (sensor capacitivo o analógico), temperatura y humedad ambiental (DHT11). El sistema debe: (a) activar un LED si la humedad baja del 40%, (b) mostrar el estado en una pantalla LCD 16x2 o monitor serial, y (c) registrar lecturas cada 5 minutos en formato CSV. Entrega: diagrama del circuito, código comentado y prueba de funcionamiento.",
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
    "descripcion": "Usando un dataset simulado de 500 estudiantes (proporcionado) con variables: nota promedio, inasistencia (%), estrato socioeconómico, horas de estudio y acceso a internet, entrena un modelo que prediga el riesgo de deserción (alto/medio/bajo). El reporte en Python (Jupyter Notebook) debe incluir: análisis exploratorio de datos (EDA), limpieza de datos, entrenamiento (usando un algoritmo de árbol de decisión o regresión logística), evaluación de métricas (accuracy, precision) y sugerencia de 3 acciones preventivas basadas en resultados.",
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
    "titulo": "Aplicación móvil de primeros auxilios con geolocalización",
    "descripcion": "Diseña e implementa con MIT App Inventor 2 o Thunkable una app móvil que en situaciones de emergencia muestre protocolos de primeros auxilios por voz e imágenes (ej. RCP, atragantamiento, ataque cardíaco), permita llamar al número de emergencias (123 Colombia) con un botón de emergencia, use la geolocalización para mostrar el hospital más cercano (Google Maps integrado), funcione sin conexión a internet para los protocolos, y envíe un mensaje de texto automático a un contacto de emergencia. Entrega: APK instalable + documentación del diseño.",
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
    "titulo": "Análisis de sesgo algorítmico en herramientas que usas",
    "descripcion": "Investiga qué es el sesgo algorítmico y cómo puede afectar a grupos vulnerables. Luego, selecciona dos herramientas digitales que uses (ej. TikTok, Instagram, ChatGPT, sistema de búsqueda de empleo o recomendación) y analiza qué algoritmos las mueven, qué sesgos potenciales podrían tener (género, raza, clase social, geografía), qué evidencia existe de ese sesgo (busca estudios o artículos), y qué acciones podrías sugerir a la empresa para corregirlo. Ensayo de 700 palabras con citas.",
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
    "descripcion": "Diseña una startup tecnológica que resuelva un problema social real en Colombia (ej. acceso a tecnología, telemedicina rural, e-learning en zonas apartadas, gestión de residuos urbanos, inclusión financiera o IA para el bien social). Crea un pitch deck de 10 diapositivas siguiendo la estructura: Problema, solución, modelo de negocio, mercado objetivo, tecnología usada, impacto social esperado, equipo, hoja de ruta y necesidades de inversión. La propuesta debe ser viable técnica y económicamente.",
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
    "titulo": "Investigación-acción: impacto de una tecnología en tu comunidad",
    "descripcion": "Conduce una mini-investigación de campo sobre el impacto real de una tecnología específica (ej. WhatsApp, redes sociales, cajeros automáticos, IA) en un grupo social específico de tu comunidad. Pasos: (1) define la pregunta de investigación, (2) realiza 5 entrevistas semiestructuradas, (3) entrevista a 5 personas de diferentes perfiles (edades, géneros, roles), (4) transcribe y analiza las respuestas buscando patrones, (5) triangula con 3 fuentes académicas externas. Entrega: informe de 4 páginas con evidencias de las entrevistas y análisis de hallazgos.",
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
