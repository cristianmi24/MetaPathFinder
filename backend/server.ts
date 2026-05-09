import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT ?? "3000", 10);

  app.use(express.json());

  const allowedOrigins = [
    "https://metapathfinder-frontend-production.up.railway.app",
    "http://localhost:5173",
    "http://localhost:4173",
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, Postman, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS policy: origin '${origin}' not allowed`));
        }
      },
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
