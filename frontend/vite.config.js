import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    host: '0.0.0.0', // Permite acesso de qualquer IP na rede
    port: 5173,
    strictPort: true,
    https: true, // Habilita HTTPS
    proxy: {
      '/api': {
        target: 'http://192.168.100.34:8000',
        changeOrigin: true,
        secure: false,
        ws: true, // Suporte a WebSocket
      },
      '/ws': {
        target: 'ws://192.168.100.34:8000',
        ws: true,
        changeOrigin: true,
      },
      '/media': {
        target: 'http://192.168.100.34:8000',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://192.168.100.34:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})
