# Auditoría: captura de interacciones y datos del tutor bayesiano

Fecha: 15 oct 2026 · Alcance: `CognitiveChallenge.tsx`, los 22 tableros de actividad (36 retos), `useCognitiveStore`, `usePhaseSync`, `tutorEngine.ts` y `backend-python/app/services/tutor/*`.

## 1. Cómo fluye el dato

```
Tablero de actividad ──onValidation(éxito)──► CognitiveChallenge ──► señales en vivo ──► P(bloqueo) Naive Bayes (cliente)
        │                                         │                                      └─► andamiaje N0–N3, replanificación
        └─ clics / teclas / arrastre ─► contadores (clics, ediciones, pausa, ratón, pestaña)
                                                  │
                                       al enviar ─► Fase B (ChallengeResult) ─► Fase C: tutor_observations
                                                                                  └─► indicadores e1–e9 + f1–f4
                                                                                      ├─ Naive Bayes de 3 niveles (lectura del reto)
                                                                                      ├─ Beta-Bernoulli por criterio (B1…A4)
                                                                                      └─ Thompson (elección de estrategia)
```

## 2. Qué usa cada modelo y si se captura bien

### 2.1 Probabilidad de bloqueo (cliente, en vivo)

| Señal | De dónde sale | Estado |
|---|---|---|
| `errores_seguidos` (≥ 2 fallos seguidos) | `consecutiveErrors` ← `onValidation(false)` | ❌ **Nunca se activa en tableros** (ver H1) |
| `pausa_larga` (pausa > umbral propio) | `lastEditTime` ← clic en el tablero o tecla en el editor de código | ❌ **Falsos positivos** al escribir, arrastrar o usar tableros en iframe (H2) |
| `ediciones_sin_exito` (> 10 desde la última verificación) | `editsSinceRun` ← clics | ⚠️ Solo cuenta clics, no arrastres ni teclas (H2) |
| `cambio_pestana` (último minuto) | `visibilitychange` | ✅ Correcto |

### 2.2 Indicadores de conducta (servidor, al cerrar Fase C)

| Indicador | Dato crudo | Estado |
|---|---|---|
| e1 tiempo real ±30 % del estimado | `estimated_minutes`, `total_time_seconds` | ✅ |
| e2 pista tras error y antes del 3.er intento | `hint_requested_after_error`, `hint_requested_before_third_attempt` (usa `totalRuns`) | ⚠️ `totalRuns` se subcuenta (H1) |
| e3 sin pista automática | `auto_hint_shown` | ✅ |
| e4 sin freno metacognitivo | `reflexive_brake_triggered` | ⚠️ Depende de latencias entre verificaciones; afectado por H1 |
| e5 confianza en la dirección correcta | `jol_inicial`, `checkpoints`, `err_count` | ⚠️ `err_count` subcontado (H1) |
| e6 estrategia antes de la ayuda | `strategy_evidence_before_help` | ✅ |
| e7 planificó antes de la primera edición | `time_before_first_edit`, `subtasks_created` | ❌ **`time_before_first_edit` siempre es `null` en tableros** (H3) |
| e8 sin cambios de pestaña | `tab_changes` | ✅ |
| e9 ratón no errático | `mouse_distance` | ⚠️ Ciego dentro de iframes (H2) |
| f1–f4 texto de la reflexión y JOL | `reflection_text`, `jg_m3_text`, `jg_a3_text` | ✅ |

### 2.3 Persistencia en tiempo real

| Elemento | Estado |
|---|---|
| Eventos cognitivos (respuestas, pistas, andamiaje, pausas, ratón) | ✅ Corregido hoy (commit `c53c899`): envío cada 10 s y al cerrar la pestaña |
| Instantánea de progreso cada 30 s (tiempo, clics, errores, `p_block`) | ✅ Nuevo hoy: queda rastro aunque el estudiante abandone |
| Intervenciones del tutor | ✅ En vivo desde antes |
| Errores falsos (ensayos al abrir, fases SQL correctas, IDE correcto, línea del tiempo al abrir) | ✅ Corregido hoy (commit `30d4f38`) |

## 3. Hallazgos, de más a menos grave

### H1 — Los fallos repetidos se descartan (crítico)
`handleBoardValidation` ignora una llamada si trae el mismo valor que la anterior (`if (lastBoardValidationRef.current === success) return;`). Por eso **dos verificaciones fallidas seguidas cuentan como una sola**.

En la práctica, en los tableros:
- `consecutiveErrors` casi nunca pasa de 1, así que `errores_seguidos` (≥ 2) **no se activa nunca**. Es la señal de mayor peso del modelo (0,8 frente a 0,2).
- La replanificación (≥ 3 errores seguidos) **es inalcanzable**.
- `err_count`, `totalRuns` y las latencias del freno quedan **subcontados**, y eso afecta a e2, e4 y e5.

Consecuencia para el andamiaje, calculada con la tabla actual (prior 0,20):

| Señales activas | P(bloqueo) | Ayuda que se muestra |
|---|---|---|
| ninguna | 0,011 | — |
| pausa larga | 0,056 | — |
| errores seguidos | 0,147 | — |
| errores + pausa | 0,485 | N0 |
| pausa + ediciones + pestaña | 0,437 | N0 |
| errores + pausa + ediciones | 0,767 | N2 |

Sin `errores_seguidos`, en los tableros solo se llega a N0, y únicamente si se suman pausa, ediciones y cambio de pestaña. **El andamiaje automático N1–N3 prácticamente no aparece en las 36 actividades.**

Esta regla existía para frenar los tableros que reportaban en cada cambio, como los ensayos o el arrastre de DragAndDropBoard. Al eliminarla, esos tableros volverían a inflar los errores.

### H2 — Actividad invisible: teclado, arrastre e iframes (alto)
La actividad solo se registra con un `onClick` sobre el contenedor del tablero. Quedan fuera:
- **Escribir** en ensayos y SQL: ni la tecla ni el `onChange` del tablero actualizan `lastEditTime`. Afecta a 9 retos.
- **Arrastrar** (HTML5 o dnd-kit): un arrastre no genera `click`. Afecta a 10 tableros.
- **Tableros en iframe** (SmartphoneAnatomy, ComputingEvolution, MiniExcel, DigitalIdentity, ArduinoHuerta): los clics y el ratón dentro del iframe no llegan a la ventana principal.

El efecto: un estudiante que trabaja sin parar acumula "pausa larga". Por sí sola, esa señal sube `P(bloqueo)` de 0,011 a 0,056. Si se suma un cambio de pestaña, sube a 0,182, y en cuanto se corrija H1 bastará un error seguido para pasar a N0 (0,485) **sin que haya bloqueo real**. Por eso H1 y H2 deben corregirse juntos. Además, `e9` y la densidad de clics salen en cero.

### H3 — "Ediciones" solo existen en el editor de código (alto)
`editCount` solo aumenta en el `<textarea>` del editor de código. Ninguno de los 36 retos usa ese editor: todos usan un tablero. En consecuencia:
- `time_before_first_edit` es siempre `null`, así que e7 solo se cumple si el estudiante creó subtareas. Esto penaliza el criterio de planificación.
- La métrica "Densidad de edición" del panel muestra siempre "0 cambios" (se ve en la captura de la línea del tiempo).

### H4 — Los aciertos no dejan evento (medio)
`QUIZ_ANSWER` solo se emite al fallar. En el registro no se puede reconstruir la secuencia de intentos (fallo, fallo, acierto) ni medir la latencia hasta el acierto.

### H5 — Parámetros fijos de experto, nunca aprendidos (medio)
Las verosimilitudes del bloqueo (`BLOCKING_SIGNALS`) y de los niveles (`INDICATORS[].p`) están escritas a mano. Ahora que se guardan instantáneas y eventos en vivo, ya hay datos para calibrarlas.

### H6 — Búfer local de 100 eventos (bajo)
`events.slice(-99)`: si se generan más de 100 eventos entre dos envíos (10 s), los más antiguos se pierden. Con el envío en vivo es poco probable, pero conviene vigilarlo.

## 4. Cómo mejorar (en orden de impacto)

1. **Separar "intento" de "estado"** (resuelve H1).
   - Cambiar la firma a `onValidation(success, { attempt: true })`. Solo los intentos explícitos (Verificar, Ejecutar, responder una pregunta) cuentan como run o error, y nunca se deduplican.
   - Los reportes de estado (texto del ensayo, orden tras arrastrar) solo actualizan `boardSuccess`.
   - Adaptar los 22 tableros. La mayoría ya tienen un único punto de "verificar".
2. **Un solo detector de actividad** en el contenedor del tablero (resuelve H2 y H3).
   - Escuchar `pointerdown`, `keydown`, `input`, `dragend` y `drop` en fase de captura (`onPointerDownCapture`, `onKeyDownCapture`…). Cada uno actualiza `lastEditTime`, `editCount` y `editsSinceRun`, y fija `firstEditAt`.
   - En los 5 tableros con iframe, añadir al HTML interno un `postMessage({type:'ACTIVITY', kind, x, y})` en `pointerdown` y `keydown`, y escucharlo en el padre.
3. **Emitir `ATTEMPT` en cada verificación**, con `{correct, latency_s, errors_so_far}`, y no solo en los fallos (resuelve H4). Esto permite curvas de aprendizaje por reto.
4. **Calibrar el Naive Bayes con los datos reales** (resuelve H5).
   - Etiquetar las instantáneas `CHALLENGE_PROGRESS` como "bloqueado" cuando el estudiante pidió pista, abandonó o falló 3 veces en los 2 minutos siguientes.
   - Estimar P(señal | clase) por conteo con suavizado de Laplace y publicarlas en `/api/tutor/domain`. El cliente ya las lee de ahí.
   - Validar con AUC frente a la tabla actual antes de reemplazarla.
5. **Tableros de prueba automatizados**: una prueba por tablero que simule un fallo, otro fallo y un acierto, y compruebe que `err_count` = 2, `runs` = 3 y que el primer registro no es un error.
6. **Panel de calidad de datos para el administrador**: por sesión, mostrar el % de instantáneas con `clicks = 0` mientras pasa el tiempo, y las sesiones con `p_block` alto sin errores. Detecta regresiones de captura sin revisar código.

## 5. Ya verificado en esta revisión
- Las instantáneas y eventos llegan a `/api/tracking/events` y la Fase B no los duplica.
- «Ordena la historia» solo reporta al pulsar Verificar (probado: `false`, luego `true`) y no reporta nada al abrir.
- Chequeo de tipos de todo el frontend sin errores.
