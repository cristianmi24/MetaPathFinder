# 🧠 MetaPathFinder

**Sistema Inteligente de Gestión de Carga Cognitiva y Aprendizaje Adaptativo**

MetaPathFinder es un **sistema tutor inteligente (STI)** para el área de Tecnología e Informática (componentes MEN) que ubica a cada estudiante en su **zona de desarrollo próximo** técnica y metacognitiva (modelo de evaluación para la enseñanza de Patrick Griffin), decide con **inferencia bayesiana explicable** qué reto y qué andamiaje recibe, y entrena la **calibración metacognitiva** (lo que creo que sé frente a lo que logro) con diálogo socrático y retroalimentación con enfoque de desarrollo.

> **Sistema tutor:** [docs/TUTOR-GRIFFIN-BAYES.md](docs/TUTOR-GRIFFIN-BAYES.md) · **Lista de chequeo ITS:** [docs/REPORTE-LISTA-CHEQUEO-ITS.md](docs/REPORTE-LISTA-CHEQUEO-ITS.md) (24/24).

---

## 📋 Tabla de Contenidos

- [Características Principales](#características-principales)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Instalación](#instalación)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías](#tecnologías)
- [Sistema tutor (Griffin + Bayes)](#-sistema-tutor-griffin--bayes)
- [Capacidad: 50 estudiantes simultáneos](#-capacidad-50-estudiantes-simultáneos)
- [Pruebas](#-pruebas)
- [Reporte de la lista de chequeo ITS](#-reporte-de-la-lista-de-chequeo-its)
- [Licencia](#licencia)

---

## ✨ Características Principales

### 🧑‍🏫 0. Tutor inteligente con los cuatro módulos clásicos
- **Dominio:** dos progresiones de Griffin (técnica: 4 componentes × 9 escalones; metacognitiva: 12 criterios B1–A4) y un catálogo de indicadores sí/no con probabilidades fijadas por el experto.
- **Estudiante:** estado bayesiano por persona (Beta-Bernoulli por criterio y escalón, perfil de calibración, estilo de aprendizaje Felder-Silverman, concepciones erróneas).
- **Tutor:** elige el reto del escalón de la ZDP, la estrategia metacognitiva por **muestreo de Thompson** (grupo experimental; azar en el grupo control), la escalera de andamiaje **N0–N4** según la probabilidad de bloqueo y la retroalimentación «**Ya logras ___. Tu siguiente paso es ___**».
- **Interfaz:** asesor permanente «Tu tutor», pistas 1/3–3/3 con táctica nombrada, replanificación al tercer error, juicio de certeza antes de verificar, mapa de retos con candados explicados, perfil de aprendizaje, mapa de progresión docente y «¿Por qué veo esto?» en cada decisión.

### 🎯 1. Seguimiento de Carga Cognitiva en Tiempo Real
- Probabilidad de bloqueo calculada en el navegador con un Naive Bayes de dos clases (errores seguidos, pausa larga relativa al propio ritmo, ediciones sin verificar, cambio de pestaña): ninguna señal decide sola
- Detección automática de estados: **Flujo Óptimo**, **Frustración** y **Desajuste Metacognitivo**
- Calibración con sesgo, exactitud absoluta, Brier, discriminación y gamma; calibración temporal aparte

### 🗣️ 2. Andamiaje Socrático y Regulador Metacognitivo
- Escalera contingente de Wood: N0 pregunta metacognitiva → N1 orientación → N2 recordatorio de estrategia → N3 paso parcial → N4 solución explicada (solo a petición), con *fading* cuando el criterio se cumple sin ayuda
- Retroalimentación guiada sin entregar respuestas directas; tácticas didácticas nombradas (pregunta socrática, señalamiento, analogía, contraejemplo, desglose paso a paso)
- "Freno Metacognitivo" **personalizado**: se activa cuando la latencia es menor que la mitad de la mediana del propio estudiante (piso 2 s)

### 📊 3. Evaluación Trifásica
- **Fase 1 (Pretest)**: Autopercepción del estudiante sobre competencias
- **Fase 2 (Desafío)**: Evaluación técnica real con captura de micro-comportamientos
- **Fase 3 (Calibración)**: Análisis cuantitativo de desfase entre percepción y realidad

### 🎨 4. Múltiples Módulos de Aprendizaje Interactivo
- **Arduino & IoT**: Bloques visuales para electrónica e IoT
- **Programación**: IDE integrado para Python, SQL y código general
- **Pensamiento Crítico**: Cuestionarios de razonamiento técnico y social
- **Gamificación**: Juegos educativos (Timeline Game, Matching, Puzzles)
- **Simuladores**: Anatomía de smartphones, redes de datos, algoritmos
- **Análisis de Datos**: Mini-Excel, manejo de archivos
- **Estrategia y Toma de Decisiones**: Herramientas de análisis de situaciones tecnológicas

### 🧬 5. Arquitectura de Transferencia Cross-Domain
- "Inyector de Heurísticas" que mapea estrategias exitosas entre dominios distintos
- Primado cognitivo para conectar conceptos entre áreas de conocimiento
- Persistencia de estrategias latentes para aplicación futura

### 📈 6. Análisis Avanzado de Comportamiento Cognitivo
Detección automática de:
- **Impulsividad**: Respuestas rápidas sin reflexión (latencia < 5s)
- **Distracción**: Cambios de pestaña/ventana durante evaluación
- **Frustración/Sobrecarga**: Tiempos prolongados por pregunta (> 30s)
- **Persistencia**: Cantidad de reintentos tras advertencias
- **Desorientación**: Patrones erráticos de scroll o movimiento del ratón
- **Reflexión/Fatiga**: Pausas de inactividad (> 30s)

### 🔬 7. Panel de Administrador y Diseño Experimental
- **Intervenciones del tutor** (`/tutor-admin`): cuándo, cómo y cuántas veces interviene el tutor con cada estudiante y en cada actividad. Resumen de la clase (intervenciones por actividad, % de actividades con ayuda, superación con y sin ayuda, pedidas vs. iniciadas por el tutor), tipos de intervención, escalera de ayuda N0–N3 y pistas 1–3, tabla de estudiantes ordenable y paginada, tabla por reto y feed en vivo. El detalle de cada estudiante muestra su modelo (ZDP, estilo, calibración, 12 criterios) y, por actividad, una **línea de tiempo** con cada intervención (minuto, tipo, nivel, táctica, quién la inició, P(bloqueo) y respuesta del estudiante), el plan del tutor, las decisiones propias y el cierre de la Fase C.
- **Mapa de progresión** (modelo de Griffin): la clase agrupada por ZDP, los 12 criterios por estudiante y el escalón técnico por componente, con los indicadores que pesaron en cada decisión
- Comparación A/B entre grupos (Control vs. Experimental): el grupo control conserva la asignación aleatoria de estrategia
- Gestión de sesiones y usuarios
- Exportación de datos para investigación científica
- Validación de hipótesis metacognitivas mediante análisis estadístico

### 💾 8. Persistencia de Datos Robusta
- Base de datos PostgreSQL con Alembic para versionado de esquema
- LocalStorage para sesiones sin pérdida de datos
- Sincronización automática backend-frontend

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Componentes Interactivos                               │ │
│  │  • Boards (Arduino, Canvas, Coding, SQL, etc.)          │ │
│  │  • Quizzes & Evaluations                                │ │
│  │  • Cognitive Tracking & Monitoring                      │ │
│  │  • Strategy Toolkit & Help                              │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────────────┘
                   │ REST API / WebSocket
┌──────────────────┴──────────────────────────────────────────┐
│            Backend (Node.js/Express + FastAPI)               │
│  ┌─────────────────┐      ┌──────────────────────────────┐  │
│  │ Express Server  │◄────►│ FastAPI Python Server        │  │
│  │ (TypeScript)    │      │ • Auth API & User Sessions   │  │
│  │ • API Proxy     │      │ • Tutor: Griffin + Bayes     │  │
│  │ • Static Files  │      │   (dominio · estudiante ·    │  │
│  │ • Rate limit    │      │    tutor · explicabilidad)   │  │
│  │ • Compression   │      │ • Metacognitive Calibration  │  │
│  └─────────────────┘      └──────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────────┘
                   │ SQL/ORM
┌──────────────────┴──────────────────────────────────────────┐
│             PostgreSQL Database                              │
│  • Users & Sessions                                          │
│  • Evaluations & Results                                     │
│  • Cognitive Events & Metrics                                │
│  • Student tutor state · Tutor decisions · Resource ratings  │
│  • Experiments & Analytics                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Instalación

### Requisitos Previos
- **Node.js** 18+ y npm
- **Python** 3.10+
- **PostgreSQL** 14+

### Instalación Rápida (Recomendada)

```bash
# Clonar repositorio
git clone <repository-url>
cd MetaPathFinder

# Instalar todas las dependencias
npm run install-all
```

### Instalación Manual

```bash
# Backend (Node.js)
cd backend
npm install

# Frontend (React)
cd ../frontend
npm install
cd ..

# Backend Python
cd backend-python
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

---

## 🚀 Uso

### Desarrollo Local

**Opción 1: Ejecutar todos los servicios simultáneamente**
```bash
npm run dev
```

**Opción 2: Ejecutar servicios por separado**

Terminal 1 - Backend Node:
```bash
cd backend
npm run dev  # Puerto 3000
```

Terminal 2 - Frontend React:
```bash
cd frontend
npm run dev  # Puerto 5173
```

Terminal 3 - Backend Python:
```bash
cd backend-python
source .venv/bin/activate
python run.py  # Puerto 8000
```

### Build para Producción

```bash
npm run build
```

Esto compilará el frontend en `frontend/dist/`

### Deploy en Railway

#### Opción A: Docker (Recomendada)
```bash
# Railway detectará automáticamente el Dockerfile
# Variables de entorno necesarias:
# - PORT=3000
# - DATABASE_URL=postgresql://...
# - SECRET_KEY=tu_clave_secreta
```

#### Opción B: Sin Docker
```bash
# Build Command:
cd frontend && npm install && npm run build && cd ../backend && npm install

# Start Command:
cd backend && npm start
```

---

## 📁 Estructura del Proyecto

```
MetaPathFinder/
├── backend/                    # 🔷 Express API Server (TypeScript)
│   ├── server.ts              # Punto de entrada
│   ├── package.json           # Dependencias Node
│   └── tsconfig.json          # Configuración TypeScript
│
├── backend-python/            # 🟢 FastAPI Server (Python)
│   ├── app/
│   │   ├── main.py            # Aplicación principal
│   │   ├── models.py          # Modelos de datos SQLAlchemy
│   │   ├── schemas.py         # Esquemas Pydantic
│   │   ├── config.py          # Configuración
│   │   ├── database.py        # Conexión BD
│   │   ├── middleware/        # Middleware customizado
│   │   ├── routers/           # Endpoints API
│   │   │   ├── auth.py        # Autenticación
│   │   │   ├── users.py       # Gestión de usuarios
│   │   │   ├── sessions.py    # Sesiones de evaluación
│   │   │   ├── tracking.py    # Eventos cognitivos en tiempo real (lotes)
│   │   │   ├── tutor.py       # Plan, estado, estilo, valoraciones, k-NN, mapa de clase
│   │   │   ├── analytics.py   # Análisis cognitivos
│   │   │   ├── experiments.py # Gestión experimental
│   │   │   └── phase_*.py     # Lógica de fases (phase_c integra al tutor)
│   │   └── services/          # Lógica de negocio
│   │       ├── calibration.py # Cálculos de calibración (sesgo, Brier, gamma…)
│   │       └── tutor/         # Sistema tutor
│   │           ├── domain.py     # Progresiones, indicadores, probabilidades, escalera
│   │           ├── bayes.py      # Naive Bayes Bernoulli · Beta-Bernoulli · Thompson
│   │           ├── indicators.py # Métricas → observaciones sí/no (léxicos de texto)
│   │           └── engine.py     # Ciclo de Griffin: plan, ZDP, lectura, retroalimentación
│   ├── tests/                 # Pruebas (ejemplos numéricos del diseño)
│   ├── alembic/               # Versionado de base de datos
│   ├── requirements.txt       # Dependencias Python
│   └── run.py                 # Script de inicio
│
├── frontend/                  # 🔶 React + Vite SPA
│   ├── src/
│   │   ├── components/        # Componentes React reutilizables
│   │   │   ├── tutor/         # Asesor, pistas, replanificación, certeza, estilo, mapa, perfil, progresión
│   │   │   ├── *Board.tsx     # Tableros de evaluación
│   │   │   ├── *Quiz.tsx      # Módulos de evaluación
│   │   │   ├── Sidebar.tsx    # Navegación principal
│   │   │   └── TopBar.tsx     # Barra superior
│   │   ├── pages/             # Páginas principales
│   │   ├── services/          # Llamadas API
│   │   ├── hooks/             # Hooks personalizados
│   │   ├── stores/            # Estado global (Zustand) · useTutorStore
│   │   ├── lib/tutorEngine.ts # Bloqueo, escalera N0–N4, freno personalizado, estilo (cliente)
│   │   ├── data/tutorHints.ts # Pista 3/3 (analogía, contraejemplo, pasos guiados) por reto
│   │   ├── types/             # Definiciones TypeScript
│   │   ├── data/              # Datos estáticos y configuración
│   │   ├── App.tsx            # Componente raíz
│   │   └── main.tsx           # Punto de entrada
│   ├── public/                # Assets estáticos
│   ├── index.html             # Template HTML
│   ├── vite.config.ts         # Configuración Vite
│   └── package.json           # Dependencias
│
├── scripts/loadtest.py        # Prueba de carga (50 estudiantes simultáneos)
├── package.json               # Configuración root & workspaces
├── Dockerfile                 # Configuración Docker
├── entrypoint.sh              # Script de inicio
├── DEPLOYMENT.md              # Documentación de deploy
└── README.md                  # Este archivo
```

---

## 🛠️ Tecnologías

### Frontend
- **React 18** - Interfaz de usuario
- **TypeScript** - Tipado estático
- **Vite** - Build tool rápido
- **React Router** - Enrutamiento
- **Zustand** - Gestión de estado global
- **CSS/Tailwind** - Estilos

### Backend (Node.js)
- **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **JWT** - Autenticación

### Backend (Python)
- **FastAPI** - Framework web asincrónico
- **SQLAlchemy** - ORM
- **Pydantic** - Validación de datos
- **Alembic** - Migraciones de BD
- **NumPy/Pandas** - Análisis de datos (opcional)

### Base de Datos
- **PostgreSQL** - Base de datos relacional principal
- **Alembic** - Versionado de esquema

### DevOps
- **Docker** - Containerización
- **Railway** - Platform as a Service (PaaS)
- **Unix Sockets** - Comunicación inter-procesos

---

## 📊 Flujo de Uso Típico

1. **Usuario se Registra** → Autenticación JWT → cuestionario de estilo de aprendizaje (8 ítems)
2. **Mapa de retos y perfil** → overlay de dominio, ZDP, calibración, concepciones erróneas
3. **Fase A** → el tutor propone reto (escalón ZDP) y estrategia (Thompson) con «¿Por qué veo esto?»; el estudiante puede elegir otro; JOL de planificación
4. **Fase B** → reto con «Tu tutor»: probabilidad de bloqueo, pistas 1/3–3/3, puntos de control, replanificación al tercer error, juicio de certeza antes de verificar
5. **Fase C** → calibración (sesgo, bandas, tiempo), reflexión, lectura bayesiana del reto, «Ya logras / siguiente paso», valoración 👍/👎
6. **Datos Guardados** → estado del tutor, decisiones explicables y eventos para la investigación

## 🧑‍🏫 Sistema tutor (Griffin + Bayes)

| Pieza | Técnica | Dónde |
|---|---|---|
| Lectura del reto (nivel metacognitivo) | Naive Bayes Bernoulli sobre e1–e9, f1–f4 | `services/tutor/engine.read_challenge` |
| Nivel consolidado y ZDP | Beta-Bernoulli por criterio (≥ 0,70 y 3 observaciones; 3 de 4 criterios) | `engine.locate_zdp` |
| Reto del siguiente escalón | Beta-Bernoulli por escalón y componente | `engine.choose_challenge` |
| Estrategia metacognitiva | Muestreo de Thompson por perfil (control: azar) | `engine.choose_strategy` |
| Bloqueo en tiempo real | Naive Bayes de dos clases (4 señales), en el cliente | `lib/tutorEngine.ts` |
| Andamiaje contingente | Escalera N0–N4 + fading | `engine.scaffold_level`, `TutorAdvisor.tsx` |
| Retroalimentación | «Ya logras ___. Tu siguiente paso es ___» | `engine.development_feedback` |
| Curaduría de recursos | 👍/👎, sustitución en caliente, k-NN por pares | `routers/tutor.py` |

**Endpoints:** `GET /api/tutor/admin/overview` y `GET /api/tutor/admin/student/{user}` (docentes) · `GET /api/tutor/domain` · `GET /api/tutor/state/{user}` · `POST /api/tutor/plan` · `POST /api/tutor/override` · `POST /api/tutor/learning-style` · `POST /api/tutor/resource-rating` · `GET /api/tutor/recommend/{user}` · `GET /api/tutor/class-map` (docentes) · `POST /api/tracking/events` · `POST /api/phase-c/complete` (con `tutor_observations`).

Las decisiones de diseño que se cambiaron respecto a la propuesta (umbral de A4, observaciones mínimas, calibración solo con juicios de certeza, freno por mediana, etc.) están justificadas en [docs/TUTOR-GRIFFIN-BAYES.md](docs/TUTOR-GRIFFIN-BAYES.md), junto con el plan de validación con docentes (juicio de expertos, kappa de Cohen, Rasch).

## 🚦 Capacidad: 50 estudiantes simultáneos

Medidas incluidas para un aula completa trabajando a la vez:
- Cálculo de bloqueo y escalera de ayuda **en el navegador**; el servidor solo recibe lotes de eventos (`/api/tracking/events`, hasta 500 por lote).
- Express: compresión, **keep-alive** hacia FastAPI, caché inmutable de assets con hash, límite de peticiones **por usuario** (un aula sale por una sola IP), sondas `/api/health/live`.
- FastAPI: 3 workers (`WEB_CONCURRENCY`) × pool 8 + 12 ≤ `max_connections=150` de Postgres; bcrypt en hilos; consultas indexadas por sesión y usuario.
- Vite: chunks de terceros separados para que cada despliegue descargue solo lo que cambió.

Prueba de carga (`python scripts/loadtest.py --users 50 --rounds 2`, stack local): 0 errores; p95 de las fases A/B/C con tutor entre 170 y 280 ms; registro/login ~5 s cuando los 50 entran en el mismo segundo (coste deliberado de bcrypt; pico único al inicio de clase).

## 🧪 Pruebas

```bash
# Motor bayesiano y calibración (reproduce los ejemplos del documento de diseño)
cd backend-python && python -m pytest tests -q

# Tipos del frontend y del servidor Express
cd frontend && npm run lint
cd backend && npm run lint

# Carga (con el stack levantado)
python scripts/loadtest.py --base http://localhost:3000 --users 50 --rounds 2
```

---

## 🔐 Seguridad

- **Roles:** estudiante y administrador. El registro público solo crea estudiantes; los administradores los crea otro administrador desde el panel.
- **Autorización en el servidor:** cada ruta comprueba el rol; un estudiante solo puede leer y escribir sus propios datos.
- **Accesos separados:** el login de estudiantes no abre el panel y el de administración no acepta estudiantes.
- **Tokens:** JWT firmados (HS256) con caducidad de 24 h.
- **Contraseñas:** bcrypt, mínimo 8 caracteres.
- **Login:** bloqueo temporal tras varios intentos fallidos.
- **Producción:**
  - la app no arranca sin un `SECRET_KEY` fuerte (32+ caracteres);
  - el administrador inicial se define con `ADMIN_EMAIL` y `ADMIN_PASSWORD` (12+ caracteres);
  - la documentación del API está desactivada.
- **Navegador y red:** cabeceras de seguridad, CORS restringido a `CORS_ORIGINS` y respuestas del API sin caché.

---

## ✅ Reporte de la lista de chequeo ITS

Autoevaluación del sistema frente a la *Lista de Chequeo para la Verificación del Frontend de Sistemas Tutores Inteligentes* (Universidad de Córdoba), basada en Caro Piñeres (2015).

| Bloque | Antes | Ahora |
|---|---|---|
| 1 · Cuatro módulos canónicos | 3 / 8 | **8 / 8** |
| 2 · Inteligencia del tutor en la interfaz | 2 / 10 | **10 / 10** |
| 3 · Metacognición computacional | 4 / 6 | **6 / 6** |
| **Total estimado** | 9 / 24 (37,5 %) | **24 / 24 (100 %) · Sobresaliente** |

El detalle por criterio (dónde se ve en la interfaz y qué archivo lo implementa) está en [docs/REPORTE-LISTA-CHEQUEO-ITS.md](docs/REPORTE-LISTA-CHEQUEO-ITS.md). La calificación oficial la asigna el evaluador en la demo.

---

## 📝 Licencia

MIT License

Copyright © 2026 Manuel Fernando Caro Íñeres, Cristian Miguel Peñaat Andrades

Se concede permiso por este medio, sin costo, a cualquier persona que obtenga una copia de este software y archivos de documentación asociados (el "Software"), para tratar el Software sin restricciones, incluyendo sin limitaciones los derechos de usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del Software, y para permitir a las personas a quienes se les proporciona el Software que lo hagan, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A LAS GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR Y NO INFRACCIÓN. EN NINGÚN CASO LOS AUTORES O TITULARES DEL DERECHO DE AUTOR SERÁN RESPONSABLES POR NINGUNA RECLAMACIÓN, DAÑO O RESPONSABILIDAD, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O DE OTRA MANERA, QUE SURJA DE, O EN CONEXIÓN CON EL SOFTWARE O EL USO U OTRAS NEGOCIACIONES EN EL SOFTWARE.

---

## 📧 Contacto y Contribuciones

Para reportar bugs, sugerencias o contribuir al proyecto, por favor crea un issue o pull request en el repositorio.

---

## 🙏 Agradecimientos

Este proyecto fue desarrollado como parte de investigación en sistemas de aprendizaje adaptativo y metacognición.

---

**Última actualización**: Octubre 2026
