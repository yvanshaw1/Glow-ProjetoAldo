import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AGENTS.md is curated by the team (decision 0031); the pointer to the
  // bundled Next.js docs lives in guia/regras.md.
  agentRules: false,
  // Minimal server for the Docker image (Dockerfile). Vercel still publishes
  // the regular build; this only adds .next/standalone/ to it.
  output: "standalone",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
