import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execSync } from "child_process";

// Try to get git commit hash
let commitHash = 'unknown';
let buildDate = new Date().toISOString();
try {
  commitHash = execSync("git rev-parse --short HEAD").toString().trim();
} catch (e) {
  console.warn("Could not get git commit hash");
}

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_GIT_COMMIT_HASH': JSON.stringify(commitHash),
    'import.meta.env.VITE_BUILD_DATE': JSON.stringify(buildDate),
  },
  // Use relative base path for Capacitor compatibility (file:// protocol)
  base: './',
  
  server: {
    host: "::",
    port: 8080,
  },
  
  plugins: [
    react()
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
