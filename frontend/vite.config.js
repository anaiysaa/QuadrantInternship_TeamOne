import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
  host: "::",
  port: 8080,
  proxy: {
    "/api": "http://127.0.0.1:8000", // <--- Use IP instead of localhost if you want!
    "/login": "http://127.0.0.1:8000",
    "/summarize-hr-tickets": "http://127.0.0.1:8000",
    "/apply-internal-transfer": "http://127.0.0.1:8000",
  }
},

  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
