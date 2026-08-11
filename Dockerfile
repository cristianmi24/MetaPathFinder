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
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY backend-python/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt && rm /tmp/requirements.txt

# Node backend
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/tsconfig.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci
COPY backend/ ./backend/

# Frontend compilado (Express lo sirve como estático)
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Python backend
COPY backend-python/ /app/backend-python/

# Entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
CMD ["/entrypoint.sh"]
