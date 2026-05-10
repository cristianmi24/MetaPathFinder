import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, CheckCircle2, ChevronRight, Target, AlertCircle, RefreshCcw, Send, BarChart3, Code2, Lock, BookOpen, Route } from 'lucide-react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useCognitiveTracking } from '../hooks/useCognitiveTracking';
import { phase1Levels, questionVariations, type Question } from '../data/phase1Questions';

interface PerceptionQuestion {
  id: number;
  category: string;
  text: string;
}

interface ChallengeAttempt {
  questionId: string;
  perception: number;
  isCorrect: boolean;
  calibration: number;
  variationAttempts: number;
  blocked: boolean;
}

const perceptionQuestions: PerceptionQuestion[] = [
  { id: 1, category: "Lógica y Condicionales", text: "¿Cómo te sientes resolviendo problemas que implican múltiples condiciones anidadas (if/else)?" },
  { id: 2, category: "Ciclos e Iteración", text: "¿Qué tan seguro te sientes al implementar bucles complejos y controlar su terminación?" },
  { id: 3, category: "Estructuras de Datos", text: "¿Qué tanto dominas el acceso y la manipulación de datos en arreglos y matrices?" },
  { id: 4, category: "Pensamiento Algorítmico", text: "¿Cómo calificarías tu capacidad para descomponer un problema complejo en pasos lógicos?" }
];


function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getHumilityTip(questionId: string): string {
  const tips: Record<string, string> = {
    B1_HTML_H1: '¡Ojo! La etiqueta &lt;title&gt; es para la pestaña del navegador, no para el contenido. &lt;h1&gt; es para el encabezado principal visible en la página. ¡Inténtalo de nuevo!',
    B2_CSS_BACKGROUND: '¡Ojo! La propiedad "color" cambia el color del texto, no el fondo. Para el fondo necesitas "background-color". ¡Revisa y vuelve a intentarlo!',
    B3_JS_ALERT: '¡Ojo! "console.log()" muestra mensajes en la consola del navegador, no en pantalla. "alert()" es la función que muestra ventanas emergentes visibles. ¡Un intento más!',
    B4_GITHUB_INIT: '¡Ojo! "git start" y "git setup" no son comandos reales de Git. El comando correcto para iniciar un repositorio es "git init". ¡Concéntrate y vuelve a intentarlo!',
    B5_LOGICA_VARIABLES: '¡Ojo! "const" declara una constante que no puede reasignarse. Para variables que cambian de valor necesitas "let". ¡Piénsalo de nuevo!',
    M1_HTML_LINKS: '¡Ojo! El atributo "src" se usa para imágenes y scripts. En los enlaces &lt;a&gt;, quien define la dirección es "href". ¡Revisa y vuelve a intentarlo!',
    M2_CSS_PADDING: '¡Ojo! "margin" separa el elemento de otros (espacio externo), mientras que "padding" separa el contenido del borde (espacio interno). ¡Concéntrate en la diferencia!',
    M3_JS_ONCLICK: '¡Ojo! "onhover" no existe como atributo HTML estándar. El evento de clic en HTML se maneja con "onclick". ¡Dale otro intento!',
    M4_GITHUB_COMMIT: '¡Ojo! "git push" envía cambios al remoto, "git add" prepara archivos. El que guarda con mensaje es "git commit -m". ¡Inténtalo de nuevo!',
    M5_LOGICA_COMPARACION: '¡Ojo! "=" es asignación, no comparación. Para comparar igualdad de valor sin importar el tipo se usa "==". ¡Revisa y vuelve a intentarlo!',
    E1_HTML_REQUIRED: '¡Ojo! "validate" no es un atributo HTML real. El atributo que hace obligatorio un campo en HTML5 es "required". ¡Concéntrate y dale otro intento!',
    E2_CSS_FLEXBOX: '¡Ojo! "align-items" alinea en el eje transversal (vertical). Para el eje principal (horizontal) en Flexbox se usa "justify-content". ¡Reconsidera!',
    E3_JS_DOM: '¡Ojo! "querySelectorAll()" selecciona múltiples elementos por CSS selector, no por ID. Para seleccionar un elemento por su ID se usa "getElementById()". ¡Inténtalo otra vez!',
    E4_GITHUB_PUSH: '¡Ojo! "git pull" trae cambios del remoto, no envía. Para subir tus commits locales a GitHub se usa "git push origin main". ¡Revisa y vuelve a hacerlo!',
    E5_LOGICA_IF: '¡Ojo! La sintaxis "if cond then" no es JavaScript. En JS la estructura condicional correcta es "if (condición) { } else { }". ¡Concéntrate!',
  };
  return tips[questionId] || '¡Revisa bien el concepto y vuelve a intentarlo con una variación del reto!';
}

function getLessonText(questionId: string): string {
  const lessons: Record<string, { title: string; content: string }> = {
    B1_HTML_H1: {
      title: 'Jerarquía Semántica en HTML',
      content: 'HTML define 6 niveles de encabezados: &lt;h1&gt; (el más importante) hasta &lt;h6&gt; (el menos importante). &lt;h1&gt; se usa para el título principal de la página, &lt;h2&gt; para subtítulos, y así sucesivamente. &lt;title&gt; solo define el texto de la pestaña del navegador, no es parte del contenido visible. Los motores de búsqueda usan esta jerarquía para entender la estructura del contenido.'
    },
    B2_CSS_BACKGROUND: {
      title: 'Propiedades de Fondo en CSS',
      content: 'CSS ofrece varias propiedades para fondos: "background-color" para color sólido, "background-image" para imágenes, "background-repeat" para controlar repetición. "color" solo afecta el texto, no el fondo del elemento.'
    },
    B3_JS_ALERT: {
      title: 'Funciones de Diálogo en JavaScript',
      content: 'JavaScript tiene tres funciones de diálogo: alert(mensaje) — muestra un mensaje con botón Aceptar; confirm(mensaje) — pregunta con Aceptar/Cancelar; prompt(mensaje) — pide entrada al usuario. console.log() solo escribe en la consola de herramientas de desarrollo.'
    },
    B4_GITHUB_INIT: {
      title: 'Inicialización de Repositorios Git',
      content: 'Para empezar a usar Git en un proyecto: 1) Abre la terminal en la carpeta del proyecto. 2) Ejecuta "git init" para crear el repositorio. 3) Esto crea una carpeta oculta .git que almacena todo el historial de versiones.'
    },
    B5_LOGICA_VARIABLES: {
      title: 'Declaración de Variables en JavaScript',
      content: 'JavaScript moderno (ES6+) tiene tres formas de declarar variables: "const" — valor constante que no puede reasignarse; "let" — valor que puede cambiar, con alcance de bloque; "var" — forma tradicional, con alcance de función. Usa "let" cuando necesites reasignar.'
    },
    M1_HTML_LINKS: {
      title: 'Atributos de Enlaces HTML',
      content: 'El elemento &lt;a&gt; crea hipervínculos. Su atributo principal es "href" (Hypertext REFerence) que contiene la URL de destino. "src" se usa en &lt;img&gt;, &lt;script&gt;, &lt;iframe&gt; para especificar la fuente del recurso.'
    },
    M2_CSS_PADDING: {
      title: 'Modelo de Caja CSS',
      content: 'El modelo de caja CSS tiene 4 capas: content (contenido), padding (espacio interno entre contenido y borde), border (borde), margin (espacio externo entre elementos). padding aumenta el área visible del elemento, margin separa elementos entre sí.'
    },
    M3_JS_ONCLICK: {
      title: 'Eventos en JavaScript',
      content: 'Los eventos permiten ejecutar código cuando el usuario interactúa. onclick se dispara al hacer clic. Se asigna de varias formas: como atributo HTML (&lt;button onclick="funcion()"&gt;), como propiedad JS (elemento.onclick = funcion), o con addEventListener.'
    },
    M4_GITHUB_COMMIT: {
      title: 'Flujo Básico de Git',
      content: 'El flujo básico: 1) git add archivo — prepara cambios (stage). 2) git commit -m "mensaje" — guarda los cambios con una descripción. 3) git push — envía commits al remoto. git status muestra el estado actual del repositorio.'
    },
    M5_LOGICA_COMPARACION: {
      title: 'Operadores de Comparación en JavaScript',
      content: 'JavaScript tiene dos operadores de igualdad: "==" (igualdad abstracta) — compara valor después de convertir tipos; "===" (igualdad estricta) — compara valor y tipo sin conversión. "=" es asignación, no comparación.'
    },
    E1_HTML_REQUIRED: {
      title: 'Validación de Formularios HTML5',
      content: 'HTML5 introdujo validación nativa sin JavaScript. El atributo "required" hace obligatorio un campo. "disabled" deshabilita el campo. "readonly" lo hace solo lectura. "checked" marca opción seleccionada en checkboxes/radios.'
    },
    E2_CSS_FLEXBOX: {
      title: 'Alineación con Flexbox',
      content: 'Flexbox tiene dos ejes: main axis (principal, horizontal por defecto) y cross axis (transversal, vertical). "justify-content" alinea en el eje principal (center, flex-start, flex-end, space-between, space-around). "align-items" alinea en el eje transversal.'
    },
    E3_JS_DOM: {
      title: 'Selección de Elementos del DOM',
      content: 'El DOM (Document Object Model) permite acceder a elementos HTML desde JavaScript: getElementById("id") — selecciona por ID único; querySelector(".clase") — selecciona el primer elemento que coincide con un selector CSS; querySelectorAll("div") — selecciona todos los que coinciden.'
    },
    E4_GITHUB_PUSH: {
      title: 'Sincronización Remota con Git',
      content: 'Para compartir cambios: 1) git remote add origin URL — vincula repositorio local con remoto. 2) git push -u origin main — primera subida. 3) git push origin main — subidas posteriores. "git pull" trae cambios del remoto al local.'
    },
    E5_LOGICA_IF: {
      title: 'Estructuras Condicionales en JavaScript',
      content: 'La estructura if-else ejecuta código según una condición: if (condición) { } — se ejecuta si es verdadera; else { } — se ejecuta si es falsa; else if (condición) { } — evalúa múltiples condiciones. switch-case es otra forma de múltiples condiciones.'
    },
  };
  return lessons[questionId]?.content || 'Revisa los fundamentos de este concepto antes de continuar.';
}

function getLessonTitle(questionId: string): string {
  const titles: Record<string, string> = {
    B1_HTML_H1: 'Jerarquía Semántica en HTML',
    B2_CSS_BACKGROUND: 'Propiedades de Fondo en CSS',
    B3_JS_ALERT: 'Funciones de Diálogo en JavaScript',
    B4_GITHUB_INIT: 'Inicialización de Repositorios Git',
    B5_LOGICA_VARIABLES: 'Declaración de Variables en JavaScript',
    M1_HTML_LINKS: 'Atributos de Enlaces HTML',
    M2_CSS_PADDING: 'Modelo de Caja CSS',
    M3_JS_ONCLICK: 'Eventos en JavaScript',
    M4_GITHUB_COMMIT: 'Flujo Básico de Git',
    M5_LOGICA_COMPARACION: 'Operadores de Comparación en JavaScript',
    E1_HTML_REQUIRED: 'Validación de Formularios HTML5',
    E2_CSS_FLEXBOX: 'Alineación con Flexbox',
    E3_JS_DOM: 'Selección de Elementos del DOM',
    E4_GITHUB_PUSH: 'Sincronización Remota con Git',
    E5_LOGICA_IF: 'Estructuras Condicionales en JavaScript',
  };
  return titles[questionId] || 'Micro-Lección';
}

function isCategoryBlocked(blocked: Record<number, string[]>, category: string, levelIdx: number): boolean {
  return (blocked[levelIdx] || []).includes(category);
}

function getAvailableAlternative(
  currentLevelIdx: number,
  currentQuestionPos: number,
  blockedCategories: Record<number, string[]>,
  shuffledOrder: number[],
): { question: Question; levelIdx: number; questionIdx: number } | null {
  const level = phase1Levels[currentLevelIdx];
  for (let pos = currentQuestionPos + 1; pos < shuffledOrder.length; pos++) {
    const actualIdx = shuffledOrder[pos];
    const q = level.questions[actualIdx];
    if (!isCategoryBlocked(blockedCategories, q.category, currentLevelIdx)) {
      return { question: q, levelIdx: currentLevelIdx, questionIdx: pos };
    }
  }
  return null;
}

export function Evaluations() {
  const [phase, setPhase] = useState<'intro' | 'perception' | 'challenge' | 'humility_tip' | 'blocked' | 'freno' | 'socratic' | 'results'>('intro');
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>(() => shuffleArray(phase1Levels[0].questions.map((_, i) => i)));
  const [currentQuestionPos, setCurrentQuestionPos] = useState(0);
  const [variationIdx, setVariationIdx] = useState(0);
  const [variationPool, setVariationPool] = useState<number[]>([]);
  const [perceptions, setPerceptions] = useState<{ questionId: string; variationIdx: number; value: number }[]>([]);
  const [currentPerceptionValue, setCurrentPerceptionValue] = useState(5);
  const [attempts, setAttempts] = useState<ChallengeAttempt[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [questionFailures, setQuestionFailures] = useState<Record<string, number>>({});
  const [blockedCategories, setBlockedCategories] = useState<Record<number, string[]>>({});
  const [passedCategories, setPassedCategories] = useState<Record<number, string[]>>({});
  const [justBlockedInfo, setJustBlockedInfo] = useState<{ category: string; nodeId: string } | null>(null);
  const [alternativeRoute, setAlternativeRoute] = useState<{ question: Question; levelIdx: number; questionIdx: number } | null>(null);

  const { addEvent, updateCognitiveMetrics, latentStrategies } = useCognitiveStore();
  const navigate = useNavigate();
  const questionStartTime = useRef(Date.now());

  useCognitiveTracking(phase === 'challenge');

  const currentLevel = phase1Levels[currentLevelIdx];
  const actualQuestionIdx = shuffledOrder.length > 0 ? shuffledOrder[currentQuestionPos] : 0;
  const currentMainQuestion = currentLevel.questions[actualQuestionIdx];
  const currentVariations = questionVariations[currentMainQuestion.id] || [];
  const currentDisplayQuestion = variationIdx === 0 ? currentMainQuestion : currentVariations[variationIdx];

  useEffect(() => {
    if (phase === 'challenge') {
      questionStartTime.current = Date.now();
    }
  }, [phase, currentLevelIdx, actualQuestionIdx, variationIdx]);

  const handleStart = () => {
    setPhase('perception');
    addEvent('PHASE_START', { phase: 'Juicio_Pretest', theme: 'Autopercepción_Programación' });
  };

  const handlePerceptionSubmit = () => {
    setPerceptions([...perceptions, { questionId: currentMainQuestion.id, variationIdx, value: currentPerceptionValue }]);
    const pool = shuffleArray(currentVariations.slice(1).map((_, i) => i + 1));
    setVariationPool(pool);
    setPhase('challenge');
    addEvent('PHASE_COMPLETED', { phase: 'Juicio_Pretest', theme: 'Autopercepción_Programación' });
    addEvent('PHASE_START', { phase: 'Desafío_Cognitivo', theme: 'Fundamentos_Técnicos' });
  };

  const handleAnswerSelect = (optionIdx: number) => {
    const now = Date.now();
    const duration = now - questionStartTime.current;

    if (duration > 30000) {
      addEvent('COGNITIVE_BIAS', {
        interpretation: 'Frustración o sobrecarga',
        trigger: 'Excessive time',
        duration_ms: duration,
        theme: currentDisplayQuestion.category
      });
    }

    const selectedOption = currentDisplayQuestion.options[optionIdx];
    const isCorrect = selectedOption === currentDisplayQuestion.correctAnswer;
    const userPerception = perceptions.find(p => p.questionId === currentMainQuestion.id && p.variationIdx === variationIdx)?.value || 5;
    const calibration = isCorrect ? 1 : 0;

    const isVariation = variationIdx > 0;
    const newFailures = { ...questionFailures };
    const currentFailCount = (newFailures[currentMainQuestion.id] || 0);

    if (!isCorrect) {
      newFailures[currentMainQuestion.id] = currentFailCount + 1;
      setQuestionFailures(newFailures);

      if (!isVariation && currentFailCount === 0) {
        setPhase('humility_tip');
        return;
      }

      if (isVariation || currentFailCount >= 1) {
        const category = currentMainQuestion.category;
        const newBlocked = { ...blockedCategories };
        for (let li = currentLevelIdx; li < phase1Levels.length; li++) {
          const existing = newBlocked[li] || [];
          if (!existing.includes(category)) {
            newBlocked[li] = [...existing, category];
          }
        }
        setBlockedCategories(newBlocked);
        setJustBlockedInfo({ category, nodeId: currentMainQuestion.id });

        const blockedCount = (newBlocked[currentLevelIdx] || []).length;
        if (blockedCount >= 2) {
          addEvent('COGNITIVE_BIAS', {
            interpretation: 'Freno por 2 temas bloqueados en el nivel',
            trigger: 'Two topics blocked in same level',
            theme: category,
            level: currentLevelIdx,
            blocked_categories: newBlocked[currentLevelIdx],
          });
          setPhase('freno');
          return;
        }

        const alt = getAvailableAlternative(currentLevelIdx, currentQuestionPos, newBlocked, shuffledOrder);
        setAlternativeRoute(alt);

        addEvent('COGNITIVE_BIAS', {
          interpretation: 'Brecha Conceptual',
          trigger: 'Double failure',
          theme: category,
          node_id: currentMainQuestion.id,
          total_failures: currentFailCount + 1,
          blocked_in_levels: Object.keys(newBlocked).filter(k => newBlocked[Number(k)].includes(category)).join(','),
        });

        setPhase('blocked');
        return;
      }
    }

    const newAttempt: ChallengeAttempt = {
      questionId: currentMainQuestion.id,
      perception: userPerception,
      isCorrect,
      calibration,
      variationAttempts: isVariation ? variationIdx : 0,
      blocked: false,
    };

    const updatedAttempts = [...attempts, newAttempt];
    setAttempts(updatedAttempts);

    const newPassed = { ...passedCategories };
    const levelPassed = newPassed[currentLevelIdx] || [];
    if (!levelPassed.includes(currentMainQuestion.category)) {
      newPassed[currentLevelIdx] = [...levelPassed, currentMainQuestion.category];
    }
    setPassedCategories(newPassed);
    moveToNextQuestion(updatedAttempts);

    questionStartTime.current = Date.now();
  };

  const moveToNextQuestion = (updatedAttempts: ChallengeAttempt[]) => {
    const nextLevelIdx = currentLevelIdx + 1;
    if (nextLevelIdx < phase1Levels.length) {
      const newOrder = shuffleArray(phase1Levels[nextLevelIdx].questions.map((_, i) => i));
      const firstUnblocked = newOrder.findIndex(
        (actualIdx) => !isCategoryBlocked(blockedCategories, phase1Levels[nextLevelIdx].questions[actualIdx].category, nextLevelIdx)
      );
      if (firstUnblocked !== -1) {
        setShuffledOrder(newOrder);
        setCurrentLevelIdx(nextLevelIdx);
        setCurrentQuestionPos(firstUnblocked);
        setVariationIdx(0);
        setVariationPool([]);
        setPhase('perception');
      } else {
        addEvent('PHASE_COMPLETED', { phase: 'Desafío_Cognitivo', theme: 'Fundamentos_Técnicos' });
        completeEvaluation(updatedAttempts);
      }
    } else {
      addEvent('PHASE_COMPLETED', { phase: 'Desafío_Cognitivo', theme: 'Fundamentos_Técnicos' });
      completeEvaluation(updatedAttempts);
    }
  };

  const handleHumilityContinue = () => {
    const [nextIdx, ...rest] = variationPool;
    setVariationIdx(nextIdx);
    setVariationPool(rest);
    setCurrentPerceptionValue(5);
    setPhase('perception');
    questionStartTime.current = Date.now();
  };

  const handleAlternativeRoute = () => {
    if (alternativeRoute) {
      setCurrentLevelIdx(alternativeRoute.levelIdx);
      setCurrentQuestionPos(alternativeRoute.questionIdx);
      setVariationIdx(0);
      setVariationPool([]);
      setPhase('perception');
      setJustBlockedInfo(null);
      setAlternativeRoute(null);

      addEvent('PHASE_START', {
        phase: 'Ruta_Alternativa',
        theme: alternativeRoute.question.category,
        original_blocked: justBlockedInfo?.nodeId,
      });
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    addEvent('COGNITIVE_BIAS', {
      interpretation: 'Persistencia',
      trigger: 'Manual retry after brake',
      type: 'retry'
    });
    setPhase('challenge');
    questionStartTime.current = Date.now();
  };

  const completeEvaluation = (finalAttempts: ChallengeAttempt[]) => {
    const correctCount = finalAttempts.filter(a => a.isCorrect).length;
    const scorePercent = (correctCount / finalAttempts.length) * 100;

    const avgPerception = finalAttempts.reduce((a, b) => a + b.perception, 0) / finalAttempts.length / 10;
    const currentCalibration = scorePercent / 100;

    updateCognitiveMetrics(0.75, currentCalibration, scorePercent);

    addEvent('EVALUATION_COMPLETED', {
      phase: 'Final_Full_Flow',
      theme: 'Fundamentos_Técnicos',
      score: scorePercent,
      calibration: currentCalibration,
      initial_perception: avgPerception,
      calibration_gap: Number((avgPerception - currentCalibration).toFixed(2)),
      latent_strategy: scorePercent > 70 ? 'STRUCTURAL_MAPPING' : 'SYSTEMATIC_VERIFICATION',
      total_retries: retryCount,
      blocked_categories: blockedCategories,
    });

    addEvent('PHASE_COMPLETED', { phase: 'Desfase', theme: 'Calibración_Meta' });
    setPhase('results');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bento-card p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Brain className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Evaluación de 3 Fases</h2>
            <p className="text-lg text-on-surface-variant mb-10 max-w-xl mx-auto font-medium">
              Este proceso medirá tu autopercepción inicial, validará tus habilidades técnicas y analizará el desfase metacognitivo resultante.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <InfoCard icon={Target} title="Fase 1" desc="Juicio de Percepción" />
              <InfoCard icon={Code2} title="Fase 2" desc="Desafío Cognitivo" />
              <InfoCard icon={BarChart3} title="Fase 3" desc="Análisis de Desfase" />
            </div>
            <button onClick={handleStart} className="px-12 py-5 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-3 mx-auto">
              Comenzar Proceso <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}

        {phase === 'perception' && (
          <motion.div key="perc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="text-center">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                {variationIdx > 0 ? 'RETO ALTERNATIVO' : 'FASE 1: JUICIO DE CONFIANZA'}
              </div>
              {variationIdx > 0 && (
                <p className="text-xs text-warning font-bold mb-2">Mismo tema — Nuevo reto</p>
              )}
              <p className="text-sm text-on-surface-variant italic mb-2">{currentDisplayQuestion.context}</p>
              <h3 className="text-3xl font-bold mb-2">{currentDisplayQuestion.metacognitivePrompt}</h3>
              <p className="text-on-surface-variant">{currentLevel.name} — {currentDisplayQuestion.category}</p>
            </div>
            <div className="bento-card p-12 bg-white border border-primary/20 text-center">
              <div className="flex justify-between mb-8">
                {[...Array(10)].map((_, i) => (
                  <span key={i} className={cn("text-[10px] font-bold", currentPerceptionValue > i ? "text-primary" : "text-outline")}>{i + 1}</span>
                ))}
              </div>
              <input type="range" min="1" max="10" value={currentPerceptionValue} onChange={(e) => setCurrentPerceptionValue(parseInt(e.target.value))} className="w-full h-3 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary mb-12" />
              <div className="flex justify-between items-center p-8 bg-primary/5 rounded-3xl border border-primary/10">
                <div className="text-left"><p className="text-xs font-bold text-primary uppercase">Confianza</p><p className="text-4xl font-black">{currentPerceptionValue} / 10</p></div>
                <button onClick={handlePerceptionSubmit} className="px-10 py-5 bg-primary text-on-primary rounded-2xl font-bold flex items-center gap-2 shadow-xl">Siguiente <Send className="w-4 h-4 ml-2" /></button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'challenge' && (
          <motion.div key="chal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  {currentLevel.name} - {currentDisplayQuestion.category}
                </span>
              </div>
              <span className="text-xs font-black text-secondary">
                Juicio: {currentPerceptionValue} / 10
              </span>
            </div>

            <div className="bento-card p-10 bg-white border-2 border-primary/5 shadow-xl">
              <h3 className="text-2xl font-bold mb-10 text-on-surface leading-tight">{currentDisplayQuestion.text}</h3>
              <div className="grid grid-cols-1 gap-3">
                {currentDisplayQuestion.options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswerSelect(i)} className="p-6 text-left rounded-2xl border-2 border-outline-variant/20 hover:border-primary hover:bg-primary/5 transition-all group flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">{String.fromCharCode(65 + i)}</div>
                    <span className="text-lg font-bold">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'humility_tip' && (
          <motion.div key="hum" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bento-card p-12 border-2 border-warning bg-warning/5 text-center">
            <div className="w-20 h-20 bg-warning text-on-warning rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black text-warning mb-2">¡ALERTA DE HUMILDAD!</h3>
            <p className="text-sm text-on-surface-variant mb-6">Has cometido un error, pero aún puedes corregirlo.</p>
            <div className="bg-white p-8 rounded-3xl border border-warning/20 mb-8 max-w-2xl mx-auto">
              <p className="text-xl font-medium text-on-surface leading-relaxed" dangerouslySetInnerHTML={{ __html: getHumilityTip(currentMainQuestion.id) }} />
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={handleHumilityContinue} className="px-10 py-4 bg-warning text-on-warning rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-warning/30">
                Intentar de Nuevo <ChevronRight className="w-5 h-5 inline ml-2" />
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'blocked' && (
          <motion.div key="blk" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <motion.div className="bento-card p-12 text-center border-2 border-error bg-error/5">
              <div className="w-20 h-20 bg-error text-on-error rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Lock className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-black text-error mb-2">NODO BLOQUEADO</h3>
              <p className="text-on-surface-variant mb-4">
                Has fallado este concepto dos veces seguidas. El sistema ha bloqueado temporalmente este nodo para evitar frustración.
              </p>
              {justBlockedInfo && (
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-3xl border border-error/20 mb-4 max-w-2xl mx-auto text-left">
                    <div className="flex items-center gap-3 mb-4">
                      <BookOpen className="w-6 h-6 text-error" />
                      <h4 className="text-xl font-bold text-error">{getLessonTitle(justBlockedInfo.nodeId)}</h4>
                    </div>
                    <p className="text-base text-on-surface leading-relaxed" dangerouslySetInnerHTML={{ __html: getLessonText(justBlockedInfo.nodeId) }} />
                  </div>
                  {blockedCategories[currentLevelIdx]?.length > 1 && (
                    <p className="text-sm text-on-surface-variant max-w-xl mx-auto">
                      Temas bloqueados en niveles superiores: {blockedCategories[currentLevelIdx]?.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </motion.div>

            {alternativeRoute && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bento-card p-10 text-center border-2 border-secondary bg-secondary/5">
                <div className="w-16 h-16 bg-secondary text-on-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Route className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold mb-2">Ruta Alternativa Sugerida</h4>
                <p className="text-on-surface-variant mb-6">
                  Mientras refuerzas este concepto, puedes continuar con:
                </p>
                <div className="bg-white p-6 rounded-2xl border border-secondary/20 mb-6 inline-block">
                  <p className="text-sm font-bold text-secondary uppercase tracking-widest mb-1">{alternativeRoute.question.category}</p>
                  <p className="text-lg font-bold">{alternativeRoute.question.text}</p>
                </div>
                <div className="flex gap-4 justify-center">
                  <button onClick={handleAlternativeRoute} className="px-10 py-4 bg-secondary text-on-secondary rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-secondary/30 flex items-center gap-2">
                    Probar esta Ruta <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {!alternativeRoute && (
              <div className="text-center">
                <p className="text-on-surface-variant mb-4">No hay más temas disponibles en este nivel.</p>
                <button onClick={() => navigate('/')} className="px-10 py-4 bg-error text-on-error rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-error/30">
                  Ir al Panel Principal
                </button>
              </div>
            )}
          </motion.div>
        )}

        {phase === 'freno' && (
          <motion.div key="fre" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bento-card p-12 text-center border-2 border-error bg-error/5">
            <div className="w-24 h-24 bg-error text-on-error rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <AlertCircle className="w-14 h-14" />
            </div>
            <h3 className="text-4xl font-black text-error mb-4">¡FRENO DE SEGURIDAD!</h3>
            <p className="text-lg text-on-surface-variant mb-8 max-w-xl mx-auto">
              Has fallado múltiples temas en este nivel. El sistema ha detenido tu avance para evitar frustración y sobrecarga cognitiva.
            </p>
            <div className="bg-white p-8 rounded-3xl border border-error/20 mb-8 max-w-md mx-auto text-left">
              <p className="text-sm font-bold text-error uppercase mb-3">Temas bloqueados en {phase1Levels[currentLevelIdx].name}:</p>
              <ul className="space-y-2">
                {(blockedCategories[currentLevelIdx] || []).map(cat => (
                  <li key={cat} className="flex items-center gap-2 text-sm font-medium text-on-surface">
                    <Lock className="w-4 h-4 text-error flex-shrink-0" />
                    {cat}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-on-surface-variant mb-8 max-w-md mx-auto">
              Te recomendamos repasar los fundamentos de estos temas antes de volver a intentarlo.
              Mientras tanto, los temas que aprobaste ({passedCategories[currentLevelIdx]?.join(', ') || 'ninguno'}) han quedado desbloqueados para el siguiente nivel.
            </p>
            <button onClick={() => navigate('/')} className="px-12 py-5 bg-error text-on-error rounded-2xl font-bold shadow-xl shadow-error/30 hover:scale-105 transition-all">
              Ir al Panel Principal
            </button>
          </motion.div>
        )}

        {phase === 'socratic' && (
          <motion.div key="soc" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bento-card p-12 border-2 border-error bg-error/5 text-center">
            <div className="w-20 h-20 bg-error text-on-error rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl"><AlertCircle className="w-12 h-12" /></div>
            <h3 className="text-3xl font-black text-error mb-4">FRENO METACOGNITIVO</h3>
            <div className="bg-white p-8 rounded-3xl border border-error/20 mb-8 max-w-2xl mx-auto">
              <p className="text-xl font-medium italic text-on-surface-variant">
                "Detección de Primado Cognitivo: Estás respondiendo por impulso mecánico. ¿Cómo se conecta este problema con la heurística de {latentStrategies[0]?.replace(/_/g, ' ') || 'Verificación Sistemática'} que dominaste antes?"
              </p>
            </div>
            <button onClick={handleRetry} className="px-12 py-5 bg-error text-on-error rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-error/30">Reiniciar Ciclo de Razonamiento</button>
          </motion.div>
        )}

        {phase === 'results' && (
          <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="bento-card p-12 text-center border-t-8 border-secondary">
              <h2 className="text-4xl font-black mb-2">Análisis de Desfase Metacognitivo</h2>
              <p className="text-on-surface-variant mb-12">Fase 3: Comparación de Autopercepción vs Desempeño Real</p>

              {Object.keys(blockedCategories).length > 0 && (
                <div className="mb-8 p-6 bg-error/5 rounded-3xl border border-error/20 text-left">
                  <h4 className="text-lg font-bold text-error mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" /> Temas Bloqueados por Nivel
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(blockedCategories).map(([levelIdx, cats]) => (
                      <div key={levelIdx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-error/10">
                        <span className="text-xs font-bold text-secondary uppercase">{phase1Levels[Number(levelIdx)].name}</span>
                        <div className="flex gap-2 ml-2">
                          {cats.map(c => (
                            <span key={c} className="text-xs font-bold text-error bg-error/10 px-3 py-1 rounded-full">{c}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 mb-12 text-left">
                {attempts.map((att, i) => {
                  const mainQ = phase1Levels.flatMap(l => l.questions).find(q => q.id === att.questionId);
                  return (
                    <div key={i} className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{mainQ?.category || att.questionId}</p>
                        <p className="text-lg font-bold">{att.isCorrect ? 'Acierto Técnico' : 'Fallo de Concepto'} {att.variationAttempts > 0 && `(Var. ${att.variationAttempts})`}</p>
                      </div>
                      <div className="flex gap-8 items-center text-center">
                        <div><p className="text-xs font-bold opacity-50 mb-1">Percepción</p><p className="text-2xl font-black text-primary">{Math.round(att.perception * 10)}%</p></div>
                        <div className="w-px h-10 bg-outline-variant/30" />
                        <div><p className="text-xs font-bold opacity-50 mb-1">Realidad</p><p className={cn("text-2xl font-black", att.isCorrect ? "text-secondary" : "text-error")}>{att.isCorrect ? '100%' : '0%'}</p></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => navigate('/')} className="px-12 py-5 bg-secondary text-on-secondary rounded-2xl font-bold shadow-2xl shadow-secondary/30 hover:scale-105 transition-all">Guardar Rastro y Finalizar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 text-left">
      <Icon className="w-6 h-6 text-primary mb-3" />
      <h4 className="font-bold text-sm mb-1">{title}</h4>
      <p className="text-[11px] text-on-surface-variant font-medium leading-tight">{desc}</p>
    </div>
  );
}
