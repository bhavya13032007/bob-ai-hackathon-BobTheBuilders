import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all backend API routes to FastAPI on port 8000
      '/internships': 'http://127.0.0.1:8000',
      '/candidates': 'http://127.0.0.1:8000',
      '/recommend': 'http://127.0.0.1:8000',
      '/resume': 'http://127.0.0.1:8000',
      '/certificates': 'http://127.0.0.1:8000',
      '/companies': 'http://127.0.0.1:8000',
      '/notifications': 'http://127.0.0.1:8000',
      '/uploads': 'http://127.0.0.1:8000',
      '/health': 'http://127.0.0.1:8000',
      '/docs': 'http://127.0.0.1:8000',
      '/openapi.json': 'http://127.0.0.1:8000',
    },
  },
})
