import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,  // Expose to LAN so phones on same WiFi can access
    proxy: {
      '/auth': 'http://localhost:8000',
      '/user': 'http://localhost:8000',
      '/qr': 'http://localhost:8000',
      '/alert': 'http://localhost:8000',
      '/ai': 'http://localhost:8000',
      '/location': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
      '/static': 'http://localhost:8000',
      // NOTE: /scan is NOT proxied — it's a React route for the SPA.
    },
  },
})
