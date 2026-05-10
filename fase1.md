# Fase 1 - Contexto y Estructura del Sistema de Preguntas y Retos

## 1. Objetivo de la Fase 1

La Fase 1 documenta el diseño inicial del flujo pedagógico y la organización de las preguntas y retos en MetaPathFinder. Se trabaja sobre un sistema que no solo evalúa el conocimiento técnico, sino que mide la metacognición: cómo el estudiante se autoevalúa, resuelve el reto y ajusta su confianza.

## 2. Contexto del Trabajo

Esta fase se basa en el enfoque de evaluación por niveles, con un ciclo por nivel que contiene tres fases:

- **Fase A: Juicio de Aprendizaje**
- **Fase B: Resolución Técnica**
- **Fase C: Calibración Metacognitiva**

En este contexto, los estudiantes responden preguntas y retos diseñados para capturar:

- Su confianza inicial antes de resolver
- Su desempeño real durante la resolución
- La brecha entre confianza y resultado

## 3. Cómo se estructuraron las preguntas y retos

### 3.1. Reto por Nivel

Cada nivel tiene una colección de preguntas/retos que se presentan en la **Fase B**. La idea es que cada nivel represente una dificultad progresiva:

- **Básico**: retos de comprensión inicial
- **Intermedio**: retos con mayor complejidad lógica
- **Experto**: retos que exigen análisis profundo y transferencia de conocimientos

### 3.2. Tipos de preguntas

Se trabajó con preguntas que combinan:

- lógica booleana
- preguntas de programación estructurada
- análisis de casos

El sistema puede ampliar estas preguntas en futuros niveles, manteniendo siempre la misma estructura de juicio, resolución y calibración.

### 3.3. Variaciones para repetición

Cuando un estudiante completa un reto y se calcula su calibración:

- Si **calibración >= umbral del nivel** → avanza al siguiente reto
- Si **calibración < umbral del nivel** → se le muestra una **variación** de la misma pregunta

Una variación mantiene la misma respuesta técnica correcta, pero cambia:
- El enunciado de la pregunta
- El contexto narrativo
- El orden de las opciones

Esto evita memorización y valida si el estudiante comprendió realmente el concepto.

### 3.4. Estructura real de la Fase 1

La implementación se conectó con la siguiente estructura de niveles y retos:

- **Nivel Básico**
  - `B1_HTML_H1` (HTML): jerarquía semántica y encabezados principales
  - `B2_CSS_BACKGROUND` (CSS): propiedades de fondo
  - `B3_JS_ALERT` (JavaScript): funciones emergentes básicas
  - `B4_GITHUB_INIT` (GitHub): inicialización de repositorios
  - `B5_LOGICA_VARIABLES` (Lógica): variables dinámicas y reasignación

- **Nivel Medio**
  - `M1_HTML_LINKS` (HTML): atributos de enlaces y navegación
  - `M2_CSS_PADDING` (CSS): espacio interno con padding
  - `M3_JS_ONCLICK` (JavaScript): eventos de clic
  - `M4_GITHUB_COMMIT` (GitHub): registro de cambios con commit
  - `M5_LOGICA_COMPARACION` (Lógica): operadores de comparación

- **Nivel Experto**
  - `E1_HTML_REQUIRED` (HTML): validación obligatoria en formularios
  - `E2_CSS_FLEXBOX` (CSS): alineación avanzada con Flexbox
  - `E3_JS_DOM` (JavaScript): manipulación del DOM por ID
  - `E4_GITHUB_PUSH` (GitHub): sincronización remota a GitHub
  - `E5_LOGICA_IF` (Lógica): estructuras condicionales

Cada reto cuenta con varias variaciones narrativas que mantienen la misma respuesta técnica correcta, pero cambian el contexto y la formulación para medir mejor la calibración.

## 4. El flujo de usuarios y resultados

### 4.1. Flujo por Reto (Challenge)

El sistema avanza nivel por nivel (Básico → Medio → Experto), presentando **retos** de forma secuencial:

1. **Juicio Metacognitivo**: Se presenta la pregunta metacognitiva y el estudiante indica su confianza (1-10)
2. **Resolución**: El estudiante responde la pregunta principal
3. **Evaluación**: El sistema compara percepción vs realidad
   - Si es **correcto** → Avanza al siguiente reto del nivel
   - Si es **incorrecto** → Se le presenta una **variación** de la misma pregunta
4. **Repetición de Variaciones**: El estudiante puede intentar variaciones hasta que:
   - Acierta una variación (demuestra comprensión) → Avanza al siguiente reto
   - Se agotan las variaciones → Se marca como incompleto y avanza igual

### 4.2. Estructura de datos: Retos y Variaciones

- **Reto Principal**: La pregunta base de cada skills (ej: `B1_HTML_H1`)
- **Variaciones**: Alternativas narrativas con la misma respuesta correcta (3 versiones por pregunta)
  - Cambian el contexto y enunciado
  - Mantienen la respuesta técnica correcta
  - Permiten validar comprensión genuina

### 4.3. Lista de usuarios registrados

En la sección de administración se muestra una lista compacta de estudiantes con:
- Nombre del estudiante
- Estado (Completada / En Progreso / Pendiente)

Al hacer clic, se revelan detalles incluyendo:
- Tiempo total
- Clicksnavegaciones
- Calificación
- Análisis por pregunta

## 5. Decisión pedagógica central

### 5.1. Evaluación de la confianza (Juicio)

Para cada reto, el estudiante indica su confianza con una escala 1-10 antes de responder.

### 5.2. Evaluación del desempeño (Resolución)

El estudiante responde la pregunta principal. El sistema registra:
- Si la respuesta es correcta
- Tiempo empleado
- Número de variaciones necesarias (si fue al primer intento, o requirió variaciones)

### 5.3. Análisis de Desfase Metacognitivo (Calibración)

Se compara la percepción inicial con el desempeño real:

- **Confianza = Desempeño**: Calibración correcta (verde)
- **Confianza > Desempeño**: Sobreconfianza (naranja)
- **Confianza < Desempeño**: Subconfianza (azul)

Si el estudiante requirió variaciones para acertar, se registra también el número de intentos.

### 5.4. Progresión del Nivel

Cada nivel tiene un umbral de calibración requerida:
- **Básico**: 60% de calibración
- **Medio**: 70% de calibración
- **Experto**: 80% de calibración

Si el promedio de calibración de todos los retos del nivel alcanza el umbral, el estudiante avanza al siguiente nivel.

## 5.5. Implementación técnica de retos y variaciones

En el código, la evaluación funciona así:

```
for each level (basic → intermediate → expert):
  for each question in level.questions:
    - Mostrar juicio metacognitivo (1-10)
    - Mostrar pregunta principal
    - Si respuesta correcta:
        → Guardar intento
        → Pasar al siguiente reto
    - Si respuesta incorrecta:
        → Obtener variaciones[questionId]
        → Mostrar variación[0], luego variación[1], etc.
        → Si alguna variación es correcta:
            → Registrar intento con variationIndex
            → Pasar al siguiente reto
        - Si se agotan variaciones sin acierto:
            → Registrar intento fallido
            → Pasar al siguiente reto
```

Cada intento registra:
- `questionId`: ID único de la pregunta principal
- `perception`: Confianza del estudiante (1-10)
- `isCorrect`: Si acertó
- `calibration`: Brecha (percepción vs realidad)
- `variationAttempts`: Número de variación intentada (0=principal)

## 6. Resultado de la Fase 1

- Mide el **proceso de aprendizaje** mediante retos con variaciones
- Detecta sobreconfianza y ajusta el flujo automáticamente
- Organiza preguntas y retos en **3 niveles** (Básico, Medio, Experto) con progresión clara
- Utiliza **variaciones equivalentes** para validar comprensión genuina, no memorización
- Registra la **brecha entre percepción y desempeño** en tiempo real
- Presenta resultados en un **perfil de estudiante** con métricas de calibración

El sistema ahora implementa:

- Evaluación por **retos secuenciales** dentro de cada nivel
- Sistema de **variaciones** para reintentos de preguntas no acertadas
- Flujo de **juicio → resolución → evaluación → progresión**
- Análisis visual del desfase metacognitivo en el perfil del estudiante

Esta fase prepara el proyecto para continuar con más niveles, integración de heurísticas cognitivas avanzadas y un mejor análisis del transferencia de conocimiento entre dominios.
