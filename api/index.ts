import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

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

// Use built-in MemoryStore for sessions on Vercel (serverless)
const MemStore = session.MemoryStore;

app.use(
  session({
    store: new MemStore({ checkPeriod: 86400000 }),
    secret: process.env.SESSION_SECRET || "fallback-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
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
}

// Global Express Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
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
