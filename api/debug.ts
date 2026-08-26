// Standalone Vercel serverless function — no external imports
// Safe: reports only boolean presence of env vars, never the values
export default function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    ok: true,
    hasDbUrl: !!process.env.DATABASE_URL,
    hasAdminUser: !!process.env.ADMIN_USERNAME,
    hasAdminPass: !!process.env.ADMIN_PASSWORD,
    nodeEnv: process.env.NODE_ENV || "not set",
  });
}
