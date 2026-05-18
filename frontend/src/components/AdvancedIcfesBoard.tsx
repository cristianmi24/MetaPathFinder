import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Lightbulb, BookOpen, Info, Users, Building2, 
  Medal, Trophy, CheckCircle2, XCircle, 
  ArrowRight, RefreshCw, Sparkles, AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';

interface AdvancedIcfesBoardProps {
  challengeId: string;
  onValidation: (correct: boolean) => void;
}

interface Question {
  id: number;
  eyebrow: string;
  numLabel: string;
  text: string;
  options: {
    letter: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
}

interface Explanation {
  ok: string;
  err: string;
}

interface ChallengeData {
  title: string;
  chipText: string;
  subtitle: string;
  readingBlocks: {
    title: string;
    icon: React.ComponentType<any>;
    content: string;
    pills?: { text: string; type: 'purple' | 'teal' | 'amber' | 'pink' }[];
  }[];
  questions: Question[];
  answers: Record<number, 'A' | 'B' | 'C' | 'D'>;
  explanations: Record<number, Explanation>;
}

// Datos de los tres retos de nivel avanzado (RA-C4-N1, RA-C4-N2, RA-C4-N3)
const challengesContent: Record<string, ChallengeData> = {
  'RA-C4-N1': {
    title: 'Sesgo algorítmico y grupos vulnerables',
    chipText: 'Pensamiento crítico · Tipo ICFES',
    subtitle: 'Lee el texto de investigación con atención. Luego responde cada pregunta — una a la vez.',
    readingBlocks: [
      {
        title: '¿Qué es el sesgo algorítmico?',
        icon: Info,
        content: 'Un algoritmo es un conjunto de instrucciones matemáticas que procesan datos para producir resultados: recomendaciones, clasificaciones, decisiones. El sesgo algorítmico ocurre cuando esas instrucciones —o los datos con los que fueron entrenadas— **reproducen, amplifican o consolidan desigualdades sociales preexistentes**. No se trata de un error accidental: con frecuencia es la consecuencia directa de entrenar modelos con datos históricos que ya reflejan discriminación.'
      },
      {
        title: 'Impacto en grupos vulnerables',
        icon: Users,
        content: 'El estudio *Gender Shades* (Buolamwini & Gebru, 2018) demostró que sistemas de reconocimiento facial fallaban hasta un **34 % más** en mujeres de piel oscura que en hombres de piel clara. El algoritmo de Amazon para reclutamiento (retirado en 2018) penalizaba currículos que incluían la palabra *"mujeres"* porque fue entrenado con datos de contratación mayoritariamente masculina. El software **COMPAS**, usado en EE. UU. para predecir reincidencia, asignaba puntajes de riesgo más altos a personas negras que a personas blancas con antecedentes similares (ProPublica, 2016).'
      },
      {
        title: 'Algoritmo de recomendación',
        icon: Lightbulb,
        content: 'TikTok usa **filtrado colaborativo** basado en tiempo de visualización, interacciones y datos de dispositivo. Investigaciones de *The Markup* (2021) encontraron que un usuario nuevo fue dirigido en **menos de 30 minutos** hacia contenido pro-trastornos alimentarios tras interactuar con publicaciones sobre pérdida de peso. Estudios de Global Witness mostraron alcance desigual para creadoras mujeres vs. creadores hombres en temas equivalentes. La opacidad del sistema es total: TikTok no publica información técnica sobre sus factores de ponderación.',
        pills: [{ text: 'TikTok', type: 'purple' }]
      },
      {
        title: 'PageRank y personalización',
        icon: BookOpen,
        content: 'Google combina **PageRank**, aprendizaje automático (MUM, BERT) y personalización por historial, ubicación e idioma. Safiya Umoja Noble (*Algorithms of Oppression*, 2018) documentó cómo búsquedas con términos racializados arrojaban resultados hipersexualizados, mientras equivalentes neutros no lo hacían. En zonas rurales de América Latina, la **personalización geográfica reduce la diversidad de fuentes**, confinando a los usuarios a un ecosistema informativo empobrecido. La concentración del **90 % del mercado de búsqueda** en un solo actor agrava cualquier sesgo estructural.',
        pills: [{ text: 'Google Search', type: 'teal' }]
      },
      {
        title: '¿Qué deben hacer el Estado y las empresas?',
        icon: Building2,
        content: 'La *AI Act* de la UE (2024) clasifica sistemas de IA por nivel de riesgo y exige **auditorías independientes** para los de alto riesgo. En Colombia, el CONPES 3975 (2019) establece principios de ética y transparencia pero **carece de mecanismos sancionatorios concretos**. Las propuestas académicas incluyen: (1) transparencia algorítmica obligatoria, (2) auditorías externas de sesgo, (3) diversidad en equipos de desarrollo, y (4) participación de comunidades afectadas en el diseño.'
      }
    ],
    questions: [
      {
        id: 1,
        eyebrow: 'Causa estructural · Pensamiento inferencial',
        numLabel: 'Pregunta 1',
        text: 'El texto describe que el software COMPAS y el algoritmo de reclutamiento de Amazon produjeron resultados discriminatorios. ¿Cuál es la causa estructural común que el texto señala para ambos casos, y qué implica eso para el argumento de que los algoritmos son "objetivos" o "neutrales"?',
        options: [
          { letter: 'A', text: 'Ambos sistemas fueron diseñados intencionalmente para discriminar, lo que demuestra que la neutralidad algorítmica es un mito porque los ingenieros introducen prejuicios a propósito.' },
          { letter: 'B', text: 'Ambos sistemas fueron entrenados con datos históricos que ya reflejaban desigualdades sociales, lo que refuta la neutralidad porque el algoritmo aprende y reproduce patrones de discriminación preexistentes.' },
          { letter: 'C', text: 'Ambos sistemas carecían de suficientes datos de entrenamiento, y el sesgo desaparecería con mayor volumen de datos, de modo que la neutralidad algorítmica sí es alcanzable.' },
          { letter: 'D', text: 'Ambos sistemas operaban en sectores regulados por el Estado, lo que sugiere que el sesgo es resultado de la intervención gubernamental y no de los propios algoritmos.' }
        ]
      },
      {
        id: 2,
        eyebrow: 'Mecanismo y limitación metodológica',
        numLabel: 'Pregunta 2',
        text: 'El texto menciona que TikTok llevó a un usuario hacia contenido pro-trastornos alimentarios en menos de 30 minutos. ¿Qué mecanismo específico del algoritmo de TikTok explica mejor ese resultado, y qué limitación metodológica debería considerarse antes de generalizar esa evidencia?',
        options: [
          { letter: 'A', text: 'El mecanismo es la publicidad pagada por marcas de dietas; la limitación es que el estudio no controló la edad del usuario.' },
          { letter: 'B', text: 'El mecanismo es el filtrado colaborativo basado en tiempo de visualización, que optimiza el compromiso amplificando contenido extremo; la limitación es la opacidad total del sistema, que impide replicar o refutar el experimento con datos internos de la empresa.' },
          { letter: 'C', text: 'El mecanismo es la geolocalización del usuario, que adapta el contenido según el país de origen; la limitación es que el estudio no fue replicado en múltiples regiones.' },
          { letter: 'D', text: 'El mecanismo es la moderación deficiente de contenido; la limitación es que TikTok mejoró sus políticas después del estudio, haciendo obsoleta la evidencia.' }
        ]
      },
      {
        id: 3,
        eyebrow: 'Refutación de argumento · Lectura crítica',
        numLabel: 'Pregunta 3',
        text: 'Un legislador colombiano afirma: "No necesitamos sanciones; la autorregulación empresarial es suficiente porque las empresas tienen incentivos de reputación para no discriminar." ¿Qué elemento del texto contradice más directamente este argumento?',
        options: [
          { letter: 'A', text: 'El texto menciona que la UE ya sancionó a TikTok y a Google por sesgos documentados, lo que demuestra que las sanciones son eficaces.' },
          { letter: 'B', text: 'El software COMPAS continuó en uso a pesar de la evidencia pública de sesgo racial documentada en 2016, lo que muestra que la presión reputacional por sí sola no garantiza la corrección del sesgo.' },
          { letter: 'C', text: 'El texto afirma explícitamente que la autorregulación ha fracasado en todos los casos y que solo la regulación estatal con sanciones ha producido cambios reales.' },
          { letter: 'D', text: 'El texto indica que el 90 % del mercado de búsqueda está concentrado en Google, lo que implica que los incentivos de reputación no operan en mercados sin competencia real.' }
        ]
      },
      {
        id: 4,
        eyebrow: 'Síntesis e implicaciones · Alta complejidad',
        numLabel: 'Pregunta 4',
        text: 'Safiya Umoja Noble documenta que búsquedas con términos racializados en Google arrojaban resultados hipersexualizados. Considerando además que el texto señala que la personalización geográfica reduce la diversidad de fuentes en zonas rurales de América Latina, ¿qué conclusión más amplia sobre los algoritmos de búsqueda se puede inferir?',
        options: [
          { letter: 'A', text: 'Los algoritmos de búsqueda son neutrales en términos raciales, pero fallan únicamente cuando los usuarios de zonas rurales tienen conexiones lentas que distorsionan los resultados.' },
          { letter: 'B', text: 'Los algoritmos de búsqueda pueden operar como mecanismos de doble exclusión: producen representaciones dañinas para grupos racializados y, simultáneamente, restringen el acceso equitativo a la información para comunidades geográficamente marginadas.' },
          { letter: 'C', text: 'El sesgo en Google afecta únicamente a usuarios en países desarrollados, porque en América Latina la baja penetración de internet limita el impacto de la personalización algorítmica.' },
          { letter: 'D', text: 'La concentración del 90 % del mercado en Google es la única causa del sesgo: si existiera más competencia, los algoritmos de búsqueda serían automáticamente equitativos.' }
        ]
      }
    ],
    answers: { 1: 'B', 2: 'B', 3: 'B', 4: 'B' },
    explanations: {
      1: {
        ok: '<strong>Correcto.</strong> El texto señala explícitamente que el sesgo surge de "entrenar modelos con datos históricos que ya reflejan discriminación." Tanto COMPAS como el algoritmo de Amazon aprendieron de patrones pasados sesgados, no de intención maliciosa. Esto desmonta el argumento de neutralidad: si los datos de entrada son desiguales, el output también lo será.',
        err: '<strong>Incorrecto.</strong> La respuesta correcta es B. El texto señala que la causa es entrenar modelos con datos históricos que ya reflejan discriminación. No se trata de intención, ni de falta de datos, ni de regulación estatal: el problema es la herencia de sesgos sociales en los datos de entrenamiento.'
      },
      2: {
        ok: '<strong>Correcto.</strong> El texto describe el filtrado colaborativo basado en tiempo de visualización como el mecanismo clave de TikTok, optimizando el compromiso del usuario incluso cuando eso amplifica contenido extremo. La limitación crítica es la opacidad total del sistema: sin acceso a datos internos, no es posible replicar ni refutar científicamente el experimento.',
        err: '<strong>Incorrecto.</strong> La respuesta correcta es B. El filtrado colaborativo por tiempo de visualización es el mecanismo descrito en el texto. La limitación más relevante es la opacidad del algoritmo de TikTok, que impide verificación externa, no la edad del usuario ni la cobertura geográfica.'
      },
      3: {
        ok: '<strong>Correcto.</strong> El caso COMPAS es el contraejemplo directo: el sesgo racial fue documentado públicamente en 2016 y el sistema continuó en uso, lo que evidencia que la exposición mediática (presión reputacional) no fue suficiente para generar corrección. Esto refuta el argumento del legislador desde los propios hechos del texto.',
        err: '<strong>Incorrecto.</strong> La respuesta correcta es B. El texto no afirma que la UE sancionó a TikTok o Google (opción A), ni hace una afirmación absoluta sobre autorregulación (opción C). La opción D contiene una inferencia sobre competencia que no está explícitamente desarrollada en el texto con ese propósito.'
      },
      4: {
        ok: '<strong>Correcto.</strong> Esta es la inferencia de mayor nivel: el texto documenta dos tipos de falla simultáneas en Google. Una afecta la <em>calidad</em> de los resultados (estereotipos racializados), y otra afecta el <em>acceso</em> a información diversa (personalización geográfica empobrecida). Combinadas, operan como un mecanismo de doble exclusión sobre grupos ya marginados.',
        err: '<strong>Incorrecto.</strong> La respuesta correcta es B. Las otras opciones ignoran la combinación de evidencias del texto. La inferencia correcta articula las dos dimensiones del problema: representación dañina para grupos racializados + restricción de acceso para comunidades geográficamente marginadas.'
      }
    }
  },
  'RA-C4-N2': {
    title: 'Startups tecnológicas de impacto social en Colombia',
    chipText: 'Emprendimiento social · Tipo ICFES',
    subtitle: 'Lee el texto de análisis sobre emprendimiento e innovación social en Colombia. Luego responde las preguntas.',
    readingBlocks: [
      {
        title: 'El auge del emprendimiento social con base tecnológica',
        icon: Info,
        content: 'Un emprendimiento de impacto social (o startup social) busca resolver un desafío humano y ambiental urgente aplicando un **modelo de negocio comercialmente viable**. A diferencia de una ONG tradicional, una startup social no depende exclusivamente de donaciones; genera ingresos vendiendo servicios o productos. La clave de su viabilidad radica en el **encaje solución-impacto**, donde cada unidad vendida o transacción realizada expande de forma directa el beneficio social entregado a la comunidad.'
      },
      {
        title: 'El contexto colombiano y brechas críticas',
        icon: Users,
        content: 'Colombia posee brechas estructurales en acceso a educación de calidad en zonas rurales, inclusión financiera de micro-comerciantes y comercialización agrícola justa. Proyectos como *Platzi* demostraron el alcance de la edtech, mientras que alternativas de logística y agrotech como *Frubana* buscan eliminar intermediarios que explotan al pequeño campesino. Sin embargo, el **70 % de las microempresas colombianas** opera en la informalidad crediticia, recurriendo a sistemas usurarios como el "gota a gota" debido a la falta de historial crediticio.'
      },
      {
        title: 'Diseño del Pitch Deck y propuesta de valor',
        icon: Lightbulb,
        content: 'Un **Pitch Deck** es una presentación breve (generalmente de 10-12 diapositivas) utilizada para comunicar la visión de una startup ante inversionistas o aliados estratégicos. No debe ser solo descriptivo; debe estructurar una narrativa persuasiva que incluya: (1) El problema validado con datos, (2) la solución técnica y su propuesta de valor única, (3) el tamaño de mercado (TAM, SAM, SOM) y (4) el modelo de sostenibilidad financiera (Unit Economics). En startups sociales, el Pitch Deck debe demostrar de manera inequívoca que **el impacto escala en proporción directa a los ingresos**.',
        pills: [{ text: 'Pitch Deck', type: 'pink' }, { text: 'Impacto Social', type: 'amber' }]
      },
      {
        title: 'Sostenibilidad Financiera vs. Misión Social',
        icon: Building2,
        content: 'El dilema de la "deriva de la misión" (mission drift) ocurre cuando una empresa social, bajo presión de rentabilidad financiera de inversionistas tradicionales, **prioriza los retornos económicos sobre su impacto social original**. Para contrarrestar esto, el ecosistema de inversión de impacto utiliza métricas mixtas como el **SROI** (Retorno Social de la Inversión) y la certificación de *Empresas B* (Sistema B), la cual exige cambios en los estatutos legales para proteger legalmente la misión socioambiental de la compañía frente a intereses puramente monetarios.',
        pills: [{ text: 'Sistema B', type: 'teal' }]
      }
    ],
    questions: [
      {
        id: 1,
        eyebrow: 'Estructuración de propuesta de valor · Pensamiento crítico',
        numLabel: 'Pregunta 1',
        text: 'Una startup social busca reemplazar los créditos informales e informales de "gota a gota" para vendedores de mercados locales en Colombia mediante una app móvil que evalúa el riesgo usando datos de facturación de servicios y recargas de celular. ¿Cuál representa la propuesta de valor social y técnica más sólida e integrada para este Pitch Deck?',
        options: [
          { letter: 'A', text: 'Una aplicación móvil que ofrece préstamos a tasas del 0% de interés de forma indefinida, financiada mediante aportes voluntarios de grandes corporaciones de beneficencia.' },
          { letter: 'B', text: 'Una plataforma de micro-créditos ágiles que utiliza fuentes de datos alternativas (servicios/recargas) para construir historial crediticio formal, reduciendo el costo financiero y bancarizando a sectores marginados de manera sostenible.' },
          { letter: 'C', text: 'Un sistema de cobros presenciales digitalizado que utiliza algoritmos avanzados de predicción para alertar a las centrales de riesgo tradicionales si el usuario se retrasa un solo día.' },
          { letter: 'D', text: 'Una red social para micro-comerciantes donde pueden solicitar donaciones públicas y financiamiento colectivo a usuarios de clase alta de forma abierta.' }
        ]
      },
      {
        id: 2,
        eyebrow: 'Modelos de sostenibilidad y escala',
        numLabel: 'Pregunta 2',
        text: 'El texto señala que el impacto social debe escalar en proporción directa a los ingresos comerciales. ¿Cuál de los siguientes modelos de negocio describe mejor este principio de encaje solución-impacto?',
        options: [
          { letter: 'A', text: 'Una empresa vende software premium a grandes bancos de Bogotá y destina el 2% de sus ganancias anuales a donar cuadernos a escuelas rurales.' },
          { letter: 'B', text: 'Una startup edtech cobra una suscripción mensual fija a estudiantes vulnerables y utiliza el 100% de ese dinero para contratar publicidad en redes sociales.' },
          { letter: 'C', text: 'Una agrotech conecta directamente a campesinos con restaurantes de ciudades, reduciendo intermediarios; por cada tonelada de alimento comercializada a precio justo, aumentan los ingresos del campesino y el margen de ganancia de la plataforma.' },
          { letter: 'D', text: 'Una startup de salud rural funciona de manera completamente gratuita para los pacientes y cubre todos sus gastos solicitando subsidios gubernamentales mensuales.' }
        ]
      },
      {
        id: 3,
        eyebrow: 'Deriva de la misión · Análisis estratégico',
        numLabel: 'Pregunta 3',
        text: 'Para asegurar que la startup no sufra de "deriva de la misión" (mission drift) tras recibir inversión de capital de riesgo para expandirse por Latinoamérica, ¿cuál de las siguientes acciones es la más efectiva según los conceptos descritos en el texto?',
        options: [
          { letter: 'A', text: 'Firmar un compromiso moral informal con los inversionistas donde se comprometen a respetar la filosofía original de los fundadores.' },
          { letter: 'B', text: 'Certificarse como Empresa B y modificar los estatutos legales de la sociedad comercial para proteger jurídicamente el propósito social ante las exigencias de rentabilidad de los accionistas.' },
          { letter: 'C', text: 'Evitar toda financiación externa y mantener la empresa pequeña, limitando su crecimiento para no arriesgar la pureza del impacto.' },
          { letter: 'D', text: 'Incrementar los precios del servicio para asegurar ganancias elevadas y complacer rápidamente a los inversionistas.' }
        ]
      },
      {
        id: 4,
        eyebrow: 'Análisis de viabilidad en Pitch Deck',
        numLabel: 'Pregunta 4',
        text: 'Al presentar el "Tamaño de Mercado" en el Pitch Deck ante inversionistas de impacto, los fundadores definen el SOM (Serviceable Obtainable Market - Mercado Objetivo) como el número total de personas sin acceso a educación superior en toda Latinoamérica. ¿Qué error de viabilidad metodológica cometieron y cómo debe corregirse?',
        options: [
          { letter: 'A', text: 'El SOM es demasiado pequeño; debió haber incluido a toda la población mundial para lucir más atractivo ante el fondo de inversión.' },
          { letter: 'B', text: 'El SOM representa la fracción del mercado que la startup realmente puede capturar en el corto/mediano plazo con sus recursos y canales actuales; debieron limitarlo, por ejemplo, a estudiantes rurales con conectividad básica en departamentos específicos de Colombia.' },
          { letter: 'C', text: 'El SOM no debió incluir estudiantes rurales, dado que estos sectores no representan valor comercial viable para una propuesta de base tecnológica.' },
          { letter: 'D', text: 'El error fue no utilizar métricas de donación en lugar de métricas de mercado objetivo, ya que las startups sociales no miden su mercado comercial.' }
        ]
      }
    ],
    answers: { 1: 'B', 2: 'C', 3: 'B', 4: 'B' },
    explanations: {
      1: {
        ok: '<strong>Correcto.</strong> La opción B articula la viabilidad técnica (uso de datos alternativos como recargas/servicios) con una propuesta de impacto social sostenible y transformadora (bancarización formal e inclusión financiera), en lugar de basarse en donaciones insostenibles o reproducir modelos abusivos.',
        err: '<strong>Incorrecto.</strong> La respuesta correcta es B. Una tasa de interés del 0% permanente y dependiente de donaciones (A) no es comercialmente sostenible; el sistema C no reduce el costo financiero, y el D no ofrece una solución de base tecnológica integrada.'
      },
      2: {
        ok: '<strong>Correcto.</strong> En el modelo de la agrotech (C), el impacto (precio justo y bienestar para el campesino) crece de forma orgánica en la misma proporción en que aumenta la actividad comercial de la plataforma. La facturación comercial impulsa directamente el impacto social, sin depender de filantropía colateral.',
        err: '<strong>Incorrecto.</strong> La respuesta correcta es C. El modelo A es filantropía tradicional (el impacto no está en el core del negocio); el B no entrega impacto directo escalable, y el D es dependiente de subsidios del Estado y no constituye un negocio autosostenible.'
      },
      3: {
        ok: '<strong>Correcto.</strong> La certificación como Empresa B (Sistema B) exige la reforma de los estatutos jurídicos de la startup, blindando legalmente la misión socioambiental de la empresa para que las decisiones comerciales no estén obligadas a priorizar la rentabilidad financiera por encima del impacto.',
        err: '<strong>Incorrecto.</strong> La respuesta correcta es B. Los pactos informales (A) no tienen validez legal frente a la presión de los accionistas; evitar el crecimiento (C) impide escalar la solución, e incrementar precios abusivamente (D) acelera la deriva de la misión.'
      },
      4: {
        ok: '<strong>Correcto.</strong> El SOM representa el mercado realista y alcanzable que la startup puede capturar de forma inmediata. Definir toda Latinoamérica como SOM es irreal para un pitch de etapa temprana. Acotar el SOM a estudiantes rurales de departamentos seleccionados con conectividad muestra rigor y viabilidad ante los inversionistas.',
        err: '<strong>Incorrecto.</strong> La respuesta correcta es B. Ampliar el SOM a nivel global (A) es aún más irreal; ignorar el sector rural (C) anula el propósito de impacto social, y las métricas de mercado (D) sí son indispensables en el Pitch Deck de una empresa social.'
      }
    }
  },
  'RA-C4-N3': {
    title: 'Investigación cualitativa y el impacto tecnológico en la comunidad',
    chipText: 'Investigación de campo · Tipo ICFES',
    subtitle: 'Lee el texto sobre metodologías de investigación de campo y triangulación cualitativa para analizar la brecha digital local. Luego responde.',
    readingBlocks: [
      {
        title: 'Diseño metodológico para el impacto tecnológico',
        icon: Info,
        content: 'Investigar el impacto de la tecnología en una comunidad requiere combinar herramientas cuantitativas (ej. encuestas de conectividad) con **métodos cualitativos** (ej. entrevistas en profundidad o grupos focales). Las encuestas nos dicen *cuántas* personas acceden a internet, pero solo las entrevistas revelan *cómo* ese acceso —o su ausencia— altera el tejido social, la educación familiar y las dinámicas económicas locales.'
      },
      {
        title: 'Formulación de preguntas e inducción de sesgos',
        icon: Users,
        content: 'Un error recurrente en entrevistas cualitativas es formular **preguntas inducidas o sesgadas**, aquellas que sugieren sutilmente la respuesta deseada al entrevistado. Por ejemplo, preguntar *"¿Verdad que la falta de internet ha destruido la educación de sus hijos?"* condiciona al participante. Las preguntas deben ser **abiertas y neutrales** (*"¿Cómo describiría la influencia del acceso a internet en el estudio diario de sus hijos?"*), permitiendo capturar matices e historias auténticas.'
      },
      {
        title: 'Muestreo cualitativo y representatividad',
        icon: Lightbulb,
        content: 'En investigación cualitativa de campo, el muestreo no busca la representatividad estadística del universo poblacional, sino la **representatividad de perspectivas y experiencias críticas**. Se utiliza con frecuencia el **muestreo intencional o por criterios**, seleccionando perfiles diversos (ej. docentes, estudiantes con conectividad, estudiantes sin conectividad, padres de familia). El tamaño de la muestra se rige por el principio de **saturación teórica**, punto en el cual las nuevas entrevistas ya no aportan información o patrones novedosos sobre el fenómeno.',
        pills: [{ text: 'Muestreo', type: 'purple' }, { text: 'Saturación', type: 'teal' }]
      },
      {
        title: 'El proceso de Triangulación Cualitativa',
        icon: Building2,
        content: 'La **triangulación cualitativa** consiste en contrastar diferentes fuentes de datos (ej. testimonios de estudiantes vs. bitácora de campo del investigador vs. informes estadísticos de la alcaldía) para verificar la validez y consistencia de los hallazgos. Esto reduce la subjetividad individual del investigador y asegura que las conclusiones de la investigación de campo estén basadas en patrones recurrentes firmemente evidenciados.',
        pills: [{ text: 'Triangulación', type: 'amber' }]
      }
    ],
    questions: [
      {
        id: 1,
        eyebrow: 'Diseño de instrumentos cualitativos · Pensamiento crítico',
        numLabel: 'Pregunta 1',
        text: 'Un estudiante investiga cómo el teletrabajo ha impactado las dinámicas familiares en su barrio y redacta la siguiente pregunta para su entrevista de campo: "Dado que el teletrabajo genera tanto estrés por la invasión del espacio familiar, ¿cómo ha deteriorado esto la relación con sus hijos?". ¿Qué error metodológico cometió y cómo debería replantearse de manera neutral?',
        options: [
          { letter: 'A', text: 'El error es no haber incluido opciones de respuesta cerrada (A, B, C); debe replantearse como una pregunta de opción múltiple.' },
          { letter: 'B', text: 'Cometió un sesgo de inducción al asumir de antemano que el teletrabajo genera estrés y deterioro. Debe reformularse de manera abierta y neutral: "¿De qué manera considera que el teletrabajo ha influido en las dinámicas y relaciones familiares cotidianas?".' },
          { letter: 'C', text: 'El error fue no consultar primero las estadísticas de la alcaldía; la pregunta en sí es correcta pero no tiene datos que la respalden.' },
          { letter: 'D', text: 'El error es hablar de "dinámicas familiares"; debió centrarse únicamente en la velocidad de la conexión a internet.' }
        ]
      },
      {
        id: 2,
        eyebrow: 'Selección de muestra y saturación teórica',
        numLabel: 'Pregunta 2',
        text: 'En una investigación cualitativa sobre la apropiación tecnológica en una escuela veredal, ¿cuándo sabe el investigador que ha alcanzado el punto de "saturación teórica" y que es momento de concluir el trabajo de campo?',
        options: [
          { letter: 'A', text: 'Cuando ha entrevistado exactamente a 100 personas, cumpliendo el requisito mínimo para que la investigación cualitativa sea considerada científica.' },
          { letter: 'B', text: 'Cuando los recursos del presupuesto de investigación se han agotado o cuando el cronograma de clases de la escuela termina.' },
          { letter: 'C', text: 'Cuando al realizar nuevas entrevistas a diferentes perfiles docentes y estudiantes, la información recopilada empieza a repetirse de forma sistemática y ya no emergen categorías ni hallazgos conceptuales nuevos.' },
          { letter: 'D', text: 'Cuando el director de la institución escolar aprueba los resultados preliminares y los valida formalmente.' }
        ]
      },
      {
        id: 3,
        eyebrow: 'Triangulación cualitativa de datos',
        numLabel: 'Pregunta 3',
        text: 'Un reporte de investigación afirma que "el 100% de los estudiantes de la comunidad rural está perfectamente integrado a la educación virtual". Sin embargo, las entrevistas del estudiante a los docentes revelan que el 40% no entrega tareas por fallas de señal, y su propia bitácora documenta cortes de luz diarios en la vereda. Para presentar una conclusión con rigor metodológico mediante triangulación, ¿qué debería redactar el estudiante?',
        options: [
          { letter: 'A', text: 'Ignorar las entrevistas a docentes y las notas de bitácora, ya que el reporte oficial es una fuente estadística de mayor jerarquía estatal.' },
          { letter: 'B', text: 'Declarar que los docentes y los cortes de luz no son representativos, y que la educación virtual es un éxito indiscutible.' },
          { letter: 'C', text: 'Contrastar las fuentes señalando la contradicción: aunque el reporte formal describe cobertura total, los testimonios de los docentes y la observación directa evidencian fallas de infraestructura crítica que limitan la entrega efectiva de actividades.' },
          { letter: 'D', text: 'Afirmar que el reporte formal es falso y que ningún estudiante puede educarse virtualmente en el departamento.' }
        ]
      },
      {
        id: 4,
        eyebrow: 'Ética de la investigación de campo',
        numLabel: 'Pregunta 4',
        text: 'Durante sus entrevistas en la comunidad, el estudiante recopila testimonios muy sensibles sobre dificultades económicas y familiares de los hogares que no tienen computadora. Desde el punto de vista ético de la investigación cualitativa, ¿cómo debe procesar e incluir esta información en su reporte final?',
        options: [
          { letter: 'A', text: 'Publicar los testimonios con nombre propio y dirección de residencia para darle mayor credibilidad y realismo al informe ante la comunidad escolar.' },
          { letter: 'B', text: 'Omitir por completo estos testimonios sensibles, ya que las emociones y las dificultades económicas no constituyen datos de impacto tecnológico.' },
          { letter: 'C', text: 'Utilizar seudónimos o códigos de participante para garantizar el anonimato absoluto de los entrevistados, y obtener su consentimiento informado previo explicando cómo se usarán sus relatos en la investigación.' },
          { letter: 'D', text: 'Entregar la base de datos de los participantes al rector de la escuela para que pueda tomar medidas disciplinarias en base a sus relatos.' }
        ]
      }
    ],
    answers: { 1: 'B', 2: 'C', 3: 'C', 4: 'C' },
    explanations: {
      1: {
        ok: '<strong>Correcto.</strong> El replanteamiento propuesto en la opción B elimina los juicios de valor y la inducción de antemano ("deteriorado", "estrés"). Al hacer una pregunta verdaderamente abierta y neutral, se le da espacio al entrevistado para relatar tanto impactos negativos como aspectos positivos del teletrabajo en su vida.',
        err: '<strong>Incorrecto.</strong> La respuesta correcta es B. Opciones cerradas (A) limitan la riqueza cualitativa; la opción C evade el problema estructural de inducción de la pregunta, y la D anula el foco social del estudio.'
      },
      2: {
        ok: '<strong>Correcto.</strong> La saturación teórica en investigación de campo cualitativa se alcanza cuando nuevas entrevistas a participantes representativos redundan en la misma información conceptual y patrones ya identificados, indicando que recopilar más relatos no modificará la comprensión del fenómeno.',
        err: '<strong>Incorrecto.</strong> La respuesta correcta es C. La saturación no depende de cuotas numéricas rígidas como 100 personas (A), ni del fin del presupuesto (B), ni de la aprobación administrativa del rector (D).'
      },
      3: {
        ok: '<strong>Correcto.</strong> La triangulación científica de datos consiste precisamente en contraponer las fuentes contradictorias (el reporte formal de cobertura virtual vs. la experiencia real relatada por docentes y la observación empírica de cortes de luz) para ofrecer un análisis honesto, balanceado y matizado de la realidad local.',
        err: '<strong>Incorrecto.</strong> La respuesta correcta es C. Omitir las voces locales (A o B) anula el valor de la investigación de campo, y descalificar completamente la estadística formal sin matices (D) carece de rigor analítico.'
      },
      4: {
        ok: '<strong>Correcto.</strong> La protección de la identidad de los sujetos de estudio y el uso del consentimiento informado son los principios éticos inquebrantables de cualquier investigación social de campo. El anonimato (a través de seudónimos o códigos) protege la intimidad de los participantes del estudio.',
        err: '<strong>Incorrecto.</strong> La respuesta correcta es C. Revelar identidades reales (A) vulnera la seguridad y privacidad de la comunidad; ignorar las vivencias socioeconómicas (B) empobrece la investigación, y usar la información para juzgar (D) es una violación grave de la ética.'
      }
    }
  }
};

export function AdvancedIcfesBoard({ challengeId, onValidation }: AdvancedIcfesBoardProps) {
  const content = useMemo(() => {
    return challengesContent[challengeId] || challengesContent['RA-C4-N1'];
  }, [challengeId]);

  const [activeQIndex, setActiveQIndex] = useState(0);
  const [selectedOpts, setSelectedOpts] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [confirmedQuestions, setConfirmedQuestions] = useState<Record<number, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [scores, setScores] = useState(0);

  const activeQuestion = content.questions[activeQIndex];
  const isQuestionConfirmed = confirmedQuestions[activeQuestion.id];
  const selectedLetter = selectedOpts[activeQuestion.id];

  // Restablecer estados al cambiar de reto
  useEffect(() => {
    setActiveQIndex(0);
    setSelectedOpts({});
    setConfirmedQuestions({});
    setShowResults(false);
    setScores(0);
  }, [challengeId]);

  const handleSelectOption = (letter: 'A' | 'B' | 'C' | 'D') => {
    if (isQuestionConfirmed) return;
    setSelectedOpts(prev => ({
      ...prev,
      [activeQuestion.id]: letter
    }));
  };

  const handleConfirmQuestion = () => {
    if (isQuestionConfirmed || !selectedLetter) return;

    const isCorrect = selectedLetter === content.answers[activeQuestion.id];
    if (isCorrect) {
      setScores(prev => prev + 1);
    }

    setConfirmedQuestions(prev => ({
      ...prev,
      [activeQuestion.id]: true
    }));

    // Notificación en vivo si ya se contestó la última pregunta
    const confirmedCount = Object.keys(confirmedQuestions).length + 1;
    const finalScore = isCorrect ? scores + 1 : scores;
    if (confirmedCount === content.questions.length) {
      const approved = finalScore >= 3; // Pasa con 3 o más correctas (75% o 100%)
      onValidation(approved);
    }
  };

  const handleNextQuestion = () => {
    if (activeQIndex < content.questions.length - 1) {
      setActiveQIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setSelectedOpts({});
    setConfirmedQuestions({});
    setShowResults(false);
    setScores(0);
    setActiveQIndex(0);
    onValidation(false);
  };

  const confirmedCount = Object.keys(confirmedQuestions).length;
  const progressPct = (confirmedCount / content.questions.length) * 100;

  // Medallas y feedback final
  const finalPercent = Math.round((scores / content.questions.length) * 100);
  const isApproved = scores >= 3;

  const getMedalDetails = (scoreVal: number) => {
    const medals = [
      { cls: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', icon: AlertTriangle, text: 'Sigue practicando' },
      { cls: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', icon: AlertTriangle, text: 'Sigue practicando' },
      { cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: Medal, text: 'Buen intento' },
      { cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: Medal, text: 'Muy bien - Aprobado' },
      { cls: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20', icon: Trophy, text: 'Dominio sobresaliente - Aprobado' }
    ];
    return medals[scoreVal] || medals[0];
  };

  const getResultsTitleAndMsg = (scoreVal: number) => {
    const titles = ['Sigue intentándolo', 'Puedes mejorar', '¡Buen intento!', '¡Muy buen desempeño!', '¡Excelente dominio!'];
    const msgs = [
      'Vuelve a leer el texto y analiza las explicaciones de cada pregunta para entender los conceptos clave de tecnología y sociedad.',
      'Revisaste la mitad. Presta atención a las inferencias lógicas entre los párrafos de lectura.',
      'Buen dominio de comprensión lectora. Refuerza los marcos de viabilidad y los principios éticos avanzados.',
      '¡Felicidades! Lograste una sólida comprensión de las implicaciones éticas y metodológicas de la tecnología.',
      '¡Desempeño perfecto! Demostraste un dominio sobresaliente y un análisis crítico de nivel superior.'
    ];
    return {
      title: titles[scoreVal] || titles[0],
      msg: msgs[scoreVal] || msgs[0]
    };
  };

  const resultsMeta = getResultsTitleAndMsg(scores);
  const medalMeta = getMedalDetails(scores);
  const MedalIcon = medalMeta.icon;

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6 select-none transition-colors">
      
      {/* Hero Banner */}
      <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/15">
            <Lightbulb className="w-3.5 h-3.5" />
            {content.chipText}
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-on-surface leading-snug">
            {content.title}
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant font-medium">
            {content.subtitle}
          </p>
        </div>
      </div>

      {/* Panel Dividido: Texto Base (Izquierda) y Preguntas (Derecha) */}
      {!showResults ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Bloque Izquierdo: Texto Base de Investigación (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 max-h-[620px] overflow-y-auto pr-2 bg-surface-container/20 p-4 rounded-3xl border border-outline-variant/20 scrollbar-thin">
            <div className="flex items-center gap-2 pb-2.5 border-b border-outline-variant/20">
              <BookOpen className="w-5 h-5 text-secondary" />
              <span className="text-xs font-black uppercase tracking-wider text-secondary">Texto base: Lectura Crítica</span>
            </div>

            {content.readingBlocks.map((block, idx) => {
              const BlockIcon = block.icon;
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {block.pills && block.pills.map((pill, pidx) => (
                      <span 
                        key={pidx} 
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          pill.type === 'purple' && 'bg-primary/10 text-primary border border-primary/25',
                          pill.type === 'teal' && 'bg-secondary/10 text-secondary border border-secondary/25',
                          pill.type === 'amber' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25',
                          pill.type === 'pink' && 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                        )}
                      >
                        {pill.text}
                      </span>
                    ))}
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-on-surface bg-surface-container px-2.5 py-0.5 rounded-full border border-outline-variant/35">
                      <BlockIcon className="w-3.5 h-3.5 text-on-surface-variant/80" />
                      {block.title}
                    </div>
                  </div>
                  <p 
                    className="text-xs text-on-surface-variant leading-relaxed font-medium pl-1 pb-2 border-b border-outline-variant/10"
                    dangerouslySetInnerHTML={{ __html: block.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }}
                  />
                </div>
              );
            })}
          </div>

          {/* Bloque Derecho: Preguntas y Opciones (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Barra de Progreso */}
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-3 shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant">
                <span>Progreso de la Evaluación</span>
                <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                  {confirmedCount} de {content.questions.length} respondidas
                </span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 rounded-full" 
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              
              {/* Dots del progreso */}
              <div className="flex gap-2.5 justify-center pt-1">
                {content.questions.map((q, idx) => (
                  <div 
                    key={q.id} 
                    className={cn(
                      "h-1.5 w-6 rounded-full transition-all duration-300",
                      idx < confirmedCount ? 'bg-primary' : (idx === activeQIndex ? 'bg-primary-container scale-x-125' : 'bg-outline-variant/40')
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Panel de la Pregunta Activa */}
            <div className="space-y-4">
              
              {/* Tarjeta de la Pregunta */}
              <div className="p-5 bg-surface-container rounded-3xl border border-outline-variant/30 relative overflow-hidden shadow-sm">
                <div className="flex justify-between items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-primary-container text-on-primary-container">
                    {activeQuestion.numLabel}
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant font-bold">
                    {activeQuestion.eyebrow}
                  </span>
                </div>
                <p className="text-sm md:text-base font-semibold text-on-surface leading-relaxed">
                  {activeQuestion.text}
                </p>
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full translate-x-10 -translate-y-10" />
              </div>

              {/* Opciones de respuesta */}
              <div className="flex flex-col gap-2.5">
                {activeQuestion.options.map((option) => {
                  const isSelected = selectedLetter === option.letter;
                  const isCorrectAnswer = option.letter === content.answers[activeQuestion.id];
                  
                  return (
                    <button
                      key={option.letter}
                      disabled={isQuestionConfirmed}
                      onClick={() => handleSelectOption(option.letter)}
                      className={cn(
                        "w-full text-left flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all duration-200",
                        !isQuestionConfirmed && "hover:border-primary/50 hover:bg-primary/5 active:scale-[0.995]",
                        isSelected && !isQuestionConfirmed && "border-primary bg-primary/5 ring-2 ring-primary/10 shadow-sm",
                        isQuestionConfirmed && isSelected && isCorrectAnswer && "bg-green-500/10 border-green-500/40 text-on-surface",
                        isQuestionConfirmed && isSelected && !isCorrectAnswer && "bg-rose-500/10 border-rose-500/40 text-on-surface",
                        isQuestionConfirmed && !isSelected && isCorrectAnswer && "bg-green-500/10 border-green-500/30 text-on-surface opacity-90",
                        isQuestionConfirmed && !isSelected && !isCorrectAnswer && "bg-surface-container border-outline-variant/20 opacity-40",
                        !isSelected && !isQuestionConfirmed && "bg-surface-container border-outline-variant/30"
                      )}
                    >
                      {/* Círculo de la Letra */}
                      <span className={cn(
                        "w-6 h-6 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 transition-all border",
                        !isQuestionConfirmed && !isSelected && "bg-surface-container text-on-surface-variant border-outline-variant/40",
                        isSelected && !isQuestionConfirmed && "bg-primary text-on-primary border-primary",
                        isQuestionConfirmed && isCorrectAnswer && "bg-green-600 text-white border-green-600",
                        isQuestionConfirmed && isSelected && !isCorrectAnswer && "bg-rose-600 text-white border-rose-600",
                        isQuestionConfirmed && !isSelected && !isCorrectAnswer && "bg-surface-container text-on-surface-variant/40 border-outline-variant/20"
                      )}>
                        {option.letter}
                      </span>
                      <span className="text-xs md:text-sm text-on-surface font-medium leading-relaxed">
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Caja de Retroalimentación */}
              {isQuestionConfirmed && (
                <div 
                  className={cn(
                    "p-4 rounded-2xl border text-xs md:text-sm leading-relaxed flex items-start gap-2.5 transition-all shadow-sm",
                    selectedLetter === content.answers[activeQuestion.id] 
                      ? 'bg-green-500/10 border-green-500/30 text-on-surface' 
                      : 'bg-rose-500/10 border-rose-500/30 text-on-surface'
                  )}
                >
                  {selectedLetter === content.answers[activeQuestion.id] ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 animate-bounce" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span 
                    className="font-medium"
                    dangerouslySetInnerHTML={{ 
                      __html: selectedLetter === content.answers[activeQuestion.id]
                        ? content.explanations[activeQuestion.id].ok
                        : content.explanations[activeQuestion.id].err
                    }}
                  />
                </div>
              )}

              {/* Botón de Acción */}
              <div className="flex justify-end pt-2">
                {!isQuestionConfirmed ? (
                  <button
                    disabled={!selectedLetter}
                    onClick={handleConfirmQuestion}
                    className="px-6 py-2.5 rounded-full text-xs md:text-sm font-bold bg-primary text-on-primary hover:bg-primary/95 transition-all shadow-md shadow-primary/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-95"
                  >
                    Confirmar respuesta <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-full text-xs md:text-sm font-bold bg-secondary text-on-secondary hover:bg-secondary/95 transition-all shadow-md shadow-secondary/10 flex items-center gap-1.5 active:scale-95"
                  >
                    {activeQIndex < content.questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'} <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* Resultados Finales */
        <div className="p-8 rounded-3xl bg-surface-container border border-outline-variant/30 text-center space-y-6 max-w-xl mx-auto shadow-lg transition-colors">
          <div className="space-y-2">
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm",
              medalMeta.cls
            )}>
              <MedalIcon className="w-4 h-4" />
              {medalMeta.text}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-on-surface pt-2">
              {resultsMeta.title}
            </h2>
            <p className="text-xs md:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed font-semibold">
              {resultsMeta.msg}
            </p>
          </div>

          {/* Tarjetas de Puntuación */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 shadow-inner">
              <span className="text-2xl md:text-3xl font-black text-primary block">{scores}</span>
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mt-1">correctas</span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 shadow-inner">
              <span className="text-2xl md:text-3xl font-black text-secondary block">{finalPercent}%</span>
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mt-1">puntaje</span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 shadow-inner">
              <span className="text-2xl md:text-3xl font-black text-on-surface block">{content.questions.length}</span>
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mt-1">preguntas</span>
            </div>
          </div>

          {/* Alerta de Aprobación */}
          <div className={cn(
            "p-4 rounded-2xl border text-xs md:text-sm font-semibold leading-relaxed flex items-center justify-center gap-2",
            isApproved 
              ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400'
          )}>
            {isApproved ? (
              <>
                <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span>¡Felicidades! Aprobaste este reto con {scores} de {content.questions.length} correctas.</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <span>No alcanzaste el mínimo para aprobar (mínimo 3 de {content.questions.length}). ¡Inténtalo de nuevo!</span>
              </>
            )}
          </div>

          {/* Botones finales */}
          <div className="pt-2">
            <button
              onClick={handleRestart}
              className="px-6 py-2.5 rounded-full text-xs md:text-sm font-bold bg-primary text-on-primary hover:bg-primary/95 transition-all shadow-md shadow-primary/10 flex items-center gap-1.5 mx-auto active:scale-95"
            >
              <RefreshCw className="w-4 h-4" /> Intentar de nuevo
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
