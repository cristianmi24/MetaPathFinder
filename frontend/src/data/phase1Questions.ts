import { levelColors, type CustomQuestion } from '../types/evaluation';

export interface Question {
  id: string;
  category: string;
  context: string;
  metacognitivePrompt: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

interface RawQuestion {
  id: string;
  category: string;
  context: string;
  metacognitivePrompt: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

interface RawLevel {
  name: string;
  color: string;
  questions: RawQuestion[];
}

function toQuestion(raw: RawQuestion): Question {
  return raw as Question;
}

function toLevel(raw: RawLevel): { name: string; color: string; questions: Question[] } {
  return {
    name: raw.name,
    color: raw.color,
    questions: raw.questions.map(toQuestion),
  };
}

const rawB1: RawQuestion[] = [
  {
    id: 'B1_HTML_H1',
    category: 'HTML',
    context: 'Pienses en la última vez que creaste una página web desde cero.',
    metacognitivePrompt: '¿Qué tan seguro estás de que conoces la diferencia entre las etiquetas &lt;title&gt; y &lt;h1&gt; en HTML?',
    text: '¿Cuál es la diferencia principal entre las etiquetas &lt;title&gt; y &lt;h1&gt; en HTML?',
    options: [
      '&lt;title&gt; define el título de la pestaña del navegador; &lt;h1&gt; define el encabezado principal visible en la página.',
      'Ambas etiquetas hacen lo mismo: muestran el título en la página.',
      '&lt;title&gt; se usa para imágenes; &lt;h1&gt; se usa para párrafos.',
      '&lt;h1&gt; es para el título de la pestaña; &lt;title&gt; es para encabezados.',
    ],
    correctAnswer: '&lt;title&gt; define el título de la pestaña del navegador; &lt;h1&gt; define el encabezado principal visible en la página.',
  },
  {
    id: 'B2_CSS_BACKGROUND',
    category: 'CSS',
    context: 'Imagina que estás dando estilo a una página web y quieres cambiar el color de fondo de un elemento.',
    metacognitivePrompt: '¿Qué tan seguro estás de que sabes qué propiedad CSS usar para cambiar el color de fondo?',
    text: '¿Qué propiedad CSS se usa para cambiar el color de fondo de un elemento?',
    options: ['background-color', 'color', 'bg-color', 'font-color'],
    correctAnswer: 'background-color',
  },
  {
    id: 'B3_JS_ALERT',
    category: 'JavaScript',
    context: 'Estás programando un mensaje emergente para confirmar una acción del usuario en tu sitio web.',
    metacognitivePrompt: '¿Qué tan seguro estás de que sabes cuál función de JavaScript muestra un mensaje en pantalla?',
    text: '¿Cuál es la función correcta en JavaScript para mostrar un mensaje emergente en el navegador?',
    options: ['console.log()', 'alert()', 'message()', 'popup()'],
    correctAnswer: 'alert()',
  },
  {
    id: 'B4_GITHUB_INIT',
    category: 'Git',
    context: 'Acabas de crear un proyecto nuevo desde cero y quieres comenzar a usar Git para control de versiones.',
    metacognitivePrompt: '¿Qué tan seguro estás de que sabes cómo inicializar un repositorio Git?',
    text: '¿Cuál comando se usa para iniciar un repositorio Git en un directorio?',
    options: ['git start', 'git init', 'git new', 'git setup'],
    correctAnswer: 'git init',
  },
  {
    id: 'B5_LOGICA_VARIABLES',
    category: 'Lógica',
    context: 'Estás escribiendo código donde una variable cambiará su valor varias veces durante la ejecución.',
    metacognitivePrompt: '¿Qué tan seguro estás de que sabes qué palabra clave usar para declarar la variable?',
    text: 'En JavaScript moderno, ¿qué palabra clave usarías para declarar una variable que puede cambiar de valor?',
    options: ['const', 'let', 'var', 'int'],
    correctAnswer: 'let',
  },
];

const rawB1V1: RawQuestion[] = [
  {
    id: 'B1_HTML_H1_V1',
    category: 'HTML',
    context: 'Estás estructurando una página web con contenido jerárquico.',
    metacognitivePrompt: '¿Qué tan seguro estás de que sabes cuántos niveles de encabezado tiene HTML?',
    text: '¿Cuántos niveles de encabezados (heading) existen en HTML?',
    options: ['3', '5', '6', '7'],
    correctAnswer: '6',
  },
  {
    id: 'B2_CSS_BACKGROUND_V1',
    category: 'CSS',
    context: 'Estás personalizando una caja en tu página web.',
    metacognitivePrompt: '¿Qué tan seguro estás de que conoces las propiedades CSS para fondos?',
    text: '¿Cuál propiedad NO se usa para manipular fondos en CSS?',
    options: ['background-image', 'background-repeat', 'background-size', 'color'],
    correctAnswer: 'color',
  },
  {
    id: 'B3_JS_ALERT_V1',
    category: 'JavaScript',
    context: 'Necesitas pedirle al usuario que ingrese un valor.',
    metacognitivePrompt: '¿Qué tan seguro estás de que sabes qué función usar?',
    text: '¿Cuál función de JavaScript permite al usuario ingresar un valor mediante un cuadro de texto emergente?',
    options: ['alert()', 'confirm()', 'prompt()', 'input()'],
    correctAnswer: 'prompt()',
  },
  {
    id: 'B4_GITHUB_INIT_V1',
    category: 'Git',
    context: 'Quieres verificar el estado actual de tu repositorio Git.',
    metacognitivePrompt: '¿Qué tan seguro estás de que sabes qué comando usar?',
    text: '¿Qué comando de Git muestra el estado actual del repositorio?',
    options: ['git status', 'git check', 'git state', 'git info'],
    correctAnswer: 'git status',
  },
  {
    id: 'B5_LOGICA_VARIABLES_V1',
    category: 'Lógica',
    context: 'Estás viendo código escrito en versiones anteriores de JavaScript.',
    metacognitivePrompt: '¿Qué tan seguro estás de que differences entre formas de declarar variables?',
    text: '¿Cuál es la principal diferencia entre let y var en JavaScript?',
    options: ['let tiene alcance de bloque y var tiene alcance de función', 'let es más rápida que var', 'var no puede reasignarse y let sí', 'No hay diferencia'],
    correctAnswer: 'let tiene alcance de bloque y var tiene alcance de función',
  },
];

const rawB1V2: RawQuestion[] = [
  {
    id: 'B1_HTML_H1_V2',
    category: 'HTML',
    context: 'Estás optimizando el SEO de una página web mediante la estructura HTML.',
    metacognitivePrompt: '¿Qué tan seguro estás de que sabes el impacto SEO de los encabezados?',
    text: '¿Cuál es la etiqueta de encabezado más importante para el SEO en una página web?',
    options: ['&lt;h6&gt;', '&lt;h1&gt;', '&lt;title&gt;', '&lt;header&gt;'],
    correctAnswer: '&lt;h1&gt;',
  },
  {
    id: 'B2_CSS_BACKGROUND_V2',
    category: 'CSS',
    context: 'Quieres que una imagen de fondo no se repita.',
    metacognitivePrompt: '¿Qué tan seguro estás de que sabes cómo controlar la repetición de fondos?',
    text: '¿Qué propiedad CSS evita que una imagen de fondo se repita?',
    options: ['background-repeat: no-repeat', 'background-image: no-repeat', 'background: no-repeat', 'repeat: none'],
    correctAnswer: 'background-repeat: no-repeat',
  },
  {
    id: 'B3_JS_ALERT_V2',
    category: 'JavaScript',
    context: 'Necesitas preguntar al usuario si está seguro antes de eliminar datos.',
    metacognitivePrompt: '¿Qué tan seguro estás de que conoces las funciones de diálogo?',
    text: '¿Qué función de JavaScript muestra un mensaje con opciones Aceptar y Cancelar?',
    options: ['alert()', 'confirm()', 'prompt()', 'message()'],
    correctAnswer: 'confirm()',
  },
  {
    id: 'B4_GITHUB_INIT_V2',
    category: 'Git',
    context: 'Quieres añadir un archivo específico al área de preparación (stage).',
    metacognitivePrompt: '¿Qué tan seguro estás de que conoces el flujo de trabajo de Git?',
    text: '¿Qué comando añade un archivo al área de preparación (staging area) en Git?',
    options: ['git commit', 'git add', 'git stage', 'git push'],
    correctAnswer: 'git add',
  },
  {
    id: 'B5_LOGICA_VARIABLES_V2',
    category: 'Lógica',
    context: 'Estás declarando una constante en tu código.',
    metacognitivePrompt: '¿Qué tan seguro estás de las reglas de const?',
    text: '¿Cuál de las siguientes afirmaciones sobre const en JavaScript es correcta?',
    options: ['No puede declararse sin valor inicial', 'Puede reasignarse con =', 'Tiene alcance global siempre', 'Equivale a let'],
    correctAnswer: 'No puede declararse sin valor inicial',
  },
];

const rawM1: RawQuestion[] = [
  {
    id: 'M1_HTML_LINKS',
    category: 'HTML',
    context: 'Estás construyendo la navegación principal de un sitio web con enlaces a diferentes secciones.',
    metacognitivePrompt: '¿Qué tan seguro estás de que conoces los atributos de los enlaces HTML?',
    text: '¿Qué atributo HTML define la URL de destino en un enlace &lt;a&gt;?',
    options: ['src', 'href', 'link', 'url'],
    correctAnswer: 'href',
  },
  {
    id: 'M2_CSS_PADDING',
    category: 'CSS',
    context: 'Estás ajustando la separación entre el contenido y el borde de una tarjeta.',
    metacognitivePrompt: '¿Qué tan seguro estás de que differences padding de margin?',
    text: '¿Qué propiedad CSS controla el espacio entre el contenido de un elemento y su borde?',
    options: ['margin', 'padding', 'border-spacing', 'gap'],
    correctAnswer: 'padding',
  },
  {
    id: 'M3_JS_ONCLICK',
    category: 'JavaScript',
    context: 'Quieres que un botón ejecute una función cuando el usuario haga clic.',
    metacognitivePrompt: '¿Qué tan seguro estás de que sabes cómo manejar eventos en JS?',
    text: '¿Qué atributo HTML se usa para ejecutar JavaScript cuando se hace clic en un elemento?',
    options: ['onhover', 'onclick', 'onpress', 'ontap'],
    correctAnswer: 'onclick',
  },
  {
    id: 'M4_GITHUB_COMMIT',
    category: 'Git',
    context: 'Has preparado tus cambios con git add y ahora quieres guardarlos con un mensaje.',
    metacognitivePrompt: '¿Qué tan seguro estás del flujo de commits en Git?',
    text: '¿Qué comando guarda los cambios preparados con un mensaje descriptivo?',
    options: ['git push -m', 'git commit -m', 'git add -m', 'git save -m'],
    correctAnswer: 'git commit -m',
  },
  {
    id: 'M5_LOGICA_COMPARACION',
    category: 'Lógica',
    context: 'Estás escribiendo una condición para comparar dos valores en JavaScript.',
    metacognitivePrompt: '¿Qué tan seguro estás de que differences los operadores de comparación?',
    text: '¿Cuál es la diferencia entre == y === en JavaScript?',
    options: ['== compara valor, === compara valor y tipo', '== compara tipo, === compara valor', 'Ambos son idénticos', '=== es más lento que =='],
    correctAnswer: '== compara valor, === compara valor y tipo',
  },
];

const rawM1V1: RawQuestion[] = [
  {
    id: 'M1_HTML_LINKS_V1',
    category: 'HTML',
    context: 'Quieres abrir un enlace en una nueva pestaña del navegador.',
    metacognitivePrompt: '¿Qué tan seguro estás sobre los atributos de enlaces?',
    text: '¿Qué atributo HTML permite abrir un enlace en una nueva pestaña?',
    options: ['target="_blank"', 'new="_tab"', 'open="new"', 'tab="new"'],
    correctAnswer: 'target="_blank"',
  },
  {
    id: 'M2_CSS_PADDING_V1',
    category: 'CSS',
    context: 'Estás separando un botón de los elementos que lo rodean.',
    metacognitivePrompt: '¿Qué tan seguro estás del modelo de caja CSS?',
    text: '¿Qué propiedad CSS crea espacio EXTERIOR alrededor de un elemento?',
    options: ['padding', 'margin', 'border', 'outline'],
    correctAnswer: 'margin',
  },
  {
    id: 'M3_JS_ONCLICK_V1',
    category: 'JavaScript',
    context: 'Quieres asociar un evento a un elemento desde el propio JavaScript.',
    metacognitivePrompt: '¿Qué tan seguro estás de los métodos de eventos en JS?',
    text: '¿Cuál método de JavaScript añade un evento a un elemento de forma programática?',
    options: ['element.click()', 'addEventListener()', 'onEvent()', 'element.event()'],
    correctAnswer: 'addEventListener()',
  },
  {
    id: 'M4_GITHUB_COMMIT_V1',
    category: 'Git',
    context: 'Quieres ver el historial de commits del repositorio.',
    metacognitivePrompt: '¿Qué tan seguro estás de los comandos de historial en Git?',
    text: '¿Qué comando de Git muestra el historial de commits?',
    options: ['git history', 'git log', 'git show', 'git list'],
    correctAnswer: 'git log',
  },
  {
    id: 'M5_LOGICA_COMPARACION_V1',
    category: 'Lógica',
    context: 'Necesitas comprobar si un número es mayor que otro.',
    metacognitivePrompt: '¿Qué tan seguro estás de los operadores relacionales?',
    text: '¿Cuál operador devuelve true si el valor de la izquierda es mayor o igual al de la derecha?',
    options: ['>', '>=', '=>', '&gt;='],
    correctAnswer: '>=',
  },
];

const rawM1V2: RawQuestion[] = [
  {
    id: 'M1_HTML_LINKS_V2',
    category: 'HTML',
    context: 'Estás creando un enlace para enviar un correo electrónico.',
    metacognitivePrompt: '¿Qué tan seguro estás sobre los protocolos en enlaces HTML?',
    text: '¿Qué valor debe tener el atributo href para crear un enlace de correo electrónico?',
    options: ['mailto:', 'email:', 'send:', 'mail:'],
    correctAnswer: 'mailto:',
  },
  {
    id: 'M2_CSS_PADDING_V2',
    category: 'CSS',
    context: 'Quieres aplicar padding solo al lado derecho de un elemento.',
    metacognitivePrompt: '¿Qué tan seguro estás de las propiedades específicas de padding?',
    text: '¿Qué propiedad CSS añade padding solo al lado derecho?',
    options: ['padding-right', 'padding-right-side', 'padding-horizontal', 'right-padding'],
    correctAnswer: 'padding-right',
  },
  {
    id: 'M3_JS_ONCLICK_V2',
    category: 'JavaScript',
    context: 'Estás depurando un código que usa eventos en línea.',
    metacognitivePrompt: '¿Qué tan seguro estás del orden de parámetros en eventos?',
    text: 'En un manejador de eventos con addEventListener, ¿cuál es el primer parámetro?',
    options: ['La función a ejecutar', 'El tipo de evento', 'El elemento HTML', 'Un booleano'],
    correctAnswer: 'El tipo de evento',
  },
  {
    id: 'M4_GITHUB_COMMIT_V2',
    category: 'Git',
    context: 'Has cometido un error en el mensaje del último commit.',
    metacognitivePrompt: '¿Qué tan seguro estás de cómo corregir mensajes en Git?',
    text: '¿Qué comando permite modificar el mensaje del último commit?',
    options: ['git commit --amend -m "nuevo mensaje"', 'git commit --fix', 'git commit --edit', 'git commit --replace'],
    correctAnswer: 'git commit --amend -m "nuevo mensaje"',
  },
  {
    id: 'M5_LOGICA_COMPARACION_V2',
    category: 'Lógica',
    context: 'Quieres comprobar si dos condiciones se cumplen al mismo tiempo.',
    metacognitivePrompt: '¿Qué tan seguro estás de los operadores lógicos?',
    text: '¿Qué operador lógico devuelve true solo si ambas condiciones son verdaderas?',
    options: ['&& (AND)', '|| (OR)', '! (NOT)', '?? (Nullish)'],
    correctAnswer: '&& (AND)',
  },
];

const rawE1: RawQuestion[] = [
  {
    id: 'E1_HTML_REQUIRED',
    category: 'HTML',
    context: 'Estás diseñando un formulario de registro donde ciertos campos son obligatorios.',
    metacognitivePrompt: '¿Qué tan seguro estás de la validación nativa de HTML5?',
    text: '¿Qué atributo HTML5 hace que un campo de formulario sea obligatorio?',
    options: ['required', 'validate', 'mandatory', 'force'],
    correctAnswer: 'required',
  },
  {
    id: 'E2_CSS_FLEXBOX',
    category: 'CSS',
    context: 'Estás centrando elementos dentro de un contenedor flexible.',
    metacognitivePrompt: '¿Qué tan seguro estás de las propiedades de alineación en Flexbox?',
    text: '¿Qué propiedad de Flexbox alinea elementos en el eje transversal (vertical si flex-direction es row)?',
    options: ['justify-content', 'align-items', 'flex-align', 'cross-axis'],
    correctAnswer: 'align-items',
  },
  {
    id: 'E3_JS_DOM',
    category: 'JavaScript',
    context: 'Necesitas seleccionar y modificar un elemento específico del DOM.',
    metacognitivePrompt: '¿Qué tan seguro estás de los métodos de selección del DOM?',
    text: '¿Cuál método selecciona un elemento del DOM por su ID?',
    options: ['querySelectorAll()', 'getElementById()', 'getElementsByClass()', 'selectById()'],
    correctAnswer: 'getElementById()',
  },
  {
    id: 'E4_GITHUB_PUSH',
    category: 'Git',
    context: 'Has hecho commits locales y ahora quieres subirlos al repositorio remoto.',
    metacognitivePrompt: '¿Qué tan seguro estás de la sincronización remota en Git?',
    text: '¿Qué comando sube los commits locales al repositorio remoto?',
    options: ['git pull', 'git push', 'git fetch', 'git sync'],
    correctAnswer: 'git push',
  },
  {
    id: 'E5_LOGICA_IF',
    category: 'Lógica',
    context: 'Estás escribiendo una estructura condicional con múltiples casos.',
    metacognitivePrompt: '¿Qué tan seguro estás de la sintaxis condicional en JS?',
    text: '¿Cuál es la sintaxis correcta de una estructura if-else en JavaScript?',
    options: [
      'if (condición) { } else { }',
      'if cond then { } else { }',
      'if (condición) then { } else { }',
      'if condición { } else { }',
    ],
    correctAnswer: 'if (condición) { } else { }',
  },
];

const rawE1V1: RawQuestion[] = [
  {
    id: 'E1_HTML_REQUIRED_V1',
    category: 'HTML',
    context: 'Quieres pre-seleccionar una opción en un checkbox.',
    metacognitivePrompt: '¿Qué tan seguro estás de los atributos de formularios HTML?',
    text: '¿Qué atributo HTML marca un checkbox como seleccionado por defecto?',
    options: ['checked', 'selected', 'default', 'true'],
    correctAnswer: 'checked',
  },
  {
    id: 'E2_CSS_FLEXBOX_V1',
    category: 'CSS',
    context: 'Quieres distribuir espacio uniformemente entre elementos flexibles.',
    metacognitivePrompt: '¿Qué tan seguro estás de justify-content en Flexbox?',
    text: '¿Qué valor de justify-content distribuye elementos con espacio uniforme entre ellos?',
    options: ['space-between', 'space-around', 'center', 'evenly'],
    correctAnswer: 'space-between',
  },
  {
    id: 'E3_JS_DOM_V1',
    category: 'JavaScript',
    context: 'Necesitas seleccionar todos los elementos que comparten una clase.',
    metacognitivePrompt: '¿Qué tan seguro estás de los selectores múltiples del DOM?',
    text: '¿Qué método selecciona todos los elementos con una clase específica?',
    options: ['querySelector()', 'getElementsByClassName()', 'querySelectorAll()', 'getElementByClass()'],
    correctAnswer: 'getElementsByClassName()',
  },
  {
    id: 'E4_GITHUB_PUSH_V1',
    category: 'Git',
    context: 'Quieres obtener los cambios más recientes del repositorio remoto.',
    metacognitivePrompt: '¿Qué tan seguro estás de cómo actualizar tu repo local?',
    text: '¿Qué comando descarga y fusiona cambios del repositorio remoto al local?',
    options: ['git push', 'git pull', 'git fetch', 'git sync'],
    correctAnswer: 'git pull',
  },
  {
    id: 'E5_LOGICA_IF_V1',
    category: 'Lógica',
    context: 'Tienes múltiples condiciones que evaluar secuencialmente.',
    metacognitivePrompt: '¿Qué tan seguro estás de las estructuras condicionales anidadas?',
    text: '¿Qué estructura permite evaluar múltiples condiciones en JavaScript?',
    options: ['if-else if-else', 'if-if-if', 'for-if', 'while-if'],
    correctAnswer: 'if-else if-else',
  },
];

const rawE1V2: RawQuestion[] = [
  {
    id: 'E1_HTML_REQUIRED_V2',
    category: 'HTML',
    context: 'Estás diseñando un campo de solo lectura.',
    metacognitivePrompt: '¿Qué tan seguro estás de los estados de campos HTML?',
    text: '¿Qué atributo HTML impide que el usuario modifique un campo pero permite verlo?',
    options: ['readonly', 'disabled', 'locked', 'static'],
    correctAnswer: 'readonly',
  },
  {
    id: 'E2_CSS_FLEXBOX_V2',
    category: 'CSS',
    context: 'Quieres que los elementos flexibles ocupen todo el espacio disponible.',
    metacognitivePrompt: '¿Qué tan seguro estás de las propiedades de flexibilidad?',
    text: '¿Qué propiedad CSS hace que un elemento flexible crezca para ocupar espacio disponible?',
    options: ['flex-grow', 'flex-shrink', 'flex-basis', 'flex-expand'],
    correctAnswer: 'flex-grow',
  },
  {
    id: 'E3_JS_DOM_V2',
    category: 'JavaScript',
    context: 'Necesitas cambiar el texto dentro de un elemento HTML.',
    metacognitivePrompt: '¿Qué tan seguro estás de la manipulación del DOM?',
    text: '¿Qué propiedad se usa para cambiar el contenido HTML interno de un elemento?',
    options: ['innerHTML', 'innerText', 'textContent', 'nodeValue'],
    correctAnswer: 'innerHTML',
  },
  {
    id: 'E4_GITHUB_PUSH_V2',
    category: 'Git',
    context: 'Quieres ver las diferencias entre dos ramas de Git.',
    metacognitivePrompt: '¿Qué tan seguro estás de los comandos de comparación en Git?',
    text: '¿Qué comando de Git muestra las diferencias entre ramas o commits?',
    options: ['git diff', 'git compare', 'git show', 'git branch --diff'],
    correctAnswer: 'git diff',
  },
  {
    id: 'E5_LOGICA_IF_V2',
    category: 'Lógica',
    context: 'Necesitas ejecutar código diferente según el valor exacto de una variable.',
    metacognitivePrompt: '¿Qué tan seguro estás de las alternativas a if-else?',
    text: '¿Qué estructura de JavaScript es más eficiente para múltiples condiciones basadas en el mismo valor?',
    options: ['switch-case', 'if-else anidado', 'for loop', 'while loop'],
    correctAnswer: 'switch-case',
  },
];


const rawLevels: RawLevel[] = [
  {
    name: 'Básico',
    color: levelColors.basico,
    questions: rawB1,
  },
  {
    name: 'Intermedio',
    color: levelColors.intermedio,
    questions: rawM1,
  },
  {
    name: 'Experto',
    color: levelColors.experto,
    questions: rawE1,
  },
];

export const phase1Levels = rawLevels.map(toLevel);

function makeVariations(v: RawQuestion[]): Question[] {
  return v.map(toQuestion);
}

export const questionVariations: Record<string, Question[]> = {
  B1_HTML_H1: makeVariations([...rawB1V1.slice(0, 1), ...rawB1V2.slice(0, 1)]),
  B2_CSS_BACKGROUND: makeVariations([...rawB1V1.slice(1, 2), ...rawB1V2.slice(1, 2)]),
  B3_JS_ALERT: makeVariations([...rawB1V1.slice(2, 3), ...rawB1V2.slice(2, 3)]),
  B4_GITHUB_INIT: makeVariations([...rawB1V1.slice(3, 4), ...rawB1V2.slice(3, 4)]),
  B5_LOGICA_VARIABLES: makeVariations([...rawB1V1.slice(4, 5), ...rawB1V2.slice(4, 5)]),
  M1_HTML_LINKS: makeVariations([...rawM1V1.slice(0, 1), ...rawM1V2.slice(0, 1)]),
  M2_CSS_PADDING: makeVariations([...rawM1V1.slice(1, 2), ...rawM1V2.slice(1, 2)]),
  M3_JS_ONCLICK: makeVariations([...rawM1V1.slice(2, 3), ...rawM1V2.slice(2, 3)]),
  M4_GITHUB_COMMIT: makeVariations([...rawM1V1.slice(3, 4), ...rawM1V2.slice(3, 4)]),
  M5_LOGICA_COMPARACION: makeVariations([...rawM1V1.slice(4, 5), ...rawM1V2.slice(4, 5)]),
  E1_HTML_REQUIRED: makeVariations([...rawE1V1.slice(0, 1), ...rawE1V2.slice(0, 1)]),
  E2_CSS_FLEXBOX: makeVariations([...rawE1V1.slice(1, 2), ...rawE1V2.slice(1, 2)]),
  E3_JS_DOM: makeVariations([...rawE1V1.slice(2, 3), ...rawE1V2.slice(2, 3)]),
  E4_GITHUB_PUSH: makeVariations([...rawE1V1.slice(3, 4), ...rawE1V2.slice(3, 4)]),
  E5_LOGICA_IF: makeVariations([...rawE1V1.slice(4, 5), ...rawE1V2.slice(4, 5)]),
};
