/**
 * Instrucciones paso a paso para cada reto.
 * Explican qué hacer y cómo interactuar con la actividad (arrastrar, seleccionar, escribir, etc.).
 */
export const challengeInstructions: Record<string, string[]> = {
  'RB-C1-N1': [
    'Lee el nombre de cada hito tecnológico en las tarjetas de la parte inferior.',
    'Arrastra cada tarjeta hacia la línea de tiempo y suéltala en la posición cronológica que creas correcta.',
    'Si te equivocas, arrastra de nuevo la tarjeta a otra posición.',
    'Cuando los 8 hitos estén ordenados, pulsa «Verificar» para comprobar tu secuencia.'
  ],
  'RB-C1-N2': [
    'Observa las imágenes de infraestructura de tu barrio en el panel central.',
    'Arrastra cada imagen hacia la categoría correcta: Eléctrica, Transporte o Construcción.',
    'Suelta la imagen sobre la zona de la categoría; si aciertas, quedará fijada.',
    'Clasifica todas las imágenes sin dejar ninguna sin asignar.'
  ],
  'RB-C1-N3': [
    'Lee cada situación cotidiana que aparece en la parte superior.',
    'En el panel de tecnologías, identifica el par antigua + moderna que resuelve esa situación.',
    'Arrastra la tecnología antigua y la moderna hacia la situación correspondiente.',
    'Repite hasta completar las 4 situaciones con sus pares correctos.'
  ],
  'RB-C2-N1': [
    'Revisa la fecha de modificación de cada archivo en la lista simulada de Drive.',
    'Arrastra las filas para ordenarlas de la fecha más antigua a la más reciente.',
    'Comprueba visualmente que el archivo del año más lejano quede arriba.',
    'Pulsa «Verificar orden» cuando creas que la secuencia es correcta.'
  ],
  'RB-C2-N2': [
    'Lee todos los pasos desordenados del plan de videollamada.',
    'Arrastra cada paso al área de secuencia en el orden lógico (de preparación a cierre).',
    'Piensa en qué paso debe ir primero para explicarle a un adulto mayor.',
    'Pulsa «Comprobar» cuando hayas colocado todos los pasos.'
  ],
  'RB-C2-N3': [
    'Identifica las operaciones del presupuesto escolar en los bloques disponibles.',
    'Arrastra cada fórmula u operación al orden lógico: sumar gastos → sumar ingresos → calcular saldo → comparar con el tope.',
    'Verifica que la comparación con $150.000 COP sea el último paso.',
    'Pulsa «Comprobar» para validar tu secuencia.'
  ],
  'RB-C3-N1': [
    'En el panel inferior verás bloques de pasos para hacer un sándwich y algunos bloques incorrectos (distractores).',
    'Arrastra solo los 7 pasos correctos a los espacios numerados del algoritmo, en orden secuencial.',
    'No uses bloques distractores (como «calentar en horno» o «lavar el plato»).',
    'Pulsa «Verificar algoritmo» cuando los 7 espacios estén llenos.'
  ],
  'RB-C3-N2': [
    'Lee el objetivo: controlar asistencia y alertar si baja del 80%.',
    'Arrastra los bloques de código del panel al área de programa en el orden lógico.',
    'Incluye: inicialización, bucle de lectura, cálculo de porcentaje y condicional de alerta.',
    'Pulsa «Ejecutar» para ver el reporte de inasistencia en el simulador.'
  ],
  'RB-C3-N3': [
    'Revisa los bloques de pseudocódigo del sistema de préstamo de libros.',
    'Arrastra los bloques correctos (Inicio, Leer datos, SI disponible, Registrar, Fin) a los espacios en orden.',
    'Descarta bloques distractores que no pertenecen al flujo de la biblioteca.',
    'Pulsa «Verificar» cuando los 5 espacios estén completos.'
  ],
  'RB-C4-N1': [
    'Lee los dos artículos breves sobre conectividad y brecha digital.',
    'Para cada pregunta, haz clic en la opción A, B o C que mejor responda según el texto.',
    'Puedes volver a leer los artículos antes de responder.',
    'Responde las 3 preguntas para completar la actividad de comprensión.'
  ],
  'RB-C4-N2': [
    'Lee las investigaciones sobre redes sociales y bienestar emocional.',
    'Selecciona la respuesta correcta haciendo clic en A, B o C para cada pregunta.',
    'Basa tu respuesta en lo que dice el texto, no en opiniones personales.',
    'Completa las 3 preguntas de la trivia.'
  ],
  'RB-C4-N3': [
    'Antes de escribir, piensa un momento: ¿qué problema de tu barrio o ciudad te gustaría resolver? (basura, agua, internet, etc.).',
    'Cuando tengas una idea clara, abre el editor y escribe una propuesta corta (mínimo 40 palabras): problema, solución tecnológica e impacto.',
    'No te preocupes por sonar experto: usa palabras sencillas como problema, tecnología/solución, impacto/beneficio.',
    'Cuando termines tu borrador, pulsa «Calificar texto» para recibir retroalimentación.'
  ],
  'RM-C1-N1': [
    'Explora las secciones sobre batería, pantalla OLED/LCD y memoria RAM.',
    'Lee cada explicación técnica antes de pasar a las preguntas.',
    'En la trivia, selecciona A, B, C o D según lo aprendido.',
    'Responde las 3 preguntas técnicas para completar el módulo.'
  ],
  'RM-C1-N2': [
    'Navega la línea de tiempo interactiva desde Pascal (1642) hasta Sycamore.',
    'Lee cada lección histórica con atención (ENIAC, Ada Lovelace, Ley de Moore, etc.).',
    'Al finalizar las lecciones, responde las 6 preguntas conceptuales.',
    'Selecciona una opción por pregunta; puedes revisar las lecciones si dudas.'
  ],
  'RM-C1-N3': [
    'Cierra los ojos un momento e imagina un salón de clase en el año 2040. ¿Qué tecnologías ves? (IA, realidad aumentada, nube, biometría…).',
    'Abre el editor y escribe ese escenario como si se lo contaras a un compañero (mín. 50 palabras).',
    'Intenta incluir tecnologías concretas, contexto colombiano e impactos o inequidades que podrían aparecer.',
    'Cuando tu borrador esté listo, pulsa «Calificar» para recibir retroalimentación.'
  ],
  'RM-C2-N1': [
    'Observa la hoja de cálculo con notas de estudiantes.',
    'Usa el editor de bloques (o macro) para: calcular promedio, máximo, mínimo y resaltar notas < 3.0 en rojo.',
    'Arrastra o escribe los bloques lógicos en el orden correcto.',
    'Ejecuta la macro y verifica que las celdas se formateen correctamente.'
  ],
  'RM-C2-N2': [
    'Fase 1: Lee sobre SVG (viewBox, formas, colores) en el módulo interactivo.',
    'Fase 2: Ordena los pasos de construcción de un logo arrastrándolos a la secuencia correcta.',
    'Fase 3: Aplica colores y estilos según las instrucciones de la paleta.',
    'Avanza con los botones «Siguiente» hasta completar las 4 fases.'
  ],
  'RM-C2-N3': [
    'Fase 1: Usa bloques SQL para crear las tablas Proveedores, Productos y Ventas.',
    'Fase 2: Inserta los 10 registros de muestra en cada tabla con bloques INSERT.',
    'Fase 3: Construye la consulta SELECT con SUM, COUNT y WHERE fecha = \'2025-05-17\'.',
    'Ejecuta cada fase con el botón «Ejecutar» antes de pasar a la siguiente.'
  ],
  'RM-C3-N1': [
    'Arrastra los bloques Arduino al programa: configurar pines 13 y 12, Serial, leer TMP36 en A0.',
    'Incluye la condición: si temperatura > 30°C encender LED rojo, si no LED verde.',
    'Pulsa «Ejecutar» para iniciar la simulación.',
    'Mueve el slider de temperatura para probar que los LEDs respondan correctamente.'
  ],
  'RM-C3-N2': [
    'Observa los espacios en blanco en el código JavaScript de votación.',
    'Arrastra el bloque correcto a cada hueco: getItem, JSON.stringify, forEach.',
    'El orden importa: primero leer de localStorage, luego convertir, luego pintar en pantalla.',
    'Pulsa «Ejecutar» para ver los votos registrados sin duplicados.'
  ],
  'RM-C3-N3': [
    'Completa los espacios del script Python WasteClassifier arrastrando bloques.',
    'Asigna self.peso en el constructor, agrega condicionales por material y maneja ValueError.',
    'Coloca cada bloque en el hueco que corresponde sintácticamente.',
    'Ejecuta el script y verifica la clasificación correcta del residuo.'
  ],
  'RM-C4-N1': [
    'Primero, piensa sin escribir: ¿qué redes, apps o servicios usas más en el día a día? No necesitas abrir tu celular.',
    'Cuando te sientas listo/a, abre el editor y escribe un informe reflexivo sobre tu huella digital (mín. 50 palabras).',
    'En tu texto incluye: las cuentas/apps que usas, qué riesgos de privacidad ves y al menos 3 medidas de protección (contraseña segura, 2FA, ajustes de privacidad).',
    'Cuando termines, pulsa «Calificar». No hay respuesta perfecta — lo importante es que reflexiones con honestidad.'
  ],
  'RM-C4-N2': [
    'Antes de escribir, pregúntate: ¿crees que el Estado debería regular la inteligencia artificial en Colombia? No hay postura correcta.',
    'Abre el editor y redacta tu argumento (mín. 50 palabras): elige a favor o en contra y justifica con evidencia.',
    'Intenta mencionar ejemplos como el AI Act de la UE y qué significaría algo similar en Colombia.',
    'Pulsa «Calificar» cuando tu borrador esté completo para recibir retroalimentación.'
  ],
  'RM-C4-N3': [
    'Imagina que mañana tu colegio publica reglas sobre ChatGPT, Copilot y herramientas similares. ¿Qué deberían decir?',
    'Abre el editor y escribe una política corta (mín. 50 palabras) con usos permitidos/prohibidos, derechos de estudiantes y consecuencias.',
    'Escribe como si se lo explicaras a un compañero de curso: claro, directo y justo.',
    'Pulsa «Calificar» cuando tu borrador refleje lo que realmente crees que debería regir en tu institución.'
  ],
  'RA-C1-N1': [
    'Haz clic en cada uno de los 9 componentes del smartphone para desmontarlo virtualmente.',
    'Lee la información técnica de cada pieza (pantalla, batería, placa, cámara, etc.).',
    'Al terminar el desmontaje, responde las preguntas de pensamiento crítico.',
    'Selecciona A, B, C o D en cada pregunta sobre sostenibilidad y cadena de suministro.'
  ],
  'RA-C1-N2': [
    'Abre cada pestaña: Imperativo, POO y Funcional.',
    'Completa los espacios en blanco del código Python en cada paradigma.',
    'Todos deben sumar los números pares de una lista.',
    'Pulsa «Ejecutar» en cada pestaña para verificar que la salida sea correcta.'
  ],
  'RA-C1-N3': [
    'Piensa en una patente o tecnología emergente que hayas oído (salud, energía, IA, agricultura…). ¿Sabes qué impacto podría tener en Colombia?',
    'Abre el editor y escribe tu análisis (mín. 50 palabras): nombra la patente/invención, explica brevemente cómo funciona y su impacto aquí.',
    'No necesitas ser experto: lo que importa es que conectes la tecnología con la realidad colombiana.',
    'Pulsa «Calificar» cuando tu borrador esté listo.'
  ],
  'RA-C2-N1': [
    'Completa los métodos GET y POST en el código Flask del simulador.',
    'Rellena la lógica de búsqueda por ID y el manejo de error 404.',
    'Ejecuta las pruebas integradas con el botón «Ejecutar».',
    'Verifica que las respuestas JSON y los códigos de error sean correctos.'
  ],
  'RA-C2-N2': [
    'Completa el script: carga del CSV, estadísticas descriptivas y configuración de gráficos Plotly.',
    'Rellena los filtros booleanos por año en los espacios indicados.',
    'Ejecuta el código y revisa que se generen los gráficos interactivos.',
    'Comprueba que los KPIs y filtros respondan al cambiar parámetros.'
  ],
  'RA-C2-N3': [
    'Completa el flujo del chatbot vocacional en los espacios de código.',
    'Asegura que capture entradas del usuario, recomiende carreras y guarde sesión en JSON.',
    'Sigue la lógica de preguntas → respuestas → recomendación.',
    'Ejecuta y prueba el flujo completo en la consola simulada.'
  ],
  'RA-C3-N1': [
    'Sigue las 4 fases de la guía: conceptos, circuito, código y simulación.',
    'En la fase de código, corrige variables e indentación en el sketch Arduino.',
    'Verifica conexiones de sensor de humedad, bomba y registro CSV.',
    'Ejecuta la simulación y observa el comportamiento en tiempo real.'
  ],
  'RA-C3-N2': [
    'Completa el pipeline ML: preprocesamiento, train_test_split, árbol de decisión y métricas.',
    'Rellena cada espacio del notebook Python con el bloque o línea correcta.',
    'Ejecuta celda por celda y revisa accuracy/precision en la salida.',
    'Verifica que las métricas y acciones preventivas queden documentadas.'
  ],
  'RA-C3-N3': [
    'Completa la lógica de la app de primeros auxilios en los espacios del simulador.',
    'Configura navegación entre pantallas, sensor GPS y botón de emergencia.',
    'Arrastra o escribe los bloques en el orden lógico del flujo.',
    'Ejecuta y comprueba que el flujo de emergencia funcione en la consola.'
  ],
  'RA-C4-N1': [
    'Lee con calma los 5 bloques de texto sobre sesgo algorítmico.',
    'Responde una pregunta a la vez; haz clic en A, B, C o D para seleccionar tu respuesta.',
    'Usa «Siguiente» para avanzar; puedes revisar el texto en cualquier momento.',
    'Completa las 4 preguntas de razonamiento crítico tipo ICFES.'
  ],
  'RA-C4-N2': [
    'Lee el texto sobre startups de impacto social en Colombia.',
    'Selecciona la opción correcta (A, B, C o D) para cada una de las 4 preguntas.',
    'Basa tu respuesta en el texto: propuesta de valor, Sistema B, unit economics, SOM.',
    'Avanza pregunta por pregunta hasta completar la actividad.'
  ],
  'RA-C4-N3': [
    'Lee el texto guía sobre investigación cualitativa y ética de campo.',
    'Responde las 4 preguntas seleccionando A, B, C o D según el contenido leído.',
    'Presta atención a: preguntas inducidas, saturación teórica, triangulación y consentimiento.',
    'Completa todas las preguntas para finalizar el módulo.'
  ],
};

export function getChallengeInstructions(challengeId: string): string[] {
  return challengeInstructions[challengeId] ?? [
    'Tómate un momento para leer la presentación del reto con calma.',
    'Cuando te sientas listo/a, sigue las indicaciones que aparecen en pantalla.',
    'Avanza paso a paso; puedes volver atrás si necesitas releer algo.',
    'Al terminar, usa los botones de verificación o ejecución. Si dudas, revisa los criterios en el panel lateral.'
  ];
}