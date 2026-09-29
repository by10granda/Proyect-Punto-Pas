import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api/chat': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/api/payments': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/api/almacen-pas': {
        target: 'https://api.distribuidor-puntopas.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/almacen-pas/, '/api'),
      },
      '/api/variedades-pas': {
        target: 'https://api-sucursal2.distribuidor-puntopas.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/variedades-pas/, '/api'),
      },
      '/api/sucursal-3': {
        target: 'https://api-sucursal3.distribuidor-puntopas.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sucursal-3/, '/api'),
      },
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', 'sonner'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    minify: 'esbuild',
  },
}));
