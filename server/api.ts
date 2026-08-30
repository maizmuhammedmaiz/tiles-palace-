import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// Enable trust proxy so secure cookies work behind Vercel reverse proxy
app.set("trust proxy", 1);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

declare module "express-session" {
  interface SessionData {
    adminLoggedIn?: boolean;
  }
}

// Debug endpoint — always works, shows env var status (no secrets)
app.get("/api/debug", (_req, res) => {
  res.json({
    ok: true,
    hasDbUrl: !!process.env.DATABASE_URL,
    hasAdminUser: !!process.env.ADMIN_USERNAME,
    hasAdminPass: !!process.env.ADMIN_PASSWORD,
    nodeEnv: process.env.NODE_ENV || "not set",
  });
});

// Session middleware — cookie-based (works on Vercel serverless)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(
  express.json({
    limit: "20mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

try {
  registerRoutes(httpServer, app);
} catch (e: any) {
  console.error("Failed to register routes:", e);
  // Return an error for all API calls if routes fail to register
  app.use("/api", (_req: Request, res: Response) => {
    res.status(500).json({ message: "Server init failed: " + e?.message });
  });
}

// Global Express Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Express error:", err?.message);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Vercel Serverless Handler Wrapper
export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel handler error:", err);
    return res.status(500).json({ message: err?.message || "Server Error" });
  }
}
