import { build as esbuild } from "esbuild";

async function buildVercel() {
  console.log("Building Vercel API bundle from server/api.ts...");

  await esbuild({
    entryPoints: ["server/api.ts"],
    platform: "node",
    target: "node20",
    bundle: true,
    format: "esm",
    outfile: "api/index.js",
    packages: "external",
    logLevel: "info",
  });

  console.log("Vercel API bundle created at api/index.js successfully!");
}

buildVercel().catch((err) => {
  console.error("Vercel API build failed:", err);
  process.exit(1);
});
