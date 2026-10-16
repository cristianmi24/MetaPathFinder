# syntax=docker/dockerfile:1
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
RUN npm ci
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm run build

# Stage 2: Final image con Node + Python
FROM python:3.12-slim

# Instalar Node.js 20
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && \
    curl -fsSL --retry 5 https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY backend-python/requirements.txt /tmp/requirements.txt
# Cache de pip entre builds + reintentos: con red lenta las descargas se cortan
# y pip las rechaza con "THESE PACKAGES DO NOT MATCH THE HASHES".
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --retries 10 --timeout 120 -r /tmp/requirements.txt && rm /tmp/requirements.txt

# Node backend: solo las dependencias del workspace backend (Express + tsx), sin las del
# frontend (ya compilado) ni las de la raíz. frontend/package.json hace falta para el lockfile.
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/tsconfig.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci -w backend --include-workspace-root=false && npm cache clean --force
COPY backend/ ./backend/

# Frontend compilado (Express lo sirve como estático)
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Python backend
COPY backend-python/ /app/backend-python/

# Entrypoint
COPY entrypoint.sh /entrypoint.sh
# Quitar CRLF por si el archivo viene de un checkout en Windows
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 3000
CMD ["/entrypoint.sh"]
