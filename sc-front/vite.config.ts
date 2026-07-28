import { defineConfig, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const BACKEND_TARGET = 'http://localhost:3000';

const proxyOpts: ProxyOptions = {
  target: BACKEND_TARGET,
  changeOrigin: true,
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
};

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        ...proxyOpts,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/user': proxyOpts,
      '/courses': proxyOpts,
      '/subjects': proxyOpts,
      '/cs': proxyOpts,
      '/tc': proxyOpts,
      '/enrollment': proxyOpts,
      '/exam': proxyOpts,
      '/grade': proxyOpts,
      '/message': proxyOpts,
      '/ps': proxyOpts,
      '/announcement': proxyOpts,
      '/notification': proxyOpts,
      '/socket.io': { ...proxyOpts, ws: true },
    },
  },
})
