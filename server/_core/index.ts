import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { firebaseAppCheckGuard, trpcCsrfGuard } from "../auth/middleware";
import { registerAuthRoutes } from "../auth/routes";
import { getConnectSrc, getCrossOriginOpenerPolicy, getScriptSrc } from "../auth/securityPolicy";
import { getCanonicalRedirectUrl, shouldNoIndex } from "../siteRouting";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, "0.0.0.0", () => server.close(() => resolve(true)));
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port += 1) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

function configureSecurityHeaders(app: express.Express) {
  const isDev = process.env.NODE_ENV !== "production";
  app.disable("x-powered-by");
  app.use(helmet({
    crossOriginOpenerPolicy: { policy: getCrossOriginOpenerPolicy() },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        scriptSrc: getScriptSrc(isDev),
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://*.amazonaws.com", "https://storage.googleapis.com", "https://d36hbw14aib5lz.cloudfront.net", "https://www.gstatic.com/recaptcha/"],
        mediaSrc: ["'self'", "data:", "blob:", "https://*.amazonaws.com", "https://storage.googleapis.com", "https://d36hbw14aib5lz.cloudfront.net"],
        connectSrc: getConnectSrc(isDev),
        frameSrc: ["'self'", "https://accounts.google.com", "https://*.firebaseapp.com", "https://www.google.com/recaptcha/", "https://recaptcha.google.com/"],
        workerSrc: ["'self'", "blob:"],
        upgradeInsecureRequests: isDev ? null : [],
      },
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: process.env.NODE_ENV === "production" ? { maxAge: 31536000, includeSubDomains: true } : false,
  }));
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.set("trust proxy", 1);
  configureSecurityHeaders(app);
  const isProduction = process.env.NODE_ENV === "production";
  app.use((req, res, next) => {
    const canonicalUrl = getCanonicalRedirectUrl(
      req.hostname,
      req.originalUrl,
      isProduction,
      process.env.CANONICAL_SITE_ORIGIN,
    );
    const isHtmlNavigation = (req.method === "GET" || req.method === "HEAD") && Boolean(req.accepts("html"));
    if (canonicalUrl && isHtmlNavigation && !req.path.startsWith("/api/") && !req.path.startsWith("/manus-storage/")) {
      res.redirect(308, canonicalUrl);
      return;
    }
    if (shouldNoIndex(isProduction)) res.setHeader("X-Robots-Tag", "noindex, nofollow");
    next();
  });
  app.use(express.json({ limit: "512kb", strict: true }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 240,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: { json: { message: "Muitas solicitações. Aguarde e tente novamente.", code: -32029, data: { code: "TOO_MANY_REQUESTS", httpStatus: 429 } } } },
  });

  registerStorageProxy(app);
  app.use("/api/auth", apiLimiter, firebaseAppCheckGuard);
  registerAuthRoutes(app);
  app.use("/api/trpc", apiLimiter, firebaseAppCheckGuard, trpcCsrfGuard, createExpressMiddleware({ router: appRouter, createContext }));

  if (process.env.NODE_ENV === "development") await setupVite(app, server);
  else serveStatic(app);

  const preferredPort = Number.parseInt(process.env.PORT || "3000", 10);
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) console.log(`Port ${preferredPort} is busy; using ${port}.`);
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}.`));
}

startServer().catch(() => {
  console.error("Server startup failed. Check the project configuration and logs without exposing credentials.");
  process.exitCode = 1;
});
