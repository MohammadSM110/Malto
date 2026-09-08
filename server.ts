import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // Backend API routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      app: "Maalto",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      services: {
        firestore: "connected",
        auth: "configured",
        environment: process.env.NODE_ENV || "development",
      },
    });
  });

  app.get("/api/status", (req, res) => {
    res.json({
      online: true,
      platform: "Google Cloud Run / AI Studio",
      appName: "Maalto | مالتو",
      mode: process.env.NODE_ENV === "production" ? "production" : "development",
    });
  });

  // Vite middleware for development, static dist for production
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
    console.log(`Maalto server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
