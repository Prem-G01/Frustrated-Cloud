import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',                     // Project root (where index.html lives)
  base: '/',                     // Base public path for NGINX
  build: {
    outDir: 'dist',              // Output directory (used by Dockerfile)
    emptyOutDir: true,           // Clean before build
    sourcemap: false,            // Optional: disable sourcemaps in prod
  },
  server: {
    host: true,                  // Allow external access (useful for Docker dev)
    port: 5173,                  // Default Vite dev server port
  },
})
