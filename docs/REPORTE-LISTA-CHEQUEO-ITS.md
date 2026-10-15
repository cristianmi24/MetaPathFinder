# Reporte: MetaPathFinder frente a la lista de chequeo de Sistemas Tutores Inteligentes

**Lista evaluada:** *Lista de Chequeo para la Verificación del Frontend: Sistemas Tutores Inteligentes (STI / ITS)*, Universidad de Córdoba, Departamento de Informática Educativa (docente evaluador: Prof. Raúl Toscano Miranda).
**Referencia teórica:** Caro Piñeres, M. F. (2015). *Metamodel for personalized adaptation of pedagogical strategies using metacognition in Intelligent Tutoring Systems*. Tesis doctoral, Universidad Nacional de Colombia.
**Sistema:** MetaPathFinder · rama `ccr-0381a356-znff55` · revisión del 15 de octubre de 2026.
**Modelo tutor:** Griffin (progresiones y ZDP) + inferencia bayesiana. Diseño detallado en [TUTOR-GRIFFIN-BAYES.md](TUTOR-GRIFFIN-BAYES.md).

> Autoevaluación hecha revisando el código. La calificación oficial la asigna el evaluador en la demo; por eso cada criterio indica **dónde se ve en la interfaz** y **qué archivo lo implementa**, para que la verificación sea directa.

## Resumen

| Bloque | Antes (14 oct.) | Ahora | Cumplimiento |
|---|---|---|---|
| 1 · Reflejo de los cuatro módulos canónicos | 3 / 8 | **8 / 8** | 100 % |
| 2 · Características que reflejan la inteligencia del tutor | 2 / 10 | **10 / 10** | 100 % |
| 3 · Metacognición computacional (FUNPRO) | 4 / 6 | **6 / 6** | 100 % |
| **Total** | **9 / 24 (37,5 %)** | **24 / 24 (100 %)** | **Sobresaliente** |

Escala: C = cumple (2), CP = cumple parcialmente (1), NC = no cumple (0), NA = no aplica.
Nota sobre UI-04: la recomendación por pares está implementada y visible, pero solo aparece cuando existen valoraciones de compañeros parecidos (k-NN). En la demo conviene tener al menos dos cuentas con pistas valoradas; de lo contrario se muestra la sustitución local (analogía ↔ contraejemplo).

## Bloque 1 · Cuatro módulos canónicos (8 / 8)

### MOD-01 · Módulo del experto / dominio — C (2/2)
- **Dónde se ve:** «Mi mapa de retos» (`/mi-mapa` y en el perfil): cuadrícula de 4 componentes MEN × 9 escalones con estado (dominado / en proceso / pendiente), **candado con razón** («Completa RB · N1 de este componente para desbloquearlo») y borde de ZDP. Cada tablero valida la lógica al instante (36 tableros interactivos).
- **Código:** `frontend/src/components/tutor/ChallengeMap.tsx`, `backend-python/app/services/tutor/domain.py` (escalera técnica, criterios), `engine.tech_unlocked`.
- **Unidades básicas:** cada reto conserva objetivo, criterios y pasos (`dynamicChallengeBank.ts`, `challengeInstructions.ts`).

### MOD-02 · Módulo del estudiante (overlay y perfil cognitivo) — C (2/2)
- **Dónde se ve:** tarjeta «Mi perfil de aprendizaje» (perfil, analíticas y mapa): estilo Felder-Silverman (Visual/Verbal · Global/Secuencial) obtenido con un cuestionario de 8 ítems al primer ingreso; anillo de dominio (verde dominado, amarillo en proceso, gris pendiente); barras de probabilidad de los 12 criterios metacognitivos con intervalo; última calibración; **concepción errónea** cuando el mismo error frecuente se repite en varios intentos («No es un descuido: conviene revisar la idea de fondo»).
- **Código:** `LearningStyleQuiz.tsx`, `LearnerProfileCard.tsx`, `lib/tutorEngine.ts` (`scoreLearningStyle`, `detectMisconception`), tabla `student_tutor_state`, `POST /api/tutor/learning-style`.

### MOD-03 · Módulo del tutor / pedagógico — C (2/2)
- **Dónde se ve:** cada ayuda lleva su **táctica nombrada** (Pregunta socrática → Señalamiento → Analogía cotidiana / Contraejemplo → Desglose paso a paso → Solución análoga guiada); ruta visible Fase › Tarea › Actividad (A · B · C en el encabezado); **dosificación dinámica**: el reto se elige en el escalón de la ZDP técnica con Beta-Bernoulli y el andamiaje según la ZDP metacognitiva (conciencia / monitoreo / transferencia, con *fading*).
- **Código:** `domain.TACTICS`, `domain.SCAFFOLD_LADDER`, `engine.plan_session`, `engine.scaffold_plan`, `TutorAdvisor.tsx`, `ReplanModal.tsx`.

### MOD-04 · Interfaz como traductor ergonómico y afectivo — C (2/2)
- **Dónde se ve:** mensajes reescritos en tono de tutor («¡Buen intento! Estuviste cerca. Un error es información…», «Aún no, pero vas por buen camino»); la consola dice «Buen intento 2: aún no cumple. Mira la condición que falta…» en lugar de «Error: validación fallida»; freno con explicación personal («Respondiste en 1,4 s, mucho más rápido que tu propio ritmo (3,2 s)…»). Interfaz despejada: un solo panel de tutor a la derecha, herramientas de apoyo plegadas.
- **Código:** `CognitiveChallenge.tsx` (mensajes), `MetacognitiveBrakeModal.tsx`, `TutorAdvisor.tsx`.

## Bloque 2 · Inteligencia del tutor en la interfaz (10 / 10)

### UI-01 · Adaptación multimodal (verbal / visual) — C (2/2)
- **Dónde se ve:** en el planteamiento del reto, conmutador **Verbal / Visual**. Verbal: pasos en prosa; Visual: **diagrama de flujo** generado desde los mismos pasos (inicio → pasos numerados → rombo «¿cumple los criterios?» → fin). Se abre por defecto en la modalidad del estilo del estudiante y se puede alternar a voluntad.
- **Código:** `ChallengeBriefing.tsx`, `VisualFlow.tsx`, `useTutorStore.presentationMode`.

### UI-02 · Navegación adaptativa (global / secuencial) — C (2/2)
- **Dónde se ve:** en el mapa, estilo **secuencial** = tarjeta «Siguiente reto · paso k de 9» y solo la ruta del componente actual; estilo **global** = pestañas por componente con saltos libres. **Desbloqueo**: al dominar el 90 % de los escalones practicados (mínimo 3), aparece el logro «la navegación libre quedó habilitada» y el modo global se activa para cualquier estudiante.
- **Código:** `ChallengeMap.tsx` (`navigationMode`, `freeNavigationUnlocked`).

### UI-03 · Andamiaje proactivo y asesor (Advisor) — C (2/2)
- **Dónde se ve:** panel permanente **«Tu tutor»** a la derecha durante todo el reto: mensaje del tutor, medidor «¿Qué tan atascado/a pareces?» (P(bloqueo)), escalera N0–N3, pistas **1/3 · 2/3 · 3/3** con candado progresivo, punto de control de confianza y criterios de la ZDP en los que se trabaja. Intervención no invasiva: la ayuda sube solo si la probabilidad de bloqueo se mantiene y baja cuando avanza (contingencia de Wood).
- **Código:** `TutorAdvisor.tsx`, `lib/tutorEngine.ts` (`blockingProbability`, `scaffoldLevel`), `data/tutorHints.ts` (36 pistas de nivel 3 con analogía, contraejemplo y pasos guiados).

### UI-04 · Curaduría dinámica y resiliencia de recursos — C (2/2)
- **Dónde se ve:** cada pista y la retroalimentación final tienen **👍 / 👎**. Al marcar 👎: (a) en la pista 3 el tutor **sustituye en caliente** la analogía por el contraejemplo (y viceversa) sin romper la pantalla; (b) consulta a los **pares parecidos (k-NN** sobre estilo, ZDP y sesgo) y muestra «A N compañeros con un perfil parecido les sirvió la pista k (xx %)» con el botón «Verla». Las pistas son locales: no hay 404 ni *timeouts*; si no hay pares con valoraciones, se usa el respaldo local.
- **Código:** `POST /api/tutor/resource-rating`, `GET /api/tutor/recommend/{user}` (media de Laplace), tabla `resource_ratings`, `rateHint` en `CognitiveChallenge.tsx`, `TutorAdvisor.tsx` (`peerRecommendation`).

### UI-05 · Replanificación en tiempo real ante bloqueos — C (2/2)
- **Dónde se ve:** sensores de tiempos atípicos (relativos al propio ritmo), errores seguidos, ediciones sin verificar y cambio de pestaña. **Al tercer error seguido la pantalla se atenúa** y aparece «Parece que este reto se resiste. Vamos a abordarlo de otra forma» con tres caminos: **modo guiado paso a paso** (pasos marcables dentro del mismo reto, táctica «Desglose»), **versión simplificada N1** del mismo componente, o seguir por cuenta propia (agencia, registrada).
- **Código:** `ReplanModal.tsx`, `CognitiveChallenge.tsx` (`consecutiveErrors`, `handleReplanChoice`).

## Bloque 3 · Metacognición computacional (6 / 6)

### META-01 · Doble lazo: nivel objeto y metanivel — C (2/2)
- **Dónde se ve:** zona central = tarea (nivel objeto); panel derecho = «Tu tutor» + «Métricas de proceso» (metanivel) con el bloque **«Mi autorregulación · en lo que estamos trabajando»** (criterios de la ZDP) y, al cerrar, la lectura del reto con probabilidades por nivel. El tutor explicita el motivo pedagógico de cada sugerencia («¿Por qué veo esto?»).
- **Código:** `TutorAdvisor.tsx`, `TutorFeedbackCard.tsx`, `LearnerProfileCard.tsx` (barras de autoeficacia por criterio).

### META-02 · Juicios metacognitivos y calibración (COP / CSRD) — C (2/2)
- **Dónde se ve:** JOL antes del reto (3 generales + 2 específicos), **puntos de control** durante el reto y **juicio de certeza** (Dudoso / Confiado / Seguro) **antes de verificar**; contraste inmediato: «Marcaste “Seguro” (9/10) y obtuviste 60/100: te sentías más seguro/a de lo que mostró el resultado». Calibración con sesgo, exactitud absoluta, Brier, discriminación, gamma y calibración temporal aparte. La **estrategia ya no se asigna al azar**: muestreo de Thompson por perfil de calibración (grupo experimental) con explicación.
- **Código:** `CertaintyPrompt.tsx`, `services/calibration.py`, `engine.choose_strategy`, `JolFlow.tsx` (JolReady).

### META-03 · Transparencia algorítmica y agencia compartida — C (2/2)
- **Dónde se ve:** botones **«¿Por qué veo esto?»** en el reto sugerido, la estrategia, el medidor de bloqueo, el perfil de calibración, el mapa y la retroalimentación (con los indicadores que pesaron y su signo). **«Prefiero otro reto»**, **«Prefiero otra estrategia»** y «Seguir por mi cuenta» registran la decisión (`POST /api/tutor/override`) y el tutor sigue adaptándose. Evaluación sin castigo: la certeza y las pistas no restan nota; el lenguaje es de desarrollo («Ya logras… tu siguiente paso es…»).
- **Código:** `WhyThis.tsx`, `tutor_decisions` (tabla), `ChallengeBriefing.tsx`, `JolFlow.tsx`.

## Qué cambió en la calibración (precisión)

1. Solo los juicios de certeza cuentan en el sesgo; tiempo e intentos se reportan como calibración temporal y de esfuerzo.
2. Bandas: |sesgo| ≤ 1 calibrado · ≤ 2 leve · > 2 marcado; sobre/subestimación siguen en ±2 para los perfiles.
3. Nuevas medidas: Brier, discriminación (confianza en ítems superados − no superados), gamma de Goodman-Kruskal.
4. Criterio A4 «predicción coincide» con ±1,5 en vez de ±2.
5. Freno metacognitivo personalizado (mediana propia / 2, piso 2 s) y pausa larga relativa al propio ritmo.

## Lo que queda por hacer (y no depende del código)

- Validación con docentes de los criterios y las probabilidades de experto (juicio de expertos, kappa, Rasch): ver sección 8 de [TUTOR-GRIFFIN-BAYES.md](TUTOR-GRIFFIN-BAYES.md).
- Ampliar los léxicos de los indicadores de texto con reflexiones reales del piloto.
- Para la demo de UI-04, preparar dos o tres cuentas con pistas valoradas para que aparezca la recomendación por pares.
- Encabezado de la lista: nombres y códigos de los integrantes, URL de la demo y fecha de evaluación.
