import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.VITE_PORT || 5173),
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:3100',
        changeOrigin: true,
        xfwd: true,
      }
    }
  },
  preview: {
    port: Number(process.env.VITE_PREVIEW_PORT || 4173),
    host: '0.0.0.0',
  },
})
