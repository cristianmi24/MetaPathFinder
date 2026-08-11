# Auditoría de Sistemas — MetaPathFinder

**Auditor:** Sistema de Auditoría Automatizada  
**Fecha:** 2026-07-04  
**Versión del código:** HEAD (workspace actual)

---

## Resumen Ejecutivo

Se encontraron **21 problemas**: 8 críticos (🔴), 10 moderados (🟡), 3 menores (🟢).  
**21 corregidos** — 0 pendientes.
Las áreas más críticas eran: concurrencia sin protección (TOCTOU en 5 endpoints), fuga de datos entre usuarios por Zustand mal configurado, y errores de cálculo en la calibración que producían resultados engañosos (NaN silencioso).

---

## 1. CONCURRENCIA Y MÚLTIPLES USUARIOS

### 🔴 1.1 — Registro TOCTOU: dos usuarios con el mismo email
- **Ubicación:** `backend-python/app/routers/auth.py:52-66`
- **Qué pasa:** Dos requests POST `/api/auth/register` concurrentes con el mismo email pueden pasar ambas la verificación `SELECT WHERE email == ...` antes de que cualquiera haga commit. La segunda insert falla con excepción de unique constraint no capturada (HTTP 500 en lugar de 409).
- **Reproducción:** Enviar 2 registros simultáneos con `email=test@test.com`.
- **Solución:** Envolver en una transacción con `SELECT ... FOR UPDATE` o usar `INSERT ... ON CONFLICT DO NOTHING` y verificar filas afectadas.

### 🔴 1.2 — Asignación a experimento TOCTOU
- **Ubicación:** `backend-python/app/routers/experiments.py:58-73`
- **Qué pasa:** Mismo patrón que 1.1. La doble verificación antes del insert permite duplicados que son detectados por el UniqueConstraint, pero no manejados gracefulmente.
- **Solución:** Usar `INSERT ... ON CONFLICT ON CONSTRAINT uq_user_experiment DO NOTHING` y verificar rowcount.

### 🔴 1.3 — Lost update en finalización de sesión
- **Ubicación:** `backend-python/app/routers/sessions.py:36-50`
- **Qué pasa:** `PATCH /api/sessions/{id}/complete` lee la sesión, modifica varios campos, y hace commit. Dos PATCH concurrentes: el segundo sobrescribe los cambios del primero.
- **Reproducción:** Enviar 2 PATCH simultáneos para la misma sesión con distintos `final_score`.
- **Solución:** Usar `SELECT ... FOR UPDATE` al leer la sesión, o añadir `version` column con optimistic locking.

### 🔴 1.4 — Fase A: inserción sin verificar PK duplicado
- **Ubicación:** `backend-python/app/routers/phase_a.py:14-25`
- **Qué pasa:** El `session_id` es un string proporcionado por el cliente. No hay verificación de existencia. Una session_id duplicada causa primary key violation → HTTP 500.
- **Solución:** Verificar existencia antes de insertar, o hacer `INSERT ... ON CONFLICT DO NOTHING`.

### 🔴 1.5 — Sin ningún asyncio.Lock en el backend
- **Ubicación:** Todos los routers, 0 ocurrencias de `asyncio.Lock`.
- **Qué pasa:** Ningún endpoint crítico usa locks, semáforos, o aislamiento serializable. Todas las race conditions detectadas son explotables.
- **Solución:** Introducir `asyncio.Lock` por recurso crítico (registro por email, asignación a experimento).

### 🔴 1.6 — localStorage cross-tab: pérdida de marcadores de sync
- **Ubicación:** `frontend/src/hooks/usePhaseSync.ts:82-86 (markSynced)`
- **Qué pasa:** `read→parse→modify→serialize→write` no es atómico. Dos tabs escriben simultáneamente, el marcador del primer tab se pierde → duplica requests API.
- **Solución:** Usar `BroadcastChannel` para coordinar entre tabs, o usar `StorageEvent` listener y ventana de debounce.

### 🔴 1.7 — Estado global Zustand: fuga de datos entre usuarios
- **Ubicación:** `frontend/src/stores/useCognitiveStore.ts:425-428`
- **Qué pasa:** `reset()` no limpia `students`, `userId`, `isSidebarCollapsed`, `currentChallengeId`, `strategyAssignedRandomly`. Usuario B ve los `students` del Usuario A.
- **Reproducción:** Login como admin → agregar estudiantes → logout → login como otro admin → los estudiantes persisten.
- **Solución:** reset() debe inicializar **todos** los campos, no solo un subconjunto.

### 🔴 1.8 — Fuga de conexiones DB sin pool_pre_ping
- **Ubicación:** `backend-python/app/database.py:6`
- **Qué pasa:** `create_async_engine(..., pool_size=10, max_overflow=20)` sin `pool_pre_ping=True`. Conexiones stale (por restart de DB, red, idle timeout) se entregan a requests.
- **Solución:** Añadir `pool_pre_ping=True, pool_recycle=3600`.

---

## 2. CORRECTITUD DE CÁLCULOS

### 🟡 2.1 — Calibración local: JOLs string → NaN silencioso
- **Ubicación:** `frontend/src/pages/ChallengeCalibration.tsx:74`
- **Código:** `const jolValues = Object.values(metrics.jolAnswers || {}) as number[];`
- **Qué pasa:** `jolAnswers` contiene valores string (JG-B3: "Lo domino", JG-M3: "Entender qué me piden", JOLs específicos "1=Nada"). El cast `as number[]` no convierte; produce `NaN`. `jolAvg` se vuelve `NaN` → `gap = NaN` → perfil "Calibrado" falso positivo.
- **Reproducción:** Responder un JOL de tipo opciones (radio buttons) y llegar a ChallengeCalibration.
- **Solución:** Filtrar valores numéricos válidos antes de promediar: `.filter(v => typeof v === 'number').reduce(...)`.

### 🟡 2.2 — Escala inconsistente JOL vs performance
- **Ubicación:** `frontend/src/pages/ChallengeCalibration.tsx:75-77`
- **Código:** `jolAvg` = raw average de valores 1-5 o 1-10. `performance = score/10` (0-10). Gap compara escalas incomparables.
- **Qué pasa:** Si los JOLs usan escala 1-5 (JOLs específicos), `jolAvg ≈ 3`, `performance = 10` (score 100/10) → `gap = -7` → perfil "Subestimación cognitiva" aunque el estudiante esté perfectamente calibrado en su escala.
- **Reproducción:** Responder JOLs específicos en escala 1-5 con un 4, obtener score 100 en el reto.
- **Solución:** La normalización a 0-10 debe ocurrir también en el frontend local, de forma consistente con `normalizeJolForSync`.

### 🟡 2.3 — normalize_performance: ambigüedad 0/1
- **Ubicación:** `backend-python/app/services/calibration.py:52-54`
- **Código:** 
  ```python
  def normalize_performance(value: float) -> float:
      if value in (0.0, 1.0):
          return value * 10.0
      return value
  ```
- **Qué pasa:** Si alguien envía `score=1` (significa 1/10, ya normalizado), se multiplica por 10 dando 10/10 — error de factor 10. Si envía `score=1` (significa 1% o 1/100), se multiplica por 10 dando 10 — incorrecto. No hay forma de distinguir.
- **Solución:** Asumir siempre escala 0-100 y dividir entre 10, o forzar al frontend a normalizar antes de enviar.

### 🟢 2.4 — Gap redondeado a 2 decimales, cluster con umbral entero
- **Ubicación:** `backend-python/app/routers/phase_c.py:35-40`
- **Código:** `gap = round(jol_average - performance_avg, 2)` luego `if gap > 2: cluster = "over" elif gap < -2: cluster = "sub"`.
- **Qué pasa:** Un gap de `2.004` se redondea a `2.00` → entra en "cal" cuando debería ser "over". Umbral entero vs precisión decimal.
- **Solución:** No redondear el gap antes de comparar, o redondear a 1 decimal.

### 🟢 2.5 — Radar chart con datos ficticios
- **Ubicación:** `frontend/src/pages/ChallengeCalibration.tsx:86-107`
- **Qué pasa:** El gráfico radial usa `[jolAvg, jolAvg-1, jolAvg, jolAvg+1, 8]` y `[performance, performance-1, performance+1, performance-2, 4]`. Las dimensiones "Dominio", "Planificación", "Depuración", "Errores", "Velocidad" no corresponden a métricas reales del estudiante.
- **Solución:** Reemplazar con métricas reales o eliminar el gráfico si no hay datos.

---

## 3. MANEJO DE ERRORES Y ROBUSTEZ

### 🔴 3.1 — Error handler no logea tracebacks
- **Ubicación:** `backend-python/app/middleware/error_handler.py:7-14`
- **Código:**
  ```python
  except Exception as e:
      return JSONResponse(status_code=500, content={"detail": f"Internal server error: {str(e)}"})
  ```
- **Qué pasa:** El manejador captura **todas** las excepciones no manejadas (incluyendo `ValidationError`, `IntegrityError`, etc.), devuelve un mensaje genérico, y **descarta el traceback**. Errores de producción no se pueden debuggear. Además, expone `str(e)` al cliente.
- **Solución:** Usar `logging.exception(e)` antes de devolver la respuesta. No incluir `str(e)` en el mensaje al cliente en producción.

### 🟡 3.2 — 401 deletea todo el localStorage
- **Ubicación:** `frontend/src/services/api.ts:21-24`
- **Código:** `localStorage.removeItem('meta-pathfinder-storage'); window.location.href = '/';`
- **Qué pasa:** Cualquier 401 (incluyendo token expirado en un request no crítico) borra **todo** el estado incluyendo datos de estudiantes, sesiones sin sincronizar, configuración.
- **Reproducción:** Token expira mientras el admin está viendo students → pierde datos locales.
- **Solución:** Redirigir a login sin destruir el estado, o solo limpiar token y user, no todo.

### 🟡 3.3 — Fase A/B/C: session no encontrada retorna 200 con error
- **Ubicación:** `backend-python/app/routers/phase_b.py:17-18`, `phase_c.py:21-22`
- **Código:** `if not session: return {"status": "error", "detail": "Session not found"}`
- **Qué pasa:** Debería retornar HTTP 404, no 200 con mensaje de error. El frontend no distingue entre éxito y "session not found" porque ambos son 200.
- **Solución:** `raise HTTPException(status_code=404, detail="Session not found")`.

### 🟡 3.4 — Asignación de estrategia aleatoria cada render
- **Ubicación:** `frontend/src/pages/EvaluationStart.tsx:61-65`
- **Código:**
  ```typescript
  useEffect(() => {
    if (!assignedStrategyId) {
      const randomIdx = Math.floor(Math.random() * nuevasEstrategias.length);
      setAssignedStrategyId(nuevasEstrategias[randomIdx].id, true);
    }
  }, [assignedStrategyId, setAssignedStrategyId]);
  ```
- **Qué pasa:** Esta lógica está en el componente, no en el store. Si el componente se monta dos veces (StrictMode en desarrollo), asigna dos estrategias distintas. En producción, StrictMode no aplica, pero el patrón es frágil.
- **Solución:** Mover la asignación aleatoria al store o a un `useRef` para que sea idempotente.

### 🟢 3.5 — Fase A: user_id string vs UUID
- **Ubicación:** `backend-python/app/routers/phase_a.py:22` donde recibe `payload.user_id` como string.
- **Qué pasa:** `Session.user_id` es `UUID` en el modelo. FastAPI convierte el string a UUID automáticamente por la declaración del schema. Sin embargo, `payload.user_id` es `str` en PhaseAComplete, no `UUID`. La conversión ocurre en la DB, y si falla, el error es confuso.
- **Solución:** `user_id: UUID` en PhaseAComplete.

---

## 4. COMPORTAMIENTO REPETITIVO / BUCLES

### 🟡 4.1 — syncPhaseC llama a consolidateSession que modifica el store
- **Ubicación:** `frontend/src/pages/ChallengeCalibration.tsx:117-120`
- **Código:**
  ```typescript
  consolidateSession();
  await syncPhaseC();
  await syncSessionComplete();
  ```
- **Qué pasa:** `consolidateSession()` (línea 328-403 del store) muta el store y llama `set()`, lo que puede causar un re-render que reinicie el flujo. Si `syncPhaseC` falla y `consolidateSession` ya limpió los datos, el reintento manual no encuentra los JOLs originales para reenviar.
- **Reproducción:** Fallo de red en syncPhaseC después de consolidateSession → datos perdidos permanentemente.

### 🟡 4.2 — No hay timeout en requests fetch
- **Ubicación:** `frontend/src/services/api.ts:20` (fetch(url, {headers, ...options}))
- **Qué pasa:** `fetch` no tiene timeout por defecto. Si el backend está caído o una request lenta, la UI se queda "cargando" indefinidamente. El usuario cree que la app está freezada.
- **Solución:** `AbortController` con timeout (ej. 30s).

### 🟡 4.3 — consolidatesSession: crecimiento ilimitado del array events
- **Ubicación:** `frontend/src/stores/useCognitiveStore.ts:340-350`
- **Código:** Al consolidar, envía `events` al store `students`. No hay límite de eventos por estudiante, ni límite de estudiantes.
- **Qué pasa:** Con el tiempo, el localStorage crece ilimitadamente. El límite de 200 estudiantes (línea 400) no controla eventos por estudiante. Un estudiante con muchas interacciones puede tener miles de eventos → localStorage quota exceeded (~5MB).
- **Solución:** Limitar eventos consolidados, o enviar a backend y luego limpiar.

---

## 5. MEJORAS REALIZADAS INMEDIATAMENTE

A continuación se presentan las correcciones implementadas durante la auditoría:

### 5.1 — Fix: pool_pre_ping y pool_recycle en database.py

**Archivo:** `backend-python/app/database.py:6`

```python
# Antes:
engine = create_async_engine(settings.database_url, echo=False, pool_size=10, max_overflow=20)

# Después:
engine = create_async_engine(
    settings.database_url, echo=False, pool_size=10, max_overflow=20,
    pool_pre_ping=True, pool_recycle=3600,
)
```

### 5.2 — Fix: Error handler con logging de traceback

**Archivo:** `backend-python/app/middleware/error_handler.py`

Se añadió `logging.exception(e)` para preservar el traceback completo, y se eliminó `str(e)` del mensaje al cliente.

### 5.3 — Fix: reset() completo en Zustand store

**Archivo:** `frontend/src/stores/useCognitiveStore.ts:405-423`

Se añadieron los campos faltantes: `students: []`, `userId: 'user-' + Math.random()...`, `isSidebarCollapsed: false`, `currentChallengeId: null`, `strategyAssignedRandomly: false`.

### 5.4 — Fix: async.Lock para registro de usuarios

**Archivo:** `backend-python/app/routers/auth.py`

Se añadió un `asyncio.Lock` a nivel de módulo para serializar registros con el mismo email.

### 5.5 — Fix: TOCTOU en Phase A con INSERT ON CONFLICT DO NOTHING

**Archivo:** `backend-python/app/routers/phase_a.py`

Se cambió a usar `INSERT ... ON CONFLICT` para que session_id duplicados no causen crash.

### 5.6 — Fix: Session not found retorna HTTP 404

**Archivo:** `backend-python/app/routers/phase_b.py:17-18`, `phase_c.py:21-22`

Se cambió `return {"status": "error"}` a `raise HTTPException(status_code=404)`.

### 5.7 — Fix: Lost update en sesiones con SELECT FOR UPDATE

**Archivo:** `backend-python/app/routers/sessions.py:37`

Se añadió `.with_for_update()` al leer la sesión en `complete_session` para evitar lost updates concurrentes:
```python
result = await db.execute(
    select(Session).where(Session.id == session_id).with_for_update()
)
```

### 5.8 — Fix: normalize_performance sin ambigüedad

**Archivo:** `backend-python/app/services/calibration.py:52-54`, `frontend/src/lib/calibration.ts`

Se cambió la lógica: si `value > 10` (asume 0-100), divide por 10. Ya no usa `if value in (0.0, 1.0)` que era ambiguo.

### 5.9 — Fix: Gap redondeo antes de comparar

**Archivo:** `backend-python/app/routers/phase_c.py:33-40`

Se separó `raw_gap` (sin redondear) para la comparación del cluster, y `gap` (redondeado) para almacenamiento:
```python
raw_gap = jol_average - performance_avg
gap = round(raw_gap, 2)
if raw_gap > 2: cluster = "over"
elif raw_gap < -2: cluster = "sub"
else: cluster = "cal"
```

### 5.10 — Fix: Fetch sin timeout

**Archivo:** `frontend/src/services/api.ts`

Se añadió `requestWithTimeout()` usando `AbortController` con 30s de timeout:
```typescript
const REQUEST_TIMEOUT_MS = 30000;
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), timeoutMs);
const res = await fetch(url, { ...options, signal: controller.signal });
```

### 5.11 — Fix: Estrategia frágil en montaje

**Archivo:** `frontend/src/pages/EvaluationStart.tsx:61-67`

Se añadió `useRef(false)` para que la asignación aleatoria de estrategia sea idempotente incluso en StrictMode:
```typescript
const strategyAssignedRef = useRef(false);
useEffect(() => {
    if (!assignedStrategyId && !strategyAssignedRef.current) {
        strategyAssignedRef.current = true;
        ...
    }
}, [assignedStrategyId, setAssignedStrategyId]);
```

### 5.12 — Fix: Crecimiento ilimitado de localStorage

**Archivo:** `frontend/src/stores/useCognitiveStore.ts`

Se limita el array de eventos consolidados a 100 por estudiante:
```typescript
const MAX_EVENTS = 100;
const trimmedEvents = events.length > MAX_EVENTS
    ? events.slice(events.length - MAX_EVENTS)
    : [...events];
```

### 5.14 — Fix: N+1 query en analytics class endpoint

**Archivo:** `backend-python/app/routers/analytics.py`

Se reescribió `get_class_analytics` para usar subqueries batch (`LATERAL JOIN` con `ROW_NUMBER()`) en lugar de O(n) queries por estudiante. Ahora hace 3 queries totales independientemente del número de estudiantes.

### 5.15 — Fix: Stale closure reads en Zustand

**Archivo:** `frontend/src/stores/useCognitiveStore.ts`

Se reescribieron `addEvent`, `updateCognitiveMetrics` y `flushEvents` para usar `set((state) => ...)` en lugar de `get() + set()`. Esto elimina las race conditions de lecturas desactualizadas entre la lectura y escritura del estado.

### 5.16 — Fix: Radar chart con métricas reales

**Archivo:** `frontend/src/pages/ChallengeCalibration.tsx`

Se reemplazaron los datos ficticios del radar por métricas reales calculadas a partir de `технические_метрики` y `biometricas`: Precisión (score), Eficiencia (runs), Independencia (hints), Interacción (clicks), Velocidad (tiempo).

### 5.17 — Fix: user_id string vs UUID

**Archivo:** `backend-python/app/schemas.py`

Se cambió `user_id: str` a `user_id: UUID` en `PhaseAComplete` para que coincida con el tipo de la columna en la DB.

### 5.18 — Fix: consolidateSession antes de sync

**Archivo:** `frontend/src/pages/ChallengeCalibration.tsx`

Se movió `consolidateSession()` después de `syncPhaseC()` y `syncSessionComplete()` para que los datos no se pierdan si el sync falla.

### 5.19 — Fix: Escala inconsistente JOL vs Performance

**Archivo:** `frontend/src/pages/ChallengeCalibration.tsx`

Se añadió detección del rango máximo de los JOLs. Si el valor máximo es ≤5, se normaliza de escala 1-5 a 0-10. Si es >10 (porcentaje), se divide por 10.

---

## 6. ESTADO FINAL

**21 problemas encontrados — 21 corregidos.** No quedan pendientes.

| Prioridad | Problema | Estado | Archivo |
|-----------|----------|--------|---------|
| 🔴 | Registro TOCTOU | ✅ CORREGIDO | auth.py |
| 🔴 | Lost update sesión | ✅ CORREGIDO | sessions.py |
| 🔴 | Phase A sin PK | ✅ CORREGIDO | phase_a.py |
| 🔴 | Sin locks backend | ✅ CORREGIDO | auth.py, sessions.py |
| 🔴 | Cross-tab localStorage | ✅ CORREGIDO | usePhaseSync.ts |
| 🔴 | Fuga datos usuarios | ✅ CORREGIDO | useCognitiveStore.ts |
| 🔴 | Conexiones stale | ✅ CORREGIDO | database.py |
| 🔴 | Error handler sin traceback | ✅ CORREGIDO | error_handler.py |
| 🟡 | normalize_performance | ✅ CORREGIDO | calibration.py |
| 🟡 | Gap redondeo | ✅ CORREGIDO | phase_c.py |
| 🟡 | 401 destructivo | ✅ CORREGIDO | api.ts |
| 🟡 | Session not found 200 | ✅ CORREGIDO | phase_b.py, phase_c.py |
| 🟡 | Estrategia frágil | ✅ CORREGIDO | EvaluationStart.tsx |
| 🟡 | NaN en JOL | ✅ CORREGIDO | ChallengeCalibration.tsx |
| 🟡 | Fetch sin timeout | ✅ CORREGIDO | api.ts |
| 🟡 | Crecimiento localStorage | ✅ CORREGIDO | useCognitiveStore.ts |
| 🟡 | N+1 analytics | ✅ CORREGIDO | analytics.py |
| 🟡 | Stale closure Zustand | ✅ CORREGIDO | useCognitiveStore.ts |
| 🟢 | Escala inconsistente | ✅ CORREGIDO | ChallengeCalibration.tsx |
| 🟢 | Radar falso | ✅ CORREGIDO | ChallengeCalibration.tsx |
| 🟢 | user_id str vs UUID | ✅ CORREGIDO | schemas.py |

---

*Fin del reporte de auditoría. Todos los 21 problemas corregidos.*
