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
