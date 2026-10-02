import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

const productionCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
  "connect-src 'self' data:",
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "manifest-src 'self'",
].join("; ");

const developmentCsp = productionCsp.replace("connect-src 'self' data:", "connect-src 'self' data: ws: wss:");

function responseSecurityHeaders(csp: string) {
  return {
    "Content-Security-Policy": csp,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
}

export default defineConfig(({ command }) => ({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "meu-pet-production-csp-meta",
      transformIndexHtml(html: string) {
        if (command !== "build") return html;
        const meta = `<meta http-equiv="Content-Security-Policy" content="${productionCsp}">`;
        return html.replace(/(<meta charset="UTF-8"\s*\/?\s*>)/i, `$1\n    ${meta}`);
      },
    },
  ],
  resolve: {
    alias: { "@": path.resolve(projectRoot, "src") },
  },
  server: {
    headers: responseSecurityHeaders(developmentCsp),
  },
  preview: {
    headers: responseSecurityHeaders(productionCsp),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
}));
