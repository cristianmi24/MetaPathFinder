/**
 * Tercer nivel de pista (solución análoga guiada o contraejemplo) y analogía cotidiana
 * por reto. Completan la escalera de pistas: 1 = pregunta reflexiva (consejo del profesor),
 * 2 = señalamiento directo del error frecuente, 3 = contraejemplo / solución análoga.
 */
export interface TutorHint3 {
  /** Solución análoga guiada: el mismo razonamiento aplicado a un caso parecido, sin dar la respuesta. */
  analogia: string;
  /** Contraejemplo: qué pasaría si se hiciera "al revés", para que el estudiante note el error. */
  contraejemplo: string;
  /** Versión simplificada para el modo guiado paso a paso (replanificación tras 3 errores). */
  pasosGuiados: string[];
}

export const tutorHints3: Record<string, TutorHint3> = {
  'RB-C1-N1': {
    analogia: 'Piensa en una familia: primero el bisabuelo, luego el abuelo, luego tus padres. Los inventos también tienen "generaciones": la rueda es el bisabuelo, el smartphone el nieto.',
    contraejemplo: 'Si pones el smartphone antes de la imprenta, estarías diciendo que la gente chateaba antes de poder leer libros impresos. ¿Tiene sentido?',
    pasosGuiados: ['Separa las tarjetas en dos montones: «antes de la electricidad» y «después».', 'Ordena primero el montón antiguo (rueda, imprenta…).', 'Ordena el montón moderno (teléfono, computador, smartphone).', 'Junta los dos montones y verifica.'],
  },
  'RB-C1-N2': {
    analogia: 'Un poste con cables lleva energía (Eléctrica); un paradero sirve para subirse al bus (Transporte); una obra con cemento es Construcción. Pregunta siempre "¿qué hace esto por la gente?".',
    contraejemplo: 'Si clasificaras el transformador como Transporte, estarías diciendo que la gente se sube a él para ir al colegio.',
    pasosGuiados: ['Toma una sola imagen.', 'Pregunta: ¿lleva energía, mueve personas o es una obra fija?', 'Arrástrala a esa categoría.', 'Repite con la siguiente.'],
  },
  'RB-C1-N3': {
    analogia: 'Problema: "avisar a alguien lejos". Antes: carta. Hoy: WhatsApp. Haz la misma pregunta por cada situación: ¿qué problema resolvía la gente y con qué lo resuelve hoy?',
    contraejemplo: 'Emparejar "conservar alimentos" con "telégrafo" sería como meter la comida en un aparato de mensajes.',
    pasosGuiados: ['Lee una situación y di en voz baja el problema.', 'Busca la tecnología antigua que lo resolvía.', 'Busca la moderna que la reemplazó.', 'Pasa a la siguiente situación.'],
  },
  'RB-C2-N1': {
    analogia: 'Es como ordenar fotos de cumpleaños: la de cuando tenías 5 años va antes que la de los 12. Mira solo la fecha, no el nombre.',
    contraejemplo: 'Si ordenaras por nombre, un archivo "Antiguo.docx" de 2024 quedaría arriba de "Zeta.docx" de 2019, aunque sea más nuevo.',
    pasosGuiados: ['Busca el año más pequeño en pantalla.', 'Arrastra ese archivo al primer lugar.', 'Busca el siguiente año más pequeño.', 'Sigue hasta el más reciente.'],
  },
  'RB-C2-N2': {
    analogia: 'Enseñar a cocinar: primero eliges la receta, luego preparas ingredientes, luego cocinas y al final sirves. Con la videollamada: elegir app → preparar → explicar → cerrar.',
    contraejemplo: '"Hacer la llamada" antes de "elegir la aplicación" es como marcar un número sin tener teléfono.',
    pasosGuiados: ['Pon primero el paso de elegir la aplicación.', 'Luego los pasos de preparación (instalar, configurar).', 'Luego cómo llamar.', 'Al final cómo terminar la llamada.'],
  },
  'RB-C2-N3': {
    analogia: 'Con tu mesada: sumas lo que gastas, sumas lo que recibes, restas y recién ahí sabes si te alcanza para el regalo.',
    contraejemplo: 'Comparar con el tope de $150.000 antes de calcular el saldo es como decidir si te alcanza sin saber cuánto tienes.',
    pasosGuiados: ['Bloque 1: suma de gastos.', 'Bloque 2: suma de ingresos.', 'Bloque 3: ingresos − gastos = saldo.', 'Bloque 4: comparar el saldo con el tope.'],
  },
  'RB-C3-N1': {
    analogia: 'Una receta de arepa: sacas la masa, la amasas, la pones en la plancha, la volteas, la sirves. Nada de "hornear" ni "lavar el plato" en medio.',
    contraejemplo: 'Si pones "cerrar el sándwich" antes de "poner el jamón", te queda un sándwich de pan con pan.',
    pasosGuiados: ['Descarta los bloques que no son parte de la receta.', 'Pon el primer paso: tomar el pan.', 'Agrega los ingredientes en orden.', 'Termina con cerrar el sándwich.'],
  },
  'RB-C3-N2': {
    analogia: 'Como en el colegio: primero pasan lista (contar), luego sacan el porcentaje y solo después deciden si llaman al acudiente.',
    contraejemplo: 'Mostrar la alerta antes de calcular el porcentaje es como regañar a alguien sin haber contado si faltó.',
    pasosGuiados: ['Inicializa los contadores.', 'Recorre la lista contando presentes.', 'Calcula el porcentaje.', 'Si es menor al 80 %, muestra la alerta.'],
  },
  'RB-C3-N3': {
    analogia: 'Pedir un libro: el bibliotecario pregunta tus datos, mira si hay ejemplares, y solo si hay, lo registra. Igual el pseudocódigo.',
    contraejemplo: 'Registrar el préstamo sin verificar disponibilidad es prestar un libro que no existe.',
    pasosGuiados: ['Inicio.', 'Leer los datos del estudiante y del libro.', 'SI hay ejemplar disponible → registrar.', 'Fin.'],
  },
  'RB-C4-N1': {
    analogia: 'Es como un examen de lectura: la respuesta no es la que te parece justa, sino la que el texto dice. Subraya la frase que la respalda.',
    contraejemplo: 'Si respondes "todos los hogares tienen internet" porque en tu casa sí hay, el texto te contradice con sus cifras.',
    pasosGuiados: ['Lee la pregunta.', 'Vuelve al párrafo que habla de ese tema.', 'Encuentra la frase que responde.', 'Marca la opción que coincide con esa frase.'],
  },
  'RB-C4-N2': {
    analogia: 'Igual que una noticia: lo que "suena bien" no siempre es lo que dice el estudio. Busca el dato en el texto.',
    contraejemplo: 'Elegir "las redes solo hacen daño" cuando el texto habla de efectos positivos y negativos es ignorar la mitad del artículo.',
    pasosGuiados: ['Lee la pregunta.', 'Localiza el párrafo del tema.', 'Compara cada opción con el texto.', 'Elige la que el texto respalda.'],
  },
  'RB-C4-N3': {
    analogia: 'Modelo: «En mi barrio se inunda la calle (problema) → propongo sensores de lluvia con alerta por SMS (tecnología) → la gente saca el carro a tiempo (impacto)».',
    contraejemplo: 'Escribir solo "en mi barrio hay mucha basura" es describir el problema sin proponer nada; falta la tecnología y el impacto.',
    pasosGuiados: ['Frase 1: el problema concreto de tu comunidad.', 'Frase 2: la tecnología que propones.', 'Frase 3: cómo cambiaría la vida de la gente.', 'Revisa que tengas al menos 40 palabras.'],
  },
  'RM-C1-N1': {
    analogia: 'El celular es como un cuerpo: la batería es el estómago (energía), la pantalla los ojos (imagen) y la RAM la memoria de corto plazo (velocidad).',
    contraejemplo: 'Decir que la RAM "guarda las fotos para siempre" confunde memoria de trabajo con almacenamiento: al apagar, la RAM se borra.',
    pasosGuiados: ['Abre el módulo de batería y anota su función.', 'Haz lo mismo con pantalla y RAM.', 'Responde cada pregunta pensando "¿para qué sirve esta pieza?".'],
  },
  'RM-C1-N2': {
    analogia: 'Como la historia del transporte: carreta → tren → avión. Computación: máquinas mecánicas → válvulas → transistores → chips → cuántica.',
    contraejemplo: 'Ubicar ENIAC en la era mecánica es como decir que el avión existía antes que la rueda.',
    pasosGuiados: ['Lee cada lección sin saltarte ninguna.', 'Anota una palabra clave por era.', 'En el cuestionario, ubica cada pregunta en su era.'],
  },
  'RM-C1-N3': {
    analogia: 'Imagina que escribes una carta a un estudiante de 2040: nombra dos tecnologías reales (IA, realidad aumentada) y di si un colegio rural de Colombia podría tenerlas y por qué.',
    contraejemplo: 'Listar "hologramas, robots, naves" sin decir si existirían en Colombia es ciencia ficción, no prospectiva.',
    pasosGuiados: ['Elige dos tecnologías reales.', 'Describe una clase usando cada una.', 'Di si un colegio rural podría tenerlas.', 'Cierra con el impacto en los estudiantes.'],
  },
  'RM-C2-N1': {
    analogia: 'Primero calculas el promedio del curso en tu cabeza y luego marcas con rojo a quien va perdiendo. La macro hace lo mismo: cálculo primero, color después.',
    contraejemplo: 'Pintar de rojo antes de calcular es como poner la nota en rojo sin saber si está por debajo de 3.0.',
    pasosGuiados: ['Bloque promedio.', 'Bloque máximo y mínimo.', 'Bloque condicional: si nota < 3.0 → rojo.', 'Ejecuta y revisa las celdas.'],
  },
  'RM-C2-N2': {
    analogia: 'Dibujar un logo es como construir una casa: primero entiendes los planos (SVG), luego ordenas las etapas, luego pintas.',
    contraejemplo: 'Colorear sin haber ordenado los pasos es pintar paredes que aún no existen.',
    pasosGuiados: ['Lee la fase 1 completa.', 'Ordena los pasos en la fase 2.', 'Aplica la paleta en la fase 3.', 'Revisa en la fase 4.'],
  },
  'RM-C2-N3': {
    analogia: 'Un archivador: primero compras el mueble (CREATE TABLE), luego guardas carpetas (INSERT), luego buscas una (SELECT … WHERE fecha = …).',
    contraejemplo: 'Hacer SELECT antes de CREATE es buscar una carpeta en un archivador que todavía no has comprado.',
    pasosGuiados: ['Fase 1: crear las tablas.', 'Fase 2: insertar los datos.', 'Fase 3: SELECT con SUM y COUNT filtrando por la fecha.'],
  },
  'RM-C3-N1': {
    analogia: 'Un LED es como una lámpara: antes de encenderla hay que conectar el enchufe. En Arduino, el "enchufe" es declarar el pin como SALIDA.',
    contraejemplo: 'Sin pinMode(12, OUTPUT) el LED no enciende aunque el código diga "encender": es como oprimir el interruptor de una lámpara desenchufada.',
    pasosGuiados: ['Configura los pines 12 y 13 como SALIDA.', 'Lee el sensor TMP36.', 'Si temperatura > 30 → LED rojo; si no → LED verde.', 'Imprime en el monitor serial.'],
  },
  'RM-C3-N2': {
    analogia: 'Como una alcancía: primero miras cuánto hay guardado (getItem), lo conviertes a monedas (JSON.parse), agregas y vuelves a guardar (JSON.stringify).',
    contraejemplo: 'Mostrar los votos antes de leer localStorage es anunciar el ganador sin haber abierto la urna.',
    pasosGuiados: ['Leer lo guardado con getItem.', 'Convertir con JSON.parse.', 'Agregar el voto y guardar con JSON.stringify.', 'Recorrer con forEach para mostrar.'],
  },
  'RM-C3-N3': {
    analogia: 'Clasificar basura en casa: miras qué es (atributos), decides el contenedor (condicionales) y si alguien te pasa algo raro ("peso: hola") preguntas de nuevo (ValueError).',
    contraejemplo: 'Sin manejar la excepción, un peso escrito como texto rompe todo el programa: es como que la máquina se apague porque alguien dijo "mucho" en vez de "2 kg".',
    pasosGuiados: ['Constructor con tipo y peso.', 'Validar el peso: si no es número → ValueError.', 'Condicionales por tipo de residuo.', 'Ejecutar el script.'],
  },
  'RM-C4-N1': {
    analogia: 'Haz un inventario como el de un morral: qué apps llevas (Instagram, WhatsApp…), qué datos guardan de ti y qué pasaría si se pierden.',
    contraejemplo: 'Listar apps sin decir el riesgo es como enumerar las llaves que tienes sin pensar qué puertas abren.',
    pasosGuiados: ['Lista 3 apps que usas.', 'Para cada una, un dato que guarda de ti.', 'Un riesgo de cada dato.', 'Tres medidas de protección.'],
  },
  'RM-C4-N2': {
    analogia: 'Estructura de abogado: «Creo que sí / no se debe regular → porque… → por ejemplo, la Unión Europea hizo el AI Act → en Colombia esto significaría…».',
    contraejemplo: 'Opinar "la IA es peligrosa" sin un ejemplo real de regulación es una opinión, no un argumento.',
    pasosGuiados: ['Escribe tu postura en una frase.', 'Da una razón.', 'Cita el AI Act u otra regulación real.', 'Aterriza al caso colombiano.'],
  },
  'RM-C4-N3': {
    analogia: 'Como el manual de convivencia: qué se puede (usar IA para repasar), qué no (entregar un texto hecho por IA como propio) y qué pasa si no se cumple.',
    contraejemplo: 'Prohibir toda la IA sin justificar deja fuera usos legítimos, como ayudarle a un estudiante con discapacidad visual.',
    pasosGuiados: ['Usos permitidos (2).', 'Usos prohibidos (2).', 'Derechos del estudiante.', 'Consecuencias claras.'],
  },
  'RA-C1-N1': {
    analogia: 'Cada pieza del celular tiene una historia como la de una camiseta: de dónde viene el algodón, quién la cosió y a dónde va cuando la botas.',
    contraejemplo: 'Saltarse la lectura de cada componente es como responder un examen de historia sin haber abierto el libro.',
    pasosGuiados: ['Desmonta una pieza y lee su ficha.', 'Anota material y origen.', 'Repite con las 9 piezas.', 'Responde el cuestionario.'],
  },
  'RA-C1-N2': {
    analogia: 'Sumar los pares es como contar monedas de a 200: imperativo = las cuentas una a una con un ciclo; POO = una clase Caja con el método sumar; funcional = filter(par) + sum.',
    contraejemplo: 'Copiar el mismo ciclo for en las tres pestañas es como responder tres preguntas distintas con la misma frase.',
    pasosGuiados: ['Pestaña imperativa: ciclo + condición % 2.', 'Pestaña POO: clase con atributo lista y método suma.', 'Pestaña funcional: filter + sum.', 'Ejecuta cada una y compara resultados.'],
  },
  'RA-C1-N3': {
    analogia: 'Analiza la patente como un árbitro: qué hace, quién la aprovecha en Colombia y quién podría quedar por fuera (costo, conectividad, formación).',
    contraejemplo: 'Describir la patente sin tocar Colombia es un resumen técnico, no un análisis de impacto social.',
    pasosGuiados: ['Describe la patente en 2 frases.', 'Un beneficio concreto para Colombia.', 'Un riesgo de exclusión.', 'Cierre: quién gana y quién pierde.'],
  },
  'RA-C2-N1': {
    analogia: 'Una API es como la ventanilla de la secretaría: si pides la nota de un estudiante que no existe, te dicen "no encontrado" (404), no te entregan una hoja en blanco con "todo bien".',
    contraejemplo: 'Devolver 200 cuando el estudiante no existe hace que la app del acudiente muestre una nota vacía como si fuera real.',
    pasosGuiados: ['Ruta GET /notas/<id>.', 'Buscar el estudiante.', 'Si no existe → responder 404 con mensaje.', 'Si existe → responder 200 con JSON.'],
  },
  'RA-C2-N2': {
    analogia: 'Graficar sin cargar bien el CSV es como hacer un pastel con la bolsa de harina cerrada: primero abre (read_csv), revisa (head) y luego cocina (plot).',
    contraejemplo: 'Si el separador está mal, Pandas lee una sola columna gigante y la gráfica sale vacía.',
    pasosGuiados: ['pd.read_csv con el separador correcto.', 'df.head() para verificar columnas.', 'Agrupar por grado.', 'Graficar con Plotly.'],
  },
  'RA-C2-N3': {
    analogia: 'Un orientador vocacional anota tus respuestas antes de sugerir una carrera. El chatbot debe guardar cada respuesta en el JSON antes de recomendar.',
    contraejemplo: 'Recomendar sin guardar es como que el orientador te diga "estudia medicina" sin haberte preguntado nada.',
    pasosGuiados: ['Hacer la pregunta.', 'Guardar la respuesta en el diccionario.', 'Escribir el JSON.', 'Solo al final: recomendar según las respuestas.'],
  },
  'RA-C3-N1': {
    analogia: 'Regar una huerta: primero conectas la manguera (circuito), luego decides cuándo abrir la llave (código). Sin circuito, el código no tiene a quién dar la orden.',
    contraejemplo: 'Programar el riego antes de conectar el sensor de humedad es escribir instrucciones para un sensor que no existe.',
    pasosGuiados: ['Fase circuito: sensor de humedad y bomba.', 'Leer humedad.', 'Si humedad < umbral → activar bomba.', 'Probar con el simulador.'],
  },
  'RA-C3-N2': {
    analogia: 'Entrenar un modelo con datos sucios es como estudiar con un cuaderno lleno de errores: aprenderás los errores. Limpia (nulos, duplicados) antes de entrenar.',
    contraejemplo: 'Si hay filas con edad = −1, el modelo "aprende" que los estudiantes de −1 años desertan.',
    pasosGuiados: ['Cargar el dataset.', 'Limpiar nulos y valores imposibles.', 'Separar entrenamiento y prueba.', 'Entrenar y evaluar.'],
  },
  'RA-C3-N3': {
    analogia: 'En una emergencia real primero sabes dónde estás y luego pides ayuda: la app debe obtener el GPS antes de enviar la alerta.',
    contraejemplo: 'Enviar la alerta y activar el GPS después manda a la ambulancia a una dirección vacía.',
    pasosGuiados: ['Pedir permiso de ubicación.', 'Obtener coordenadas.', 'Botón de emergencia.', 'Enviar alerta con las coordenadas.'],
  },
  'RA-C4-N1': {
    analogia: 'Como un juez: no decides por lo que suena justo, sino por la evidencia del texto. Subraya la frase que respalda tu opción.',
    contraejemplo: 'Elegir "el algoritmo es neutral" porque te parece lógico, cuando el texto muestra datos sesgados, es ignorar la evidencia.',
    pasosGuiados: ['Lee la pregunta.', 'Encuentra el párrafo del tema.', 'Descarta las opciones que el texto contradice.', 'Elige la que el texto respalda.'],
  },
  'RA-C4-N2': {
    analogia: 'Una startup de impacto es como una panadería que dona pan: sigue vendiendo pan para pagar sueldos. Beneficencia sin ingresos se acaba cuando se acaba la donación.',
    contraejemplo: 'Llamar "modelo de negocio sostenible" a regalar todo el producto es confundir caridad con empresa.',
    pasosGuiados: ['Identifica el problema social.', 'Identifica cómo genera ingresos.', 'Verifica que ambos aparezcan en el texto.', 'Elige la opción coherente.'],
  },
  'RA-C4-N3': {
    analogia: 'Una buena pregunta de entrevista es como una puerta abierta: "¿Cómo fue tu experiencia?" deja hablar. "¿Verdad que fue difícil?" empuja la respuesta.',
    contraejemplo: 'Las preguntas inductivas "ayudan" al entrevistado a decir lo que el investigador quiere oír: eso contamina los datos.',
    pasosGuiados: ['Lee el caso.', 'Identifica preguntas abiertas vs. inductivas.', 'Revisa la triangulación de fuentes.', 'Elige la opción metodológicamente correcta.'],
  },
};

export function getTutorHint3(challengeId: string): TutorHint3 {
  return tutorHints3[challengeId] ?? {
    analogia: 'Piensa en una situación de tu vida diaria que se parezca a este reto y resuélvela primero mentalmente; luego traslada esos pasos a la actividad.',
    contraejemplo: 'Imagina que haces los pasos en el orden contrario: ¿en qué punto deja de tener sentido? Ese es el paso clave.',
    pasosGuiados: ['Relee la meta del reto.', 'Divide la tarea en tres pasos pequeños.', 'Resuelve solo el primero y verifica.', 'Continúa con los siguientes.'],
  };
}
