#!/bin/sh
set -e

SOCKET_PATH=/tmp/mp-python.sock

# Iniciar Python FastAPI en segundo plano (Unix socket)
cd /app/backend-python
rm -f "$SOCKET_PATH"
echo "[entrypoint] Iniciando Python FastAPI..."
uvicorn app.main:app --uds "$SOCKET_PATH" --no-access-log 2>&1 &
PYTHON_PID=$!

# Esperar a que el socket exista
echo "[entrypoint] Esperando socket Python..."
for i in $(seq 1 30); do
  if [ -S "$SOCKET_PATH" ]; then
    echo "[entrypoint] Socket listo después de ${i}s"
    break
  fi
  # Si el proceso Python murió, mostrar error
  if ! kill -0 $PYTHON_PID 2>/dev/null; then
    echo "[entrypoint] ERROR: Python FastAPI falló al iniciar"
    wait $PYTHON_PID
    exit 1
  fi
  sleep 1
done

if [ ! -S "$SOCKET_PATH" ]; then
  echo "[entrypoint] ERROR: Socket no creado tras 30s - revisá los logs de Python arriba"
  exit 1
fi

# Iniciar Express (frontend + API) en primer plano
cd /app/backend
echo "[entrypoint] Iniciando Express en puerto ${PORT:-3000}..."
PORT=${PORT:-3000} exec npm run start
