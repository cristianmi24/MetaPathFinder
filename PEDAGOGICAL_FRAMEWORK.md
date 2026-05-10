# Flujo Pedagógico: Loop-per-Level (Ciclo por Nivel)

## 🎯 Visión General

El sistema MetaPathFinder implementa un **flujo pedagógico revolucionario** basado en la psicometría metacognitiva, diseñado específicamente para investigación académica de nivel Q1. El sistema mide el aprendizaje metacognitivo **en tiempo real** mediante ciclos cerrados por nivel.

## 🧠 Fundamento Científico

### ¿Por qué "Loop-per-Level"?

**Problema Tradicional**: Los sistemas de evaluación evalúan todos los niveles al final, perdiendo la oportunidad de medir el aprendizaje metacognitivo en tiempo real.

**Solución MetaPathFinder**: Cada nivel debe completarse en su totalidad (3 fases) antes de pasar al siguiente, permitiendo medir cambios en la calibración metacognitiva.

## 🔄 Ciclo por Nivel

### Estructura del Ciclo
```
Nivel N → [Fase A + Fase B + Fase C] → Decisión → Nivel N+1
```

### Las 3 Fases de Cada Nivel

#### **Fase A: Juicio de Aprendizaje** 🧠
- **Propósito**: Medir autopercepción inicial
- **Actividad**: Estudiante indica confianza (1-10) antes de resolver
- **Dato Científico**: Establece línea base para medir calibración
- **Tracking**: `LEVEL_JUDGMENT`

#### **Fase B: Resolución Técnica** ⚡
- **Propósito**: Evaluar desempeño real
- **Actividad**: Estudiante resuelve retos del nivel
- **Dato Científico**: Mide competencia técnica objetiva
- **Tracking**: `QUIZ_ANSWER`, `UI_CLICK`, `PAGE_NAVIGATION`

#### **Fase C: Calibración Metacognitiva** 🎯
- **Propósito**: Confrontar juicio vs realidad
- **Actividad**: Sistema muestra desfase y explica
- **Dato Científico**: Punto crítico de aprendizaje metacognitivo
- **Tracking**: `LEVEL_CALIBRATION`

## 🤖 Algoritmo de Decisión Inteligente

### Lógica de Progreso

```typescript
if (calibración_actual >= umbral_requerido) {
  // ✅ Calibración adecuada
  pasar_al_siguiente_nivel()
} else {
  // ❌ Sobreconfianza detectada
  repetir_nivel_con_variación()
}
```

### Umbrales por Nivel
- **Básico**: 60% de calibración requerida
- **Intermedio**: 70% de calibración requerida
- **Experto**: 80% de calibración requerida

### ¿Qué es "Calibración"?
```
Calibración = (Desempeño_Real / Juicio_Inicial) × 100

Ejemplo:
- Juicio: "Estoy 8/10 seguro" (80%)
- Desempeño: 6/10 correctas (60%)
- Calibración: (60/80) × 100 = 75%
```

## 🔄 Sistema de Variaciones

### ¿Por qué Variaciones?
Cuando un estudiante falla la calibración, **NO** repite exactamente los mismos retos (evita memorización), sino **variaciones equivalentes**.

### Ejemplo de Variación
```javascript
// Reto Original (Básico)
"¿Cuál es el resultado de: (true && false) || (true && !false)?"

// Variación Equivalente
"¿Qué devuelve esta expresión: (verdadero Y falso) O (verdadero Y NO falso)?"
```

## 📊 Métricas Científicas Capturadas

### Por Nivel
- **Juicio Promedio**: Confianza expresada por el estudiante
- **Desempeño Real**: Porcentaje de aciertos
- **Calibración**: Alineación entre juicio y realidad
- **Gap de Calibración**: |juicio - desempeño|
- **Intentos**: Número de repeticiones del nivel

### Por Pregunta
- **Tiempo Empleado**: Segundos por pregunta
- **Clicks Realizados**: Interacciones durante resolución
- **Cambios de Página**: Navegación durante la prueba
- **Salidas de Pestaña**: Detección de distracciones

### Tendencias Metacognitivas
- **Mejora de Calibración**: ¿El estudiante aprende a autoevaluarse?
- **Reducción de Sobreconfianza**: ¿Disminuyen los gaps negativos?
- **Eficiencia Temporal**: ¿Se vuelve más preciso con menos tiempo?

## 🎓 Impacto Pedagógico

### Beneficios del Sistema

#### **1. Medición en Tiempo Real**
- Captura evolución metacognitiva durante el aprendizaje
- No solo resultado final, sino proceso completo

#### **2. Intervención Inmediata**
- Si hay sobreconfianza → repetición con reflexión
- Evita frustración en niveles superiores

#### **3. Personalización Adaptativa**
- Dificultad se ajusta según calibración real
- No según auto-percepción sesgada

#### **4. Datos para Investigación Q1**
- Métricas psicométricas validadas
- Tracking completo del proceso cognitivo
- Comparación juicio vs realidad por nivel

## 🔬 Aplicación en Investigación

### Variables Dependientes
- **Precisión Metacognitiva**: Calibración promedio
- **Confianza Ajustada**: Cambios en juicios entre niveles
- **Aprendizaje Transferible**: Mejora en calibración global

### Variables Independientes
- **Dificultad del Nivel**: Básico → Intermedio → Experto
- **Tipo de Variación**: Equivalencia cognitiva
- **Feedback Metacognitivo**: Reflexión guiada en Fase C

### Hipótesis de Investigación
1. **H1**: Los estudiantes mejoran su calibración metacognitiva al avanzar niveles
2. **H2**: La repetición con variaciones acelera el aprendizaje metacognitivo
3. **H3**: El gap de calibración disminuye significativamente entre nivel básico y experto

## 🛠️ Implementación Técnica

### Estados del Sistema
```typescript
type Level = 'basic' | 'intermediate' | 'expert';
type Phase = 'judgment' | 'resolution' | 'calibration';

interface LevelState {
  currentLevel: Level;
  currentPhase: Phase;
  attempts: Record<Level, number>;
  passedLevels: Level[];
}
```

### Eventos Tracked
- `LEVEL_JUDGMENT`: Juicio inicial de confianza
- `QUIZ_ANSWER`: Respuesta a pregunta individual
- `LEVEL_CALIBRATION`: Resultado de calibración
- `LEVEL_REPEAT`: Decisión de repetición
- `UI_CLICK`: Interacciones del usuario
- `PAGE_NAVIGATION`: Cambios entre fases

### Lógica de Decisión
```typescript
const decideProgression = (calibration: number, required: number) => {
  if (calibration >= required) {
    return 'advance';
  } else {
    return 'repeat_with_variation';
  }
};
```

## 📈 Resultados Esperados

### Perfil de Estudiante Exitoso
1. **Nivel Básico**: Juicio 7/10 → Desempeño 70% → Calibración 100%
2. **Nivel Intermedio**: Juicio 6/10 → Desempeño 60% → Calibración 100%
3. **Nivel Experto**: Juicio 5/10 → Desempeño 50% → Calibración 100%

### Patrón de Aprendizaje Metacognitivo
- **Disminución de Juicios Iniciales**: Más cauteloso
- **Mejora de Calibración**: Mejor alineación
- **Reducción de Repeticiones**: Menos sobreconfianza

## 🎯 Conclusión

El sistema **Loop-per-Level** representa un avance significativo en la evaluación metacognitiva porque:

1. **Mide el proceso**, no solo el resultado
2. **Interviene en tiempo real** cuando detecta sobreconfianza
3. **Adapta la dificultad** según calibración real
4. **Genera datos científicos** válidos para publicación Q1
5. **Enseña a pensar metacognitivamente** a través de ciclos reflexivos

Este enfoque asegura que el software no solo evalúa conocimientos técnicos, sino que **desarrolla la capacidad metacognitiva** de los estudiantes, preparándolos para el aprendizaje autónomo y la resolución de problemas complejos.</content>
<parameter name="filePath">c:\Users\Cristian\Downloads\MetaPathFinder\PEDAGOGICAL_FRAMEWORK.md