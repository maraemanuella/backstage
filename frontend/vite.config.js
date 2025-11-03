import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Caminhos para certificados SSL (se existirem)
const certPath = resolve(__dirname, '../ssl_certs/cert.pem')
const keyPath = resolve(__dirname, '../ssl_certs/key.pem')

// Verificar se certificados existem
const hasSSL = fs.existsSync(certPath) && fs.existsSync(keyPath)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: resolve(__dirname, '..'), // Usar .env da raiz do projeto
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Habilitar HTTPS se certificados existirem
    https: hasSSL ? {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    } : false,
    proxy: {
      '/api': {
        target: hasSSL ? 'https://127.0.0.1:8000' : 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false, // Aceitar certificados auto-assinados
        ws: true,
      },
      '/ws': {
        target: hasSSL ? 'wss://127.0.0.1:8000' : 'ws://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})
