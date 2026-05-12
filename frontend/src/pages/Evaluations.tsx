import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, CheckCircle2, ChevronRight, Target, AlertCircle, RefreshCcw, Send, BarChart3, Code2, Lock, BookOpen, Route, Sparkles, Zap, ShieldCheck, PlayCircle } from 'lucide-react';
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
  const [phase, setPhase] = useState<'tutorial' | 'perception' | 'challenge' | 'humility_tip' | 'blocked' | 'freno' | 'socratic' | 'results'>('tutorial');
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
  const [frenoReason, setFrenoReason] = useState<'double_block' | 'low_perception_double_fail' | null>(null);

  const { addEvent, updateCognitiveMetrics, latentStrategies, user } = useCognitiveStore();
  const navigate = useNavigate();
  const questionStartTime = useRef(Date.now());
  const evaluationStartTime = useRef<number | null>(null);
  const questionClicks = useRef(0);
  const totalClicks = useRef(0);
  const clicksPerQuestion = useRef<Record<string, number>>({});

  useCognitiveTracking(phase === 'challenge');

  const currentLevel = phase1Levels[currentLevelIdx];
  const actualQuestionIdx = shuffledOrder.length > 0 ? shuffledOrder[currentQuestionPos] : 0;
  const currentMainQuestion = currentLevel.questions[actualQuestionIdx];
  const currentVariations = questionVariations[currentMainQuestion.id] || [];
  const currentDisplayQuestion = variationIdx === 0 ? currentMainQuestion : currentVariations[variationIdx];

  useEffect(() => {
    if (phase === 'challenge') {
      questionStartTime.current = Date.now();
      questionClicks.current = 0;
    }
  }, [phase, currentLevelIdx, actualQuestionIdx, variationIdx]);

  const startEvaluationAfterTutorial = () => {
    useCognitiveStore.getState().setCurrentLevel(1);
    useCognitiveStore.getState().setCurrentChallengeId(null);
    addEvent('PHASE_START', { phase: 'Juicio_Pretest', theme: 'Autopercepción_Programación' });
    navigate('/evaluation-prep');
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

        const initialPerception = perceptions.find(p => p.questionId === currentMainQuestion.id && p.variationIdx === 0);
        const variationPerception = perceptions.find(p => p.questionId === currentMainQuestion.id && p.variationIdx === variationIdx);
        const bothLow = initialPerception && variationPerception && initialPerception.value <= 3 && variationPerception.value <= 3;

        if (isVariation && bothLow) {
          setFrenoReason('low_perception_double_fail');
          addEvent('COGNITIVE_BIAS', {
            interpretation: 'Freno por baja autopercepción + fallo consistente',
            trigger: 'Low perception + double failure',
            theme: category,
            node_id: currentMainQuestion.id,
          });
          setPhase('freno');
          return;
        }

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
          setFrenoReason('double_block');
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

    const totalTime = evaluationStartTime.current ? Date.now() - evaluationStartTime.current : 0;

    updateCognitiveMetrics(0.75, currentCalibration, scorePercent);

    const evaluationData = {
      fecha: new Date().toISOString(),
      score: scorePercent,
      calibration: currentCalibration,
      perception: avgPerception,
      gap: Number((avgPerception - currentCalibration).toFixed(2)),
      strategy: scorePercent > 70 ? 'STRUCTURAL_MAPPING' : 'SYSTEMATIC_VERIFICATION',
      totalTime,
      totalClicks: totalClicks.current,
      clicksPerQuestion: { ...clicksPerQuestion.current },
      attempts: finalAttempts.map(a => ({
        questionId: a.questionId,
        correct: a.isCorrect,
        perception: a.perception,
        variationAttempts: a.variationAttempts,
      })),
      blockedCategories,
    };

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
      total_time_ms: totalTime,
      total_clicks: totalClicks.current,
      clicks_per_question: clicksPerQuestion.current,
    });

    // Save to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('metapathfinder_evaluations') || '[]');
      const studentEmail = user?.email || 'unknown';
      const existingIdx = stored.findIndex((e: any) => e.email === studentEmail);
      const entry = { email: studentEmail, name: user?.name || '', lastName: user?.lastName || '', evaluation: evaluationData };
      if (existingIdx >= 0) {
        stored[existingIdx] = entry;
      } else {
        stored.push(entry);
      }
      localStorage.setItem('metapathfinder_evaluations', JSON.stringify(stored));
    } catch {}

    addEvent('PHASE_COMPLETED', { phase: 'Desfase', theme: 'Calibración_Meta' });
    setPhase('results');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-8"
      >
        <div className="bento-card p-12 bg-white border-2 border-primary/10 shadow-2xl rounded-[2.5rem]">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="w-4 h-4" /> Guía de Supervivencia Cognitiva
              </div>
              <h3 className="text-4xl font-black text-on-surface tracking-tight leading-tight">
                ¿Cómo funciona esta <span className="text-primary italic">Evaluación</span>?
              </h3>
              <p className="text-on-surface-variant font-medium text-lg leading-relaxed">
                No es un examen tradicional. Es un entorno de <strong>calibración intensa</strong> diseñado para mapear tus fortalezas y puntos ciegos.
              </p>

              <div className="space-y-4">
                <TutorialStep
                  number="1"
                  title="Fase A: Autopercepción"
                  desc="Te presentamos el tema y nos dices qué tan seguro te sientes (1-10) antes de ver el reto."
                  icon={Target}
                />
                <TutorialStep
                  number="2"
                  title="Fase B: Ejecución Técnica"
                  desc="Resuelves el desafío técnico en un contexto real (Médico, Gaming, E-commerce, etc)."
                  icon={Zap}
                />
                <TutorialStep
                  number="3"
                  title="Protocolo de Andamiaje"
                  desc="Si fallas, te damos una segunda oportunidad con un contexto diferente. Si fallas de nuevo, bloqueamos el nodo para que no te frustres."
                  icon={ShieldCheck}
                />
              </div>
            </div>

            <div className="w-full md:w-[350px] aspect-[9/16] bg-surface-container-highest rounded-[3rem] border-8 border-on-surface shadow-2xl relative overflow-hidden">
              <video
                src="/Instructivoevalaucion.webm"
                controls
                preload="metadata"
                className="w-full h-full object-cover absolute inset-0"
              />
            </div>
          </div>

          <div className="mt-12 flex justify-center pt-8 border-t border-outline-variant/10">
            <button
              onClick={startEvaluationAfterTutorial}
              className="px-16 py-6 bg-primary text-on-primary rounded-[2rem] font-black text-2xl shadow-2xl shadow-primary/40 hover:scale-105 transition-all active:scale-95 flex items-center gap-4"
            >
              Entendido, ¡Empecemos! <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function TutorialStep({ number, title, desc, icon: Icon }: { number: string; title: string; desc: string; icon: any }) {
  return (
    <div className="flex gap-4 p-4 hover:bg-surface-container transition-colors rounded-2xl border border-transparent hover:border-outline-variant/10">
      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">
        {number}
      </div>
      <div>
        <h4 className="font-bold text-on-surface flex items-center gap-2">
          {title} <Icon className="w-4 h-4 text-primary/60" />
        </h4>
        <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
