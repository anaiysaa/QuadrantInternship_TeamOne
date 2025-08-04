import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost", // ✅ use localhost
    port: 8080,
    proxy: {
      "/api": "http://localhost:8000",
      "/login": "http://localhost:8000",
      "/resume": "http://localhost:8000",       // ✅ add proxy for resume API
      "/job": "http://localhost:8000",          // ✅ add proxy for job API
      "/onboarding": "http://localhost:8000",   // ✅ add proxy for onboarding API
      "/summarize-hr-tickets": "http://localhost:8000",
      "/apply-internal-transfer": "http://localhost:8000",
      "/api/system-settings": "http://localhost:8000",
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));