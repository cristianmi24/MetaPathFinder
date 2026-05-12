export interface JOLQuestion {
  id: string;
  tipo: 'fijo' | 'especifico';
  pregunta: string;
  metrica_contraste: string;
}

export interface Challenge {
  id: string;
  dificultad: string;
  nombre: string;
  ejercicio_fase_b: string;
  evaluacion_desempeño: string;
  interfaz: 'web' | 'logic' | 'terminal';
  pista: string;
  jol_preguntas: JOLQuestion[];
}

export interface Level {
  nivel: number;
  titulo: string;
  retos: Challenge[];
}

export const challengeBank: Level[] = [
  {
    "nivel": 1,
    "titulo": "Básico: Maquetación y Estructura",
    "retos": [
      {
        "id": "1.1",
        "dificultad": "Muy Fácil",
        "nombre": "La Tarjeta Personal",
        "ejercicio_fase_b": "Crear un HTML con h1, p e img; centrar con CSS externo.",
        "evaluacion_desempeño": "Validación de sintaxis W3C y carga de archivos locales.",
        "interfaz": "web",
        "pista": "Heurística: Revisa si el atributo 'src' de la imagen tiene la URL correcta y si el 'text-align' está en el contenedor principal.",
        "jol_preguntas": [
          {"id": "f1", "tipo": "fijo", "pregunta": "¿Qué tan seguro estás de completar el reto?", "metrica_contraste": "Nota_Final"},
          {"id": "f2", "tipo": "fijo", "pregunta": "¿Cuántos minutos tardarás?", "metrica_contraste": "Tiempo_Total_Seg"},
          {"id": "f3", "tipo": "fijo", "pregunta": "¿Qué nota sacarás (1-10)?", "metrica_contraste": "Performance_Score"},
          {"id": "e1", "tipo": "especifico", "pregunta": "¿Qué tan seguro estás de que la imagen cargará correctamente?", "metrica_contraste": "Status_Code_Assets"},
          {"id": "e2", "tipo": "especifico", "pregunta": "¿Confías en que el CSS está bien vinculado?", "metrica_contraste": "Computed_Style_Detection"}
        ]
      },
      {
        "id": "1.2",
        "dificultad": "Fácil",
        "nombre": "El Menú de Navegación",
        "ejercicio_fase_b": "Crear lista ul/li y alinear horizontalmente con Flexbox.",
        "evaluacion_desempeño": "Verificación de propiedad display:flex en el contenedor ul.",
        "interfaz": "web",
        "pista": "Heurística: Para alinear elementos en fila, el contenedor padre (ul) debe tener una propiedad de caja flexible activa.",
        "jol_preguntas": [
          {"id": "f1", "tipo": "fijo", "pregunta": "¿Qué tan seguro estás de completar el reto?", "metrica_contraste": "Nota_Final"},
          {"id": "f2", "tipo": "fijo", "pregunta": "¿Cuántos minutos tardarás?", "metrica_contraste": "Tiempo_Total_Seg"},
          {"id": "f3", "tipo": "fijo", "pregunta": "¿Qué nota sacarás (1-10)?", "metrica_contraste": "Performance_Score"},
          {"id": "e1", "tipo": "especifico", "pregunta": "¿Qué tan seguro estás de usar Flexbox sin consultar guías?", "metrica_contraste": "Num_Tabs_Switches"},
          {"id": "e2", "tipo": "especifico", "pregunta": "¿Confías en que los enlaces son clicables?", "metrica_contraste": "Href_Attribute_Presence"}
        ]
      },
      {
        "id": "1.3",
        "dificultad": "Un poco más difícil",
        "nombre": "Layout de Noticias Responsive",
        "ejercicio_fase_b": "Maquetar 3 columnas que pasen a 1 en móviles usando Media Queries.",
        "evaluacion_desempeño": "Prueba de renderizado en resolución < 768px.",
        "interfaz": "web",
        "pista": "Heurística: Usa @media (max-width: 768px) y cambia el flujo del contenedor de 'row' a 'column'.",
        "jol_preguntas": [
          {"id": "f1", "tipo": "fijo", "pregunta": "¿Qué tan seguro estás de completar el reto?", "metrica_contraste": "Nota_Final"},
          {"id": "f2", "tipo": "fijo", "pregunta": "¿Cuántos minutos tardarás?", "metrica_contraste": "Tiempo_Total_Seg"},
          {"id": "f3", "tipo": "fijo", "pregunta": "¿Qué nota sacarás (1-10)?", "metrica_contraste": "Performance_Score"},
          {"id": "e1", "tipo": "especifico", "pregunta": "¿Qué tan seguro estás de configurar el breakpoint correcto?", "metrica_contraste": "Media_Query_Accuracy"},
          {"id": "e2", "tipo": "especifico", "pregunta": "¿Confías en que el diseño no se 'romperá' en móvil?", "metrica_contraste": "Overflow_Detection"}
        ]
      }
    ]
  },
  {
    "nivel": 2,
    "titulo": "Intermedio: Lógica y Control de Versiones",
    "retos": [
      {
        "id": "2.1",
        "dificultad": "Muy Fácil",
        "nombre": "El Contador de Clics",
        "ejercicio_fase_b": "Botón JS que aumenta un número en pantalla.",
        "evaluacion_desempeño": "Event Listener 'click' y actualización del innerText.",
        "interfaz": "logic",
        "pista": "Heurística: Asegúrate de que el ID que usas en querySelector coincida exactamente con el id definido en el HTML del botón.",
        "jol_preguntas": [
          {"id": "f1", "tipo": "fijo", "pregunta": "¿Qué tan seguro estás de completar el reto?", "metrica_contraste": "Nota_Final"},
          {"id": "f2", "tipo": "fijo", "pregunta": "¿Cuántos minutos tardarás?", "metrica_contraste": "Tiempo_Total_Seg"},
          {"id": "f3", "tipo": "fijo", "pregunta": "¿Qué nota sacarás (1-10)?", "metrica_contraste": "Performance_Score"},
          {"id": "e1", "tipo": "especifico", "pregunta": "¿Seguro de que el número no se reseteará solo?", "metrica_contraste": "Variable_Scope_Check"},
          {"id": "e2", "tipo": "especifico", "pregunta": "¿Confías en seleccionar el ID correcto del DOM?", "metrica_contraste": "getElementById_Success"}
        ]
      },
      {
        "id": "2.2",
        "dificultad": "Fácil",
        "nombre": "Validador de Edad",
        "ejercicio_fase_b": "Input de edad con condicional if/else para mostrar mensajes.",
        "evaluacion_desempeño": "Pruebas unitarias con valores 17, 18 y texto no numérico.",
        "interfaz": "logic",
        "pista": "Heurística: Recuerda que los valores de los inputs suelen venir como strings; compáralos con el número 18 usando >=.",
        "jol_preguntas": [
          {"id": "f1", "tipo": "fijo", "pregunta": "¿Qué tan seguro estás de completar el reto?", "metrica_contraste": "Nota_Final"},
          {"id": "f2", "tipo": "fijo", "pregunta": "¿Cuántos minutos tardarás?", "metrica_contraste": "Tiempo_Total_Seg"},
          {"id": "f3", "tipo": "fijo", "pregunta": "¿Qué nota sacarás (1-10)?", "metrica_contraste": "Performance_Score"},
          {"id": "e1", "tipo": "especifico", "pregunta": "¿Qué tan seguro estás de manejar números y strings?", "metrica_contraste": "Type_Casting_Check"},
          {"id": "e2", "tipo": "especifico", "pregunta": "¿Confías en que el mensaje será el correcto para 18 años?", "metrica_contraste": "Boundary_Condition_Test"}
        ]
      },
      {
        "id": "2.3",
        "dificultad": "Un poco más difícil",
        "nombre": "Gestión de Ramas con Git",
        "ejercicio_fase_b": "Crear rama, modificar archivo y hacer merge exitoso.",
        "evaluacion_desempeño": "Análisis del historial de comandos (.git/logs).",
        "interfaz": "terminal",
        "pista": "Heurística: El flujo es: crear rama (checkout -b), simular cambios, volver a main (checkout main) y unir (merge).",
        "jol_preguntas": [
          {"id": "f1", "tipo": "fijo", "pregunta": "¿Qué tan seguro estás de completar el reto?", "metrica_contraste": "Nota_Final"},
          {"id": "f2", "tipo": "fijo", "pregunta": "¿Cuántos minutos tardarás?", "metrica_contraste": "Tiempo_Total_Seg"},
          {"id": "f3", "tipo": "fijo", "pregunta": "¿Qué nota sacarás (1-10)?", "metrica_contraste": "Performance_Score"},
          {"id": "e1", "tipo": "especifico", "pregunta": "¿Qué tan seguro estás de no perder cambios al cambiar de rama?", "metrica_contraste": "Uncommitted_Changes_Check"},
          {"id": "e2", "tipo": "especifico", "pregunta": "¿Confías en resolver conflictos de fusión?", "metrica_contraste": "Merge_Conflict_Resolution"}
        ]
      }
    ]
  },
  {
    "nivel": 3,
    "titulo": "Avanzado: Integración y APIs",
    "retos": [
      {
        "id": "3.1",
        "dificultad": "Muy Fácil",
        "nombre": "Generador de Colores Aleatorios",
        "ejercicio_fase_b": "Cambiar color del body al azar con Math.random().",
        "evaluacion_desempeño": "Validación de formato hexadecimal en el estilo aplicado.",
        "interfaz": "logic",
        "pista": "Heurística: Math.random() genera un número entre 0 y 1. Multiplícalo por 256 para obtener valores válidos de RGB.",
        "jol_preguntas": [
          {"id": "f1", "tipo": "fijo", "pregunta": "¿Qué tan seguro estás de completar el reto?", "metrica_contraste": "Nota_Final"},
          {"id": "f2", "tipo": "fijo", "pregunta": "¿Cuántos minutos tardarás?", "metrica_contraste": "Tiempo_Total_Seg"},
          {"id": "f3", "tipo": "fijo", "pregunta": "¿Qué nota sacarás (1-10)?", "metrica_contraste": "Performance_Score"},
          {"id": "e1", "tipo": "especifico", "pregunta": "¿Seguro de generar el rango correcto (0-255 o hex)?", "metrica_contraste": "Math_Logic_Accuracy"},
          {"id": "e2", "tipo": "especifico", "pregunta": "¿Confías en que el color cambiará en cada clic?", "metrica_contraste": "Function_Execution_Count"}
        ]
      },
      {
        "id": "3.2",
        "dificultad": "Fácil",
        "nombre": "Lista de Tareas (To-Do List)",
        "ejercicio_fase_b": "Agregar y eliminar elementos de una lista dinámicamente.",
        "evaluacion_desempeño": "Verificación de eliminación de nodos específicos en el DOM.",
        "interfaz": "logic",
        "pista": "Heurística: Usa document.createElement('li') para crear la tarea y list.appendChild(item) para mostrarla.",
        "jol_preguntas": [
          {"id": "f1", "tipo": "fijo", "pregunta": "¿Qué tan seguro estás de completar el reto?", "metrica_contraste": "Nota_Final"},
          {"id": "f2", "tipo": "fijo", "pregunta": "¿Cuántos minutos tardarás?", "metrica_contraste": "Tiempo_Total_Seg"},
          {"id": "f3", "tipo": "fijo", "pregunta": "¿Qué nota sacarás (1-10)?", "metrica_contraste": "Performance_Score"},
          {"id": "e1", "tipo": "especifico", "pregunta": "¿Seguro de borrar solo la tarea seleccionada y no todas?", "metrica_contraste": "Event_Delegation_Accuracy"},
          {"id": "e2", "tipo": "especifico", "pregunta": "¿Confías en que la lista no permitirá tareas vacías?", "metrica_contraste": "Empty_Input_Validation"}
        ]
      },
      {
        "id": "3.3",
        "dificultad": "Un poco más difícil",
        "nombre": "Buscador con API Fetch",
        "ejercicio_fase_b": "Consultar API de GitHub y mostrar datos con Async/Await.",
        "evaluacion_desempeño": "Manejo de errores 404 y estados de carga (Loading).",
        "interfaz": "logic",
        "pista": "Heurística: Recuerda usar await tanto en el fetch como en la conversión a JSON (.json()). Usa try/catch para los errores.",
        "jol_preguntas": [
          {"id": "f1", "tipo": "fijo", "pregunta": "¿Qué tan seguro estás de completar el reto?", "metrica_contraste": "Nota_Final"},
          {"id": "f2", "tipo": "fijo", "pregunta": "¿Cuántos minutos tardarás?", "metrica_contraste": "Tiempo_Total_Seg"},
          {"id": "f3", "tipo": "fijo", "pregunta": "¿Qué nota sacarás (1-10)?", "metrica_contraste": "Performance_Score"},
          {"id": "e1", "tipo": "especifico", "pregunta": "¿Qué tan seguro estás de manejar la promesa sin errores?", "metrica_contraste": "Try_Catch_Presence"},
          {"id": "e2", "tipo": "especifico", "pregunta": "¿Confías en procesar el JSON de respuesta correctamente?", "metrica_contraste": "Data_Parsing_Success"}
        ]
      }
    ]
  }
];
