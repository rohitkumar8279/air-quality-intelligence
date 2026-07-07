import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — changes rarely, gets long-lived browser cache
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Charting library — heavy (~400KB), isolated chunk
          'vendor-recharts': ['recharts'],
          // Map library — heavy (~190KB), only needed on map pages
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
          // Animation library
          'vendor-motion': ['framer-motion'],
          // PDF export — only downloaded when user clicks "Export"
          'vendor-export': ['html2canvas', 'jspdf'],
        }
      }
    },
    // Recharts is legitimately large; raise limit to avoid false warnings
    chunkSizeWarningLimit: 800,
  }
})
