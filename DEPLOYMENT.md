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

### Backend
1. Conectar el repositorio a Railway
2. Seleccionar carpeta raíz
3. Variables de entorno:
   - `PORT` = 3000 (o dejar vacío para auto)
   - `NODE_ENV` = production
4. Build command: `cd backend && npm install`
5. Start command: `cd backend && npm start`

### Frontend
1. El frontend se construye y sirve desde el backend
2. El `backend/server.ts` sirve los archivos estáticos desde `../frontend/dist/`

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
