import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const BACKEND_TARGET = 'http://localhost:3000';

// All backend API route prefixes that need to be proxied in development
const API_ROUTES = [
  '/api',
  '/user',
  '/courses',
  '/subjects',
  '/cs',
  '/tc',
  '/enrollment',
  '/exam',
  '/grade',
  '/message',
  '/ps',
  '/announcement',
  '/notification',
  '/socket.io',
];

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: [
      {
        context: API_ROUTES,
        target: BACKEND_TARGET,
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader('cookie', req.headers.cookie);
            }
          });
          proxy.on('proxyRes', (proxyRes) => {
            if (proxyRes.headers['set-cookie']) {
              proxyRes.headers['set-cookie'] = (
                proxyRes.headers['set-cookie'] as string[]
              ).map((cookie: string) => cookie.replace(/; Secure/i, ''));
            }
          });
        },
      },
    ],
  },
})
