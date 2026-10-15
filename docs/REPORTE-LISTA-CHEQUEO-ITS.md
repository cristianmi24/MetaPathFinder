# Reporte: MetaPathFinder frente a la lista de chequeo de Sistemas Tutores Inteligentes

**Lista evaluada:** *Lista de Chequeo para la Verificación del Frontend: Sistemas Tutores Inteligentes (STI / ITS)*, Universidad de Córdoba, Departamento de Informática Educativa.
**Referencia teórica:** Caro Piñeres, M. F. (2015). *Metamodel for personalized adaptation of pedagogical strategies using metacognition in Intelligent Tutoring Systems*. Tesis doctoral, Universidad Nacional de Colombia.
**Sistema:** MetaPathFinder · rama `main` · revisión del 14 de octubre de 2026.

> Es una autoevaluación hecha revisando el código del frontend y del backend, para planear el trabajo. La calificación oficial la asigna el evaluador en la demo.

## Resumen

| Bloque | Puntos | Cumplimiento |
|---|---|---|
| 1 · Reflejo de los cuatro módulos canónicos | 3 / 8 | 37,5 % |
| 2 · Características que reflejan la inteligencia del tutor | 2 / 10 | 20 % |
| 3 · Metacognición computacional (FUNPRO) | 4 / 6 | 66,7 % |
| **Total** | **9 / 24** | **37,5 % · Insuficiente** |

Escala de la lista: C = cumple (2), CP = cumple parcialmente (1), NC = no cumple (0), NA = no aplica.

### Hasta dónde puede subir

| Momento | Puntos | Cumplimiento |
|---|---|---|
| Hoy | 9 / 24 | 37,5 % · Insuficiente |
| Tras la fase 1 | 15 / 24 | 62,5 % · Básico |
| Tras la fase 2 | 20 / 24 | 83 % · Aceptable |
| Tras la fase 3 | 24 / 24 | 100 % · Sobresaliente |

## Bloque 1 · Cuatro módulos canónicos (3 / 8)

### MOD-01 · Módulo del experto / dominio — CP (1/2)
- **Lo que hay:**
  - 36 retos organizados por nivel (básico, medio, avanzado), componente MEN (C1–C4) y subnivel (N1–N3), con objetivos y criterios explícitos.
  - Tableros interactivos que validan la respuesta al instante: editores de código, simuladores, ordenadores y cuestionarios.
- **Lo que falta:**
  - El estudiante no ve un mapa del dominio con prerrequisitos.
  - No hay temas bloqueados con candado explicativo.
- **Cómo resolverlo:**
  - Crear «Mi mapa de retos»: cuadrícula componente × subnivel con estado (dominado, en curso, bloqueado).
  - Mostrar el candado con su razón, por ejemplo «Completa N1 de este componente».
  - Los datos ya existen en `frontend/src/data/dynamicChallengeBank.ts`.
- **Esfuerzo:** medio · fase 2.

### MOD-02 · Módulo del estudiante (overlay y perfil cognitivo) — NC (0/2)
- **Lo que hay:**
  - Perfil de calibración por actividad: calibrado, sobreconfianza o subestimación.
  - Historial metacognitivo del estudiante.
- **Lo que falta:**
  - Estilo de aprendizaje Felder-Silverman.
  - Modelo overlay del conocimiento (verde, amarillo, gris).
  - Diagnóstico de concepciones erróneas.
- **Cómo resolverlo:**
  - Cuestionario corto del Índice de Estilos de Aprendizaje (Felder-Soloman), de 8 a 12 ítems, al primer ingreso.
  - Tarjeta «Mi perfil de aprendizaje» con el estilo, el overlay por componente y la calibración.
  - Catálogo de errores frecuentes por reto (ya existe como «Pista 2») para nombrar la concepción errónea cuando se repite.
- **Esfuerzo:** alto · fase 2. El estilo también habilita UI-01 y UI-02.

### MOD-03 · Módulo del tutor / pedagógico — CP (1/2)
- **Lo que hay:**
  - Fases visibles: Antes (juicios), Durante (reto con estrategia) y Después (calibración).
  - Ajuste de dificultad: si falla, pasa a un reto N1; si aprueba, sube de nivel.
  - 8 estrategias metacognitivas con sus herramientas.
- **Lo que falta:** las tácticas didácticas formales (analogía, contraejemplo, desglose paso a paso, simulación) no aparecen nombradas ni se eligen según el desempeño.
- **Cómo resolverlo:**
  - Etiquetar cada ayuda con su táctica.
  - Usar una táctica distinta tras fallar (ver UI-05).
  - Mostrar la ruta como «Fase › Tarea › Actividad».
- **Esfuerzo:** bajo · fase 1.

### MOD-04 · Interfaz como traductor ergonómico y afectivo — CP (1/2)
- **Lo que hay:**
  - Lenguaje cercano: «Un análisis, no una prueba», «Sin presión de nota».
  - Interfaz minimalista y responsiva, con tema claro y oscuro.
- **Lo que falta:** quedan mensajes técnicos y fríos en la actividad, por ejemplo «Alta latencia detectada. Posible bloqueo conceptual» y «Múltiples errores detectados».
- **Cómo resolverlo:**
  - Reescribir esos mensajes de `frontend/src/pages/CognitiveChallenge.tsx` en tono de tutor.
  - Felicitar el esfuerzo en cada reintento.
- **Esfuerzo:** bajo · fase 1.

## Bloque 2 · Inteligencia del tutor en la interfaz (2 / 10)

### UI-01 · Adaptación multimodal (verbal / visual) — NC (0/2)
- **Lo que hay:** el planteamiento combina texto e íconos, pero es igual para todos.
- **Lo que falta:** no hay presentación distinta según el estilo, ni un conmutador «Verbal / Visual».
- **Cómo resolverlo:**
  - Añadir un conmutador en `ChallengeBriefing` con dos versiones del mismo objetivo.
  - Verbal: explicación en prosa paso a paso.
  - Visual: diagrama de flujo generado desde los pasos del reto.
  - Abrir por defecto la del estilo del estudiante (MOD-02).
- **Esfuerzo:** medio · fase 2.

### UI-02 · Navegación adaptativa (global / secuencial) — NC (0/2)
- **Lo que hay:** navegación lineal fija para todos (secuencial).
- **Lo que falta:** no cambia según el estilo, ni se desbloquea la navegación libre con alto dominio.
- **Cómo resolverlo:**
  - Secuencial: botón «Siguiente reto (paso 2 de 5)».
  - Global: pestañas del mapa de retos (MOD-01).
  - Desbloquear las pestañas al superar el 90 %, con un mensaje de logro.
- **Esfuerzo:** medio · fase 3. Depende de MOD-01 y MOD-02.

### UI-03 · Andamiaje proactivo y asesor (Advisor) — CP (1/2)
- **Lo que hay:**
  - Dos pistas escalonadas; la pista 1 aparece sola tras 2 intentos fallidos.
  - Panel lateral con mensajes y freno de reflexión ante respuestas impulsivas.
- **Lo que falta:**
  - Tercer nivel de pista (contraejemplo o solución análoga guiada).
  - Un asesor con presencia propia y permanente.
- **Cómo resolverlo:**
  - Agregar la pista 3 por reto.
  - Convertir el panel en «Tu tutor» con botón «Solicitar pista (1/3)».
  - Ofrecer ayuda tras inactividad prolongada sin interrumpir.
- **Esfuerzo:** bajo a medio (redactar 36 pistas nuevas) · fase 1.

### UI-04 · Curaduría dinámica y resiliencia de recursos — NC (0/2)
- **Lo que hay:** recursos locales (íconos en lugar de imágenes externas), pero sin sustitución automática.
- **Lo que falta:**
  - Calificación de utilidad por el estudiante.
  - Recomendación por pares (k-NN).
  - Recurso alternativo cuando uno falla.
- **Cómo resolverlo:**
  - Botones «¿Te sirvió? 👍 / 👎» guardados en la base de datos.
  - Al marcar 👎, recomendar el recurso mejor valorado por los compañeros más parecidos (k-NN sobre estilo, nivel y calibración).
  - Respaldo local cuando un recurso no carga.
- **Esfuerzo:** alto · fase 3. Si no cabe en el alcance, negociar NA con el docente.

### UI-05 · Replanificación en tiempo real ante bloqueos — CP (1/2)
- **Lo que hay:**
  - Sensores de tiempo, clics, ediciones e intentos fallidos.
  - Aviso por latencia o errores y pista automática tras 2 fallos.
  - El cambio a un reto más simple ocurre solo al terminar.
- **Lo que falta:** al tercer error seguido, la pantalla no se reconfigura en el momento con otro enfoque.
- **Cómo resolverlo:** al tercer error, atenuar la pantalla y ofrecer en ese momento un modo guiado paso a paso o la versión N1 del mismo componente, con una táctica distinta.
- **Esfuerzo:** medio · fase 1.

## Bloque 3 · Metacognición computacional (4 / 6)

### META-01 · Doble lazo: nivel objeto y metanivel — C (2/2)
- **Lo que hay:**
  - La zona de trabajo (nivel objeto) está separada de «Herramientas de apoyo» y «Métricas de proceso» (metanivel).
  - Indicadores de tiempo, intentos y ritmo.
  - Cada estrategia explica para qué ayuda.
- **Mejora opcional:** gráfica de autoeficacia acumulada en el metanivel.

### META-02 · Juicios metacognitivos y calibración (COP / CSRD) — CP (1/2)
- **Lo que hay:**
  - Juicios de aprendizaje (JOL) antes del reto, en escala de 1 a 10.
  - Pantalla de calibración que contrasta la confianza con el resultado y clasifica el perfil.
- **Lo que falta:** la estrategia inicial se asigna al azar (`frontend/src/pages/EvaluationStart.tsx`); no se elige por el perfil.
- **Cómo resolverlo:**
  - Elegir la estrategia por regla según los juicios y la última calibración:
    - sobreconfianza → monitoreo o autodiagnóstico;
    - subestimación → autoeficacia;
    - estimación de tiempo poco realista → regulación temporal.
  - Añadir un juicio rápido de certeza antes de «Verificar».
- **Esfuerzo:** bajo · fase 1.

### META-03 · Transparencia algorítmica y agencia compartida — CP (1/2)
- **Lo que hay:**
  - Evaluación no punitiva.
  - Al terminar un nivel, el estudiante elige la estrategia del siguiente.
  - Se explica para qué sirve cada herramienta.
- **Lo que falta:**
  - No se explica por qué el sistema eligió ese reto o esa estrategia.
  - No se puede rechazar la sugerencia.
- **Cómo resolverlo:**
  - Botón «¿Por qué veo esto?» con la razón concreta.
  - Opción «Prefiero otra estrategia» o «Avanzar bajo mi responsabilidad», registrada como evento.
- **Esfuerzo:** bajo · fase 1.

## Plan para solucionarlo

### Fase 1 · Mejoras rápidas (+6 puntos → 15/24)
1. Reescribir los mensajes técnicos en tono de tutor (MOD-04).
2. Pista 3 y panel «Tu tutor» con pistas 1/3, 2/3 y 3/3 (UI-03).
3. Etiquetar las ayudas con su táctica didáctica y variarla tras fallar (MOD-03).
4. Reconfigurar la pantalla al tercer error con modo guiado o versión simplificada (UI-05).
5. Elegir la estrategia por regla según los juicios y la calibración, en lugar de al azar (META-02).
6. Botón «¿Por qué veo esto?» y opción de elegir otra estrategia (META-03).

### Fase 2 · Perfil del estudiante (+5 puntos → 20/24)
1. Cuestionario Felder-Soloman y tarjeta «Mi perfil de aprendizaje» con overlay por componente (MOD-02).
2. «Mi mapa de retos» con prerrequisitos y candados explicados (MOD-01).
3. Conmutador verbal / visual en el planteamiento del reto (UI-01).

### Fase 3 · Adaptación avanzada (+4 puntos → 24/24)
1. Navegación global o secuencial según el estilo, con desbloqueo por dominio (UI-02).
2. Valoración 👍 / 👎 de recursos, recomendación por pares (k-NN) y respaldo local (UI-04).
3. Opcional: gráfica de autoeficacia en el metanivel (META-01).

Si UI-04 no cabe en el alcance, la lista permite marcarlo como «No aplica» por acuerdo con el docente; el porcentaje se calcula entonces sobre 22 puntos.

## Pendiente en el encabezado de la lista
La lista pide datos que no están en el código y que hay que completar antes de entregarla:
- nombres y códigos de los integrantes;
- URL del repositorio o de la demo;
- fecha de evaluación.
