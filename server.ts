import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT ?? "3000", 10);

  app.use(express.json());

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

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Meta-Pathfinder Engine running on http://localhost:${PORT}`);
  });
}

startServer();
