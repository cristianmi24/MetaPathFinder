# MetaPathFinder 🧠

> **Sistema de Evaluación Metacognitiva para Investigación Q1**

Un sistema pedagógico revolucionario que mide el aprendizaje metacognitivo **en tiempo real** mediante ciclos cerrados por nivel, diseñado específicamente para investigación académica de alto impacto.

## 🎯 Características Principales

### 🔄 Flujo Pedagógico "Loop-per-Level"
- **3 Niveles**: Básico → Intermedio → Experto
- **3 Fases por Nivel**: Juicio → Resolución → Calibración
- **Decisión Inteligente**: Progreso basado en calibración metacognitiva real
- **Sistema de Variaciones**: Repeticiones con equivalencia cognitiva

### 📊 Dashboard Administrador
- **Métricas Detalladas**: Rendimiento por estudiante y nivel
- **Análisis por Pregunta**: Tiempo, clicks, navegación
- **Tracking Completo**: Eventos en tiempo real durante pruebas
- **Visualización Científica**: Datos listos para publicación Q1

### 🧠 Evaluación Metacognitiva
- **Calibración en Tiempo Real**: Juicio vs Desempeño real
- **Detección de Sobreconfianza**: Algoritmo inteligente de repetición
- **Aprendizaje Adaptativo**: Dificultad ajustada según calibración
- **Métricas Psicometricas**: Datos validados científicamente

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd MetaPathFinder

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### Ejecución

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Accede a `http://localhost:5173` para la aplicación.

## 🏗️ Arquitectura

### Tecnologías
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Estado**: Zustand con persistencia localStorage
- **UI**: Tailwind CSS + Material Design 3
- **Base de Datos**: PostgreSQL (configurado para despliegue)

### Estructura del Proyecto
```
MetaPathFinder/
├── frontend/           # Aplicación React
│   ├── src/
│   │   ├── components/ # Componentes reutilizables
│   │   ├── pages/      # Páginas principales
│   │   ├── stores/     # Estado global (Zustand)
│   │   └── hooks/      # Hooks personalizados
├── backend/            # API REST
│   ├── src/
│   │   ├── routes/     # Endpoints API
│   │   └── models/     # Modelos de datos
└── docs/               # Documentación técnica
```

## 📚 Sistema Pedagógico

### Ciclo por Nivel
Cada nivel sigue un ciclo cerrado de 3 fases:

1. **Fase A: Juicio** 🧠
   - Estudiante indica confianza (1-10) antes de resolver
   - Establece línea base metacognitiva

2. **Fase B: Resolución** ⚡
   - Evaluación técnica del nivel
   - Tracking de interacciones en tiempo real

3. **Fase C: Calibración** 🎯
   - Confrontación: Juicio vs Realidad
   - Reflexión metacognitiva guiada

### Algoritmo de Decisión
```typescript
if (calibración >= umbral_requerido) {
  // ✅ Avanzar al siguiente nivel
  nextLevel();
} else {
  // ❌ Repetir con variación
  repeatWithVariation();
}
```

## 🔬 Investigación Q1

### Métricas Capturadas
- **Calibración Metacognitiva**: Alineación juicio-realidad
- **Gap de Confianza**: |juicio - desempeño|
- **Tendencias de Aprendizaje**: Mejora entre niveles
- **Interacciones por Pregunta**: Clicks, tiempo, navegación

### Variables de Investigación
- **Independientes**: Nivel de dificultad, tipo de variación
- **Dependientes**: Precisión metacognitiva, confianza ajustada

## 📊 Dashboard Admin

### Funcionalidades
- **Vista General**: Lista de estudiantes registrados
- **Análisis Detallado**: Modal con métricas por estudiante
- **Filtros**: Por estado de prueba, fecha, rendimiento
- **Exportación**: Datos listos para análisis estadístico

### Métricas por Estudiante
- Tiempo total de prueba
- Número de clicks durante resolución
- Cambios de página durante evaluación
- Salidas de pestaña (distracciones)
- Rendimiento por pregunta individual

## 🛠️ Desarrollo

### Scripts Disponibles

```bash
# Frontend
cd frontend
npm run dev          # Desarrollo con hot reload
npm run build        # Build de producción
npm run preview      # Vista previa del build
npm run type-check   # Verificación de tipos TypeScript

# Backend
cd backend
npm run dev          # Desarrollo con nodemon
npm run build        # Compilación TypeScript
npm run start        # Producción
```

### Testing
```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage
```

## 📖 Documentación

- **[Framework Pedagógico](PEDAGOGICAL_FRAMEWORK.md)**: Detalles técnicos del sistema Loop-per-Level
- **[API Documentation](docs/API.md)**: Endpoints y esquemas
- **[Deployment](DEPLOYMENT.md)**: Guía de despliegue en producción

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Equipo MetaPathFinder** - Desarrollo inicial
- **Investigadores Q1** - Validación psicométrica

## 🙏 Agradecimientos

- Comunidad académica en metacognición
- Investigadores en evaluación adaptativa
- Desarrolladores de React y TypeScript

---

**MetaPathFinder** - Revolucionando la evaluación metacognitiva para investigación de alto impacto.
