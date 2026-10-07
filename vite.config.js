import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Shown in the footer as "last deploy".
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  server: {
    // Local stand-ins for the nginx routes used in production.
    proxy: {
      '/api/github': { target: 'http://127.0.0.1:4002', rewrite: (p) => p.replace(/^\/api\/github/, '') },
      '/api/leetcode': { target: 'http://127.0.0.1:4001', rewrite: (p) => p.replace(/^\/api\/leetcode/, '') },
    },
  },
})
