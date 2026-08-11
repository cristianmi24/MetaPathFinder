import express from "express";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT ?? "3000", 10);

  app.use(express.json());

  app.use(
    cors({
      origin: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // API: Registro de eventos cognitivos
  app.post("/api/tracking/events", (req, res) => {
    const { userId, eventType, timestamp, metadata } = req.body;
    // Aquí se integraría el motor de ML (FastAPI proxy o lógica interna)
    // Por ahora, simulamos el procesamiento
    console.log(`[Cognitive Tracker] Event: ${eventType} from User: ${userId}`);
    res.json({ status: "received", analyzed: true });
  });

  // API: Obtener estado cognitivo (Inferencia)
  app.get("/api/cognitive/state/:userId", (req, res) => {
    // Simulación de respuesta del motor Isolation Forest / SVM
    res.json({
      userId: req.params.userId,
      state: "Flow", // Flow, Frustration, Boredom, Confusion
      metrics: {
        frustrationLevel: 0.12,
        cognitiveLoad: 0.45,
        calibration: 0.82
      }
    });
  });

  // Proxy /api/* al backend Python via Unix socket
  const SOCKET_PATH = process.env.PYTHON_SOCKET_PATH || "/tmp/mp-python.sock";

  app.use("/api", (req, res) => {
    const body = ["GET", "HEAD"].includes(req.method)
      ? undefined
      : JSON.stringify(req.body ?? {});

    const headers: Record<string, string> = {
      "content-type": "application/json",
      accept: (req.headers.accept as string) || "application/json",
      authorization: (req.headers.authorization as string) || "",
    };

    if (body !== undefined) {
      headers["content-length"] = Buffer.byteLength(body).toString();
    }

    const proxyReq = http.request(
      {
        socketPath: SOCKET_PATH,
        path: req.originalUrl,
        method: req.method,
        headers,
      },
      (proxyRes) => {
        const status = proxyRes.statusCode ?? 500;
        const chunks: Buffer[] = [];
        proxyRes.on("data", (c: Buffer) => chunks.push(c));
        proxyRes.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf-8");
          try {
            res.status(status).json(JSON.parse(raw));
          } catch {
            res.status(status).send(raw);
          }
        });
      }
    );

    proxyReq.on("error", () => {
      res.status(502).json({ error: "Backend unavailable" });
    });

    if (body !== undefined) proxyReq.write(body);
    proxyReq.end();
  });

  // Servir archivos estáticos del frontend compilado
  const distPath = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(distPath));
  
  // SPA: Servir index.html para cualquier ruta no encontrada
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Meta-Pathfinder Engine running on http://localhost:${PORT}`);
  });
}

startServer();
