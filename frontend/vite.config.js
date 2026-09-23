import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all backend API routes to FastAPI on port 8000
      '/internships': { target: 'http://127.0.0.1:8000', bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html' } },
      '/candidates': { target: 'http://127.0.0.1:8000', bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html' } },
      '/recommend': { target: 'http://127.0.0.1:8000', bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html' } },
      '/resume': { target: 'http://127.0.0.1:8000', bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html' } },
      '/certificates': { target: 'http://127.0.0.1:8000', bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html' } },
      '/companies': { target: 'http://127.0.0.1:8000', bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html' } },
      '/notifications': { target: 'http://127.0.0.1:8000', bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html' } },
      '/uploads': { target: 'http://127.0.0.1:8000', bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html' } },
      '/health': { target: 'http://127.0.0.1:8000', bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html' } },
      '/docs': { target: 'http://127.0.0.1:8000', bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html' } },
      '/openapi.json': { target: 'http://127.0.0.1:8000', bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html' } },
    },
  },
})
