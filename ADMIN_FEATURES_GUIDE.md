# Guía de Integración: Dashboard Admin y Rastreo de Estudiantes

## 1. Acceso al Dashboard Admin

### Ubicación
- **Ruta**: `/registered-users`
- **Acceso**: Solo para usuarios con rol `admin`
- **Menú**: "Usuarios Registrados" en el Sidebar (aparece automáticamente para admins)

### Vista Incluye
- ✅ Total de estudiantes registrados
- ✅ Pruebas completadas vs en progreso
- ✅ Tarjetas por estudiante con estadísticas principales
- ✅ Modal detallado con análisis por pregunta
- ✅ Filtros por estado (Todos, Completadas, En Progreso, Pendientes)

---

## 2. Rastreo de Eventos en Pruebas

### Hook: `useStudentTestTracking`

Usar este hook en cualquier página de pruebas para rastrear automáticamente:

```typescript
import { useStudentTestTracking } from '../hooks/useStudentTestTracking';

export function MiPrueba() {
  const { trackClick, trackQuestionAnswer, trackPageNavigation } = useStudentTestTracking();

  const handleAnswerQuestion = (questionNumber: number, answer: string) => {
    const isCorrect = checkAnswer(answer);
    const timeSpent = calculateTimeSpent();
    const clicksUsed = getClickCount();

    // Rastrear respuesta
    trackQuestionAnswer(questionNumber, isCorrect, timeSpent, clicksUsed);
  };

  const handleNavigate = (nextPage: string) => {
    trackPageNavigation('current-page', nextPage);
    // navegar...
  };

  return (
    <div>
      <button onClick={() => trackClick('submit-btn')}>Enviar</button>
    </div>
  );
}
```

### Métodos Disponibles

#### `trackClick(target: string)`
Rastrear un click del usuario
```typescript
trackClick('answer-option-1');
trackClick('submit-button');
```

#### `trackQuestionAnswer(questionNumber, isCorrect, timeSpent, clicks)`
Rastrear respuesta a una pregunta
```typescript
trackQuestionAnswer(
  1,              // número de pregunta
  true,           // ¿es correcta?
  45,             // tiempo en segundos
  8               // cantidad de clicks
);
```

#### `trackPageNavigation(fromPage, toPage)`
Rastrear navegación entre páginas
```typescript
trackPageNavigation('question-1', 'question-2');
trackPageNavigation('preview', 'question-1');
```

---

## 3. Gestión de Sesiones de Prueba

### Store Actions

#### Registrar un nuevo estudiante
```typescript
import { useCognitiveStore } from '../stores/useCognitiveStore';

const { registerStudent } = useCognitiveStore();

registerStudent({
  name: 'Juan Pérez',
  email: 'juan@example.com',
  testDate: Date.now(),
  totalTime: 0,
  totalClicks: 0,
  pageNavigations: 0,
  score: 0
});
```

#### Iniciar sesión de prueba
```typescript
const { startTestSession } = useCognitiveStore();

// Al comenzar la prueba
startTestSession('student-id-123');
```

#### Finalizar sesión de prueba
```typescript
const { endTestSession } = useCognitiveStore();

// Al terminar la prueba
endTestSession('student-id-123', 85); // 85 es la calificación
```

#### Obtener resultados
```typescript
const { getStudentResults, getStudentById } = useCognitiveStore();

// Todos los resultados
const allResults = getStudentResults();

// Resultados de un estudiante específico
const studentData = getStudentById('student-id-123');
```

---

## 4. Datos Capturados Automáticamente

### Por Estudiante
- `name`: Nombre completo
- `email`: Correo electrónico
- `status`: 'pending' | 'in-progress' | 'completed'
- `testDate`: Fecha/hora de realización
- `totalTime`: Tiempo total en segundos
- `totalClicks`: Total de clicks durante la prueba
- `pageNavigations`: Cambios de página
- `score`: Calificación final (0-100)

### Por Pregunta
- `number`: Número de pregunta
- `timeSpent`: Tiempo en segundos
- `clicks`: Cantidad de clicks
- `answered`: ¿fue respondida?
- `correct`: ¿respuesta correcta?

### Eventos Rastreados
- `UI_CLICK`: Click del usuario
- `QUIZ_ANSWER`: Respuesta a pregunta
- `PAGE_NAVIGATION`: Cambio de página
- `PAGE_LEFT`: Estudiante se fue de la pestaña
- `PAGE_RETURNED`: Estudiante regresó

---

## 5. Indicadores de Análisis

El dashboard muestra automáticamente:

### Velocidad Promedio
```
clicks / (tiempo en minutos)
```

### Eficiencia
- **Alta**: < 30 clicks
- **Media**: 30-50 clicks
- **Baja**: > 50 clicks

### Estabilidad
- **Estable**: ≤ 5 cambios de página
- **Inestable**: > 5 cambios de página

---

## 6. Ejemplo Completo: Integración en CognitiveChallenge

```typescript
import { useStudentTestTracking } from '../hooks/useStudentTestTracking';
import { useCognitiveStore } from '../stores/useCognitiveStore';

export function CognitiveChallenge() {
  const { trackQuestionAnswer, trackPageNavigation } = useStudentTestTracking();
  const { startTestSession, endTestSession } = useCognitiveStore();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [startTime] = useState(Date.now());
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    // Iniciar sesión cuando carga la prueba
    startTestSession('student-123');
  }, []);

  const handleAnswerSubmit = (answer: string) => {
    const isCorrect = checkIfCorrect(answer);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    // Rastrear la respuesta
    trackQuestionAnswer(
      currentQuestion + 1,
      isCorrect,
      timeSpent,
      clickCount
    );

    // Resetear contador
    setClickCount(0);
  };

  const handleNextQuestion = () => {
    trackPageNavigation(`question-${currentQuestion}`, `question-${currentQuestion + 1}`);
    setCurrentQuestion(prev => prev + 1);
  };

  const handleFinishTest = (finalScore: number) => {
    // Finalizar sesión
    endTestSession('student-123', finalScore);
    // Los datos se guardaron automáticamente
    navigate('/dashboard');
  };

  return (
    <div>
      {/* Componentes de prueba */}
      <button onClick={() => setClickCount(prev => prev + 1)}>
        Opción
      </button>
    </div>
  );
}
```

---

## 7. Visualización de Resultados

Acceder a `/registered-users` para ver:

1. **Resumen General**: Cards con estadísticas agregadas
2. **Listado de Estudiantes**: Grid con tarjetas de cada estudiante
3. **Detalles Expandibles**: Click en tarjeta abre modal con:
   - Gráficos de eficiencia
   - Tabla detallada por pregunta
   - Análisis de patrones cognitivos
   - Métricas de velocidad y estabilidad

---

## 8. Notas Importantes

⚠️ **Almacenamiento**: Actualmente los datos se guardan en `localStorage`. Para producción, conectar con backend.

⚠️ **Datos de Ejemplo**: El dashboard usa datos mock. Reemplazar con datos reales cuando esté disponible el backend.

✅ **Rastreo Automático**: La visibilidad de pestañas se rastrea automáticamente.

✅ **Persistencia**: Los datos persisten incluso después de recargar la página.
