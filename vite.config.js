import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:9090';
  const wsProxyTarget = env.VITE_WS_PROXY_TARGET || 'ws://localhost:9090';

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5174,
      strictPort: false,
      proxy: {
        '/api': { target: apiProxyTarget, changeOrigin: true },
        '/auth': { target: apiProxyTarget, changeOrigin: true },
        '/product': { target: apiProxyTarget, changeOrigin: true },
        '/chatserver': { target: wsProxyTarget, ws: true, changeOrigin: true },
      }
    }
  };
})
