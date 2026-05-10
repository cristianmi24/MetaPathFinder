# Flujo de Evaluación Adaptativa con Retos, Variaciones y FRENO

## Arquitectura del Sistema

El sistema implementa una evaluación metacognitiva adaptativa en 3 niveles (Básico → Intermedio → Experto), donde cada nivel contiene 5 temas (HTML, CSS, JavaScript, Git, Lógica) con 3 variaciones por reto.

## Estructura de Datos

`frontend/src/data/phase1Questions.ts`:
- **3 niveles**: Básico, Intermedio, Experto
- **5 temas por nivel**: HTML, CSS, JavaScript, Git, Lógica
- **3 variaciones por reto**: pregunta original + 2 variaciones alternativas
- Almacenadas en `phase1Levels` (preguntas principales) y `questionVariations` (variaciones por `questionId`)

## Flujo de Evaluación (`Evaluations.tsx`)

### Fases
```
intro → perception → challenge → humility_tip → blocked → freno → results
```

### 1. Intro
Pantalla de bienvenida con descripción de las 3 fases (Juicio de Percepción, Desafío Cognitivo, Análisis de Desfase).

### 2. Perception
El estudiante autoevalúa su confianza (1-10) ante el reto actual. Se muestra:
- `context`: Situación hipotética para empatizar
- `metacognitivePrompt`: Pregunta de autopercepción
- Categoría y nivel actual

### 3. Challenge
Se presenta la pregunta técnica con 4 opciones de respuesta. Se usa `useCognitiveTracking` para monitorear el tiempo y sesgos.

### 4. Manejo de Errores

**Primer fallo** → `humility_tip`:
- Muestra alerta de humildad con tip educativo
- Al continuar, se asigna una **variación** diferente del mismo tema (distinta pregunta, mismo concepto)
- La variación se elige aleatoriamente de `variationPool`
- Vuelve a fase `perception` para re-evaluar confianza

**Segundo fallo (variación)** → depende de la autopercepción:

### Caso A: Baja autopercepción en ambos intentos (percepción ≤ 3)
Si el estudiante **se autopercibió con baja confianza en el reto original y en la variación**, y falló ambos → **FRENO directo**. No se bloquea el tema ni se busca ruta alternativa. El mensaje indica que el estudiante reconoce su falta de dominio y los resultados lo confirman, por lo que debe estudiar antes de continuar.

### Caso B: Alguna percepción fue alta (≥ 4)
Si en al menos uno de los dos intentos el estudiante tuvo confianza media/alta → `blocked`:
- El tema se **bloquea** en el nivel actual y todos los superiores
- Se muestra micro-lección educativa
- El sistema busca una **ruta alternativa**: el siguiente tema no bloqueado en el mismo nivel
- Si existe: se ofrece botón "Probar esta Ruta"
- Si no existe: se informa que no hay más temas disponibles

### FRENO por doble bloqueo
Si al bloquear un tema se alcanzan **2 temas bloqueados en el mismo nivel**, la evaluación se detiene inmediatamente con alerta de freno de seguridad. No es necesario que se hayan agotado todos los temas.

### 5. Success (aplica a primer intento o variación)
- Se registra el intento como superado
- Se avanza al **siguiente nivel**
- Se busca el primer reto no bloqueado en ese nivel
- Si no hay retos disponibles en el siguiente nivel, la evaluación termina

## Aleatoriedad

- `shuffledOrder`: Orden aleatorio de los retos dentro de cada nivel (generado una vez por nivel)
- `variationPool`: Índices de variaciones barajados (generado al enviar percepción, consumido al fallar)

## Bloqueo de Categorías

```typescript
blockedCategories: Record<number, string[]>
```
- Key = índice del nivel, Value = array de categorías bloqueadas
- Al fallar la variación, se propaga a `[currentLevelIdx ... último nivel]`
- `isCategoryBlocked()` verifica si una categoría está bloqueada en un nivel dado
- `getAvailableAlternative()` busca el siguiente reto no bloqueado dentro del mismo nivel

## Eventos Registrados

| Evento | Trigger |
|--------|---------|
| `PHASE_START` | Inicio de perception, challenge, ruta alternativa |
| `PHASE_COMPLETED` | Fin de perception, challenge |
| `EVALUATION_COMPLETED` | Fin de toda la evaluación |
| `COGNITIVE_BIAS` | Fallo doble, freno, tiempo excesivo (>30s) |

## Archivos Relevantes

| Archivo | Propósito |
|---------|-----------|
| `frontend/src/pages/Evaluations.tsx` | Componente principal con toda la lógica de fases |
| `frontend/src/data/phase1Questions.ts` | Datos de niveles, preguntas y variaciones |
| `frontend/src/hooks/useCognitiveTracking.ts` | Hook de monitoreo cognitivo en challenge |
| `frontend/src/stores/useCognitiveStore.ts` | Store global con eventos y métricas |
| `frontend/src/index.css` | Tema Tailwind con colores warning, error, etc. |
