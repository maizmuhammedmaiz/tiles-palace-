// Standalone Vercel debug function — zero imports, cannot crash on startup
// Safe: only reports boolean presence of env vars, never their values
export default function handler(req: any, res: any) {
  const body = JSON.stringify({
    ok: true,
    hasDbUrl: !!process.env.DATABASE_URL,
    hasAdminUser: !!process.env.ADMIN_USERNAME,
    hasAdminPass: !!process.env.ADMIN_PASSWORD,
    nodeEnv: process.env.NODE_ENV || "not set",
  });
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(body);
}
