# 🧠 MetaPathFinder

**Sistema Inteligente de Gestión de Carga Cognitiva y Aprendizaje Adaptativo**

MetaPathFinder es una plataforma educativa avanzada que utiliza inteligencia artificial para monitorizar, analizar y regular la carga cognitiva del estudiante en tiempo real, facilitando un aprendizaje verdaderamente adaptativo basado en diálogo socrático y seguimiento metacognitivo.

---

## 📋 Tabla de Contenidos

- [Características Principales](#características-principales)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Instalación](#instalación)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías](#tecnologías)
- [Licencia](#licencia)

---

## ✨ Características Principales

### 🎯 1. Seguimiento de Carga Cognitiva en Tiempo Real
- Monitorización continua del estado cognitivo del estudiante mediante métricas dinámicas
- Detección automática de estados: **Flujo Óptimo**, **Frustración** y **Desajuste Metacognitivo**
- Análisis de índice de calibración (C) para validar comprensión profunda vs. aciertos por azar

### 🗣️ 2. Andamiaje Socrático y Regulador Metacognitivo
- Método de aprendizaje por descubrimiento basado en andamios y preguntas críticas estructuradas
- Retroalimentación guiada sin entregar respuestas directas
- Detección de impulsividad con "Freno Metacognitivo" activo (micro-pausa reflexiva en UI) para promover el autocontrol

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
- Comparación A/B entre grupos (Control vs. Experimental)
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
│  │ (TypeScript)    │      │ • Analytics & Rules Engine   │  │
│  │ • API Proxy     │      │ • Auth API & User Sessions   │  │
│  │ • Static Files  │      │ • Cognitive Processing       │  │
│  │                 │      │ • Metacognitive Calibration  │  │
│  └─────────────────┘      └──────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────────┘
                   │ SQL/ORM
┌──────────────────┴──────────────────────────────────────────┐
│             PostgreSQL Database                              │
│  • Users & Sessions                                          │
│  • Evaluations & Results                                     │
│  • Cognitive Events & Metrics                                │
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
│   │   │   ├── analytics.py   # Análisis cognitivos
│   │   │   ├── experiments.py # Gestión experimental
│   │   │   └── phase_*.py     # Lógica de fases
│   │   └── services/          # Lógica de negocio
│   │       └── calibration.py # Cálculos de calibración
│   ├── alembic/               # Versionado de base de datos
│   ├── requirements.txt       # Dependencias Python
│   └── run.py                 # Script de inicio
│
├── frontend/                  # 🔶 React + Vite SPA
│   ├── src/
│   │   ├── components/        # Componentes React reutilizables
│   │   │   ├── *Board.tsx     # Tableros de evaluación
│   │   │   ├── *Quiz.tsx      # Módulos de evaluación
│   │   │   ├── Sidebar.tsx    # Navegación principal
│   │   │   └── TopBar.tsx     # Barra superior
│   │   ├── pages/             # Páginas principales
│   │   ├── services/          # Llamadas API
│   │   ├── hooks/             # Hooks personalizados
│   │   ├── stores/            # Estado global (Zustand)
│   │   ├── types/             # Definiciones TypeScript
│   │   ├── data/              # Datos estáticos y configuración
│   │   ├── App.tsx            # Componente raíz
│   │   └── main.tsx           # Punto de entrada
│   ├── public/                # Assets estáticos
│   ├── index.html             # Template HTML
│   ├── vite.config.ts         # Configuración Vite
│   └── package.json           # Dependencias
│
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

1. **Usuario se Registra** → Autenticación JWT
2. **Usuario Accede Dashboard** → Se carga perfil y sesiones previas
3. **Usuario Inicia Evaluación** → Se captura línea base metacognitiva (Fase 1)
4. **Usuario Realiza Desafío** → Seguimiento de carga cognitiva en tiempo real (Fase 2)
5. **Sistema Analiza Resultados** → Cálculo de calibración y desfase (Fase 3)
6. **Retroalimentación Socrática** → Sistema propone estrategias adaptadas
7. **Datos Guardados** → Registro persistente para investigación

---

## 🔐 Seguridad

- Autenticación JWT con refreshment automático
- CORS configurado por dominio
- Variables de entorno para credenciales sensibles
- Base de datos con migraciones versionadas
- Validación de esquemas en entrada/salida

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

**Última actualización**: Agosto 2026
