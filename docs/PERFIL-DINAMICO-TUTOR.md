# Perfil dinámico del estudiante y ciclo de decisión del tutor

Octubre de 2026 · Complementa [TUTOR-GRIFFIN-BAYES.md](TUTOR-GRIFFIN-BAYES.md) y [AUDITORIA-CAPTURA-BAYES.md](AUDITORIA-CAPTURA-BAYES.md).
Código: `backend-python/app/services/tutor/profile.py` (modelo), `engine.py` (decisiones), `frontend/src/lib/tutorEngine.ts` (bloqueo en vivo), `frontend/src/components/tutor/LearnerProfileCard.tsx` (modelo abierto).

## 1. El problema que resuelve

Antes, el tutor "recordaba" al estudiante de forma fragmentada:

- **Calibración:** solo usaba el sesgo del **último** reto (`last_profile`). Un reto atípico cambiaba la estrategia asignada.
- **Conducta:** los indicadores e1–e9 (planificar, pedir ayuda, foco…) se calculaban en cada reto y **se descartaban**. Solo influían a través de los 12 criterios.
- **Bloqueo en vivo:** partía de una probabilidad previa de 0,20 **igual para todos**. Al estudiante que casi nunca se atasca se le interrumpía igual que al que se atasca siempre.
- **Lectura de nivel:** el Naive Bayes de nivel arrancaba de cero (prior uniforme) en cada reto, así que el nivel podía saltar de Básico a Avanzado entre dos retos.

## 2. Arquitectura: un ciclo de cuatro capas

```
 INTERACCIÓN            RASGOS OBSERVABLES           MODELO DEL ESTUDIANTE              DECISIÓN DEL TUTOR
 (cada clic/tecla)      (por reto)                   (perfil dinámico, persistente)     (qué hace ahora)
 ─────────────────      ──────────────────           ──────────────────────────────     ─────────────────────────
 clics, arrastres,  ─►  señales en vivo:          ─► Propensión a bloquearse ───────►  prior del NB de bloqueo
 teclas, pausas,        errores seguidos, pausa,     Beta(2,8) con olvido                → andamiaje N0–N3 en vivo
 pestaña, ratón,        ediciones, pestaña
 verificaciones                                       Calibración ─────────────────────►  brazo de Thompson
 JOL, checkpoints,  ─►  indicadores e1–e9         ─► Kalman sobre el sesgo                → estrategia metacognitiva
 pistas, reflexión      y de texto f1–f4             (media ± incertidumbre)              → puntos de control
                                                      8 rasgos de autorregulación ─────►  tipo de andamiaje,
                                                      Beta-Bernoulli con olvido           mensaje de foco, pistas
                                                      12 criterios (Griffin) ──────────►  ZDP metacognitiva
                                                      escalones técnicos (Beta) ───────►  qué reto sigue
                                                      lectura de nivel (Bayes secuencial)
```

Cada capa solo consume la anterior. Así se puede cambiar cómo se captura algo (la auditoría H1–H3) sin tocar las decisiones, y recalibrar un parámetro sin tocar la captura.

## 3. Las piezas del perfil y por qué cada una

| Pieza | Modelo | Se alimenta de | Por qué este modelo |
|---|---|---|---|
| **Calibración** | Filtro de Kalman 1-D sobre el sesgo (confianza − desempeño, 0-10). Prior N(0, 2²); deriva del sesgo real σ=0,6 por reto; ruido de medida σ=1,5. | `bias_index` de cada Fase C | Separa **qué tan sesgado es** (media) de **qué tan seguros estamos** (desviación). Con un reto, P(sobreconfianza) nunca supera ~0,8. La deriva permite seguir al estudiante cuando mejora, que es justo lo que el tutor busca. |
| **Perfil de calibración** | P(sobre)=P(sesgo>1,5), P(sub)=P(sesgo<−1,5), P(calibrado)=resto, bajo la normal posterior | Kalman | El umbral ±1,5 es el mismo del criterio A4. Probabilidades, no etiquetas: la interfaz y las decisiones ven la duda. |
| **8 rasgos de autorregulación** | Beta-Bernoulli con olvido λ=0,85 por reto (memoria efectiva ≈ 6–7 retos) | e7 planificación, e1 estimación del tiempo, e2 búsqueda de ayuda, e3 autonomía, e4 control de impulsos, e5 monitoreo, e6 uso de la estrategia, e8 foco | Los indicadores ya existían; ahora se **acumulan**. El olvido evita que un mal comienzo marque al estudiante para siempre. Un indicador no observable (`None`) no suma evidencia. |
| **Propensión a bloquearse** | Beta con prior Beta(2,8) (media 0,20 = el valor de experto anterior), olvido hacia ese prior, acotada a [0,08; 0,50] | ¿Pidió pista, recibió pista automática, se replanificó, vio N2/N3 o no logró el reto? | Personaliza el **punto de partida** del Naive Bayes en vivo. Las cotas garantizan que el prior nunca anule las señales: un estudiante "que nunca se bloquea" sigue recibiendo ayuda si las señales lo indican. |
| **Ritmo** | Media con olvido de log(tiempo real / tiempo estimado) | Fase C | La escala logarítmica trata simétricamente "tardé el doble" y "tardé la mitad". |
| **Lectura de nivel** | Bayes secuencial: prior = 60 % uniforme + 40 % lectura anterior | Historial | Suaviza saltos de nivel por un reto atípico sin anclar al estudiante a su pasado. |

## 4. Cómo decide el tutor con el perfil

| Decisión | Antes | Ahora |
|---|---|---|
| **Bloqueo en vivo** (`blockingProbability`) | prior 0,20 fijo | Prior = propensión personal. Ejemplo verificado: con errores seguidos y pausa larga, un estudiante que se bloquea seguido (prior 0,33) llega a P=0,65 → **N1**; con el prior fijo era 0,485 → N0. A uno que rara vez se bloquea (prior 0,10) le da 0,29 → no se le interrumpe. |
| **Estrategia** (Thompson) | brazos del perfil del último reto | Brazos del perfil de calibración estimado por el Kalman. La explicación muestra la probabilidad («sobreconfianza, 84 %»). La evaluación del éxito usa el mismo brazo con que se eligió. |
| **Andamiaje de la sesión** (`scaffold_plan`) | Solo por ZDP | ZDP + perfil: puntos de control obligatorios si P(sobre) ≥ 0,6 o el monitoreo está "a trabajar"; nombrar el criterio antes de la pista si el control de impulsos o la autonomía están "a trabajar"; primer mensaje dirigido al **rasgo más débil**. Cada ajuste queda en `personalized` (explicable). |
| **Nivel del reto** | Naive Bayes con prior uniforme | Naive Bayes con prior secuencial |

## 5. Modelo abierto (lo ve el estudiante)

La tarjeta «Mi perfil de aprendizaje» muestra:
- la calibración estimada (sesgo ± incertidumbre y la barra de las tres probabilidades);
- los 8 rasgos con su estado (fortaleza / en desarrollo / a trabajar / sin datos) y el foco actual;
- la propensión a bloquearse y el ritmo;
- «Cómo se adapta tu tutor», con los ajustes de `personalized`.

Mostrar el modelo es en sí una intervención metacognitiva (Bull & Kay, 2010): el estudiante contrasta lo que cree de sí con lo que muestra su conducta.

## 6. Dependencias y límites

1. **La calidad del perfil depende de la captura.** Mientras no se corrijan H1–H3 de la auditoría (fallos repetidos descartados, teclado, arrastre e iframes invisibles), e2, e4 y e7 llegan sesgados, y la propensión a bloquearse se subestima en los tableros. Esa corrección está en curso en otra sesión.
2. **Arranque en frío.** Sin retos cerrados, todo vale lo que valía antes (prior 0,20, `last_profile`, andamiaje por ZDP). No se rompe nada para estudiantes existentes: su perfil empieza vacío y se llena desde su próximo reto.
3. **Los parámetros son de experto.** FORGET, las σ del Kalman, el prior Beta(2,8), los umbrales 0,45/0,70 y READING_MEMORY están al inicio de `profile.py` y de `engine.py`. Con los datos del piloto (las instantáneas `CHALLENGE_PROGRESS` y los eventos en vivo que ya se guardan) se ajustan por máxima verosimilitud sin cambiar el código.

## 7. Validación propuesta

- **Calibración:** correlación entre la media del Kalman en el reto t y el sesgo observado en t+1. Debe superar la del `last_bias` crudo; si no, sobra el filtro.
- **Bloqueo:** AUC del Naive Bayes con prior personal frente al prior fijo, usando como verdad "pidió pista o falló 3 veces en los 2 minutos siguientes".
- **Rasgos:** acuerdo con la observación de un docente en una muestra de sesiones (kappa ≥ 0,6).
- **Efecto:** en el diseño experimental, comparar la reducción de |sesgo| entre grupo experimental (perfil dinámico) y control (asignación al azar).

## 8. Pruebas automatizadas

`backend-python/tests/test_profile.py` (8 pruebas, más las 9 anteriores del tutor; 17 en verde):
- el Kalman no etiqueta con un solo reto y gana certeza con más;
- sigue el cambio cuando el estudiante mejora;
- los rasgos acumulan y olvidan;
- el prior de bloqueo es personal y está acotado;
- el andamiaje se personaliza;
- la estrategia usa el perfil dinámico y no el último reto;
- el prior secuencial suaviza saltos;
- la Fase C actualiza el perfil de punta a punta.

## Referencias

Bull, S., & Kay, J. (2010). Open learner models. En *Advances in Intelligent Tutoring Systems* (pp. 301–322). Springer.
Corbett, A. T., & Anderson, J. R. (1995). Knowledge tracing: Modeling the acquisition of procedural knowledge. *UMUAI*, 4(4), 253–278.
Kalman, R. E. (1960). A new approach to linear filtering and prediction problems. *Journal of Basic Engineering*, 82(1), 35–45.
Schraw, G. (2009). A conceptual analysis of five measures of metacognitive monitoring. *Metacognition and Learning*, 4, 33–45.
Winne, P. H., & Hadwin, A. F. (1998). Studying as self-regulated learning. En *Metacognition in Educational Theory and Practice* (pp. 277–304). Erlbaum.
