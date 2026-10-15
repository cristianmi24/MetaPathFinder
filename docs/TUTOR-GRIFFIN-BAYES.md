# Sistema tutor de MetaPathFinder: modelo de Griffin + inferencia bayesiana

**Estado:** implementado (backend, frontend, pruebas) · Octubre de 2026
**Documentos de origen:** *Progresión metacognitiva: criterios de calidad ordenados por nivel* y *Arquitectura del sistema tutor: modelo de Griffin y modelo bayesiano* (propuestas de diseño, octubre de 2026). Este documento los consolida, registra qué se implementó, qué se cambió respecto a la propuesta y por qué, y qué queda por validar con docentes.

---

## 1. Resumen de decisiones

| Decisión | Implementación |
|---|---|
| Modelo pedagógico | Griffin (2018): progresiones de desarrollo, zona de desarrollo próximo (ZDP) basada en evidencia, ciclo evaluar → ubicar → andamiar → reevaluar, retroalimentación con enfoque de desarrollo. |
| Inteligencia | Naive Bayes Bernoulli (lectura del reto y bloqueo), Beta-Bernoulli (dominio por criterio y por escalón) y muestreo de Thompson (estrategia). Sin redes neuronales, sin datos históricos: los parámetros iniciales los fija el experto y se actualizan con cada estudiante. |
| Dos progresiones | Técnica (4 componentes MEN × 9 escalones) decide **qué reto**; metacognitiva (12 criterios B1–A4) decide **qué andamiaje**. |
| Explicabilidad | Cada decisión guarda los indicadores que pesaron (`tutor_decisions`) y la interfaz los muestra con «¿Por qué veo esto?». |
| Agencia | El estudiante puede rechazar el reto o la estrategia sugeridos y seguir «bajo su responsabilidad»; la decisión se registra y el tutor sigue adaptándose. |
| Grupo control | Si el estudiante pertenece a un grupo cuyo nombre contiene «control», la estrategia se asigna al azar (diseño experimental intacto). |

## 2. Dónde vive cada módulo

| Módulo STI | Archivo | Contenido |
|---|---|---|
| Dominio | `backend-python/app/services/tutor/domain.py` | Criterios B1–A4, indicadores e1–e9 y f1–f4 con probabilidades por nivel, señales de bloqueo, escalera N0–N4, tácticas, umbrales. Servido en `GET /api/tutor/domain` (misma fuente de verdad para el cliente). |
| Estudiante | `backend-python/app/services/tutor/bayes.py`, `indicators.py`, `engine.py` · tabla `student_tutor_state` | Estado bayesiano por estudiante: Beta por criterio, Beta por escalón y componente, brazos de Thompson por perfil, historial. |
| Tutor | `engine.py` (`plan_session`, `process_phase_c`, `scaffold_level`, `development_feedback`) · `frontend/src/lib/tutorEngine.ts` | Fase A: reto y estrategia. Fase B: probabilidad de bloqueo en el cliente (sin ida y vuelta). Fase C: lectura, actualización y «Ya logras / siguiente paso». |
| Interfaz | `frontend/src/components/tutor/*` | Asesor permanente, pistas 1/3–3/3, replanificación, juicio de certeza, estilo de aprendizaje, mapa de retos, perfil, mapa de progresión docente, diagrama de flujo. |

## 3. Progresión metacognitiva (sin cambios de fondo)

Cuatro dimensiones × tres niveles. Cada criterio describe una conducta observable, de calidad (no cantidad), ordenada y con evidencia en los datos que ya captura el sistema. Ver `domain.CRITERIA`; cada criterio incluye además la frase en segunda persona para «Ya logras ___» y «Tu siguiente paso es ___».

## 4. Cambios respecto a la propuesta (rol de experto)

| # | Propuesta original | Decisión implementada | Por qué |
|---|---|---|---|
| 1 | A4: «sesgo de calibración dentro de ±2». | **±1,5** (`CALIBRATED_BIAS`). | ±2 en escala 0-10 equivale a un 20 % de desfase, demasiado laxo para llamarlo «predicción coincide». Las bandas de calibración quedan: ≤1 calibrado, ≤2 leve, >2 marcado. |
| 2 | Criterio logrado cuando Beta ≥ 0,70 (el ejemplo lo da por logrado tras dos éxitos, Beta(3,1) = 0,75). | ≥ 0,70 **y al menos 3 observaciones** (`MIN_OBSERVATIONS`). | Con un prior Beta(1,1), dos aciertos ya superan 0,70: se consolidaría un nivel con muy poca evidencia y contradice la propia regla de estabilidad («no de un solo reto»). |
| 3 | Calibración = promedio de **todos** los JOL (incluidos tiempo e intentos) frente al desempeño. | Solo los juicios de certeza (JG-B1, JG-M1, JG-A1, JG-A2, JOL específicos y JG-*3 de capacidad) entran en el sesgo. Tiempo (JG-B2) y esfuerzo (JG-M2) se reportan aparte (`time_calibration`). | Estimar minutos mide planificación, no certeza; mezclarlos contamina el sesgo. Se añaden Brier, discriminación y gamma de Goodman-Kruskal (Schraw, 2009; Nelson, 1984) cuando hay varios ítems. |
| 4 | Freno metacognitivo: latencia < mitad del **promedio** del estudiante. | Mitad de la **mediana**, piso de 2 s y umbral fijo de 5 s hasta tener 3 muestras. | La mediana resiste pausas largas atípicas; el piso evita umbrales absurdos; el arranque en frío evita frenos erráticos en el primer reto. |
| 5 | Pausa larga: 30 s fijos. | Mayor al doble del promedio de pausas del propio estudiante (mínimo 10 s; 30 s hasta tener muestras). | Es lo que pide la propuesta (umbrales relativos), aplicado también a esta señal. |
| 6 | Señales de bloqueo: ejemplo con 2 señales → 48 %. | Las cuatro señales se consideran siempre observadas (sí/no). | Es la única lectura que reproduce exactamente el 48 % y el 77 % del documento; las pruebas lo verifican. |
| 7 | Naive Bayes con probabilidades de experto crudas. | Probabilidades acotadas a [0,02, 0,98] y cálculo en log-espacio. | Ningún indicador puede anular un nivel por sí solo; evita subdesbordamiento. |
| 8 | «Éxito» de la estrategia (Thompson) = el sesgo bajó. | Éxito si \|sesgo\| baja al menos 0,25 **o** si el estudiante se mantiene calibrado (≤1,5) dos retos seguidos. | Sin el segundo caso, un estudiante ya calibrado nunca daría éxitos y el tutor lo haría explorar sin motivo. |
| 9 | Indicadores de texto (IA-2 / red neuronal en el primer documento). | Léxicos construidos a partir de los ejemplos ancla + similitud de tokens con las anclas (explicable y sin datos). | Coherente con la decisión «sin redes neuronales» del segundo documento. Los léxicos se amplían con textos reales del piloto. |
| 10 | Criterios no observables se cuentan como no cumplidos. | `None` = no observable y se omite (p. ej., M3 cuando no hubo errores; A3 cuando no hizo falta ayuda). | Evita castigar al estudiante por conductas que el reto no le dio ocasión de mostrar. |
| 11 | Selección de reto al azar entre N1 y N2. | Escalón de la ZDP técnica dentro del nivel, priorizando componentes menos practicados; alternativas visibles para que el estudiante elija. | Ciclo de Griffin + agencia compartida (META-03). |
| 12 | Curaduría de recursos (no estaba en la propuesta). | 👍/👎 por pista y por retroalimentación; sustitución en caliente (analogía ↔ contraejemplo); recomendación por pares con k-NN sobre estilo, ZDP y sesgo. | Cubre UI-04 de la lista de chequeo con el mismo marco bayesiano (media de Laplace). |

## 5. Flujo por fase

**Fase A (`POST /api/tutor/plan`)** → reto del escalón ZDP, estrategia (Thompson o azar), tipo de andamiaje según ZDP metacognitiva (conciencia / monitoreo / transferencia), explicación en lenguaje natural y alternativas. La pantalla muestra «Elegido por tu tutor · ¿Por qué veo esto?» y «Prefiero otro reto / otra estrategia».

**Fase B (cliente, `tutorEngine.ts`)** → con cada evento: P(bloqueo) = NB de dos clases con las cuatro señales → escalera N0 (pregunta) · N1 (orientación) · N2 (estrategia) · N3 (paso parcial, si P ≥ 0,70 dos veces seguidas) · N4 (solución, solo a petición = pista 3/3). Al tercer error seguido: replanificación (modo guiado paso a paso, versión N1 o seguir por cuenta propia). Juicio de certeza antes de «Verificar» y contraste inmediato con el resultado. Puntos de control obligatorios si la ZDP es Básico. Freno personalizado.

**Fase C (`POST /api/phase-c/complete` con `tutor_observations`)** → indicadores → lectura del reto (NB) → actualización Beta por criterio y escalón → Thompson → ZDP → retroalimentación «Ya logras ___. Tu siguiente paso es ___» con los indicadores que pesaron. Todo queda en `tutor_decisions`.

## 6. Ejemplos verificados por pruebas (`backend-python/tests/test_tutor.py`)

- Lectura del reto del documento: Básico 0,7 % · Medio 77,9 % · Avanzado 21,4 %.
- Bloqueo: dos errores + pausa larga = 48 % (N0); + ediciones sin éxito = 77 % (N2; N3 si se repite).
- Beta-Bernoulli: 0,67 → 0,75 → 0,60 → 0,67 → 0,71; no se consolida con dos observaciones.
- Ejemplos ancla de reflexión: el texto Básico activa f1, el Medio f1+f2, el Avanzado f1+f3; «No sé, me fue mal» no activa nada; «La parte de programar» no cuenta como específico (f4) y «El criterio 3…» sí.
- Ciclo completo: estrategia que reduce el sesgo pasa de Beta(2,1) a Beta(3,1).

## 7. Capacidad (50 estudiantes simultáneos)

Prueba de carga incluida (`scripts/loadtest.py`, 50 usuarios × 2 rondas, stack local con 3 workers): 0 errores; p95 por fase entre 170 y 280 ms; la Fase C con tutor 274 ms. Registro y login (bcrypt, deliberadamente costoso) suben a ~5 s cuando los 50 entran en el mismo segundo: es un pico único al inicio de clase. Medidas: cálculo de bloqueo en el cliente, lotes de eventos, keep-alive y compresión en Express, límite de peticiones por usuario (no por IP: un aula sale por una sola IP), pool de conexiones 3 × (8+12) ≤ 150 de Postgres, chunks de Vite cacheables.

## 8. Validación pendiente (como pide Griffin)

1. **Juicio de expertos:** dos o tres docentes revisan el orden y la redacción de B1–A4 y las probabilidades de experto de `domain.INDICATORS`.
2. **Ejemplos ancla:** ampliar los léxicos f1–f4 con reflexiones reales del piloto (consentimiento informado; menores de edad).
3. **Acuerdo IA-docente:** en una muestra de reflexiones, comparar el nivel asignado por `read_challenge` con el de un docente (kappa de Cohen ≥ 0,6 como meta).
4. **Rasch:** con datos suficientes, comprobar que los criterios conservan el orden de dificultad propuesto; si no, reordenar la progresión.
5. **Reajuste de probabilidades:** sustituir los valores de experto por conteos reales (misma tabla, sin cambiar el código).

## 9. Referencias

Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. *Monthly Weather Review*, 78(1), 1–3.
Caro Piñeres, M. F. (2015). *Metamodel for personalized adaptation of pedagogical strategies using metacognition in Intelligent Tutoring Systems*. Tesis doctoral, Universidad Nacional de Colombia.
Conati, C., Gertner, A., & VanLehn, K. (2002). Using Bayesian networks to manage uncertainty in student modeling. *UMUAI*, 12(4), 371–417.
Felder, R. M., & Silverman, L. K. (1988). Learning and teaching styles in engineering education. *Engineering Education*, 78(7), 674–681.
Griffin, P. (Ed.). (2018). *Assessment for Teaching* (2.ª ed.). Cambridge University Press.
Nelson, T. O. (1984). A comparison of current measures of the accuracy of feeling-of-knowing predictions. *Psychological Bulletin*, 95(1), 109–133.
Nelson, T. O., & Narens, L. (1990). Metamemory: A theoretical framework and new findings. *Psychology of Learning and Motivation*, 26, 125–173.
Schraw, G. (2009). A conceptual analysis of five measures of metacognitive monitoring. *Metacognition and Learning*, 4, 33–45.
Thompson, W. R. (1933). On the likelihood that one unknown probability exceeds another. *Biometrika*, 25(3/4), 285–294.
Wood, D., Bruner, J. S., & Ross, G. (1976). The role of tutoring in problem solving. *J. Child Psychology and Psychiatry*, 17(2), 89–100.
