# 📁 Estructura del Proyecto

El proyecto está dividido en dos carpetas para deployment separado en Railway:

```
MetaPathFinder/
├── backend/          # 🔷 Express API Server
│   ├── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # 🔶 React + Vite App
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
└── package.json      # 📦 Root config
```

## 🚀 Instalación y Desarrollo

### Opción 1: Instalar todo de una vez
```bash
npm run install-all
```

### Opción 2: Instalar manualmente
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
cd ..
```

## 🏃 Ejecutar en Desarrollo

```bash
# Terminal 1: Backend (Puerto 3000)
cd backend
npm run dev

# Terminal 2: Frontend (Puerto 5173)
cd frontend
npm run dev
```

O ejecutar ambos simultáneamente:
```bash
npm run dev
```

## 📦 Build para Producción

```bash
npm run build
```

Esto compilará el frontend a `frontend/dist/`

## 🚂 Deploy en Railway

### Opción A: Docker (Recomendada)
1. Conectar el repositorio a Railway con Dockerfile detectado
2. Variables de entorno necesarias:
   - `PORT` = 3000
   - `DATABASE_URL` = URL de PostgreSQL (Neon o Railway provided)
   - `SECRET_KEY` = tu clave secreta
3. Railway usa automáticamente el `Dockerfile`
4. El entrypoint inicia Python (FastAPI via Unix socket) y Express en el puerto 3000

### Opción B: Sin Docker (Build desde el backend)
1. Crear un servicio **Backend** en Railway
2. Configuración:
   - **Root Directory**: dejar vacío (raíz del repo)
   - **Build Command**:
     ```bash
     cd frontend && npm install && npm run build && cd ../backend && npm install
     ```
   - **Start Command**:
     ```bash
     cd backend && npm start
     ```
3. Variables de entorno:
   - `PORT` = 3000
   - `NODE_ENV` = production
   - `DATABASE_URL` = URL de PostgreSQL
   - `SECRET_KEY` = tu clave secreta
   - `CORS_ORIGINS` = https://tudominio.railway.app (opcional)

### Notas
- El frontend se sirve como estático desde Express (`/frontend/dist/`), no necesita servicio separado
- El backend Python (FastAPI) se comunica con Express via **Unix socket** (`/tmp/mp-python.sock`) en Docker, o directo a `localhost:8000` en dev local
- No olvidar configurar la base de datos PostgreSQL (Neon cloud o Railway plugin)

## 🔗 Variables de Entorno

Crear `.env.local` en la raíz:
```
GEMINI_API_KEY=your_key_here
```

Copiar desde `.env.example` para referencia.

## 📝 APIs Disponibles

- **POST** `/api/tracking/events` - Registrar eventos cognitivos
- **GET** `/api/cognitive/state/:userId` - Obtener estado cognitivo del usuario
- **GET** `/*` - Servir aplicación React (SPA)


## Capacidad para 50 estudiantes simultáneos

| Variable | Valor recomendado | Para qué |
|---|---|---|
| `WEB_CONCURRENCY` | 3 (2 vCPU) · 4 (4 vCPU) | Workers de FastAPI. |
| `DB_POOL_SIZE` / `DB_MAX_OVERFLOW` | 8 / 12 | Conexiones por worker; total ≤ `max_connections` de Postgres (150 en `docker-compose.yml`; en Neon/Railway revisa el límite del plan y baja a 5/5 si es menor a 60). |
| `API_RATE_LIMIT_PER_MINUTE` | 400 | Peticiones por minuto **por usuario autenticado** (un aula entera comparte IP, así que no se limita por IP). |
| `API_ANON_RATE_LIMIT_PER_MINUTE` | 300 | Peticiones anónimas por IP (login/registro). |
| `TUTOR_DEFAULT_GROUP` | `experimental` | Grupo del tutor para estudiantes sin asignación experimental (`control` desactiva Thompson). |

Sonda de salud sin autenticación: `GET /api/health/live`. Prueba de carga: `python scripts/loadtest.py --base https://tu-dominio --users 50 --rounds 2`.
Recomendación de recursos: 1 vCPU / 1 GB es suficiente para 50 estudiantes; el único pico es el login simultáneo (bcrypt), ~5 s si los 50 entran en el mismo segundo.
