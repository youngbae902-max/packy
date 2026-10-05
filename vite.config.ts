import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Keep the Vite config minimal for Lovable Preview. The preview must not
// depend on editor-only plugins or custom HMR behavior.
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
