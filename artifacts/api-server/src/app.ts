import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import path from "node:path";
import { mkdirSync } from "node:fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (always — dev and prod)
const uploadsDir = process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads");
try { mkdirSync(uploadsDir, { recursive: true }); } catch {}
app.use("/uploads", express.static(uploadsDir));

// API routes
app.use("/api", router);

// In production: serve the built frontend SPA
if (process.env.NODE_ENV === "production") {
  const frontendDir =
    process.env.FRONTEND_DIST ??
    path.join(globalThis.__dirname ?? process.cwd(), "../../marketplace/dist/public");

  app.use(express.static(frontendDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
  });
}

export default app;
