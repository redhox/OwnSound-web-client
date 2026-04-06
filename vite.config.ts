import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Force reload after UI refactor
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, 
    allowedHosts: ["client.morgan-coulm.fr"],
    proxy: {
      '/api-backend': {
        target: 'http://192.168.1.72:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-backend/, ''),
      },
    },
  },
})
