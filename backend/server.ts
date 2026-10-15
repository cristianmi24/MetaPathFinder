import express from "express";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import cors from "cors";
import compression from "compression";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT ?? "3000", 10);

  app.disable("x-powered-by");
  // Detrás de un proxy/CDN (Railway, Nginx…) la IP real llega en X-Forwarded-For.
  app.set("trust proxy", 1);

  // Cabeceras de seguridad para todas las respuestas
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (process.env.ENVIRONMENT === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=15552000");
    }
    next();
  });

  app.use(express.json({ limit: "1mb" }));
  // Respuestas comprimidas (JSON del API y HTML): menos bytes por estudiante en redes escolares lentas.
  app.use(compression({ threshold: 1024 }));

  // Límite de peticiones para el API. Un aula entera suele salir por una sola IP (NAT), así que la
  // clave es el token del usuario cuando existe; la IP solo se usa para peticiones anónimas
  // (login/registro). Ventana deslizante en memoria: suficiente para una instancia.
  const RATE_WINDOW_MS = 60_000;
  const RATE_MAX_USER = parseInt(process.env.API_RATE_LIMIT_PER_MINUTE ?? "400", 10);
  const RATE_MAX_ANON_IP = parseInt(process.env.API_ANON_RATE_LIMIT_PER_MINUTE ?? "300", 10);
  const hits = new Map<string, number[]>();
  setInterval(() => {
    const limit = Date.now() - RATE_WINDOW_MS;
    for (const [key, arr] of hits) {
      const kept = arr.filter((t) => t > limit);
      if (kept.length === 0) hits.delete(key); else hits.set(key, kept);
    }
  }, RATE_WINDOW_MS).unref();
  app.use("/api", (req, res, next) => {
    const auth = (req.headers.authorization as string) || "";
    const key = auth.startsWith("Bearer ") ? `t:${auth.slice(-32)}` : `ip:${req.ip || "unknown"}`;
    const max = key.startsWith("t:") ? RATE_MAX_USER : RATE_MAX_ANON_IP;
    const now = Date.now();
    const arr = (hits.get(key) ?? []).filter((t) => t > now - RATE_WINDOW_MS);
    arr.push(now);
    hits.set(key, arr);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - arr.length)));
    if (arr.length > max) {
      res.setHeader("Retry-After", "30");
      return res.status(429).json({ detail: "Demasiadas peticiones. Espera unos segundos e intenta de nuevo." });
    }
    next();
  });

  // Proxy /api/* al backend Python via Unix socket o TCP HTTP
  const PYTHON_HOST = process.env.PYTHON_HOST || "127.0.0.1";
  const PYTHON_PORT = parseInt(process.env.PYTHON_PORT || "8000", 10);
  const SOCKET_PATH = process.env.PYTHON_SOCKET_PATH;
  const isWindows = process.platform === "win32";
  // Conexiones persistentes hacia FastAPI: evita abrir un socket por petición bajo carga.
  const proxyAgent = new http.Agent({ keepAlive: true, maxSockets: 64, keepAliveMsecs: 10_000 });

  app.use("/api", (req, res) => {
    const body = ["GET", "HEAD"].includes(req.method)
      ? undefined
      : JSON.stringify(req.body ?? {});

    const headers: Record<string, string> = {
      "content-type": "application/json",
      accept: (req.headers.accept as string) || "application/json",
      authorization: (req.headers.authorization as string) || "",
      // IP real del cliente, usada por FastAPI para limitar intentos de login
      "x-forwarded-for": req.ip || "",
    };

    if (body !== undefined) {
      headers["content-length"] = Buffer.byteLength(body).toString();
    }

    const requestOptions: http.RequestOptions = SOCKET_PATH && !isWindows
      ? {
          socketPath: SOCKET_PATH,
          path: req.originalUrl,
          method: req.method,
          headers,
          agent: proxyAgent,
          timeout: 30_000,
        }
      : {
          hostname: PYTHON_HOST,
          port: PYTHON_PORT,
          path: req.originalUrl,
          method: req.method,
          headers,
          agent: proxyAgent,
          timeout: 30_000,
        };

    const proxyReq = http.request(requestOptions, (proxyRes) => {
      const status = proxyRes.statusCode ?? 500;
      const chunks: Buffer[] = [];
      proxyRes.on("data", (c: Buffer) => chunks.push(c));
      proxyRes.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf-8");
        // Las respuestas del API contienen datos personales: que no se guarden en caché.
        res.setHeader("Cache-Control", "no-store");
        try {
          res.status(status).json(JSON.parse(raw));
        } catch {
          res.status(status).send(raw);
        }
      });
    });

    proxyReq.on("timeout", () => proxyReq.destroy(new Error("timeout")));
    proxyReq.on("error", (err) => {
      console.error("[Express Proxy Error]", err.message);
      if (!res.headersSent) res.status(502).json({ detail: "El servidor no está disponible en este momento. Intenta de nuevo en unos minutos." });
    });

    if (body !== undefined) proxyReq.write(body);
    proxyReq.end();
  });

  // Servir archivos estáticos del frontend compilado
  const distPath = path.join(__dirname, "..", "frontend", "dist");
  // Los assets llevan hash en el nombre: caché inmutable de un año; el index.html no se cachea.
  app.use("/assets", express.static(path.join(distPath, "assets"), { immutable: true, maxAge: "365d" }));
  app.use(express.static(distPath, { maxAge: "1h", setHeaders: (res, filePath) => { if (filePath.endsWith("index.html")) res.setHeader("Cache-Control", "no-cache"); } }));
  
  // SPA: Servir index.html para cualquier ruta no encontrada
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Meta-Pathfinder Engine running on http://localhost:${PORT}`);
  });
  // Mantener vivas las conexiones de los navegadores (menos handshakes con 50 clientes).
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 70_000;
}

startServer();
