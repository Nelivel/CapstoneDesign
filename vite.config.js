import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:9090', changeOrigin: true },
      '/auth': { target: 'http://localhost:9090', changeOrigin: true },
      '/product': { target: 'http://localhost:9090', changeOrigin: true },
      // 웹소켓 사용 시 주석 해제 (백엔드가 9090에서 WS 제공)
      // '/chatserver': { target: 'ws://localhost:9090', ws: true, changeOrigin: true },
    }
  }
})
