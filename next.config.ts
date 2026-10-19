import type { NextConfig } from "next";

// Security headers of docs/padroes/backend.md, sent with every response of
// the pages, the API and the static files (docs/plataforma/seguranca.md).
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Two years.
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  // Scripts are not restricted: that would need a nonce per request and
  // dynamic rendering of every page; React escaping covers XSS (RS014).
  {
    key: "Content-Security-Policy",
    value:
      "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
  },
];

const nextConfig: NextConfig = {
  // AGENTS.md is curated by the team (decision 0031); the pointer to the
  // bundled Next.js docs lives in guia/regras.md.
  agentRules: false,
  // Minimal server for the Docker image (Dockerfile). Vercel still publishes
  // the regular build; this only adds .next/standalone/ to it.
  output: "standalone",
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
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
