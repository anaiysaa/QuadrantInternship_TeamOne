import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
<<<<<<< HEAD
  host: "::",
  port: 8080,
  proxy: {
    "/api": "http://127.0.0.1:8000", // <--- Use IP instead of localhost if you want!
    "/login": "http://127.0.0.1:8000",
    "/summarize-hr-tickets": "http://127.0.0.1:8000",
    "/apply-internal-transfer": "http://127.0.0.1:8000",
    "/resume": "http://127.0.0.1:8000",
    "/job": "http://127.0.0.1:8000"
  }
},

=======
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
    },
  },
>>>>>>> 56b2fe9cde0135a48441e3c410dd6e74d968465d
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